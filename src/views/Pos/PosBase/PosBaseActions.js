// import React from "react";
import { hashHistory } from "react-router";
import axios from "axios";

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
      hashHistory.push("/pos");
    } else if (that.state.docData.ID && that.state.docData.LINES.length === 0) {
      that.serverRequest = axios.delete(`${that.props.apiDocsNew}/${that.state.docData.ID}`).then(result => hashHistory.push("/pos")).catch(error => sappy.showError(error, "Erro ao apagar dados"));
    } else {
      sappy.showQuestion({
        title: "Manter rascunho?",
        moreInfo: "Se escolher manter, as alterações ficarão disponiveis como rascunho e poderá continuar mais tarde...",
        onConfirm: () => {
          hashHistory.push("/pos");
        },
        cancelText: "Descartar",
        cancelStyle: "danger btn-outline",
        confirmText: "Manter rascunho",
        confirmStyle: "success",
        onCancel: () => {
          that.serverRequest = axios
            .delete(`${that.props.apiDocsNew}/${that.state.docData.ID}`)
            .then(result => hashHistory.push("/pos"))
            .catch(error => sappy.showError(error, "Erro ao apagar dados"));
        }
      });
    }
  },

  handleOnConfirmar: that => {

    
    let performChecks = () => {
      let settings  = sappy.getSettings(["POS.GERAL.APPLY_PROMO_OFFERS"])
      //Validar campos de preenchimento obrigatório
      let newDocData = { ...that.state.docData };
      let fieldsRequired = [];
      Object.keys(that.props.headerFields).forEach(line =>
        that.props.headerFields[line].filter(f => f.required && !that.state.docData[f.name]).forEach(f => {
          fieldsRequired.push(f.label);
          // hasChangesToState = true;
          // newDocData[f.name + "_LOGICMSG"] = "danger|Preencha primeiro o campo " + f.label + ".";
        })
      );

      if (fieldsRequired.length > 0) {
        let msg = (fieldsRequired.length === 1 ? "O campo " : "Os campos ") + fieldsRequired.join(", ") + (fieldsRequired.length === 1 ? " não está preenchido." : " não estão preenchidos.");

        return sappy.showToastr({ color: "danger", msg });
      }

      if (newDocData.LINES && newDocData.LINES.length === 0) {
        return sappy.showToastr({ color: "danger", msg: "O documento aina não tem linhas" });
      }

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
            that.serverRequest = axios.get(`/api/reports/autoprint/${that.state.docData.OBJTYPE}/${result.data.DocEntry}`).then(result => { }).catch(error => {
              console.error(error);
              sappy.showToastr({ color: "danger", msg: "Erro ao imprimir documento, avise a caixa sff." });
            });

            sappy.showSuccess({
              title: "Documento criado",
              msg: `Criou com sucesso o documento ${result.data.DocNum}!`,
              cancelText: "Adicionar outro",
              onCancel: () => {
                hashHistory.replace(hashHistory.getCurrentLocation().pathname + "?new=" + new Date().getTime());
              },
              confirmText: "Concluido",
              onConfirm: () => hashHistory.push("/pos")
            });
          }
        };

        let url = `${that.props.apiDocsNew}/${that.state.docData.ID}/confirm`;
        let data = { forceTotal };

        that.serverRequest = axios.post(url, { data }).then(result => handleAddDocApiResponse(result)).catch(error => sappy.showError(error, "Erro ao criar documento"));
      };

      let applyPromotionOffers = () => {
        sappy.showWaitProgress("A verificar promoções e preços especiais, aguarde por favor...")

        let handleResponse = result => {
          if (result.status === 200 /*OK*/) {
            let data = result.data || {};

            let docData = { ...that.state.docData, ...result.data };
            that.setState({ selectedLineNums: [], docData });

            return sappy.showWarning({
              title: "Foram aplicadas promoções e/ou preços especiais",
              msg: "Por favor verifique as o documento antes de 'confirmar' novamente.",
            });
          } else if (result.status === 204 /*NO_CONTENT*/) {

            return sappy.showQuestion({
              title: "Deseja Continuar?",
              msg: "Se continuar irá criar este documento.",
              onConfirm: e => invokeAddDocAPI(),
              confirmText: "Criar documento",
              onCancel: () => { }
            });
          }
        };

        let url = `${that.props.apiDocsNew}/${that.state.docData.ID}/applyoffers`;
        that.serverRequest =
          axios.post(url)
            .then(result => handleResponse(result))
            .catch(error => sappy.showError(error, "Erro ao verificar promoções"));

      }

      if (settings["POS.GERAL.APPLY_PROMO_OFFERS"]==='N'){
        return sappy.showQuestion({
          title: "Deseja Continuar?",
          msg: "Se continuar irá criar este documento.",
          onConfirm: e => invokeAddDocAPI(),
          confirmText: "Criar documento",
          onCancel: () => { }
        });
      } else {
        applyPromotionOffers();
      }
    };

    //wait for eventual updates on lost focus
    setTimeout(performChecks, 1000);
  }
};
