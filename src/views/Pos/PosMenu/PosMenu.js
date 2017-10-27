import React, { Component } from "react";
var $ = window.$;
var sappy = window.sappy;
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
    $(".tokenfield").tokenfield();
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
    hashHistory.push({ pathname: url, state: { ID } });
  }

  render() {
    var { user, company } = sappy.sessionInfo;
    var { companyLogo } = this.state;
    let that = this;

    const renderRow = ({ row, index }) => {
      const renderBadges = () => {
        const badges = row.ITEM_TAGS.split("|");
        return badges.map((item, ix) => {
          let color = item.split("_")[0];
          let text = item.split("_")[1];
          return (
            <Badge key={uuid()} color={color} pill>
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
                {"Criado em " + sappy.format.datetime(row.DOC_DATETIME) + ". Tem " + row.NR_LINES + (row.NR_LINES == "1" ? " linha" : " linhas")}
              </div>
            </div>
          </div>
        </div>
      );
    };
    return (
      <div className="posMenu">
        <a className="company-logo">
          <img onError={this.handleLogoImageError} src={companyLogo} alt="..." />
        </a>
        {!this.state.showRetomar &&
          <div className="posMenu-actions">
            <div className="posMenu-action">
              <button className="btn btn-block btn-dark btn-outline btn-round" onClick={e => hashHistory.push("/pos/Ordr")}>
                <i className="icon wb-plus" />
                <br /> <span>Encomenda de Cliente</span>
              </button>
            </div>
            <div className="posMenu-action">
              <button className="btn btn-block btn-dark btn-outline btn-round" onClick={e => hashHistory.push("/pos/Oinv")}>
                <i className="icon wb-plus" />
                <br />
                <span>Fatura a Cliente</span>
              </button>
            </div>
            <div className="posMenu-action">
              <button className="btn btn-block btn-dark btn-outline btn-round" onClick={e => hashHistory.push("/pos/Orin")}>
                <i className="icon wb-plus" />
                <br />
                <span>Nota Crédito a Cliente</span>
              </button>
            </div>
            <div className="posMenu-action">
              <button className="btn btn-block btn-dark btn-outline btn-round" onClick={e => hashHistory.push("/pos/Odln")}>
                <i className="icon wb-plus" />
                <br />
                <span>Saída de Mercadoria </span>
              </button>
            </div>
          </div>}
        <div className={"posMenu-actions2 " + (this.state.showRetomar ? "open" : "")}>
          {!this.state.showRetomar &&
            <div className="posMenu-action">
              <button className="btn btn-block btn-dark btn-outline btn-round" onClick={e => that.setState({ showRetomar: !that.state.showRetomar })}>
                <i className="icon fa-angle-up" />
                <br /> <span>Documentos em curso</span>
              </button>
            </div>}
          {this.state.showRetomar &&
            <Panel name="panelDetails" allowCollapse={true} title="Documentos em curso" onToogleExpand={e => that.setState({ showRetomar: !that.state.showRetomar })}>
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
