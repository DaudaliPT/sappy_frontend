import accounting from "./accountingjs";
import moment from 'moment';

// import "./jquery.resize";

// sappy namespace
(function (sappy) {
  // Public Property
  sappy.author = "Urbino Pescada";


  sappy.isEqual = (val1, val2) => {
    if ((val1 === null || typeof val1 === "undefined")
      && (val2 === null || typeof val2 === "undefined")) return true;

    if (!val1 && !val2) return true

    return (val1 === val2)
  }
  sappy.isDiferent = (val1, val2) => !sappy.isEqual(val1, val2);

  sappy.parseBackendError = function (costumMsg, err) {
    var msg = err.message;
    if (err.response && err.response.data) {
      if (err.response.data.message) msg += " -> " + err.response.data.message;
      if (err.response.data.moreInfo) msg += " -> " + err.response.data.moreInfo;
      if (typeof err.response.data === "string") msg += " -> " + err.response.data;
    }

    console.log(costumMsg, msg);
    return costumMsg + "(" + msg + ")";
  };





  // Settings object that controls default parameters for library methods:
  accounting.settings = {
    currency: {
      symbol: "€", // default currency symbol is '$'
      format: {
        pos: "%v %s", //"%s %v" for positive values, eg. "$ 1.00" (required)
        neg: "-%v %s", //"%s (%v)" for negative values, eg. "$ (1.00)" [optional]
        zero: "%v %s" //"%s  -- " for zero values, eg. "$  --" [optional]
      },
      decimal: ".", // decimal point separator
      thousand: ",", // thousands separator
      precision: 2 // decimal places
    },
    number: {
      precision: 0, // default precision on numbers is 0
      thousand: ",",
      decimal: "."
    }
  };

  sappy.applySapDeformats = () => {
    accounting.settings = {
      currency: {
        symbol: "€", // default currency symbol is '$'
        format: {
          pos: "%v %s", //"%s %v" for positive values, eg. "$ 1.00" (required)
          neg: "-%v %s", //"%s (%v)" for negative values, eg. "$ (1.00)" [optional]
          zero: "%v %s" //"%s  -- " for zero values, eg. "$  --" [optional]
        },
        decimal: sappy.sessionInfo.company.oadm.DecSep, // decimal point separator
        thousand: sappy.sessionInfo.company.oadm.ThousSep, // thousands separator
        precision: 2 // decimal places
      },
      number: {
        decimal: sappy.sessionInfo.company.oadm.DecSep,
        thousand: sappy.sessionInfo.company.oadm.ThousSep,
        precision: 0 // default precision on numbers is 0
      }
    };
  }

  sappy.replaceAll = function (str, find, replace) {
    let start = str.indexOf(find);

    while (start > -1) {
      str = str.replace(find, replace);
      start = str.indexOf(find, start + 1);
    }
    return str;
  };

  let getDateFormat = () => {
    let sapFormat

    // formatos do sap b1
    if (sappy.sessionInfo.company.oadm.DateFormat === "0") sapFormat = "DD/MM/YY"
    if (sappy.sessionInfo.company.oadm.DateFormat === "1") sapFormat = "DD/MM/YYYY"
    if (sappy.sessionInfo.company.oadm.DateFormat === "2") sapFormat = "MM/DD/YY"
    if (sappy.sessionInfo.company.oadm.DateFormat === "3") sapFormat = "MM/DD/YYYY"
    if (sappy.sessionInfo.company.oadm.DateFormat === "4") sapFormat = "YYYY/MM/DD"
    if (sappy.sessionInfo.company.oadm.DateFormat === "5") sapFormat = "DD/MMM/YYYY"
    if (sappy.sessionInfo.company.oadm.DateFormat === "6") sapFormat = "AA/MM/DD"

    sapFormat = sappy.replaceAll(sapFormat, "/", sappy.sessionInfo.company.oadm.DateSep)
    return sapFormat
  }

  sappy.accounting = accounting;
  sappy.moment = moment;
  sappy.unformat = {
    number: accounting.unformat,
    date: value => {
      if (!value) return null

      const HANA_DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';
      if (value._isAMomentObject) return value.format(HANA_DEFAULT_DATE_FORMAT);

      if (typeof value === "string" && value.indexOf("T") === 10) {
        value = value.split("T")[0]; //remover a parte das horas T00:00:00
      }

      let sapFormat = getDateFormat();

      let getMask = (str => {
        let arr = str.split('').map(c => {
          if (c >= "0" && c <= "9") return "_";
          if (c >= "A" && c <= "Z") return "_";
          if (c >= "a" && c <= "z") return "_";
          return c;
        })
        return arr.join('')
      })

      let findSeparator = (str => {
        return str.split('').find(c => {
          return (c === '.') || (c === ',') || (c === '-') || (c === '/');
        })
      })

      let sapFormatMask = getMask(sapFormat);
      let defaultMask = getMask(HANA_DEFAULT_DATE_FORMAT);
      let valueMask = getMask(value);

      if (valueMask === defaultMask) {
        let d = moment(value, HANA_DEFAULT_DATE_FORMAT);
        if (d.isValid()) return d.format(HANA_DEFAULT_DATE_FORMAT);

      } else if (valueMask === sapFormatMask) {
        let d = moment(value, sapFormat);
        if (d.isValid()) return d.format(HANA_DEFAULT_DATE_FORMAT);

      } else {
        if (value === "." || value === "0") {
          return moment().format(HANA_DEFAULT_DATE_FORMAT);

        } else if (value.length > 0) {
          let day, month, year;
          let sep = findSeparator(value)
          if (sep) {
            let parts = value.split(sep)
            day = parts[0]
            month = parts[1]
            year = parts[2]
          } else if (value.length > 2) {
            day = value.substring(0, 2);
            month = value.substring(2, 4);
            year = value.substring(4);
          } else {
            day = value
          }

          if ((day || month || year) === false) return null

          let d = moment();
          if (day && !isNaN(day)) d.set('date', parseInt(day, 10));
          if (month && !isNaN(month)) d.set('month', parseInt(month, 10) - 1);// -1, because is base0
          if (year && !isNaN(year)) {
            year = parseInt(year, 10)
            if (year < 2000) year += 2000;
            d.set('year', year);
          }
          return d.format(HANA_DEFAULT_DATE_FORMAT);
        }
      }
      return null
    }
  }


  function addDecimals(value, decimals) {
    let num = value.toString().split('e')[0]
    let exp = sappy.getNum(value.toString().split('e')[1])
    return Number(num + 'e' + (exp + decimals));
  }
  sappy.round = (value, decimals) => {
    let sign = value >= 0 ? 1 : -1;
    let val = value * sign; //passar valores negativos a positivos, para que o round funcione bem nos negativos

    let ret = sign * addDecimals(Math.round(addDecimals(val, decimals)), -1 * decimals);
    if (isNaN(ret)) console.log(`sappy.round = (${val}, ${decimals}) returned NaN`)
    return ret;
  }


  sappy.evaluateNumericExpression = (value) => {
    if (typeof value !== "string") return value

    let chars = value.split('');
    let hasOperators = false;
    let hasInvalidChars = false;

    chars.forEach(c => {
      if ('., %€'.indexOf(c) > -1) return;//ignore this
      if ('+-*/^()'.indexOf(c) > -1) return hasOperators = true;
      let charCode = c.charCodeAt(0);
      if (charCode < 48 || charCode > 57) return hasInvalidChars = true;
    });

    if (hasInvalidChars) return sappy.showToastr({ color: "danger", msg: "'" + value + "' não é uma expressão válida" })
    if (hasOperators) {
      try {
        value = sappy.replaceAll(value, ',', '.'); //tratar virgulas como separadores decimais
        value = sappy.replaceAll(value, '€', ''); //ignorar estes simbolos
        value = sappy.replaceAll(value, '%', '');//ignorar estes simbolos
        // eslint-disable-next-line
        return eval(value)
      } catch (error) {
        return sappy.showToastr({ color: "danger", msg: "'" + value + "' não é uma expressão válida: " + error.message })
      }
    } else {
      return sappy.getNum(value)
    }
  }

  sappy.getSetting = settingId => {
    let tab = settingId.split(".")[0];
    let title = settingId.split(".")[1];
    let name = settingId.split(".")[2];
    let settings = sappy.sessionInfo.company.settings;

    let setting
    try {
      setting = settings[tab].settings[title].settings[name]
    } catch (error) {
      console.error("Setting not found??", error)
    }

    return setting || {}
  }
  sappy.getNum = value => {
    let ret = 0;
    if (typeof value === "number") return value;
    if (value === null || typeof value === "undefined") return 0;
    if (value === "") return 0;

    if (typeof value === "string")
      if (value.indexOf(".") > -1 && value.indexOf(",") === -1)
        ret = parseFloat(value);
      else
        ret = sappy.unformat.number(value);
    else
      ret = parseFloat(value);

    if (typeof ret === "number") return ret;
    return 0
  }

  sappy.format = {
    price: (value) => {
      let decimals = sappy.sessionInfo.company.oadm.PriceDec;
      if (typeof value === 'string') value = parseFloat(value);
      return accounting.formatMoney(value, null, decimals);
    },
    amount: (value) => {
      let decimals = sappy.sessionInfo.company.oadm.SumDec;
      if (typeof value === 'string') value = parseFloat(value);
      return accounting.formatMoney(value, null, decimals);
    },
    saprate: (value) => {
      let decimals = sappy.sessionInfo.company.oadm.RateDec;
      if (typeof value === 'string') value = parseFloat(value);
      return accounting.formatMoney(value, "%", decimals);
    },
    percent: (value) => {
      let decimals = 2;
      if (typeof value === 'string') value = parseFloat(value);
      return accounting.formatMoney(value, "%", decimals);
    },
    integer: (value) => {
      let decimals = 0;
      if (typeof value === 'string') value = parseFloat(value);
      return accounting.formatNumber(value, decimals);
    },
    quantity: (value) => {
      let decimals = sappy.sessionInfo.company.oadm.QtyDec;
      if (typeof value === 'string') value = parseFloat(value);
      let ret = accounting.formatNumber(value, decimals);

      //remover os separador decimal e as decimas quando não são relevantes
      ret = ret.replace(
        sappy.sessionInfo.company.oadm.DecSep + '000000'.substring(0, sappy.sessionInfo.company.oadm.QtyDec)
        , '')

      return ret;
    },
    date: value => {
      if (!value) return ""
      let sapFormat = getDateFormat();
      let d = moment(value)
      if (d.isValid()) return d.format(sapFormat);
      return "";
    },
    datetime: value => {
      if (!value) return ""
      let sapFormat = getDateFormat();
      let d = moment(value)
      if (d.isValid()) return d.format(sapFormat + " HH:mm:ss");
      return "";
    },
    datetime2: value => {
      if (!value) return ""
      let sapFormat = getDateFormat();
      let d = moment(value)
      if (d.isValid()) return d.format(sapFormat + " HH:mm");
      return "";
    },
    YYYY_MM_DD: value => {
      let parsedDate;

      if (!value) return '';
      if (value instanceof Date) {
        parsedDate = value;
      } else {
        parsedDate = new Date(value);
      }
      let day = parsedDate.getDate();
      let month = parsedDate.getMonth() + 1; //Months are zero based
      let year = parsedDate.getFullYear();

      if (day.toString().length === 1) day = "0" + day;
      if (month.toString().length === 1) month = "0" + month;

      return year + "-" + month + "-" + day;
    }
  };



  sappy.CrystalReports = {
    DefaultValueSortMethod: { BasedOnValue: 0, BasedOnDescription: 1 },
    DefaultValueSortOrder: {
      NoSort: 0,
      AlphabeticalAscending: 1,
      AlphabeticalDescending: 2,
      NumericAscending: 3,
      NumericDescending: 4,
      DateTimeAscending: 5,
      DateTimeDescending: 6
    },
    DefaultValueDisplayType: { Description: 0, DescriptionAndValue: 1 },
    ParameterType: {
      ReportParameter: 0,
      StoreProcedureParameter: 1,
      QueryParameter: 2,
      ConnectionParameter: 3,
      MetaDataParameter: 4
    },
    ParameterFieldUsage2: {
      Unknown: 0,
      InUse: 1,
      NotInUse: 2,
      CurrentValuesProvidedByServer: 4,
      ShowOnPanel: 8,
      EditableOnPanel: 16,
      DataFetching: 32,
      IsLinked: 64
    },
    ParameterValueKind: {
      NumberParameter: 0,
      CurrencyParameter: 1,
      BooleanParameter: 2,
      DateParameter: 3,
      StringParameter: 4,
      DateTimeParameter: 5,
      TimeParameter: 6,
      NativeStringParameter: 7,
      MemberParameter: 8
    },
    DiscreteOrRangeKind: { DiscreteValue: 0, RangeValue: 1, DiscreteAndRangeValue: 2 }
  };


  sappy.b1 = {};
  sappy.b1.getBoRcptInvTypes = (transType) => {
    let t = sappy.getNum(transType);
    if (t === -3) return "it_ClosingBalance";
    if (t === -1) return "it_AllTransactions";
    if (t === -2) return "it_OpeningBalance";
    if (t === 13) return "it_Invoice";
    if (t === 14) return "it_CredItnote";
    if (t === 15) return "it_TaxInvoice"
    if (t === 16) return "it_Return";
    if (t === 18) return "it_PurchaseInvoice";
    if (t === 19) return "it_PurchaseCreditNote";
    if (t === 20) return "it_PurchaseDeliveryNote";
    if (t === 21) return "it_PurchaseReturn";
    if (t === 24) return "it_Receipt";
    if (t === 25) return "it_Deposit";
    if (t === 30) return "it_JournalEntry";
    if (t === 46) return "it_PaymentAdvice";
    if (t === 57) return "it_ChequesForPayment";
    if (t === 58) return "it_StockReconciliations";
    if (t === 59) return "it_GeneralReceiptToStock";
    if (t === 60) return "it_GeneralReleaseFromStock";
    if (t === 67) return "it_TransferBetweenWarehouses";
    if (t === 68) return "it_WorkInstructions";
    if (t === 76) return "it_DeferredDeposit";
    if (t === 132) return "it_CorrectionInvoice ";
    if (t === 163) return "it_APCorrectionInvoice ";
    if (t === 165) return "it_ARCorrectionInvoice ";
    if (t === 203) return "it_DownPayment ";
    if (t === 204) return "it_PurchaseDownPayment ";
    return ""
  }


  sappy.b1.sapObjectInfo = ({ tableName, objectCode } = {}) => {
    let objData = [
      { tableName: "OACT", tableSufix: "ACT", objectCode: 1, description: "Chart of Accounts" },
      { tableName: "OCRD", tableSufix: "CRD", objectCode: 2, description: "Business Partner Cards" },
      { tableName: "OITM", tableSufix: "ITM", objectCode: 4, description: "Items" },
      { tableName: "OPLN", tableSufix: "PLN", objectCode: 6, description: "Price list names" },
      { tableName: "OSPP", tableSufix: "SPP", objectCode: 7, description: "Special prices" },
      { tableName: "OCPR", tableSufix: "CPR", objectCode: 11, description: "Contact employees" },
      { tableName: "OUSR", tableSufix: "USR", objectCode: 12, description: "Users" },

      { tableName: "OINV", tableSufix: "INV", objectCode: 13, description: "Fatura a cliente" },
      { tableName: "ORIN", tableSufix: "RIN", objectCode: 14, description: "Nota de Crédito a cliente" },
      { tableName: "ODLN", tableSufix: "DLN", objectCode: 15, description: "Entrega a cliente" },
      { tableName: "ORDN", tableSufix: "RDN", objectCode: 16, description: "Devolução de cliente" },
      { tableName: "ORDR", tableSufix: "RDR", objectCode: 17, description: "Encomenda de cliente" },

      { tableName: "OPCH", tableSufix: "PCH", objectCode: 18, description: "Fatura de compra" },
      { tableName: "ORPC", tableSufix: "RPC", objectCode: 19, description: "Nota de crédito de fornecedor" },
      { tableName: "OPDN", tableSufix: "PDN", objectCode: 20, description: "Recepção de mercadoria" },
      { tableName: "ORPD", tableSufix: "RPD", objectCode: 21, description: "Devolução de mercadoria" },
      { tableName: "OPOR", tableSufix: "POR", objectCode: 22, description: "Encomenda a fornecedor" },

      { tableName: "OQUT", tableSufix: "QUT", objectCode: 23, description: "Quotations" },
      { tableName: "ORCT", tableSufix: "RCT", objectCode: 24, description: "Receipts incoming payments" },
      { tableName: "ODPS", tableSufix: "DPS", objectCode: 25, description: "Bill of Exchange Deposits" },
      { tableName: "OBTD", tableSufix: "BTD", objectCode: 28, description: "Journal vouchers" },
      { tableName: "OJDT", tableSufix: "JDT", objectCode: 30, description: "Journal entries" },
      { tableName: "OITW", tableSufix: "ITW", objectCode: 31, description: "Item warehouse" },
      { tableName: "OCLG", tableSufix: "CLG", objectCode: 33, description: "Contact activities" },
      { tableName: "OCRN", tableSufix: "CRN", objectCode: 37, description: "Currency codes" },
      { tableName: "OCTG", tableSufix: "CTG", objectCode: 40, description: "Payment terms types" },
      { tableName: "OBNK", tableSufix: "BNK", objectCode: 42, description: "Bank pages" },
      { tableName: "OVPM", tableSufix: "VPM", objectCode: 46, description: "Payments to vendors" },
      { tableName: "OITB", tableSufix: "ITB", objectCode: 52, description: "Item groups" },
      { tableName: "OCHO", tableSufix: "CHO", objectCode: 57, description: "Checks for payment" },
      { tableName: "OIGN", tableSufix: "IGN", objectCode: 59, description: "Inventory general entry" },
      { tableName: "OIGE", tableSufix: "IGE", objectCode: 60, description: "Inventory general exit" },
      { tableName: "OWHS", tableSufix: "WHS", objectCode: 64, description: "Warehouses codes and names" },
      { tableName: "OITT", tableSufix: "ITT", objectCode: 66, description: "Product trees" },
      { tableName: "OWTR", tableSufix: "WTR", objectCode: 67, description: "Stock transfer" },
      { tableName: "OWKO", tableSufix: "WKO", objectCode: 68, description: "Work orders" },
      { tableName: "OSCN", tableSufix: "SCN", objectCode: 73, description: "Alternate catalog numbers" },
      { tableName: "OBGT", tableSufix: "BGT", objectCode: 77, description: "Budget" },
      { tableName: "OBGD", tableSufix: "BGD", objectCode: 78, description: "Budget Distribution" },
      { tableName: "OALR", tableSufix: "ALR", objectCode: 81, description: "Alerts messages" },
      { tableName: "OBGS", tableSufix: "BGS", objectCode: 91, description: "Budget scenarios" },
      { tableName: "OSRI", tableSufix: "SRI", objectCode: 94, description: "Items serial numbers" },
      { tableName: "OOPR", tableSufix: "OPR", objectCode: 97, description: "Sales Opportunities" },
      { tableName: "OCLT", tableSufix: "CLT", objectCode: 103, description: "Activity types" },
      { tableName: "OCLO", tableSufix: "CLO", objectCode: 104, description: "Activity locations" },
      { tableName: "OIBT", tableSufix: "IBT", objectCode: 106, description: "Item batch numbers" },
      { tableName: "ODRF", tableSufix: "DRF", objectCode: 112, description: "Document draft" },
      { tableName: "OEXD", tableSufix: "EXD", objectCode: 125, description: "Additional Expenses" },
      { tableName: "OSTA", tableSufix: "STA", objectCode: 126, description: "Sales tax authorities" },
      { tableName: "OSTT", tableSufix: "STT", objectCode: 127, description: "Sales tax authorities type" },
      { tableName: "OSTC", tableSufix: "STC", objectCode: 128, description: "Sales tax code" },
      { tableName: "ODUN", tableSufix: "DUN", objectCode: 151, description: "Dunning letters" },
      { tableName: "OUFD", tableSufix: "UFD", objectCode: 152, description: "User fields" },
      { tableName: "OUTB", tableSufix: "UTB", objectCode: 153, description: "User tables" },
      { tableName: "OPEX", tableSufix: "PEX", objectCode: 158, description: "Payment run export" },
      { tableName: "OMRV", tableSufix: "MRV", objectCode: 162, description: "Material revaluation (country-specific for Poland) " },
      { tableName: "OCTT", tableSufix: "CTT", objectCode: 170, description: "Contract templates" },
      { tableName: "OHEM", tableSufix: "HEM", objectCode: 171, description: "Employees" },
      { tableName: "OINS", tableSufix: "INS", objectCode: 176, description: "Customer equipment cards" },
      { tableName: "OWHT", tableSufix: "WHT", objectCode: 178, description: "Withholding tax data" },
      { tableName: "OBOE", tableSufix: "BOE", objectCode: 181, description: "Bill of exchange for payment" },
      { tableName: "OBOT", tableSufix: "BOT", objectCode: 182, description: "Bill of exchange transaction" },
      { tableName: "OCRB", tableSufix: "CRB", objectCode: 187, description: "Business partner - bank accounts" },
      { tableName: "OSLT", tableSufix: "SLT", objectCode: 189, description: "Service call solutions" },
      { tableName: "OCTR", tableSufix: "CTR", objectCode: 190, description: "Service contracts" },
      { tableName: "OSCL", tableSufix: "SCL", objectCode: 191, description: "Service call" },
      { tableName: "OUKD", tableSufix: "UKD", objectCode: 193, description: "User keys description" },
      { tableName: "OQUE", tableSufix: "QUE", objectCode: 194, description: "Queues" },
      { tableName: "OFCT", tableSufix: "FCT", objectCode: 198, description: "Sales forecast" },
      { tableName: "OTER", tableSufix: "TER", objectCode: 200, description: "Territories" },
      { tableName: "OOND", tableSufix: "OND", objectCode: 201, description: "Industries" },
      { tableName: "OPKG", tableSufix: "PKG", objectCode: 205, description: "Packages types" },
      { tableName: "OUDO", tableSufix: "UDO", objectCode: 206, description: "User-defined objects" },
      { tableName: "OORL", tableSufix: "ORL", objectCode: 212, description: "Relationships" },
      { tableName: "OUPT", tableSufix: "UPT", objectCode: 214, description: "User permission tree" },
      { tableName: "OCLA", tableSufix: "CLA", objectCode: 217, description: "Activity status" }
    ];

    return objData.find(item => {
      return item.tableName === (tableName || '').toUpperCase()
        || item.objectCode.toString() === (objectCode || '').toString();
    });
  };

  // Make avaiable in window global object
})((window.sappy = window.sappy || {}));

// return it as export
module.exports = window.sappy;
