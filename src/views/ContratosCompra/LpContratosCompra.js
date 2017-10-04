import React, { Component } from "react";
const sappy = window.sappy;
const $ = window.$;
import axios from "axios";
import { Badge } from "reactstrap";
import uuid from "uuid/v4";

import BaseLandingPage from "../BaseLandingPage";
import EditModal from "./EditModal";
import { hashHistory } from "react-router";

class LpContratosCompra extends Component {
  constructor(props) {
    super(props);
    this.toggleModal = this.toggleModal.bind(this);
    this.handleRowSelection = this.handleRowSelection.bind(this);
    this.handleRowClick = this.handleRowClick.bind(this);

    this.state = {
      selectedItems: [],
      defaultLayoutCode: "",
      showActions: false
    };
  }

  componentDidMount() {
    let that = this;
    axios
      .get(`api/reports/LayoutCode/SAPPY001`)
      .then(function (result) {
        that.setState({
          defaultLayoutCode: result.data.LayoutCode
        });
      })
      .catch(function (error) {
        if (!error.__CANCEL__) sappy.showError(error, "Api error")
      });
  }

  toggleModal(refresh) {
    sappy.hideModal();
  }

  handleRowClick(e) {
    var checkbox = $(e.target).closest(".byusVirtualRow").find(".contacts-checkbox")[0];

    let id = checkbox.id;
    let docID = id.split("_")[1];

    hashHistory.push({ pathname: "/inv/prices/doc", state: { id: docID } });
  }

  handleRowSelection(e) {
    e.stopPropagation();
    var checkbox = $(e.target).closest(".byusVirtualRow").find(".contacts-checkbox")[0];

    let id = checkbox.id;
    let docID = id.split("_")[1];
    let docNum = docID.split("#")[1];
    let { selectedItems } = this.state;
    let ix = selectedItems.indexOf(docID);

    if (ix === -1 && (docNum && parseInt(docNum, 10) > 0)) {
      selectedItems.push(docID);
      checkbox.checked = true;
    } else {
      if (ix > -1) selectedItems.splice(ix, 1);
      checkbox.checked = false;
    }

    this.setState({ selectedItems });
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
          return <Badge key={uuid()} color={color} pill>{text}</Badge>;
        });
      };
      const renderBadges1 = () => {
        const badges = row.ITEM_TAGS1.split("|");
        return badges.map((item, ix) => {
          let color = item.split("_")[0];
          let text = item.split("_")[1];
          return <Badge key={uuid()} color={color} pill>{text}</Badge>;
        });
      };

      let rowId = "row_" + row.ID + "#" + (row.DOCNUM || 0);
      let rowStyleClass = "";
      if (selected) rowStyleClass += " sappy-selected-row";
      if (!row.DOCNUM) rowStyleClass += " vlist-row-warning";

      return (
        <div className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={this.handleRowClick}>
          {/*large displays*/}
          <div className="container vertical-align-middle hidden-lg-down">
            <div className="row">
              <div className="col-1 sappy-select-col-container" onClick={this.handleRowSelection}>
                <span className="checkbox-custom checkbox-primary checkbox-lg">
                  <input type="checkbox" className="contacts-checkbox selectable-item" value={selected} id={rowId} />
                  <label htmlFor={rowId} />
                </span>
              </div>
              <div className="col-1"> {row.DOCNUM || ("#" + row.ID)} </div>
              <div className="col-2"> {sappy.format.date(row.CONFIRMED || row.DATA)} </div>
              <div className="col-7" style={{ maxHeight: "50px", overflow: "hidden" }}> <span> {renderBadges1()}{renderBadges()} </span> {row.ESTADO + " " + row.OBSERVACOES} </div>
              <div className="col-1 lastcol">
                <span className="float-right">{row.CREATED_BY_NAME}</span>
              </div>
            </div>
          </div>

          {/*mobile*/}
          <div className="vertical-align-middle hidden-xl-up">
            <div className="sappy-select-col" onClick={this.handleRowSelection}>
              <span className="checkbox-custom checkbox-primary checkbox-lg">
                <input type="checkbox" className="contacts-checkbox selectable-item" value={selected} id={rowId} />
                <label htmlFor={rowId} />
              </span>
            </div>
            <div className="sappy-nonselect-col">
              <div className="container">
                <div className="row">
                  <div className="col-1"> {row.DOCNUM || ("#" + row.ID)} </div>
                  <div className="col text-nowrap lastcol">
                    {sappy.format.date(row.CONFIRMED || row.DATA)}
                    <span> {renderBadges1()} </span>
                  </div>
                </div>
                <div className="row secondrow">
                  <div className="col text-nowrap firstcol lastcol" style={{ maxHeight: "25px", overflow: "hidden" }}>

                    {row.ESTADO + " " + row.OBSERVACOES}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    const renderActions = () => {
      let currentShowActions = this.state.showActions;

      let { selectedItems } = this.state;

      let actions = [
        {
          name: "main",
          color: "success",
          icon: "icon wb-plus",
          onClick: e => sappy.showModal(<EditModal toggleModal={this.toggleModal} />)
        }
      ];

      return actions;
    };

    return (
      <BaseLandingPage
        pageTitle="Contratos de compra"
        searchPlaceholder="Procurar..."
        searchApiUrl="api/precos/"
        renderRow={renderRow}
        renderRowHeight={50}
        actions={renderActions()}
      />
    );
  }
}

export default LpContratosCompra; 
