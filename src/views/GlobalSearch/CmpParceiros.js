import React, { Component } from "react";
import GlobalSearchPage from "./GlobalSearchPage";
import { Badge } from "reactstrap";
import uuid from "uuid/v4";
import EditNewModal from "../Produtos/EditNewModal";
import EditModal from "../Produtos/EditModal";
const $ = window.$;
const sappy = window.sappy;

class CmpParceiros extends Component {
  render() {
    let that = this;

    const renderRow = ({ row, index }) => {
      const badges = row.ITEM_TAGS.split("|");

      const renderBadges = () => {
        return badges.map((item, ix) => {
          if (item === "MP") {
            return (
              <Badge key={uuid()} color="primary" pill>
                {item}
              </Badge>
            );
          } else if (item === "PV") {
            return (
              <Badge key={uuid()} color="success" pill>
                {item}
              </Badge>
            );
          } else if (item === "Inactivo") {
            return (
              <Badge key={uuid()} color="default" pill>
                {item}
              </Badge>
            );
          } else {
            return (
              <Badge key={uuid()} color="danger" pill>
                {item}
              </Badge>
            );
          }
        });
      };

      let rowId = "row_" + row.CardCode;
      let rowStyleClass = "";
      if (row.OnHand < 0) rowStyleClass = "artigo-sem-stock";
      if (row.frozenFor === "Y") rowStyleClass = "artigo-inativo";
      return (
        <div className={"byusVirtualRow vertical-align " + rowStyleClass} id={rowId}>
          <div className="container vertical-align-middle">
            {/*large displays*/}
            <div className="row hidden-lg-down">
              <div className="col-2">
                {sappy.GetLinkTo("2", row.CardCode)}
                {row.CardCode}
              </div>
              <div className="col-6">
                {row.CardName} <span> {renderBadges()} </span>
              </div>
              <div className="col-2" id={rowId + "prc"}>
                <span className="float-right">
                  {/* {row.FORMATED_PRICE} */}
                </span>
              </div>

              <div className="col-2 lastcol" id={rowId + "stk"}>
                <span className="float-right">
                  {/* {sappy.format.quantity(row.OnHand, 0) + " " + row.InvntryUom} */}
                </span>
              </div>
            </div>
            {/*mobile*/}
            <div className="hidden-xl-up">
              <div className="row">
                <div className="col text-nowrap">
                  {row.CardName}
                </div>
              </div>
              <div className="row secondrow">
                <div className="col-6 text-nowrap firstcol">
                  {row.CardCode} <span> {renderBadges()} </span>
                </div>
                <div className="col-3 text-nowrap">
                  <span className="float-right">
                    {/* {row.FORMATED_PRICE} */}
                  </span>
                </div>
                <div className="col-3 text-nowrap lastcol">
                  <span className="float-right">
                    {/* {sappy.format.quantity(row.OnHand, 0)} Un */}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <GlobalSearchPage
        onTabStatusUpdate={newState => this.props.onTabStatusUpdate("parceiros", newState)}
        searchTags={this.props.searchTags}
        searchText={this.props.searchText}
        searchApiUrl={this.props.searchApiUrl}
        noRecordsMessage="Nenhum artigo encontrado"
        renderRow={renderRow}
        renderRowHeight={50}
      />
    );
  }
}
CmpParceiros.defaultProps = {
  onTabStatusUpdate: newState => {}
};
export default CmpParceiros;
