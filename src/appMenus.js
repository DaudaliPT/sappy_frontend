// import React, { Component } from "react";
// import { Router, Route, IndexRoute, hashHistory } from "react-router";

import Inicio from "./views/Inicio/";
import Views from "./views";

var sappy = window.sappy;
sappy.Views = Views; // to allow debug
sappy.app = {
  menus: [
    { name: "home", text: "", icon: "icon fa-home", component: Inicio },
    // 2\. Vendas (2.1 Encomendas, 2.2 Entrega, 2.3 Devolução, 2.4 Fatura de cliente, 2.5 NC de cliente, 2.6 Promoções)
    {
      name: "vnd",
      text: "Vendas",
      icon: "icon fa-shopping-cart",
      menus: [
        {
          name: "oqut",
          component: Views.LandingPages.Documentos.oqut,
          text: "Cotações"
        },
        {
          name: "ordr",
          component: Views.LandingPages.Documentos.ordr,
          text: "Encomendas"
        },
        {
          name: "odln",
          component: Views.LandingPages.Documentos.odln,
          text: "Entregas"
        },
        {
          name: "ordn",
          component: Views.LandingPages.Documentos.ordn,
          text: "Devoluções"
        },
        {
          name: "oinv",
          component: Views.LandingPages.Documentos.oinv,
          text: "Faturas"
        },
        {
          name: "orin",
          component: Views.LandingPages.Documentos.orin,
          text: "Notas de Crédito"
        },
        {
          name: "oqut/doc",
          component: Views.Documents.Oqut,
          dontCreateMenu: true,
          text: "Doc"
        },
        {
          name: "ordr/doc",
          component: Views.Documents.Ordr,
          dontCreateMenu: true,
          text: "Doc"
        },
        {
          name: "odln/doc",
          component: Views.Documents.Odln,
          dontCreateMenu: true,
          text: "Doc"
        },
        {
          name: "ordn/doc",
          component: Views.Documents.Ordn,
          dontCreateMenu: true,
          text: "Doc"
        },
        {
          name: "oinv/doc",
          component: Views.Documents.Oinv,
          dontCreateMenu: true,
          text: "Doc"
        },
        {
          name: "orin/doc",
          component: Views.Documents.Orin,
          dontCreateMenu: true,
          text: "Doc"
        },
        { name: "promocoes", component: Views.Promocoes.Lp, text: "Preços Especiais" },
        {
          name: "promocoes/doc",
          component: Views.Promocoes.DocPromocao,
          dontCreateMenu: true,
          text: "Doc"
        },
        {
          name: "pos",
          to: "pos",
          text: "POS"
        }
      ]
    },
    // 3\. Compras (3.1 Encomendas, 3.2 Receção mercadoria, 3.3 Devolução, 3.4 Fatura de fornecedor, 3.5 NC de fornecedor, 3.6 Contratos de compra)
    {
      name: "cmp",
      text: "Compras",
      icon: "icon fa-truck",
      menus: [
        {
          name: "opor",
          component: Views.LandingPages.Documentos.opor,
          text: "Encomendas"
        },
        {
          name: "opdn",
          component: Views.LandingPages.Documentos.opdn,
          text: "Receções"
        },
        {
          name: "orpd",
          component: Views.LandingPages.Documentos.orpd,
          text: "Devoluções"
        },
        {
          name: "opch",
          component: Views.LandingPages.Documentos.opch,
          text: "Faturas"
        },
        {
          name: "orpc",
          component: Views.LandingPages.Documentos.orpc,
          text: "Notas de Crédito"
        },
        {
          name: "opor/doc",
          component: Views.Documents.Opor,
          dontCreateMenu: true,
          text: "Doc"
        },
        {
          name: "opdn/doc",
          component: Views.Documents.Opdn,
          dontCreateMenu: true,
          text: "Doc"
        },
        {
          name: "orpd/doc",
          component: Views.Documents.Orpd,
          dontCreateMenu: true,
          text: "Doc"
        },
        {
          name: "opch/doc",
          component: Views.Documents.Opch,
          dontCreateMenu: true,
          text: "Doc"
        },
        {
          name: "orpc/doc",
          component: Views.Documents.Orpc,
          dontCreateMenu: true,
          text: "Doc"
        },
        {
          name: "contratos",
          component: Views.ContratosCompra.Lp,
          text: "Contratos de compra"
        },
        {
          name: "contratos/doc",
          component: Views.ContratosCompra.Doc,
          dontCreateMenu: true,
          text: "Doc"
        }
      ]
    },
    // 4\. Parceiros (4.1 Gestão de parceiros, 4.2 Contatos)
    {
      name: "pns",
      text: "Parceiros",
      icon: "icon fa-group",
      menus: [
        { name: "ocrd", text: "Parceiros", component: Views.Parceiros },
        // { name: "contatos", text: "Contatos", component: UnderConstruction },
        {
          name: "ocrd/:cardcode",
          text: "Parceiros Edit",
          component: Views.Parceiros.EditPage,
          dontCreateMenu: true
        }
      ]
    },
    // 5\. Inventário (5.1 Gestão de artigos, 5.2 Gestão de preços, 5.3 Gestão de preços via doc, 5.4 Entradas e saídas, 5.5 Transferências, 5.6 Contagem de inventário, 5.7 Etiquetas de artigos, 5.8 Artigos por Fornecedor)
    {
      name: "inv",
      text: "Inventário",
      icon: "icon fa-barcode",
      menus: [
        { name: "oitm", text: "Artigos", component: Views.Produtos },
        // { name: "pns", text: "Parceiros", component: Views.Parceiros },
        { name: "prices", text: "Preços", component: Views.Precos },
        { name: "etiq", text: "Etiquetas", component: Views.Etiquetas },
        {
          name: "oitm/:itemcode",
          text: "Artigos Edit",
          component: Views.Produtos.EditPage,
          dontCreateMenu: true
        },
        {
          name: "prices/doc",
          text: "Route->Abrir new doc atualização preços",
          component: Views.Precos.Doc,
          dontCreateMenu: true
        },
        // { name: "prices/doc/:id", text: "Route->Abrir doc atualização preços", component: LandingPages.Precos.Doc, dontCreateMenu: true },
        {
          name: "etiq/doc",
          text: "Route->Abrir new doc etiq",
          component: Views.Etiquetas.Doc,
          dontCreateMenu: true
        },
        {
          name: "etiq/doc/:id",
          text: "Route->Abrir doc etiq",
          component: Views.Etiquetas.Doc,
          dontCreateMenu: true
        }
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
        { name: "pagamentos", text: "Pagamentos", component: Views.Pagamentos },
        { name: "cheques", text: "Carteira de cheques", component: Views.Cheques }
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
