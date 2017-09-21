import React, { Component } from "react";
import axios from 'axios';
import SearchPage from "../../../components/SearchPage";
import SearchPage2 from "../../../components/SearchPage2";

// import { Badge } from "reactstrap";
// import uuid from "uuid/v4";
const sappy = window.sappy;
const $ = window.$;
import CmpClassificacaoFooter from "./CmpClassificacaoFooter";
import MeiosPagPagamentoModal from "./MeiosPagPagamentoModal";

class CmpClassificacao extends Component {
    constructor(props) {
        super(props);

        this.handlePNselection = this.handlePNselection.bind(this);
        this.handleDetailRowSelect = this.handleDetailRowSelect.bind(this);
        this.handleDocRefresh = this.handleDocRefresh.bind(this);
        this.createReceiptOrPayment = this.createReceiptOrPayment.bind(this);
        this.setClass = this.setClass.bind(this);

        this.state = { selectedPN: '', selectedPNname: '', selectedDocKeys: [], shiftKey: false, ctrlKey: false }
    }

    // componentDidMount() {
    //     let that = this;
    //     $(window.document).on("keydown", function (e) {
    //         console.log(e)
    //         that.setState({
    //             shiftKey: e.shiftKey, ctrlKey: e.ctrlKey
    //         });
    //     });
    //     $(window.document).on("keyup", function (e) {
    //         that.setState({
    //             shiftKey: e.shiftKey, ctrlKey: e.ctrlKey
    //         });
    //     });
    // }

    // componentWillUnmount() {
    //     $(window.document).off("keydown");
    //     $(window.document).off("keyup");
    // }


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
        this.setState({
            selectedDocKeys,
            showActions: false
        })
    }

    handleDocRefresh(e) {
        let { selectedDocKeys } = this.state;
        this.setState({ selectedDocKeys: [...selectedDocKeys] });
    }

    createReceiptOrPayment(meioPag) {
        let that = this

        let invokeAddDocAPI = () => {
            let selectedPN = this.state.selectedPN;
            let docsList = [];
            if (this.docsComponent) docsList = this.docsComponent.state.listItems
            let totalOfSelectedDocs = 0
            let selectedDocs = docsList.filter(
                doc => this.state.selectedDocKeys.indexOf(doc.TRANSID_AND_LINEID) > -1)


            let data = {
                DocType: "rCustomer",
                CardCode: selectedPN,
                PaymentInvoices: []
            }
            selectedDocs.forEach(doc => {
                let InvoiceType = ""
                let transType = sappy.getNum(doc.TransType);
                if (transType === -3) InvoiceType = "it_ClosingBalance";
                else if (transType === -1) InvoiceType = "it_AllTransactions";
                else if (transType === -2) InvoiceType = "it_OpeningBalance";
                else if (transType === 13) InvoiceType = "it_Invoice";
                else if (transType === 14) InvoiceType = "it_CredItnote";
                else if (transType === 15) InvoiceType = "it_TaxInvoice"
                else if (transType === 16) InvoiceType = "it_Return";
                else if (transType === 18) InvoiceType = "it_PurchaseInvoice";
                else if (transType === 19) InvoiceType = "it_PurchaseCreditNote";
                else if (transType === 20) InvoiceType = "it_PurchaseDeliveryNote";
                else if (transType === 21) InvoiceType = "it_PurchaseReturn";
                else if (transType === 24) InvoiceType = "it_Receipt";
                else if (transType === 25) InvoiceType = "it_Deposit";
                else if (transType === 30) InvoiceType = "it_JournalEntry";
                else if (transType === 46) InvoiceType = "it_PaymentAdvice";
                else if (transType === 57) InvoiceType = "it_ChequesForPayment";
                else if (transType === 58) InvoiceType = "it_StockReconciliations";
                else if (transType === 59) InvoiceType = "it_GeneralReceiptToStock";
                else if (transType === 60) InvoiceType = "it_GeneralReleaseFromStock";
                else if (transType === 67) InvoiceType = "it_TransferBetweenWarehouses";
                else if (transType === 68) InvoiceType = "it_WorkInstructions";
                else if (transType === 76) InvoiceType = "it_DeferredDeposit";
                else if (transType === 132) InvoiceType = "it_CorrectionInvoice ";
                else if (transType === 163) InvoiceType = "it_APCorrectionInvoice ";
                else if (transType === 165) InvoiceType = "it_ARCorrectionInvoice ";
                else if (transType === 203) InvoiceType = "it_DownPayment ";
                else if (transType === 204) InvoiceType = "it_PurchaseDownPayment ";

                totalOfSelectedDocs += sappy.getNum(doc.BALANCE)

                if (sappy.getNum(doc.TransType) !== 24 && sappy.getNum(doc.TransType) !== 46) {
                    data.PaymentInvoices.push({
                        DocEntry: doc.CreatedBy,
                        InvoiceType,
                        PaidSum: doc.BALANCE
                    })
                }
                else {
                    data.PaymentInvoices.push({
                        DocEntry: doc.TransId,
                        DocLine: doc.Line_ID,
                        InvoiceType,
                        PaidSum: doc.BALANCE
                    })
                }
            })

            let strDocDesc = "recebimento"
            let url = `/api/caixa/class/receipt`
            if (totalOfSelectedDocs < 0) {
                strDocDesc = "pagamento"
                totalOfSelectedDocs *= -1;
                url = `/api/caixa/class/payment`;
            }

            if (meioPag === "Numerario") {
                data.CashSum = totalOfSelectedDocs;
                data.CashAccount = "111";
            } else if (meioPag === "Multibanco") {
                data.TransferSum = totalOfSelectedDocs
                data.TransferAccount = "118"
                data.TransferReference = 'MB'
            } else {
                return sappy.showError({ message: meioPag + " não reconhecido!" })
            }

            sappy.showWaitProgress("A criar documento...")
            axios
                .post(url, data)
                .then(result => {
                    sappy.hideWaitProgress()
                    sappy.showToastr({ color: "success", msg: `Criou com sucesso o ${strDocDesc} ${result.data.DocNum} no valor de ${sappy.format.amount(totalOfSelectedDocs)}, de ${this.state.selectedPNname}!` })

                    //forçar refresh
                    let selectedPN = that.state.selectedPN;
                    that.setState({ selectedPN: '', selectedDocKeys: [] },
                        () => setTimeout(that.setState({ selectedPN }), 1)
                    );
                })
                .catch(error => sappy.showError(error, "Não foi possivel adicionar o documento"));
        }

        invokeAddDocAPI()
        // if (!hasWarning)
        //   return sappy.showQuestion({
        //     title: "Deseja Continuar?",
        //     msg: "Se continuar irá criar este documento.",
        //     onConfirm: invokeAddDocAPI,
        //     confirmText: "Criar documento",
        //     onCancel: () => { }
        //   })
        // else
        //   return sappy.showWarning({
        //     title: "Atenção!",
        //     msg: "Ainda há campos com avisos!",
        //     moreInfo: "Deseja mesmo assim criar este documento?",
        //     onConfirm: invokeAddDocAPI,
        //     confirmText: "Ignorar e criar documento",
        //     onCancel: () => { }
        //   })
    }

    setClass(docClass) {
        let that = this;

        let docs = [];

        this.state.selectedDocKeys.forEach(docId => {
            docs.push({
                transId: docId.split('#')[0],
                lineId: docId.split('#')[1]
            })
        })

        sappy.showWaitProgress("A classificar documentos...")
        axios
            .post(`/api/caixa/class/update?class=${docClass}`, docs)
            .then(result => {
                sappy.hideWaitProgress();
                //forçar refresh
                let selectedPN = that.state.selectedPN;
                that.setState({ selectedPN: '', selectedDocKeys: [] },
                    () => setTimeout(that.setState({ selectedPN }), 1)
                );
            })
            .catch(error => sappy.showError(error, "Não foi possivel atualizar classificação"));
    }


    render() {
        let that = this;
        let { selectedPN, selectedPNname, selectedDocKeys } = this.state;
        let docsList = [];
        if (this.docsComponent) {
            docsList = this.docsComponent.state.listItems
        }

        let totalOfSelectedDocs = 0
        let countC = 0
        let countD = 0

        let selectedDocs = docsList.filter(doc => selectedDocKeys.indexOf(doc.TRANSID_AND_LINEID) > -1)
        selectedDocs.forEach(doc => {
            totalOfSelectedDocs += sappy.getNum(doc.BALANCE)
            countC += doc.U_apyCLASS === 'C' ? 1 : 0;
            countD += doc.U_apyCLASS === 'D' ? 1 : 0;
        })

        let renderRowPN = ({ row, index }) => {
            const selected = row.CARDCODE === selectedPN;
            let rowStyleClass = "";
            let r = { ...row }
            if (selected) rowStyleClass += " sappy-selected-row";

            let descDocs
            if (sappy.getNum(row.BALANCE) === sappy.getNum(row.TOTAL_BALANCE)) {
                descDocs = row.NUMDOCS + " " + (row.NUMDOCS === 1 ? " documento " : " documentos ");
            }
            else descDocs = sappy.format.amount(row.BALANCE) + ", " + row.NUMDOCS + " " + (row.NUMDOCS === 1 ? " documento " : " documentos ");

            return (
                <div id={'PN_' + row.CARDCODE} className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={e => this.handlePNselection(e, r)}>
                    <div className="container vertical-align-middle">
                        <div className="row">
                            <div className="col-10 text-nowrap firstcol"> {row.CARDNAME + ' (' + row.CARDCODE + ")"} </div>
                        </div>
                        <div className="row secondrow">
                            <div className="col-6 text-nowrap firstcol"> {descDocs}  </div>
                            <div className="col-6 text-nowrap lastcol">  <span className="float-right">{sappy.format.amount(row.TOTAL_BALANCE)}</span> </div>
                        </div>
                    </div>
                </div>
            );
        };


        let getfixedActions = () => {
            let currentShowActions = this.state.showActions;
            let fixedActions = [];

            if (totalOfSelectedDocs > 0) {
                fixedActions.push({
                    name: "main", color: "primary",
                    icon: currentShowActions ? "icon wb-close animation-fade" : "icon fa-flash",
                    onClick: e => this.setState({ showActions: !this.state.showActions })
                })

                if (currentShowActions) {
                    fixedActions.push({
                        name: "Númerario",
                        color: "success",
                        icon: "icon fa-money",
                        onClick: e => this.createReceiptOrPayment("Numerario")
                    })
                    fixedActions.push({
                        name: "Multibanco",
                        color: "success",
                        icon: "icon fa-credit-card",
                        onClick: e => this.createReceiptOrPayment("Multibanco")
                    })
                }
            }


            return fixedActions;
        };


        let footerProps = {
            fixedActions: getfixedActions(),

            actions: [
                // { name: "Multibanco", color: "primary", icon: "icon fa-flash", visible: true, onClick: e => alert("teste"), showAtLeft: true },
                // { name: "Numerário", color: "primary", icon: "icon fa-flash", visible: true, onClick: e => alert("teste"), showAtLeft: true },
                { name: "Nenhuma", color: "default", icon: "icon fa-close", visible: countC || countD, onClick: e => this.setClass('N') },
                { name: "Conta Corrente", color: "warning", icon: "icon fa-warning", visible: countC !== selectedDocKeys.length, onClick: e => this.setClass('C') },
                { name: "Distribuição", color: "primary", icon: "icon fa-truck", visible: countD !== selectedDocKeys.length, onClick: e => this.setClass('D') },
                {
                    name: "ReceberOuPagar",
                    content: <span>{totalOfSelectedDocs > 0 ? "Receber " : "Pagar "}<strong>{sappy.format.amount(totalOfSelectedDocs)}</strong></span>,
                    color: totalOfSelectedDocs > 0 ? "success" : "danger",
                    icon: "icon fa-check",
                    visible: totalOfSelectedDocs !== 0,
                    onClick: e => {
                        return sappy.showModal(<MeiosPagPagamentoModal
                            toggleModal={sucess => {
                                //force refresh
                                let selectedPN = this.state.selectedPN;
                                this.setState({ selectedPN: '', selectedDocKeys: [] },
                                    () => setTimeout(this.setState({ selectedPN }), 1)
                                );

                                sappy.hideModal()
                            }}
                            selectedPN={selectedPN}
                            selectedPNname={selectedPNname}
                            selectedDocKeys={selectedDocKeys}
                            docsList={docsList}
                            totalPagar={totalOfSelectedDocs}
                        />)
                    }
                }
            ]
        }


        return (
            <div>
                <div className="row">
                    <div className="col-6">
                        <SearchPage
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
                        <SearchPage2
                            ref={node => this.docsComponent = node}
                            searchApiUrl={`/api/caixa/class/docs?cardcode=${selectedPN}`}
                            noRecordsMessage="Selecione primeiro um cliente"
                            onRefresh={this.handleDocRefresh}
                            renderRowHeight={35}
                            rowKey="TRANSID_AND_LINEID"
                            onRowSelectionChange={this.handleDetailRowSelect}
                            selectedKeys={selectedDocKeys}
                            height={this.props.height}
                            fields={[
                                { name: 'REFDATE', label: 'Data', type: "date", width: 80, editable: false },
                                {
                                    name: 'DOCUMENTO', label: 'Documento', type: "text", width: 120, editable: false,
                                    onLinkClick: (props) => sappy.LinkTo(props.dependentValues.TransType, props.dependentValues.CreatedBy)
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

export default CmpClassificacao;
