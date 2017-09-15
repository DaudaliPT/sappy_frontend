import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import axios from "axios";
var $ = window.$;
var byUs = window.byUs;

import { ByUsTextBox, ByUsTextBoxNumeric, ByUsDate, ByUsComboBox, ByUsCheckHr } from "../../../Inputs";

class ModPagModal extends Component {
  constructor(props) {
    super(props);

    this.handleOnTabClick = this.handleOnTabClick.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.onCreateReceipt = this.onCreateReceipt.bind(this);
    this.onClick_GetRemaingValue = this.onClick_GetRemaingValue.bind(this);
    this.onClick_AddRemoveCheque = this.onClick_AddRemoveCheque.bind(this);
    this.updateTotalCheques = this.updateTotalCheques.bind(this);

    this.state = {
      activeTab: "tab1",
      cheques: [{}]
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.calcPageHeight);
    this.onFieldChange({
      fieldName: "totalReceber",
      formatedValue: byUs.format.amount(this.props.totalReceber),
      rawValue: byUs.getNum(this.props.totalReceber)
    })
    this.calcPageHeight();
  }

  calcPageHeight() {
    let $el = $(".modal-content>.main-body");
    // console.log($el)
    let $scrollAbleparent = $("body");
    if ($scrollAbleparent && $el) {
      let minH = $scrollAbleparent.height() - $el.position().top - 370;
      $el.css("height", minH.toString() + "px");
    }
  }

  handleOnTabClick(e) {
    e.preventDefault();
    let tab = e.target.id;
    this.setState({ activeTab: tab });
  }

  updateTotalCheques(cheques) {

    let v = cheques.reduce((sum, fld) => sum + byUs.getNum(fld.valor), 0);
    // Alterar apenas o valor total de cheques
    return this.onFieldChange({
      fieldName: "ValorCheques",
      rawValue: v,
      formatedValue: byUs.format.amount(v)
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
      let ix = byUs.getNum(fieldName.split("#")[1]);
      let prop = fieldName.split("#")[2];

      let cheques = [...this.state.cheques]

      if (prop === "valor") {
        cheques[ix] = Object.assign({}, cheques[ix], { [prop]: formatedValue });

        let v = cheques.reduce((sum, fld) => sum + byUs.getNum(fld.valor), 0);
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


    let totalReceber = byUs.getNum(fieldName === "totalReceber" ? formatedValue : this.state.totalReceber)
    let ValorNumerario = byUs.getNum(fieldName === "ValorNumerario" ? formatedValue : this.state.ValorNumerario)
    let ValorMultibanco = byUs.getNum(fieldName === "ValorMultibanco" ? formatedValue : this.state.ValorMultibanco)
    let ValorTransferencia = byUs.getNum(fieldName === "ValorTransferencia" ? formatedValue : this.state.ValorTransferencia)
    let ValorCheques = byUs.getNum(fieldName === "ValorCheques" ? formatedValue : this.state.ValorCheques)
    let continuarColor;
    let continuarContent;

    //Não pode ter transferência e multibanco
    if (fieldName.indexOf("ValorTransferencia") > -1 && ValorMultibanco) {
      byUs.showToastr({ color: "warning", msg: "Não pode ter Transferência e Multibanco em simultaneo." })
      newStateValues.ValorMultibanco = "";
      ValorMultibanco = 0;
    } else if (fieldName.indexOf("ValorMultibanco") > -1 && ValorTransferencia) {
      byUs.showToastr({ color: "warning", msg: "Não pode ter Multibanco e Transferência em simultaneo." })
      newStateValues.ValorTransferencia = "";
      ValorTransferencia = 0;
    }

    let totalMeiosPag = ValorNumerario + ValorMultibanco + ValorTransferencia + ValorCheques
    let troco = totalMeiosPag - totalReceber;


    if (troco > ValorNumerario) {
      byUs.showToastr({ color: "danger", msg: "O troco não pode ser superior ao valor em numerário" })
      continuarColor = "danger";
      continuarContent = <span> <i className="icon wb-warning" /> Troco {byUs.format.amount(troco)}</span>;
    } else if (troco < 0) {
      continuarColor = "danger";
      continuarContent = <span> <i className="icon wb-warning" />  Em falta {byUs.format.amount(-1 * troco)}</span>
    } else if (troco > 0) {
      continuarColor = "warning";
      continuarContent = <span> <i className="icon wb-check" /> Concluir (Troco {byUs.format.amount(troco)})</span>
    } else {
      continuarColor = "success";
      continuarContent = <span> <i className="icon wb-check" /> Concluir {byUs.format.amount(troco)}</span>
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
    let fieldName = cmpThis.props.name.split("#")[0];
    let ix = byUs.getNum(cmpThis.props.name.split("#")[1]);
    let cheques = [...this.state.cheques]
    let currVal = byUs.getNum(cheques[ix].valor);
    let totalReceber = byUs.getNum(this.state.totalReceber);
    let totalMeiosPag = byUs.getNum(this.state.totalMeiosPag);
    let emFalta = 0
    if (totalReceber > totalMeiosPag) emFalta = totalReceber - totalMeiosPag

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
          numero: byUs.getNum(cheque.numero) + 1,
          valor: byUs.format.amount(currVal < emFalta ? currVal : emFalta)
        })
      }

      this.setState({ cheques }, that.updateTotalCheques(cheques))

    } else {
      totalMeiosPag -= currVal
      if (totalReceber > totalMeiosPag) emFalta = totalReceber - totalMeiosPag

      that.onFieldChange({
        fieldName: "cheques#" + ix + "#valor",
        rawValue: emFalta,
        formatedValue: byUs.format.amount(totalReceber - totalMeiosPag)
      })
    }
  }

  onClick_GetRemaingValue(cmpThis) {
    let fieldName = cmpThis.props.name;
    let currVal = byUs.getNum(this.state[fieldName]);
    let totalReceber = byUs.getNum(this.state.totalReceber);
    let totalMeiosPag = byUs.getNum(this.state.totalMeiosPag);


    if (fieldName.indexOf("ValorTransferencia") > -1 || fieldName.indexOf("ValorMultibanco") > -1) {
      totalMeiosPag -= byUs.getNum(this.state.ValorTransferencia)
      totalMeiosPag -= byUs.getNum(this.state.ValorMultibanco)
    } else {
      totalMeiosPag -= currVal
    }

    let rawValue = 0;
    if (!currVal && totalReceber - totalMeiosPag > 0) rawValue = totalReceber - totalMeiosPag;

    if (currVal !== rawValue)
      this.onFieldChange({
        fieldName,
        formatedValue: rawValue ? byUs.format.amount(rawValue) : "",
        rawValue
      })
  }

  onCreateReceipt() {
    let that = this;


    let data = {
      DocType: "rCustomer",
      CardCode: this.props.selectedPN,
      CashAccount: "111",
      CheckAccount: "119",
      TransferAccount: "118",
      CashSum: byUs.getNum(this.state.ValorNumerario) - byUs.getNum(this.state.troco),
      TransferSum: byUs.getNum(this.state.ValorTransferencia),
      // TransferDate: "2016-06-09", 
      Remarks: this.state.Observacoes,
      PaymentInvoices: [

      ]
    }
    if (byUs.getNum(this.state.ValorMultibanco)) {
      data.TransferSum = byUs.getNum(this.state.ValorMultibanco)
      data.TransferReference = 'MB'
    }


    data.PaymentChecks = [];
    this.state.cheques.forEach(cheque => {
      data.PaymentChecks.push({
        DueDate: byUs.format.YYYY_MM_DD(cheque.data),
        CheckNumber: cheque.numero,
        BankCode: cheque.banco,
        CheckSum: byUs.getNum(cheque.valor)
      })
    });

    this.props.selectedDocs.forEach(docId => {

      let doc = this.props.docsList.find(doc => docId === (doc.TransId + "#" + doc.Line_ID))

      let InvoiceType = ""
      if (byUs.getNum(doc.TransType) === -3) InvoiceType = "it_ClosingBalance";
      else if (byUs.getNum(doc.TransType) === -1) InvoiceType = "it_AllTransactions";
      else if (byUs.getNum(doc.TransType) === -2) InvoiceType = "it_OpeningBalance";
      else if (byUs.getNum(doc.TransType) === 13) InvoiceType = "it_Invoice";
      else if (byUs.getNum(doc.TransType) === 14) InvoiceType = "it_CredItnote";
      else if (byUs.getNum(doc.TransType) === 15) InvoiceType = "it_TaxInvoice"
      else if (byUs.getNum(doc.TransType) === 16) InvoiceType = "it_Return";
      else if (byUs.getNum(doc.TransType) === 18) InvoiceType = "it_PurchaseInvoice";
      else if (byUs.getNum(doc.TransType) === 19) InvoiceType = "it_PurchaseCreditNote";
      else if (byUs.getNum(doc.TransType) === 20) InvoiceType = "it_PurchaseDeliveryNote";
      else if (byUs.getNum(doc.TransType) === 21) InvoiceType = "it_PurchaseReturn";
      else if (byUs.getNum(doc.TransType) === 24) InvoiceType = "it_Receipt";
      else if (byUs.getNum(doc.TransType) === 25) InvoiceType = "it_Deposit";
      else if (byUs.getNum(doc.TransType) === 30) InvoiceType = "it_JournalEntry";
      else if (byUs.getNum(doc.TransType) === 46) InvoiceType = "it_PaymentAdvice";
      else if (byUs.getNum(doc.TransType) === 57) InvoiceType = "it_ChequesForPayment";
      else if (byUs.getNum(doc.TransType) === 58) InvoiceType = "it_StockReconciliations";
      else if (byUs.getNum(doc.TransType) === 59) InvoiceType = "it_GeneralReceiptToStock";
      else if (byUs.getNum(doc.TransType) === 60) InvoiceType = "it_GeneralReleaseFromStock";
      else if (byUs.getNum(doc.TransType) === 67) InvoiceType = "it_TransferBetweenWarehouses";
      else if (byUs.getNum(doc.TransType) === 68) InvoiceType = "it_WorkInstructions";
      else if (byUs.getNum(doc.TransType) === 76) InvoiceType = "it_DeferredDeposit";
      else if (byUs.getNum(doc.TransType) === 132) InvoiceType = "it_CorrectionInvoice ";
      else if (byUs.getNum(doc.TransType) === 163) InvoiceType = "it_APCorrectionInvoice ";
      else if (byUs.getNum(doc.TransType) === 165) InvoiceType = "it_ARCorrectionInvoice ";
      else if (byUs.getNum(doc.TransType) === 203) InvoiceType = "it_DownPayment ";
      else if (byUs.getNum(doc.TransType) === 204) InvoiceType = "it_PurchaseDownPayment ";

      if (byUs.getNum(doc.TransType) !== 24 && byUs.getNum(doc.TransType) !== 46) {
        data.PaymentInvoices.push({
          DocEntry: doc.CreatedBy,
          InvoiceType,
          PaidSum: doc.BALANCE
        })
      }
      else {
        data.PaymentInvoices.push({
          DocEntry: doc.TransId,
          DocLine: doc.Line_ID,
          InvoiceType,
          PaidSum: doc.BALANCE
        })
      }
    })

    axios
      .post(`/api/caixa/class/receipt`, data)
      .then(result => {

        that.props.toggleModal(result.data.DocNum);
        byUs.showSuccess({
          msg: "Documento criado",
          moreInfo: `Criou com sucesso o documento ${result.data.DocNum}!`,
          confirmText: "Concluido"
        })
      })
      .catch(error => byUs.showError(error, "Não foi possivel adicionar o recibo"));
  }

  render() {
    let getRightButton = (valor) => !valor ? <i className="icon wb-arrow-left" /> : <i className="icon wb-close" />

    let renderNumerario = () => (
      <div   >
        <div className="row">
          <div className="col-4 pr-1">
            <ByUsTextBoxNumeric
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
            <ByUsTextBoxNumeric
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
            <ByUsTextBoxNumeric
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
            <ByUsTextBox
              label="Referência:"
              name="RefTransferencia"
              value={this.state.RefTransferencia}
              onChange={this.onFieldChange}
            />
          </div>
          <div className="col-4 pl-1">
            <ByUsComboBox
              name="ContaTransferencia"
              label="Destino"
              value={this.state.ContaTransferencia}
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
            <ByUsDate label="Data" name={"cheques#" + ix + "#data"} value={cheque.data} onChange={this.onFieldChange} />
          </div>
          <div className="col-4 pl-1 pr-1">
            <ByUsComboBox label="Banco" name={"cheques#" + ix + "#banco"} value={cheque.banco} getOptionsApiRoute="/api/cbo/odsc" onChange={this.onFieldChange} />
          </div>
          <div className="col-2 pl-1 pr-1">
            <ByUsTextBox label="Numero" name={"cheques#" + ix + "#numero"} value={cheque.numero} onChange={this.onFieldChange} />
          </div>
          <div className="col-3 pl-1">
            <ByUsTextBoxNumeric
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
            <ByUsTextBoxNumeric
              valueType="amount"
              label="Total de cheques:"
              name="ValorCheques"
              value={this.state.ValorCheques}
              disabled={true} />
          </div>
        </div>
      </div >
    }




    return (
      <Modal isOpen={this.props.modal} className={"modal-md modal-success"}>
        <ModalHeader toggle={this.props.toggleModal}  >
          Meio de pagamento
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
                      <div className="col-12   ">
                        <ByUsTextBox
                          label="Observações"
                          name="Observacoes"
                          value={this.state.Observacoes}
                          onChange={this.onFieldChange}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-12   ">
                        <ByUsCheckHr
                          label="Enviar por email para... (ainda em desenvolvimento...)"
                          name="apyByMail"
                          value={this.state.apyByMail}
                          onChange={this.onFieldChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="byus-action-bar animation-slide-left">


            <Button color={this.state.continuarColor} disabled={this.state.continuarColor === "danger"} onClick={this.onCreateReceipt}>
              {this.state.continuarContent}
            </Button>
          </div>
        </ModalBody>
      </Modal >
    );
  }
}

export default ModPagModal;
