import axios from "axios";
import { setImmediate } from "timers";
const $ = window.$;

(function(root) {
  // Create the local library object, to be exported or referenced globally later
  var lib = {};

  var timeOutHandler;
  var charBuffer = [];
  var barcodeBuffer = [];
  var currentCallback;
  var currentBarcodeApiUrl;
  var currentSearchLimitCondition;
  var processing = false;
  var sappy = null; // só será preenchido no init(sappy)
  var withError = false;
  var isHuman = true;
  var oldFocusElement;

  function acknowledgePopupMsg() {
    withError = false;
    // console.log("acknowledgePopupMsg");
  }

  function showBarCodeError(title, moreInfo) {
    sappy.playBadInputSound();

    withError = true;
    sappy.showWarning({
      title,
      moreInfo,
      onClose: acknowledgePopupMsg
    });
  }

  function validate(barcode) {
    axios
      .get(currentBarcodeApiUrl + encodeURIComponent(barcode), {
        params: {
          searchLimitCondition: currentSearchLimitCondition
        }
      })
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

            if (result.data[0].DocRef) {
              //Retornar a referencia ao documento
              currentCallback({ selectedItems: [result.data[0].DocRef], hasMany: false });
            } else {
              // retornar o próprio código lido
              currentCallback({ barcodes: bcToProcess, hasMany: false });
            }
          }
        } else if (found > 1) {
          if (processing) {
            showBarCodeError("Múltiplos registos", "Foram encontrados vários registos ao procurar por '" + barcode + "'");
          } else {
            // não interfere com o buffer
            sappy.playAlertSound();
            currentCallback({ barcodes: [barcode], hasMany: true });
          }
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
    // console.log(barcode);

    timeOutHandler = null;
    charBuffer = [];
    isHuman = true;

    // check we have a long length e.g. it is a barcode
    if (barcode.length >= 5) {
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
    window.addEventListener("keypress", e => {
      if (!currentCallback) return;

      if (e.charCode === 2) {
        //char2 does the same as F9 - PREFIXO CONFIGURADO NO SCANNER
        e.preventDefault();
        e.stopPropagation();
        isHuman = false;
        charBuffer = [];
        return;
      }

    });
    window.addEventListener(
      "keydown",
      e => {
        if (!currentCallback) return; 
        
        if (e.code === "F9" || e.key === "|") {
          // F9 - PREFIXO CONFIGURADO NO SCANNER
          // Configurar scanner https://retailops.zendesk.com/hc/en-us/articles/213380163-Programming-Guide-Symbol-Motorola-Zebra-LI4278-Scanners
          e.preventDefault();
          e.stopPropagation();
          isHuman = false;
          charBuffer = [];
          return;
        }
        if (isHuman === false) {
          e.preventDefault();
          e.stopPropagation();
          if (e.keyCode === 9 || e.keyCode === 13 || e.keyCode === 10) {
            if (timeOutHandler) {
              clearTimeout(timeOutHandler);
              timeOutHandler = null;
            }
            onTypeTimeout(); //End barcode
            return;
          }

          // Se 0 a z    [0-9] e [A-Z] e [a-z]
          if (e.which >= 48 && e.which <= 122) {
            if (e.code === "Numpad0") charBuffer.push("0");
            else if (e.code === "Numpad1") charBuffer.push("1");
            else if (e.code === "Numpad2") charBuffer.push("2");
            else if (e.code === "Numpad3") charBuffer.push("3");
            else if (e.code === "Numpad4") charBuffer.push("4");
            else if (e.code === "Numpad5") charBuffer.push("5");
            else if (e.code === "Numpad6") charBuffer.push("6");
            else if (e.code === "Numpad7") charBuffer.push("7");
            else if (e.code === "Numpad8") charBuffer.push("8");
            else if (e.code === "Numpad9") charBuffer.push("8");
            else charBuffer.push(String.fromCharCode(e.which));

            // console.log(e.which + ":" + charBuffer.join("|"));

            // if (timeOutHandler) {
            //   clearTimeout(timeOutHandler);
            //   timeOutHandler = null;
            // }
            // timeOutHandler = setTimeout(e => {
            //   // took more than 50 milisecs, is a human or ended barcode
            //   onTypeTimeout();
            // }, 200);
          }
        } else {
          // console.log("human " + e.which + " '" + String.fromCharCode(e.which) + "'");
          if (e.code === "Escape" || e.keyCode === 27) {
            setImmediate(() => {
              if (oldFocusElement) {
                oldFocusElement.focus();
                oldFocusElement = null;
              } else {
                // No pos fazer escape coloca o cursor na caixa de pesquisa
                let $el = $(".pos .input-search input");
                if ($el.length > 0) {
                  oldFocusElement = document.activeElement;
                  $el.focus();
                }
              }
            });
          }
        }
      },
      useCapturingFase
    );
  };

  lib.onRead = function(callback, barcodeApiUrl, searchLimitCondition) {
    currentCallback = callback;
    currentBarcodeApiUrl = barcodeApiUrl;
    currentSearchLimitCondition = searchLimitCondition;
  };

  lib.notifyBarcodesProcessed = function() {
    // console.log("End processed")
    processing = false;

    if (currentCallback && barcodeBuffer.length > 0) {
      let bcToProcess = [...barcodeBuffer];
      barcodeBuffer = [];
      processing = true;
      // console.log("call queue " + bcToProcess)
      currentCallback({ barcodes: bcToProcess, hasMany: false });
    }
  };

  module.exports = lib;

  // Root will be `window` in browser or `global` on the server:
})(this);
