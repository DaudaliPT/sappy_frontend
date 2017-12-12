import React, { Component } from "react";
import GlobalSearchPage from "./GlobalSearchPage";
import { Badge } from "reactstrap";
import uuid from "uuid/v4";
import EditNewModal from "../Produtos/EditNewModal";
import EditModal from "../Produtos/EditModal";
const $ = window.$;
const sappy = window.sappy;

class CmpArtigos extends Component {
  constructor(props) {
    super(props);
    this.handleRowClick = this.handleRowClick.bind(this);

    this.state = {};
  }

  handleRowClick(e) {
    var vrow = $(e.target).closest(".byusVirtualRow")[0];
    let id = vrow.id;
    let itemCode = id.split("_")[1];

    if (itemCode.indexOf("DRAFT") > -1) {
      this.setState({
        currentModal: <EditNewModal toggleModal={this.toggleModal} changeItemCode={itemCode} />
      });
    } else {
      sappy.showModal(<EditModal toggleModal={sappy.hideModal} itemcode={itemCode} />);
    }
  }

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

      let rowId = "row_" + row.ItemCode;
      let rowStyleClass = "";
      if (row.OnHand < 0) rowStyleClass = "artigo-sem-stock";
      if (row.frozenFor === "Y") rowStyleClass = "artigo-inativo";
      return (
        <div className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={this.handleRowClick} id={rowId}>
          <div className="container vertical-align-middle">
            {/*large displays*/}
            <div className="row hidden-lg-down">
              <div className="col-2">
                {row.ItemCode}
              </div>
              <div className="col-6">
                {row.ItemName} <span> {renderBadges()} </span>
              </div>
              <div className="col-2" id={rowId + "prc"}>
                <span className="float-right">
                  {row.FORMATED_PRICE}
                </span>
              </div>

              <div className="col-2 lastcol" id={rowId + "stk"}>
                <span className="float-right">
                  {sappy.format.quantity(row.OnHand, 0) + " " + row.InvntryUom}
                </span>
              </div>
            </div>
            {/*mobile*/}
            <div className="hidden-xl-up">
              <div className="row">
                <div className="col text-nowrap">
                  {row.ItemName}
                </div>
              </div>
              <div className="row secondrow">
                <div className="col-6 text-nowrap firstcol">
                  {row.ItemCode} <span> {renderBadges()} </span>
                </div>
                <div className="col-3 text-nowrap">
                  <span className="float-right">
                    {row.FORMATED_PRICE}
                  </span>
                </div>
                <div className="col-3 text-nowrap lastcol">
                  <span className="float-right">
                    {sappy.format.quantity(row.OnHand, 0)} Un
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
        noAutoFocus
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

export default CmpArtigos;
