import React, { Component } from "react";
import axios from 'axios';
import ByUsSearchPage from "../../../components/ByUsSearchPage";

import { Badge } from "reactstrap";
import uuid from "uuid/v4";
const byUs = window.byUs;
const $ = window.$;
import CmpClassificacaoFooter from "./CmpClassificacaoFooter";
import ModPagModal from "./ModPagModal";

class CmpTransStock extends Component {
    constructor(props) {
        super(props);

        this.handlePNselection = this.handlePNselection.bind(this);
        this.handleDocSelection = this.handleDocSelection.bind(this);
        this.setClass = this.setClass.bind(this);

        this.state = { selectedPN: '', selectedDocs: [], shiftKey: false, ctrlKey: false }


    }

    componentDidMount() {
        let that = this;
        $(window.document).on("keydown", function (e) {
            console.log(e)
            that.setState({
                shiftKey: e.shiftKey, ctrlKey: e.ctrlKey
            });
        });
        $(window.document).on("keyup", function (e) {
            that.setState({
                shiftKey: e.shiftKey, ctrlKey: e.ctrlKey
            });
        });
    }

    componentWillUnmount() {
        $(window.document).off("keydown");
        $(window.document).off("keyup");
    }


    handlePNselection(e) {
        var rowDiv = $(e.target).closest(".byusVirtualRow")[0];

        let cardCode = rowDiv.id.split("_")[1];
        let { selectedPN } = this.state;
        if (selectedPN === cardCode) selectedPN = ''; else selectedPN = cardCode;

        this.setState({ selectedPN, selectedDocs: [] });
    }

    handleDocSelection(e) {
        var rowDiv = $(e.target).closest(".byusVirtualRow")[0];

        let id = rowDiv.id;
        let transIdAndLine = id.split("_")[1];
        let { selectedDocs } = this.state;
        let ix = selectedDocs.indexOf(transIdAndLine);

        if (ix === -1) {
            selectedDocs.push(transIdAndLine);
        } else {
            if (ix > -1) selectedDocs.splice(ix, 1);
        }

        this.setState({ selectedDocs });
    }

    setClass(docClass) {
        let that = this;
        this.state.selectedDocs.forEach(docId => {
            let transId = docId.split('#')[0]
            let lineId = docId.split('#')[1]
            axios
                .post(`/api/caixa/class/update?transid=${transId}&line=${lineId}&class=${docClass}`)
                .then(result => {
                    //forçar refresh
                    let selectedPN = that.state.selectedPN;
                    that.setState({ selectedPN: '', selectedDocs: [] },
                        () => setTimeout(that.setState({ selectedPN }), 1)
                    );
                })
                .catch(error => byUs.showError(error, "Não foi possivel atualizar classificação"));
        })
    }

    render() {
        let { selectedPN, selectedDocs } = this.state;
        let docsList = [];
        if (this.docsComponent) docsList = this.docsComponent.state.listItems

        const renderRowPN = ({ row, index }) => {

            const selected = row.CARDCODE === selectedPN;

            let rowStyleClass = "";
            if (selected) rowStyleClass += " byus-selected-row";
            return (
                <div id={'PN_' + row.CARDCODE} className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={this.handlePNselection}>
                    <div className="container vertical-align-middle">
                        <div className="row">
                            <div className="col-10 text-nowrap firstcol"> {row.CARDNAME + ' (' + row.CARDCODE + ")"} </div>
                        </div>
                        <div className="row secondrow">
                            <div className="col-6 text-nowrap firstcol"> {row.NUMDOCS + " " + (row.NUMDOCS === 1 ? " documento" : " documentos")}  </div>
                            <div className="col-6 text-nowrap lastcol">  <span className="float-right">{byUs.format.amount(row.BALANCE)}</span> </div>
                        </div>
                    </div>
                </div>
            );
        };

        const renderRowDocs = ({ row, index }) => {

            let rowId = "TRANS_" + row.TransId + '#' + row.Line_ID;
            const selected = selectedDocs.indexOf(row.TransId + '#' + row.Line_ID) > -1;
            let rowStyleClass = "";
            if (selected) rowStyleClass += " byus-selected-row";
            return (
                <div id={rowId} className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={this.handleDocSelection} title={row.TransId}>
                    <div className="container vertical-align-middle">

                        <div className="row">
                            <div className="col-4 text-nowrap firstcol">
                                {row.ABREV + ' ' + row.DOCNUM}

                                {row.U_apyCLASS === "C" && <Badge key={uuid()} color="warning" pill>C</Badge>}
                                {row.U_apyCLASS === "D" && <Badge key={uuid()} color="primary" pill>D</Badge>}
                            </div>
                            <div className="col-4 text-nowrap"> {byUs.format.date(row.TAXDATE)}  </div>
                            <div className="col-2 text-nowrap">
                                <span className="float-right">{
                                    row.BALANCE !== row.DOCTOTAL ? "(" + byUs.format.amount(row.DOCTOTAL) + ") " : ""
                                }</span> </div>
                            <div className="col-2 text-nowrap lastcol">
                                <span className="float-right">{byUs.format.amount(row.BALANCE)}</span> </div>
                        </div>

                    </div>
                </div>
            );
        };

        let totalOfSelectedDocs = 0
        let showClassNone = false;
        let showClassC = false;
        let showClassD = false;
        if (this.docsComponent) {
            docsList.forEach(doc => {
                let docId = doc.TransId + '#' + doc.Line_ID;
                if (selectedDocs.indexOf(docId) > -1) {
                    totalOfSelectedDocs += byUs.getNum(doc.BALANCE)
                    showClassNone = (doc.TransType === '13' && selectedDocs.length === 1 && !(doc.U_apyCLASS === 'N' || !doc.U_apyCLASS));
                    showClassC = (doc.TransType === '13' && selectedDocs.length === 1 && doc.U_apyCLASS !== 'C');
                    showClassD = (doc.TransType === '13' && selectedDocs.length === 1 && doc.U_apyCLASS !== 'D');
                }
            })
        }

        let footerProps = {
            actions: [
                { name: "Nenhuma", color: "default", icon: "icon fa-close", visible: showClassNone, onClick: e => this.setClass('N') },
                { name: "Crédito", color: "warning", icon: "icon fa-warning", visible: showClassC, onClick: e => this.setClass('C') },
                { name: "Distribuição", color: "primary", icon: "icon fa-truck", visible: showClassD, onClick: e => this.setClass('D') },
                {
                    name: "Receber",
                    content: <span>Receber <strong>{byUs.format.amount(totalOfSelectedDocs)}</strong></span>,
                    color: "success", icon: "icon fa-check", visible: totalOfSelectedDocs > 0, onClick: e => {
                        byUs.showModal(<ModPagModal modal={true}
                            toggleModal={sucess => {
                                //force refresh
                                let selectedPN = this.state.selectedPN;
                                this.setState({ selectedPN: '', selectedDocs: [] },
                                    () => setTimeout(this.setState({ selectedPN }), 1)
                                );

                                byUs.hideModal()
                            }}
                            selectedPN={selectedPN}
                            selectedDocs={selectedDocs}
                            docsList={docsList}
                            totalReceber={totalOfSelectedDocs} />)
                    }
                }
            ]
        }


        return (
            <div>
                <div className="row">
                    <div className="col-6">
                        <ByUsSearchPage
                            ref={node => this.pnComponent = node}
                            searchPlaceholder="Procurar..."
                            searchApiUrl={`/api/caixa/class/pn`}
                            noRecordsMessage="Não há registos a mostrar"
                            autoRefreshTime={5000}
                            renderRow={renderRowPN}
                            placeholder={"Pesquisar o cliente"}
                            renderRowHeight={50}
                        />
                    </div>
                    <div className="col-6">
                        <ByUsSearchPage
                            ref={node => this.docsComponent = node}
                            searchPlaceholder="Procurar..."
                            searchApiUrl={`/api/caixa/class/docs?cardcode=${selectedPN}`}
                            noRecordsMessage="Selecione primeiro um cliente"
                            renderRow={renderRowDocs}
                            renderRowHeight={50}
                        />
                    </div>
                </div>
                {/* <p>{this.state.ctrlKey ? "ctrl" : ""} {this.state.shiftKey ? " shift" : ""}</p> */}
                <CmpClassificacaoFooter {...footerProps}></CmpClassificacaoFooter>

            </div>)

    }
}

export default CmpTransStock;
