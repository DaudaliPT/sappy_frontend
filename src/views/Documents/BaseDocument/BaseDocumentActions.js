
import React from "react";
import { hashHistory } from "react-router";
import axios from "axios";
import { ModalMessageConfirm } from "../../../Modals";

const byUs = window.byUs;
// const $ = window.$;

export default {

    handleOnApagar: (that) => {
        that.setState({
            currentModal: (
                <ModalMessageConfirm
                    title="Confirmar ação"
                    text="Deseja apagar este documento?"
                    btnCancelar="Cancelar"
                    iconCancelar="icon fa-close"
                    btnConfirmar="Apagar"
                    iconConfirmar="icon fa-trash"
                    color="danger"
                    moreInfo="Se continuar irá perder as informações já introduzidas."
                    toggleModal={(result) => {
                        that.setState({ currentModal: null });

                        if (result === "CONFIRMADO") {
                            that.serverRequest = axios
                                .delete(`${that.props.baseApiUrl}/${that.state.docData.ID}`)
                                .then(result => hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", '')))
                                .catch(error => byUs.showError(error, "Erro ao apagar dados"));
                        }
                    }}
                />
            )
        });
    },

    handleOnApagarLinhas: (that) => {

        let LINENUMS = that.refs.DocDetail.getSelectedRows();


        that.setState({
            currentModal: (
                <ModalMessageConfirm
                    title="Confirmar ação"
                    text="Deseja apagar estas linhas?"
                    btnCancelar="Cancelar"
                    iconCancelar="icon fa-close"
                    btnConfirmar="Apagar"
                    iconConfirmar="icon fa-trash"
                    color="danger"
                    moreInfo="Se continuar irá apagar as linhas selecionadas."
                    toggleModal={(result) => {
                        that.setState({ currentModal: null });

                        if (result === "CONFIRMADO") {
                            that.serverRequest = axios
                                .post(`${that.props.baseApiUrl}/${that.state.docData.ID}/deletelines`, {
                                    Lines: LINENUMS
                                })
                                .then(result => {
                                    let docData = { ...that.state.docData, ...result.data };
                                    that.setState({ hasSelectedRows: false, docData })
                                })
                                .catch(error => byUs.showError(error, "Não foi possível apagar linhas"));
                        }
                    }}
                />
            )
        });
    },

    handleOnCancelar: (that) => {

        if (!that.state.docData.ID) {
            hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", ''));
        } else {
            that.setState({
                currentModal: (
                    <ModalMessageConfirm
                        title="Confirmar ação"
                        text="Deseja manter ou apagar os dados já introduzidos?"
                        color="primary"
                        colorCancelar="warning"
                        btnCancelar="Apagar"
                        iconCancelar="icon fa-trash"
                        btnConfirmar="Manter"
                        iconConfirmar="icon fa-save"
                        moreInfo="Se escolher manter, as alterações ficarão disponiveis como rascunho..."
                        toggleModal={(result) => {
                            that.setState({ currentModal: null });
                            if (result === "CONFIRMADO") {
                                hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", ''))
                            } else if (result === "CANCELADO") {
                                that.serverRequest = axios
                                    .delete(`${that.props.baseApiUrl}/${that.state.docData.ID}`)
                                    .then(result => hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", '')))
                                    .catch(error => byUs.showError(error, "Erro ao apagar dados"));
                            }
                        }}
                    />
                )
            });
        }
    },

    handleOnConfirmar: (that) => {
        let onInvokeApiSuccess = (result) => {
            let data = result.data || {};

            // byUs.hideWaitProgress();

            if (data.message && data.message.indexOf("TOTALDIF") > -1) {

                byUs.showDanger({
                    msg: `O total ${data.DocTotal} € é diferente do esperado!`,
                    moreInfo: "A criação do documento foi cancelada.",
                    cancelText: "Cancelar",
                    cancelStyle: "success",
                    onCancel: () => { },
                    confirmText: "Adicionar mesmo assim",
                    // eslint-disable-next-line
                    onConfirm: () => invokeAddDocAPI(data.DocTotal)
                });
            } else {
                byUs.showSuccess({
                    title: "Documento criado",
                    moreInfo: `Criou com sucesso o documento ${result.data.DocNum}!`,
                    cancelText: "Adicionar outro",
                    onCancel: () => {
                        hashHistory.replace(hashHistory.getCurrentLocation().pathname + "?new=" + new Date().getTime())
                    },
                    confirmText: "Concluido",
                    onConfirm: () => hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", ''))
                })
            }
        }

        let invokeAddDocAPI = (forceTotal) => {

            byUs.showWaitProgress("A adicionar documento, aguarde por favor...");

            let url = `${that.props.baseApiUrl}/${that.state.docData.ID}/confirm`
            let data = { forceTotal }

            that.serverRequest = axios
                .post(url, { data })
                .then(result => onInvokeApiSuccess(result))
                .catch(error => {
                    // byUs.hideWaitProgress();
                    byUs.showError(error, "Erro ao criar documento")
                });
        }

        let performBeforeAddChecks = () => {
            //Validar campos de preenchimento obrigatório
            let newDocData = { ...that.state.docData };
            let fieldsRequired = []
            let hasChangesToState = false;
            Object.keys(that.props.headerFields).forEach(
                line => that.props.headerFields[line]
                    .filter(f => f.required && !that.state.docData[f.name])
                    .forEach(
                    f => {
                        fieldsRequired.push(f.label);
                        hasChangesToState = true;
                        newDocData[f.name + "_LOGICMSG"] = "danger|Preencha primeiro o campo " + f.label + "."
                    }))

            if (fieldsRequired.length > 0) {
                let msg = (fieldsRequired.length === 1 ? "O campo " : "Os campos ")
                    + fieldsRequired.join(", ")
                    + (fieldsRequired.length === 1 ? " não está preenchido." : " não estão preenchidos.");

                byUs.showToastr({ color: "danger", msg })
            }

            // Embora funcionasse, não é aqui que deve estar. Coloquei no backend
            // Validar a data do documento
            // if (newDocData.TAXDATE && byUs.moment(newDocData.TAXDATE).isAfter()) { //isAfter() sem parametros compara com now()
            //     hasChangesToState = true;
            //     newDocData["TAXDATE_LOGICMSG"] = "danger|Não pode ser superior à data atual."
            // }
            // if (newDocData.TAXDATE && newDocData.DOCDUEDATE && byUs.moment(newDocData.TAXDATE).isAfter(newDocData.DOCDUEDATE)) {
            //     hasChangesToState = true;
            //     newDocData["DOCDUEDATE_LOGICMSG"] = "danger|Não pode ser inferior à data do documento."
            // }


            if (hasChangesToState) return that.setState({ docData: newDocData });

            //Validar se há erros ativos
            let hasDanger = Object.keys(newDocData)
                .find(f => {
                    let aviso = newDocData[f + "_VALIDATEMSG"] || newDocData[f + "_LOGICMSG"] || '';
                    return aviso.startsWith("danger");
                })

            if (hasDanger) return byUs.showToastr({ color: "danger", msg: "Há campos com erros..." })

            //Validar se há avisos ativos
            let hasWarning = Object.keys(newDocData)
                .find(f => {
                    let aviso = newDocData[f + "_VALIDATEMSG"] || newDocData[f + "_LOGICMSG"] || '';
                    return aviso.startsWith("warning");
                })

            if (hasWarning) {
                return byUs.showWarning({
                    title: "Atenção!",
                    msg: "Ainda há campos com avisos!",
                    moreInfo: "Deseja mesmo assim criar este documento?",
                    onConfirm: invokeAddDocAPI,
                    confirmText: "Ignorar e criar documento",
                    onCancel: () => { }
                })
            } else {
                return byUs.showQuestion({
                    title: "Deseja Continuar?",
                    msg: "Se continuar irá criar este documento.",
                    onConfirm: invokeAddDocAPI,
                    confirmText: "Criar documento",
                    onCancel: () => { }
                })
            }
        }

        //wait for eventual updates on lost focus   
        setTimeout(performBeforeAddChecks, 1000);
    }
}