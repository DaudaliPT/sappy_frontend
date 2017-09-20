import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
var $ = window.$;
const sappy = window.sappy;
import SearchPage from "../../../components/SearchPage";

import { Badge } from "reactstrap";
import uuid from "uuid/v4";

class ModalAskDocumento extends Component {
  constructor(props) {
    super(props);
    this.handleRowSelection = this.handleRowSelection.bind(this);
    this.handleToggleModal = this.handleToggleModal.bind(this);
    this.handleOnClickContinuar = this.handleOnClickContinuar.bind(this);
    this.state = {
      selectedItems: []
    };
  }

  handleRowSelection(e) {
    var checkbox = $(e.target).closest(".byusVirtualRow").find(".contacts-checkbox")[0];

    let id = checkbox.id;
    let docId = id.split("_")[1];
    let { selectedItems } = this.state;
    let ix = selectedItems.indexOf(docId);

    if (ix === -1) {
      selectedItems.push(docId);
      checkbox.checked = true;
    } else {
      if (ix > -1) selectedItems.splice(ix, 1);
      checkbox.checked = false;
    }

    this.setState({ selectedItems });
  }

  handleToggleModal(e) {
    this.props.toggleModal();
  }

  handleOnClickContinuar(e) {
    let selectedItems = this.state.selectedItems;
    let retItems = selectedItems.map(item => {
      let objType = item.split("#")[0];
      let docEntry = item.split("#")[1];
      let docNum = item.split("#")[2];

      return {
        ObjType: objType,
        DocEntry: docEntry,
        DocNum: docNum
      };
    });
    this.props.toggleModal(retItems);
  }

  render() {
    let { selectedItems } = this.state;

    const renderRow = ({ row, index }) => {
      const selected = selectedItems.indexOf(row.ObjType + "#" + row.DocEntry + "#" + row.DocNum) > -1;

      const renderBadges = () => {
        const badges = row.ITEM_TAGS.split("|");
        return badges.map((item, ix) => {
          let color = item.split("_")[0];
          let text = item.split("_")[1];
          return <Badge key={uuid()} color={color} pill>{text}</Badge>;
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
                <span className="ml-10"> {row.ABREV + " " + row.DocNum}</span>
              </div>
              <div className="col-2"> {sappy.format.date(row.TaxDate)}</div>
              <div className="col-5">
                {row.CardCode + " - " + row.CardName}
                {/* {renderBadges()} */}
              </div>
              <div className="col-3 lastcol">
                {row.CONTACT_NAME ? row.CONTACT_NAME : ""}
                <span className="float-right"> {row.FORMATED_DOCTOTAL} </span>
              </div>
            </div>

            {/*mobile*/}
            <div className="hidden-xl-up">
              <div className="row">
                <div className="col text-nowrap"> {row.CardCode + " - " + row.CardName} </div>
              </div>
              <div className="row secondrow">
                <div className="col-4 text-nowrap firstcol"> {row.ABREV + " " + row.DocNum} </div>
                <div className="col-5 text-nowrap firstcol">
                  {" "}{sappy.format.date(row.TaxDate)} <span className="hidden-lg-down"> {renderBadges()} </span>{" "}
                </div>
                <div className="col-3 text-nowrap lastcol">
                  <span className="float-right">{row.FORMATED_DOCTOTAL}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      );
    };
    return (
      <Modal isOpen={true} toggle={this.handleToggleModal} className={"modal-lg modal-success"}>
        <ModalHeader toggle={this.handleToggleModal}>Selecione o documento</ModalHeader>
        <ModalBody>

          <SearchPage
            searchPlaceholder="Procurar..."
            searchApiUrl="/api/precos/searchBaseDocs/"
            renderRow={renderRow}
            searchText={this.props.searchText}
            renderRowHeight={50}
            currentModal={this.state.currentModal}
          />

        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.props.toggleModal}>
            <span>
              <i className={this.props.iconCancelar || "icon wb-close"} aria-hidden="true" />
              {this.props.btnCancelar || "Cancelar"}
            </span>
          </Button>
          <Button color="success" onClick={this.handleOnClickContinuar}>
            Seleccionar
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default ModalAskDocumento;
