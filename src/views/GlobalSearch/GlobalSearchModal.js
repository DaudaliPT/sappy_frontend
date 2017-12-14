import React, { Component } from "react";
import { Badge } from "reactstrap";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import axios from "axios";
var $ = window.$;
var sappy = window.sappy;

import SearchBar from "../../components/SearchBar";
import CmpArtigos from "./CmpArtigos";
import CmpParceiros from "./CmpParceiros";
import CmpCompras from "./CmpCompras";
import CmpVendas from "./CmpVendas";
import CmpRecebimentos from "./CmpRecebimentos";
import CmpInventario from "./CmpInventario";
import CmpPagamentos from "./CmpPagamentos";
import { hashHistory } from "react-router";
import { setImmediate } from "timers";

class GlobalSearchModal extends Component {
  constructor(props) {
    super(props);

    this.handleOnMainTabSelect = this.handleOnMainTabSelect.bind(this);
    this.handleOnChange_txtSearch = this.handleOnChange_txtSearch.bind(this);
    this.handleTabStatusUpdate = this.handleTabStatusUpdate.bind(this);

    this.tabs = {
      artigos: { name: "Artigos", searchApiUrl: "/api/prod/" },
      parceiros: { name: "Parceiros", searchApiUrl: "/api/pns/" },
      vendas: { name: "Vendas", searchApiUrl: "/api/search/vendas/" },
      compras: { name: "Compras", searchApiUrl: "/api/search/compras" },
      recebimentos: { name: "Recebimentos", searchApiUrl: "/api/search/recebimentos/" },
      pagamentos: { name: "Pagamentos", searchApiUrl: "/api/search/pagamentos/" },
      cheques: { name: "Cheques", searchApiUrl: "/api/prod/" },
      inventario: { name: "Inventario", searchApiUrl: "/api/search/inventario/" }
    };

    this.state = {
      loading: true,
      activeTab: "artigos",
      mainSearchTags: [] /** holds the text typed by the user */,
      artigos: { Total: 0, Loaded: 0, Searching: true },
      parceiros: { Total: 0, Loaded: 0, Searching: true },
      vendas: { Total: 0, Loaded: 0, Searching: true },
      compras: { Total: 0, Loaded: 0, Searching: true },
      recebimentos: { Total: 0, Loaded: 0, Searching: true },
      pagamentos: { Total: 0, Loaded: 0, Searching: true },
      cheques: { Total: 0, Loaded: 0, Searching: true },
      inventario: { Total: 0, Loaded: 0, Searching: true }
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.calcPageHeight);

    this.calcPageHeight();
  }

  calcPageHeight() {
    setImmediate(() => {
      let $el = $(".main-body");

      let $scrollAbleparent = $("body");
      if ($scrollAbleparent && $el && $el.length > 0) {
        let minH = $scrollAbleparent.height() - $el.position().top - 170;
        $el.css("height", minH.toString() + "px");
      }
    });
  }

  componentWillUnmount() {
    if (this.serverRequest && this.serverRequest.abort) this.serverRequest.abort();
    window.removeEventListener("resize", this.calcPageHeight);
  }

  handleOnMainTabSelect(e) {
    e.preventDefault();
    let t = e.target;
    let tab = t.id;
    if (tab === "") tab = t.parentElement.id;
    this.setState({ activeTab: tab }, this.calcPageHeight);
  }

  handleOnChange_txtSearch(values) {
    var that = this;
    this.setState(
      {
        mainSearchTags: values
      },
      this.calcPageHeight()
    );
  }

  handleTabStatusUpdate(tab, totalInfo) {
    this.setState({ [tab]: totalInfo });
  }

  render() {
    let mainSearchTags = this.state.mainSearchTags;

    let renderTabs = () => {
      let tabs = [];
      let activeTab = this.state.activeTab;

      Object.keys(this.tabs).forEach(tab => {
        let thisTab = this.tabs[tab] || {};
        let thisTabStatus = this.state[tab] || {};
        let clss = "list-group-item list-group-item-action";
        if (tab === activeTab) clss += " active";

        let info = "";
        if (thisTabStatus.Searching) info = "...";
        else if (thisTabStatus.Loaded !== thisTabStatus.Total) info = thisTabStatus.Loaded + "/" + thisTabStatus.Total;
        else info = thisTabStatus.Total;

        let clssBadge = "badge badge-pill float-right";
        if (thisTabStatus.Searching) clssBadge += " badge-default";
        else clssBadge += " badge-success";

        let tabContent = (
          <a className={clss} data-toggle="tab" role="tab" key={"tab" + tab} id={tab} onClick={this.handleOnMainTabSelect}>
            {thisTab.name}
            <span className={clssBadge}>
              {info}
            </span>
          </a>
        );
        tabs.push(tabContent);
      });

      // <a className="list-group-item list-group-item-action active" data-toggle="tab" role="tab" id="artigos" onClick={this.handleOnMainTabSelect}>

      return tabs;
    };

    let renderTabContent = () => {
      let tabsContent = [];
      let activeTab = this.state.activeTab;

      Object.keys(this.tabs).forEach(tab => {
        let thisTab = this.tabs[tab] || {};
        let tabContent = null;
        thisTab.searchTags = mainSearchTags;
        thisTab.onTabStatusUpdate = this.handleTabStatusUpdate;

        if (tab === "artigos") tabContent = <CmpArtigos {...thisTab} />;
        else if (tab === "parceiros") tabContent = <CmpParceiros {...thisTab} />;
        else if (tab === "compras") tabContent = <CmpCompras {...thisTab} />;
        else if (tab === "vendas") tabContent = <CmpVendas {...thisTab} />;
        else if (tab === "recebimentos") tabContent = <CmpRecebimentos {...thisTab} />;
        else if (tab === "pagamentos") tabContent = <CmpPagamentos {...thisTab} />;
        else if (tab === "inventario") tabContent = <CmpInventario {...thisTab} />;
        // else tabContent = <CmpArtigos {...thisTab} />;

        let isVisibleClass = activeTab === tab ? "" : "hidden-xxl-down";

        tabsContent.push(
          <div key={tab} className={isVisibleClass}>
            {tabContent}
          </div>
        );
      });

      return tabsContent;
    };

    return (
      <Modal isOpen={true} className={"modal-lg modal-search"}>
        <div className="block" style={{ margin: "15px", marginTop: "-5px" }}>
          <SearchBar onChange={this.handleOnChange_txtSearch} onClickClear={sappy.hideModal} searchTags={this.state.mainSearchTags} ShowTotalInfo={false} />
        </div>
        {mainSearchTags.length > 0 &&
          <div className="block " style={{ margin: "15px", marginTop: "0px" }}>
            <div className="row">
              <div className="col-xxl-3 col-md-3   pr-15 pr-md-0">
                <div className="panel" style={{ minHeight: "100%" }}>
                  <div className="panel-body">
                    <div className="list-group faq-list" role="tablist">
                      {renderTabs()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xxl-9 col-md-9   ">
                <div className="panel form-panel">
                  <div className="panel-body main-body">
                    {renderTabContent()}
                  </div>
                </div>
              </div>
            </div>
          </div>}
        {/* <ModalFooter /> */}
      </Modal>
    );
  }
}

export default GlobalSearchModal;
