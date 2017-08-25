import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { ByUsDate } from "../../../../Inputs";

class ModalConfirmDoc extends Component {
  constructor(props) {
    super(props);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.state = {
      imediatamente: true,
      data: undefined
    };
  }

  // Recebe os valores dos campos MY*
  onFieldChange(changeInfo) {
    let val = changeInfo.rawValue;
    let fieldName = changeInfo.fieldName;

    if (val._isAMomentObject) val = val.hour(12);

    this.setState({ [fieldName]: val });
  }

  render() {
    let that = this;

    return (
      <Modal isOpen={true} className="modal-m modal-success">
        <ModalHeader toggle={this.props.toggleModal}>Atualização de preços</ModalHeader>
        {this.props.temUpdates &&
          <ModalBody>
            <h4>Escolha se pretende atualização imediata ou programada de preços</h4>
            <div className="row" style={{ minHeight: "50px" }}>
              <div className="col-1"></div>
              <div className="col-6">

                <div className="radio-custom radio-primary" style={{ display: "block" }}>
                  <input type="radio" id="inputRadiosUnchecked" name="inputRadios" checked={this.state.imediatamente} onChange={e => {
                    that.setState({ imediatamente: e.target.checked });
                  }} />
                  <label htmlFor="inputRadiosUnchecked">Atualização imediata</label>
                </div>
              </div>

            </div>
            <div className="row " >
              <div className="col-1"></div>
              <div className="col-4">

                <div className="radio-custom radio-primary" >
                  <input type="radio" id="inputRadiosChecked" name="inputRadios" checked={!this.state.imediatamente} onChange={e => {
                    that.setState({ imediatamente: !e.target.checked });
                  }} />
                  <label htmlFor="inputRadiosChecked">Às 20:00 do dia</label>
                </div>
              </div>
              <div className="col-5 ">
                <div className=" ">
                  <ByUsDate label="Data" name="data" disabled={that.state.imediatamente} value={that.state.data} onChange={this.onFieldChange} />
                </div>
              </div>
            </div>
          </ModalBody>
        }
        {!this.props.temUpdates &&
          <ModalBody>
            <h4>Confirma que não há alterações nos preços dos artigos seleccionados? </h4>
          </ModalBody>
        }
        <ModalFooter>
          <Button color="primary" onClick={e => this.props.toggleModal("CANCELADO")}>
            <span>
              <i className={"icon fa-close"} aria-hidden="true" />
              Cancelar
            </span>
          </Button>
          <Button color="success" onClick={e => this.props.toggleModal("CONFIRMADO", that.state)}>
            <span>
              <i className={"icon fa-check"} aria-hidden="true" />
              Confirmar
            </span>
          </Button>
        </ModalFooter>
      </Modal >
    );
  }
}

export default ModalConfirmDoc;
