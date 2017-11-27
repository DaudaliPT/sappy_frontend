// import React, { Component } from "react";
import { Component } from "react";
// const sappy = window.sappy;

class ButtonGetPdf extends Component {
  handleOnClick_GetPdf(e) {
    // let defaultLayoutCode = this.props.defaultLayoutCode;
    e.stopPropagation();

    let objType = this.props.ObjectID;
    let docEntry = this.props.DocEntry;

    // Executar o mapa
    var apiRoute = `/api/reports/pdf/${objType}/${docEntry}`;

    var baseUrl = ""; // Nota: Em desenv, é preciso redirecionar o pedido. Já em produtivo a api é servida na mesma porta do pedido
    if (window.location.port === "3000") baseUrl = "http://byusserver:3005";
    window.open(baseUrl + apiRoute, "_blank");
  }

  render() {
    return null;
    // return (
    //   <span className="sappy-execute" onClick={this.handleOnClick_GetPdf.bind(this)}>
    //     <i className="icon fa-file-pdf-o" />
    //   </span>
    // );
  }
}

export default ButtonGetPdf;
