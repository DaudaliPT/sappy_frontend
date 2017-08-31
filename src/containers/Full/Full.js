import React, { Component } from "react";
import MenuBar from "../../components/MenuBar";
import safeJsonStringify from "safe-json-stringify";

import { Popover, PopoverContent } from 'reactstrap';
import axios from "axios";
import SweetAlert from 'react-bootstrap-sweetalert';
var ReactToastr = require("react-toastr");
var { ToastContainer, ToastMessage } = ReactToastr;
const ToastMessageFactory = React.createFactory(ToastMessage.animation);

var byUs = window.byUs;
var $ = window.$;

class Full extends Component {

  constructor(props) {
    super(props);
    byUs.showModal = this.showModal.bind(this);
    byUs.hideModal = this.hideModal.bind(this);

    byUs.showSuccess = this.showSuccess.bind(this);
    byUs.showQuestion = this.showQuestion.bind(this);
    byUs.showWarning = this.showWarning.bind(this);
    byUs.showError = this.showError.bind(this);
    byUs.showPopover = this.showPopover.bind(this);
    byUs.hidePopover = this.hidePopover.bind(this);
    byUs.showToastr = this.showToastr.bind(this);
    byUs.clearToastr = this.clearToastr.bind(this);

    this.state = {
      currentAppModal: null,
      currentMsgModal: null,
      currentPopover: null
    }
  }

  showModal(modal) {
    this.setState({ currentAppModal: modal })
  }

  hideModal() {
    this.setState({ currentAppModal: null })
  }
  hidePopover() {
    if (this.hoverTimeOutHandle) clearTimeout(this.hoverTimeOutHandle);
    this.setState({ currentPopover: null })
  }

  showPopover({ target, api, render, renderContext, placement }) {
    let that = this;
    byUs.hidePopover();

    this.hoverTimeOutHandle = setTimeout(function () {
      if (that.hoverServerRequest && that.hoverServerRequest.abort) that.hoverServerRequest.abort();
      that.hoverServerRequest = axios({ method: "get", url: api })
        .then(result => {
          let content = render({ result, context: renderContext })

          let $le = $("#" + target);
          if ($le.length === 0) return console.log("popover ignored because element does not exists anymore")


          that.setState({
            currentPopover:
            <Popover isOpen={true} target={target} toggle={this.togglePopover} placement={placement || "left"} onMouseLeave={byUs.hidePopover} >
              <PopoverContent>{content}</PopoverContent>
            </Popover >
          })

        })
        .catch(error => byUs.showError(error, "Erro ao obter dados"));
    }, 300);
  }

  showSuccess({ title, msg, moreInfo, onConfirm, onCancel, confirmText, confirmStyle, cancelText, cancelStyle } = {}) {
    let that = this;

    this.setState({
      currentMsgModal:
      < SweetAlert success title={title || "Sucesso"}

        showCancel={typeof onCancel === "function"}

        cancelBtnBsStyle={cancelStyle || "default"}
        cancelBtnText={cancelText || "Cancelar"}
        onCancel={() => {
          that.setState({ currentMsgModal: null })
          onCancel && onCancel()
        }}

        confirmBtnText={confirmText || "OK"}
        confirmBtnBsStyle={confirmStyle || "success"}

        onConfirm={
          () => {
            that.setState({ currentMsgModal: null })
            onConfirm && onConfirm()
          }} >
        {msg}
        < small >
          <br />          {moreInfo}
        </small >
      </SweetAlert >
    })
  }

  showQuestion({ title, msg, moreInfo, onConfirm, onCancel, confirmText, confirmStyle, cancelText, cancelStyle } = {}) {
    let that = this;

    this.setState({
      currentMsgModal:
      < SweetAlert info title={title || "Questão"}

        showCancel={typeof onCancel === "function"}

        cancelBtnBsStyle={cancelStyle || "default"}
        cancelBtnText={cancelText || "Cancelar"}
        onCancel={() => {
          that.setState({ currentMsgModal: null })
          onCancel && onCancel()
        }}

        confirmBtnText={confirmText || "Ok"}
        confirmBtnBsStyle={confirmStyle || "success"}
        onConfirm={
          () => {
            that.setState({ currentMsgModal: null })
            onConfirm && onConfirm()
          }} >
        {msg}
        < small >
          <br />          {moreInfo}
        </small >
      </SweetAlert >
    })
  }


  showWarning({ title, msg, moreInfo, onConfirm, onCancel, confirmText, confirmStyle, cancelText, cancelStyle } = {}) {
    let that = this;

    this.setState({
      currentMsgModal:
      < SweetAlert warning title={title || "Aviso"}

        showCancel={typeof onCancel === "function"}

        cancelBtnBsStyle={cancelStyle || "default"}
        cancelBtnText={cancelText || "Cancelar"}
        onCancel={() => {
          that.setState({ currentMsgModal: null })
          onCancel && onCancel()
        }}

        confirmBtnText={confirmText || "Ok"}
        confirmBtnBsStyle={confirmStyle || "danger"}

        onConfirm={
          () => {
            that.setState({ currentMsgModal: null })
            onConfirm && onConfirm()
          }} >
        {msg}
        < small >
          <br />          {moreInfo}
        </small >
      </SweetAlert >
    })
  }


  showError(err, title, onConfirm) {
    let that = this;
    let moreInfo = '';
    let msg = ""
    if (err.message) msg = err.message;
    if (err.response) {
      let res = err.response;
      if (res.data && res.data.message) msg += ", " + res.data.message;
      if (res.data && res.data.moreInfo) moreInfo = res.data.moreInfo;

      if (res.status >= 400) {
        if (res.data && res.data.error) moreInfo = res.data.error;
        if (typeof res.data === "string") moreInfo = res.data;
        if (res.request) moreInfo += " " + res.request.responseURL;
      }
    }

    if (!msg) msg = safeJsonStringify(err);

    this.setState({
      currentMsgModal:
      <SweetAlert error title={title || "Erro"}
        onConfirm={
          () => {
            that.setState({ currentMsgModal: null })
            onConfirm && onConfirm()
          }}>
        {msg}
        <small>
          <br />          {moreInfo}
        </small>
      </SweetAlert >
    })
  }

  showToastr(objPars = {}) {
    let color = objPars.color;
    let msg = objPars.msg;
    if (typeof objPars === "string") {
      color = objPars.split('|')[0];
      msg = objPars.split('|')[1];
    }

    let toastrContainer = this.refs.container;
    setTimeout(e => {
      if (color === "success") toastrContainer.success(msg, "", { closeButton: true })
      else if (color === "info") toastrContainer.info(msg, "", { closeButton: true })
      else if (color === "warning") toastrContainer.warning(msg, "", { closeButton: true })
      else if (color === "danger") toastrContainer.error(msg, "", { closeButton: true })
      else toastrContainer.error(msg, "", { closeButton: true })
    }, 0);
  }

  clearToastr() {
    this.refs.container.clear();
  }


  render() {
    return (
      <div className="app">
        <MenuBar {...this.props} />
        <div className="app-body">
          <main className="main">
            <div className="container-fluid">


              {this.props.children}
            </div>
          </main>
        </div>
        <ToastContainer
          toastMessageFactory={ToastMessageFactory}
          ref="container"
          preventDuplicates={true}
          className="toast-top-right"
        />
        {this.state.currentAppModal}
        {this.state.currentMsgModal}
        {this.state.currentPopover}
      </div>
    );
  }
}

export default Full;
