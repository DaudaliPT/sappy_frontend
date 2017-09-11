import React, { Component } from "react";
import { Button } from "reactstrap";
import axios from "axios";
var $ = window.$;
var byUs = window.byUs;

import CmpGeral from "./CmpGeral";
import CmpStock from "./CmpStock";
import CmpTransStock from "./CmpTransStock";
import CmpVendas from "./CmpVendas";
import CmpCompras from "./CmpCompras";
import { hashHistory } from "react-router";


class EditPage extends Component {
  constructor(props) {
    super(props);

    this.toggleModalMessage = this.toggleModalMessage.bind(this);
    this.handleOnTabClick = this.handleOnTabClick.bind(this);
    this.handleItemSaved = this.handleItemSaved.bind(this);
    this.onMoveTo = this.onMoveTo.bind(this);
    this.loadProduto = this.loadProduto.bind(this)
    this.onTogleAllowEdit = this.onTogleAllowEdit.bind(this);

    this.state = {
      ReadOnly: true,
      loading: true,
      activeTab: "tabGeral"
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.calcPageHeight);

    this.calcPageHeight();
    setTimeout(this.loadProduto(this.props.params.itemcode), 1);
  }

  calcPageHeight() {
    let $el = $(".main-body");

    let $scrollAbleparent = $("body");
    if ($scrollAbleparent && $el) {
      let minH = $scrollAbleparent.height() - $el.position().top - 100;
      $el.css("height", minH.toString() + "px");
    }
  }

  handleItemSaved() {
    let that = this;
    this.setState({
      ReadOnly: true,
      loading: true
    },
      this.loadProduto(that.props.params.itemcode)
    )
  }

  componentWillUnmount() {
    if (this.serverRequest && this.serverRequest.abort) this.serverRequest.abort();
    window.removeEventListener("resize", this.calcPageHeight);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.params.itemcode !== nextProps.params.itemcode) this.loadProduto(nextProps.params.itemcode);
  }

  toggleModalMessage(refresh) {
    this.setState({
      modalMessage: {}
    });
  }

  onTogleAllowEdit(e) {
    let newReadOnly = !this.state.ReadOnly;
    this.setState({ ReadOnly: newReadOnly })

    if (newReadOnly === false) {
      // MAKE THIS REQUEST SO THAT WHEN USER SAVES IS ALMOST CERTAIN THAT THER IS A VALID SESSION
      axios({
        method: "get",
        url: "api/prod/item/makeslready/" + this.props.params.itemcode
      })
        .then(result => {
          // IGNORE THE RESULT
          console.log("make sl ready")
        })
        .catch(error => {
          //only log to the console
          console.error("Não foi possível aceder á SL", error)
        })
    }
  }

  loadProduto(itemcode) {
    let that = this;

    this.setState({ loading: true });
    this.serverRequest = axios({
      method: "get",
      url: "api/prod/item/" + itemcode
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
        this.setState({ saving: false }, () => byUs.showError(error, "Não foi possível carregar produto"));
      })

  }

  onMoveTo(nextORprevious) {
    let that = this;
    this.serverRequest = axios({
      method: "get",
      url: `api/prod/info/${this.props.params.itemcode}/${nextORprevious}`
    })
      .then(result => {
        if (result.data)
          that.setState({ ReadOnly: true }, hashHistory.push("/inv/oitm/" + result.data));
      })
      .catch(error => byUs.showError(error, "Não foi possível navegar"));
  }

  handleOnTabClick(e) {
    e.preventDefault();
    let tab = e.target.id;
    this.setState({ activeTab: tab });
  }

  render() {
    let newItem = this.state.newItem || {}

    return (
      <div className="page">
        <div className="page-header container-fluid">
          <div className="row">
            <div className="col-md-9    px-md-15 px-0">
              <p className="page-title">
                {/* <img src={"api/prod/item/barcodepng/" + this.props.params.itemcode} alt={this.props.params.itemcode} style={{ height: "3rem", filter: "opacity(50%)" }} /> */}

                {this.state.loading ? '...' : (newItem.ItemName + ' (' + newItem.ItemCode + ')')}
              </p>
            </div>

            <div className="col-md-3    px-md-15 px-0">
              <div className="byus-action-bar animation-slide-left">

                {this.state.ReadOnly && this.state.activeTab === "tabGeral" &&
                  <Button outline className="btn-md btn-flat" onClick={this.onTogleAllowEdit}>
                    <i className="icon wb-edit" />
                    <span className="hidden-sm-down"> Alterar</span>
                  </Button>}
                {!this.state.ReadOnly && this.state.activeTab === "tabGeral" &&
                  <Button outline className="btn-md btn-flat" onClick={this.onTogleAllowEdit}>
                    <i className="icon wb-close" />
                    <span className="hidden-sm-down"> Alterar</span>
                  </Button>}
                <Button outline className="btn-md btn-flat" onClick={e => this.onMoveTo('previous')}>
                  <i className="icon wb-arrow-left" />
                  <span className="hidden-sm-down"> </span>
                </Button>
                <Button outline className="btn-md btn-flat" onClick={e => this.onMoveTo('next')}>
                  <i className="icon wb-arrow-right" />
                  <span className="hidden-sm-down"> </span>
                </Button>
              </div>
            </div>
          </div>

        </div>

        <div className="page-content container-fluid">
          <div className="row">
            <div className="col-xl-2 col-md-3    px-md-15 px-0">
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


            <div className="col-xl-10 col-md-9     px-md-15 px-0">
              {/* <!-- Panel --> */}
              <div className="panel form-panel">
                <div className="panel-body main-body">
                  {/* <div className="tab-content"> */}
                  {this.state.activeTab === "tabGeral" &&
                    <div className=" tab-pane animation-fade active" >
                      <CmpGeral ItemCode={this.props.params.itemcode}
                        Item={this.state.newItem}
                        onItemSaved={this.handleItemSaved}
                        supplierCollection={this.state.supplierCollection}
                        ReadOnly={this.state.ReadOnly}></CmpGeral>
                    </div>
                  }
                  {this.state.activeTab === "tabVendas" &&
                    <div className=" animation-fade">
                      <CmpVendas ItemCode={this.props.params.itemcode} ReadOnly={this.state.ReadOnly}></CmpVendas>
                    </div>
                  }
                  {this.state.activeTab === "tabCompras" &&
                    <div className=" animation-fade">
                      <CmpCompras ItemCode={this.props.params.itemcode} ReadOnly={this.state.ReadOnly}></CmpCompras>
                    </div>
                  }
                  {this.state.activeTab === "tabInventario" &&
                    <div className=" animation-fade" >
                      <CmpStock ItemCode={this.props.params.itemcode} ReadOnly={this.state.ReadOnly}></CmpStock>
                    </div>
                  }
                  {this.state.activeTab === "tabTransInv" &&
                    <div className=" animation-fade" >
                      <CmpTransStock ItemCode={this.props.params.itemcode} ReadOnly={this.state.ReadOnly}></CmpTransStock>
                    </div>
                  }

                  {/* </div> */}
                </div>
              </div>
              {/* <!-- End Panel --> */}
            </div>
          </div>
        </div>
      </div >)
  }
}

export default EditPage;
