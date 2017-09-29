import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import axios from "axios";
// var $ = window.$;
var sappy = window.sappy;

import { TextBox, TextBoxNumeric, Date, ComboBox } from "../../Inputs";

class ModalDespesa extends Component {
  constructor(props) {
    super(props);

    this.onFieldChange = this.onFieldChange.bind(this);
    this.onAddDespesa = this.onAddDespesa.bind(this);
    this.getvalidationResults = this.getvalidationResults.bind(this);

    this.state = {
      showValidations: false,
      TaxDate: sappy.moment(), //Assumir a data de hoje
      AdiantamentosPendentes: [],
      AdiantamentoSelecionado: {},
      settings: {}
    }
  }


  componentDidMount() {
    let that = this
    this.setState({
      settings: sappy.getSettings(['FIN.CCD.SERIE_FACTURAS', 'FIN.CC.CAIXA_PRINCIPAL', 'FIN.CCD.CAIXA_PASSAGEM', 'FIN.CCD.CAIXA_DIFERENCAS', 'FIN.CCD.FORN_ADIANT'])
    })

    axios
      .get(`/api/caixa/despesas/adiantamentos`)
      .then(result => {
        let options = result.data.map(row => {
          return {
            ...row,
            value: row.CreatedBy,
            label: row.ContactName
            + " [" + sappy.format.amount(row.VALOR_PENDENTE) + "]"
            + (row.CounterRef ? ", " + row.CounterRef : "")
            + (row.Comments ? ", " + row.Comments : "")
          }
        })

        that.setState({ AdiantamentosPendentes: options })

      })
      .catch(error => sappy.showError(error, "Não foi possivel obter adiantamentos pendentes"));
  }

  // Recebe os valores dos campos MY*
  onFieldChange(changeInfo) {
    // let that = this;
    let formatedValue = changeInfo.formatedValue;
    let val = changeInfo.rawValue;
    let fieldName = changeInfo.fieldName;

    let newStateValues = {};

    //Correctly save to ServiceLayer properties
    Object.assign(newStateValues, { [fieldName]: (fieldName.indexOf("Valor") > -1 ? formatedValue : val) })

    // Guardar as propriedades adicionais do adiantamento selecionado
    if (fieldName === "Adiantamento") {
      newStateValues.AdiantamentoSelecionado = formatedValue
      if (!newStateValues.Adiantamento) newStateValues.TrocoRecebido = ""
    }

    let totalPagar = sappy.getNum(newStateValues.totalPagar || this.state.totalPagar)
    let AdiantamentoSelecionado = (newStateValues.AdiantamentoSelecionado || this.state.AdiantamentoSelecionado);
    newStateValues.DiferrencaAdiantamento = sappy.getNum(AdiantamentoSelecionado.VALOR_PENDENTE) - totalPagar;

    if (changeInfo.realtime) newStateValues[fieldName] = this.state[fieldName]
    this.setState(newStateValues);
  }

  getvalidationResults({ forRender, state } = { forRender: false }) {
    let alerts = {};
    let toastrMsg = []
    let DiferrencaAdiantamento = sappy.getNum(state.DiferrencaAdiantamento)
    let TrocoRecebido = sappy.getNum(state.TrocoRecebido)

    if (!forRender || state.showValidations) {
      if (!state.CardCode) alerts.CardCode = "danger|Preenchimento obrigatório"
      if (!state.TaxDate) alerts.TaxDate = "danger|Preenchimento obrigatório"
      if (!state.ItemCode) alerts.ItemCode = "danger|Preenchimento obrigatório"
      if (!state.totalPagar) alerts.totalPagar = "danger|Preenchimento obrigatório"
      if (!state.Adiantamento) alerts.Adiantamento = "warning|Verifique se não esqueceu de indicar o adiantamento"

      if (DiferrencaAdiantamento < 0) alerts.Adiantamento = "danger|O valor do adiantamento é inferior á despesa"
      if (DiferrencaAdiantamento > 0) {
        if (DiferrencaAdiantamento > TrocoRecebido) alerts.Adiantamento = "warning|Vai ficar pendente no adiantamento " + sappy.format.amount(DiferrencaAdiantamento - TrocoRecebido)
        if (DiferrencaAdiantamento < TrocoRecebido) {
          alerts.TrocoRecebido = "danger|Valor incorrecto";
          toastrMsg.push({ color: "danger", msg: "O valor do troco, não pode ser ultrapassar o valor adiantado." })
        }
      }
    } else if (forRender && !state.showValidations && state.Adiantamento) {
      if (DiferrencaAdiantamento > 0) {
        if (DiferrencaAdiantamento > TrocoRecebido) alerts.Adiantamento = "secondary|Vai ficar pendente no adiantamento " + sappy.format.amount(DiferrencaAdiantamento - TrocoRecebido)
      }
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
        Lines: [{
          ItemCode: this.state.ItemCode,
          ValorComIva: sappy.getNum(this.state.totalPagar)
        }],
        Adiantamento: { ...this.state.AdiantamentoSelecionado },
        TrocoRecebido: sappy.getNum(this.state.TrocoRecebido),

        CAIXA_PRINCIPAL: this.state.settings['FIN.CC.CAIXA_PRINCIPAL'],
        CAIXA_PASSAGEM: this.state.settings['FIN.CCD.CAIXA_PASSAGEM'],
        CAIXA_DIFERENCAS: this.state.settings['FIN.CCD.CAIXA_DIFERENCAS']
      }
      //Para que o c# faça o parse correctamente
      data.Adiantamento.VALOR_ORIGINAL = sappy.getNum(data.Adiantamento.VALOR_ORIGINAL)
      data.Adiantamento.VALOR_PENDENTE = sappy.getNum(data.Adiantamento.VALOR_PENDENTE)

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

  render() {
    let that = this
    let alerts = this.getvalidationResults({ forRender: true, state: this.state }).alerts;

    let getRightButton = (valor) => !valor ? <i className="icon wb-arrow-left" /> : <i className="icon wb-close" />
    return (
      <Modal isOpen={true} className="modal-md modal-success">
        < ModalHeader toggle={this.props.toggleModal}  >
          Registar despesa de caixa
        </ModalHeader>
        <ModalBody >
          <div className="container">
            <div className="row">
              <div className="col-9 pr-1">
                <ComboBox
                  label="Fornecedor"
                  name="CardCode"
                  value={this.state.CardCode}
                  state={alerts.CardCode}
                  getOptionsApiRoute={"/api/cbo/ocrd/s"}
                  onChange={this.onFieldChange}
                />
              </div>
              <div className="col-3 pl-1  ">
                <Date
                  label="Data Documento"
                  name="TaxDate"
                  value={this.state.TaxDate}
                  state={alerts.TaxDate}
                  onChange={this.onFieldChange} />
              </div>
            </div>
            <div className="row">
              <div className="col-9 pr-1">
                <ComboBox
                  label="Artigo"
                  name="ItemCode"
                  value={this.state.ItemCode}
                  state={alerts.ItemCode}
                  getOptionsApiRoute={"/api/cbo/oitm/fse"}
                  onChange={this.onFieldChange}
                />
              </div>
              <div className="col-3 pl-1">
                <TextBoxNumeric
                  valueType="amount"
                  label="Valor (com Iva)"
                  name="totalPagar"
                  state={alerts.totalPagar}
                  value={this.state.totalPagar}
                  onChange={this.onFieldChange}
                  realTimeChange={true}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-12 ">
                <TextBox
                  name="Comments"
                  label="Observações"
                  value={this.state.Comments}
                  state={alerts.Comments}
                  onChange={this.onFieldChange}
                />
              </div>
            </div>
          </div>
          <hr />
          <div className="container">
            <div className="row">
              <div className="col-9 pr-1 ">
                <ComboBox
                  name="Adiantamento"
                  label="Foi pago com adiantamento a"
                  value={this.state.Adiantamento}
                  state={alerts.Adiantamento}
                  options={this.state.AdiantamentosPendentes}
                  onChange={this.onFieldChange}
                />
              </div>

              <div className="col-3 pl-1">
                <TextBoxNumeric
                  valueType="amount"
                  label="Troco"
                  name="TrocoRecebido"
                  state={alerts.TrocoRecebido}
                  value={this.state.TrocoRecebido}
                  disabled={!this.state.Adiantamento}
                  onChange={this.onFieldChange}
                  realTimeChange={true}
                  rightButton={getRightButton(sappy.getNum(that.state.TrocoRecebido))}
                  onRightButtonClick={cmpThis => {

                    let currVal = sappy.getNum(that.state.TrocoRecebido);
                    let newVal = 0
                    if (!currVal) newVal = sappy.getNum(that.state.DiferrencaAdiantamento)
                    if (newVal < 0) newVal = 0;
                    that.setState({ TrocoRecebido: sappy.format.amount(newVal) })

                  }}
                />
              </div>
            </div>
          </div>

          <div className="sappy-action-bar animation-slide-left">
            <Button color={"success"} onClick={this.onAddDespesa}>
              <i className="icon wb-check" />Confirmar <strong>{sappy.format.amount(this.state.totalPagar)}</strong>
            </Button>
          </div>
        </ModalBody>
      </Modal >
    );
  }
}

export default ModalDespesa;
