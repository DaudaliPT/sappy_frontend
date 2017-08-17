import React, { Component } from "react";
import { Modal, ModalBody } from "reactstrap";

class ModalWaitProgress extends Component {
  render() {
    return (
      <Modal isOpen={true} className={"modal-m modal-" + this.props.color}>
        {/*<ModalHeader>{this.props.title}</ModalHeader>*/}
        <ModalBody>
          <div className="example-loading example-well h-150 vertical-align text-center">
            <div className="loader vertical-align-middle loader-tadpole" />
          </div>
        </ModalBody>
        <ModalBody>
          <div className="vertical-align text-center">
            <div className="vertical-align-middle">
              <h4>{this.props.text}</h4>
              <p>{this.props.moreInfo}</p>
            </div>
          </div>
        </ModalBody>
      </Modal>
    );
  }
}

export default ModalWaitProgress;
