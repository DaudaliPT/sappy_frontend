import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import axios from "axios";
// var $ = window.$;
var sappy = window.sappy;

import { TextBox, TextBoxNumeric, Date, ComboBox, Check } from "../../Inputs";
import Panel from "../../components/Panel"
import Group from "../../components/Group"


const DESCDEBOP_options = [
  { value: 'P', label: 'Pagamento' },
  { value: 'M', label: 'Mensal' },
  { value: 'T', label: 'Trimestral' },
  { value: 'S', label: 'Semestral' },
  { value: 'A', label: 'Anual' },
]

class EditModal extends Component {
  constructor(props) {
    super(props);

    this.getvalidationResults = this.getvalidationResults.bind(this);
    this.onClick_AddRemove = this.onClick_AddRemove.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.onAddDespesa = this.onAddDespesa.bind(this);

    this.state = {
      showValidations: false,
      DC: [{}],
      DF: [{ PREDEF: true }],
      DD: [{}],
      DU: [{}],
      DA: [{}]
    }
  }

  // Recebe os valores dos campos MY*
  onFieldChange(changeInfo) {
    // let that = this;
    let formatedValue = changeInfo.formatedValue;
    let val = changeInfo.rawValue;
    let fieldName = changeInfo.fieldName;

    let newStateValues = {};


    if (fieldName.indexOf("#") > -1) {
      // Valores em arrays
      let arrName = fieldName.split('#')[0]
      let arrIndex = sappy.getNum(fieldName.split('#')[1])
      let propName = fieldName.split('#')[2]

      let arr = [... this.state[arrName]];
      //funcionar como um option box, qsó pode haver uma linha com valor
      if (propName === "PREDEF") arr = arr.map(item => { return { ...item, PREDEF: false } })

      let obj = arr[arrIndex] || {}
      obj[propName] = formatedValue;
      arr[arrIndex] = obj


      Object.assign(newStateValues, { [arrName]: [...arr] })

    } else {
      //Normal
      //Correctly save to ServiceLayer properties
      Object.assign(newStateValues, { [fieldName]: (fieldName.indexOf("Valor") > -1 ? formatedValue : val) })
    }


    // // Guardar as propriedades adicionais do adiantamento selecionado
    // if (fieldName === "MeioDePagamento") {
    //   newStateValues.MeioDePagamentoEscolhido = formatedValue
    //   if (!newStateValues.MeioDePagamento) newStateValues.TrocoRecebido = ""
    // }

    // let totalPagar = sappy.getNum(newStateValues.totalPagar || this.state.totalPagar)
    // let MeioDePagamentoEscolhido = (newStateValues.MeioDePagamentoEscolhido || this.state.MeioDePagamentoEscolhido);
    // if (MeioDePagamentoEscolhido.VALOR_PENDENTE) {
    //   newStateValues.DiferrencaAdiantamento = sappy.getNum(MeioDePagamentoEscolhido.VALOR_PENDENTE) - totalPagar;
    // }

    if (changeInfo.realtime) newStateValues[fieldName] = this.state[fieldName]
    this.setState(newStateValues);
  }

  getvalidationResults({ forRender, state } = { forRender: false }) {
    let alerts = {};
    let toastrMsg = []

    if (!forRender || state.showValidations) {
      // if (!state.CardCode) alerts.CardCode = "danger|Preenchimento obrigatório"
      // toastrMsg.push({ color: "danger", msg: "O valor do troco, não pode ser ultrapassar o valor adiantado." })
    } else if (forRender && !state.showValidations) {
    }

    return { alerts, toastrMsg }
  }

  onAddDespesa() {
    let that = this;

    // perform checks
    //Validar campos de preenchimento obrigatório
    let newState = { ...that.state };
    // let fieldsRequired = []
    // let hasChangesToState = false;

    let { alerts, toastrMsg } = this.getvalidationResults({ state: newState });
    toastrMsg.forEach(toastrData => sappy.showToastr(toastrData));
    if (!this.state.showValidations && Object.keys(alerts).length > 0) return this.setState({ showValidations: true })

    //Validar se há erros ativos
    let hasDanger = Object.keys(alerts).find(f => alerts[f].startsWith("danger"))
    if (hasDanger) {
      if (toastrMsg.length > 0) return // já deu mensagens
      return sappy.showToastr({ color: "danger", msg: "Há campos com erros. Verifique se preencheu todos os campos obrigatórios..." })
    }

    //Validar se há avisos ativos
    let hasWarning = Object.keys(alerts).find(f => alerts[f].startsWith("warning"))

    let invokeAddDocAPI = () => {
      let data = {
        CardCode: this.state.CardCode,
        Series: this.state.settings['FIN.CCD.SERIE_FACTURAS'],
        TaxDate: this.state.TaxDate,
        Comments: this.state.Comments,
        NumAtCard: this.state.NumAtCard,
        Lines: [{
          ItemCode: this.state.ItemCode,
          ValorComIva: sappy.getNum(this.state.totalPagar)
        }],
        TrocoRecebido: sappy.getNum(this.state.TrocoRecebido),

        CAIXA_PRINCIPAL: this.state.settings['FIN.CC.CAIXA_PRINCIPAL'],
        CAIXA_PASSAGEM: this.state.settings['FIN.CCD.CAIXA_PASSAGEM']
      }
      //Para que o c# faça o parse correctamente
      data.MeioDePagamento.VALOR_ORIGINAL = sappy.getNum(data.MeioDePagamento.VALOR_ORIGINAL)
      data.MeioDePagamento.VALOR_PENDENTE = sappy.getNum(data.MeioDePagamento.VALOR_PENDENTE)

      sappy.showWaitProgress("A criar documento...")
      axios
        .post(`/api/caixa/despesas/despesa`, data)
        .then(result => {
          sappy.hideWaitProgress()
          sappy.showToastr({
            color: "success",
            msg: `Criou com sucesso a despesa ${result.data.DocNum}!`
          })

          that.props.toggleModal({ success: result.data.DocNum });
        })
        .catch(error => sappy.showError(error, "Não foi possivel adicionar a despesa"));
    }

    if (!hasWarning)
      return sappy.showQuestion({
        title: "Deseja Continuar?",
        msg: "Se continuar irá criar esta despesa.",
        onConfirm: invokeAddDocAPI,
        confirmText: "Criar despesa",
        onCancel: () => { }
      })
    else
      return sappy.showWarning({
        title: "Atenção!",
        msg: "Ainda há campos com avisos!",
        moreInfo: "Deseja mesmo assim criar esta despesa?",
        onConfirm: invokeAddDocAPI,
        confirmText: "Ignorar e criar despesa",
        onCancel: () => { }
      })

  }

  onClick_AddRemove(cmpThis) {
    let newStateValues = {}
    let fieldName = cmpThis.props.name;

    // Valores em arrays
    let arrName = fieldName.split('#')[0]
    let arrIndex = sappy.getNum(fieldName.split('#')[1])
    let propName = fieldName.split('#')[2]

    let arr = this.state[arrName] || [];
    if (cmpThis.props.rightButton === "-") {
      arr.splice(arrIndex, 1); //remover o item
    } else {
      arr.push({})
    }

    this.setState(newStateValues);
  }

  render() {
    let that = this
    let alerts = this.getvalidationResults({ forRender: true, state: this.state }).alerts;
    let getRightButton = (valor) => !valor ? <i className="icon wb-arrow-left" /> : <i className="icon wb-close" />

    // Build Input Props 
    let bip = (name, props) => {
      props.name = name;
      if (name.indexOf("#") > -1) {
        // Valores em arrays
        let arrName = name.split('#')[0]
        let arrIndex = sappy.getNum(name.split('#')[1])
        let propName = name.split('#')[2]

        let arr = this.state[arrName] || [];
        let obj = arr[arrIndex] || {}
        props.value = obj[propName]

      } else {
        //Normal
        props.value = this.state[name];
      }
      props.state = alerts[name];
      props.onChange = this.onFieldChange;

      return props;
    }


    let renderCondDescComercial = () => {
      let nrItems = this.state.DC.length
      let ret = []
      for (var index = 0; index < nrItems; index++) {
        let name = `DC#${index}#`
        ret.push(<div key={`${name}`} className="row">
          <div className="col-12">
            <TextBox {...bip(`${name}DESC`, { label: "Descrição dos descontos esperados em fatura", type: "textarea" }) } />
          </div>
        </div>)
      }
      return ret;
    }


    let renderCondDescFin = () => {
      let nrItems = this.state.DF.length
      let ret = []
      for (var index = 0; index < nrItems; index++) {
        let name = `DF#${index}#`
        ret.push(<div key={`${name}`} className="row">
          <div className="col-4 pr-1">
            <TextBoxNumeric {...bip(`${name}DIAS`, { label: index === 0 ? "Prazo de pagamento (dias)" : "", valueType: "integer" }) } />
          </div>
          <div className="col-4 pl-1">
            <TextBox {...bip(`${name}DESC`, {
              label: index === 0 ? "Valor de desconto" : "",
              valueType: "discount",
              rightButton: index + 1 < nrItems ? "-" : "+",
              onRightButtonClick: this.onClick_AddRemove
            }) } />
          </div>
          <div className="col-4 pl-1">
            <Check {...bip(`${name}PREDEF`, { label: index === 0 ? "Predefinido" : "" }) } />
          </div>
        </div>)
      }
      return ret;
    }


    let renderCondDebito = () => {
      let nrItems = this.state.DD.length
      let ret = []
      for (var index = 0; index < nrItems; index++) {
        let name = `DD#${index}#`
        ret.push(
          <div key={`${name}`} className="row">
            <div className="col-6 pr-1">
              <ComboBox {...bip(`${name}DEBPER`, { label: index === 0 ? "Prazo débito" : "", options: DESCDEBOP_options }) } />
            </div>
            <div className="col-4 pl-1">
              <TextBox {...bip(`${name}DESC`, {
                label: index === 0 ? "Valor de desconto" : "",
                valueType: "discount",
                rightButton: index + 1 < nrItems ? "-" : "+",
                onRightButtonClick: this.onClick_AddRemove
              }) } />
            </div>
          </div>
        )
      }
      return ret;
    }

    let renderCondDebitoUnapor = () => {
      let nrItems = this.state.DU.length
      let ret = []
      for (var index = 0; index < nrItems; index++) {
        let name = `DU#${index}#`
        ret.push(
          <div key={`${name}`} className="row">
            <div className="col-6 pr-1">
              <ComboBox {...bip(`${name}DEBPER`, { label: index === 0 ? "Descritivo" : "", options: DESCDEBOP_options }) } />
            </div>
            <div className="col-4 pl-1">
              <TextBox {...bip(`${name}DESC`, {
                label: index === 0 ? "Valor de débito" : "",
                valueType: "discount",
                rightButton: index + 1 < nrItems ? "-" : "+",
                onRightButtonClick: this.onClick_AddRemove
              }) } />
            </div>
          </div>
        )
      }
      return ret;
    }

    let renderCondDebitoAnual = () => {
      let nrItems = this.state.DA.length
      let ret = []
      for (var index = 0; index < nrItems; index++) {
        let name = `DA#${index}#`
        ret.push(
          <div key={`${name}`} className="row">
            <div className="col-6 pr-1">
              <ComboBox {...bip(`${name}DEBPER`, { label: index === 0 ? "Descritivo" : "", options: DESCDEBOP_options }) } />
            </div>
            <div className="col-3 pl-1 pr-1">
              <Date  {...bip(`${name}DATA`, { label: index === 0 ? "Data" : "" }) } />
            </div>
            <div className="col-3 pl-1">
              <TextBox {...bip(`${name}DESC`, {
                label: index === 0 ? "Valor de débito" : "",
                valueType: "discount",
                rightButton: index + 1 < nrItems ? "-" : "+",
                onRightButtonClick: this.onClick_AddRemove
              }) } />
            </div>
          </div>
        )
      }
      return ret;
    }


    return (
      <div className="scrollable-doc">

        <Panel title="Contrato de Fornecedor" >
          <div className="row">
            <div className="col-5 pr-1">
              <ComboBox  {...bip("CARDCODE", { label: "Fornecedor", getOptionsApiRoute: "/api/cbo/ocrd/s" }) } />
            </div>
            <div className="col-3 pl-1 pr-1">
              <ComboBox  {...bip("CONTACT", { label: "Contato/Sub.For", getOptionsApiRoute: `/api/cbo/ocpr/${this.state.CARDCODE}` }) } />
            </div>
            <div className="col-2 pl-1 pr-1">
              <Date  {...bip("DATAI", { label: "Válido De" }) } />
            </div>
            <div className="col-2 pl-1  ">
              <Date  {...bip("DATAF", { label: "até" }) } />
            </div>
          </div>
          <div className="row">
            <div className="col-6 pr-1">
              <TextBox {...bip("DESCRICAO", { label: "Descrição" }) } />
            </div>

            <TextBox {...bip("OBSERVACOES", { type: "textarea" }) } />

          </div>

        </Panel>


        <Panel title="Detalhes" >
          <div className="row">
            <div className="col-xl-6 ">
              <div className="row">
                <div className="col-12">
                  <Group title="Condições de Descontos comerciais" > {renderCondDescComercial()} </Group>
                </div>
                <div className="col-12">
                  <Group title="Condições de Desconto financeiro" > {renderCondDescFin()} </Group>
                </div>
                <div className="col-12">
                  <Group title="Condições de desconto em débito" > {renderCondDebito()} </Group>
                </div>
                <div className="col-12">
                  <Group title="Condições de débito à Unapor" > {renderCondDebitoUnapor()} </Group>
                </div>
                <div className="col-12">
                  <Group title="Condições de débito Anuais" > {renderCondDebitoAnual()} </Group>
                </div>
                <div className="col-12">
                  <Group title="Observações" >
                  </Group>
                </div>
              </div>
            </div>
          </div>
        </Panel>
        <div className="sappy-action-bar animation-slide-left">
          <Button color={"success"}
            onClick={this.onAddDespesa}
            disabled={sappy.getNum(this.state.totalPagar) === 0}
          >
            <i className="icon wb-check" />Adicionar contrato
            </Button>
        </div>
      </div>
    );
  }
}

export default EditModal;
