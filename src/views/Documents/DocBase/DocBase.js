import React, { Component } from "react";
import DocHeader from "./DocHeader";
import DocDetail from "./DocDetail";
import DocFooter from "./DocFooter";
import DocTotal from "./DocTotal";
import actionFunc from "./DocBaseActions";
import axios from "axios";
import "./DocBase.css";
const $ = window.$;
const sappy = window.sappy;

class DocBase extends Component {
  constructor(props) {
    super(props);

    this.recalcComponentsHeight = this.recalcComponentsHeight.bind(this);
    this.toggleHeader = this.toggleHeader.bind(this);
    this.toggleEditable = this.toggleEditable.bind(this);
    this.loadDoc = this.loadDoc.bind(this);

    this.ensureDocHeaderExists = this.ensureDocHeaderExists.bind(this);
    this.handleHeaderFieldChange = this.handleHeaderFieldChange.bind(this);
    this.handleDetailRowChange = this.handleDetailRowChange.bind(this);
    this.handleDetailRowReorder = this.handleDetailRowReorder.bind(this);
    this.handleDetailRowSelect = this.handleDetailRowSelect.bind(this);
    this.handleFooterSearchResult = this.handleFooterSearchResult.bind(this);
    this.handleToggleShowTotals = this.handleToggleShowTotals.bind(this);
    this.handleToogleLimitSearch = this.handleToogleLimitSearch.bind(this);
    this.forceReload = this.forceReload.bind(this);
    this.setNewDataAndDisplayAlerts = this.setNewDataAndDisplayAlerts.bind(this);

    this.state = this.getinitialState(props);
  }

  getinitialState(props) {
    return {
      selectedLineNums: [],
      footerLimitSearch: props.footerLimitSearchCondition || false,
      loading: true,
      changingTotals: false,
      editable: false,
      docData: {
        LINES: []
      },
      header: {
        title: props.title,
        expanded: true,
        toggleHeader: this.toggleHeader,
        toggleEditable: this.toggleEditable
      },
      detail: {},
      footer: {
        showTotals: false
      }
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
    let docHeight = $("#doc").height();
    let detailsTop = $("#docDetail").position().top;
    let detail = { ...this.state.detail };
    detail.height = docHeight - detailsTop - 36;

    this.setState({ detail });
  }

  componentWillReceiveProps(nextProps) {
    let locationState = this.props.location.state || {};
    let nextlocationState = nextProps.location.state || {};

    this.recalcComponentsHeight();

    if (Object.keys(nextlocationState).length === 0 || locationState.DocEntry !== nextlocationState.DocEntry || locationState.id !== nextlocationState.id) {
      return this.setState(this.getinitialState(nextProps), this.loadDoc);
    }
  }

  toggleHeader() {
    let header = { ...this.state.header };
    header.expanded = !header.expanded;
    this.setState({ header }, this.recalcComponentsHeight);
  }
  toggleEditable() {
    let that = this;
    let locationState = this.props.location.state || {};
    let editable = this.state.editable;

    if (editable) return that.setState({ editable: !editable }, that.loadDoc);

    if (!locationState.DocEntry) return;
    let docentry = locationState.DocEntry;
    this.serverRequest = axios
      .get(`${this.props.apiDocsEdit}/${docentry}/haschanges`)
      .then(function(result) {
        let changes = result.data || [];
        if (changes.length === 0) return that.setState({ editable: !editable }, that.loadDoc);

        sappy.showQuestion({
          title: "Continuar edição?",
          msg: "Há alterações não confirmadas neste documento.",
          moreInfo: "Pode continuar a editar ou ignorar as alterações registadas e recomeçar do zero.",
          onConfirm: () => {
            that.setState({ editable: !editable }, that.loadDoc);
          },
          confirmText: "Continuar edição",
          cancelText: "Ignorar alterações anteriores",
          onCancel: () => {
            that.serverRequest = axios
              .post(`${that.props.apiDocsEdit}/${docentry}/deletechanges`)
              .then(function(result) {
                that.setState({ editable: !editable }, that.loadDoc);
              })
              .catch(error => sappy.showError(error, "Erro ao obter dados"));
          }
        });
      })
      .catch(error => sappy.showError(error, "Erro ao obter dados"));
  }

  forceReload() {
    this.loadDoc();
  }

  loadDoc() {
    let that = this;

    let locationState = this.props.location.state || {};

    if (locationState.DocEntry) {
      let docentry = locationState.DocEntry;
      this.serverRequest = axios
        .get(`${this.props.apiDocsEdit}/${docentry}?editable=${this.state.editable ? "yes" : ""}`)
        .then(function(result) {
          let newDocData = result.data;
          that.setNewDataAndDisplayAlerts(newDocData);
        })
        .catch(error => sappy.showError(error, "Erro ao obter dados"));
      return;
    }

    let id = 0;
    if (locationState.id) id = locationState.id;
    if (this.state.docData && this.state.docData.ID) id = this.state.docData.ID;
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
        that.recalcComponentsHeight
      );

      //procurar série predefinida

      let nameSettingSerie = (this.props.module === 0 ? "CMP." : "VND.") + this.props.tableName.toUpperCase() + ".SERIE";
      let settings = sappy.getSettings([nameSettingSerie]);
      let DOCSERIES = sappy.getNum(settings[nameSettingSerie]);

      that.setState({ docData: { ...that.state.docData, DOCSERIES } });

      // this.serverRequest = axios
      //   .get(this.props.apiDocsNew + "/dfltseries")
      //   .then(function(result) {
      //     let docData = that.state.docData;
      //     docData = { ...docData, DOCSERIES };
      //     that.setState({ docData });
      //   })
      //   .catch(error => sappy.showError(error, "Erro ao obter dados"));
    }
  }

  ensureDocHeaderExists(next) {
    let that = this;

    if (this.state.docData.ID) {
      next();
    } else {
      let data = { ...this.state.docData };
      delete data.LINES;

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

    if (docData.ReturnMessage) {
      sappy.showToastr(docData.ReturnMessage);
      delete docData.ReturnMessage;
    }

    this.setState(
      {
        loading: false,
        changingTotals: false,
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
    if (that.props.onHeaderChange) updated = that.props.onHeaderChange(this.state.docData, updated);

    // // check if really changed
    // if (sappy.isEqual(oldVal, val)) return console.log("skip update");
    // console.log(fieldName, oldVal, val)
    if ("EXTRADISC,EXTRADISCPERC,DOCTOTAL".indexOf(fieldName) > -1) this.setState({ changingTotals: true });

    if (this.state.docData.DOCENTRY > 0) {
      that.serverRequest = axios
        .patch(this.props.apiDocsEdit + "/" + this.state.docData.DOCENTRY + `?editable=${this.state.editable ? "yes" : ""}`, updated)
        .then(function(result) {
          let docData = { ...that.state.docData, ...result.data };
          delete docData.changing;
          delete docData[changeInfo.fieldName + "_LOGICMSG"];
          that.setNewDataAndDisplayAlerts(docData);
        })
        .catch(error => sappy.showError(error, "Erro ao gravar cabeçalho"));
    } else {
      this.ensureDocHeaderExists(() => {
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
  }

  handleDetailRowChange(currentRow, updated) {
    let that = this;
    let documentoBloqueado = this.state.docData.DOCNUM > 0;
    if (documentoBloqueado) return;

    if (this.props.onRowChange) updated = this.props.onRowChange(currentRow, updated);

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

  handleToogleLimitSearch() {
    this.setState({ footerLimitSearch: !this.state.footerLimitSearch });
  }

  handleFooterSearchResult({ selectedItems, barcodes, callback } = {}) {
    let that = this;
    let itemCodes = selectedItems;

    let createDocLines = () => {
      this.serverRequest = axios
        .post(`${this.props.apiDocsNew}/${this.state.docData.ID}/lines`, {
          itemCodes,
          barcodes
        })
        .then(function(result) {
          let newDocData = { ...that.state.docData, ...result.data };
          that.setState({ docData: newDocData }, () => {
            //scroll to end
            that.refs.DocDetail.scrollToLastLine();
          });
          if (callback) callback();
        })
        .catch(error => {
          sappy.showError(error, "Erro ao adicionar linhas");
          if (callback) callback();
        });
    };

    if ((itemCodes && itemCodes.length > 0) || (barcodes && barcodes.length > 0)) {
      this.ensureDocHeaderExists(createDocLines);
    }
  }

  render() {
    let that = this;
    let docData = this.state.docData;
    let changingTotals = this.state.changingTotals;
    let editable = this.state.editable;

    let totals = docData.totals || {};
    let headerProps = {
      ...this.state.header,
      editable,
      docData,
      fields: this.props.headerFields,
      onFieldChange: this.handleHeaderFieldChange
    };

    let detailProps = {
      ...this.state.detail,
      fields: this.props.detailFields,
      sidebarFields: this.props.sidebarFields,
      onSideBarFieldChange: this.handleHeaderFieldChange,
      docData,
      onRowUpdate: this.handleDetailRowChange,
      onRowSelectionChange: this.handleDetailRowSelect,
      selectedKeys: this.state.selectedLineNums,
      onRowReorder: this.handleDetailRowReorder
    };

    let footerLimitSearchCondition = this.props.footerLimitSearchCondition || "";
    Object.keys(docData).forEach(field => (footerLimitSearchCondition = sappy.replaceAll(footerLimitSearchCondition, "<" + field + ">", docData[field])));

    let canConfirmar = this.state.docData.ID > 0 || (this.state.docData.DOCNUM > 0 && editable);

    let footerProps = {
      ...this.state.footer,
      docData,
      editable,
      loading: this.state.loading,
      footerLimitSearch: this.state.footerLimitSearch,
      footerLimitSearchCondition,
      footerSearchType: this.props.footerSearchType,
      footerSearchShowCatNum: this.props.footerSearchShowCatNum,
      onToogleLimitSearch: this.handleToogleLimitSearch,
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
      changingTotals,
      onFieldChange: this.handleHeaderFieldChange
    };

    // console.log("DocBase", this.state)
    return (
      <div>
        <div id="doc">
          <DocHeader {...headerProps} />
          <DocDetail ref="DocDetail" {...detailProps} />
        </div>
        <DocFooter {...footerProps} />
        {this.state.footer.showTotals && <DocTotal {...totalProps} />}
      </div>
    );
  }
}

DocBase.defaultProps = {
  title: "title...",
  apiDocsNew: "", //  /api/docs/ordr/doc
  headerFields: {},
  sidebarFields: {},
  detailFields: [],
  footerLimitSearchCondition: "",
  footerSearchShowCatNum: false,
  onRowChange: null, //   handleRowChange(currentRow, updated) => allows for specific doc behaviour
  onHeaderChange: null //  onHeaderChange(docData, updated) => allows to react to user change on header
};

export default DocBase;
