
import React, { Component } from "react";
import { Button, Badge } from "reactstrap";
import { hashHistory } from "react-router";

const {
  ToolsPanel: { AdvancedToolbar: Toolbar, GroupedColumnsPanel },
  Data: { Selectors },
  Draggable: { Container: DraggableContainer }
} = require('react-data-grid-addons');

import axios from "axios";
import uuid from "uuid/v4";
import SearchBar from "./SearchBar.js";
import { ByUsTextBox } from "../../../../Inputs";

import { ModalMessageConfirm } from "../../../../Modals";
import ModalConfirmPrint from "../ModalConfirmPrint";
import ReactDataGrid from "react-data-grid";
import ModalSearchOitm from "./ModalSearchOitm";
import EditModal from "../../Produtos/EditModal";

const byUs = window.byUs;
const $ = window.$;
const CustomToolbar = React.createClass({
  propTypes: {
    groupBy: React.PropTypes.array.isRequired,
    onColumnGroupAdded: React.PropTypes.func.isRequired,
    onColumnGroupDeleted: React.PropTypes.func.isRequired
  },

  render() {
    return (
      <Toolbar>
        <GroupedColumnsPanel groupBy={this.props.groupBy}
          onColumnGroupAdded={this.props.onColumnGroupAdded}
          onColumnGroupDeleted={this.props.onColumnGroupDeleted} />
      </Toolbar>);
  }
});


class IntFormatter extends Component {
  render() {
    const formatedValue = parseFloat(this.props.value || 0).toFixed(0);
    return (
      <div style={{ textAlign: "right" }}>
        {formatedValue}
      </div>
    );
  }
}

class PriceFormatter extends Component {
  render() {
    const formatedValue = parseFloat(this.props.value || 0).toFixed(3);
    return (
      <div style={{ textAlign: "right" }}>
        {formatedValue} {" €"}
      </div>
    );
  }
}

const HeaderAlignRight = ({ column }) => {
  if (column.editable) {
    return <div style={{ textAlign: "right" }}> <strong>{column.name}</strong> </div>;
  } else {
    return <div style={{ textAlign: "right" }}> {column.name} </div>;
  }
};



class SimpleFormatter extends Component {
  render() {
    return <div> {this.props.value || ""}</div>;
  }
}

class DateFormatter extends Component {
  render() {
    return <div> {this.props.value ? byUs.format.properDisplayDate(this.props.value) : ''}</div>;
  }
}
class DescritptionFormatter extends Component {
  render() {
    const badges = this.props.value.split("|");

    const renderBadges = () => {
      if (badges.map) {
        return badges.map((item, ix) => {
          if (ix === 0) {
            return item;
          } else if (item === "MP") {
            return <Badge key={uuid()} color="primary" pill>{item}</Badge>;
          } else if (item === "PV") {
            return <Badge key={uuid()} color="success" pill>{item}</Badge>;
          } else {
            return <Badge key={uuid()} color="danger" pill>{item}</Badge>;
          }
        });
      }
    };

    return (
      <div>
        {renderBadges()}
      </div>
    );
  }
}

class ItemCodeFormater extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentModal: null
    }
  }
  render() {
    let that = this;
    let row = this.props.dependentValues;
    let itemCode = row.ITEM_CODE;

    let toggleModal = () => {
      that.setState({
        currentModal: null
      });
    };

    return <div     >
      <i className="icon fa-arrow-circle-right" aria-hidden="true" onClick={e => {
        that.setState({
          currentModal: <EditModal modal={true} toggleModal={toggleModal} itemcode={itemCode} />
        });
      }} />
      {" "}
      {this.props.value || ""}
      {this.state.currentModal}
    </div>;
  }
}

const getinitialState = (props) => {
  return {
    currentModal: null,
    loading: props.params.id ? true : false,
    searchGridH: 300,
    docData: {
      ID: props.params.id,
      DOCS: props.params.id ? undefined : [],
      OBSERVACOES: props.params.id ? undefined : "Artigos"
    },
    selectedIndexes: [],
    searchBtns: [],
    groupBy: [],
    expandedRows: {},
    rows: []
  };
}
class DocAtualizacaoPrecos extends Component {
  constructor(props) {
    super(props);

    this.handleModalSearchClose = this.handleModalSearchClose.bind(this);
    this.ensureDocHeaderExists = this.ensureDocHeaderExists.bind(this);
    this.createDocLines = this.createDocLines.bind(this);
    this.handleOnCellClick = this.handleOnCellClick.bind(this);
    this.getColumns = this.getColumns.bind(this);
    this.onMoveTo = this.onMoveTo.bind(this);
    this.loadDoc = this.loadDoc.bind(this);
    this.handleOnChange_txtSearch = this.handleOnChange_txtSearch.bind(this);
    this.performSearch = this.performSearch.bind(this);
    this.handleOnKeyDown_txtSearch = this.handleOnKeyDown_txtSearch.bind(this);
    this.onRowsSelected = this.onRowsSelected.bind(this);
    this.onRowsDeselected = this.onRowsDeselected.bind(this);
    this.calcSearchGridH = this.calcSearchGridH.bind(this);
    this.onRowExpandToggle = this.onRowExpandToggle.bind(this);

    this.onColumnGroupAdded = this.onColumnGroupAdded.bind(this);
    this.onColumnGroupDeleted = this.onColumnGroupDeleted.bind(this);
    this.getRows = this.getRows.bind(this);
    this.getRowAt = this.getRowAt.bind(this);
    this.getSize = this.getSize.bind(this);

    this.state = getinitialState(props);
  }

  getColumns({ allowEdit, baseadoEmDocumentos }) {
    let itemCodeCol = {
      key: "ITEM_CODE",
      name: "Código",
      width: 100,
      formatter: ItemCodeFormater,
      getRowMetaData: row => row
    };
    if (baseadoEmDocumentos) {
      itemCodeCol = {
        key: "ITEM_CODES",
        name: "Códigos",
        width: 230,
        formatter: ItemCodeFormater,
        getRowMetaData: row => row
      }
    }

    return [
      { key: "LINENUM", name: "#", width: 40, formatter: SimpleFormatter },
      itemCodeCol,
      { key: "ITEM_NAME_WITH_TAGS", name: "Descrição", width: 400, formatter: DescritptionFormatter },
      { key: "STOCK", name: "Stock", width: 100, formatter: IntFormatter, headerRenderer: HeaderAlignRight },

      { key: "DATA_ULTIMA_ALT", name: "Data At.", width: 100, formatter: DateFormatter },
      { key: "CURRENT_PRICE", name: "P Cash", width: 100, formatter: PriceFormatter, headerRenderer: HeaderAlignRight },
    ];
  }


  componentWillReceiveProps(nextProps) {
    if (this.props.params.id !== nextProps.params.id)
      this.setState(getinitialState(nextProps), this.loadDoc);;
  }

  onMoveTo(nextORprevious) {
    this.serverRequest = axios({
      method: "get",
      url: `/api/inv/etiq/doc/${this.state.docData.ID}/${nextORprevious}`
    })
      .then(result => {
        if (result.data)
          hashHistory.push("/inv/etiq/doc/" + result.data);
      })
      .catch(error => byUs.showError(error, "Erro ao obter dados"));
  }

  componentDidMount() {
    let that = this;
    axios
      .get(`api/inv/etiq/report`)
      .then(function (result) {
        that.setState({
          defaultLayoutCode: result.data.LayoutCode
        });
      })
      .catch(function (error) {
        if (!error.__CANCEL__) byUs.showError(error, "Api error")
      });


    let keyBuffer = "";

    let scannerPerformSearchTimeout = null;
    window.addEventListener("keydown", e => {
      let $f = $(":focus")[0];
      if (!$f || ($f && $f.classList.contains("react-grid-Cell--locked"))) {
        e.preventDefault();
        if (scannerPerformSearchTimeout) clearTimeout(scannerPerformSearchTimeout);

        let timeout = 1000;
        if (e.keyCode === 13 || e.keyCode === 9) {
          timeout = 0;
        } else if (e.keyCode >= 32) {
          keyBuffer += e.key;
        }

        scannerPerformSearchTimeout = setTimeout(function () {
          that.setState(
            {
              searchText: keyBuffer,
              totalInfo: { Total: 0 }
            },
            () => {
              if (keyBuffer) that.performSearch();
              keyBuffer = "";
            }
          );
        }, timeout);
      }
    });

    window.addEventListener("resize", this.calcSearchGridH);

    this.calcSearchGridH();

    this.loadDoc();
  }

  loadDoc() {
    let that = this;
    if (this.props.params.id) {
      this.serverRequest = axios
        .get(`/api/inv/etiq/doc/${this.props.params.id}`)
        .then(function (result) {
          let docData = result.data;
          that.setState({
            loading: false,
            docData,
            rows: [...docData.LINES]
          }
            , that.calcSearchGridH);
        })
        .catch(error => byUs.showError(error, "Erro ao obter dados"));
    }
  }

  componentWillUnmount() {
    if (this.serverRequest && this.serverRequest.abort) this.serverRequest.abort();
    window.removeEventListener("resize", this.calcSearchGridH);
  }

  calcSearchGridH() {
    // This will execute whenever the window is resized
    // let bodyRect = document.body.getBoundingClientRect()
    let elemRect = $(".react-grid-Container")[0].getBoundingClientRect();
    let searchGridH = $(window).height() - elemRect.top - 75;
    if (searchGridH < 300) {
      searchGridH = 300;
    }
    this.setState({ searchGridH });
    return searchGridH;
  }

  handleOnChange_txtSearch(e) {
    e.preventDefault();
    var that = this;

    this.setState(
      {
        searchText: e.target.value,
        totalInfo: { Total: 0 }
      },
      function () {
        //prevent sending to server multime requestes qhen typing
        if (that.lastTxtSearchTimer) clearTimeout(that.lastTxtSearchTimer);
        that.lastTxtSearchTimer = setTimeout(that.findAndGetFirstRows, 500);
      }
    );
  }

  performSearch() {
    let that = this;

    if (this.cancelPreviousAxiosRequest) this.cancelPreviousAxiosRequest();
    var CancelToken = axios.CancelToken;

    let { searchText } = this.state;

    this.serverRequest = axios
      .get(`/api/inv/etiq/searchOitm/`, {
        params: { searchText },
        cancelToken: new CancelToken(function executor(c) {
          that.cancelPreviousAxiosRequest = c;
        })
      })
      .then(result => {
        var listItems = result.data.firstRows;
        let found = listItems.length > 0 ? listItems[0].TOTAL_ROWS : 0;

        if (found === 1) {
          that.ensureDocHeaderExists(() => {
            that.createDocLines([listItems[0].ItemCode]);
          });
          that.setState({ searchText: "" })
        } else if (found > 1) {
          that.setState({
            currentModal: <ModalSearchOitm toggleModal={this.handleModalSearchClose} searchText={this.state.searchText} />
            , searchText: ""
          });
        } else {
        }
      })
      .catch(function (error) {
        if (!error.__CANCEL__) byUs.showError(error, "Api error")
        that.setState({ searchText: "" })
      });
  }

  handleOnKeyDown_txtSearch(e) {
    if (e.keyCode === 13) {
      //Tentar adicionar
      this.performSearch();
    }
  }

  ensureDocHeaderExists(next) {
    let that = this;

    if (this.state.docData.ID) {
      next();
    } else {
      this.serverRequest = axios
        .post(`/api/inv/etiq/doc`)
        .then(function (result) {
          let docData = that.state.docData;
          docData = { ...docData, ...result.data };
          that.setState({ docData, rows: [] });

          next && next();
        })
        .catch(error => byUs.showError(error, "Erro ao gravar dados"));
    }
  }

  createDocLines(itemCodes) {
    let that = this;
    this.serverRequest = axios
      .post(`/api/inv/etiq/doc/${this.state.docData.ID}/lines`, { itemCodes })
      .then(function (result) {
        that.setState({
          rows: result.data,
          searchText: "",
          totalInfo: { Total: 0 }
        });
      })
      .catch(error => byUs.showError(error, "Erro ao adicionar linhas"));
  }

  handleOnCellClick() {
    // let that = this;
    debugger;
  }


  handleModalSearchClose(selectedItems) {
    let that = this;
    this.setState({ currentModal: null });

    if (selectedItems && selectedItems.length > 0) {
      that.ensureDocHeaderExists(() => {
        that.createDocLines(selectedItems);
      });
    }
  }

  onRowsSelected(rows) {
    this.setState({ selectedIndexes: this.state.selectedIndexes.concat(rows.map(r => r.rowIdx)) });
  }

  onRowsDeselected(rows) {
    let rowIndexes = rows.map(r => r.rowIdx);
    this.setState({ selectedIndexes: this.state.selectedIndexes.filter(i => rowIndexes.indexOf(i) === -1) });
  }


  getRows() {
    let rows = Selectors.getRows(this.state);
    return rows;
  }

  getRowAt(index) {
    let rows = this.getRows();
    return rows[index];
  }

  getSize() {
    return this.getRows().length;
  }



  onColumnGroupAdded(colName) {

    let documentoBloqueado = this.state.docData.DOCNUM > 0;
    let baseadoEmDocumentos = this.state.docData.DOCS && this.state.docData.DOCS.length !== 0;

    let columns = this.getColumns({ allowEdit: !documentoBloqueado, baseadoEmDocumentos })
    let columnGroups = this.state.groupBy.slice(0);
    let activeColumn = columns.find((c) => c.key === colName)
    let isNotInGroups = columnGroups.find((c) => activeColumn.key === c.name) == null;
    if (isNotInGroups) {
      columnGroups.push({ key: activeColumn.key, name: activeColumn.name });
    }

    this.setState({ groupBy: columnGroups });
  }

  onColumnGroupDeleted(name) {
    let columnGroups = this.state.groupBy.filter(function (g) {
      return typeof g === 'string' ? g !== name : g.key !== name;
    });
    this.setState({ groupBy: columnGroups });
  }

  onRowExpandToggle({ columnGroupName, name, shouldExpand }) {
    let expandedRows = Object.assign({}, this.state.expandedRows);
    expandedRows[columnGroupName] = Object.assign({}, expandedRows[columnGroupName]);
    expandedRows[columnGroupName][name] = { isExpanded: shouldExpand };
    this.setState({ expandedRows: expandedRows });
  }

  render() {
    let that = this;
    let documentoBloqueado = this.state.docData.DOCNUM > 0;
    let baseadoEmDocumentos = this.state.docData.DOCS && this.state.docData.DOCS.length !== 0;


    let cols = this.getColumns({ allowEdit: !documentoBloqueado, baseadoEmDocumentos })


    // var that = this;
    let rowSelection = {
      showCheckbox: true,
      enableShiftSelect: true,
      onRowsSelected: this.onRowsSelected,
      onRowsDeselected: this.onRowsDeselected,
      selectBy: {
        indexes: this.state.selectedIndexes
      }
    };
    if (baseadoEmDocumentos) rowSelection = undefined;

    let renderActions = () => {
      let actions = [
        {
          name: "Imprimir",
          color: "primary",
          icon: "icon fa-print",
          visible: documentoBloqueado,
          onClick: e => {

            let docNumArray = [this.state.docData.DOCNUM];

            this.setState({
              currentModal: (
                <ModalConfirmPrint
                  setCurrentModal={({ currentModal }) => { this.setState({ currentModal }); }}
                  defaultLayoutCode={this.state.defaultLayoutCode}
                  docNumArray={docNumArray}
                />
              )
            });

          }
        },
        {
          name: "Apagar",
          color: "danger",
          icon: "icon wb-trash",
          visible: !documentoBloqueado && this.state.selectedIndexes.length === 0,
          onClick: e => {
            this.setState({
              currentModal: (
                <ModalMessageConfirm
                  toggleModal={result => {
                    this.setState({ currentModal: null });
                    if (result === "CONFIRMADO") {
                      this.serverRequest = axios
                        .delete(`/api/inv/etiq/doc/${this.state.docData.ID}`)
                        .then(function (result) {
                          hashHistory.goBack();
                        })
                        .catch(error => byUs.showError(error, "Erro ao apagar dados"));
                    }
                  }}
                  title="Confirmar ação"
                  text="Deseja Continuar?"
                  btnConfirmar="Apagar"
                  iconConfirmar="icon wb-trash"
                  color="danger"
                  moreInfo="Se continuar irá apagar este documento."
                />
              )
            });
          }
        },
        {
          name: "Apagar linhas",
          color: "danger",
          icon: "icon wb-trash",
          visible: !documentoBloqueado && this.state.selectedIndexes.length > 0,
          onClick: e => {
            let rows = that.getRows();
            let LINENUMS = that.state.selectedIndexes.map(i => rows[i].LINENUM)

            this.setState({
              currentModal: (
                <ModalMessageConfirm
                  toggleModal={result => {
                    this.setState({ currentModal: null });
                    if (result === "CONFIRMADO") {
                      this.serverRequest = axios
                        .post(`/api/inv/etiq/doc/${this.state.docData.ID}/deletelines`, {
                          Lines: LINENUMS
                        })
                        .then(function (result) {
                          let rows = that.getRows();

                          LINENUMS.forEach(LINENUM => {
                            let ix = rows.findIndex(r => r.LINENUM === LINENUM);
                            if (ix >= 0) rows.splice(ix, 1)
                          })

                          that.setState({ rows, selectedIndexes: [] })
                        })
                        .catch(error => byUs.showError(error, "Erro ao apagar linhas"));
                    }
                  }}
                  title="Confirmar ação"
                  text="Deseja Continuar?"
                  btnConfirmar="Apagar"
                  iconConfirmar="icon wb-trash"
                  color="danger"
                  moreInfo="Se continuar irá apagar estes linhas."
                />
              )
            });
          }
        },
        {
          name: ((this.state.docData.DOCNUM || this.state.docData.ID) && "Voltar") || "Cancelar",
          color: "primary",
          icon: "icon wb-close",
          visible: true,
          onClick: e => {
            hashHistory.push("/inv/etiq/");
          }
        },
        {
          name: "Confirmar",
          color: "success",
          visible: !documentoBloqueado,

          icon: "icon fa-check",
          onClick: e => {
            this.setState({
              currentModal: (

                <ModalMessageConfirm
                  toggleModal={result => {
                    that.setState({ currentModal: null });
                    if (result === "CONFIRMADO") {
                      that.serverRequest = axios
                        .post(`/api/inv/etiq/doc/${that.state.docData.ID}/confirm`)
                        .then(function (result) {


                          let docNumArray = [result.data.DOCNUM];

                          that.setState({
                            currentModal: (
                              <ModalConfirmPrint
                                setCurrentModal={({ currentModal }) => {
                                  hashHistory.push('/inv/etiq')
                                }}
                                defaultLayoutCode={that.state.defaultLayoutCode}
                                docNumArray={docNumArray}
                              />
                            )
                          });

                        })
                        .catch(error => byUs.showError(error, "Erro ao confirmar documento"));
                    }
                  }}
                  title="Confirmar ação"
                  text="Deseja Continuar?"
                  btnConfirmar="Confirmar"
                  iconConfirmar="icon fa-check"
                  color="success"
                  moreInfo="Se continuar irá concluir este documento."
                />


              )
            });
          }
        }
      ];

      let searchBar = () => {
        if (!baseadoEmDocumentos && !documentoBloqueado && this.state.loading === false) {
          return (
            <div className="byus-search-bar float-left">
              <SearchBar
                totalInfo={this.state.totalInfo}
                inputProps={{
                  placeholder: this.props.searchPlaceholder,
                  value: this.state.searchText,
                  onChange: this.handleOnChange_txtSearch,
                  onKeyDown: this.handleOnKeyDown_txtSearch
                }}
                onClickClear={e => {
                  this.setState({
                    currentModal: <ModalSearchOitm toggleModal={this.handleModalSearchClose} searchText={this.state.searchText} />
                  });
                }}
              />
            </div>
          );
        } else {
          return null
        }
      };

      return (
        <div key={"action-bar"}>
          {searchBar()}
          <div className="byus-action-bar animation-slide-left">
            {actions.map(action => {
              if (!action.visible || this.state.loading === true) return null;
              let btClassName = "btn btn-" + action.color;
              return (
                <button key={"action_" + action.name} type="button" onClick={action.onClick} className={btClassName}>
                  <span>
                    <i className={action.icon} aria-hidden="true" />

                    <span className="hidden-sm-down">  {action.name}</span>

                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );
    };

    let header = <div>
      <div className="row">
        <div className="col-lg-8">
          <ByUsTextBox name="Tipo" label="Tipo:" disabled={true} value={this.state.docData.OBSERVACOES} />
        </div>
        <div className="col-lg-4">

          <div className="row">
            <div className="col-6">
              <ByUsTextBox
                name="Data"
                label="Data:"
                disabled={true}
                value={byUs.format.properDisplayDateTime(this.state.docData.CONFIRMED || this.state.docData.DATA)}
              />
            </div>
            <div className="col-6">
              <ByUsTextBox
                name="Numero"
                label="Numero:"
                disabled={true}
                value={this.state.docData.DOCNUM || ((this.state.docData.ID || "novo") + " (draft)")}
              />
            </div>

          </div>
        </div>
      </div>
    </div>;
    return (
      // <div className="">
      (
        <div className="animated fadeIn">
          <div className="page">

            <div className="page-header container-fluid">
              <div className="row">
                <div className="col-xl-8 col-md-4">
                  <h5 className="page-title">Impressão de etiquetas {this.state.docData.DOCNUM && this.state.docData.DOCNUM} </h5>
                </div>
                <div className="col-xl-4 col-md-8">
                  <div className="byus-action-bar animation-slide-left">
                    <Button outline className="btn-md btn-flat" onClick={e => {
                      this.setState({
                        currentModal: (
                          <ModalMessageConfirm
                            toggleModal={result => {
                              this.setState({ currentModal: null });
                              if (result === "CONFIRMADO") {
                                this.serverRequest = axios
                                  .post(`/api/inv/etiq/doc/${this.state.docData.ID}/clone`)
                                  .then(function (result) {

                                    hashHistory.push("/inv/etiq/doc/" + result.data.newID);
                                  })
                                  .catch(error => byUs.showError(error, "Erro ao duplicar dados"));
                              }
                            }}
                            title="Confirmar ação"
                            text="Deseja duplicar este documento?"
                            moreInfo="Se continuar irá criar um rascunho com o mesmo conteúdo"
                            btnConfirmar="Duplicar"
                            iconConfirmar="icon wb-copy"
                            color="primary"
                          />
                        )
                      });
                    }}>
                      <i className="icon wb-copy" />
                      <span className="hidden-sm-down"> </span>
                    </Button>
                    <Button outline className="btn-md btn-flat" onClick={e => this.onMoveTo('previous')}>
                      <i className="icon wb-arrow-left" />
                      <span className="hidden-sm-down"> </span>
                    </Button>
                    <Button outline className="btn-md btn-flat" onClick={e => this.onMoveTo('next')}>
                      <i className="icon wb-arrow-right" />
                      <span className="hidden-sm-down"> </span>
                    </Button>

                  </div>
                </div>
              </div>

            </div>
            {/*<!-- Forum Content -->*/}
            {/*<div className="page-main">*/}
            {this.state.docData.DOCNUM && <div className="panel">
              {header}
            </div>}

            {/*<!-- Forum Content -->*/}
            <div className="panel">
              <div>
                <DraggableContainer>

                  <ReactDataGrid
                    ref={node => this.grid = node}
                    enableCellSelect={true}
                    columns={cols}
                    rowGetter={this.getRowAt}
                    rowsCount={this.getSize()}
                    minHeight={this.state.searchGridH}
                    onCellClick={this.handleOnCellClick}
                    rowSelection={rowSelection}

                    enableDragAndDrop={true}
                    onRowExpandToggle={this.onRowExpandToggle}
                    toolbar={<CustomToolbar groupBy={this.state.groupBy} onColumnGroupAdded={this.onColumnGroupAdded} onColumnGroupDeleted={this.onColumnGroupDeleted} />}
                  ></ReactDataGrid>
                </DraggableContainer>
              </div>

              {renderActions()}

              {this.state.currentModal}
            </div>
          </div>
        </div >
      )
    );
  }
}



export default DocAtualizacaoPrecos;
