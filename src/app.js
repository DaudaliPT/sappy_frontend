import React, { Component } from "react";
import { Router, Route, IndexRoute, hashHistory } from "react-router";
// Containers
import Full from "./containers/Full/";
import Simple from "./containers/Simple/";

import Inicio from "./views/Inicio/";
import Views from "./views";
import Login from "./views/Auth/Login/";
import ForgotPassword from "./views/Auth/ForgotPassword/";
import UnderConstruction from "./views/UnderConstruction/";

var sappy = window.sappy;
sappy.Views = Views // to allow debug
sappy.app = {
  menus: [
    { name: "home", text: "", icon: "icon fa-home", component: Inicio },
    // 2\. Vendas (2.1 Encomendas, 2.2 Entrega, 2.3 Devolução, 2.4 Fatura de cliente, 2.5 NC de cliente, 2.6 Promoções)
    {
      name: "vnd",
      text: "Vendas",
      icon: "icon fa-shopping-cart",
      menus: [
        { name: "oqut", component: Views.LandingPages.Documentos.oqut, text: "Cotações" },
        { name: "ordr", component: Views.LandingPages.Documentos.ordr, text: "Encomendas" },
        { name: "odln", component: Views.LandingPages.Documentos.odln, text: "Entregas" },
        { name: "ordn", component: Views.LandingPages.Documentos.ordn, text: "Devoluções" },
        { name: "oinv", component: Views.LandingPages.Documentos.oinv, text: "Faturas" },
        { name: "orin", component: Views.LandingPages.Documentos.orin, text: "Notas de Crédito" },
        { name: "oqut/doc", component: Views.Documents.Oqut, dontCreateMenu: true, text: "Doc" },
        { name: "ordr/doc", component: Views.Documents.Ordr, dontCreateMenu: true, text: "Doc" },
        { name: "odln/doc", component: Views.Documents.Odln, dontCreateMenu: true, text: "Doc" },
        { name: "ordn/doc", component: Views.Documents.Ordn, dontCreateMenu: true, text: "Doc" },
        { name: "oinv/doc", component: Views.Documents.Oinv, dontCreateMenu: true, text: "Doc" },
        { name: "orin/doc", component: Views.Documents.Orin, dontCreateMenu: true, text: "Doc" }

        // { name: "promo", component: UnderConstruction, text: "Promoções" }
      ]
    },
    // 3\. Compras (3.1 Encomendas, 3.2 Receção mercadoria, 3.3 Devolução, 3.4 Fatura de fornecedor, 3.5 NC de fornecedor, 3.6 Contratos de compra)
    {
      name: "cmp",
      text: "Compras",
      icon: "icon fa-truck",
      menus: [
        { name: "opor", component: Views.LandingPages.Documentos.opor, text: "Encomendas" },
        { name: "opdn", component: Views.LandingPages.Documentos.opdn, text: "Receções" },
        { name: "orpd", component: Views.LandingPages.Documentos.orpd, text: "Devoluções" },
        { name: "opch", component: Views.LandingPages.Documentos.opch, text: "Faturas" },
        { name: "orpc", component: Views.LandingPages.Documentos.orpc, text: "Notas de Crédito" },
        { name: "opor/doc", component: Views.Documents.Opor, dontCreateMenu: true, text: "Doc" },
        { name: "opdn/doc", component: Views.Documents.Opdn, dontCreateMenu: true, text: "Doc" },
        { name: "orpd/doc", component: Views.Documents.Orpd, dontCreateMenu: true, text: "Doc" },
        { name: "opch/doc", component: Views.Documents.Opch, dontCreateMenu: true, text: "Doc" },
        { name: "orpc/doc", component: Views.Documents.Orpc, dontCreateMenu: true, text: "Doc" },
        { name: "contratos", component: Views.ContratosCompra.Lp, text: "Contratos de compra" },
        { name: "contratos/doc", component: Views.ContratosCompra.Doc, dontCreateMenu: true, text: "Doc" },
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
        { name: "oitm", text: "Artigos", component: Views.Produtos },
        { name: "prices", text: "Preços", component: Views.Precos },
        { name: "etiq", text: "Etiquetas", component: Views.Etiquetas },
        { name: "oitm/:itemcode", text: "Artigos Edit", component: Views.Produtos.EditPage, dontCreateMenu: true },
        { name: "prices/doc", text: "Route->Abrir new doc atualização preços", component: Views.Precos.Doc, dontCreateMenu: true },
        // { name: "prices/doc/:id", text: "Route->Abrir doc atualização preços", component: LandingPages.Precos.Doc, dontCreateMenu: true },
        { name: "etiq/doc", text: "Route->Abrir new doc etiq", component: Views.Etiquetas.Doc, dontCreateMenu: true },
        { name: "etiq/doc/:id", text: "Route->Abrir doc etiq", component: Views.Etiquetas.Doc, dontCreateMenu: true }
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
        { name: "caixa", text: "Caixa central", component: Views.CaixaCentral },
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
      component: Views.Reports
    },
    { name: "settings", component: Views.Settings, dontCreateMenu: true }
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

var routes = [<IndexRoute component={Inicio} />];
var processMenuLevel = menus => {
  menus.forEach(menu => {
    if (menu.menus) {
      processMenuLevel(menu.menus);
    } else if (menu.component) {
      routes.push(<Route key={"route_" + menu.fullName} path={menu.fullName} name={menu.fullName} component={menu.component} />);
    }
  });
};
processMenuLevel(sappy.app.menus);
const buildedRoutes = [...routes]; // tentativa falhada de construir

class App extends Component {
  constructor(props) {
    super(props);
    this.requireAuth = this.requireAuth.bind(this);

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

  render() {
    return (
      <div>
        <Router history={hashHistory}>
          <Route path="/" name="Main" component={Full} children={buildedRoutes} onEnter={this.requireAuth} />
          <Route path="/" name="Login" component={Simple}>
            <IndexRoute component={Login} />
            <Route path="/login" name="." component={Login} />
            <Route path="/forgotpass" name="ForgotPassword" component={ForgotPassword} />
          </Route>
        </Router>
      </div>
    );
  }
}
export default App;
