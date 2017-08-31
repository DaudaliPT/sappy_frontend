import accounting from "./accountingjs";
import moment from 'moment';

// import "./jquery.resize";

// byUs namespace
(function (byUs) {
  // Public Property
  byUs.author = "Urbino Pescada";


  byUs.isEqual = (val1, val2) => {
    if ((val1 === null || typeof val1 === "undefined")
      && (val2 === null || typeof val2 === "undefined")) return true;

    return (val1 === val2)
  }
  byUs.isDiferent = (val1, val2) => !byUs.isEqual(val1, val2);

  byUs.parseBackendError = function (costumMsg, err) {
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

  byUs.applySapDeformats = () => {
    accounting.settings = {
      currency: {
        symbol: "€", // default currency symbol is '$'
        format: {
          pos: "%v %s", //"%s %v" for positive values, eg. "$ 1.00" (required)
          neg: "-%v %s", //"%s (%v)" for negative values, eg. "$ (1.00)" [optional]
          zero: "%v %s" //"%s  -- " for zero values, eg. "$  --" [optional]
        },
        decimal: byUs.sessionInfo.company.oadm.DecSep, // decimal point separator
        thousand: byUs.sessionInfo.company.oadm.ThousSep, // thousands separator
        precision: 2 // decimal places
      },
      number: {
        decimal: byUs.sessionInfo.company.oadm.DecSep,
        thousand: byUs.sessionInfo.company.oadm.ThousSep,
        precision: 0 // default precision on numbers is 0
      }
    };
  }

  byUs.replaceAll = function (str, find, replace) {
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
    if (byUs.sessionInfo.company.oadm.DateFormat === "0") sapFormat = "DD/MM/YY"
    if (byUs.sessionInfo.company.oadm.DateFormat === "1") sapFormat = "DD/MM/YYYY"
    if (byUs.sessionInfo.company.oadm.DateFormat === "2") sapFormat = "MM/DD/YY"
    if (byUs.sessionInfo.company.oadm.DateFormat === "3") sapFormat = "MM/DD/YYYY"
    if (byUs.sessionInfo.company.oadm.DateFormat === "4") sapFormat = "YYYY/MM/DD"
    if (byUs.sessionInfo.company.oadm.DateFormat === "5") sapFormat = "DD/MMM/YYYY"
    if (byUs.sessionInfo.company.oadm.DateFormat === "6") sapFormat = "AA/MM/DD"

    sapFormat = byUs.replaceAll(sapFormat, "/", byUs.sessionInfo.company.oadm.DateSep)
    return sapFormat
  }

  byUs.accounting = accounting;
  byUs.moment = moment;
  byUs.unformat = {
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
        if (value === ".") {
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

  byUs.round = (value, decimals) => {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
  }

  byUs.getNum = value => {
    let ret = 0;
    if (typeof value === "number") return value;
    if (value === null || typeof value === "undefined") return 0;
    if (value === "") return 0;

    if (typeof value === "string")
      if (value.indexOf(".") > -1 && value.indexOf(",") === -1)
        ret = parseFloat(value);
      else
        ret = byUs.unformat.number(value);
    else
      ret = parseFloat(value);

    if (typeof ret === "number") return ret;
    return 0
  }

  byUs.format = {
    price: (value) => {
      let decimals = byUs.sessionInfo.company.oadm.PriceDec;
      if (typeof value === 'string') value = parseFloat(value);
      return accounting.formatMoney(value, null, decimals);
    },
    amount: (value) => {
      let decimals = byUs.sessionInfo.company.oadm.SumDec;
      if (typeof value === 'string') value = parseFloat(value);
      return accounting.formatMoney(value, null, decimals);
    },
    saprate: (value) => {
      let decimals = byUs.sessionInfo.company.oadm.RateDec;
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
      let decimals = byUs.sessionInfo.company.oadm.QtyDec;
      if (typeof value === 'string') value = parseFloat(value);
      let ret = accounting.formatNumber(value, decimals);

      ret = ret.replace(
        byUs.sessionInfo.company.oadm.DecSep + '000000'.substring(0, byUs.sessionInfo.company.oadm.QtyDec)
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

    properDisplayDate: value => {
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

      return day + "-" + month + "-" + year;
    },

    properDisplayDateTime: value => {
      let parsedDate;

      if (!value) return '';

      if (value instanceof Date) {
        parsedDate = value;
      } else {
        parsedDate = new Date(value);
      }

      let y = parsedDate.getFullYear();
      let M = parsedDate.getMonth() + 1; //Months are zero based
      let d = parsedDate.getDate();
      let h = parsedDate.getHours();
      let m = parsedDate.getMinutes();
      let s = parsedDate.getSeconds();

      if (d.toString().length === 1) d = "0" + d;
      if (M.toString().length === 1) M = "0" + M;
      if (h.toString().length === 1) h = "0" + h;
      if (m.toString().length === 1) m = "0" + m;
      if (s) {
        if (s.toString().length === 1) s = "0" + s;
        return d + "-" + M + "-" + y + " " + h + ":" + m + ":" + s;
      } else {
        return d + "-" + M + "-" + y + " " + h + ":" + m;
      }
    }
  };

  byUs.CrystalReports = {
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

  // Make avaiable in window global object
})((window.byUs = window.byUs || {}));

// return it as export
module.exports = window.byUs;
