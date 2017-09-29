import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
const sappy = window.sappy;

import axios from "axios";
import { ModalWaitProgress } from "../../Modals";

class ModalConfirmPrint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      includeAll: false
    };
  }

  processResult = (result) => {
    let that = this;
    let parValues = {
      DOCNUM: { Value: this.props.docNumArray },
      INCLUDEALL: { Value: this.state.includeAll },
      SOURCE: { Value: 'EP' }
    };
    this.props.setCurrentModal({ currentModal: null });

    if (result === "PRINTER") {
      this.props.setCurrentModal({
        currentModal: <ModalWaitProgress title="Aguarde" text="A preparar impressão..." color="success" />
      });
      let apiRoute = "/api/reports/printetiq/" + this.props.defaultLayoutCode;
      let apiQuery = "?parValues=" + encodeURIComponent(JSON.stringify(parValues));

      axios
        .post(apiRoute + apiQuery)
        .then(function (result) {
          //Marcar documentos como impressos
          axios
            .post("/api/etiq/printed", parValues)
            .then(function (result) {
              that.props.setCurrentModal({ currentModal: null });
              location.reload();
            })
            .catch(function (error) {
              if (!error.__CANCEL__) sappy.showError(error, "Api error")
            });
        })
        .catch(function (error) {
          that.props.setCurrentModal({ currentModal: null });
          if (!error.__CANCEL__) sappy.showError(error, "Api error")
        });
    } else if (result === "PDF") {
      // Executar o mapa
      let apiRoute = "/api/reports/getPdf(" + this.props.defaultLayoutCode + ")";
      let apiQuery = "?parValues=" + encodeURIComponent(JSON.stringify(parValues));

      let baseUrl = ""; // Nota: Em desenv, é preciso redirecionar o pedido. Já em produtivo a api é servida na mesma porta do pedido
      if (window.location.port === "3000") baseUrl = "http://localhost:3005";
      window.open(baseUrl + apiRoute + apiQuery, "_blank");

      //Marcar documentos como impressos
      axios
        .post("/api/etiq/printed", parValues)
        .then(function (result) {
        })
        .catch(function (error) {
          if (!error.__CANCEL__) sappy.showError(error, "Api error")
        });
    }
  }

  render() {
    let that = this;
    return (
      <Modal isOpen={true} className="modal-m modal-primary">
        <ModalHeader toggle={() => that.props.setCurrentModal({ currentModal: null })}>Opções</ModalHeader>
        <ModalBody>
          <h4>Deseja visualizar ou imprimir?</h4>
        </ModalBody>
        <ModalFooter>
          <Button color="default" onClick={e => this.processResult("PDF")}>
            <span>
              <i className={"icon fa-file-pdf-o"} aria-hidden="true" />
              Visualizar
            </span>
          </Button>
          <Button color="primary" onClick={e => this.processResult("PRINTER")}>
            <span>
              <i className={"icon fa-print"} aria-hidden="true" />
              Imprimir
            </span>
          </Button>
        </ModalFooter>
      </Modal >
    );
  }
}

export default ModalConfirmPrint;
