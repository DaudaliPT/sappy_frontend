import React, { Component } from "react";
import PosHeader from "./PosHeader";
import PosDetail from "./PosDetail";
import PosFooter from "./PosFooter";
import PosTotal from "./PosTotal";
import actionFunc from "./PosBaseActions";
import axios from "axios";
import "./PosBase.css";
const $ = window.$;
const sappy = window.sappy;

class PosBase extends Component {
  constructor(props) {
    super(props);

    this.recalcComponentsHeight = this.recalcComponentsHeight.bind(this);
    this.toggleHeader = this.toggleHeader.bind(this);
    this.togglePinHeader = this.togglePinHeader.bind(this);
    this.loadDoc = this.loadDoc.bind(this);

    this.ensureposHeaderExists = this.ensureposHeaderExists.bind(this);
    this.handleHeaderFieldChange = this.handleHeaderFieldChange.bind(this);
    this.handleDetailRowChange = this.handleDetailRowChange.bind(this);
    this.handleDetailRowReorder = this.handleDetailRowReorder.bind(this);
    this.handleDetailRowSelect = this.handleDetailRowSelect.bind(this);
    this.handleFooterSearchResult = this.handleFooterSearchResult.bind(this);
    this.handleToggleShowTotals = this.handleToggleShowTotals.bind(this);
    this.handleToogleLimitSearch = this.handleToogleLimitSearch.bind(this);
    this.handleToogleUseBaseDoclines = this.handleToogleUseBaseDoclines.bind(this);
    this.forceReload = this.forceReload.bind(this);
    this.setNewDataAndDisplayAlerts = this.setNewDataAndDisplayAlerts.bind(this);

    this.state = this.getinitialState(props);
  }

  getinitialState(props) {
    let settings = sappy.getSettings(["POS.CFINAL.CARDCODE"]);
    return {
      selectedLineNums: [],
      footerLimitSearch: !!props.footerSearchLimitCondition || false,
      footerUseBaseDoclines: !!props.footerBaseDocLinesCondition || false,
      loading: true,
      docData: {
        LINES: []
      },
      header: {
        title: props.title,
        expanded: true,
        pinHeader: localStorage.getItem("pinHeader") === "Y",
        toggleHeader: this.toggleHeader,
        togglePinHeader: this.togglePinHeader
      },
      detail: {},
      footer: {
        showTotals: false
      },
      settings
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.recalcComponentsHeight);
    this.recalcComponentsHeight();
    this.loadDoc();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.recalcComponentsHeight);
  }

  recalcComponentsHeight() {
    // let docHeight = $("#pos").height();
    let detailsTop = $("#posDetail").position().top;
    let footerTop = $("#posFooter").position().top;
    let detail = { ...this.state.detail };
    detail.height = footerTop - detailsTop - 10;

    this.setState({ detail });
  }

  componentWillReceiveProps(nextProps) {
    let locationState = this.props.location.state || {};
    let nextlocationState = nextProps.location.state || {};

    this.recalcComponentsHeight();

    if (locationState.ID !== nextlocationState.ID || locationState.search !== nextlocationState.search) {
      return this.setState(this.getinitialState(nextProps), this.loadDoc);
    }
  }

  toggleHeader() {
    let header = { ...this.state.header };
    header.expanded = !header.expanded;
    this.setState({ header }, this.recalcComponentsHeight);
  }

  togglePinHeader() {
    // let that = this;
    let header = { ...this.state.header };
    header.pinHeader = !header.pinHeader;
    if (header.pinHeader) {
      header.expanded = true;
    }
    localStorage.setItem("pinHeader", header.pinHeader ? "Y" : "N");

    this.setState({ header }, this.recalcComponentsHeight);
  }

  forceReload() {
    this.loadDoc();
  }

  loadDoc() {
    let that = this;
    let locationState = this.props.location.state || {};

    let id = 0;
    if (locationState.ID) id = locationState.ID;
    if (this.state.docData && this.state.docData.ID) id = this.state.docData.ID;

    // console.log("LoadDoc" + id);
    if (id) {
      this.serverRequest = axios
        .get(`${this.props.apiDocsNew}/${id}`)
        .then(function(result) {
          let newDocData = result.data;
          that.setNewDataAndDisplayAlerts(newDocData);
        })
        .catch(error => sappy.showError(error, "Erro ao obter dados"));
    } else {
      that.setState(
        {
          loading: false
        },
        () => {
          that.handleHeaderFieldChange({
            fieldName: "CARDCODE",
            formatedValue: that.state.settings["POS.CFINAL.CARDCODE"],
            rawValue: that.state.settings["POS.CFINAL.CARDCODE"]
          });
          that.recalcComponentsHeight();
        }
      );
    }
  }

  ensureposHeaderExists(next) {
    let that = this;

    if (this.state.docData.ID) {
      next();
    } else {
      let data = { ...this.state.docData };
      delete data.LINES;
      data.MODULE = 2; // 2=>POS
      this.serverRequest = axios
        .post(this.props.apiDocsNew, data)
        .then(function(result) {
          let docData = that.state.docData;
          docData = { ...docData, ...result.data };
          that.setState({ docData, rows: [] });

          next && next();
        })
        .catch(error => sappy.showError(error, "Erro ao gravar cabeçalho"));
    }
  }

  setNewDataAndDisplayAlerts(docData) {
    let that = this;

    if (docData.ReturnToastr) {
      sappy.showToastr(docData.ReturnToastr);
      delete docData.ReturnToastr;
    }

    if (docData.ReturnPopup) {
      sappy.showError(docData.ReturnPopup);
      delete docData.ReturnPopup;
    }

    this.setState(
      {
        loading: false,
        docData
      },
      that.recalcComponentsHeight
    );
  }

  handleHeaderFieldChange(changeInfo) {
    let that = this;
    // let formatedValue = changeInfo.formatedValue;
    let fieldName = changeInfo.fieldName;
    // let oldVal = this.state.docData[fieldName];
    let val = changeInfo.rawValue;

    let updated = { [fieldName]: val };

    if (fieldName==="UNLOCKEDBY" ) {
      if (this.state.docData.PRICEUNLOCKED) {
        updated.UNLOCKEDBY = '';
        updated.PRICEUNLOCKED = false;
      }
      else {
        updated.PRICEUNLOCKED = true;
      }
    }

    if (that.props.onHeaderChange) updated = that.props.onHeaderChange(this.state.docData, updated);

    this.ensureposHeaderExists(() => {
      that.serverRequest = axios
        .patch(this.props.apiDocsNew + "/" + this.state.docData.ID, updated)
        .then(function(result) {
          let docData = { ...that.state.docData, ...result.data };
          docData.LINES = [...docData.LINES];
          delete docData.changing;
          delete docData[changeInfo.fieldName + "_LOGICMSG"];
          that.setNewDataAndDisplayAlerts(docData);
        })
        .catch(error => sappy.showError(error, "Erro ao gravar cabeçalho"));
    });
  }

  handleDetailRowChange(currentRow, updated) {
    let that = this;
    if (this.props.onRowChange) updated = this.props.onRowChange(currentRow, updated);

    if (updated.hasOwnProperty("PRICE") ||updated.hasOwnProperty("USER_DISC")) {
      if(!this.state.docData.PRICEUNLOCKED) { 
        return setImmediate(()=>  sappy.showWarning({
          title:"Alteração de preços bloqueada",
          moreInfo:"È necessária permissão para alterar preços. Por favor, chame um responsável."
        }));
      }else {
        if (updated.hasOwnProperty("PRICE") ) updated.PRICE_CHANGEDBY = sappy.sessionInfo.user.NAME + "("+this.state.docData.UNLOCKEDBY+")";
        if (updated.hasOwnProperty("USER_DISC")) updated.DISC_CHANGEDBY = sappy.sessionInfo.user.NAME + "("+this.state.docData.UNLOCKEDBY+")";
      }
    }

    this.serverRequest = axios
      .patch(`${this.props.apiDocsNew}/${this.state.docData.ID}/line/${currentRow.LINENUM}`, { ...updated })
      .then(function(result) {
        let new_row = result.data.UPDATED_LINE;
        // create a new object and replace the line on it, keeping the other intact
        let rows = that.state.docData.LINES.map(r => {
          if (r.LINENUM === new_row.LINENUM) {
            return new_row;
          } else {
            return r;
          }
        });

        let newDocData = { ...result.data, LINES: rows };
        delete newDocData.UPDATED_LINE;
        that.setNewDataAndDisplayAlerts(newDocData);
      })
      .catch(error => sappy.showError(error, "Erro ao gravar linha"));
  }

  handleDetailRowSelect(selectedLineNums) {
    this.setState({ selectedLineNums });
  }

  handleDetailRowReorder(draggedRows, rowTarget, orderedRows) {
    let that = this;

    let LINENUMS = orderedRows.map(line => line.LINENUM);
    that.serverRequest = axios
      .post(`${that.props.apiDocsNew}/${that.state.docData.ID}/reorderlines`, {
        Lines: LINENUMS
      })
      .then(result => {
        let docData = { ...that.state.docData, ...result.data };
        that.setState({ selectedLineNums: false, docData });
      })
      .catch(error => sappy.showError(error, "Não foi possível reordernar as linhas"));
  }

  handleToggleShowTotals() {
    let footer = { ...this.state.footer };
    footer.showTotals = !footer.showTotals;

    this.setState({ footer });
  }

  handleToogleUseBaseDoclines() {
    if (this.state.docData.OBJTYPE === "14") return; //
    this.setState({ footerUseBaseDoclines: !this.state.footerUseBaseDoclines });
  }

  handleToogleLimitSearch() {
    this.setState({ footerLimitSearch: !this.state.footerLimitSearch });
  }

  handleFooterSearchResult({ selectedItems, barcodes, callback } = {}) {
    let that = this;
    let itemCodes = selectedItems;

    let pinHeader = this.state.header.pinHeader;
    let expanded = this.state.header.expanded;
    if (!pinHeader && expanded) that.toggleHeader();


    if (barcodes && barcodes.length ===1 && barcodes[0].startsWith('#FN#')){
      // Special function barcode
      if (barcodes[0].startsWith('#FN#PC#')){
        let byName = barcodes[0].split("#")[3];

        return that.handleHeaderFieldChange({
          fieldName: "UNLOCKEDBY",
          formatedValue: byName,
          rawValue: byName
        });
      }
    }


    let createDocLines = () => {
      this.serverRequest = axios
        .post(`${this.props.apiDocsNew}/${this.state.docData.ID}/lines`, {
          itemCodes,
          barcodes
        })
        .then(function(result) {
          let newDocData = { ...that.state.docData, ...result.data };

          that.setState({ docData: newDocData }, () => {
            let idx = 0;
            that.refs.PosDetail.props.fields.forEach((f, i) => {
              if (f.name === "QTPK") idx = i;
            });
            that.refs.PosDetail.focusCell({ rowIdx: 0, idx });
          });
          if (callback) callback();
        })
        .catch(error => {
          sappy.showError(error, "Erro ao adicionar linhas");
          if (callback) callback();
        });
    };

    if ((itemCodes && itemCodes.length > 0) || (barcodes && barcodes.length > 0)) {
      this.ensureposHeaderExists(createDocLines);
    }
  }

  render() {
    let that = this;
    let docData = this.state.docData;

    let totals = docData.totals || {};
    let headerProps = {
      ...this.state.header,
      docData,
      fields: this.props.headerFields,
      onFieldChange: this.handleHeaderFieldChange,
      togglePinHeader: this.togglePinHeader
    };

    let detailProps = {
      ...this.state.detail,
      fields: this.props.detailFields,
      onSideBarFieldChange: this.handleHeaderFieldChange,
      docData,
      onRowUpdate: this.handleDetailRowChange,
      onRowSelectionChange: this.handleDetailRowSelect,
      selectedKeys: this.state.selectedLineNums,
      onRowReorder: this.handleDetailRowReorder
    };

    let footerSearchLimitCondition = this.props.footerSearchLimitCondition || "";
    Object.keys(docData).forEach(field => (footerSearchLimitCondition = sappy.replaceAll(footerSearchLimitCondition, "<" + field + ">", docData[field])));
    let footerBaseDocLinesCondition = this.props.footerBaseDocLinesCondition || "";
    Object.keys(docData).forEach(field => (footerBaseDocLinesCondition = sappy.replaceAll(footerBaseDocLinesCondition, "<" + field + ">", docData[field])));

    let canConfirmar = this.state.docData.ID > 0;

    let footerProps = {
      ...this.state.footer,
      docData,
      loading: this.state.loading,
      footerLimitSearch: this.state.footerLimitSearch,
      footerUseBaseDoclines: this.state.footerUseBaseDoclines,
      footerSearchLimitCondition,
      footerBaseDocLinesCondition,
      footerSearchType: this.props.footerSearchType,
      footerSearchShowCatNum: this.props.footerSearchShowCatNum,
      onToogleUseSearchLimit: this.handleToogleLimitSearch,
      onToogleUseBaseDoclines: this.handleToogleUseBaseDoclines,
      onFooterSearchResult: this.handleFooterSearchResult,
      onToggleShowTotals: this.handleToggleShowTotals,
      totals,
      actions: [
        {
          name: this.state.selectedLineNums.length === 1 ? "Apagar linha" : "Apagar linhas",
          color: "danger",
          icon: "icon wb-trash",
          visible: this.state.docData.ID > 0 && this.state.selectedLineNums.length > 0,
          onClick: e => actionFunc.handleOnApagarLinhas(that)
        },
        {
          name: "Voltar",
          color: "primary",
          icon: "icon wb-close",
          visible: true,
          onClick: e => actionFunc.handleOnCancelar(that)
        },
        {
          name: "Confirmar",
          color: "success",
          icon: "icon fa-check",
          visible: canConfirmar,
          onClick: e => actionFunc.handleOnConfirmar(that)
        }
      ]
    };
    let totalProps = {
      totals,
      docData,
      onFieldChange: this.handleHeaderFieldChange
    };

    // console.log("PosBase", this.state)
    return (
      <div>
        <div id="pos">
          <PosHeader {...headerProps} />
          <PosDetail ref="PosDetail" {...detailProps} />
        </div>
        <PosFooter {...footerProps} />
        {this.state.footer.showTotals && <PosTotal {...totalProps} />}
      </div>
    );
  }
}

PosBase.defaultProps = {
  title: "title...",
  apiDocsNew: "", //  /api/docs/ordr/doc
  headerFields: {},
  detailFields: [],
  footerSearchLimitCondition: "",
  footerSearchShowCatNum: false,
  onRowChange: null, //   handleRowChange(currentRow, updated) => allows for specific doc behaviour
  onHeaderChange: null //  onHeaderChange(docData, updated) => allows to react to user change on header
};

export default PosBase;
