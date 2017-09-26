import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import axios from "axios";
var $ = window.$;
var sappy = window.sappy;

import { TextBox, TextBoxNumeric, Date, ComboBox, Notas } from "../../Inputs";

class ModalAdiantamento extends Component {
  constructor(props) {
    super(props);

    this.handleOnTabClick = this.handleOnTabClick.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.onCreatePayment = this.onCreatePayment.bind(this);
    this.onClick_GetRemaingValue = this.onClick_GetRemaingValue.bind(this);
    this.onClick_AddRemoveCheque = this.onClick_AddRemoveCheque.bind(this);
    this.updateTotalCheques = this.updateTotalCheques.bind(this);
    this.getvalidationResults = this.getvalidationResults.bind(this);

    this.state = {
      activeTab: "tab1",
      cheques: [{ data: sappy.unformat.date(".") }],
      showValidations: false
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.calcPageHeight);
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

  handleOnTabClick(e) {
    e.preventDefault();
    let tab = e.target.id;
    this.setState({ activeTab: tab });
  }

  updateTotalCheques(cheques) {

    let v = cheques.reduce((sum, fld) => sum + sappy.getNum(fld.valor), 0);
    // Alterar apenas o valor total de cheques
    return this.onFieldChange({
      fieldName: "ValorCheques",
      rawValue: v,
      formatedValue: sappy.format.amount(v)
    })
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

    // if (this.state[fieldName + "_VALIDATEMSG"]) newStateValues[fieldName + "_VALIDATEMSG"] = ""

    let totalPagar = sappy.getNum(newStateValues.totalPagar ? newStateValues.totalPagar : this.state.totalPagar)
    let ValorNumerario = sappy.getNum(fieldName === "ValorNumerario" ? formatedValue : this.state.ValorNumerario)
    let ValorMultibanco = sappy.getNum(fieldName === "ValorMultibanco" ? formatedValue : this.state.ValorMultibanco)
    let ValorTransferencia = sappy.getNum(fieldName === "ValorTransferencia" ? formatedValue : this.state.ValorTransferencia)
    let ValorCheques = sappy.getNum(fieldName === "ValorCheques" ? formatedValue : this.state.ValorCheques)

    let NrNotas5 = sappy.getNum(fieldName === "NrNotas5" ? formatedValue : this.state.NrNotas5)
    let NrNotas10 = sappy.getNum(fieldName === "NrNotas10" ? formatedValue : this.state.NrNotas10)
    let NrNotas20 = sappy.getNum(fieldName === "NrNotas20" ? formatedValue : this.state.NrNotas20)
    let NrNotas50 = sappy.getNum(fieldName === "NrNotas50" ? formatedValue : this.state.NrNotas50)
    let NrNotas100 = sappy.getNum(fieldName === "NrNotas100" ? formatedValue : this.state.NrNotas100)
    let NrNotas200 = sappy.getNum(fieldName === "NrNotas200" ? formatedValue : this.state.NrNotas200)
    let NrNotas500 = sappy.getNum(fieldName === "NrNotas500" ? formatedValue : this.state.NrNotas500)
    let ValorNotas = (NrNotas5 * 5) + (NrNotas10 * 10) + (NrNotas20 * 20) + (NrNotas50 * 50) + (NrNotas100 * 100) + (NrNotas200 * 200) + (NrNotas500 * 500)
    Object.assign(newStateValues, { ValorNotas: sappy.format.amount(ValorNotas) })


    let ValorMoedas = sappy.getNum(fieldName === "ValorMoedas" ? formatedValue : this.state.ValorMoedas)
    let ValorVales = sappy.getNum(fieldName === "ValorVales" ? formatedValue : this.state.ValorVales)
    let ValorTickets = sappy.getNum(fieldName === "ValorTickets" ? formatedValue : this.state.ValorTickets)

    let TotalNumerarioCalculado = ValorNotas + ValorMoedas + ValorVales + ValorTickets
    Object.assign(newStateValues, { TotalNumerarioCalculado: sappy.format.amount(TotalNumerarioCalculado) })
    if (TotalNumerarioCalculado) {
      ValorNumerario = TotalNumerarioCalculado
      Object.assign(newStateValues, { ValorNumerario: sappy.format.amount(ValorNumerario) })
    }


    let continuarColor;
    let continuarContent;

    //Não pode ter transferência e multibanco
    if (fieldName.indexOf("ValorTransferencia") > -1 && ValorMultibanco) {
      sappy.showToastr({ color: "warning", msg: "Não pode ter Transferência e Multibanco em simultaneo." })
      newStateValues.ValorMultibanco = "";
      ValorMultibanco = 0;
    } else if (fieldName.indexOf("ValorMultibanco") > -1 && ValorTransferencia) {
      sappy.showToastr({ color: "warning", msg: "Não pode ter Multibanco e Transferência em simultaneo." })
      newStateValues.ValorTransferencia = "";
      ValorTransferencia = 0;
    }


    let totalMeiosPag = ValorNumerario + ValorMultibanco + ValorTransferencia + ValorCheques
    let troco = sappy.round(totalMeiosPag - totalPagar, 2);


    if (troco > ValorNumerario) {
      sappy.showToastr({ color: "danger", msg: "O troco não pode ser superior ao valor em numerário" })
      continuarColor = "danger";
      continuarContent = <span> <i className="icon wb-warning" /> Troco {sappy.format.amount(troco)}</span>;
    } else if (troco < 0) {
      continuarColor = "danger";
      continuarContent = <span> <i className="icon wb-warning" />  Em falta {sappy.format.amount(-1 * troco)}</span>
    } else if (troco > 0) {
      continuarColor = "warning";
      continuarContent = <span> <i className="icon wb-check" /> Concluir (Troco {sappy.format.amount(troco)})</span>
    } else {
      continuarColor = "success";
      continuarContent = <span> <i className="icon wb-check" /> Concluir {sappy.format.amount(troco)}</span>
    }

    newStateValues.continuarColor = continuarColor;
    newStateValues.continuarContent = continuarContent;
    newStateValues.totalMeiosPag = totalMeiosPag;
    newStateValues.troco = troco;


    if (changeInfo.realtime) newStateValues[fieldName] = this.state[fieldName]

    this.setState(newStateValues);
  }

  onClick_AddRemoveCheque(cmpThis) {

    let that = this
    // let fieldName = cmpThis.props.name.split("#")[0];
    let ix = sappy.getNum(cmpThis.props.name.split("#")[1]);
    let cheques = [...this.state.cheques]
    let currVal = sappy.getNum(cheques[ix].valor);
    let totalPagar = sappy.getNum(this.state.totalPagar);
    let totalMeiosPag = sappy.getNum(this.state.totalMeiosPag);
    let emFalta = 0
    if (totalPagar > totalMeiosPag) emFalta = totalPagar - totalMeiosPag

    if (currVal) {
      if (ix < cheques.length - 1
        || (ix === cheques.length - 1 && emFalta === 0)
      ) {
        cheques.splice(ix, 1);
      } else {
        if (emFalta === 0) return
        let cheque = cheques[ix]
        //Assumir dados co cheque atual +1
        cheques.push({
          banco: cheque.banco,
          numero: cheque.numero ? (sappy.getNum(cheque.numero) + 1).toString() : "",
          valor: sappy.format.amount(currVal < emFalta ? currVal : emFalta)
        })
      }

      this.setState({ cheques }, that.updateTotalCheques(cheques))

    } else {
      totalMeiosPag -= currVal
      if (totalPagar > totalMeiosPag) emFalta = totalPagar - totalMeiosPag

      that.onFieldChange({
        fieldName: "cheques#" + ix + "#valor",
        rawValue: emFalta,
        formatedValue: sappy.format.amount(totalPagar - totalMeiosPag)
      })
    }
  }

  onClick_GetRemaingValue(cmpThis) {
    let fieldName = cmpThis.props.name;
    let currVal = sappy.getNum(this.state[fieldName]);
    let totalPagar = sappy.getNum(this.state.totalPagar);
    if (totalPagar < 0) totalPagar *= -1

    let totalMeiosPag = sappy.getNum(this.state.totalMeiosPag);
    if (fieldName.indexOf("ValorTransferencia") > -1 || fieldName.indexOf("ValorMultibanco") > -1) {
      totalMeiosPag -= sappy.getNum(this.state.ValorTransferencia)
      totalMeiosPag -= sappy.getNum(this.state.ValorMultibanco)
    } else {
      totalMeiosPag -= currVal
    }

    let rawValue = 0;
    if (!currVal && totalPagar - totalMeiosPag > 0) rawValue = totalPagar - totalMeiosPag;

    if (currVal !== rawValue)
      this.onFieldChange({
        fieldName,
        formatedValue: rawValue ? sappy.format.amount(rawValue) : "",
        rawValue
      })
  }

  getvalidationResults(state) {
    let alerts = {};
    let toastrMsg = []

    if (!state.CardName) alerts.CardName = "danger|Preenchimento obrigatório"
    if (!state.CounterRef) alerts.CounterRef = "warning|Se possível indique uma referência"
    if (!state.Observacoes) alerts.Observacoes = "warning|Deve indicar algum detalhe sobre a despesa"
    if (sappy.getNum(state.totalPagar) <= 0) alerts.totalPagar = "danger|Indique o valor"

    return { alerts, toastrMsg }
  }

  onCreatePayment() {
    let that = this;

    // perform checks
    //Validar campos de preenchimento obrigatório
    let newState = { ...that.state };
    // let fieldsRequired = []
    // let hasChangesToState = false;

    let { alerts, toastrMsg } = this.getvalidationResults(newState);
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
        DocType: "rAccount",
        CardName: this.state.CardName,
        CashAccount: "111",
        CashSum: sappy.getNum(this.state.totalPagar),
        Remarks: this.state.Observacoes,
        CounterReference: this.state.CounterRef,
        PaymentAccounts: [
          {
            AccountCode: "113",
            SumPaid: sappy.getNum(this.state.totalPagar),
            Decription: this.state.Observacoes
          }
        ]
      }

      sappy.showWaitProgress("A criar documento...")
      axios
        .post(`/api/caixa/despesas/adiantamento`, data)
        .then(result => {

          sappy.hideWaitProgress()
          sappy.showToastr({
            color: "success",
            msg: `Criou com sucesso o adiantamento ${result.data.DocNum} no valor de ${sappy.format.amount(sappy.getNum(that.state.totalPagar))}, de ${result.data.CardName}!`
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
    let alerts = {};
    if (this.state.showValidations) alerts = this.getvalidationResults(this.state).alerts;

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
                  name="CardName"
                  label="Á ordem de:"
                  createable={true}
                  value={this.state.CardName}
                  state={alerts.CardName}
                  getOptionsApiRoute="/api/caixa/despesas/histvalues/CardName"
                  onChange={this.onFieldChange}
                />
              </div>
              <div className="col-6 pr-1  ">
                <ComboBox
                  name="CounterRef"
                  createable={true}
                  label="Referência/Matricula"
                  value={this.state.CounterRef}
                  state={alerts.CounterRef}
                  getOptionsApiRoute="/api/caixa/despesas/histvalues/CounterRef"
                  onChange={this.onFieldChange}
                />
              </div>
              <div className="col-6 pl-1">
                <TextBoxNumeric valueType="amount" label="Total a pagar" name="totalPagar" value={this.state.totalPagar} onChange={this.onFieldChange} realTimeChange={true} />
              </div>
              <div className="col-12 ">
                <TextBox label="Observações" name="Observacoes" value={this.state.Observacoes} onChange={this.onFieldChange} />
              </div>
            </div>
          </div>

          <hr />
          <div className="sappy-action-bar animation-slide-left">
            <Button color={"success"} onClick={this.onCreatePayment}>
              <i className="icon wb-check" />Confirmar
            </Button>
          </div>
        </ModalBody>
      </Modal >
    );
  }
}

export default ModalAdiantamento;
