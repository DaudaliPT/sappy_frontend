import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import axios from "axios";
var $ = window.$;
var byUs = window.byUs;

import CmpGeral from "./CmpGeral";
import CmpStock from "./CmpStock";
import CmpTransStock from "./CmpTransStock";
import CmpVendas from "./CmpVendas";
import CmpCompras from "./CmpCompras";
import { hashHistory } from "react-router";

class EditModal extends Component {
  constructor(props) {
    super(props);

    this.toggleModalMessage = this.toggleModalMessage.bind(this);
    this.handleOnTabClick = this.handleOnTabClick.bind(this);
    this.onMoveTo = this.onMoveTo.bind(this);
    this.onOpenEditPage = this.onOpenEditPage.bind(this);
    this.loadProduto = this.loadProduto.bind(this)
    this.onTogleAllowEdit = this.onTogleAllowEdit.bind(this);

    this.state = {
      NewItem: { ItemCode: props.itemcode },
      ReadOnly: true,
      loading: true,
      activeTab: "tabGeral"
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.calcPageHeight);

    this.calcPageHeight();
    setTimeout(this.loadProduto(this.props.itemcode), 1);
  }

  calcPageHeight() {
    let $el = $(".main-body");

    let $scrollAbleparent = $("body");
    if ($scrollAbleparent && $el) {
      let minH = $scrollAbleparent.height() - $el.position().top - 170;
      $el.css("height", minH.toString() + "px");
    }
  }

  componentWillUnmount() {
    if (this.serverRequest && this.serverRequest.abort) this.serverRequest.abort();
    window.removeEventListener("resize", this.calcPageHeight);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.itemcode !== nextProps.itemcode) this.loadProduto(nextProps.itemcode);
  }

  toggleModalMessage(refresh) {
    this.setState({
      modalMessage: {}
    });
  }
  onTogleAllowEdit(e) {
    this.setState({ ReadOnly: !this.state.ReadOnly })
  }

  loadProduto(itemcode) {
    let that = this;

    this.setState({ loading: true });
    this.serverRequest = axios({
      method: "get",
      url: "api/inv/oitm/item/" + itemcode
    })
      .then(result => {
        let { Item, AlternateCatNum } = result.data;

        //Preparar as propriedades
        let Propriedades = [];
        for (var index = 1; index < 65; index++) {
          var propertyName = "Properties" + index;
          let propertyValue = Item[propertyName] === "tYES";
          if (propertyValue) Propriedades.push(index.toString());
        }

        //preparar supplierCollection
        let supplierCollection = [{
          "CardCode": Item.Mainsupplier,
          "Substitute": Item.SupplierCatalogNo
        }];
        AlternateCatNum.forEach(obj => {
          if (obj.CardCode !== Item.Mainsupplier) {
            supplierCollection.push({
              "CardCode": obj.CardCode,
              "Substitute": obj.Substitute
            });
          }
        })

        that.setState({
          loading: false,
          newItem: Item,
          numberOfBarCodes: Item.ItemBarCodeCollection.length,
          Propriedades,
          supplierCollection,
          showFabricante: Item.Mainsupplier === "F0585"/*UNAPOR*/,
          U_rsaMargem: Item.U_rsaMargem,
          PrecoCash: Item.ItemPrices[0].Price
        })
      })
      .catch(error => {
        this.setState({ saving: false }, () => {
          this.showMessage({
            title: "Error!",
            message: error.response.data.message,
            moreInfo: error.response.data.moreInfo,
            color: "danger"
          });
        });
      })

  }


  onMoveTo(nextORprevious) {
    let that = this;
    this.serverRequest = axios({
      method: "get",
      url: `api/inv/oitm/info/${this.props.itemcode}/${nextORprevious}`
    })
      .then(result => {
        if (result.data)
          that.setState({ ReadOnly: true }, hashHistory.push("/inv/oitm/" + result.data));
      })
      .catch(error => byUs.showError(error, "Erro ao obter dados"));
  }


  onOpenEditPage(nextORprevious) {
    this.props.toggleModal();
    hashHistory.push("/inv/oitm/" + this.props.itemcode)
  }

  handleOnTabClick(e) {
    e.preventDefault();
    let tab = e.target.id;
    this.setState({ activeTab: tab });
  }


  render() {
    let newItem = this.state.newItem || {}

    return (
      <Modal isOpen={this.props.modal} className={"modal-lg modal-success"}>
        <ModalHeader toggle={this.props.toggleModal}  >
          {this.state.loading ? '...' : (newItem.ItemName + ' (' + newItem.ItemCode + ')')}

        </ModalHeader>
        <ModalBody>
          <div className="container">
            <div className="row">
              <div className="col">

                <span className="float-right">
                  {this.state.ReadOnly && this.state.activeTab === "tabGeral" &&
                    <Button outline className="btn-sm btn-flat" onClick={this.onTogleAllowEdit}>
                      <i className="icon wb-edit" />
                      <span className="hidden-sm-down"> Alterar</span>
                    </Button>}
                  {!this.state.ReadOnly && this.state.activeTab === "tabGeral" &&
                    <Button outline className="btn-sm btn-flat" onClick={this.onTogleAllowEdit}>
                      <i className="icon wb-close" />
                      <span className="hidden-sm-down"> Alterar</span>
                    </Button>}
                  <Button outline className="btn-sm btn-flat" onClick={this.onOpenEditPage}>
                    <i className="icon wb-arrow-expand" />
                  </Button>
                </span>
              </div>
            </div>

            <div className="row">
              <div className="col-xl-3 col-md-4    px-0">
                {/* <!-- Panel --> */}
                <div className="panel">
                  <div className="panel-body ">
                    <div className="list-group faq-list" role="tablist">
                      <a className="list-group-item list-group-item-action active" data-toggle="tab" role="tab"
                        id="tabGeral" onClick={this.handleOnTabClick}>Geral </a>
                      <a className="list-group-item" data-toggle="tab" role="tab"
                        id="tabVendas" onClick={this.handleOnTabClick}>Vendas</a>
                      <a className="list-group-item" data-toggle="tab" role="tab"
                        id="tabCompras" onClick={this.handleOnTabClick}>Compras</a>
                      <a className="list-group-item" data-toggle="tab" role="tab"
                        id="tabInventario" onClick={this.handleOnTabClick}>Inventário</a>
                      <a className="list-group-item" data-toggle="tab" role="tab"
                        id="tabTransInv" onClick={this.handleOnTabClick}>Transações de Inventário</a>
                    </div>
                  </div>
                </div>
                {/* <!-- End Panel --> */}
              </div>
              <div className="col-xl-9 col-md-8      px-0">
                {/* <!-- Panel --> */}
                <div className="panel form-panel">
                  <div className="panel-body main-body">
                    {/* <div className="tab-content"> */}
                    {this.state.activeTab === "tabGeral" &&
                      <div className=" tab-pane animation-fade active" >
                        <CmpGeral ItemCode={this.props.itemcode}
                          Item={this.state.newItem}
                          AlternateCatNum={this.state.AlternateCatNum}
                          ReadOnly={this.state.ReadOnly}></CmpGeral>
                      </div>
                    }
                    {this.state.activeTab === "tabVendas" &&
                      <div className=" animation-fade">
                        <CmpVendas ItemCode={this.props.itemcode} ReadOnly={this.state.ReadOnly}></CmpVendas>
                      </div>
                    }
                    {this.state.activeTab === "tabCompras" &&
                      <div className=" animation-fade">
                        <CmpCompras ItemCode={this.props.itemcode} ReadOnly={this.state.ReadOnly}></CmpCompras>
                      </div>
                    }
                    {this.state.activeTab === "tabInventario" &&
                      <div className=" animation-fade" >
                        <CmpStock ItemCode={this.props.itemcode} ReadOnly={this.state.ReadOnly}></CmpStock>
                      </div>
                    }
                    {this.state.activeTab === "tabTransInv" &&
                      <div className=" animation-fade" >
                        <CmpTransStock ItemCode={this.props.itemcode} ReadOnly={this.state.ReadOnly}></CmpTransStock>
                      </div>
                    }

                    {/* </div> */}
                  </div>
                </div>
                {/* <!-- End Panel --> */}
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    );
  }
}

export default EditModal;
