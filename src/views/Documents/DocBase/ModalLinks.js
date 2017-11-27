import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
// var $ = window.$;
const sappy = window.sappy;
import ReactGraphVis from "../../../components/ReactGraphVis";

// import { Badge } from "reactstrap";
// import uuid from "uuid/v4";

class ModalLinks extends Component {
  render() {
    let data = this.props.data || [];

    let nodes = data.map(item => {
      let objType = item.ID.split("#")[0];

      let objInfo = sappy.b1.sapObjectInfo({ objectCode: objType });

      let icon = { face: "Font Awesome", code: "\uf1ea", size: 25, color: "red" };
      // compras
      if (objType === "22") icon = { ...icon, code: "\uf298", color: "green" };
      if (objType === "20") icon = { ...icon, code: "\uf045", color: "blue" };
      if (objType === "21") icon = { ...icon, code: "\uf112", color: "orange" };
      if (objType === "18") icon = { ...icon, code: "\uf046", color: "darkgreen" };
      if (objType === "19") icon = { ...icon, code: "\uf122", color: "red" };

      // vendas
      if (objType === "23") icon = { ...icon, code: "\uf232", color: "blue" };
      if (objType === "17") icon = { ...icon, code: "\uf298", color: "green" };
      if (objType === "15") icon = { ...icon, code: "\uf045", color: "blue" };
      if (objType === "16") icon = { ...icon, code: "\uf112", color: "orange" };
      if (objType === "13") icon = { ...icon, code: "\uf046", color: "darkgreen" };
      if (objType === "14") icon = { ...icon, code: "\uf122", color: "red" };

      return {
        id: item.ID,
        label: objInfo.description + "\n" + item.DocNum,
        color: "#ddd",
        shape: "icon",
        icon
      };
    });
    let edges = [];
    data.filter(i => !!i.RELATED_TO).forEach(i => {
      let r = i.RELATED_TO.split(",");
      r.forEach(from => {
        edges.push({ to: i.ID, from, arrows: "to", width: 1 });
      });
    });

    return (
      <div>
        <Modal isOpen={true} toggle={sappy.hideModal} className={"modal-lg modal-success"} onKeyDown={this.handleOnKeyDown_popup}>
          <ModalHeader toggle={sappy.hideModal}>Ligações com outros documentos</ModalHeader>
          <ModalBody>
            <ReactGraphVis nodes={nodes} edges={edges} />
          </ModalBody>

          <ModalFooter>
            <Button color="success" onClick={sappy.hideModal}>
              <span>
                <i className="icon wb-check" aria-hidden="true" />
                Ok
              </span>
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default ModalLinks;
