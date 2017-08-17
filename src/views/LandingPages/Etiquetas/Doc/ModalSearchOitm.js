import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
var $ = window.$;
const byUs = window.byUs;
import ByUsSearchPage from "../../../../components/ByUsSearchPage";

import { Badge } from "reactstrap";
import uuid from "uuid/v4";

class ModalSearchOitm extends Component {
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

  handleToggleModal(e) {
    this.props.toggleModal();
  }

  handleOnClickContinuar(e) {
    this.props.toggleModal(this.state.selectedItems);
  }

  render() {
    let { selectedItems } = this.state;

    const renderRow = ({ row, index }) => {
      const badges = row.ITEM_TAGS.split("|");
      const selected = selectedItems.indexOf(row.ItemCode) > -1;

      const renderBadges = () => {
        return badges.map((item, ix) => {
          if (item === "MP") {
            return <Badge key={uuid()} color="primary" pill>{item}</Badge>;
          } else if (item === "PV") {
            return <Badge key={uuid()} color="success" pill>{item}</Badge>;
          } else if (item === "Inactivo") {
            return <Badge key={uuid()} color="default" pill>{item}</Badge>;
          } else {
            return <Badge key={uuid()} color="danger" pill>{item}</Badge>;
          }
        });
      };
      let rowId = "row_" + row.ItemCode;
      let rowStyleClass = "";
      if (row.OnHand < 0) rowStyleClass = "vlist-row-danger";
      if (row.frozenFor === "Y") rowStyleClass = "vlist-row-default";
      if (selected) rowStyleClass += " byus-selected-row";
      return (
        <div className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={this.handleRowSelection}>
          <div className="container vertical-align-middle">

            {/*large displays*/}
            <div className="row hidden-lg-down">
              <div className="col-1">
                <span className="checkbox-custom checkbox-primary checkbox-lg">
                  <input type="checkbox" className="contacts-checkbox selectable-item" checked={selected} id={rowId} />
                  <label htmlFor={rowId} />
                </span>
              </div>
              <div className="col-2"> {row.ItemCode} </div>
              <div className="col-5 "> {row.ItemName} <span> {renderBadges()} </span> </div>
              <div className="col-2"> <span className="float-right">{row.FORMATED_PRICE}</span> </div>
              <div className="col-2 lastcol">
                <span className="float-right">{byUs.format.quantity(row.OnHand, 0) + " " + row.InvntryUom}</span>
              </div>
            </div>
            {/*mobile*/}
            <div className="hidden-xl-up">
              <div className="row">
                <div className="col text-nowrap"> {row.ItemName} </div>
              </div>
              <div className="row secondrow">
                <div className="col-6 text-nowrap firstcol"> {row.ItemCode} <span> {renderBadges()} </span> </div>
                <div className="col-3 text-nowrap"> <span className="float-right">{row.FORMATED_PRICE}</span> </div>
                <div className="col-3 text-nowrap lastcol">
                  {" "}<span className="float-right">{byUs.format.quantity(row.OnHand, 0)} Un</span>{" "}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };
    return (
      <Modal isOpen={true} toggle={this.handleToggleModal} className={"modal-lg modal-success"}>
        <ModalHeader toggle={this.handleToggleModal}>Selecione o artigo</ModalHeader>
        <ModalBody>

          <ByUsSearchPage
            searchPlaceholder="Procurar..."
            searchApiUrl="/api/inv/etiq/searchOitm/"
            renderRow={renderRow}
            searchText={this.props.searchText}
            renderRowHeight={50}
            currentModal={this.state.currentModal}
          />
        </ModalBody>
        <ModalFooter>
          {" "}<Button color="primary" onClick={this.props.toggleModal}>
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

export default ModalSearchOitm;
