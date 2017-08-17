import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

class ModalMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Modal isOpen={this.props.modal} className={"modal-m modal-danger"}>
        <ModalHeader toggle={this.props.toggleModal}>{this.props.title}</ModalHeader>
        <ModalBody>
          <h4>{this.props.text}</h4>
          <p>{this.props.moreInfo}</p>
        </ModalBody>
        <ModalFooter>
          <Button color={this.props.color} onClick={this.props.toggleModal}>
            Ok
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default ModalMessage;
