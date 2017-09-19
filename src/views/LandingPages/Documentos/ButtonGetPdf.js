import React, { Component } from "react";
const sappy = window.sappy;

class ButtonGetPdf extends Component {

  handleOnClick_GetPdf(e) {
    // Quando entra na landing page, é feito um pedido que procura o defaultLayoutCode para o documento
    // e o guarda em sappy.defaultLayoutCode
    let defaultLayoutCode = sappy.defaultLayoutCode;

    if (!defaultLayoutCode) {
      return sappy.showError(null, "Não foi possível obter layout predefinido para impressão.");
    }

    // Executar o mapa
    let parValues = { "DOCKEY@": { Value: this.props.DocEntry }, "OBJECTID@": { Value: this.props.ObjectID } };
    var apiRoute = "/api/reports/getPdf(" + defaultLayoutCode + ")";
    var apiQuery = "?parValues=" + encodeURIComponent(JSON.stringify(parValues));

    var baseUrl = ""; // Nota: Em desenv, é preciso redirecionar o pedido. Já em produtivo a api é servida na mesma porta do pedido
    if (window.location.port === "3000") baseUrl = "http://localhost:3005";
    window.open(baseUrl + apiRoute + apiQuery, "_blank");
  }

  render() {
    return (
      <button
        type="button"
        className="btn btn-round btn-outline btn-default sappy-execute"
        onClick={this.handleOnClick_GetPdf.bind(this)}
      >
        <i className="icon fa-file-pdf-o" />
      </button>
    );
  }
}

export default ButtonGetPdf;
