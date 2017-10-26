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
            {/*large displays*/}
            <div className="row hidden-lg-down">
              <div className="col-2">
                <span className="checkbox-custom checkbox-primary checkbox-lg">
                  <input type="checkbox" className="contacts-checkbox selectable-item" checked={selected} id={rowId} />
                  <label htmlFor={rowId} />
                </span>
                <span className="ml-10">
                  {" "}{row.ABREV + " " + row.DocNum}
                </span>
              </div>
              <div className="col-2">
                {" "}{sappy.format.date(row.TaxDate)}
              </div>
              <div className="col-5">
                {row.CardCode + " - " + row.CardName}
                {/* {renderBadges()} */}
              </div>
              <div className="col-3 lastcol">
                {row.CONTACT_NAME ? row.CONTACT_NAME : ""}
                <span className="float-right">
                  {" "}{row.FORMATED_DOCTOTAL}{" "}
                </span>
              </div>
            </div>

            {/*mobile*/}
            <div className="hidden-xl-up">
              <div className="row">
                <div className="col text-nowrap">
                  {" "}{row.CardCode + " - " + row.CardName}{" "}
                </div>
              </div>
              <div className="row secondrow">
                <div className="col-4 text-nowrap firstcol">
                  {" "}{row.ABREV + " " + row.DocNum}{" "}
                </div>
                <div className="col-5 text-nowrap firstcol">
                  {" "}{sappy.format.date(row.TaxDate)} <span className="hidden-lg-down"> {renderBadges()} </span>{" "}
                </div>
                <div className="col-3 text-nowrap lastcol">
                  <span className="float-right">
                    {row.FORMATED_DOCTOTAL}
                  </span>
                </div>
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
                searchApiUrl="/api/precos/searchBaseDocs/"
                renderRow={renderRow}
                height={295}
                searchText={this.props.searchText}
                renderRowHeight={50}
                currentModal={this.state.currentModal}
              />
            </Panel>}
        </div>
      </div>
    );
  }
}

export default Inicio;
