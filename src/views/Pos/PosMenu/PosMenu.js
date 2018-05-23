import React, { Component } from "react";
var $ = window.$;
var sappy = window.sappy;

import axios from "axios";
import { hashHistory } from "react-router";
import Panel from "../../../components/Panel";
import SearchPage from "../../../components/SearchPage";
import { Badge } from "reactstrap";
import uuid from "uuid/v4";

class Inicio extends Component {
  constructor(props) {
    super(props);
    this.handleLogoImageError = this.handleLogoImageError.bind(this);
    this.handleRowClick = this.handleRowClick.bind(this);

    this.state = {
      companyLogo: "img/" + sappy.sessionInfo.company.dbName + "/logo.png",
      showRetomar: false
    };
  }

  handleLogoImageError(event) {
    if (this.state.companyLogo !== "img/company.png") {
      this.setState({ companyLogo: "img/company.png" });
    }
  }

  componentDidMount() {
    $(".tokenfield").tokenfield({delimiter:';'});
  }

  handleRowClick(e) {
    var mainDiv = $(e.target).closest(".byusVirtualRow")[0];

    let id = mainDiv.id;
    let docId = id.split("_")[1]; //  "row_" + row.ObjType + "#" + row.ID
    let objCode = docId.split("#")[0]; //  "row_" + row.ObjType + "#" + row.ID
    let ID = sappy.getNum(docId.split("#")[1]); //  "row_" + row.ObjType + "#" + row.ID

    let url = "pos/";
    if (objCode === "17") url += "Ordr";
    if (objCode === "13") url += "Oinv";
    if (objCode === "14") url += "Orin";
    if (objCode === "23") url += "Oqut";
    hashHistory.push({ pathname: url, state: { ID } });
  }

  render() {
    // var { user, company } = sappy.sessionInfo;
    var { companyLogo } = this.state;
    let that = this;
    
    let isComercial = ",comercial,".indexOf("," + sappy.sessionInfo.user.NAME + ",") > -1;
 
    const renderRow = ({ row, index }) => {
      const renderBadges = () => {
        const badges = row.ITEM_TAGS.split("|");
        return badges.map((item, ix) => {
          let color = item.split("_")[0];
          let text = item.split("_")[1];
          return (
            <Badge key={uuid()} color={color} pill className="float-right">
              {text}
            </Badge>
          );
        });
      };

      let rowId = "row_" + row.ObjType + "#" + row.ID;
      return (
        <div id={rowId} className={"byusVirtualRow vertical-align"} onClick={this.handleRowClick}>
          <div className="container vertical-align-middle">
            <div className="row no-gutters">
              <div className="col-12 text-nowrap ">
                {row.CardCode + " - " + row.CardName}
                {renderBadges()}
              </div>
            </div>
            <div className="row no-gutters secondrow">
              <div className="col-12 text-nowrap">
                {"Criado em " +
                  sappy.format.datetime(row.DOC_DATETIME) +
                  ". Tem " +
                  row.NR_LINES +
                  (row.NR_LINES === 1 ? " linha" : " linhas")}
              </div>
            </div>
          </div>
        </div>
      );
    };
    const showFatura = () => {
      if (isComercial) return null;
      return  <div className="posMenu-action">
          <button className="btn btn-block btn-success" onClick={e => hashHistory.push("/pos/Oinv")}>
            <i className="icon pe-cart" />
            <br />
            <span>Fatura a Cliente</span>
          </button>
        </div>;
      }    
      const showNC = () => {
        if (isComercial) return null;
        return <div className="posMenu-action">
        <button className="btn btn-block btn-warning" onClick={e => hashHistory.push("/pos/Orin")}>
          <i className="icon pe-scissors" />
          <br />
          <span>Nota Crédito a Cliente</span>
        </button>
      </div> ;
        }
    return (
      <div className="posMenu">
        <a className="company-logo">
          <img onError={this.handleLogoImageError} src={companyLogo} alt="..." />
        </a>
        {!this.state.showRetomar &&
          <div className="posMenu-actions">
            <div className="posMenu-action">
              <button className="btn btn-block" onClick={e => hashHistory.push("/pos/Oqut")}>
                <i className="icon pe-shopbag" />
                <br /> <span>Cotações</span>
              </button>
            </div>
            <div className="posMenu-action">
              <button className="btn btn-block" onClick={e => hashHistory.push("/pos/Ordr")}>
                <i className="icon pe-note2" />
                <br /> <span>Encomenda de Cliente</span>
              </button>
            </div>
              {showFatura()}
              {showNC()}
            {/* <div className="posMenu-action">
              <button className="btn btn-block" onClick={e => hashHistory.push("/pos/Odln")}>
                <i className="icon pe-download" />
                <br />
                <span>Saída de Mercadoria </span>
              </button>
            </div> */}
          </div>
        }
        <div className={"posMenu-actions2 " + (this.state.showRetomar ? "open" : "")}>
          {!this.state.showRetomar &&
            <div className="posMenu-action">
              <button className="btn btn-block" onClick={e => that.setState({ showRetomar: !that.state.showRetomar })}>
                <i className="icon fa-angle-up" />
                <br /> <span>Documentos em curso</span>
              </button>
            </div>}
          {!this.state.showRetomar &&
            <div className="posMenu-action">
              <button
                className="btn btn-block"
                onClick={e => {
                  e.preventDefault();
                  this.serverRequest = axios
                    .post("auth/logout")
                    .then(result => {
                      hashHistory.push("/login");
                    })
                    .catch(error => sappy.showError(error, "Não foi possível fazer logout"));
                }}
              >
                <i className="icon ion-ios-log-out-outline" />
                <br /> <span>Terminar sessão de {sappy.sessionInfo.user.NAME}</span>
              </button>
            </div>}
          {this.state.showRetomar &&
            <Panel
              name="panelDetails"
              allowCollapse={true}
              title="Documentos em curso"
              onToogleExpand={e => that.setState({ showRetomar: !that.state.showRetomar })}
            >
              <SearchPage
                searchPlaceholder="Procurar..."
                searchApiUrl="/api/docs/pospending/"
                renderRow={renderRow}
                height={295}
                searchText={this.props.searchText}
                renderRowHeight={60}
                currentModal={this.state.currentModal}
              />
            </Panel>}
        </div>
      </div>
    );
  }
}

export default Inicio;
