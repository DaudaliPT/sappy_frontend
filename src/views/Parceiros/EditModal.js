import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import axios from "axios";
var $ = window.$;
var sappy = window.sappy;

import CmpGeral from "./CmpGeral";
import CmpVendas from "./CmpVendas";
import CmpCompras from "./CmpCompras";
import { hashHistory } from "react-router";

class EditModal extends Component {
  constructor(props) {
    super(props);

    this.handleOnTabClick = this.handleOnTabClick.bind(this);
    this.onMoveTo = this.onMoveTo.bind(this);
    this.onOpenEditPage = this.onOpenEditPage.bind(this);
    this.loadProduto = this.loadProduto.bind(this);
    this.onTogleAllowEdit = this.onTogleAllowEdit.bind(this);

    this.state = {
      NewItem: { CardCode: props.cardCode },
      ReadOnly: true,
      loading: true,
      activeTab: "tabGeral"
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.calcPageHeight);

    this.calcPageHeight();
    setTimeout(this.loadProduto(this.props.cardCode), 1);
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
    if (this.props.cardCode !== nextProps.cardCode) this.loadProduto(nextProps.cardCode);
  }

  onTogleAllowEdit(e) {
    return sappy.showToastr({ color: "warning", msg: "Alteração ainda não disponivel" });
    // this.setState({ ReadOnly: !this.state.ReadOnly });
  }

  loadProduto(cardCode) {
    let that = this;

    this.setState({ loading: true });
    this.serverRequest = axios({
      method: "get",
      url: "api/pns/item/" + cardCode
    })
      .then(result => {
        let { Item, AlternateCatNum, BPAddresses } = result.data;

        //Preparar as propriedades
        let Propriedades = [];
        for (var index = 1; index < 65; index++) {
          var propertyName = "Properties" + index;
          let propertyValue = Item[propertyName] === "tYES";
          if (propertyValue) Propriedades.push(index.toString());
        }

        //preparar supplierCollection
        let supplierCollection = [
          {
            CardCode: Item.Mainsupplier,
            Substitute: Item.SupplierCatalogNo
          }
        ];
        AlternateCatNum.forEach(obj => {
          if (obj.CardCode !== Item.Mainsupplier) {
            supplierCollection.push({
              CardCode: obj.CardCode,
              Substitute: obj.Substitute
            });
          }
        });

        that.setState({
          loading: false,
          newItem: Item,
          numberOfBarCodes: Item.ItemBarCodeCollection.length,
          Propriedades,
          supplierCollection,
          BPAddresses,
          showFabricante: Item.Mainsupplier === "F0585" /*UNAPOR*/,
          U_rsaMargem: Item.U_rsaMargem,
          PrecoCash: Item.ItemPrices && Item.ItemPrices.length > 0 && Item.ItemPrices[0].Price
        });
      })
      .catch(error => {
        this.setState({ saving: false }, sappy.showError(error, "Erro ao obter dados"));
      });
  }

  onMoveTo(nextORprevious) {
    let that = this;
    this.serverRequest = axios({
      method: "get",
      url: `api/pns/info/${this.props.cardCode}/${nextORprevious}`
    })
      .then(result => {
        if (result.data) that.setState({ ReadOnly: true }, hashHistory.push("/pns/ocrd/" + result.data));
      })
      .catch(error => sappy.showError(error, "Erro ao obter dados"));
  }

  onOpenEditPage(nextORprevious) {
    this.props.toggleModal();
    hashHistory.push("/pns/ocrd/" + this.props.cardCode);
  }

  handleOnTabClick(e) {
    e.preventDefault();
    let tab = e.target.id;
    this.setState({ activeTab: tab });
  }

  render() {
    let newItem = this.state.newItem || {};

    return (
      <Modal isOpen={true} className={"modal-lg modal-success"}>
        <ModalHeader toggle={this.props.toggleModal}>
          {this.state.loading ? "..." : newItem.CardName + " (" + newItem.CardCode + ")"}
        </ModalHeader>
        <ModalBody>
          <div className="container">
            <div className="row">
              <div className="col">
                <span className="float-right">
                  {this.state.ReadOnly &&
                    this.state.activeTab === "tabGeral" &&
                    <Button outline className="btn-sm btn-flat" onClick={this.onTogleAllowEdit}>
                      <i className="icon wb-edit" />
                      <span className="hidden-sm-down"> Alterar</span>
                    </Button>}
                  {!this.state.ReadOnly &&
                    this.state.activeTab === "tabGeral" &&
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
                      <a className="list-group-item list-group-item-action active" data-toggle="tab" role="tab" id="tabGeral" onClick={this.handleOnTabClick}>
                        Geral{" "}
                      </a>
                      <a className="list-group-item" data-toggle="tab" role="tab" id="tabVendas" onClick={this.handleOnTabClick}>
                        Vendas
                      </a>
                      <a className="list-group-item" data-toggle="tab" role="tab" id="tabCompras" onClick={this.handleOnTabClick}>
                        Compras
                      </a>
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
                      <div className=" tab-pane animDISABELDation-fade active">
                        <CmpGeral CardCode={this.props.cardCode} Item={this.state.newItem} BPAddresses={this.state.BPAddresses} ReadOnly={this.state.ReadOnly} />
                      </div>}
                    {this.state.activeTab === "tabVendas" &&
                      <div className=" animatDISABELDion-fade">
                        <CmpVendas CardCode={this.props.cardCode} ReadOnly={this.state.ReadOnly} />
                      </div>}
                    {this.state.activeTab === "tabCompras" &&
                      <div className=" animatiDISABELDon-fade">
                        <CmpCompras CardCode={this.props.cardCode} ReadOnly={this.state.ReadOnly} />
                      </div>}

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
