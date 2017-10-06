import React, { Component } from "react";
import SearchPage from "../../components/SearchPage";
import axios from "axios";
import { Badge } from "reactstrap";
import { ButtonGetPdf } from "../../Inputs";
import uuid from "uuid/v4";

// import { Badge } from "reactstrap";
// import uuid from "uuid/v4";
const sappy = window.sappy;
const $ = window.$;
import CmpFooter from "./CmpFooter";
import ModalAdiantamento from "./ModalAdiantamento";
import ModalDespesa from "./ModalDespesa";

class CmpDespesas extends Component {
    constructor(props) {
        super(props)

        this.cancelarAdiantamento = this.cancelarAdiantamento.bind(this)
        this.fecharAdiantamento = this.fecharAdiantamento.bind(this)
        this.toggleModal = this.toggleModal.bind(this)

        this.state = {
            selectedRowId: '',
            selectedRow: {},
            defaultLayoutCode18: "",
            defaultLayoutCode46: "",
            settings: {}
        }
    }
    componentDidMount() {
        let that = this

        this.setState({
            settings: sappy.getSettings(["FIN.CCD.CAIXA_DIFERENCAS"])
        })


        axios
            .all([
                axios.get(`/api/docs/opch/report`),
                axios.get(`/api/caixa/despesas/dfltReport`)
            ])
            .then(axios.spread(function (r1, r2) {
                // debugger
                that.setState({
                    defaultLayoutCode18: r1.data.LayoutCode,
                    defaultLayoutCode46: r2.data.LayoutCode
                })
            }))
            .catch(function (error) {
                if (!error.__CANCEL__) sappy.showError(error, "Api error")
            });



    }

    handleRowselection(e, row) {
        var rowDiv = $(e.target).closest(".byusVirtualRow")[0];
        let rowId = rowDiv.id;
        let { selectedRowId } = this.state;
        if (selectedRowId === rowId) {
            selectedRowId = '';
        } else {
            selectedRowId = rowId;
        }

        this.setState({ selectedRowId, selectedRow: row, showActions: false });
    }

    cancelarAdiantamento() {
        let that = this
        let { selectedRowId } = this.state;

        let docEntry = selectedRowId.split('_')[2];


        sappy.showSwal({
            input: "select",
            msg: `Porque deseja cancelar este adiantamento?`,
            type: "question",
            inputPlaceholder: 'Selecione o motivo...',
            inputOptions: {
                "Despesa não foi necessária": "Despesa não foi necessária",
                "Erro do utilizador": "Erro do utilizador",
                other: "Outro...",
            },
            inputValidator: function (value) {
                return new Promise(function (resolve, reject) {
                    if (value) return resolve()
                    return reject('Tem que seleccionar um motivo...')
                })
            },
            onCancel: () => { },
            onConfirm: (value) => {
                sappy.showSwal({
                    title: "Cancelar adiantamento?",
                    type: "warning",
                    input: value === "other" ? "text" : null,
                    moreInfo: `Se continuar irá cancelar este adiantamento.`,
                    inputPlaceholder: 'Escreva o outro motivo...',
                    inputValidator: function (value) {
                        return new Promise(function (resolve, reject) {
                            if (value) return resolve()
                            return reject('Tem que indicar o motivo...')
                        })
                    },
                    onCancel: () => { },
                    onConfirm: (otherValue) => {
                        let reason = value === "other" ? otherValue : value;
                        sappy.showWaitProgress("A cancelar documento...")

                        axios
                            .post(`/api/caixa/despesas/adiantamentos/${docEntry}/cancel`, { reason })
                            .then(result => {

                                sappy.hideWaitProgress()
                                sappy.showToastr({
                                    color: "success",
                                    msg: `Adiantamento ${docEntry} cancelado!`
                                })

                                that.setState({ selectedRowId: "", showActions: false },
                                    e => that.pnComponent.findAndGetFirstRows())
                            })
                            .catch(error => sappy.showError(error, "Não foi possivel cancelar o adiantamento"));

                    }
                })
            }
        })
    }

    fecharAdiantamento() {
        let that = this
        let { selectedRow } = this.state;

        let data = {
            ...selectedRow,
            CAIXA_DIFERENCAS: this.state.settings['FIN.CCD.CAIXA_DIFERENCAS']
        }
        //Para que o c# faça o parse correctamente
        data.VALOR_ORIGINAL = sappy.getNum(data.VALOR_ORIGINAL)
        data.VALOR_PENDENTE = sappy.getNum(data.VALOR_PENDENTE)
        data.TransType = sappy.getNum(data.TransType)
        // let docEntry = selectedRowId.split('_')[2];

        sappy.showSwal({
            input: "select",
            msg: `Porque deseja fechar este adiantamento?`,
            type: "question",
            inputPlaceholder: 'Selecione o motivo...',
            inputOptions: {
                "Não foi pedida a fatura": "Não foi pedida a fatura",
                "Diferença minima no troco": "Diferença minima no troco",
                "Erro do utilizador": "Erro do utilizador",
                other: "Outro...",
            },
            inputValidator: function (value) {
                return new Promise(function (resolve, reject) {
                    if (value) return resolve()
                    return reject('Tem que seleccionar um motivo...')
                })
            },
            onCancel: () => { },
            onConfirm: (value) => {
                sappy.showSwal({
                    title: "Fechar adiantamento?",
                    type: "warning",
                    input: value === "other" ? "text" : null,
                    msg: "Lembrete importante:",
                    moreInfo: `Fechar um adiantamento, implica aceitar a perca do valor restante, que será colocado na caixa de diferenças!`,
                    inputPlaceholder: 'Escreva o outro motivo...',
                    inputValidator: function (value) {
                        return new Promise(function (resolve, reject) {
                            if (value) return resolve()
                            return reject('Tem que indicar o motivo...')
                        })
                    },
                    onCancel: () => { },
                    onConfirm: (otherValue) => {
                        sappy.showWaitProgress("A fechar adiantamento...")

                        // Gardar o motivo
                        data.Comments = value === "other" ? otherValue : value;
                        axios
                            .post(`/api/caixa/despesas/fecharadiantamento`, data)
                            .then(result => {
                                sappy.hideWaitProgress()
                                debugger
                                sappy.showToastr({
                                    color: "success",
                                    msg: `Criou com sucesso o recibo ${result.data.DocNum} para a caixa de diferenças!`
                                })

                                that.setState({ selectedRowId: "", showActions: false },
                                    e => that.pnComponent.findAndGetFirstRows())
                            })
                            .catch(error => sappy.showError(error, "Não foi possivel fechar o adiantamento"));

                    }
                })
            }
        })
    }

    toggleModal({ success } = {}) {
        sappy.hideModal()
        this.pnComponent.findAndGetFirstRows()
    }

    render() {
        let that = this
        let { selectedRowId, selectedRow, showActions } = this.state;

        let renderRowPN = ({ row, index }) => {
            let rowId = 'row_' + row.TransType + "_" + row.CreatedBy
            const selected = rowId === selectedRowId;
            let rowStyleClass = "";
            let r = { ...row }
            if (selected) rowStyleClass += " sappy-selected-row";

            let parcialmentePago = sappy.getNum(row.VALOR_ORIGINAL) - sappy.getNum(row.VALOR_PENDENTE) !== 0

            const renderBadges = () => {
                const badges = row.ITEM_TAGS.split("|");
                return badges.map((item, ix) => {
                    let color = item.split("_")[0];
                    let text = item.split("_")[1];
                    return <Badge key={uuid()} color={color} pill>{text}</Badge>;
                });
            };

            let entidade = row.CardCode + ' - ' + row.CardName
            if (row.TransType === "46") {
                rowStyleClass += sappy.getNum(row.VALOR_PENDENTE) !== 0 ? " vlist-row-danger" : " vlist-row-warning";
                entidade = "Adiantamento a "
                    + row.ContactName
                    + (row.CounterRef ? ", " + row.CounterRef : "")
                    + (row.Comments ? ", " + row.Comments : "")
            }

            return (
                <div id={rowId} className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={e => this.handleRowselection(e, r)}>
                    <div className="container vertical-align-middle">
                        <div className="row">
                            <div className="col-3 text-nowrap firstcol">
                                {sappy.format.datetime2(row.DOC_DATETIME)}
                                <span className="pl-15">
                                    {row.TransType + " - " + row.BaseRef}
                                </span>
                            </div>
                            <div className="col-5 text-nowrap "> {entidade}
                                {renderBadges()}
                            </div>
                            <div className="col-2 text-nowrap ">  <span className="float-right">{parcialmentePago ? sappy.format.amount(row.VALOR_ORIGINAL) : ""}</span> </div>
                            <div className="col-2 text-nowrap lastcol">
                                <span className="float-right">
                                    {sappy.format.amount(row.VALOR_PENDENTE) + " "}
                                    <ButtonGetPdf CreatedBy={row.CreatedBy} ObjectID={row.TransType} defaultLayoutCode={this.state["defaultLayoutCode" + row.TransType]} />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };


        let getfixedActions = () => {

            let isAdiantamentoSelected = (selectedRowId.indexOf("_46_") > -1);
            let adiantamentoParcialmentePago = sappy.getNum(selectedRow.VALOR_ORIGINAL) - sappy.getNum(selectedRow.VALOR_PENDENTE) !== 0

            let fixedActions = [
                {
                    name: "main",
                    visible: true,
                    color: isAdiantamentoSelected ? "primary" : "success",
                    icon: showActions
                        ? "icon wb-close animation-fade"
                        : (isAdiantamentoSelected ? "icon wb-more-vertical" : "icon wb-plus"),
                    onClick: e => { that.setState({ showActions: !showActions }) }
                },
                {
                    name: "Cancelar adiantamento",
                    visible: isAdiantamentoSelected && !adiantamentoParcialmentePago && showActions,
                    color: "warning",
                    icon: "icon fa-window-close",
                    onClick: this.cancelarAdiantamento
                },
                {
                    name: "Fechar adiantamento",
                    visible: isAdiantamentoSelected && showActions,
                    color: "danger",
                    icon: "icon fa-window-close",
                    onClick: this.fecharAdiantamento
                },
                {
                    name: "Novo adiantamento",
                    visible: !isAdiantamentoSelected && showActions,
                    color: "success", icon: "icon fa-money",
                    onClick: e => {
                        that.setState({ showActions: false })
                        return sappy.showModal(<ModalAdiantamento toggleModal={this.toggleModal} />)
                    }
                },
                {
                    name: "Nova despesa",
                    visible: !isAdiantamentoSelected && showActions,
                    color: "success", icon: "icon fa-file-text-o",
                    onClick: e => {
                        that.setState({ showActions: false })
                        return sappy.showModal(<ModalDespesa toggleModal={this.toggleModal} />)
                    }
                }
            ]
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
                            searchApiUrl={`/api/caixa/despesas`}
                            renderRow={renderRowPN}
                            renderRowHeight={50}
                        />
                    </div>
                </div>
                <CmpFooter {...footerProps }></CmpFooter>

            </div>)

    }
}

export default CmpDespesas;
