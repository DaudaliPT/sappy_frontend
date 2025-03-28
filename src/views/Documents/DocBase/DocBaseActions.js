import React from "react";
import { hashHistory } from "react-router";
import axios from "axios";
import ModalLinks from "./ModalLinks";
const sappy = window.sappy;
// const $ = window.$;

export default {
  handleOnApagarLinhas: that => {
    let LINENUMS = that.state.selectedLineNums;

    let title = "Apagar linha?";
    let confirmText = "Apagar linha";
    let moreInfo = "Se continuar a linha " + LINENUMS.toString() + " será removida do documento.";
    if (LINENUMS.length > 1) {
      title = "Apagar linhas?";
      confirmText = "Apagar linhas";
      moreInfo = "Se continuar as linhas " + LINENUMS.toString() + " serão removidas do documento.";
    }

    sappy.showDanger({
      title,
      moreInfo,
      confirmText,
      onConfirm: () => {
        that.serverRequest = axios
          .post(`${that.props.apiDocsNew}/${that.state.docData.ID}/deletelines`, {
            Lines: LINENUMS
          })
          .then(result => {
            let docData = { ...that.state.docData, ...result.data };
            that.setState({ selectedLineNums: [], docData });
          })
          .catch(error => sappy.showError(error, "Não foi possível apagar linhas"));
      },
      onCancel: () => { }
    });
  },

  handleOnCancelar: that => {
    if (!that.state.docData.ID) {
      hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", ""));
    } else {
      sappy.showQuestion({
        title: "Manter rascunho?",
        moreInfo: "Se escolher manter, as alterações ficarão disponiveis como rascunho e poderá continuar mais tarde...",
        onConfirm: () => {
          hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", ""));
        },
        cancelText: that.state.docData.UNAPOR_BASEENTRY?"Rejeitar documento":"Descartar",
        cancelStyle: "danger btn-outline",
        confirmText: "Manter rascunho",
        confirmStyle: "success",
        onCancel: () => {
          if (that.state.docData.UNAPOR_BASEENTRY){
            that.serverRequest = axios
              .post(`${that.props.apiDocsNew}/reject/${that.state.docData.ID}`)
              .then(result => hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", "")))
              .catch(error => sappy.showError(error, "Erro ao rejeitar documento"));
          }
          else {
            that.serverRequest = axios
              .delete(`${that.props.apiDocsNew}/${that.state.docData.ID}`)
              .then(result => hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", "")))
              .catch(error => sappy.showError(error, "Erro ao apagar dados"));
          }
        }
      });
    }
  },

  handleExport: ({ that, cmd }) => {
    let objType = that.state.docData.OBJTYPE;
    let docEntry = that.state.docData.DOCENTRY;
    let url = `/api/reports/${cmd}/${objType}/${docEntry}`;

    if (cmd === "print") {
      axios.get(url).then(result => sappy.showToastr({ color: "success", msg: "Documento impresso!" })).catch(error => sappy.showError(error, "Não foi possivel imprimir o documento"));
    } else {
      var baseUrl = ""; // Nota: Em desenv, é preciso redirecionar o pedido. Já em produtivo a api é servida na mesma porta do pedido
      if (window.location.port === "3000") baseUrl = "http://byusserver:3005";
      window.open(baseUrl + url, "_blank");
    }
  },

  handleGetDocLinks: ({ that }) => {
    let docEntry = that.state.docData.DOCENTRY;
    axios
      .get(`${that.props.apiDocsEdit}/${docEntry}/links`)
      .then(function (result) {
        sappy.showModal(<ModalLinks data={result.data} />);
      })
      .catch(error => sappy.showError(error, "Erro ao obter dados"));
  },

  handleForwardDocument: ({ that, toObjtype }) => {
    let docEntry = that.state.docData.DOCENTRY;
    axios
      .post(`${that.props.apiDocsNew}/${docEntry}/migrate/${toObjtype}`)
      .then(function (result) {
        let docInfo = sappy.b1.sapObjectInfo({ objectCode: toObjtype });

        hashHistory.push({
          pathname: docInfo.landingPage + "doc",
          state: { id: result.data.ID }
        });
        // setImmediate(() => sappy.showToastr({ color: "success", msg: "Documento migrado com sucesso." }));
      })
      .catch(error => sappy.showError(error, "Erro ao obter dados"));
  },

  handleOnCancelarDocumento: ({ that, apiDocsEdit }) => {
    sappy.showQuestion({
      title: "Cancelar Documento?",
      moreInfo: "Cancelar um documento é uma acção irreversível. Confirma que deseja cancelar o documento?",
      cancelText: "Cancelar",
      confirmText: "Cancelar Documento",
      confirmStyle: "danger",
      onConfirm: () => {
        let docEntry = that.state.docData.DOCENTRY;
        axios
          .post(`${that.props.apiDocsEdit}/${docEntry}/canceldoc`)
          .then(function (result) {
            hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", ""));

            sappy.showToastr({ color: "success", msg: "Documento cancelado." });
          })
          .catch(error => sappy.showError(error, "Erro ao cancelar documento"));
      }
    });
  },
  handleOnFecharDocumento: ({ that }) => {
    sappy.showQuestion({
      title: "Fechar Documento?",
      moreInfo: "Fechar um documento é uma acção irreversível. Confirma que deseja fechar o documento?",
      cancelText: "Cancelar",
      confirmText: "Fechar Documento",
      confirmStyle: "danger",
      onConfirm: () => {
        let docEntry = that.state.docData.DOCENTRY;
        axios
          .post(`${that.props.apiDocsEdit}/${docEntry}/closedoc`)
          .then(function (result) {
            hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", ""));

            sappy.showToastr({ color: "success", msg: "Documento fechado." });
          })
          .catch(error => sappy.showError(error, "Erro ao fechar documento"));
      }
    });
  },
  handleOnDuplicarDocumento: ({ that }) => {
    let docEntry = that.state.docData.DOCENTRY;
    axios
      .post(`${that.props.apiDocsNew}/${docEntry}/clone`)
      .then(function (result) {
        hashHistory.push({
          pathname: hashHistory.getCurrentLocation().pathname,
          state: { id: result.data.ID }
        });
        // setImmediate(() => sappy.showToastr({ color: "success", msg: "Documento duplicado com sucesso." }));
      })
      .catch(error => sappy.showError(error, "Erro ao duplicar documento"));
  },

  handleMovePrevious: ({ that }) => {
    let docEntry = that.state.docData.DOCENTRY;
    axios
      .get(`${that.props.apiDocsEdit}/${docEntry}/previous`)
      .then(function (result) {
        hashHistory.push({
          pathname: hashHistory.getCurrentLocation().pathname,
          state: { DocEntry: result.data }
        });
      })
      .catch(error => sappy.showError(error, "Erro ao mover para anterior"));
  },

  handleMoveNext: ({ that }) => {
    let docEntry = that.state.docData.DOCENTRY;
    axios
      .get(`${that.props.apiDocsEdit}/${docEntry}/next`)
      .then(function (result) {
        hashHistory.push({
          pathname: hashHistory.getCurrentLocation().pathname,
          state: { DocEntry: result.data }
        });
      })
      .catch(error => sappy.showError(error, "Erro ao mover para seguinte"));
  },
  handleOnConfirmar: that => {
    let performChecks = () => {
      //Validar campos de preenchimento obrigatório
      let newDocData = { ...that.state.docData };
      let fieldsRequired = [];
      let hasChangesToState = false;
      Object.keys(that.props.headerFields).forEach(line =>
        that.props.headerFields[line].filter(f => f.required && !that.state.docData[f.name]).forEach(f => {
          fieldsRequired.push(f.label);
          hasChangesToState = true;
          newDocData[f.name + "_LOGICMSG"] = "danger|Preencha primeiro o campo " + f.label + ".";
        })
      );

      if (fieldsRequired.length > 0) {
        let msg = (fieldsRequired.length === 1 ? "O campo " : "Os campos ") + fieldsRequired.join(", ") + (fieldsRequired.length === 1 ? " não está preenchido." : " não estão preenchidos.");

        sappy.showToastr({ color: "danger", msg });
      }

      // Embora funcionasse, não é aqui que deve estar. Coloquei no backend
      // Validar a data do documento
      // if (newDocData.TAXDATE && sappy.moment(newDocData.TAXDATE).isAfter()) { //isAfter() sem parametros compara com now()
      //     hasChangesToState = true;
      //     newDocData["TAXDATE_LOGICMSG"] = "danger|Não pode ser superior à data atual."
      // }
      if (newDocData.TAXDATE && newDocData.DOCDUEDATE && sappy.moment(newDocData.TAXDATE).isAfter(newDocData.DOCDUEDATE)) {
        hasChangesToState = true;
        newDocData["DOCDUEDATE_LOGICMSG"] = "danger|Não pode ser inferior à data do documento.";
      }

      if (hasChangesToState) return that.setState({ docData: newDocData });

      //Validar se há erros ativos
      let hasDanger = Object.keys(newDocData).find(f => {
        let aviso = newDocData[f + "_VALIDATEMSG"] || newDocData[f + "_LOGICMSG"] || "";
        return aviso.startsWith("danger");
      });

      if (hasDanger) return sappy.showToastr({ color: "danger", msg: "Há campos com erros..." });

      //Validar se há avisos ativos
      let hasWarning = Object.keys(newDocData).find(f => {
        let aviso = newDocData[f + "_VALIDATEMSG"] || newDocData[f + "_LOGICMSG"] || "";
        return aviso.startsWith("warning");
      });

      //Alterações a documentos existentes
      let invokePatchDocAPI = forceTotal => {
        sappy.showWaitProgress("A atualizar documento, aguarde por favor...");

        let handlePatchDocApiResponse = result => {
          sappy.showSuccess({
            title: "Documento atualizado",
            msg: `Atualizou com sucesso o documento ${result.data.DocNum}!`,
            cancelText: "Adicionar novo",
            onCancel: () => {
              hashHistory.replace(hashHistory.getCurrentLocation().pathname + "?new=" + new Date().getTime());
            },
            confirmText: "Concluido",
            onConfirm: () => hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", ""))
          });
        };

        let url = `${that.props.apiDocsEdit}/${that.state.docData.DOCENTRY}/confirm`;

        that.serverRequest = axios.post(url).then(result => handlePatchDocApiResponse(result)).catch(error => {
          sappy.showError(error, "Erro ao gravar documento");
        });
      };
      if (newDocData.DOCENTRY > 0 && hasWarning)
        return sappy.showWarning({
          title: "Atenção!",
          msg: "Ainda há campos com avisos!",
          moreInfo: "Deseja mesmo assim gravar as alterações a este documento?",
          onConfirm: invokePatchDocAPI,
          confirmText: "Ignorar e gravar alterações",
          onCancel: () => { }
        });

      if (newDocData.DOCENTRY > 0)
        return sappy.showQuestion({
          title: "Deseja Continuar?",
          msg: "Se continuar irá gravar as alterações a este documento.",
          onConfirm: invokePatchDocAPI,
          confirmText: "Gravar alterações",
          onCancel: () => { }
        });

      // Novos documentos

      let invokeAddDocAPI = forceTotal => {
        sappy.showWaitProgress("A adicionar documento, aguarde por favor...");

        let handleAddDocApiResponse = result => {
          let data = result.data || {};
          // debugger
          if (data.message && data.message.indexOf("TOTALDIF") > -1) {
            sappy.showDanger({
              msg: `O total ${data.DocTotal} € é diferente do esperado!`,
              moreInfo: "A criação do documento foi cancelada.",
              cancelText: "Cancelar",
              cancelStyle: "success",
              showCancelButton: true,
              confirmText: "Adicionar mesmo assim",
              // eslint-disable-next-line
              onConfirm: () => invokeAddDocAPI(data.DocTotal)
            });
          } else {
            sappy.showSuccess({
              title: "Documento criado",
              msg: `Criou com sucesso o documento ${result.data.DocNum}!`,
              cancelText: "Adicionar outro",
              onCancel: () => {
                hashHistory.replace(hashHistory.getCurrentLocation().pathname + "?new=" + new Date().getTime());
              },
              confirmText: "Concluido",
              onConfirm: () => hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", ""))
            });
          }
        };

        let url = `${that.props.apiDocsNew}/${that.state.docData.ID}/confirm`;
        let data = { forceTotal };

        that.serverRequest = axios.post(url, { data }).then(result => handleAddDocApiResponse(result)).catch(error => sappy.showError(error, "Erro ao criar documento"));
      };
      if (hasWarning)
        return sappy.showWarning({
          title: "Atenção!",
          msg: "Ainda há campos com avisos!",
          moreInfo: "Deseja mesmo assim criar este documento?",
          onConfirm: e => invokeAddDocAPI(),
          confirmText: "Ignorar e criar documento",
          onCancel: () => { }
        });

      return sappy.showQuestion({
        title: "Deseja Continuar?",
        msg: "Se continuar irá criar este documento.",
        onConfirm: e => invokeAddDocAPI(),
        confirmText: "Criar documento",
        onCancel: () => { }
      });
    };

    //wait for eventual updates on lost focus
    setTimeout(performChecks, 1000);
  }
};
