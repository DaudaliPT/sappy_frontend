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
    this.handleRowSelection = this.handleRowSelection.bind(this);

    this.state = {
      companyLogo: "img/" + sappy.sessionInfo.company.dbName + "/logo.png",
      showRetomar: false,
      selectedItems: []
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

  handleRowSelection(e) {
    var checkbox = $(e.target).closest(".byusVirtualRow").find(".contacts-checkbox")[0];

    let id = checkbox.id;
    let itemCode = id.split("_")[1];
    let { selectedItems } = this.state;
    let ix = selectedItems.indexOf(itemCode);

    if (ix === -1) {
      selectedItems.push(itemCode);
      checkbox.checked = true;
    } else {
      if (ix > -1) selectedItems.splice(ix, 1);
      checkbox.checked = false;
    }

    this.setState({ selectedItems });
  }

  render() {
    let selectedItems = this.state.selectedItems || [];
    var { user, company } = sappy.sessionInfo;
    var { companyLogo } = this.state;
    let that = this;

    const renderRow = ({ row, index }) => {
      const selected = selectedItems.indexOf(row.ObjType + "#" + row.DocEntry + "#" + row.DocNum) > -1;

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

      let rowId = "row_" + row.ObjType + "#" + row.DocEntry + "#" + row.DocNum;
      let rowStyleClass = "";
      if (selected) rowStyleClass += " sappy-selected-row";
      return (
        <div className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={this.handleRowSelection}>
          <div className="container vertical-align-middle">
            <div className="row no-gutters">
              <div className="col-12 text-nowrap ">
                <span className="checkbox-custom checkbox-dark checkbox-lg">
                  <input type="checkbox" className="contacts-checkbox selectable-item" checked={selected} id={rowId} />
                  <label htmlFor={rowId} />
                </span>
                <span style={{ display: "inline-block", paddingLeft: "15px" }}>
                  {row.CardCode + " - " + row.CardName}
                </span>
                {renderBadges()}
              </div>
            </div>
            <div className="row no-gutters secondrow">
              <div className="col-12 text-nowrap">
                <span style={{ display: "inline-block", paddingLeft: "38px" }}>
                  {"Criado em " + sappy.format.datetime(row.DOC_DATETIME) + ". Tem " + row.NR_LINES + (row.NR_LINES == "1" ? " linha" : " linhas")}
                </span>
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
