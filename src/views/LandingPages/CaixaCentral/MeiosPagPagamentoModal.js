import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import axios from "axios";
var $ = window.$;
var sappy = window.sappy;

import { TextBox, TextBoxNumeric, Date, ComboBox } from "../../../Inputs";

class ModPagModal extends Component {
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
    this.onFieldChange({
      fieldName: "originalTotalPagar",
      formatedValue: sappy.format.amount(this.props.totalPagar),
      rawValue: sappy.getNum(this.props.totalPagar)
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
    } else if (fieldName === "originalTotalPagar") {
      Object.assign(newStateValues, { originalTotalPagar: formatedValue })
      if (val < 0) {
        Object.assign(newStateValues, { totalPagar: sappy.format.amount(val * -1) })
        Object.assign(newStateValues, { isPayment: true })
      } else {
        Object.assign(newStateValues, { totalPagar: sappy.format.amount(val) })
        Object.assign(newStateValues, { isPayment: false })
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
    if (state.ValorTransferencia && (!state.RefTransferencia || !state.ContaTransferencia)) {
      if (!state.RefTransferencia) alerts.RefTransferencia = "warning|Deve preencher a referência"
      if (!state.ContaTransferencia) alerts.ContaTransferencia = "danger|Indique a conta de destino da transferência"
    }

    state.cheques.forEach((cheque, ix) => {
      if (sappy.getNum(cheque.valor)) {
        if (!cheque.data) alerts["cheques#" + ix + "data"] = "danger|Data em falta"
        if (!cheque.banco) alerts["cheques#" + ix + "banco"] = "danger|Deve preencher o banco"
        if (!cheque.numero) alerts["cheques#" + ix + "numero"] = "danger|Numero em falta"
      }
    })


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

    if (Object.keys(alerts).length > 0) this.setState({ showValidations: true })
    //Validar se há erros ativos
    let hasDanger = Object.keys(alerts).find(f => alerts[f].startsWith("danger"))
    if (hasDanger) {
      if (toastrMsg.length > 0) return // já deu mensagens
      return sappy.showToastr({ color: "danger", msg: "Há campos com erros. Verifique se preencheu todos os campos obrigatórios..." })
    }

    //Validar se há avisos ativos
    let hasWarning = Object.keys(alerts).find(f => alerts[f].startsWith("warning"))

    let strDocDesc = this.state.isPayment ? "pagamento" : "recebimento"

    let invokeAddDocAPI = () => {
      let data = {
        DocType: "rCustomer",
        CardCode: this.props.selectedPN,
        CashAccount: "111",
        CashSum: sappy.getNum(this.state.ValorNumerario) - sappy.getNum(this.state.troco),
        Remarks: this.state.Observacoes,
        PaymentInvoices: [

        ]
      }
      if (sappy.getNum(this.state.ValorMultibanco)) {
        data.TransferAccount = "118"
        data.TransferSum = sappy.getNum(this.state.ValorMultibanco)
        data.TransferReference = 'MB'
      };

      if (sappy.getNum(this.state.ValorTransferencia)) {
        data.TransferAccount = this.state.ContaTransferencia
        data.TransferSum = sappy.getNum(this.state.ValorTransferencia)
        data.TransferReference = this.state.RefTransferencia
      }

      data.PaymentChecks = [];
      data.CheckAccount = "119";

      this.state.cheques.forEach(cheque => {
        if (sappy.getNum(cheque.valor) > 0) {
          data.PaymentChecks.push({
            DueDate: sappy.format.YYYY_MM_DD(cheque.data),
            CheckNumber: cheque.numero,
            BankCode: cheque.banco,
            CheckSum: sappy.getNum(cheque.valor)
          })
        }
      });



      let pendingValue = sappy.getNum(this.state.totalPagar);

      // nota: os valores a pagar são negativos. 
      // Num recebimento o total de valores a receber(positivos) é superior aos valores a deduzir(negativos)
      // Num pagamento o total de valores a pagar(negativos) é superior aos valores a deduzir(positivos)
      let docsDeducao = this.props.selectedDocs.filter(doc => this.state.isPayment ? sappy.getNum(doc.BALANCE) > 0 : sappy.getNum(doc.BALANCE) < 0)
      let docsPagar = this.props.selectedDocs.filter(doc => this.state.isPayment ? sappy.getNum(doc.BALANCE) < 0 : sappy.getNum(doc.BALANCE) > 0)

      // Para que quando há valores parciais funcione bem, vamos colocar sempre primeiro os valores a deduzir
      docsDeducao.forEach(doc => {
        let valueToUse = Math.abs(sappy.getNum(doc.BALANCE));
        pendingValue += valueToUse

        if (sappy.getNum(doc.TransType) !== 24 && sappy.getNum(doc.TransType) !== 46) {
          data.PaymentInvoices.push({
            DocEntry: doc.CreatedBy,
            InvoiceType: sappy.b1.getBoRcptInvTypes(doc.TransType),
            SumApplied: -1 * valueToUse
          })
        }
        else {
          data.PaymentInvoices.push({
            DocEntry: doc.TransId,
            DocLine: doc.Line_ID,
            InvoiceType: sappy.b1.getBoRcptInvTypes(doc.TransType),
            SumApplied: -1 * valueToUse
          })
        }
      })

      // Para que quando há valores parciais funcione bem, vamos colocar sempre depois os vaores a Pagar
      docsPagar.forEach(doc => {
        let valueToUse = 0;
        let docBalance = Math.abs(sappy.getNum(doc.BALANCE));

        if (pendingValue - docBalance >= 0) {
          valueToUse = docBalance
        } else {
          valueToUse = pendingValue
        }
        pendingValue -= valueToUse
        if (valueToUse <= 0) return

        if (sappy.getNum(doc.TransType) !== 24 && sappy.getNum(doc.TransType) !== 46) {
          data.PaymentInvoices.push({
            DocEntry: doc.CreatedBy,
            InvoiceType: sappy.b1.getBoRcptInvTypes(doc.TransType),
            SumApplied: valueToUse
          })
        }
        else {
          data.PaymentInvoices.push({
            DocEntry: doc.TransId,
            DocLine: doc.Line_ID,
            InvoiceType: sappy.b1.getBoRcptInvTypes(doc.TransType),
            SumApplied: valueToUse
          })
        }
      })



      sappy.showWaitProgress("A criar documento...")
      axios
        .post(`/api/caixa/class/${this.state.isPayment ? "payment" : "receipt"}`, data)
        .then(result => {

          sappy.hideWaitProgress()
          that.props.toggleModal({ success: result.data.DocNum });
          sappy.showToastr({
            color: "success",
            msg: `Criou com sucesso o ${strDocDesc} ${result.data.DocNum} no valor de ${sappy.format.amount(this.state.totalPagar)}, de ${result.data.CardName}!`
          })

        })
        .catch(error => sappy.showError(error, "Não foi possivel adicionar o " + strDocDesc));
    }

    if (!hasWarning)
      return sappy.showQuestion({
        title: "Deseja Continuar?",
        msg: "Se continuar irá criar este " + strDocDesc + ".",
        onConfirm: invokeAddDocAPI,
        confirmText: "Criar " + strDocDesc,
        onCancel: () => { }
      })
    else
      return sappy.showWarning({
        title: "Atenção!",
        msg: "Ainda há campos com avisos!",
        moreInfo: "Deseja mesmo assim criar este " + strDocDesc + "?",
        onConfirm: invokeAddDocAPI,
        confirmText: "Ignorar e criar " + strDocDesc,
        onCancel: () => { }
      })

  }

  render() {
    let alerts = {};
    if (this.state.showValidations) alerts = this.getvalidationResults(this.state).alerts;
    let getRightButton = (valor) => !valor ? <i className="icon wb-arrow-left" /> : <i className="icon wb-close" />

    let renderNumerario = () => (
      <div>
        <div className="row">
          <div className="col-4 pr-1">
            <TextBoxNumeric
              valueType="amount"
              label="Valor em numerário:"
              name="ValorNumerario"
              value={this.state.ValorNumerario}
              onChange={this.onFieldChange}
              realTimeChange={true}
              rightButton={getRightButton(this.state.ValorNumerario)}
              onRightButtonClick={this.onClick_GetRemaingValue}
            />
          </div>
        </div>
      </div>)


    let renderMultibanco = () => (
      <div  >
        <div className="row">
          <div className="col-4 pr-1">
            <TextBoxNumeric
              valueType="amount"
              label="Valor do pagamento:"
              name="ValorMultibanco"
              value={this.state.ValorMultibanco}
              onChange={this.onFieldChange}
              realTimeChange={true}
              rightButton={getRightButton(this.state.ValorMultibanco)}
              onRightButtonClick={this.onClick_GetRemaingValue}
            />
          </div>
        </div>
      </div>)


    let renderTransferencia = () => (
      <div  >
        <div className="row">
          <div className="col-4 pr-1">
            <TextBoxNumeric
              valueType="amount"
              label="Valor da transferência:"
              name="ValorTransferencia"
              value={this.state.ValorTransferencia}
              onChange={this.onFieldChange}
              realTimeChange={true}
              rightButton={getRightButton(this.state.ValorTransferencia)}
              onRightButtonClick={this.onClick_GetRemaingValue}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-4 pr-1">
            <TextBox
              label="Referência:"
              name="RefTransferencia"
              state={alerts.RefTransferencia}
              value={this.state.RefTransferencia}
              onChange={this.onFieldChange}
            />
          </div>
          <div className="col-4 pl-1">
            <ComboBox
              name="ContaTransferencia"
              label="Destino"
              value={this.state.ContaTransferencia}
              state={alerts.ContaTransferencia}
              getOptionsApiRoute="/api/cbo/oact/cnt12"
              onChange={this.onFieldChange}
            />
          </div>
        </div>
      </div >)


    let renderCheques = () => {
      let cheques = this.state.cheques || [];
      let renderCheque = (cheque, ix) => {
        let rightButton
        if (this.state.troco === 0) rightButton = "-"
        else if (ix < cheques.length - 1) rightButton = "-"
        else if (cheque.valor) rightButton = "+"
        else rightButton = <i className="icon wb-arrow-left" />


        return <div key={"cheques#" + ix} className="row">
          <div className="col-3 pr-1">
            <Date label="Data" name={"cheques#" + ix + "#data"}
              value={cheque.data}
              state={alerts["cheques#" + ix + "data"]}
              onChange={this.onFieldChange} />
          </div>
          <div className="col-4 pl-1 pr-1">
            <ComboBox label="Banco"
              name={"cheques#" + ix + "#banco"}
              value={cheque.banco}
              state={alerts["cheques#" + ix + "banco"]}
              getOptionsApiRoute="/api/cbo/odsc"
              onChange={this.onFieldChange} />
          </div>
          <div className="col-2 pl-1 pr-1">
            <TextBox
              label="Numero"
              name={"cheques#" + ix + "#numero"}
              value={cheque.numero}
              state={alerts["cheques#" + ix + "numero"]}
              onChange={this.onFieldChange} />
          </div>
          <div className="col-3 pl-1">
            <TextBoxNumeric
              valueType="amount"
              label="Valor"
              name={"cheques#" + ix + "#valor"}
              value={cheque.valor}
              onChange={this.onFieldChange}
              realTimeChange={true}
              rightButton={rightButton}
              onRightButtonClick={this.onClick_AddRemoveCheque} />
          </div>
        </div >
      }

      let chequeElemts = []
      for (var ix = 0; ix < cheques.length; ix++) {
        let cheque = cheques[ix] || {}
        chequeElemts.push(renderCheque(cheque, ix))
      }
      return <div >
        {chequeElemts}
        <div className="row">
          <div className="col-3 offset-9 pl-1">
            <TextBoxNumeric
              valueType="amount"
              label="Total de cheques:"
              name="ValorCheques"
              value={this.state.ValorCheques}
              disabled={true} />
          </div>
        </div>
      </div >
    }

    let strMeioPagOrRecTo = this.state.isPayment ? "Meio de pagamento a " : "Meio de recebimento de "
    let className = this.state.isPayment ? "modal-warning" : "modal-success"

    return (
      <Modal isOpen={true} className={"modal-md " + className}>
        <ModalHeader toggle={this.props.toggleModal}  >
          {strMeioPagOrRecTo + this.props.selectedPNname + " (" + this.props.selectedPN + ")"}
        </ModalHeader>
        <ModalBody >

          <div className="panel">
            {/* <div className="panel-body "> */}
            <div className="container">

              <div className="row">
                <div className="col   px-0">
                  <p></p>
                </div>
              </div>
              <div className="row">
                <div className="col-2   px-0">
                  <div className="list-group faq-list" role="tablist">
                    <a className={"list-group-item list-group-item-action active " + (this.state.ValorNumerario ? "filled" : "")} data-toggle="tab" role="tab" id="tab1" onClick={this.handleOnTabClick}>Numerário </a>
                    <a className={"list-group-item " + (this.state.ValorMultibanco ? "filled" : "")} data-toggle="tab" role="tab" id="tab2" onClick={this.handleOnTabClick}>Multibanco</a>
                    <a className={"list-group-item " + (this.state.ValorTransferencia ? "filled" : "")} data-toggle="tab" role="tab" id="tab3" onClick={this.handleOnTabClick}>Transferência</a>
                    <a className={"list-group-item " + (this.state.ValorCheques ? "filled" : "")} data-toggle="tab" role="tab" id="tab4" onClick={this.handleOnTabClick}>Cheque</a>
                  </div>
                </div>
                <div className="col-10      px-0">
                  <div className="painel-modopag" >
                    {this.state.activeTab === "tab1" && renderNumerario()}
                    {this.state.activeTab === "tab2" && renderMultibanco()}
                    {this.state.activeTab === "tab3" && renderTransferencia()}
                    {this.state.activeTab === "tab4" && renderCheques()}

                  </div>

                  <div className="painel-modopag-bottom" >
                    <div className="row">
                      <div className="col-8 pr-1  ">
                        <TextBox
                          label="Observações"
                          name="Observacoes"
                          value={this.state.Observacoes}
                          onChange={this.onFieldChange}
                        />
                      </div>
                      <div className="col-4 pl-1">
                        <TextBoxNumeric
                          valueType="amount"
                          label={this.state.isPayment ? "Total a pagar" : "Total a receber"}
                          name="totalPagar"
                          value={this.state.totalPagar}
                          onChange={this.onFieldChange}
                          realTimeChange={true}
                        />
                      </div>
                    </div>

                    {/* <div className="row">
                      <div className="col-12   ">
                        <CheckHr
                          label="Enviar por email para... (ainda em desenvolvimento...)"
                          name="apyByMail"
                          value={this.state.apyByMail}
                          onChange={this.onFieldChange}
                        />
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sappy-action-bar animation-slide-left">


            <Button color={this.state.continuarColor} disabled={this.state.continuarColor === "danger"} onClick={this.onCreatePayment}>
              {this.state.continuarContent}
            </Button>
          </div>
        </ModalBody>
      </Modal >
    );
  }
}

export default ModPagModal;
