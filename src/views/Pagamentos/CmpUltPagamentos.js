import React, { Component } from "react";
import axios from "axios";
import SearchPage from "../../components/SearchPage";
import { Badge } from "reactstrap";
import uuid from "uuid/v4";

// import { Badge } from "reactstrap";
// import uuid from "uuid/v4";
const sappy = window.sappy;
const $ = window.$;
import CmpFooter from "./CmpFooter";
// import ModalMeiosPagPagamento from "./ModalMeiosPagPagamento";

class CmpUltPagamentos extends Component {
  constructor(props) {
    super(props);

    this.cancelarRecebimento = this.cancelarRecebimento.bind(this);

    this.state = { selectedRowId: "", selectedRow: {} };
  }

  handleRowselection(e, row) {
    var rowDiv = $(e.target).closest(".byusVirtualRow")[0];
    let rowId = rowDiv.id;
    let { selectedRowId } = this.state;
    if (selectedRowId === rowId) {
      selectedRowId = "";
    } else {
      selectedRowId = rowId;
    }

    this.setState({ selectedRowId, selectedRow: row, showActions: false });
  }

  cancelarRecebimento() {
    let that = this;
    let { selectedRowId } = this.state;
    let docEntry = selectedRowId.split("_")[1];

    sappy.showSwal({
      input: "select",
      msg: `Porque deseja cancelar este recebimento?`,
      type: "question",
      inputPlaceholder: "Selecione o motivo...",
      inputOptions: {
        "Método de pagamento incorreto": "Método de pagamento incorreto",
        "Erro do utilizador": "Erro do utilizador",
        other: "Outro..."
      },
      inputValidator: function(value) {
        return new Promise(function(resolve, reject) {
          if (value) return resolve();
          return reject("Tem que seleccionar um motivo...");
        });
      },
      showCancelButton: true,
      onConfirm: value => {
        sappy.showSwal({
          title: "Cancelar recebimento?",
          type: "warning",
          confirmStyle: "warning",
          confirmText: "Cancelar Recebimento",
          input: value === "other" ? "text" : null,
          moreInfo: `Se continuar irá cancelar este recebimento.`,
          inputPlaceholder: "Escreva o outro motivo...",
          inputValidator: function(value) {
            return new Promise(function(resolve, reject) {
              if (value) return resolve();
              return reject("Tem que indicar o motivo...");
            });
          },
          showCancelButton: true,
          onConfirm: otherValue => {
            let reason = value === "other" ? otherValue : value;

            sappy.showWaitProgress("A cancelar documento...");

            axios
              .post(`/api/caixa/recebimentos/${docEntry}/cancel`, { reason })
              .then(result => {
                sappy.hideWaitProgress();
                sappy.showToastr({
                  color: "success",
                  msg: `Documento ${docEntry} cancelado!`
                });

                that.setState({ selectedRowId: "", showActions: false }, e => that.pnComponent.findAndGetFirstRows());
              })
              .catch(error => sappy.showError(error, "Não foi possivel cancelar o recebimento"));
          }
        });
      }
    });
  }

  render() {
    let that = this;
    let { selectedRowId, selectedRow, showActions } = this.state;

    let renderRowPN = ({ row, index }) => {
      let rowId = "row_" + row.DocEntry;
      const selected = rowId === selectedRowId;
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
                {" "}{row.DocNum}{" "}
              </div>
              <div className="col-6 text-nowrap ">
                {" "}{row.CardName + " (" + row.CardCode + ")"}
                {renderBadges()}
              </div>
              <div className="col-2 text-nowrap lastcol">
                {" "}<span className="float-right">{sappy.format.amount(row.DocTotal)}</span>{" "}
              </div>
            </div>
          </div>
        </div>
      );
    };

    let getfixedActions = () => {
      let naoEstaCancelado = (selectedRow.ITEM_TAGS || "").indexOf("Cancelado!") === -1;
      let fixedActions = [
        {
          name: "main",
          visible: selectedRowId && naoEstaCancelado,
          color: "primary",
          icon: showActions ? "icon wb-close animation-fade" : "icon wb-more-vertical",
          onClick: e => {
            that.setState({ showActions: !showActions });
          }
        },
        {
          name: "Cancelar documento",
          visible: showActions,
          color: "warning",
          icon: "icon fa-window-close",
          onClick: this.cancelarRecebimento
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
            <SearchPage ref={node => (this.pnComponent = node)} searchApiUrl={`/api/caixa/pagamentos`} renderRow={renderRowPN} renderRowHeight={50} />
          </div>
        </div>
        <CmpFooter {...footerProps} />
      </div>
    );
  }
}

export default CmpUltPagamentos;
