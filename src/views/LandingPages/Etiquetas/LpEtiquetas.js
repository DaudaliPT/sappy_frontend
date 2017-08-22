import React, { Component } from "react";
const byUs = window.byUs;
const $ = window.$;
import axios from "axios";
import { Badge } from "reactstrap";
import uuid from "uuid/v4";

import BaseLandingPage from "../BaseLandingPage";
import ModalConfirmPrint from "./ModalConfirmPrint";
import { hashHistory } from "react-router";

class LpEtiquetas extends Component {
  constructor(props) {
    super(props);
    this.toggleModal = this.toggleModal.bind(this);
    this.handleRowSelection = this.handleRowSelection.bind(this);
    this.handleRowClick = this.handleRowClick.bind(this);
    this.handleModalSearchClose = this.handleModalSearchClose.bind(this);

    this.state = {
      currentModal: null,
      selectedItems: [],
      defaultLayoutCode: ""
    };
  }

  componentDidMount() {
    let that = this;
    axios
      .get(`api/inv/etiq/report`)
      .then(function (result) {
        that.setState({
          defaultLayoutCode: result.data.LayoutCode
        });
      })
      .catch(function (error) {
        if (!error.__CANCEL__) byUs.showError(error, "Api error")
      });
  }

  toggleModal(refresh) {
    this.setState({ currentModal: null });
  }

  handleRowClick(e) {
    var checkbox = $(e.target).closest(".byusVirtualRow").find(".contacts-checkbox")[0];

    let id = checkbox.id;
    let docID = id.split("_")[1];

    hashHistory.push("/inv/etiq/doc/" + docID);
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

  handleModalSearchClose(selectedItems) {
    // let that = this;
    this.setState({ currentModal: null });

    if (selectedItems && selectedItems.length > 0) {
      this.serverRequest = axios
        .post(`/api/inv/etiq/doc/base`, { baseDocs: selectedItems })
        .then(function (result) {
          hashHistory.push("/inv/etiq/doc/" + result.data.ID);
        })
        .catch(error => byUs.showError(error, "Erro ao adicionar linhas"));
    }
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
      if (selected) rowStyleClass += " byus-selected-row";
      if (!row.DOCNUM) rowStyleClass += " vlist-row-warning";

      return (
        <div className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={this.handleRowClick}>
          {/*large displays*/}
          <div className="container vertical-align-middle hidden-lg-down">
            <div className="row">
              <div className="col-1 byus-select-col-container" onClick={this.handleRowSelection}>
                <span className="checkbox-custom checkbox-primary checkbox-lg">
                  <input type="checkbox" className="contacts-checkbox selectable-item" value={selected} id={rowId} />
                  <label htmlFor={rowId} />
                </span>
              </div>
              <div className="col-1"> {row.DOCNUM || ("#" + row.ID)} </div>
              <div className="col-2"> {byUs.format.properDisplayDate(row.CONFIRMED || row.DATA)} </div>
              <div className="col-7" style={{ maxHeight: "50px", overflow: "hidden" }}> <span> {renderBadges1()}{renderBadges()} </span> {row.OBSERVACOES} </div>
              <div className="col-1 lastcol">
                <span className="float-right">{row.CREATED_BY_NAME}</span>
              </div>
            </div>
          </div>

          {/*mobile*/}
          <div className="vertical-align-middle hidden-xl-up">
            <div className="byus-select-col" onClick={this.handleRowSelection}>
              <span className="checkbox-custom checkbox-primary checkbox-lg">
                <input type="checkbox" className="contacts-checkbox selectable-item" value={selected} id={rowId} />
                <label htmlFor={rowId} />
              </span>
            </div>
            <div className="byus-nonselect-col">
              <div className="container">
                <div className="row">
                  <div className="col-1"> {row.DOCNUM || ("#" + row.ID)} </div>
                  <div className="col text-nowrap lastcol">
                    {byUs.format.properDisplayDate(row.CONFIRMED || row.DATA)}
                    <span> {renderBadges1()} </span>
                  </div>
                </div>
                <div className="row secondrow">
                  <div className="col text-nowrap firstcol lastcol" style={{ maxHeight: "25px", overflow: "hidden" }}>
                    {row.OBSERVACOES}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    const renderActions = () => {
      let { selectedItems } = this.state;
      let actions = [];


      if (selectedItems && selectedItems.length > 0) {
        actions = [
          ...actions,
          {
            name: "Imprimir",
            color: "primary",
            icon: "icon fa-print",
            onClick: e => {
              let { selectedItems } = this.state;

              let docNumArray = [];
              selectedItems.forEach(docID => {
                let docNum = docID.split("#")[1];
                if (docNum) docNumArray.push(parseInt(docNum, 10));
              });

              this.setState({
                currentModal: (
                  <ModalConfirmPrint
                    setCurrentModal={({ currentModal }) => { this.setState({ currentModal }); }}
                    defaultLayoutCode={this.state.defaultLayoutCode}
                    docNumArray={docNumArray}
                  />
                )
              });
            }
          }
        ];
      }
      else {
        actions = [
          ...actions,

          {
            name: "Artigos",
            color: "success",
            icon: "icon wb-plus",
            onClick: e => {
              hashHistory.push("/inv/etiq/doc");
            }
          }
        ];
      }

      return actions;
    };

    return (
      <BaseLandingPage
        pageTitle="Impressão de etiquetas"
        searchPlaceholder="Procurar..."
        searchApiUrl="api/inv/etiq/"
        renderRow={renderRow}
        renderRowHeight={50}
        currentModal={this.state.currentModal}
        actions={renderActions()}
      />
    );
  }
}

import Doc from './Doc';
LpEtiquetas.Doc = Doc;
export default LpEtiquetas; 
