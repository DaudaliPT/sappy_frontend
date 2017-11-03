import React, { Component } from "react";
const sappy = window.sappy;
// const $ = window.$;
// import axios from "axios";
import { Badge } from "reactstrap";
import uuid from "uuid/v4";

import BaseLandingPage from "../BaseLandingPage";
import { hashHistory } from "react-router";

class LpContratosCompra extends Component {
  constructor(props) {
    super(props);
    this.handleRowClick = this.handleRowClick.bind(this);

    this.state = {
      selectedItems: [],
      defaultLayoutCode: "",
      showActions: false
    };
  }

  handleRowClick(docID) {
    // var checkbox = $(e.target).closest(".byusVirtualRow").find(".contacts-checkbox")[0];

    // let id = checkbox.id;
    // let docID = id.split("_")[1];

    hashHistory.push({ pathname: "/cmp/contratos/doc", state: { id: docID } });
  }

  render() {
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
              <div className="col-2">
                {" "}{row.CARDCODE + "-" + sappy.padZeros(row.NUMERO, 3)}{" "}
              </div>
              <div className="col-6">
                {" "}{row.CardName + (row.CONTACT_NAME ? `(${row.CONTACT_NAME})` : "")}{" "}
              </div>
              <div className="col-4 lastcol">
                {" "}{row.DESCRICAO} {renderBadges()}
              </div>
            </div>
          </div>

          {/*mobile*/}
          <div className="vertical-align-middle hidden-md-up">
            <div className="container">
              <div className="row">
                <div className="col text-nowrap firstcol lastcol" style={{ maxHeight: "25px", overflow: "hidden" }}>
                  {row.CARDCODE + "-" + sappy.padZeros(row.NUMERO, 3) + " " + row.CardName + (row.CONTACT_NAME ? `(${row.CONTACT_NAME})` : "")}
                </div>
              </div>
              <div className="row secondrow">
                <div className="col offset-2 text-nowrap firstcol lastcol" style={{ maxHeight: "25px", overflow: "hidden" }}>
                  {row.DESCRICAO} {renderBadges()}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    const renderActions = () => {
      // let currentShowActions = this.state.showActions;

      // let { selectedItems } = this.state;

      let actions = [
        {
          name: "main",
          color: "success",
          icon: "icon wb-plus",
          onClick: e => hashHistory.push({ pathname: "/cmp/contratos/doc", state: { id: null } })
        }
      ];

      return actions;
    };

    return <BaseLandingPage pageTitle="Contratos de compra" searchPlaceholder="Procurar..." searchApiUrl="api/contratos/" renderRow={renderRow} renderRowHeight={50} actions={renderActions()} />;
  }
}

export default LpContratosCompra;
