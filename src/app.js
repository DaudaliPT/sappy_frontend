import React, { Component } from "react";
import { Router, Route, IndexRoute, hashHistory } from "react-router";
// Containers
import Full from "./containers/Full/";
import Simple from "./containers/Simple/";

import Inicio from "./views/Inicio/";
// import UnderConstruction from "./views/UnderConstruction/";
import LandingPages from "./views/LandingPages";
import Login from "./views/Auth/Login/";
import ForgotPassword from "./views/Auth/ForgotPassword/";
import Documents from "./views/Documents/";


import safeJsonStringify from "safe-json-stringify";
import { Popover, PopoverContent } from 'reactstrap';
import axios from "axios";
import swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.css';
swal.setDefaults({
  reverseButtons: true,
  allowOutsideClick: false,
  buttonsStyling: false
})

var ReactToastr = require("react-toastr");
var { ToastContainer, ToastMessage } = ReactToastr;
const ToastMessageFactory = React.createFactory(ToastMessage.animation);

var sappy = window.sappy;
var $ = window.$;





sappy.app = {
  menus: [
    { name: "home", text: "", icon: "icon fa-home", component: Inicio },
    // 2\. Vendas (2.1 Encomendas, 2.2 Entrega, 2.3 Devolução, 2.4 Fatura de cliente, 2.5 NC de cliente, 2.6 Promoções)
    {
      name: "vnd",
      text: "Vendas",
      icon: "icon fa-shopping-cart",
      menus: [
        { name: "ordr", component: LandingPages.Documentos.ordr, text: "Encomendas" },
        { name: "odln", component: LandingPages.Documentos.odln, text: "Entregas" },
        { name: "ordn", component: LandingPages.Documentos.ordn, text: "Devoluções" },
        { name: "oinv", component: LandingPages.Documentos.oinv, text: "Faturas" },
        { name: "orin", component: LandingPages.Documentos.orin, text: "Notas de Crédito" },
        { name: "ordr/doc", component: Documents.Ordr, dontCreateMenu: true, text: "Doc" },
        { name: "odln/doc", component: Documents.Odln, dontCreateMenu: true, text: "Doc" },
        { name: "ordn/doc", component: Documents.Ordn, dontCreateMenu: true, text: "Doc" },
        { name: "oinv/doc", component: Documents.Oinv, dontCreateMenu: true, text: "Doc" },
        { name: "orin/doc", component: Documents.Orin, dontCreateMenu: true, text: "Doc" }

        // { name: "promo", component: UnderConstruction, text: "Promoções" }
      ]
    },
    // 3\. Compras (3.1 Encomendas, 3.2 Receção mercadoria, 3.3 Devolução, 3.4 Fatura de fornecedor, 3.5 NC de fornecedor, 3.6 Contratos de compra)
    {
      name: "cmp",
      text: "Compras",
      icon: "icon fa-truck",
      menus: [
        { name: "opor", component: LandingPages.Documentos.opor, text: "Encomendas" },
        { name: "opdn", component: LandingPages.Documentos.opdn, text: "Receções" },
        { name: "orpd", component: LandingPages.Documentos.orpd, text: "Devoluções" },
        { name: "opch", component: LandingPages.Documentos.opch, text: "Faturas" },
        { name: "orpc", component: LandingPages.Documentos.orpc, text: "Notas de Crédito" },
        { name: "opor/doc", component: Documents.Opor, dontCreateMenu: true, text: "Doc" },
        { name: "opdn/doc", component: Documents.Opdn, dontCreateMenu: true, text: "Doc" },
        { name: "orpd/doc", component: Documents.Orpd, dontCreateMenu: true, text: "Doc" },
        { name: "opch/doc", component: Documents.Opch, dontCreateMenu: true, text: "Doc" },
        { name: "orpc/doc", component: Documents.Orpc, dontCreateMenu: true, text: "Doc" }

        // { name: "contratos", component: UnderConstruction, text: "Contratos de compra" }
      ]
    },
    // 4\. Parceiros (4.1 Gestão de parceiros, 4.2 Contatos)
    // {
    //   name: "pn",
    //   text: "Parceiros",
    //   icon: "icon fa-group",
    //   menus: [
    //     { name: "main", text: "Gestão de Parceiros", component: UnderConstruction },
    //     { name: "contatos", text: "Contatos", component: UnderConstruction }
    //   ]
    // },
    // 5\. Inventário (5.1 Gestão de artigos, 5.2 Gestão de preços, 5.3 Gestão de preços via doc, 5.4 Entradas e saídas, 5.5 Transferências, 5.6 Contagem de inventário, 5.7 Etiquetas de artigos, 5.8 Artigos por Fornecedor)
    {
      name: "inv",
      text: "Inventário",
      icon: "icon fa-barcode",
      menus: [
        { name: "oitm", text: "Artigos", component: LandingPages.Produtos },
        { name: "prices", text: "Preços", component: LandingPages.Precos },
        { name: "etiq", text: "Etiquetas", component: LandingPages.Etiquetas },
        { name: "oitm/:itemcode", text: "Artigos Edit", component: LandingPages.Produtos.EditPage, dontCreateMenu: true },
        { name: "prices/doc", text: "Route->Abrir new doc atualização preços", component: LandingPages.Precos.Doc, dontCreateMenu: true },
        // { name: "prices/doc/:id", text: "Route->Abrir doc atualização preços", component: LandingPages.Precos.Doc, dontCreateMenu: true },
        { name: "etiq/doc", text: "Route->Abrir new doc etiq", component: LandingPages.Etiquetas.Doc, dontCreateMenu: true },
        { name: "etiq/doc/:id", text: "Route->Abrir doc etiq", component: LandingPages.Etiquetas.Doc, dontCreateMenu: true }
        // { name: "transacoes", text: "Entradas e saídas", component: UnderConstruction },
        // { name: "transfstk", text: "Transferências", component: UnderConstruction },
        // { name: "cntinv", text: "Contagem de inventário", component: UnderConstruction },
        // { name: "artforn", text: "Artigos por fornecedor", component: UnderConstruction }
      ]
    },
    // 6\. Financeiro (6.1 Caixa central, 6.2 Recebimentos, 6.3 Pagamentos, 6.4 Carteira de cheques)
    {
      name: "fin",
      text: "Financeiro",
      icon: "icon fa-money",
      menus: [
        { name: "caixa", text: "Caixa central", component: LandingPages.CaixaCentral },
        // { name: "rec", text: "Recebimentos", component: LandingPages.Recebimentos },
        // { name: "rec/doc", text: "Recebimentos", component: LandingPages.Recebimentos, dontCreateMenu: true },
        // { name: "pagamentos", text: "Pagamentos", component: UnderConstruction },
        // { name: "cartcheques", text: "Carteira de cheques", component: UnderConstruction }
      ]
    },
    //7\. Relatorios
    {
      name: "rpt",
      text: "Relatórios",
      icon: "icon fa-print",
      component: LandingPages.Reports
    }
  ]
};

var processMenuFullName = (fathername, menus) => {
  menus.forEach(menu => {
    menu.fullName = (fathername || "") + "/" + menu.name;
    if (menu.menus) {
      // processar submenus
      processMenuFullName(menu.fullName, menu.menus);
    } else {
      menu.to = menu.to || menu.fullName;
    }
  });
};
processMenuFullName(null, sappy.app.menus);



class App extends Component {
  constructor(props) {
    super(props);
    this.requireAuth = this.requireAuth.bind(this);

    sappy.showModal = this.showModal.bind(this);
    sappy.hideModal = this.hideModal.bind(this);

    sappy.GetLinkTo = this.GetLinkTo.bind(this);
    sappy.LinkTo = this.LinkTo.bind(this);

    sappy.showSuccess = this.showSuccess.bind(this);
    sappy.showQuestion = this.showQuestion.bind(this);
    sappy.showWarning = this.showWarning.bind(this);
    sappy.showDanger = this.showDanger.bind(this);
    sappy.showError = this.showError.bind(this);

    sappy.showPopover = this.showPopover.bind(this);
    sappy.hidePopover = this.hidePopover.bind(this);

    sappy.showToastr = this.showToastr.bind(this);
    sappy.clearToastr = this.clearToastr.bind(this);
    sappy.showWaitProgress = this.showWaitProgress.bind(this);
    sappy.hideWaitProgress = this.hideWaitProgress.bind(this);




    this.routes = [<IndexRoute component={Inicio} />];
    var processMenuLevel = menus => {
      menus.forEach(menu => {
        if (menu.menus) {
          processMenuLevel(menu.menus);
        } else if (menu.component) {
          this.routes.push(<Route key={"route_" + menu.fullName} path={menu.fullName} name={menu.fullName} component={menu.component} />);
        }
      });
    };
    processMenuLevel(sappy.app.menus);
    this.state = {
      currentAppModal: null,
      currentProgressModal: null,
      currentPopover: null
    }
  }

  requireAuth(nextState, replace, callback) {
    let sessionInfo = sappy.sessionInfo || {}
    var user = sessionInfo.user || {};
    if (user.NAME) {
      callback();
    } else {
      hashHistory.push("/login");
    }
  }


  GetLinkUrl(objType, docEntry) {
    if (!objType) return ""
    if (!docEntry) return ""
    let url = "";
    if (objType.toString() === '13') url = 'vnd/oinv/doc'
    if (objType.toString() === '14') url = 'vnd/orin/doc'
    if (objType.toString() === '15') url = 'vnd/odln/doc'
    if (objType.toString() === '16') url = 'vnd/ordn/doc'
    if (objType.toString() === '17') url = 'vnd/ordr/doc'

    if (objType.toString() === '18') url = 'cmp/opch/doc'
    if (objType.toString() === '19') url = 'cmp/orpc/doc'
    if (objType.toString() === '20') url = 'cmp/opdn/doc'
    if (objType.toString() === '21') url = 'cmp/orpd/doc'
    if (objType.toString() === '22') url = 'cmp/opor/doc'

    return url
  }
  GetLinkTo(objType, docEntry) {
    let url = this.GetLinkUrl(objType, docEntry)
    if (!url) return <span><i className="icon fa-arrow-circle-right disabled" aria-hidden="true" />{' '} </span>
    return <span><i className="icon fa-arrow-circle-right" aria-hidden="true"
      onClick={e => sappy.LinkTo(objType, docEntry)} />{' '}
    </span>
  }

  LinkTo(objType, docEntry) {
    let url = this.GetLinkUrl(objType, docEntry)
    if (!url) return
    sappy.hideModal()
    hashHistory.push({ pathname: url, state: { DocEntry: docEntry } })
  }

  showModal(modal) {
    this.setState({ currentAppModal: modal })
  }

  hideModal() {
    this.setState({ currentAppModal: null })
  }
  hidePopover() {
    if (this.hoverTimeOutHandle) clearTimeout(this.hoverTimeOutHandle);
    this.setState({ currentPopover: null })
  }

  showPopover({ target, api, render, renderContext, placement }) {
    let that = this;
    sappy.hidePopover();

    this.hoverTimeOutHandle = setTimeout(function () {
      if (that.hoverServerRequest && that.hoverServerRequest.abort) that.hoverServerRequest.abort();
      that.hoverServerRequest = axios({ method: "get", url: api })
        .then(result => {
          let content = render({ result, context: renderContext })

          let $le = $("#" + target);
          if ($le.length === 0) return console.log("popover ignored because element does not exists anymore")


          that.setState({
            currentPopover:
            <Popover isOpen={true} target={target} toggle={this.togglePopover} placement={placement || "left"} onMouseLeave={sappy.hidePopover} >
              <PopoverContent>{content}</PopoverContent>
            </Popover >
          })

        })
        .catch(error => sappy.showError(error, "Erro ao obter dados"));
    }, 300);
  }

  showWaitProgress(msg) {
    swal(
      {
        html: `<div class="example-loading example-well h-150 vertical-align text-center">
                <div class="loader vertical-align-middle loader-tadpole" />
              </div>
              <h4>${msg || ""}</h4>`,
        showCancelButton: false,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false
      })
  }

  hideWaitProgress(msg) {
    // this.setState({ currentProgressModal: null })
    swal.isVisible() && swal.closeModal();
  }

  showSuccess({ title, msg, moreInfo, onConfirm, onCancel, confirmText, confirmStyle, cancelText, cancelStyle } = {}) {
    swal(
      {
        title: title || "Successo",
        html: `${msg || ""}<small><br />${moreInfo || ''}</small>`,
        type: 'success',
        showCancelButton: typeof onCancel === "function",
        confirmButtonText: confirmText || "Confirmar",
        cancelButtonText: cancelText || 'Cancelar',
        cancelButtonClass: 'btn  mr-5 btn-lg btn-' + (cancelStyle || "secondary"),
        confirmButtonClass: 'btn ml-5 btn-lg btn-' + (confirmStyle || "success")
      })
      .then(() => onConfirm && onConfirm()
      , dismiss => onCancel && onCancel())
  }

  showQuestion({ title, msg, moreInfo, onConfirm, onCancel, confirmText, confirmStyle, cancelText, cancelStyle } = {}) {
    swal(
      {
        title: title || "Questão",
        html: `${msg || ""}<small><br />${moreInfo || ''}</small>`,
        type: 'question',
        showCancelButton: typeof onCancel === "function",
        confirmButtonText: confirmText || "Confirmar",
        cancelButtonText: cancelText || 'Cancelar',
        cancelButtonClass: 'btn  mr-5 btn-lg btn-' + (cancelStyle || "secondary"),
        confirmButtonClass: 'btn ml-5 btn-lg btn-' + (confirmStyle || "success")
      })
      .then(() => onConfirm && onConfirm()
      , dismiss => onCancel && onCancel())
  }


  showWarning({ title, msg, moreInfo, onConfirm, onCancel, confirmText, confirmStyle, cancelText, cancelStyle } = {}) {
    swal(
      {
        title: title || "Aviso",
        html: `${msg || ""}<small><br />${moreInfo || ''}</small>`,
        type: 'warning',
        showCancelButton: typeof onCancel === "function",
        confirmButtonText: confirmText || "Ok",
        cancelButtonText: cancelText || 'Cancelar',
        cancelButtonClass: 'btn  mr-5 btn-lg btn-' + (cancelStyle || "secondary"),
        confirmButtonClass: 'btn ml-5 btn-lg btn-' + (confirmStyle || "warning")
      })
      .then(() => onConfirm && onConfirm()
      , dismiss => onCancel && onCancel())
  }

  showDanger({ title, msg, moreInfo, onConfirm, onCancel, confirmText, confirmStyle, cancelText, cancelStyle } = {}) {
    swal(
      {
        title: title || "Muita atenção!!!",
        html: `${msg || ""}<small><br />${moreInfo || ''}</small>`,
        type: 'warning',
        showCancelButton: typeof onCancel === "function",
        confirmButtonText: confirmText || "Confirmar",
        cancelButtonText: cancelText || 'Cancelar',
        cancelButtonClass: 'btn  mr-5 btn-lg btn-' + (cancelStyle || "secondary"),
        confirmButtonClass: 'btn ml-5 btn-lg btn-' + (confirmStyle || "danger")
      })
      .then(() => onConfirm && onConfirm()
      , dismiss => onCancel && onCancel())
  }


  showError(err, title, onConfirm) {
    err = err || {}
    console.error(title, err)
    // let that = this;
    let moreInfo = '';
    let msg = ""
    if (err.message) msg = err.message;
    if (err.response) {
      let res = err.response;
      if (res.data && res.data.message) msg += ", " + res.data.message;
      if (res.data && res.data.moreInfo) moreInfo = res.data.moreInfo;

      if (res.status >= 400) {
        if (res.data && res.data.error) moreInfo = res.data.error;
        if (typeof res.data === "string") moreInfo = res.data;
        if (res.request) moreInfo += " " + res.request.responseURL;
      }
    }

    if (!msg) msg = safeJsonStringify(err);


    swal(
      {
        title: title || "Erro",
        html: `${msg || ""}<small><br />${moreInfo || ""}</small>`,
        type: 'error',
        confirmButtonClass: 'btn btn-danger'
      })
      .then(() => onConfirm && onConfirm())
  }

  showToastr(objPars = {}) {
    let color = objPars.color;
    let msg = objPars.msg;
    if (typeof objPars === "string") {
      color = objPars.split('|')[0];
      msg = objPars.split('|')[1];
    }

    let toastrContainer = this.refs.container;
    setTimeout(e => {
      if (color === "success") toastrContainer.success(msg, "", { closeButton: true })
      else if (color === "info") toastrContainer.info(msg, "", { closeButton: true })
      else if (color === "warning") toastrContainer.warning(msg, "", { closeButton: true })
      else if (color === "danger") toastrContainer.error(msg, "", { closeButton: true })
      else toastrContainer.error(msg, "", { closeButton: true })
    }, 0);
  }

  clearToastr() {
    this.refs.container.clear();
  }


  render() {
    return (
      <div>
        <Router history={hashHistory}>
          <Route path="/" name="Main" component={Full} children={this.routes} onEnter={this.requireAuth} />
          <Route path="/" name="Login" component={Simple}>
            <IndexRoute component={Login} />
            <Route path="/login" name="." component={Login} />
            <Route path="/forgotpass" name="ForgotPassword" component={ForgotPassword} />
          </Route>
        </Router>

        <ToastContainer
          toastMessageFactory={ToastMessageFactory}
          ref="container"
          preventDuplicates={true}
          className="toast-top-right"
        />
        {this.state.currentAppModal}
        {this.state.currentProgressModal}
        {this.state.currentPopover}

      </div>
    );
  }
}
export default App;
