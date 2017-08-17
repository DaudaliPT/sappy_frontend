import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

class ModalMessageConfirm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let colorCancelar = this.props.colorCancelar || (this.props.color === "primary" ? "default" : "primary")
    return (
      <Modal isOpen={true} className={"modal-m modal-" + this.props.color}>
        <ModalHeader toggle={this.props.toggleModal}>{this.props.title}</ModalHeader>
        <ModalBody>
          <h4>{this.props.text}</h4>
          <p>{this.props.moreInfo}</p>
        </ModalBody>
        <ModalFooter>
          <Button color={colorCancelar} onClick={e => this.props.toggleModal("CANCELADO")}>
            <span>
              <i className={this.props.iconCancelar || "icon wb-close"} aria-hidden="true" />
              {this.props.btnCancelar || "Cancelar"}
            </span>
          </Button>
          <Button color={this.props.color} onClick={e => this.props.toggleModal("CONFIRMADO")}>
            <span>
              <i className={this.props.iconConfirmar || "icon fa-check"} aria-hidden="true" />
              {this.props.btnConfirmar || "Confirmar"}
            </span>
          </Button>
        </ModalFooter>
      </Modal >
    );
  }
}

export default ModalMessageConfirm;
