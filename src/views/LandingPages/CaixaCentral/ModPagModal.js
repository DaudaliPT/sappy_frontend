import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import axios from "axios";
var $ = window.$;
var byUs = window.byUs;

import { ByUsTextBox, ByUsTextBoxNumeric, ByUsComboBox } from "../../../Inputs";

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
    let that = this;
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

    this.setState(newStateValues);
  }

  onCreateReceipt() {
    let that = this;
    this.state.selectedDocs.forEach(docId => {
      let transId = docId.split('#')[0]
      let lineId = docId.split('#')[1]

      let data = {
        DocType: "rCustomer",
        CardCode: this.props.selectedPN,
        CashAccount: "111",
        CheckAccount: "119",
        TransferAccount: "118",
        CashSum: 0,
        TransferSum: 34.37,
        // TransferDate: "2016-06-09",
        TransferReference: "MB",
        PaymentInvoices: [
          {
            DocEntry: 00,
            InvoiceType: "it_Invoice",
            PaidSum: 0
          }
        ]
      }

      axios
        .post(`/api/caixa/class/receipt`, data)
        .then(result => {
          let selectedPN = that.state.selectedPN;
          byUs.showToastr({ color: "success", msg: "Classificação actualizada" })
          that.setState({ selectedPN: '', selectedDocs: [] },
            () => setTimeout(that.setState({ selectedPN }), 1)
          );
        })
        .catch(error => byUs.showError(error, "Não foi possivel ataulizar classificação"));
    })
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
    let renderCheque = () => {
      return <div>
        <ByUsTextBoxNumeric
          valueType="amount"
          label="Valor da cheque:"
          name="ValorCheque"
          value={this.state.ValorCheque}
          onChange={this.onFieldChange}
        />
      </div>
    }

    let renderConfirmar = () => {

      let totalMeiosPag
        = byUs.getNum(this.state.ValorNumerario)
        + byUs.getNum(this.state.ValorMultibanco)
        + byUs.getNum(this.state.ValorTransferencia)
        + byUs.getNum(this.state.ValorCheque);

      let totalReceber = byUs.getNum(this.props.totalReceber);
      let troco = totalMeiosPag - totalReceber;



      if (troco > byUs.getNum(this.state.ValorNumerario)) {
        byUs.showToastr({ color: "danger", msg: "O troco não pode ser superior ao valor em numerário" })
        return (
          <Button color="danger" disabled>
            <span> <i className="icon wb-warning" /> Troco {byUs.format.amount(troco)}</span>
          </Button>)
      }

      if (troco < 0) {

        return (
          <Button color="danger" disabled>
            <span> <i className="icon wb-warning" /> Em falta {byUs.format.amount(-1 * troco)}</span>
          </Button>)
      }


      if (troco > 0) {
        return (
          <Button color="warning" onClick={this.onCreateReceipt}>
            <span> <i className="icon wb-check" /> Concluir (Troco {byUs.format.amount(troco)})</span>
          </Button>)
      }



      return (
        <Button color="success" onClick={this.onCreateReceipt}>
          <span> <i className="icon wb-check" /> Concluir {byUs.format.amount(troco)}</span>
        </Button>)
    }


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
                      <a className="list-group-item" data-toggle="tab" role="tab" id="tab4" onClick={this.handleOnTabClick}>Cheque</a>
                    </div>
                  </div>
                </div>
                {/* <!-- End Panel --> */}
              </div>
              <div className="col-8      px-0">
                {/* <!-- Panel --> */}
                <div className="panel form-panel">
                  <div className="panel-body main-body">
                    <div className="animation-fade" >
                      {this.state.activeTab === "tab1" && renderNumerario()}
                      {this.state.activeTab === "tab2" && renderMultibanco()}
                      {this.state.activeTab === "tab3" && renderTransferencia()}
                      {this.state.activeTab === "tab4" && renderCheque()}
                    </div>
                  </div>
                </div>
                {/* <!-- End Panel --> */}
              </div>
            </div>
          </div>

          <div className="byus-action-bar animation-slide-left">
            {renderConfirmar()}

          </div>
        </ModalBody>
      </Modal >
    );
  }
}

export default ModPagModal;
