import React, { Component } from "react";
import { Button } from "reactstrap";
import axios from "axios";
var $ = window.$;
var byUs = window.byUs;

import CmpClassificacao from "./CmpClassificacao";
import CmpUnderConstruction from "./CmpUnderConstruction";
import { hashHistory } from "react-router";


class CaixaCentral extends Component {
  constructor(props) {
    super(props);

    this.toggleModalMessage = this.toggleModalMessage.bind(this);
    this.handleOnTabClick = this.handleOnTabClick.bind(this);
    this.onMoveTo = this.onMoveTo.bind(this);
    this.loadProduto = this.loadProduto.bind(this)
    this.onTogleAllowEdit = this.onTogleAllowEdit.bind(this);

    this.state = {
      ReadOnly: true,
      loading: true,
      activeTab: "tabClassificacao"
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.calcPageHeight);

    this.calcPageHeight();
    // setTimeout(this.loadProduto(this.props.params.itemcode), 1);
  }

  calcPageHeight() {
    let $el = $(".main-body");

    let $scrollAbleparent = $("body");
    if ($scrollAbleparent && $el) {
      let minH = $scrollAbleparent.height() - $el.position().top - 100;
      $el.css("height", minH.toString() + "px");
    }
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
    this.setState({ ReadOnly: !this.state.ReadOnly })
  }

  loadProduto(itemcode) {
    let that = this;

    this.setState({ loading: true });

    this.serverRequest = axios({
      method: "get",
      url: "api/caixa/item/" + itemcode
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
      url: `api/caixa/info/${this.props.params.itemcode}/${nextORprevious}`
    })
      .then(result => {
        if (result.data)
          that.setState({ ReadOnly: true }, hashHistory.push("/inv/oitm/" + result.data));
      })
      .catch(error => byUs.showError(error, "Não foi possível navegar para anterior"));
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
                Caixa Central
              </p>
            </div>
            <div className="col-md-3    px-md-15 px-0">
              <div className="byus-action-bar animation-slide-left">
                {this.state.ReadOnly && this.state.activeTab === "tabClassificacao" &&
                  <Button outline className="btn-md btn-flat" onClick={this.onTogleAllowEdit}>
                    <i className="icon wb-edit" />
                    <span className="hidden-sm-down"> Alterar</span>
                  </Button>}
                {!this.state.ReadOnly && this.state.activeTab === "tabClassificacao" &&
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
            <div className="col-xl-3 col-md-4    px-md-15 px-0">
              {/* <!-- Panel --> */}
              <div className="panel">
                <div className="panel-body ">
                  <div className="list-group faq-list" role="tablist">
                    <a className="list-group-item list-group-item-action active" data-toggle="tab" role="tab"
                      id="tabClassificacao" onClick={this.handleOnTabClick}>Classificação </a>
                    <a className="list-group-item" data-toggle="tab" role="tab"
                      id="tabPendentes" onClick={this.handleOnTabClick}>Pendentes</a>
                    <a className="list-group-item" data-toggle="tab" role="tab"
                      id="tabDistribuicao" onClick={this.handleOnTabClick}>Distribuição</a>
                    <a className="list-group-item" data-toggle="tab" role="tab"
                      id="tabDespesas" onClick={this.handleOnTabClick}>Despesas</a>
                    <a className="list-group-item" data-toggle="tab" role="tab"
                      id="tabDepositos" onClick={this.handleOnTabClick}>Depósitos</a>
                    <a className="list-group-item" data-toggle="tab" role="tab"
                      id="tabResumo" onClick={this.handleOnTabClick}>Resumo</a>
                  </div>
                </div>
              </div>
              {/* <!-- End Panel --> */}
            </div>
            <div className="col-xl-9 col-md-8     px-md-15 px-0">
              {/* <!-- Panel --> */}
              <div className="panel form-panel">
                <div className="panel-body main-body">
                  {/* <div className="tab-content"> */}
                  {this.state.activeTab === "tabClassificacao" &&
                    <div className=" tab-pane animation-fade active" >
                      <CmpClassificacao ItemCode={this.props.params.itemcode}
                        Item={this.state.newItem}
                        AlternateCatNum={this.state.AlternateCatNum}
                        ReadOnly={this.state.ReadOnly}></CmpClassificacao>
                    </div>
                  }
                  {this.state.activeTab === "tabPendentes" &&
                    <div className=" animation-fade">
                      <CmpUnderConstruction ItemCode={this.props.params.itemcode} ReadOnly={this.state.ReadOnly}></CmpUnderConstruction>
                    </div>
                  }
                  {this.state.activeTab === "tabDistribuicao" &&
                    <div className=" animation-fade">
                      <CmpUnderConstruction ItemCode={this.props.params.itemcode} ReadOnly={this.state.ReadOnly}></CmpUnderConstruction>
                    </div>
                  }
                  {this.state.activeTab === "tabDespesas" &&
                    <div className=" animation-fade" >
                      <CmpUnderConstruction ItemCode={this.props.params.itemcode} ReadOnly={this.state.ReadOnly}></CmpUnderConstruction>
                    </div>
                  }
                  {this.state.activeTab === "tabDepositos" &&
                    <div className=" animation-fade" >
                      <CmpUnderConstruction ItemCode={this.props.params.itemcode} ReadOnly={this.state.ReadOnly}></CmpUnderConstruction>
                    </div>
                  }

                  {this.state.activeTab === "tabResumo" &&
                    <div className=" animation-fade" >
                      <CmpUnderConstruction ItemCode={this.props.params.itemcode} ReadOnly={this.state.ReadOnly}></CmpUnderConstruction>
                    </div>
                  }

                </div>
              </div>
              {/* <!-- End Panel --> */}
            </div>
          </div>
        </div>
      </div >)
  }
}

export default CaixaCentral;
