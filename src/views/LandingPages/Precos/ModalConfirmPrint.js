import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import axios from "axios";
import { ModalWaitProgress } from "../../../Modals";
const byUs = window.byUs;


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
      SOURCE: { Value: 'PC' }
    };
    this.props.setCurrentModal({ currentModal: null });

    if (result === "PRINTER") {
      this.props.setCurrentModal({
        currentModal: <ModalWaitProgress title="Aguarde" text="A preparar impressão..." color="success" />
      });
      let apiRoute = "/api/reports/print(" + this.props.defaultLayoutCode + ")";
      let apiQuery = "?parValues=" + encodeURIComponent(JSON.stringify(parValues));

      axios
        .post(apiRoute + apiQuery)
        .then(function (result) {
          //Marcar documentos como impressos
          axios
            .post("/api/inv/precos/printed", parValues)
            .then(function (result) {
              that.props.setCurrentModal({ currentModal: null });
              location.reload();
            })
            .catch(function (error) {
              if (!error.__CANCEL__) byUs.showError(error, "Api error")
            });
        })
        .catch(function (error) {
          that.props.setCurrentModal({ currentModal: null });
          if (!error.__CANCEL__) byUs.showError(error, "Api error")
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
        .post("/api/inv/precos/printed", parValues)
        .then(function (result) {
        })
        .catch(function (error) {
          if (!error.__CANCEL__) byUs.showError(error, "Api error")
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
          <p>Escolha se pretende a impressão de apenas os artigos com preços alterados ou todos os artigos</p>
          <div className="row" style={{ minHeight: "50px" }}>
            <div className="col-1"></div>
            <div className="col">
              <div className="radio-custom radio-primary" style={{ display: "block" }}>
                <input type="radio" id="inputRadiosUnchecked" name="inputRadios" checked={!this.state.includeAll} onChange={e => {
                  that.setState({ includeAll: !e.target.checked });
                }} />
                <label htmlFor="inputRadiosUnchecked">Só artigos com preços alterados</label>
              </div>
            </div>
          </div>

          <div className="row " style={{ minHeight: "50px" }}>
            <div className="col-1"></div>
            <div className="col">

              <div className="radio-custom radio-primary" style={{ display: "block" }}>
                <input type="radio" id="inputRadiosChecked" name="inputRadios" checked={this.state.includeAll} onChange={e => {
                  that.setState({ includeAll: e.target.checked });
                }} />
                <label htmlFor="inputRadiosChecked">Todos artigos</label>
              </div>
            </div>

          </div>

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
