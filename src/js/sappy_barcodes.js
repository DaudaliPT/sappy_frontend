import axios from "axios";


(function (root) {

  // Create the local library object, to be exported or referenced globally later
  var lib = {};

  var timeOutHandler;
  var charBuffer = [];
  var barcodeBuffer = [];
  var currentCallback;
  var processing = false;
  var sappy = null; // só será preenchido no init(sappy)
  var withError = false;

  function acknowledgePopupMsg() {
    withError = false
    console.log("acknowledgePopupMsg")

  }
  function showBarCodeError(title, moreInfo) {
    withError = true;
    sappy.showWarning({
      title,
      moreInfo,
      playBadInput: true,
      onClose: acknowledgePopupMsg
    })
  }

  function validate(barcode) {
    axios
      .get("/api/search/oitm/bc/" + encodeURIComponent(barcode))
      .then(result => {
        var listItems = result.data;
        let found = listItems.length;

        if (found === 1) {
          barcodeBuffer.push(barcode)
          // console.log(barcodeBuffer)

          //when writing to input (at end remove barcode) 
          if (document.activeElement.tagName === "INPUT") {
            console.log(barcode + "." + barcode.length)
            document.activeElement.value = document.activeElement.value.replace(barcode, "")
          }

          if (processing === false) {
            let bcToProcess = [...barcodeBuffer];
            barcodeBuffer = [];
            processing = true;
            console.log("call " + bcToProcess)
            currentCallback(bcToProcess)
          }
        } else if (found > 1) {
          showBarCodeError("Múltiplos registos", "Foram encontrados vários registos ao procurar por '" + barcode + "'")
        } else {
          showBarCodeError("Nada encontrado", "Não foi possivel encontrar ao procurar por '" + barcode + "'")
        }
      })
      .catch(function (error) {
        if (!error.__CANCEL__) sappy.showError(error, "Api error")
      });
  }


  function onTypeTimeout() {
    if (!currentCallback) return
    timeOutHandler = null

    console.log("********************************************")

    // check we have a long length e.g. it is a barcode
    if (charBuffer.length >= 10) {
      var barcode = charBuffer.join("");

      charBuffer = [];
      timeOutHandler = false;

      if (withError) return // ignore bar code when error is visible
      validate(barcode)
    }
  }

  lib.getBufferContent = function () {
    return [...charBuffer]
  }

  lib.init = function (sappyObj) {
    sappy = sappyObj
    // We want to capture the event before any thing else
    let useCapturingFase = true; // see https://www.quirksmode.org/js/events_order.html

    window.addEventListener("keydown",
      e => {
        if (!currentCallback) return
        if ((e.keyCode === 13 || e.keyCode === 10) && charBuffer.length >= 10) {
          e.preventDefault();
          e.stopPropagation();
          // console.log(e.keyCode + " prevented")

          if (timeOutHandler) clearTimeout(timeOutHandler);
          return onTypeTimeout();
        } else {

          // Se 0 a z    [0-9] e [A-Z] e [a-z]
          if (e.which >= 48 && e.which <= 122) charBuffer.push(String.fromCharCode(e.which));
          // console.log(e.which + ":" + charBuffer.join("|"));
        }

        // set press to true so we do not reenter the timeout function above
        if (!timeOutHandler) timeOutHandler = setTimeout(onTypeTimeout, 500);

      },
      useCapturingFase);
  }

  lib.onRead = function (callback) {
    currentCallback = callback
  }

  lib.notifyBarcodesProcessed = function () {
    console.log("End processed")
    processing = false;

    if (currentCallback && barcodeBuffer.length > 0) {
      let bcToProcess = [...barcodeBuffer];
      barcodeBuffer = [];
      processing = true;
      console.log("call queue " + bcToProcess)
      currentCallback(bcToProcess)
    }
  }

  module.exports = lib;

  // Root will be `window` in browser or `global` on the server:
})(this);
