
import React, { Component } from "react";
import DocHeader from "./DocHeader";
import DocDetail from "./DocDetail";
import DocFooter from "./DocFooter";
import DocTotal from "./DocTotal";
import actionFunc from './BaseDocumentActions'
import axios from "axios";
import "./BaseDocument.css";
const $ = window.$;
const byUs = window.byUs;

class BaseDocument extends Component {
  constructor(props) {
    super(props)

    this.recalcComponentsHeight = this.recalcComponentsHeight.bind(this)
    this.toggleHeader = this.toggleHeader.bind(this)
    this.loadDoc = this.loadDoc.bind(this)

    this.ensureDocHeaderExists = this.ensureDocHeaderExists.bind(this);
    this.handleHeaderFieldChange = this.handleHeaderFieldChange.bind(this)
    this.handleDetailRowChange = this.handleDetailRowChange.bind(this)
    this.handleDetailRowSelect = this.handleDetailRowSelect.bind(this)
    this.handleFooterSearchResult = this.handleFooterSearchResult.bind(this)
    this.handleToggleShowTotals = this.handleToggleShowTotals.bind(this)
    this.handleToogleLimitSearch = this.handleToogleLimitSearch.bind(this)
    this.forceReload = this.forceReload.bind(this)
    this.setNewDataAndDisplayAlerts = this.setNewDataAndDisplayAlerts.bind(this)

    this.state = this.getinitialState(props)
  }

  getinitialState(props) {
    return {
      currentModal: null,
      hasSelectedRows: false,
      footerLimitSearch: props.footerLimitSearchCondition || false,
      loading: true,
      docData: {
        LINES: []
      },
      header: {
        title: props.title,
        expanded: true,
        toggleHeader: this.toggleHeader,
      },
      detail: {
      },
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

  componentWillReceiveProps(nextProps) {

    let locationState = this.props.location.state || {};
    let nextlocationState = nextProps.location.state || {};

    this.recalcComponentsHeight();

    if (Object.keys(nextlocationState).length === 0
      || locationState.DocEntry !== nextlocationState.DocEntry
      || locationState.id !== nextlocationState.id
    ) {
      return this.setState(this.getinitialState(nextProps), this.loadDoc);
    }
  }

  recalcComponentsHeight() {
    let docHeight = $("#doc").height();
    let detailsTop = $("#docDetail").position().top;
    let detail = { ...this.state.detail }
    detail.height = (docHeight - detailsTop)
    this.setState({ detail })
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.recalcComponentsHeight);
  }

  toggleHeader() {
    let header = { ...this.state.header }
    header.expanded = !header.expanded
    this.setState({ header }, this.recalcComponentsHeight)
  }

  forceReload() {
    this.loadDoc();
  }

  loadDoc() {
    let that = this;

    let locationState = this.props.location.state || {}

    if (locationState.DocEntry) {
      let docentry = locationState.DocEntry;
      this.serverRequest = axios
        .get(`${this.props.baseApiUrl}/view/${docentry}`)
        .then(function (result) {

          let newDocData = result.data
          that.setNewDataAndDisplayAlerts(newDocData);

        })
        .catch(error => byUs.showError(error, "Erro ao obter dados"));
      return
    }

    let id = 0;
    if (locationState.id) id = locationState.id;
    if (this.state.docData && this.state.docData.ID) id = this.state.docData.ID;
    if (id) {
      this.serverRequest = axios
        .get(`${this.props.baseApiUrl}/${id}`)
        .then(function (result) {

          let newDocData = result.data
          that.setNewDataAndDisplayAlerts(newDocData);

        })
        .catch(error => byUs.showError(error, "Erro ao obter dados"));
    }
    else {
      that.setState({
        loading: false
      }, that.recalcComponentsHeight)

      //procurar série predefinida
      this.serverRequest = axios
        .get(this.props.baseApiUrl + "/dfltseries")
        .then(function (result) {
          let docData = that.state.docData;
          docData = { ...docData, DOCSERIES: result.data.Series };
          that.setState({ docData });
        })
        .catch(error => byUs.showError(error, "Erro ao obter dados"))

    }
  }


  ensureDocHeaderExists(next) {
    let that = this;


    if (this.state.docData.ID) {
      next();
    } else {
      let data = { ...this.state.docData }
      delete data.LINES

      this.serverRequest = axios
        .post(this.props.baseApiUrl, data)
        .then(function (result) {
          let docData = that.state.docData;
          docData = { ...docData, ...result.data };
          that.setState({ docData, rows: [] });

          next && next();
        })
        .catch(error => byUs.showError(error, "Erro ao gravar cabeçalho"));
    }
  }

  setNewDataAndDisplayAlerts(docData) {
    let that = this;


    if (docData.ReturnMessage) {
      byUs.showToastr(docData.ReturnMessage);
      delete docData.ReturnMessage
    }

    // create alerts 
    // let oldDocData = this.state.docData;
    // Object.keys(docData)
    //   .filter(k => k.indexOf("_VALIDATEMSG") > -1)
    //   .forEach(f => {
    //     let validatemsg = docData[f];
    //     if (validatemsg && oldDocData[f] !== validatemsg) {
    //       let color = validatemsg.split('|')[0];
    //       let msg = validatemsg.split('|')[1];
    //       byUs.showToastr({ color, msg });
    //     }
    //   });   
    this.setState({
      loading: false,
      docData
    }, that.recalcComponentsHeight)

  }

  handleHeaderFieldChange(changeInfo) {
    let that = this;
    // let formatedValue = changeInfo.formatedValue;
    let val = changeInfo.rawValue;
    let fieldName = changeInfo.fieldName;

    let updated = { [fieldName]: val || null }
    if (that.props.onHeaderChange) updated = that.props.onHeaderChange(this.state.docData, updated);


    this.ensureDocHeaderExists(() => {

      that.serverRequest = axios
        .patch(this.props.baseApiUrl + "/" + this.state.docData.ID, updated)
        .then(function (result) {
          let docData = { ...that.state.docData, ...result.data };
          delete docData[changeInfo.fieldName + "_LOGICMSG"]
          that.setNewDataAndDisplayAlerts(docData);
        })
        .catch(error => byUs.showError(error, "Erro ao gravar cabeçalho"));
    });

  }

  handleDetailRowChange(currentRow, updated) {
    let that = this;
    let documentoBloqueado = this.state.docData.DOCNUM > 0;
    if (documentoBloqueado) return;

    if (this.props.onRowChange) updated = this.props.onRowChange(currentRow, updated)

    this.serverRequest = axios
      .patch(`${this.props.baseApiUrl}/${this.state.docData.ID}/line/${currentRow.LINENUM}`, { ...updated })
      .then(function (result) {
        let new_row = result.data.UPDATED_LINE;
        // create a new object and replace the line on it, keeping the other intact
        let rows = that.state.docData.LINES.map(r => {
          if (r.LINENUM === new_row.LINENUM) {
            return new_row
          } else {
            return r
          }
        });

        let newDocData = { ...result.data, LINES: rows }
        delete newDocData.UPDATED_LINE;
        that.setNewDataAndDisplayAlerts(newDocData)
      })
      .catch(error => byUs.showError(error, "Erro ao gravar linha"));
  }

  handleDetailRowSelect(selectedIndexes) {
    this.setState({ hasSelectedRows: selectedIndexes.length > 0 });
  }

  handleToggleShowTotals() {
    let footer = { ...this.state.footer }
    footer.showTotals = !footer.showTotals;

    this.setState({ footer })
  }

  handleToogleLimitSearch() {
    this.setState({ footerLimitSearch: !this.state.footerLimitSearch })
  }

  handleFooterSearchResult(selectedItems) {
    let that = this;

    let createDocLines = (itemCodes) => {
      this.serverRequest = axios
        .post(`${this.props.baseApiUrl}/${this.state.docData.ID}/lines`, { itemCodes })
        .then(function (result) {
          let newDocData = { ...that.state.docData, ...result.data }
          that.setState({ docData: newDocData });
        })
        .catch(error => byUs.showError(error, "Erro ao adicionar linhas"));
    }

    if (selectedItems && selectedItems.length > 0) {
      this.ensureDocHeaderExists(() => {
        createDocLines(selectedItems);
      });
    }
  }

  render() {
    let that = this;
    let docData = this.state.docData;
    let { LINES } = docData;

    let totals = docData.totals || {};
    let headerProps = {
      ...this.state.header,
      docData,
      fields: this.props.headerFields,
      onFieldChange: this.handleHeaderFieldChange
    }

    let detailProps = {
      ...this.state.detail,
      fields: this.props.detailFields,
      docData,
      onRowUpdate: this.handleDetailRowChange,
      onRowSelect: this.handleDetailRowSelect
    }

    let footerLimitSearchCondition = this.props.footerLimitSearchCondition || '';
    Object.keys(docData).forEach(
      field => footerLimitSearchCondition = byUs.replaceAll(footerLimitSearchCondition, "<" + field + ">", docData[field])
    )

    let footerProps = {
      ...this.state.footer,
      docData,
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
        // { name: "Apagar", color: "danger", icon: "icon wb-trash", visible: (this.state.docData.ID > 0 && !this.state.hasSelectedRows), onClick: e => actionFunc.handleOnApagar(that) },
        {
          name: "Apagar linhas", color: "danger", icon: "icon wb-trash",
          visible: (this.state.docData.ID > 0 && this.state.hasSelectedRows),
          onClick: e => actionFunc.handleOnApagarLinhas(that)
        },
        { name: "Cancelar", color: "primary", icon: "icon wb-close", visible: true, onClick: e => actionFunc.handleOnCancelar(that) },
        { name: "Confirmar", color: "success", icon: "icon fa-check", visible: (this.state.docData.ID > 0), onClick: e => actionFunc.handleOnConfirmar(that) }
      ]
    }
    let totalProps = {
      totals,
      docData,
      onFieldChange: this.handleHeaderFieldChange
    }

    // console.log("BaseDocument", this.state)
    return (
      <div id="doc">
        {/* <DocTitle></DocTitle> */}
        <DocHeader {...headerProps}></DocHeader>
        <DocDetail ref="DocDetail" {...detailProps}></DocDetail>
        <DocFooter {...footerProps}></DocFooter>
        {this.state.footer.showTotals &&
          <DocTotal {...totalProps}></DocTotal>
        }
        {this.props.currentModal}
        {this.state.currentModal}
      </div >
    );
  }
}

BaseDocument.defaultProps = {
  title: "title...",
  baseApiUrl: '',//  /api/docs/ordr/doc
  headerFields: {},
  detailFields: [],
  footerLimitSearchCondition: '',
  footerSearchShowCatNum: false,
  onRowChange: null,//   handleRowChange(currentRow, updated) => allows for specific doc behaviour
  onHeaderChange: null, //  onHeaderChange(docData, updated) => allows to react to user change on header
  currentModal: null
}

export default BaseDocument;
