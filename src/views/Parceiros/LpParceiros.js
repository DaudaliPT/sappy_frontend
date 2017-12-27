import React, { Component } from "react";
// import axios from "axios";
// import { Popover, PopoverContent } from "reactstrap";
// const sappy = window.sappy;
const $ = window.$;

import { Badge } from "reactstrap";
import uuid from "uuid/v4";
import BaseLandingPage from "../BaseLandingPage";
import EditNewModal from "./EditNewModal";
import EditPage from "./EditPage";

import { hashHistory } from "react-router";

class Parceiros extends Component {
  constructor(props) {
    super(props);
    this.toggleModal = this.toggleModal.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
    this.handleRowClick = this.handleRowClick.bind(this);

    this.hoverTimeOutHandle = 0;

    this.state = {
      currentModal: null,
      currentPopover: null,
      forceLandingPageRefresh: false
    };
  }

  toggleModal(refresh) {
    this.setState({
      currentModal: null,
      forceLandingPageRefresh: refresh
    });
  }

  togglePopover() {
    this.setState({
      currentPopover: null
    });
  }

  handleRowClick(e) {
    var vrow = $(e.target).closest(".byusVirtualRow")[0];
    let id = vrow.id;
    let cardCode = id.split("_")[1];

    if (cardCode.indexOf("DRAFT") > -1) {
      this.setState({
        currentModal: <EditNewModal toggleModal={this.toggleModal} changeCardCode={cardCode} />
      });
    } else {
      hashHistory.push("/pns/ocrd/" + cardCode);
    }
  }

  render() {
    // let that = this;

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
      if (row.OnHand < 0) rowStyleClass = "parceiro-sem-stock";
      if (row.frozenFor === "Y") rowStyleClass = "parceiro-inativo";
      return (
        <div className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={this.handleRowClick} id={rowId}>
          <div className="container vertical-align-middle">
            {/*large displays*/}
            <div className="row hidden-lg-down">
              <div className="col-2">
                {row.CardCode}
              </div>
              <div className="col-6">
                {row.CardName} <span> {renderBadges()} </span>
              </div>
              <div className="col-2" id={rowId + "prc"}>
                {/* <span><Badge key={uuid()} color="info" className="badge-outline"> i </Badge></span> */}
                <span className="float-right">
                  {/* {row.FORMATED_PRICE} */}
                </span>
              </div>

              <div className="col-2 lastcol" id={rowId + "stk"}>
                {/* <span><Badge key={uuid()} color="info" className="badge-outline"> i </Badge></span> */}
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
      <BaseLandingPage
        pageTitle="Gestão de parceiros"
        searchPlaceholder="Procurar..."
        searchApiUrl="api/pns/"
        renderRow={renderRow}
        renderRowHeight={50}
        currentModal={this.state.currentModal}
        currentPopover={this.state.currentPopover}
        refresh={this.state.forceLandingPageRefresh}
        // actions={[
        //   {
        //     name: "add",
        //     color: "success",
        //     icon: "icon wb-plus",
        //     onClick: e => {
        //       this.setState({
        //         currentModal: <EditNewModal toggleModal={this.toggleModal} />
        //       });
        //     }
        //   }
        // ]}
      />
    );
  }
}

Parceiros.EditPage = EditPage;
export default Parceiros;
