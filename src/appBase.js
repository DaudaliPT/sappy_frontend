import React, { Component } from "react";
import { hashHistory } from "react-router";

import safeJsonStringify from "safe-json-stringify";
import { Popover, PopoverContent } from "reactstrap";
import axios from "axios";
import swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.css";

import ReactAudioPlayer from "react-audio-player";

swal.setDefaults({
  reverseButtons: true,
  allowOutsideClick: false,
  buttonsStyling: false
});

var ReactToastr = require("react-toastr");
var { ToastContainer, ToastMessage } = ReactToastr;
const ToastMessageFactory = React.createFactory(ToastMessage.animation);

var sappy = window.sappy;
var $ = window.$;

class appBase extends Component {
  constructor(props) {
    super(props);

    let that = this;

    sappy.showModal = this.showModal.bind(this);
    sappy.hideModal = this.hideModal.bind(this);

    sappy.GetLinkTo = this.GetLinkTo.bind(this);
    sappy.LinkTo = this.LinkTo.bind(this);

    sappy.showSwal = this.showSwal.bind(this);
    sappy.showSuccess = this.showSuccess.bind(this);
    sappy.showQuestion = this.showQuestion.bind(this);
    sappy.showWarning = this.showWarning.bind(this);
    sappy.showDanger = this.showDanger.bind(this);
    sappy.showError = this.showError.bind(this);

    sappy.showPopover = this.showPopover.bind(this);
    sappy.hidePopover = this.hidePopover.bind(this);

    sappy.showToastr = this.showToastr.bind(this);
    sappy.clearToastr = this.clearToastr.bind(this);
    sappy.showWaitProgress = this.showWaitProgress.bind(this);
    sappy.hideWaitProgress = this.hideWaitProgress.bind(this);

    sappy.playBadInputSound = this.playBadInputSound.bind(this);

    this.state = {
      currentAppModal: null,
      currentProgressModal: null,
      currentPopover: null,
      playBadInputSound: false,
      badInputAlertComponent: <ReactAudioPlayer src="/files/216090__richerlandtv__bad-beep-incorrect.mp3" autoPlay={true} onEnded={() => that.setState({ playBadInputSound: false })} />
    };
  }

  GetLinkUrl(objType, docEntry) {
    if (!objType) return "";
    if (!docEntry) return "";
    let url = "";
    if (objType.toString() === "13") url = "vnd/oinv/doc";
    if (objType.toString() === "14") url = "vnd/orin/doc";
    if (objType.toString() === "15") url = "vnd/odln/doc";
    if (objType.toString() === "16") url = "vnd/ordn/doc";
    if (objType.toString() === "17") url = "vnd/ordr/doc";

    if (objType.toString() === "18") url = "cmp/opch/doc";
    if (objType.toString() === "19") url = "cmp/orpc/doc";
    if (objType.toString() === "20") url = "cmp/opdn/doc";
    if (objType.toString() === "21") url = "cmp/orpd/doc";
    if (objType.toString() === "22") url = "cmp/opor/doc";

    return url;
  }
  GetLinkTo(objType, docEntry) {
    let url = this.GetLinkUrl(objType, docEntry);
    if (!url)
      return (
        <span>
          <i className="icon fa-arrow-circle-right disabled" aria-hidden="true" /> {" "}
        </span>
      );
    return (
      <span>
        <i className="icon fa-arrow-circle-right" aria-hidden="true" onClick={e => sappy.LinkTo(objType, docEntry)} />{" "}
      </span>
    );
  }

  LinkTo(objType, docEntry) {
    let url = this.GetLinkUrl(objType, docEntry);
    if (!url) {
      return sappy.showToastr({ color: "info", msg: "Ainda não há visualização par ao tipo de documento solicitado", title: "Ainda não disponivel" });
    }
    sappy.hideModal();
    hashHistory.push({ pathname: url, state: { DocEntry: docEntry } });
  }

  showModal(modal) {
    this.setState({ currentAppModal: modal });
  }

  hideModal() {
    this.setState({ currentAppModal: null });
  }
  hidePopover() {
    if (this.hoverTimeOutHandle) clearTimeout(this.hoverTimeOutHandle);
    this.setState({ currentPopover: null });
  }

  showPopover({ target, api, render, renderContext, placement }) {
    let that = this;
    sappy.hidePopover();

    this.hoverTimeOutHandle = setTimeout(function() {
      if (that.hoverServerRequest && that.hoverServerRequest.abort) that.hoverServerRequest.abort();
      that.hoverServerRequest = axios({ method: "get", url: api })
        .then(result => {
          let content = null;
          if (render) content = render({ result, context: renderContext });
          if (!content) return;
          let $le = $("#" + target);
          if ($le.length === 0) return console.log("popover ignored because element does not exists anymore");

          that.setState({
            currentPopover: (
              <Popover isOpen={true} target={target} toggle={this.togglePopover} placement={placement || "left"} onMouseLeave={sappy.hidePopover}>
                <PopoverContent>
                  {content}
                </PopoverContent>
              </Popover>
            )
          });
        })
        .catch(error => console.log(error, "Erro ao obter dados"));
    }, 300);
  }

  showWaitProgress(msg) {
    swal({
      html: `<div class="example-loading example-well h-150 vertical-align text-center">
                <div class="loader vertical-align-middle loader-tadpole" />
              </div>
              <h4>${msg || ""}</h4>`,
      showCancelButton: false,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false
    });
  }

  hideWaitProgress() {
    // this.setState({ currentProgressModal: null })
    swal.isVisible() && swal.closeModal();
  }

  showSuccess(options) {
    options.type = "success";
    options.title = options.title || "Successo";
    this.showSwal(options);
  }

  showQuestion(options) {
    options.type = "question";
    options.title = options.title || "Questão";
    this.showSwal(options);
  }

  showWarning(options) {
    options.type = "warning";
    options.title = options.title || "Aviso";
    options.confirmText = options.confirmText || "Ok";
    this.showSwal(options);
  }

  showDanger(options) {
    options.type = "warning";
    options.title = options.title || "Muita atenção!!!";
    this.showSwal(options);
  }

  playBadInputSound() {
    this.setState({ playBadInputSound: true });
  }

  showSwal(options) {
    let { showCancelButton, type, html, msg, moreInfo, onConfirm, onCancel, confirmText, confirmStyle, cancelText, cancelStyle } = options;
    let color = type;
    if (type === "question") color = "primary";

    swal({
      ...options,
      html: html || `${msg || ""}<small><br />${moreInfo || ""}</small>`,
      showCancelButton: showCancelButton || cancelText || onCancel,
      confirmButtonText: confirmText || "Confirmar",
      cancelButtonText: cancelText || "Cancelar",
      cancelButtonClass: "btn  mr-5 btn-lg btn-" + (cancelStyle || "secondary"),
      confirmButtonClass: "btn ml-5 btn-lg btn-" + (confirmStyle || color)
    }).then(inputValue => onConfirm && onConfirm(inputValue), dismiss => onCancel && onCancel());
  }

  showError(err, title, onConfirm) {
    err = err || {};
    console.error(title, err);
    sappy.hideWaitProgress(); // If visible, hide waitprogress
    // let that = this;
    let moreInfo = "";
    let msg = "";
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

    swal({
      title: title || "Erro",
      html: `${msg || ""}<small><br />${moreInfo || ""}</small>`,
      type: "error",
      confirmButtonClass: "btn btn-danger"
    }).then(() => onConfirm && onConfirm());
  }

  showToastr(objPars = {}) {
    let color = objPars.color;
    let msg = objPars.msg;
    let title = objPars.title;
    if (typeof objPars === "string") {
      color = objPars.split("|")[0];
      msg = objPars.split("|")[1];
    }

    let toastrContainer = this.refs.container;
    setTimeout(e => {
      if (color === "success") toastrContainer.success(msg, title, { closeButton: true });
      else if (color === "info") toastrContainer.info(msg, title, { closeButton: true });
      else if (color === "warning") toastrContainer.warning(msg, title, { closeButton: true });
      else if (color === "danger") toastrContainer.error(msg, title, { closeButton: true });
      else toastrContainer.error(msg, title, { closeButton: true });
    }, 0);
  }

  clearToastr() {
    this.refs.container.clear();
  }

  render() {
    return (
      <div>
        <ToastContainer toastMessageFactory={ToastMessageFactory} ref="container" preventDuplicates={true} className="toast-top-right" />
        {this.state.playBadInputSound && this.state.badInputAlertComponent}

        {this.state.currentAppModal}
        {this.state.currentProgressModal}
        {this.state.currentPopover}
      </div>
    );
  }
}
export default appBase;
