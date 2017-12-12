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
import { hashHistory } from "react-router";
import { setImmediate } from "timers";

class GlobalSearchModal extends Component {
  constructor(props) {
    super(props);

    this.handleOnMainTabSelect = this.handleOnMainTabSelect.bind(this);
    this.handleOnChange_txtSearch = this.handleOnChange_txtSearch.bind(this);

    this.tabs = {
      artigos: { name: "Artigos", searchApiUrl: "/api/prod/" },
      parceiros: { name: "Parceiros", searchApiUrl: "/api/pns/" },
      vendas: { name: "Vendas", searchApiUrl: "/api/prod/" },
      compras: { name: "Compras", searchApiUrl: "/api/prod/" },
      recebimentos: { name: "Recebimentos", searchApiUrl: "/api/prod/" },
      pagamentos: { name: "Pagamentos", searchApiUrl: "/api/prod/" },
      cheques: { name: "Cheques", searchApiUrl: "/api/prod/" },
      inventario: { name: "Inventario", searchApiUrl: "/api/prod/" }
    };

    this.state = {
      loading: true,
      activeTab: "artigos",
      mainSearchTags: [] /** holds the text typed by the user */
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
    let tab = e.target.id;
    this.setState({ activeTab: tab }, this.calcPageHeight());
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

  render() {
    let mainSearchTags = this.state.mainSearchTags;

    let renderTabs = () => {
      let tabs = [];
      let activeTab = this.state.activeTab;

      Object.keys(this.tabs).forEach(tab => {
        let thisTab = this.tabs[tab] || {};
        let clss = "list-group-item list-group-item-action";
        if (tab === activeTab) clss += " active";
        let tabContent = (
          <a className={clss} data-toggle="tab" role="tab" key={"tab" + tab} id={tab} onClick={this.handleOnMainTabSelect}>
            {thisTab.name}
          </a>
        );
        /* <span className="badge badge-pill badge-default float-right">{this.state.artigos}</span> */
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

        if (tab === "artigos") tabContent = <CmpArtigos {...thisTab} />;
        else if (tab === "parceiros") tabContent = <CmpParceiros {...thisTab} />;
        else if (tab === "compras") tabContent = <CmpCompras {...thisTab} />;
        else tabContent = <CmpArtigos {...thisTab} />;

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
        <ModalHeader>
          <div id="global-search">
            <SearchBar onChange={this.handleOnChange_txtSearch} onClickClear={sappy.hideModal} searchTags={this.state.mainSearchTags} />
          </div>
        </ModalHeader>
        {mainSearchTags.length === 0 && "Introduza o que deseja pesquisar"}
        {mainSearchTags.length > 0 &&
          <ModalBody>
            <div className="row">
              <div className="col-xxl-3 col-md-4   pr-15 pr-md-0">
                <div className="panel" style={{ minHeight: "100%" }}>
                  <div className="panel-body">
                    <div className="list-group faq-list" role="tablist">
                      {renderTabs()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xxl-9 col-md-8   ">
                <div className="panel form-panel">
                  <div className="panel-body main-body">
                    {renderTabContent()}
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>}
        <ModalFooter />
      </Modal>
    );
  }
}

export default GlobalSearchModal;
