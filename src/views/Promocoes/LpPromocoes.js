import React, { Component } from "react";
const sappy = window.sappy;
// const $ = window.$;
// import axios from "axios";
import { Badge } from "reactstrap";
import uuid from "uuid/v4";

import BaseLandingPage from "../BaseLandingPage";
import { hashHistory } from "react-router";

class LpPromocoes extends Component {
  constructor(props) {
    super(props);
    this.handleRowClick = this.handleRowClick.bind(this);

    this.state = {
      selectedItems: [], 
      showActions: false
    };
  }
  handleRowClick(docID) {
    hashHistory.push({ pathname: "/vnd/promocoes/doc", state: { id: docID } });
  }

  render() {
    let that = this;
    let { selectedItems } = this.state;

    const renderRow = ({ row, index }) => {
      const selected = selectedItems.indexOf(row.ID.toString()) > -1;

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

      // let rowId = "row_" + row.ID + "#" + (row.NUMERO || 0);
      let rowStyleClass = "";
      if (selected) rowStyleClass += " sappy-selected-row";
      if (!row.NUMERO) rowStyleClass += " vlist-row-warning";

      return (
        <div className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={e => this.handleRowClick(row.ID)}>
          {/*large displays*/}
          <div className="container vertical-align-middle hidden-sm-down">
            <div className="row">
              <div className="col-1">
                {" "}{row.NUMERO}{" "}
              </div>
              <div className="col-8">
                {row.TIPO === "P" &&
                  <i style={{ color: "rgba(0, 120, 68, 1)", paddingRight: "5px" }} className="icon fa-tags" />}
                {row.TIPO === "F" &&
                  <i style={{ color: "#aaa", paddingRight: "5px" }} className="icon fa-newspaper-o" />}
                {row.DESCRICAO} {renderBadges()}
              </div>
              <div className="col-3 lastcol">
                {" "}{sappy.format.date(row.DATAI) + " a " + sappy.format.date(row.DATAF)}
              </div>
            </div>
          </div>

          {/*mobile*/}
          <div className="vertical-align-middle hidden-md-up">
            <div className="container">
              <div className="row">
                <div className="col-1 firstcol">
                  {row.NUMERO}
                </div>
                <div className="col-11 text-nowrap " style={{ maxHeight: "25px", overflow: "hidden" }}>
                  {row.DESCRICAO}
                </div>
              </div>
              <div className="row secondrow">
                <div
                  className="col offset-1 text-nowrap firstcol lastcol"
                  style={{ maxHeight: "25px", overflow: "hidden" }}
                >
                  {sappy.format.date(row.DATAI) + " a " + sappy.format.date(row.DATAF)}
                  {renderBadges()}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    const renderActions = () => {
      let showActions = this.state.showActions;
      // let { selectedItems } = this.state;

      let actions = [
        {
          name: "main",
          color: "success",
          icon: "icon wb-plus",
          onClick: e => that.setState({ showActions: !showActions })
        },
        {
          name: "Promoção",
          color: "success",
          icon: "icon fa-tags",
          visible: showActions,
          onClick: e => hashHistory.push({ pathname: "/vnd/promocoes/doc", state: { id: null, tipo: "P" } })
        },
        {
          name: "Folheto",
          color: "success",
          icon: "icon fa-newspaper-o",
          visible: showActions,
          onClick: e => hashHistory.push({ pathname: "/vnd/promocoes/doc", state: { id: null }, tipo: "F" })
        }
      ];

      return actions;
    };

    return (
      <BaseLandingPage
        pageTitle="Promoções"
        searchPlaceholder="Procurar..."
        searchApiUrl="api/promocoes/"
        renderRow={renderRow}
        renderRowHeight={50}
        actions={renderActions()}
      />
    );
  }
}

export default LpPromocoes;
