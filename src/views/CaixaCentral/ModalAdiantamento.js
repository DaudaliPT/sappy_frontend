import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import axios from "axios";
// var $ = window.$;
var sappy = window.sappy;

import { TextBoxNumeric, ComboBox } from "../../Inputs";

class ModalAdiantamento extends Component {
  constructor(props) {
    super(props);

    this.onFieldChange = this.onFieldChange.bind(this);
    this.onAddAdiantamento = this.onAddAdiantamento.bind(this);
    this.getvalidationResults = this.getvalidationResults.bind(this);

    this.state = {
      showValidations: false, settings: {}
    }
  }

  componentDidMount() {
    this.setState({
      settings: sappy.getSettings(["FIN.CC.CAIXA_PRINCIPAL", "FIN.CCD.FORN_ADIANT"])
    })
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
    // let totalPagar = sappy.getNum(newStateValues.totalPagar ? newStateValues.totalPagar : this.state.totalPagar)

    if (changeInfo.realtime) newStateValues[fieldName] = this.state[fieldName]
    this.setState(newStateValues);
  }

  getvalidationResults({ forRender, state } = { forRender: false }) {
    let alerts = {};
    let toastrMsg = []
    if (!forRender || state.showValidations) {
      if (!state.ContactPersonCode) alerts.ContactPersonCode = "danger|Preenchimento obrigatório"
      if (!state.CounterRef) alerts.CounterRef = "warning|Se possível indique uma referência"
      if (state.CounterRef && state.CounterRef.length > 8) alerts.CounterRef = "danger|Só são permitidos 8 digitos."
      if (!state.Comments) alerts.Comments = "warning|Deve indicar algum detalhe sobre a despesa"
      if (sappy.getNum(state.totalPagar) <= 0) alerts.totalPagar = "danger|Indique o valor"
    }
    return { alerts, toastrMsg }
  }

  onAddAdiantamento() {
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
        CardCode: that.state.settings["FIN.CCD.FORN_ADIANT"],
        CashAccount: that.state.settings["FIN.CC.CAIXA_PRINCIPAL"],
        ContactPersonCode: this.state.ContactPersonCode,
        CashSum: sappy.getNum(this.state.totalPagar),
        Remarks: this.state.Comments,
        CounterReference: this.state.CounterRef
      }

      sappy.showWaitProgress("A criar documento...")
      axios
        .post(`/api/caixa/despesas/adiantamento`, data)
        .then(result => {

          sappy.hideWaitProgress()
          sappy.showToastr({
            color: "success",
            msg: `Criou com sucesso o adiantamento ${result.data.DocNum} no valor de ${sappy.format.amount(sappy.getNum(that.state.totalPagar))}!`
          })

          that.props.toggleModal({ success: result.data.DocNum });
        })
        .catch(error => sappy.showError(error, "Não foi possivel adicionar o adiantamento"));
    }

    if (!hasWarning)
      return sappy.showQuestion({
        title: "Deseja Continuar?",
        msg: "Se continuar irá criar este adiantamento.",
        onConfirm: invokeAddDocAPI,
        confirmText: "Criar adiantamento",
        onCancel: () => { }
      })
    else
      return sappy.showWarning({
        title: "Atenção!",
        msg: "Ainda há campos com avisos!",
        moreInfo: "Deseja mesmo assim criar este adiantamento?",
        onConfirm: invokeAddDocAPI,
        confirmText: "Ignorar e criar adiantamento",
        onCancel: () => { }
      })

  }

  render() {
    let alerts = this.getvalidationResults({ forRender: true, state: this.state }).alerts;

    return (
      <Modal isOpen={true} className="modal-m modal-success">
        < ModalHeader toggle={this.props.toggleModal}  >
          Adiantamento para despesa
        </ModalHeader>
        <ModalBody >
          <div className="container">
            <div className="row">
              <div className="col-12">
                <ComboBox
                  name="ContactPersonCode"
                  label="À ordem de:"
                  createable={true}
                  value={this.state.ContactPersonCode}
                  state={alerts.ContactPersonCode}
                  getOptionsApiRoute={"/api/cbo/ocpr/bycode/" + this.state.settings["FIN.CCD.FORN_ADIANT"]}
                  onChange={this.onFieldChange}
                />
              </div>
              <div className="col-6 pr-1  ">
                <ComboBox
                  name="CounterRef"
                  createable={true}
                  label="Referência/Matrícula"
                  value={this.state.CounterRef}
                  state={alerts.CounterRef}
                  getOptionsApiRoute="/api/caixa/despesas/histvalues/CounterRef"
                  onChange={this.onFieldChange}
                />
              </div>
              <div className="col-6 pl-1">
                <TextBoxNumeric valueType="amount" label="Total a pagar" name="totalPagar"
                  state={alerts.totalPagar}
                  value={this.state.totalPagar} onChange={this.onFieldChange} realTimeChange={true} />
              </div>
              <div className="col-12 ">

                <ComboBox
                  name="Comments"
                  createable={true}
                  label="Observações"
                  value={this.state.Comments}
                  state={alerts.Comments}
                  getOptionsApiRoute="/api/caixa/despesas/histvalues/Comments"
                  onChange={this.onFieldChange}
                />
              </div>
            </div>
          </div>

          <div className="sappy-action-bar animation-slide-left">
            <Button color={"success"} onClick={this.onAddAdiantamento}>
              <i className="icon wb-check" />Confirmar
            </Button>
          </div>
        </ModalBody>
      </Modal >
    );
  }
}

export default ModalAdiantamento;
