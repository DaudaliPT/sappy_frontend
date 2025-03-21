import React, { Component } from "react";
import { hashHistory } from "react-router";

import safeJsonStringify from "safe-json-stringify";
import { Popover, PopoverContent } from "reactstrap";
import axios from "axios";
import swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.css";

import ReactAudioPlayer from "react-audio-player";
import { setTimeout } from "timers";
import EditModalProdutos from "./views/Produtos/EditModal";
import EditModalParceiros from "./views/Parceiros/EditModal";

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
    sappy.hideModals = this.hideModals.bind(this);

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
    sappy.showPopbox = this.showPopbox.bind(this);
    sappy.hidePopbox = this.hidePopbox.bind(this);

    sappy.showToastr = this.showToastr.bind(this);
    sappy.clearToastr = this.clearToastr.bind(this);
    sappy.showWaitProgress = this.showWaitProgress.bind(this);
    sappy.hideWaitProgress = this.hideWaitProgress.bind(this);

    sappy.playBadInputSound = this.playBadInputSound.bind(this);
    sappy.playAlertSound = this.playAlertSound.bind(this);

    // hide popbox if target div id doesn't exist anymore (otherwise the popbox still open, for example if we go to other page)
    setInterval(() => {
      let target = this.state.currentPopboxID;
      if (!target) return;
      let $le = $("#" + target);
      if ($le.length === 0) this.hidePopbox();
    }, 1000);

    this.state = {
      currentAppModal: null,
      currentAppModal2: null,
      currentProgressModal: null,
      currentPopover: null,
      currentPopbox: null,
      currentPopboxID: null,
      playBadInputSound: false,
      playAlertSound: false,
      badInputAlertComponent: <ReactAudioPlayer src="/files/216090__richerlandtv__bad-beep-incorrect.mp3" autoPlay={true} onEnded={() => that.setState({ playBadInputSound: false })} />,
      alertComponent: <ReactAudioPlayer src="/files/Computer Error Alert-SoundBible.com-783113881.mp3" autoPlay={true} onEnded={() => that.setState({ playAlertSound: false })} />
    };
  }

  GetLinkUrl(objType, objKey) {
    if (!objType) return "";
    if (!objKey) return "";
    let url = "";
    if (objType.toString() === "2") url = "popup_pns";
    if (objType.toString() === "4") url = "popup_artigos";

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

  GetLinkTo(objType, objKey) {
    let url = this.GetLinkUrl(objType, objKey);
    if (!url)
      return (
        <span>
          <i className="icon fa-arrow-circle-right disabled" aria-hidden="true" /> 
        </span>
      );
    return (
      <span>
        <i className="icon fa-arrow-circle-right" aria-hidden="true" onClick={e => sappy.LinkTo(objType, objKey)} />
      </span>
    );
  }

  LinkTo(objType, objKey) {
    let url = this.GetLinkUrl(objType, objKey);
    if (!url) {
      return sappy.showToastr({
        color: "info",
        msg: "Ainda não há visualização par ao tipo de documento solicitado",
        title: "Ainda não disponivel"
      });
    }

    if (sappy.getNum(objType) === 2) return sappy.showModal(<EditModalParceiros toggleModal={sappy.hideModal} cardCode={objKey} />);
    if (sappy.getNum(objType) === 4) return sappy.showModal(<EditModalProdutos toggleModal={sappy.hideModal} itemcode={objKey} />);

    sappy.hideModals();
    hashHistory.push({ pathname: url, state: { DocEntry: objKey } });
  }

  showModal(modal) {
    sappy.hidePopbox();
    sappy.hidePopover();

    if (this.state.currentAppModal) return this.setState({ currentAppModal2: modal });
    this.setState({ currentAppModal: modal });
  }

  hideModal() {
    if (this.state.currentAppModal2) return this.setState({ currentAppModal2: null });
    this.setState({ currentAppModal: null });
  }

  hideModals() {
    this.setState({ currentAppModal2: null, currentAppModal: null });
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

      // let $mouseIsHover = document.querySelectorAll(":hover");
      let $le = $("#" + target + ":hover");
      if ($le.length === 0) return; // console.log("popover ignored because element does not exists anymore, or mouse is out");

      that.hoverServerRequest = axios({ method: "get", url: api })
        .then(result => {
          let content = null;
          if (render) content = render({ result, context: renderContext });
          if (!content) return;

          // let $mouseIsHover = document.querySelectorAll(":hover");
          let $le = $("#" + target + ":hover");
          if ($le.length === 0) return; //console.log("popover ignored because element does not exists anymore, or mouse is out");

          that.setState({
            currentPopover: (
              <Popover className="hovertip" isOpen={true} target={target} placement={placement || "left"} onMouseLeave={sappy.hidePopover}>
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

  hidePopbox() {
    if (!this.state.currentPopbox) return null;
    let id = this.state.currentPopboxID;
    this.setState({ currentPopbox: null, currentPopboxID: null });
    return id;
  }

  showPopbox({ target, api, render, renderContext, placement }) {
    let that = this;
    sappy.hidePopbox();
    sappy.hidePopover();

    let content = null;
    if (render) content = render({ context: renderContext });
    if (!content) return;

    let $le = $("#" + target);
    if ($le.length === 0) return; //console.log("popover ignored because element does not exists anymore");

    that.setState({
      currentPopboxID: target,
      currentPopbox: (
        <Popover className="popbox" isOpen={true} target={target} placement={placement || "left"}>
          <PopoverContent>
            {content}
          </PopoverContent>
        </Popover>
      )
    });
  }

  showWaitProgress(msg) {
    sappy.hidePopbox();
    sappy.hidePopover();
    swal({
      html: `<div class="h-150">
              <div class="h-100 vertical-align text-center">
                <div class="loader vertical-align-middle loader-tadpole" />
              </div>
              <div class="h-30">
                <h4>${msg || ""}</h4>
              </div>
            </div>`,
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
    sappy.hidePopbox();
    sappy.hidePopover();

    options.type = "success";
    options.title = options.title || "Successo";
    this.showSwal(options);
  }

  showQuestion(options) {
    sappy.hidePopbox();
    sappy.hidePopover();

    options.type = "question";
    options.title = options.title || "Questão";
    this.showSwal(options);
  }

  showWarning(options) {
    sappy.hidePopbox();
    sappy.hidePopover();

    options.type = "warning";
    options.title = options.title || "Aviso";
    options.confirmText = options.confirmText || "Ok";
    this.showSwal(options);
  }

  showDanger(options) {
    sappy.hidePopbox();
    sappy.hidePopover();

    options.type = "warning";
    options.title = options.title || "Muita atenção!!!";
    this.showSwal(options);
  }

  playBadInputSound() {
    this.setState({ playBadInputSound: true });
  }
  playAlertSound() {
    this.setState({ playAlertSound: true });
  }

  showSwal(options) {
    sappy.hidePopbox();
    sappy.hidePopover();

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
    sappy.hidePopbox();
    sappy.hidePopover();

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

    if (msg.indexOf("Content not allowed without valid session. Please login first.") > -1) {
      sappy.hideModals();
      sappy.hidePopbox();
      sappy.hidePopover();
      setTimeout(() => {
        sappy.showToastr("danger|" + msg);
      }, 500);
      return hashHistory.push("/login");
    }

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
        {this.state.playAlertSound && this.state.alertComponent}

        {this.state.currentAppModal}
        {this.state.currentAppModal2}
        {this.state.currentProgressModal}
        {this.state.currentPopover}
        {this.state.currentPopbox}
      </div>
    );
  }
}
export default appBase;
