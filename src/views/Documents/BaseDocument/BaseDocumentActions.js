
// import React from "react";
import { hashHistory } from "react-router";
import axios from "axios";

const byUs = window.byUs;
// const $ = window.$;

export default {

    handleOnApagarLinhas: (that) => {

        let LINENUMS = that.state.selectedLineNums;

        let title = "Apagar linha?"
        let confirmText = "Apagar linha"
        let moreInfo = "Se continuar a linha " + LINENUMS.toString() + " será removida do documento.";
        if (LINENUMS.length > 1) {
            title = "Apagar linhas?"
            confirmText = "Apagar linhas"
            moreInfo = "Se continuar as linhas " + LINENUMS.toString() + " serão removidas do documento.";
        }

        byUs.showDanger({
            title,
            moreInfo,
            confirmText,
            onConfirm: () => {
                that.serverRequest =
                    axios
                        .post(`${that.props.apiDocsNew}/${that.state.docData.ID}/deletelines`, {
                            Lines: LINENUMS
                        })
                        .then(result => {
                            let docData = { ...that.state.docData, ...result.data };
                            that.setState({ hasSelectedRows: false, docData })
                        })
                        .catch(error => byUs.showError(error, "Não foi possível apagar linhas"));
            },
            onCancel: () => { }
        })

    },

    handleOnCancelar: (that) => {
        if (!that.state.docData.ID) {
            hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", ''));
        } else {
            byUs.showQuestion({
                title: "Manter rascunho?",
                moreInfo: "Se escolher manter, as alterações ficarão disponiveis como rascunho e poderá continuar mais tarde...",
                onConfirm: () => { hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", '')) },
                cancelText: "Descartar",
                confirmText: "Manter rascunho",
                onCancel: () => {
                    that.serverRequest =
                        axios
                            .delete(`${that.props.apiDocsNew}/${that.state.docData.ID}`)
                            .then(result => hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", '')))
                            .catch(error => byUs.showError(error, "Erro ao apagar dados"));
                }
            })
        }
    },

    handleOnConfirmar: (that) => {
        let performChecks = () => {
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
            if (newDocData.TAXDATE && newDocData.DOCDUEDATE && byUs.moment(newDocData.TAXDATE).isAfter(newDocData.DOCDUEDATE)) {
                hasChangesToState = true;
                newDocData["DOCDUEDATE_LOGICMSG"] = "danger|Não pode ser inferior à data do documento."
            }

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




            //Alterações a documentos existentes
            let invokePatchDocAPI = (forceTotal) => {

                byUs.showWaitProgress("A atualizar documento, aguarde por favor...");

                let handlePatchDocApiResponse = (result) => {
                    byUs.showSuccess({
                        title: "Documento atualizado",
                        msg: `Atualizou com sucesso o documento ${result.data.DocNum}!`,
                        cancelText: "Adicionar novo",
                        onCancel: () => {
                            hashHistory.replace(hashHistory.getCurrentLocation().pathname + "?new=" + new Date().getTime())
                        },
                        confirmText: "Concluido",
                        onConfirm: () => hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", ''))
                    })

                }

                let url = `${that.props.apiDocsEdit}/${that.state.docData.DOCENTRY}/confirm`

                that.serverRequest = axios
                    .post(url)
                    .then(result => handlePatchDocApiResponse(result))
                    .catch(error => {
                        byUs.showError(error, "Erro ao gravar documento")
                    });
            }
            if (newDocData.DOCENTRY > 0 && hasWarning)
                return byUs.showWarning({
                    title: "Atenção!",
                    msg: "Ainda há campos com avisos!",
                    moreInfo: "Deseja mesmo assim gravar as alterações a este documento?",
                    onConfirm: invokePatchDocAPI,
                    confirmText: "Ignorar e gravar alterações",
                    onCancel: () => { }
                })

            if (newDocData.DOCENTRY > 0)
                return byUs.showQuestion({
                    title: "Deseja Continuar?",
                    msg: "Se continuar irá gravar as alterações a este documento.",
                    onConfirm: invokePatchDocAPI,
                    confirmText: "Gravar alterações",
                    onCancel: () => { }
                })


            // Novos documentos

            let invokeAddDocAPI = (forceTotal) => {

                byUs.showWaitProgress("A adicionar documento, aguarde por favor...");

                let handleAddDocApiResponse = (result) => {
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
                            msg: `Criou com sucesso o documento ${result.data.DocNum}!`,
                            cancelText: "Adicionar outro",
                            onCancel: () => {
                                hashHistory.replace(hashHistory.getCurrentLocation().pathname + "?new=" + new Date().getTime())
                            },
                            confirmText: "Concluido",
                            onConfirm: () => hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", ''))
                        })
                    }
                }

                let url = `${that.props.apiDocsNew}/${that.state.docData.ID}/confirm`
                let data = { forceTotal }

                that.serverRequest = axios
                    .post(url, { data })
                    .then(result => handleAddDocApiResponse(result))
                    .catch(error => {
                        // byUs.hideWaitProgress();
                        byUs.showError(error, "Erro ao criar documento")
                    });
            }
            if (hasWarning)
                return byUs.showWarning({
                    title: "Atenção!",
                    msg: "Ainda há campos com avisos!",
                    moreInfo: "Deseja mesmo assim criar este documento?",
                    onConfirm: invokeAddDocAPI,
                    confirmText: "Ignorar e criar documento",
                    onCancel: () => { }
                })

            return byUs.showQuestion({
                title: "Deseja Continuar?",
                msg: "Se continuar irá criar este documento.",
                onConfirm: invokeAddDocAPI,
                confirmText: "Criar documento",
                onCancel: () => { }
            })

        }



        //wait for eventual updates on lost focus   
        setTimeout(performChecks, 1000);
    }
}