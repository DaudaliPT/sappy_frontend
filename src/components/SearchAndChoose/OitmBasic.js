import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
var $ = window.$;
const sappy = window.sappy;
import SearchPage from "../SearchPage";

import { Badge } from "reactstrap";
import uuid from "uuid/v4";

class OitmBasic extends Component {
  constructor(props) {
    super(props);
    this.handleRowSelection = this.handleRowSelection.bind(this);
    this.handleToggleModal = this.handleToggleModal.bind(this);
    this.handleOnClickContinuar = this.handleOnClickContinuar.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.handleOnKeyDown_popup = this.handleOnKeyDown_popup.bind(this);

    this.state = {
      selectedItems: [],
      currentModal: null
    };
  }

  handleOnKeyDown_popup(e) {
    if (e.keyCode === 13) {
      //Tentar adicionar
      this.handleOnClickContinuar(e);
    }
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

  toggleModal(refresh) {
    this.setState({ currentModal: null });
  }

  render() {
    let { selectedItems } = this.state;

    const renderRow = ({ row, index }) => {
      const badges = row.ITEM_TAGS.split("|");
      const selected = selectedItems.indexOf(row.ItemCode) > -1;

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
      // if (row.OnHand < 0) rowStyleClass = "vlist-row-danger";
      if (row.frozenFor === "Y") rowStyleClass = "vlist-row-default";
      if (selected) rowStyleClass += " sappy-selected-row";
      return (
        <div className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={this.handleRowSelection}>
          <div className="container vertical-align-middle">
            {/*large displays*/}
            <div className="row hidden-lg-down">
              <div className="col-4">
                <span className="checkbox-custom checkbox-primary checkbox-lg">
                  <input type="checkbox" className="contacts-checkbox selectable-item" checked={selected} id={rowId} />
                  <label htmlFor={rowId} />
                </span>

                {!this.props.showCatNum &&
                  <span style={{ display: "inline-block", width: "100px", paddingLeft: "5px" }}>
                    {row.ItemCode}
                  </span>}
                {this.props.showCatNum &&
                  <span style={{ display: "inline-block", width: "100px", paddingLeft: "5px" }}>
                    {" "}{row.SuppCatNum || row.ItemCode}
                  </span>}
                <span>
                  {row.CodeBars}{" "}
                </span>
              </div>
              <div className="col-6">
                {" "}{row.ItemName} <span> {renderBadges()} </span>{" "}
              </div>
              <div className="col-1">
                {" "}<span className="float-right">{sappy.format.price(row.Price)}</span>{" "}
              </div>
              <div className="col-1 lastcol text-nowrap">
                <span className="float-right">
                  {sappy.format.quantity(row.OnHand, 0) + " " + row.InvntryUom}
                </span>
              </div>
            </div>
            {/*mobile*/}
            <div className="hidden-xl-up">
              <div className="row">
                <div className="col text-nowrap">
                  {" "}{row.ItemName}{" "}
                </div>
              </div>
              <div className="row secondrow">
                {!this.props.showCatNum &&
                  <div className="col-6 text-nowrap firstcol">
                    {" "}{row.ItemCode} <span> {renderBadges()} </span>{" "}
                  </div>}
                {this.props.showCatNum &&
                  <div className="col-6 text-nowrap firstcol">
                    {" "}{row.SuppCatNum || row.ItemCode} <span> {renderBadges()} </span>{" "}
                  </div>}
                <div className="col-3 text-nowrap">
                  {" "}<span className="float-right">{sappy.format.price(row.Price)}</span>{" "}
                </div>
                <div className="col-3 text-nowrap lastcol">
                  {" "}<span className="float-right">{sappy.format.quantity(row.OnHand, 0)} Un</span>{" "}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div>
        <Modal isOpen={true} toggle={this.handleToggleModal} className={"modal-lg modal-success"} onKeyDown={this.handleOnKeyDown_popup}>
          <ModalHeader toggle={this.handleToggleModal}>Selecione o artigo</ModalHeader>
          <ModalBody>
            <SearchPage
              searchPlaceholder="Procurar..."
              searchApiUrl={OitmBasic.searchApiUrl}
              renderRow={renderRow}
              searchText={this.props.searchText}
              limitSearch={this.props.limitSearch}
              limitSearchCondition={this.props.limitSearchCondition}
              onToogleLimitSearch={this.props.onToogleLimitSearch}
              renderRowHeight={50}
              currentModal={this.state.currentModal}
            />
          </ModalBody>

          <ModalFooter>
            <Button color="primary" onClick={this.props.toggleModal}>
              <span>
                <i className="icon wb-close" aria-hidden="true" />
                Cancelar
              </span>
            </Button>

            <Button color="success" onClick={this.handleOnClickContinuar}>
              <span>
                <i className="icon wb-check" aria-hidden="true" />
                Selecionar
              </span>
            </Button>
          </ModalFooter>
        </Modal>
        {this.state.currentModal}
      </div>
    );
  }
}

OitmBasic.searchApiUrl = "/api/search/oitmbasic/";
OitmBasic.barcodeApiUrl = "/api/search/oitmbasic/bc/";

OitmBasic.defaultProps = {
  limitSearch: false,
  limitSearchCondition: "",
  showCatNum: false,
  onToogleLimitSearch: () => {}
};
export default OitmBasic;
