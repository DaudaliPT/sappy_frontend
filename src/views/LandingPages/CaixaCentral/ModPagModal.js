import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import axios from "axios";
var $ = window.$;
var byUs = window.byUs;

import { ByUsTextBoxNumeric } from "../../../Inputs";

class ModPagModal extends Component {
  constructor(props) {
    super(props);

    this.handleOnTabClick = this.handleOnTabClick.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.onCreateReceipt = this.onCreateReceipt.bind(this);

    this.state = {
      activeTab: "tab1"
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
    console.log($el)
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


  // Recebe os valores dos campos MY*
  onFieldChange(changeInfo) {
    let formatedValue = changeInfo.formatedValue;
    let val = changeInfo.rawValue;
    let fieldName = changeInfo.fieldName;

    let newStateValues = this.state;

    //Correctly save to ServiceLayer properties
    if (fieldName.indexOf("Valor") > -1) {
      Object.assign(newStateValues, { [fieldName]: formatedValue });
    } else {
      Object.assign(newStateValues, { [fieldName]: val });
    }

    //Não pode ter transferência e multibanco
    if (fieldName.indexOf("ValorTransferencia") > -1 && newStateValues.ValorMultibanco) {
      byUs.showToastr({ color: "warning", msg: "Não pode ter Transferência e Multibanco em simultaneo." })
      newStateValues.ValorMultibanco = "";
    }
    if (fieldName.indexOf("ValorMultibanco") > -1 && newStateValues.ValorTransferencia) {

      byUs.showToastr({ color: "warning", msg: "Não pode ter Multibanco e Transferência em simultaneo." })
      newStateValues.ValorTransferencia = "";
    }

    newStateValues.totalMeiosPag
      = byUs.getNum(this.state.ValorNumerario)
      + byUs.getNum(this.state.ValorMultibanco)
      + byUs.getNum(this.state.ValorTransferencia)
      + byUs.getNum(this.state.ValorCheque);

    newStateValues.troco = newStateValues.totalMeiosPag - newStateValues.totalReceber;

    if (newStateValues.troco > byUs.getNum(this.state.ValorNumerario)) {
      byUs.showToastr({ color: "danger", msg: "O troco não pode ser superior ao valor em numerário" })
      newStateValues.continuarColor = "danger";
      newStateValues.continuarContent = <span> <i className="icon wb-warning" /> Troco {byUs.format.amount(newStateValues.troco)}</span>;
    } else if (newStateValues.troco < 0) {
      newStateValues.continuarColor = "danger";
      newStateValues.continuarContent = <span> <i className="icon wb-warning" />  Em falta {byUs.format.amount(-1 * newStateValues.troco)}</span>
    } else if (newStateValues.troco > 0) {
      newStateValues.continuarColor = "warning";
      newStateValues.continuarContent = <span> <i className="icon wb-check" /> Concluir (Troco {byUs.format.amount(newStateValues.troco)})</span>
    } else {
      newStateValues.continuarColor = "success";
      newStateValues.continuarContent = <span> <i className="icon wb-check" /> Concluir {byUs.format.amount(newStateValues.troco)}</span>
    }
    this.setState(newStateValues);
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
      PaymentInvoices: [

      ]
    }
    if (byUs.getNum(this.state.ValorMultibanco)) {
      data.TransferSum = byUs.getNum(this.state.ValorMultibanco)
      data.TransferReference = 'MB'
    }

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
    let renderNumerario = () => {
      return <div>
        <ByUsTextBoxNumeric
          valueType="amount"
          label="Valor em numerário:"
          name="ValorNumerario"
          value={this.state.ValorNumerario}
          onChange={this.onFieldChange}
        />
      </div>
    }

    let renderMultibanco = () => {
      return <div>
        <ByUsTextBoxNumeric
          valueType="amount"
          label="Valor da pagamento:"
          name="ValorMultibanco"
          value={this.state.ValorMultibanco}
          onChange={this.onFieldChange}
        />
      </div>
    }

    let renderTransferencia = () => {
      return <div>
        <ByUsTextBoxNumeric
          valueType="amount"
          label="Valor da transferência:"
          name="ValorTransferencia"
          value={this.state.ValorTransferencia}
          onChange={this.onFieldChange}
        />
      </div>
    }
    // let renderCheque = () => {
    //   return <div>
    //     <ByUsTextBoxNumeric
    //       valueType="amount"
    //       label="Valor da cheque:"
    //       name="ValorCheque"
    //       value={this.state.ValorCheque}
    //       onChange={this.onFieldChange}
    //     />
    //   </div>
    // }




    return (
      <Modal isOpen={this.props.modal} className={"modal-md modal-success"}>
        <ModalHeader toggle={this.props.toggleModal}  >
          Meio de pagamento
        </ModalHeader>
        <ModalBody>
          <div className="container">
            <div className="row">
              <div className="col   px-0">
                <p></p>
              </div>
            </div>
            <div className="row">
              <div className="col-4   px-0">
                {/* <!-- Panel --> */}
                <div className="panel">
                  <div className="panel-body ">
                    <div className="list-group faq-list" role="tablist">
                      <a className="list-group-item list-group-item-action active" data-toggle="tab" role="tab" id="tab1" onClick={this.handleOnTabClick}>Numerário </a>
                      <a className="list-group-item" data-toggle="tab" role="tab" id="tab2" onClick={this.handleOnTabClick}>Multibanco</a>
                      <a className="list-group-item" data-toggle="tab" role="tab" id="tab3" onClick={this.handleOnTabClick}>Transferência</a>
                      {/* <a className="list-group-item" data-toggle="tab" role="tab" id="tab4" onClick={this.handleOnTabClick}>Cheque</a> */}
                    </div>
                  </div>
                </div>
                {/* <!-- End Panel --> */}
              </div>
              <div className="col-8      px-0">
                {/* <!-- Panel --> */}
                <div className="panel form-panel">
                  <div className="panel-body main-body">
                    <div className="animaDISABELDtion-fade" >
                      {this.state.activeTab === "tab1" && renderNumerario()}
                      {this.state.activeTab === "tab2" && renderMultibanco()}
                      {this.state.activeTab === "tab3" && renderTransferencia()}
                      {/* {this.state.activeTab === "tab4" && renderCheque()} */}
                    </div>
                  </div>
                </div>
                {/* <!-- End Panel --> */}
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
