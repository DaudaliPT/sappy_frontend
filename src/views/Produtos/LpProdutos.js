import React, { Component } from "react";
import axios from "axios";
import { Popover, PopoverContent } from 'reactstrap';
const sappy = window.sappy;
const $ = window.$;

import { Badge } from "reactstrap";
import uuid from "uuid/v4";
import BaseLandingPage from "../BaseLandingPage";
import EditNewModal from "./EditNewModal";
import EditPage from "./EditPage";

import { hashHistory } from "react-router";

class Produtos extends Component {
  constructor(props) {
    super(props);
    this.toggleModal = this.toggleModal.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
    this.handleRowClick = this.handleRowClick.bind(this);

    this.hoverTimeOutHandle = 0

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
    let itemCode = id.split("_")[1];

    if (itemCode.indexOf("DRAFT") > -1) {
      this.setState({
        currentModal: <EditNewModal toggleModal={this.toggleModal} changeItemCode={itemCode} />
      });
    } else {
      hashHistory.push("/inv/oitm/" + itemCode);
    }
  }


  render() {
    let that = this;


    const renderRow = ({ row, index }) => {
      const badges = row.ITEM_TAGS.split("|");

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

      let rowId = "row_" + row.ItemCode
      let rowStyleClass = "";
      if (row.OnHand < 0) rowStyleClass = "artigo-sem-stock";
      if (row.frozenFor === "Y") rowStyleClass = "artigo-inativo";
      return (
        <div className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={this.handleRowClick} id={rowId} >
          <div className="container vertical-align-middle">

            {/*large displays*/}
            <div className="row hidden-lg-down">
              <div className="col-2"> {row.ItemCode} </div>
              <div className="col-6"> {row.ItemName} <span> {renderBadges()} </span> </div>
              <div className="col-2" id={rowId + "prc"}
                onMouseLeave={e => {
                  if (this.hoverTimeOutHandle) clearTimeout(this.hoverTimeOutHandle)
                  that.setState({ currentPopover: null })
                }}
                onMouseEnter={e => {
                  if (this.hoverTimeOutHandle) clearTimeout(this.hoverTimeOutHandle)
                  that.setState({ currentPopover: null })

                  that.hoverTimeOutHandle = setTimeout(function () {

                    if (that.hoverServerRequest && that.hoverServerRequest.abort) that.hoverServerRequest.abort();
                    that.hoverServerRequest = axios({ method: "get", url: `api/prod/${row.ItemCode}/priceinfo` })
                      .then(result => {
                        let content = []
                        result.data.forEach(row => {
                          content.push(<tr >
                            <td>{row.ListName}</td>
                            <td>{sappy.format.price(row.Price)}</td>
                            <td>{sappy.format.date(row.U_apyUPDATED)}</td>
                          </tr>)
                        });

                        let target = rowId + "prc";
                        let $le = $("#" + target);
                        if ($le.length === 0) return console.log("popover ignored because element does not exists anymore")

                        that.setState({
                          currentPopover:
                          <Popover className="animation-fadein" isOpen={true} target={target} toggle={this.togglePopover} placement="left" onMouseLeave={e => { that.setState({ currentPopover: null }) }}>
                            <PopoverContent><table>{content}</table></PopoverContent>
                          </Popover>
                        })


                      })
                      .catch(error => sappy.showError(error, "Erro ao obter dados"));


                  }, 300);
                }} >
                {/* <span><Badge key={uuid()} color="info" className="badge-outline"> i </Badge></span> */}
                <span className="float-right">{row.FORMATED_PRICE}</span>
              </div>

              <div className="col-2 lastcol" id={rowId + "stk"}
                onMouseLeave={e => {
                  if (that.hoverTimeOutHandle) clearTimeout(that.hoverTimeOutHandle)
                  that.setState({ currentPopover: null })
                }}
                onMouseEnter={e => {
                  if (that.hoverTimeOutHandle) clearTimeout(that.hoverTimeOutHandle)
                  that.setState({ currentPopover: null })

                  that.hoverTimeOutHandle = setTimeout(function () {
                    if (that.hoverServerRequest && that.hoverServerRequest.abort) that.hoverServerRequest.abort();
                    that.hoverServerRequest = axios({ method: "get", url: `api/prod/${row.ItemCode}/stockinfo` })
                      .then(result => {
                        let content = []

                        if (result.data.length === 0) content.push(<tr><td>Nenhum stock</td></tr>)
                        result.data.forEach(popuprow => {
                          content.push(<tr >
                            <td>{popuprow.WhsName}</td>
                            <td>{sappy.format.quantity(popuprow.OnHand, 0) + " " + row.InvntryUom}</td>
                          </tr>)
                        });

                        let target = rowId + "stk";
                        let $le = $("#" + target);
                        if ($le.length === 0) return console.log("popover ignored because element does not exists anymore")

                        that.setState({
                          currentPopover:
                          <Popover isOpen={true} target={target} toggle={this.togglePopover} placement="left" onMouseLeave={e => { that.setState({ currentPopover: null }) }}>
                            <PopoverContent><table>{content}</table></PopoverContent>
                          </Popover>
                        })

                      })
                      .catch(error => sappy.showError(error, "Erro ao obter dados"));
                  }, 300);
                }} >
                {/* <span><Badge key={uuid()} color="info" className="badge-outline"> i </Badge></span> */}
                <span className="float-right">{sappy.format.quantity(row.OnHand, 0) + " " + row.InvntryUom}</span>
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
                  <span className="float-right">{sappy.format.quantity(row.OnHand, 0)} Un</span>
                </div>
              </div>
            </div>
          </div>
        </div >
      );
    };

    return (
      <BaseLandingPage
        pageTitle="Gestão de artigos"
        searchPlaceholder="Procurar..."
        searchApiUrl="api/prod/"
        renderRow={renderRow}
        renderRowHeight={50}
        currentModal={this.state.currentModal}
        currentPopover={this.state.currentPopover}
        refresh={this.state.forceLandingPageRefresh}
        actions={[
          {
            name: "add",
            color: "success",
            icon: "icon wb-plus",
            onClick: e => {
              this.setState({
                currentModal: <EditNewModal toggleModal={this.toggleModal} />
              });
            }
          }
        ]}
      />
    ); 
  }
}

Produtos.EditPage = EditPage;
export default Produtos;
