import React, { Component } from "react";
import axios from 'axios';
import SearchPage from "../../components/SearchPage";
import { Badge } from "reactstrap";
import uuid from "uuid/v4";

// import { Badge } from "reactstrap";
// import uuid from "uuid/v4";
const sappy = window.sappy;
const $ = window.$;
import CmpUltRecebimentosFooter from "./CmpUltRecebimentosFooter";
import MeiosPagPagamentoModal from "./MeiosPagPagamentoModal";

class CmpUltRecebimentos extends Component {
    constructor(props) {
        super(props)
        this.state = { selectedRow: '' }
    }

    handleRowselection(e, row) {
        var rowDiv = $(e.target).closest(".byusVirtualRow")[0];
        let rowId = rowDiv.id;
        let { selectedRow } = this.state;
        if (selectedRow === rowId) {
            selectedRow = '';
        } else {
            selectedRow = rowId;
        }

        this.setState({ selectedRow, showActions: false });
    }


    render() {
        let that = this
        let { selectedRow, showActions } = this.state;

        let renderRowPN = ({ row, index }) => {
            let rowId = 'row_' + row.DocEntry
            const selected = rowId === selectedRow;
            let rowStyleClass = "";
            let r = { ...row }
            if (selected) rowStyleClass += " sappy-selected-row";

            const renderBadges = () => {
                const badges = row.ITEM_TAGS.split("|");
                return badges.map((item, ix) => {
                    let color = item.split("_")[0];
                    let text = item.split("_")[1];
                    return <Badge key={uuid()} color={color} pill>{text}</Badge>;
                });
            };

            return (
                <div id={rowId} className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={e => this.handleRowselection(e, r)}>
                    <div className="container vertical-align-middle">
                        <div className="row">
                            <div className="col-2 text-nowrap firstcol">       {sappy.format.datetime2(row.DOC_DATETIME)}  </div>
                            <div className="col-2 text-nowrap "> {row.DocNum}  </div>
                            <div className="col-6 text-nowrap "> {row.CardName + ' (' + row.CardCode + ")"}
                                {renderBadges()}
                            </div>
                            <div className="col-2 text-nowrap lastcol">  <span className="float-right">{sappy.format.amount(row.DocTotal)}</span> </div>
                        </div>
                    </div>
                </div>
            );
        };


        let getfixedActions = () => {
            let fixedActions = [];

            if (selectedRow) {
                fixedActions.push({
                    name: "main", color: "primary",
                    icon: showActions ? "icon wb-close animation-fade" : "icon wb-more-vertical",
                    onClick: e => { that.setState({ showActions: !showActions }) }
                })
                if (showActions) fixedActions.push({
                    name: "Cancelar documento", color: "danger",
                    icon: "icon fa-window-close",
                    onClick: e => {
                        let docEntry = selectedRow.split('_')[1];

                        sappy.showWaitProgress("A canelar documento...")

                        axios
                            .post(`/api/caixa/lastrec/${docEntry}/cancel`)
                            .then(result => {

                                sappy.hideWaitProgress()
                                sappy.showToastr({
                                    color: "success",
                                    msg: `Documento ${docEntry} cancelado!`
                                })

                                that.setState({ selectedRow: "", showActions: false },
                                    e => that.pnComponent.findAndGetFirstRows())
                            })
                            .catch(error => sappy.showError(error, "Não foi possivel cancelar o documento"));
                    }
                })
            }
            return fixedActions;
        };


        let footerProps = {
            fixedActions: getfixedActions(),
            actions: [
                // { name: "Numerário", color: "primary", icon: "icon fa-flash", visible: true, onClick: e => alert("teste"), showAtLeft: true },
                // { name: "Nenhuma", color: "default", icon: "icon fa-close", visible: true, onClick: e => { } },
            ]
        }


        return (
            <div>
                <div className="row">
                    <div className="col-12">
                        <SearchPage
                            ref={node => this.pnComponent = node}
                            searchPlaceholder="Procurar..."
                            searchApiUrl={`/api/caixa/lastrec`}
                            renderRow={renderRowPN}
                            placeholder={"Pesquisar o cliente"}
                            renderRowHeight={50}
                        />
                    </div>
                </div>
                <CmpUltRecebimentosFooter {...footerProps }></CmpUltRecebimentosFooter>

            </div>)

    }
}

export default CmpUltRecebimentos;
