import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import axios from "axios";
var $ = window.$;
var sappy = window.sappy;

import { TextBox, TextBoxNumeric, ComboBox } from "../../Inputs";

class DepositoModal extends Component {
  constructor(props) {
    super(props);

    this.onFieldChange = this.onFieldChange.bind(this);
    this.onCreateDeposit = this.onCreateDeposit.bind(this);
    this.getvalidationResults = this.getvalidationResults.bind(this);

    this.state = {
      activeTab: "tab1",
      showValidations: false,
      settings: {}
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.calcPageHeight);


    this.setState({
      settings: sappy.getSettings(["GERAL.GERAL.IMPRESSORA"])
    })

    this.calcPageHeight();
  }

  calcPageHeight() {
    let $el = $(".modal-content>.main-body");
    // console.log($el)
    let $scrollAbleparent = $("body");
    if ($scrollAbleparent && $el && $el.position) {
      let pos = $el.position()
      if (pos) {
        let minH = $scrollAbleparent.height() - $el.position().top - 370;
        $el.css("height", minH.toString() + "px");
      }
    }
  }


  // Recebe os valores dos campos MY*
  onFieldChange(changeInfo) {
    let that = this;
    let formatedValue = changeInfo.formatedValue;
    let val = changeInfo.rawValue;
    let fieldName = changeInfo.fieldName;

    // console.log("onFieldChange:" + fieldName)

    let newStateValues = {};

    if (fieldName.indexOf("cheques#") > -1) {
      let ix = sappy.getNum(fieldName.split("#")[1]);
      let prop = fieldName.split("#")[2];

      let cheques = [...this.state.cheques]

      if (prop === "valor") {
        cheques[ix] = Object.assign({}, cheques[ix], { [prop]: formatedValue });
        if (changeInfo.realtime) {
          // Alterar apenas o valor total de cheques
          return that.updateTotalCheques(cheques);
        } else {
          return this.setState({ cheques },
            //Após alterar o valor do cheque, alterar o valor total de cheques
            () => that.updateTotalCheques(cheques)
          )
        }
      } else {
        cheques[ix][prop] = val;
        newStateValues.cheques = cheques
      }
    } else {
      //Correctly save to ServiceLayer properties
      Object.assign(newStateValues, { [fieldName]: (fieldName.indexOf("Valor") > -1 ? formatedValue : val) })
    }

    if (changeInfo.realtime) newStateValues[fieldName] = this.state[fieldName]

    this.setState(newStateValues);
  }

  getvalidationResults({ forRender, state } = { forRender: false }) {
    let alerts = {};
    let toastrMsg = []
    if (!forRender || state.showValidations) {
      if (sappy.getNum(state.ValorNumerario) === 0) alerts.ValorNumerario = "danger|Indique o valor"
      if (!state.AllocationAccount) alerts.AllocationAccount = "danger|Indique a conta caixa de origem"
      if (!state.DepositAccount) alerts.DepositAccount = "danger|Indique a conta bancária"
      // if (!state.BankReference) alerts.BankReference = "warning|Deve preencher a conta bancária"
    }
    return { alerts, toastrMsg }
  }

  onCreateDeposit() {
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
        DepositType: "dtCash",
        DepositAccount: this.state.DepositAccount,
        JournalRemarks: "Depositar - " + this.state.DepositAccount,
        // Bank: "MONTEPIO",
        BankAccountNum: "",
        BankBranch: "",
        // BankReference: this.state.BankReference,
        TotalLC: sappy.getNum(this.state.ValorNumerario),
        AllocationAccount: this.state.AllocationAccount,
        DepositAccountType: "datBankAccount",
        ReconcileAfterDeposit: "tYES",
        CheckDepositType: "cdtCashChecks",
        CheckLines: [],
        CreditLines: [],
      }

      sappy.showWaitProgress("A criar documento...")
      axios
        .post(`/api/caixa/depositos/deposit`, data)
        .then(result => {

          sappy.hideWaitProgress()
          that.props.toggleModal({ success: result.data.DepositNumber });
          sappy.showToastr({
            color: "success",
            msg: `Criou com sucesso o deposito ${result.data.DepositNumber}!`
          })


          let parValues = { "DOCKEY@": { Value: result.data.AbsEntry }, "OBJECTID@": { Value: 25 } };
          let apiRoute = "/api/reports/print/" + this.props.defaultLayoutCode;
          let apiQuery = "?parValues=" + encodeURIComponent(JSON.stringify(parValues));

          axios
            .post(apiRoute + apiQuery)
            .then(function (rrrr) {
              sappy.showToastr({
                color: "success",
                msg: `Deposito ${result.data.DepositNumber} impresso!`
              })
            })
            .catch(function (error) {
              sappy.showError(error, "Api error")
            });



        })
        .catch(error => sappy.showError(error, "Não foi possivel adicionar o depósito"));
    }

    if (!hasWarning)
      return sappy.showQuestion({
        title: "Deseja Continuar?",
        msg: "Se continuar irá criar este depósito.",
        onConfirm: invokeAddDocAPI,
        confirmText: "Criar depósito",
        onCancel: () => { }
      })
    else
      return sappy.showWarning({
        title: "Atenção!",
        msg: "Ainda há campos com avisos!",
        moreInfo: "Deseja mesmo assim criar este depósito?",
        onConfirm: invokeAddDocAPI,
        confirmText: "Ignorar e criar depósito",
        onCancel: () => { }
      })

  }

  render() {
    let alerts = this.getvalidationResults({ forRender: true, state: this.state }).alerts;

    return (
      <Modal isOpen={true} className={"modal-m modal-success"}>
        <ModalHeader toggle={this.props.toggleModal}  >
          Novo depósito
        </ModalHeader>
        <ModalBody >

          <div className="panel">
            <div className="panel-body">
              <div className="row">
                <div className="col-8">
                  <ComboBox
                    name="AllocationAccount"
                    label="Origem"
                    value={this.state.AllocationAccount}
                    state={alerts.AllocationAccount}
                    getOptionsApiRoute="/api/cbo/oact/cnt11"
                    onChange={this.onFieldChange}
                  />
                </div>

                <div className="col-4">
                  <TextBoxNumeric
                    valueType="amount"
                    label="Valor em numerário"
                    name="ValorNumerario"
                    value={this.state.ValorNumerario}
                    state={alerts.ValorNumerario}
                    onChange={this.onFieldChange}
                    realTimeChange={true}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-8">
                  <ComboBox
                    name="DepositAccount"
                    label="Depositar em"
                    value={this.state.DepositAccount}
                    state={alerts.DepositAccount}
                    getOptionsApiRoute="/api/cbo/oact/cnt12"
                    onChange={this.onFieldChange}
                  />
                </div>
                {/* 
              <div className="col-4">
                <TextBox
                  label="Referência bancária:"
                  name="BankReference"
                  state={alerts.BankReference}
                  value={this.state.BankReference}
                  onChange={this.onFieldChange}
                />
              </div> */}
              </div>
            </div>
          </div>

          <div className="sappy-action-bar animation-slide-left">
            <Button color={"success"} onClick={this.onCreateDeposit}>
              <i className="icon wb-check" />Confirmar
            </Button>
          </div>
        </ModalBody>
      </Modal >
    );
  }
}

export default DepositoModal;
