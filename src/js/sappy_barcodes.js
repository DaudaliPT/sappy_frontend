import axios from "axios";

(function(root) {
  // Create the local library object, to be exported or referenced globally later
  var lib = {};

  var timeOutHandler;
  var charBuffer = [];
  var barcodeBuffer = [];
  var currentCallback;
  var processing = false;
  var sappy = null; // só será preenchido no init(sappy)
  var withError = false;
  var isHuman = true;

  function acknowledgePopupMsg() {
    withError = false;
    console.log("acknowledgePopupMsg");
  }
  function showBarCodeError(title, moreInfo) {
    withError = true;
    sappy.showWarning({
      title,
      moreInfo,
      playBadInput: true,
      onClose: acknowledgePopupMsg
    });
  }

  function validate(barcode) {
    axios
      .get("/api/search/oitm/bc/" + encodeURIComponent(barcode))
      .then(result => {
        var listItems = result.data;
        let found = listItems.length;

        if (found === 1) {
          barcodeBuffer.push(barcode);
          // console.log(barcodeBuffer)
          //when writing to input (at end remove barcode)
          if (document.activeElement.tagName === "INPUT") {
            // console.log(barcode + "." + barcode.length);
            document.activeElement.value = document.activeElement.value.replace(barcode, "");
          }

          if (processing === false) {
            let bcToProcess = [...barcodeBuffer];
            barcodeBuffer = [];
            processing = true;
            // console.log("call " + bcToProcess);
            currentCallback(bcToProcess);
          }
        } else if (found > 1) {
          showBarCodeError("Múltiplos registos", "Foram encontrados vários registos ao procurar por '" + barcode + "'");
        } else {
          showBarCodeError("Nada encontrado", "Não foi possivel encontrar ao procurar por '" + barcode + "'");
        }
      })
      .catch(function(error) {
        if (!error.__CANCEL__) sappy.showError(error, "Api error");
      });
  }

  function onTypeTimeout() {
    if (!currentCallback) return;
    var barcode = charBuffer.join("");
    // console.log(barcode)

    timeOutHandler = null;
    charBuffer = [];
    isHuman = true;

    // check we have a long length e.g. it is a barcode
    if (barcode.length >= 10) {
      if (withError) return; // ignore bar code when error is visible
      validate(barcode);
    }
  }

  lib.getBufferContent = function() {
    return [...charBuffer];
  };

  lib.init = function(sappyObj) {
    sappy = sappyObj;
    // We want to capture the event before any thing else
    let useCapturingFase = true; // see https://www.quirksmode.org/js/events_order.html

    window.addEventListener(
      "keydown",
      e => {
        if (!currentCallback) return;

        if (e.key === "F9") {
          // F9 - PREFIXO CONFIGURADO NO SCANNER
          // Configurar scanner https://retailops.zendesk.com/hc/en-us/articles/213380163-Programming-Guide-Symbol-Motorola-Zebra-LI4278-Scanners
          e.preventDefault();
          e.stopPropagation();
          isHuman = false;
          return;
        }
        if ((e.keyCode === 13 || e.keyCode === 10) && charBuffer.length >= 10) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        if (isHuman === false) {
          e.preventDefault();
          e.stopPropagation();
        }

        // Se 0 a z    [0-9] e [A-Z] e [a-z]
        if (e.which >= 48 && e.which <= 122) {
          charBuffer.push(String.fromCharCode(e.which));
          console.log(e.which + ":" + charBuffer.join("|"));

          if (timeOutHandler) {
            clearTimeout(timeOutHandler);
            timeOutHandler = null;
          }
          timeOutHandler = setTimeout(e => {
            // took mode than 50 milisecs, is a human or ended barcode
            onTypeTimeout();
          }, 50);
        } else {
          charBuffer = []; //clear buffer
        }
      },
      useCapturingFase
    );
  };

  lib.onRead = function(callback) {
    currentCallback = callback;
  };

  lib.notifyBarcodesProcessed = function() {
    // console.log("End processed")
    processing = false;

    if (currentCallback && barcodeBuffer.length > 0) {
      let bcToProcess = [...barcodeBuffer];
      barcodeBuffer = [];
      processing = true;
      // console.log("call queue " + bcToProcess)
      currentCallback(bcToProcess);
    }
  };

  module.exports = lib;

  // Root will be `window` in browser or `global` on the server:
})(this);
