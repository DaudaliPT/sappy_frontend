import React, { Component } from "react";
import axios from 'axios';
import ByUsSearchPage2 from "../../../components/ByUsSearchPage2";

import { Badge } from "reactstrap";
import uuid from "uuid/v4";
const byUs = window.byUs;
const $ = window.$;
import CmpClassificacaoFooter from "./CmpClassificacaoFooter";
import MeiosPagRecebimentoModal from "./MeiosPagRecebimentoModal";
import MeiosPagPagamentoModal from "./MeiosPagPagamentoModal";

class CmpTransStock extends Component {
    constructor(props) {
        super(props);

        this.handlePNselection = this.handlePNselection.bind(this);
        this.handleDetailRowSelect = this.handleDetailRowSelect.bind(this);
        this.handleDocRefresh = this.handleDocRefresh.bind(this);
        this.setClass = this.setClass.bind(this);

        this.state = { selectedPN: '', selectedPNname: '', selectedDocKeys: [], shiftKey: false, ctrlKey: false }
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


    handlePNselection(e, row) {
        var rowDiv = $(e.target).closest(".byusVirtualRow")[0];

        let cardCode = rowDiv.id.split("_")[1];
        let { selectedPN, selectedPNname } = this.state;
        if (selectedPN === cardCode) {
            selectedPN = '';
            selectedPNname = "";
        } else {
            selectedPN = cardCode;
            selectedPNname = row.CARDNAME
        }

        this.setState({ selectedPN, selectedPNname, selectedDocKeys: [] });
    }


    handleDetailRowSelect(selectedDocKeys) {
        this.setState({ selectedDocKeys })
    }

    handleDocRefresh(e) {
        let { selectedDocKeys } = this.state;
        this.setState({ selectedDocKeys: [...selectedDocKeys] });
    }


    setClass(docClass) {
        let that = this;

        let docs = [];

        this.state.selectedDocKeys.forEach(docId => {
            let transId = docId.split('#')[0]
            let lineId = docId.split('#')[1]

            docs.push({
                transId: docId.split('#')[0],
                lineId: docId.split('#')[1]
            })

        })

        byUs.showWaitProgress("A classificar documentos...")
        axios
            .post(`/api/caixa/class/update?class=${docClass}`, docs)
            .then(result => {
                byUs.hideWaitProgress();
                //forçar refresh
                let selectedPN = that.state.selectedPN;
                that.setState({ selectedPN: '', selectedDocKeys: [] },
                    () => setTimeout(that.setState({ selectedPN }), 1)
                );
            })
            .catch(error => byUs.showError(error, "Não foi possivel atualizar classificação"));
    }

    render() {
        let { selectedPN, selectedPNname, selectedDocKeys } = this.state;
        let docsList = [];
        if (this.docsComponent) {
            docsList = this.docsComponent.state.listItems
        }

        const renderRowPN = ({ row, index }) => {

            const selected = row.CARDCODE === selectedPN;

            let rowStyleClass = "";
            let r = { ...row }
            if (selected) rowStyleClass += " byus-selected-row";


            let descDocs
            if (byUs.getNum(row.BALANCE) === byUs.getNum(row.TOTAL_BALANCE)) {
                descDocs = row.NUMDOCS + " " + (row.NUMDOCS === 1 ? " documento " : " documentos ");
            }
            else descDocs = byUs.format.amount(row.BALANCE) + ", " + row.NUMDOCS + " " + (row.NUMDOCS === 1 ? " documento " : " documentos ");

            return (
                <div id={'PN_' + row.CARDCODE} className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={e => this.handlePNselection(e, r)}>
                    <div className="container vertical-align-middle">
                        <div className="row">
                            <div className="col-10 text-nowrap firstcol"> {row.CARDNAME + ' (' + row.CARDCODE + ")"} </div>
                        </div>
                        <div className="row secondrow">
                            <div className="col-6 text-nowrap firstcol"> {descDocs}  </div>
                            <div className="col-6 text-nowrap lastcol">  <span className="float-right">{byUs.format.amount(row.TOTAL_BALANCE)}</span> </div>
                        </div>
                    </div>
                </div>
            );
        };

        let totalOfDocs = 0
        let totalOfSelectedDocs = 0
        let countC = 0
        let countD = 0
        if (this.docsComponent) {
            docsList.forEach(doc => {
                totalOfDocs += byUs.getNum(doc.BALANCE)
                let docId = doc.TRANSID_AND_LINEID;
                if (selectedDocKeys.indexOf(docId) > -1) {
                    totalOfSelectedDocs += byUs.getNum(doc.BALANCE)
                    countC += doc.U_apyCLASS === 'C' ? 1 : 0;
                    countD += doc.U_apyCLASS === 'D' ? 1 : 0;
                }
            })
        }

        let footerProps = {
            actions: [
                { name: "Nenhuma", color: "default", icon: "icon fa-close", visible: countC || countD, onClick: e => this.setClass('N') },
                { name: "Crédito", color: "warning", icon: "icon fa-warning", visible: countC !== selectedDocKeys.length, onClick: e => this.setClass('C') },
                { name: "Distribuição", color: "primary", icon: "icon fa-truck", visible: countD !== selectedDocKeys.length, onClick: e => this.setClass('D') },
                {
                    name: "ReceberOuPagar",
                    content: <span>{totalOfSelectedDocs > 0 ? "Receber " : "Pagar "}<strong>{byUs.format.amount(totalOfSelectedDocs)}</strong></span>,
                    color: totalOfSelectedDocs > 0 ? "success" : "danger",
                    icon: "icon fa-check",
                    visible: totalOfSelectedDocs !== 0,
                    onClick: e => {
                        if (totalOfSelectedDocs > 0)
                            return byUs.showModal(<MeiosPagRecebimentoModal
                                toggleModal={sucess => {
                                    //force refresh
                                    let selectedPN = this.state.selectedPN;
                                    this.setState({ selectedPN: '', selectedDocKeys: [] },
                                        () => setTimeout(this.setState({ selectedPN }), 1)
                                    );

                                    byUs.hideModal()
                                }}
                                selectedPN={selectedPN}
                                selectedPNname={selectedPNname}
                                selectedDocKeys={selectedDocKeys}
                                docsList={docsList}
                                totalReceber={totalOfSelectedDocs}
                            />)

                        if (totalOfSelectedDocs < 0)
                            return byUs.showModal(<MeiosPagPagamentoModal
                                toggleModal={sucess => {
                                    //force refresh
                                    let selectedPN = this.state.selectedPN;
                                    this.setState({ selectedPN: '', selectedDocKeys: [] },
                                        () => setTimeout(this.setState({ selectedPN }), 1)
                                    );

                                    byUs.hideModal()
                                }}
                                selectedPN={selectedPN}
                                selectedPNname={selectedPNname}
                                selectedDocKeys={selectedDocKeys}
                                docsList={docsList}
                                totalPagar={totalOfSelectedDocs * -1}
                            />)
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
                            autoRefreshTime={5000}
                            renderRow={renderRowPN}
                            placeholder={"Pesquisar o cliente"}
                            renderRowHeight={50}
                        />
                    </div>
                    <div className="col-6">
                        <ByUsSearchPage2
                            ref={node => this.docsComponent = node}
                            searchApiUrl={`/api/caixa/class/docs?cardcode=${selectedPN}`}
                            noRecordsMessage="Selecione primeiro um cliente"
                            onRefresh={this.handleDocRefresh}
                            renderRowHeight={35}
                            rowKey="TRANSID_AND_LINEID"
                            onRowSelectionChange={this.handleDetailRowSelect}
                            selectedKeys={selectedDocKeys}
                            fields={[
                                { name: 'REFDATE', label: 'Data', type: "date", width: 80, editable: false },
                                {
                                    name: 'DOCUMENTO', label: 'Documento', type: "text", width: 120, editable: false,
                                    onLinkClick: (props) => byUs.LinkTo(props.dependentValues.TransType, props.dependentValues.CreatedBy)
                                },
                                { name: 'DOCTOTAL', label: 'Total', type: "amount", width: 60, editable: false },
                                { name: 'BALANCE', label: 'Em aberto', type: "amount", width: 80, editable: false }
                            ]}
                            groupBy={[{ key: "GRUPO", name: "" }]}
                        />
                    </div>
                </div>
                {/* <p>{this.state.ctrlKey ? "ctrl" : ""} {this.state.shiftKey ? " shift" : ""}</p> */}
                <CmpClassificacaoFooter {...footerProps }></CmpClassificacaoFooter>

            </div>)

    }
}

export default CmpTransStock;
