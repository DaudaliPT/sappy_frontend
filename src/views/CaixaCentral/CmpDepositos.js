import React, { Component } from "react";
import SearchPage from "../../components/SearchPage";
// import axios from "axios";
import { Badge } from "reactstrap";
import { ButtonGetPdf } from "../../Inputs";
import uuid from "uuid/v4";

// import { Badge } from "reactstrap";
// import uuid from "uuid/v4";
const sappy = window.sappy;
const $ = window.$;
import CmpFooter from "./CmpFooter";
import ModalDeposito from "./ModalDeposito";

class CmpDepositos extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRow: "",
      defaultLayoutCode: ""
    };
  }
  handleRowselection(e, row) {
    var rowDiv = $(e.target).closest(".byusVirtualRow")[0];
    let rowId = rowDiv.id;
    let { selectedRow } = this.state;
    if (selectedRow === rowId) {
      selectedRow = "";
    } else {
      selectedRow = rowId;
    }

    this.setState({ selectedRow, showActions: false });
  }

  render() {
    let that = this;
    let { selectedRow } = this.state;

    let renderRowPN = ({ row, index }) => {
      let rowId = "row_" + row.DeposId;
      const selected = rowId === selectedRow;
      let rowStyleClass = "";
      let r = { ...row };
      if (selected) rowStyleClass += " sappy-selected-row";

      const renderBadges = () => {
        const badges = row.ITEM_TAGS.split("|");
        return badges.map((item, ix) => {
          let color = item.split("_")[0];
          let text = item.split("_")[1];
          return (
            <Badge key={uuid()} color={color} pill>
              {text}
            </Badge>
          );
        });
      };

      return (
        <div id={rowId} className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={e => this.handleRowselection(e, r)}>
          <div className="container vertical-align-middle">
            <div className="row">
              <div className="col-2 text-nowrap firstcol">
                {" "}{sappy.format.datetime2(row.DOC_DATETIME)}{" "}
              </div>
              <div className="col-2 text-nowrap ">
                {" "}{row.DeposNum}{" "}
              </div>
              <div className="col-5 text-nowrap ">
                {" "}{row.DpsBank ? row.BanckAcct + " - " + row.DpsBank : row.Memo}
                {renderBadges()}
              </div>
              <div className="col-2 text-nowrap ">
                {" "}<span className="float-right">{sappy.format.amount(row.LocTotal)}</span>{" "}
              </div>
              <div className="col-1 lastcol">
                {" "}<ButtonGetPdf DocEntry={row.DeposId} ObjectID={row.ObjType} defaultLayoutCode={this.state.defaultLayoutCode} />{" "}
              </div>
            </div>
          </div>
        </div>
      );
    };

    let getfixedActions = () => {
      let fixedActions = [
        {
          name: "addnew",
          visible: true,
          color: "success",
          icon: "icon wb-plus",
          onClick: e => {
            return sappy.showModal(
              <ModalDeposito
                defaultLayoutCode={this.state.defaultLayoutCode}
                toggleModal={({ success } = {}) => {
                  sappy.hideModal();
                  that.pnComponent.findAndGetFirstRows();
                }}
              />
            );
          }
        }
      ];
      return fixedActions;
    };

    let footerProps = {
      fixedActions: getfixedActions(),
      actions: [
        // { name: "Numerário", color: "primary", icon: "icon fa-flash", visible: true, onClick: e => alert("teste"), showAtLeft: true },
        // { name: "Nenhuma", color: "default", icon: "icon fa-close", visible: true, onClick: e => { } },
      ]
    };

    return (
      <div>
        <div className="row">
          <div className="col-12">
            <SearchPage ref={node => (this.pnComponent = node)} searchApiUrl={`/api/caixa/depositos`} renderRow={renderRowPN} renderRowHeight={50} />
          </div>
        </div>
        <CmpFooter {...footerProps} />
      </div>
    );
  }
}

export default CmpDepositos;
