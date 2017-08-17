import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

class ByUsModalMessage extends Component {
  constructor(props) {
    super(props);
    this.handleClickOk = this.handleClickOk.bind(this);
    this.handleClickCancel = this.handleClickCancel.bind(this);
    this.state = { userAlreadyClicked: false };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ userAlreadyClicked: false });
  }
  handleClickCancel() {
    this.setState({ userAlreadyClicked: true }, this.props.onClickCancel);
  }
  handleClickOk() {
    this.setState({ userAlreadyClicked: true }, this.props.onClickOk);
  }

  render() {
    return (
      <Modal isOpen={!this.state.userAlreadyClicked} className={"modal-m modal-" + this.props.color}>
        <ModalHeader toggle={this.handleClickCancel}>{this.props.title}</ModalHeader>
        <ModalBody>
          <h4>{this.props.message}</h4>
          <p>{this.props.moreInfo}</p>
        </ModalBody>
        <ModalFooter>
          {this.props.cancelText
            ? <Button disabled={this.state.userAlreadyClicked} onClick={this.handleClickCancel}>
              {this.props.cancelText}
            </Button>
            : null}
          <Button color={this.props.color} disabled={this.state.userAlreadyClicked} onClick={this.handleClickOk}>
            {this.props.okText || "Ok"}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default ByUsModalMessage;
