import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import axios from "axios";
// var $ = window.$;
var sappy = window.sappy;

import { TextBox, TextBoxNumeric, Date, ComboBox, Check, ToggleSimples } from "../../Inputs";
import Panel from "../../components/Panel"
import Group from "../../components/Group"


const DESCDEB_options = [
  { value: 'P', label: 'Pagamento' },
  { value: 'M', label: 'Mensal' },
  { value: 'T', label: 'Trimestral' },
  { value: 'S', label: 'Semestral' },
  { value: '-', label: 'Anual', type: "group" },
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '11', label: 'Dezembro' },
]

const DESCDEB_ANUAIS_options = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '11', label: 'Dezembro' },
]
const getinitialState = (props) => {

  let locationState = props.location.state || {};

  return {
    loading: locationState.id ? true : false,
    editable: locationState.id ? false : true,
    showValidations: false,
    DC: [{}],
    DF: [{ PREDEF: true }],
    DD: [{}],
    DU: [{}],
    DA: [{}]
  }
}

class EditModal extends Component {
  constructor(props) {
    super(props);

    this.getvalidationResults = this.getvalidationResults.bind(this);
    this.onClick_AddRemove = this.onClick_AddRemove.bind(this);
    this.loadDoc = this.loadDoc.bind(this);
    this.loadDocToState = this.loadDocToState.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.saveToDatabase = this.saveToDatabase.bind(this);
    this.handleCreateContract = this.handleCreateContract.bind(this);
    this.handleSaveContract = this.handleSaveContract.bind(this);

    this.state = getinitialState(props)
  }

  componentDidMount() {
    this.loadDoc();
  }
  componentWillReceiveProps(nextProps) {
    let locationState = this.props.location.state || {};
    let nextlocationState = nextProps.location.state || {};

    if (locationState.id !== nextlocationState.id)
      this.setState(getinitialState(nextProps), this.loadDoc);;
  }

  loadDoc() {
    let that = this;
    let locationState = this.props.location.state || {}
    if (locationState.id) {
      this.serverRequest = axios
        .get(`/api/contratos/doc/${locationState.id}`)
        .then(result => {
          that.loadDocToState(result)
        })
        .catch(error => sappy.showError(error, "Erro ao obter dados"));
    }
  }


  loadDocToState(result) {
    let newState = result.data;
    newState.DC = newState.LINES.filter(line => line.TIPO === "DC")
    newState.DF = newState.LINES.filter(line => line.TIPO === "DF")
    newState.DD = newState.LINES.filter(line => line.TIPO === "DD")
    newState.DU = newState.LINES.filter(line => line.TIPO === "DU")
    newState.DA = newState.LINES.filter(line => line.TIPO === "DA")

    if (newState.DC.length === 0) newState.DC.push({});
    if (newState.DF.length === 0) newState.DF.push({});
    if (newState.DD.length === 0) newState.DD.push({});
    if (newState.DU.length === 0) newState.DU.push({});
    if (newState.DA.length === 0) newState.DA.push({});

    delete newState.LINES

    newState.loading = false
    newState.editable = (!newState.NUMERO)

    this.setState(newState);
  }


  saveToDatabase(stateValues) {

    let { DC, DF, DD, DU, DA, CARDCODE, CONTACT, DATAI, DATAF, DESCRICAO, OBSERVACOES, ID, NUMERO, ATIVO, ARQUIVADO } = stateValues;
    let data = { ID, NUMERO, CARDCODE, CONTACT, DATAI, DATAF, DESCRICAO, OBSERVACOES, ATIVO, ARQUIVADO }

    DC.forEach((item, ix) => { item.TIPO = 'DC'; item.LINE = ix; })
    DF.forEach((item, ix) => { item.TIPO = 'DF'; item.LINE = ix; })
    DD.forEach((item, ix) => { item.TIPO = 'DD'; item.LINE = ix; })
    DU.forEach((item, ix) => { item.TIPO = 'DU'; item.LINE = ix; })
    DA.forEach((item, ix) => { item.TIPO = 'DA'; item.LINE = ix; })
    data.LINES = [...DC, ...DF, ...DD, ...DU, ...DA]

    axios
      .post(`/api/contratos/doc/`, data)
      .then(this.loadDocToState)
      .catch(error => sappy.showError(error, "Não foi possivel gravar o contrato"));
  }

  // Recebe os valores dos campos MY*
  onFieldChange(changeInfo) {
    // let that = this;
    let formatedValue = changeInfo.formatedValue;
    let val = changeInfo.rawValue;
    let fieldName = changeInfo.fieldName;

    let newStateValues = { ...this.state };


    if (fieldName.indexOf("#") > -1) {
      // Valores em arrays
      let arrName = fieldName.split('#')[0]
      let arrIndex = sappy.getNum(fieldName.split('#')[1])
      let propName = fieldName.split('#')[2]

      let arr = [... this.state[arrName]];
      //funcionar como um option box, qsó pode haver uma linha com valor
      if (propName === "PREDEF") arr = arr.map(item => { return { ...item, PREDEF: false } })

      let obj = arr[arrIndex] || {}
      obj[propName] = val;

      arr[arrIndex] = obj


      Object.assign(newStateValues, { [arrName]: [...arr] })

    } else {
      //Normal
      //Correctly save to ServiceLayer properties
      Object.assign(newStateValues, { [fieldName]: (fieldName.indexOf("Valor") > -1 ? formatedValue : val) })
    }


    if (!newStateValues.NUMERO) {
      // Rascunho salvar logo
      return this.saveToDatabase(newStateValues)
    }
    else {
      // Em alteração de documento, tem que ser confirmado
      return this.setState(newStateValues)
    }
  }

  getvalidationResults({ forRender, state } = { forRender: false }) {
    let alerts = {};
    let toastrMsg = []

    if (!forRender || state.showValidations) {
      if (!state.CARDCODE) alerts.CARDCODE = "danger|Preenchimento obrigatório"
      if (!state.DATAI) alerts.DATAI = "danger|Preenchimento obrigatório"
      if (!state.DATAF) alerts.DATAF = "danger|Preenchimento obrigatório"
      if (!state.DESCRICAO) alerts.DESCRICAO = "danger|Preenchimento obrigatório"
    } else if (forRender && !state.showValidations) {
    }

    return { alerts, toastrMsg }
  }



  handleCreateContract() {
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

    let postConfirm = () =>
      axios
        .post(`/api/contratos/doc/${this.state.ID}/confirm`)
        .then(this.loadDocToState)
        .catch(error => sappy.showError(error, "Não foi possivel criar o contrato"));


    if (!hasWarning)
      return postConfirm()
    else
      return sappy.showWarning({
        title: "Atenção!",
        msg: "Ainda há campos com avisos!",
        moreInfo: "Deseja mesmo assim criar este contrato?",
        onConfirm: postConfirm,
        confirmText: "Ignorar e gravar contrato",
        onCancel: () => { }
      })

  }

  handleSaveContract() {
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


    if (!hasWarning)
      return that.saveToDatabase(newState)
    else
      return sappy.showWarning({
        title: "Atenção!",
        msg: "Ainda há campos com avisos!",
        moreInfo: "Deseja mesmo assim criar este contrato?",
        onConfirm: () => that.saveToDatabase(newState),
        confirmText: "Ignorar e gravar contrato",
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
      props.disabled = props.disabled || !this.state.editable;

      return props;
    }


    let renderCondDescComercial = () => {
      let nrItems = this.state.DC.length
      let ret = []
      for (var index = 0; index < nrItems; index++) {
        let name = `DC#${index}#`
        ret.push(<div key={name} className="row">
          <div className="col-12">
            <TextBox {...bip(`${name}DESCRICAO`, { label: "Descrição dos descontos esperados em fatura", type: "textarea" }) } />
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
          <div className="col-5 col-md-3 pr-1">
            <TextBoxNumeric {...bip(`${name}DIAS`, { label: index === 0 ? "Pagamento (dias)" : "", valueType: "integer" }) } />
          </div>
          <div className="col-5 col-md-3 pl-1">
            <TextBox {...bip(`${name}UDISC`, {
              label: index === 0 ? "Valor de desconto" : "",
              valueType: "discount",
              rightButton: index + 1 < nrItems ? "-" : "+",
              onRightButtonClick: this.onClick_AddRemove
            }) } />
          </div>
          <div className="col-2 col-md-1 pl-1">
            <Check {...bip(`${name}PREDEF`, { label: index === 0 ? " " : "" }) } />
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
            <div className="col-12 col-md-5 pr-md-1">
              <ComboBox {...bip(`${name}DESCRICAO`, { label: index === 0 ? "Descritivo" : "", createable: true, getOptionsApiRoute: "/api/contratos/doc/histvalues/DD" }) } />
            </div>
            <div className="col-6 col-md-4 pl-md-1 pr-1">
              <ComboBox {...bip(`${name}DEBPER`, { label: index === 0 ? "Prazo débito" : "", options: DESCDEB_options }) } />
            </div>
            <div className="col-6 col-md-3 pl-1">
              <TextBox {...bip(`${name}UDISC`, {
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
            <div className="col-12 col-md-5 pr-md-1">
              <ComboBox {...bip(`${name}DESCRICAO`, { label: index === 0 ? "Descritivo" : "", createable: true, getOptionsApiRoute: "/api/contratos/doc/histvalues/DU" }) } />
            </div>
            <div className="col-6 col-md-4 pl-md-1 pr-1">
              <ComboBox {...bip(`${name}DEBPER`, { label: index === 0 ? "Prazo débito" : "", options: DESCDEB_options }) } />
            </div>
            <div className="col-6 col-md-3 pl-1">
              <TextBox {...bip(`${name}UDISC`, {
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
            <div className="col-12 col-md-5 pr-md-1">
              <ComboBox {...bip(`${name}DESCRICAO`, { label: index === 0 ? "Descritivo" : "", createable: true, getOptionsApiRoute: "/api/contratos/doc/histvalues/DA" }) } />
            </div>
            <div className="col-6 col-md-4 pl-md-1 pr-1">
              <ComboBox {...bip(`${name}DEBPER`, { label: index === 0 ? "Débito em" : "", options: DESCDEB_ANUAIS_options }) } />
            </div>
            <div className="col-6 col-md-3 pl-1">
              <TextBox {...bip(`${name}UDISC`, {
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

    let headerActions = [


      {
        name: "toggleArquivado",
        text: this.state.ARQUIVADO ? "Arquivado" : "Arquivar",
        color: this.state.ARQUIVADO ? "danger" : "warning",
        visible: this.state.NUMERO,
        disabled: this.state.ATIVO && !this.state.ARQUIVADO,
        icon: this.state.ARQUIVADO ? "fa-folder" : "fa-folder-open",
        onClick: e => { that.onFieldChange({ fieldName: "ARQUIVADO", rawValue: !that.state.ARQUIVADO, value: !that.state.ARQUIVADO }) }
      },
      {
        name: "toggleAtivo",
        text: this.state.ATIVO ? "Ativo" : "Inativo",
        color: this.state.ATIVO ? "success" : "warning",
        visible: this.state.NUMERO,
        disabled: this.state.ARQUIVADO,
        icon: this.state.ATIVO ? "fa-check-square-o" : "fa-square-o",
        onClick: e => {
          that.saveToDatabase({ ...that.state, ATIVO: !that.state.ATIVO })
        }
      },
      {
        name: "toogleEdit",
        text: "Alterar",
        color: !this.state.editable ? "" : "danger",
        visible: this.state.NUMERO,
        disabled: this.state.ARQUIVADO,
        icon: this.state.editable ? "fa-close" : "fa-edit",
        onClick: e => {
          if (!that.state.editable) return that.setState({ editable: true })
          that.loadDoc()
        }

      }
    ];

    return (
      <div className="scrollable-doc" >

        <Panel title="Contrato de Fornecedor" actions={headerActions} >
          <div className="row">
            <div className="col-md-5 pr-md-1">
              <ComboBox  {...bip("CARDCODE", { label: "Fornecedor", disabled: !!this.state.NUMERO, getOptionsApiRoute: "/api/cbo/ocrd/s" }) } />
            </div>
            <div className="col-md-3 pl-md-1 pr-md-1">
              <ComboBox  {...bip("CONTACT", { label: "Contato/Sub.For", getOptionsApiRoute: `/api/cbo/ocpr/bycode/${this.state.CARDCODE}` }) } />
            </div>
            <div className="col-md-2 col-6 pl-md-1 pr-1">
              <Date  {...bip("DATAI", { label: "Válido De" }) } />
            </div>
            <div className="col-md-2 col-6 pl-1  ">
              <Date  {...bip("DATAF", { label: "até" }) } />
            </div>
          </div>
          <div className="row">
            <div className="col-md-5 pr-md-1">
              <TextBox {...bip("DESCRICAO", { label: "Descrição" }) } />
            </div>

            <div className="col-md-7 pl-md-1">
              <TextBox {...bip("OBSERVACOES", { label: "Observações" }) } />
            </div>

          </div>

        </Panel>


        <Panel title="Detalhes" allowCollapse={false}>
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
              </div>
            </div>
          </div>
        </Panel>
        {!this.state.NUMERO &&
          < div className="sappy-action-bar animation-slide-left">
            <Button color={"success"} onClick={this.handleCreateContract}>
              <i className="icon wb-check" />Criar contrato
            </Button>
          </div>
        }

        {
          this.state.NUMERO && this.state.editable &&
          < div className="sappy-action-bar animation-slide-left">
            <Button color={"success"} onClick={this.handleSaveContract}>
              <i className="icon wb-check" />Gravar contrato
            </Button>
          </div>
        }
      </div >
    );
  }
}

export default EditModal;
