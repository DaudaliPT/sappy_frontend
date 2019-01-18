import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
var $ = window.$;
const sappy = window.sappy;
import SearchPage from "../SearchPage";
import EditNewModal from "../../views/Produtos/EditNewModal";

import { Badge } from "reactstrap";
import uuid from "uuid/v4";

class ModalOitm extends Component {
  constructor(props) {
    super(props);
    this.handleRowSelection = this.handleRowSelection.bind(this);
    this.handleToggleModal = this.handleToggleModal.bind(this);
    this.handleOnClickContinuar = this.handleOnClickContinuar.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.handleAddNew = this.handleAddNew.bind(this);
    this.handleNewItemCreated = this.handleNewItemCreated.bind(this);
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
    if (this.props.singleSelect) selectedItems = [];
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

  handleNewItemCreated(itemCode) {
    this.setState({ currentModal: null }, e => this.props.toggleModal([itemCode]));
  }

  handleAddNew(e) {
    this.setState({
      currentModal: <EditNewModal
        toggleModal={this.toggleModal}
        onNewItemCreated={this.handleNewItemCreated}
        unaporDraftId={this.props.unaporDraftId}
        unaporDraftLinenum={this.props.unaporDraftLinenum}
      />
    });
    // this.props.toggleModal(this.state.selectedItems);
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
      if (row.OnHand < 0) rowStyleClass = "vlist-row-danger";
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
                    {row.SuppCatNum || row.ItemCode}
                  </span>}
                <span>
                  {row.CodeBars}
                </span>
              </div>
              <div className="col-6">
                {row.ItemName} <span> {renderBadges()} </span>
              </div>
              <div className="col-1">
                <span className="float-right">{row.FORMATED_PRICE}</span>
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
                  {row.ItemName}
                </div>
              </div>
              <div className="row secondrow">
                {!this.props.showCatNum &&
                  <div className="col-6 text-nowrap firstcol">
                    {row.ItemCode} <span> {renderBadges()} </span>
                  </div>}
                {this.props.showCatNum &&
                  <div className="col-6 text-nowrap firstcol">
                    {row.SuppCatNum || row.ItemCode} <span> {renderBadges()} </span>
                  </div>}
                <div className="col-3 text-nowrap">
                  <span className="float-right">{row.FORMATED_PRICE}</span>
                </div>
                <div className="col-3 text-nowrap lastcol">
                  <span className="float-right">{sappy.format.quantity(row.OnHand, 0)} Un</span>
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
              searchApiUrl={ModalOitm.searchApiUrl}
              renderRow={renderRow}
              searchText={this.props.searchText}
              useBaseDoclines={this.props.useBaseDoclines}
              baseDocLinesCondition={this.props.baseDocLinesCondition}
              onToogleUseBaseDoclines={this.props.onToogleUseBaseDoclines}
              useSearchLimit={this.props.useSearchLimit}
              searchLimitCondition={this.props.searchLimitCondition}
              onToogleUseSearchLimit={this.props.onToogleUseSearchLimit}
              renderRowHeight={50}
              currentModal={this.state.currentModal}
            />
          </ModalBody>

          <ModalFooter>
            <Button color="primary mr-auto" onClick={this.handleAddNew}>
              <span>
                <i className="icon wb-plus" aria-hidden="true" />
                Novo
              </span>
            </Button>

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

ModalOitm.searchApiUrl = "/api/search/oitm/";
ModalOitm.barcodeApiUrl = "/api/search/oitm/bc/";

ModalOitm.defaultProps = {
  showCatNum: false,
  useBaseDoclines: false,
  baseDocLinesCondition: "",
  onToogleUseBaseDoclines: () => { },
  singleSelect: false,
  useSearchLimit: false,
  searchLimitCondition: "",
  onToogleUseSearchLimit: () => { },
  unaporDraftId: 0,
  unaporDraftLinenum: 0
};
export default ModalOitm;
