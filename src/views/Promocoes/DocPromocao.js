import React, { Component } from "react";
// import { Button } from "reactstrap";
import axios from "axios";
import EditModal from "../Produtos/EditModal";

import DataGrid from "../../components/DataGrid";
import { hashHistory } from "react-router";
var $ = window.$;
var sappy = window.sappy;

import Slider from "rc-slider";

import { TextBox, Date, ButtonGroup } from "../../Inputs";
import Panel from "../../components/Panel";
import CmpCondicoes from "./CmpCondicoes";
import ModalCoveredItems from "./ModalCoveredItems";
import ModalCoveredPNs from "./ModalCoveredPNs";
import DocFooter from "./DocFooter";


import SearchAndChooseModalOitm from "../../components/SearchAndChoose/ModalOitm";

const getinitialState = props => {
  let locationState = props.location.state || {};
  return {
    loading: locationState.id ? true : false,
    editable: locationState.id ? false : true,
    showValidations: false,
    TIPO: locationState.tipo === "P" ? "P" : "F",
    selectedLineNums: [],
    fieldsAllowedForCli: [],
    detailHeight: 500,
    fieldsAllowedForArt: [],
    headerExpanded: true,
    pnScopeExpanded: locationState.tipo === "P" ? true : false,
    DIASEM0: 1,
    DIASEM1: 1,
    DIASEM2: 1,
    DIASEM3: 1,
    DIASEM4: 1,
    DIASEM5: 1,
    DIASEM6: 1,
    LINES: [],
    IC: [{}],
    EC: [{}],
    IA: [{}],
    EA: [{}]
  };
};

class DocPromocao extends Component {
  constructor(props) {
    super(props);

    let that = this;

    this.getvalidationResults = this.getvalidationResults.bind(this);
    this.onClick_AddRemove2 = this.onClick_AddRemove2.bind(this);
    this.loadDoc = this.loadDoc.bind(this);
    this.loadDocToState = this.loadDocToState.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.saveToDatabase = this.saveToDatabase.bind(this);
    this.handleApagarRascunho = this.handleApagarRascunho.bind(this);
    this.handleCreateDocument = this.handleCreateDocument.bind(this);
    this.handleUpdateDocument = this.handleUpdateDocument.bind(this);
    this.toggleField = this.toggleField.bind(this);

    this.handleDetailRowChange = this.handleDetailRowChange.bind(this);
    this.handleDetailRowSelect = this.handleDetailRowSelect.bind(this);
    this.handleDetailRowReorder = this.handleDetailRowReorder.bind(this);
    this.handleFooterSearchResult = this.handleFooterSearchResult.bind(this);

    this.handleOnApagarLinhas = this.handleOnApagarLinhas.bind(this);
    this.recalcComponentsHeight = this.recalcComponentsHeight.bind(this);
    this.scrollToLastLine = this.scrollToLastLine.bind(this);
    this.handleOnCancelar = this.handleOnCancelar.bind(this);
    this.handleOnVoltar = this.handleOnVoltar.bind(this);

    this.fieldsAllowedForCli = [
      { value: "SlpCode", label: "Vendedor", optionsApi: "/api/cbo/oslp", multi: true },
      { value: "GroupCode", label: "Grupo de PN", optionsApi: "/api/cbo/ocrg", multi: true },
      { value: "GroupNum", label: "Condições de pagamento", optionsApi: "/api/cbo/octg", multi: true },
      { value: "ListNum", label: "Lista de preços", optionsApi: "/api/cbo/opln", multi: true }
    ];

    this.fieldsAllowedForArt = [
      { value: "ItmsGrpCod", label: "Família", optionsApi: "/api/cbo/oitb", multi: true },
      { value: "U_SubFamilia1", label: "Sub-Família", optionsApi: "/api/cbo/subfamilia1", multi: true },
      { value: "CardCode", label: "Fornecedor", optionsApi: "/api/cbo/ocrd/s", multi: true },
      { value: "FirmCode", label: "Fabricante", optionsApi: "/api/cbo/omrc", multi: true }
    ];

    // detailFields.push({ name: 'LINENUM', label: '#', type: "text", width: 40, editable: false })
    this.detailFields = [
      {
        name: "ITEMCODE",
        label: "Artigo",
        type: "text",
        width: 100,
        editable: false,
        dragable: false,
        onLinkClick: props => sappy.showModal(<EditModal toggleModal={sappy.hideModal} itemcode={props.dependentValues.ITEMCODE} />)
      },
      { name: "ITEMNAME", label: "Descrição", type: "tags", width: 400, editable: false },
      { name: "QTSTOCK", label: "Stk", type: "quantity", width: 60, editable: false },
      { name: "PRICEINFO", label: "Preço Cash", type: "price", width: 80, editable: false },
      { name: "PRICEBASE", label: "Preço Folh.", type: "price", width: 80, editable: true },
      { name: "USER_DISC", label: "Descontos", type: "text", width: 100, editable: true },
      // { name: 'DISCOUNT', label: 'Desconto', type: "discount", width: 60, editable: false },
      { name: "PRICE", label: "Preço Liq.", type: "price", width: 80, editable: false },
      { name: "QTMIN", label: "Qt.Min", type: "quantity", width: 50, editable: true },
      { name: "OFACADA", label: "A cada", type: "quantity", width: 80, editable: true },
      {
        name: "OFITEMCODE",
        label: "Artigo Oferta",
        type: "text",
        width: 100,
        editable: true,
        dragable: false,
        onLinkClick: props => {

          if (props.dependentValues.OFITEMCODE) return sappy.showModal(<EditModal toggleModal={sappy.hideModal} itemcode={props.dependentValues.OFITEMCODE} />)
          return sappy.showModal(<SearchAndChooseModalOitm toggleModal={selectedItems => {

            // console.log(selectedItems);
            sappy.hideModal();

            if (selectedItems.length)
              that.handleDetailRowChange(props.dependentValues, { OFITEMCODE: selectedItems[0] })
            else
              that.handleDetailRowChange(props.dependentValues, { OFITEMCODE: '' })

          }} useSearchLimit={false} singleSelect={true} showCatNum={false} searchLimitCondition='' searchText='' />)
        }
      },
      { name: "OFITEMNAME", label: "Descrição Oferta", type: "tags", width: 400, editable: false },
      { name: "OFQTD", label: "Qtd. Oferta", type: "quantity", width: 80, editable: true },
      { name: "OFUDISC", label: "Desc Oferta", type: "text", width: 100, editable: true },
    ];

    this.state = getinitialState(props);
  }

  componentDidMount() {
    let that = this;
    window.addEventListener("resize", this.recalcComponentsHeight);

    this.recalcComponentsHeight();

    this.serverRequest = axios
      .get(`/api/cbo/ocqg/forpromo`)
      .then(result => {
        that.setState({ fieldsAllowedForCli: [...that.fieldsAllowedForCli, ...result.data] });
      })
      .catch(error => sappy.showError(error, "Erro ao obter dados"));

    this.serverRequest = axios
      .get(`/api/cbo/oitg/forpromo`)
      .then(result => {
        that.setState({ fieldsAllowedForArt: [...that.fieldsAllowedForArt, ...result.data] });
      })
      .catch(error => sappy.showError(error, "Erro ao obter dados"));

    this.loadDoc();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.recalcComponentsHeight);
  }

  recalcComponentsHeight() {
    let docHeight = $("#doc").height();

    let $docDetail = $("#docDetail");
    if ($docDetail.length === 1) {
      let detailsTop = $docDetail.position().top;
      let detailHeight = docHeight - detailsTop - 26;

      this.setState({ detailHeight });
    }
  }

  componentWillReceiveProps(nextProps) {
    let locationState = this.props.location.state || {};
    let nextlocationState = nextProps.location.state || {};

    if (locationState.id !== nextlocationState.id) this.setState(getinitialState(nextProps), this.loadDoc);
  }

  loadDoc() {
    let that = this;
    let locationState = this.props.location.state || {};
    if (locationState.id) {
      this.serverRequest = axios
        .get(`/api/promocoes/doc/${locationState.id}`)
        .then(result => {
          that.loadDocToState(result);
        })
        .catch(error => sappy.showError(error, "Erro ao obter dados"));
    }
  }

  loadDocToState(result) {
    let newState = { ...result.data };

    if (newState.ReturnToastr) {
      sappy.showToastr(newState.ReturnToastr);
      delete newState.ReturnToastr;
    }

    if (this.state.ID !== newState.ID) newState.pnScopeExpanded = newState.TIPO === "P" ? true : false;

    newState.IC = newState.SCOPE.filter(line => line.TIPO === "IC");
    newState.EC = newState.SCOPE.filter(line => line.TIPO === "EC");
    newState.IA = newState.SCOPE.filter(line => line.TIPO === "IA");
    newState.EA = newState.SCOPE.filter(line => line.TIPO === "EA");

    if (newState.editable) {
      if (newState.IC.length === 0) newState.IC.push({});
      if (newState.EC.length === 0) newState.EC.push({});
      if (newState.IA.length === 0) newState.IA.push({});
      if (newState.EA.length === 0) newState.EA.push({});
    }
    delete newState.SCOPE;

    newState.loading = false;
    newState.editable = !newState.NUMERO;

    this.setState(newState, this.recalcComponentsHeight);
  }

  handleOnVoltar() {
    hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", ""));
  }

  handleOnCancelar() {
    let that = this;
    if (!this.state.NUMERO) {
      sappy.showQuestion({
        title: "Manter rascunho?",
        moreInfo: "Se escolher manter, as alterações ficarão disponiveis como rascunho e poderá continuar mais tarde...",
        onConfirm: () => {
          hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", ""));
        },
        cancelText: "Descartar",
        cancelStyle: "danger btn-outline",
        confirmText: "Manter rascunho",
        confirmStyle: "success",
        onCancel: () => {
          that.serverRequest = axios
            .delete(`/api/promocoes/doc/${this.state.ID}`)
            .then(result => hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", "")))
            .catch(error => sappy.showError(error, "Erro ao apagar dados"));
        }
      });
    } else {
      hashHistory.push(hashHistory.getCurrentLocation().pathname.replace("/doc", ""));
    }
  }

  saveToDatabase(stateValues, specialOption) {
    let {
      TIPO,
      IC,
      EC,
      IA,
      EA,
      DATAI,
      DATAF,
      UDISC,
      IC_SPECIFIC,
      EC_SPECIFIC,
      IA_SPECIFIC,
      EA_SPECIFIC,
      DESCRICAO,
      OBSERVACOES,
      ID,
      NUMERO,
      ATIVO,
      ARQUIVADO,
      DIASEM0,
      DIASEM1,
      DIASEM2,
      DIASEM3,
      DIASEM4,
      DIASEM5,
      DIASEM6,
      PRIORIDADE,
      CLI_RESTRICT,
      ART_RESTRICT,
      CLI_EXCLUDE,
      ART_EXCLUDE
    } = stateValues;
    let data = {
      TIPO,
      ID,
      NUMERO,
      UDISC,
      DATAI,
      DATAF,
      IC_SPECIFIC,
      EC_SPECIFIC,
      IA_SPECIFIC,
      EA_SPECIFIC,
      DESCRICAO,
      OBSERVACOES,
      ATIVO,
      ARQUIVADO,
      DIASEM0,
      DIASEM1,
      DIASEM2,
      DIASEM3,
      DIASEM4,
      DIASEM5,
      DIASEM6,
      PRIORIDADE,
      CLI_RESTRICT,
      ART_RESTRICT,
      CLI_EXCLUDE,
      ART_EXCLUDE
    };

    IC.forEach((item, ix) => {
      item.TIPO = "IC";
      item.LINE = ix;
    });
    EC.forEach((item, ix) => {
      item.TIPO = "EC";
      item.LINE = ix;
    });
    IA.forEach((item, ix) => {
      item.TIPO = "IA";
      item.LINE = ix;
    });
    EA.forEach((item, ix) => {
      item.TIPO = "EA";
      item.LINE = ix;
    });
    data.SCOPE = [...IC, ...EC, ...IA, ...EA];

    if (!specialOption) {
      axios.post(`/api/promocoes/doc/`, data).then(this.loadDocToState).catch(error => sappy.showError(error, "Não foi possivel gravar documneto"));
    } else {
      data.ATIVO = 1; // para que consiga simular
      data.NUMERO = 999999999;
      if (specialOption === "CLIENTES_ABRANGIDOS") sappy.showModal(<ModalCoveredPNs contentPromocao={data} toggleModal={sappy.hideModal} />);
      if (specialOption === "ARTIGOS_ABRANGIDOS") sappy.showModal(<ModalCoveredItems contentPromocao={data} toggleModal={sappy.hideModal} />);
    }
  }

  onFieldChange(changeInfo) {
    // let that = this;
    let formatedValue = changeInfo.formatedValue;
    let val = changeInfo.rawValue;
    let fieldName = changeInfo.fieldName;

    let newStateValues = { ...this.state };

    if (fieldName === "CLI_RESTRICT" && !val) {
      newStateValues.IC = [{}];
      newStateValues.IC_SPECIFIC = "";
    }
    if (fieldName === "CLI_EXCLUDE" && !val) {
      newStateValues.EC = [{}];
      newStateValues.EC_SPECIFIC = "";
    }
    if (fieldName === "ART_RESTRICT" && !val) {
      newStateValues.IA = [{}];
      newStateValues.IA_SPECIFIC = "";
    }
    if (fieldName === "ART_EXCLUDE" && !val) {
      newStateValues.EA = [{}];
      newStateValues.EA_SPECIFIC = "";
    }

    if (fieldName.indexOf("#") > -1) {
      // Valores em arrays
      let arrName = fieldName.split("#")[0];
      let arrIndex = sappy.getNum(fieldName.split("#")[1]);
      let propName = fieldName.split("#")[2];

      let arr = [...this.state[arrName]];

      let obj = { ...arr[arrIndex] };
      obj[propName] = val;
      arr[arrIndex] = obj;

      Object.assign(newStateValues, { [arrName]: [...arr] });
    } else {
      //Normal
      //Correctly save to ServiceLayer properties
      Object.assign(newStateValues, { [fieldName]: fieldName.indexOf("Valor") > -1 ? formatedValue : val });
    }

    if (!newStateValues.NUMERO) {
      // Rascunho salvar logo
      return this.saveToDatabase(newStateValues);
    } else {
      // Em alteração de documento, tem que ser confirmado
      return this.setState(newStateValues);
    }
  }

  getvalidationResults({ forRender, state } = { forRender: false }) {
    let alerts = {};
    let toastrMsg = [];

    if (!forRender || state.showValidations) {
      if (!state.DATAI) alerts.DATAI = "danger|Preenchimento obrigatório";
      if (!state.DATAF) alerts.DATAF = "danger|Preenchimento obrigatório";
      if (!state.DESCRICAO) alerts.DESCRICAO = "danger|Preenchimento obrigatório";
    } else if (forRender && !state.showValidations) {
    }

    return { alerts, toastrMsg };
  }

  handleApagarRascunho() {
    // let that = this;

    if (this.state.NUMERO) return;

    let postConfirm = () =>
      axios
        .delete(`/api/promocoes/doc/${this.state.ID}`)
        .then(result => {
          hashHistory.goBack();
        })
        .catch(error => sappy.showError(error, "Não foi possivel apagar rascunho"));

    return sappy.showQuestion({
      msg: "Deseja apagar este rascunho?",
      onConfirm: postConfirm,
      confirmText: "Apagar rascunho",
      confirmStyle: "danger",
      onCancel: () => { }
    });
  }

  handleCreateDocument() {
    let that = this;

    // perform checks
    //Validar campos de preenchimento obrigatório
    let newState = { ...that.state };

    let { alerts, toastrMsg } = this.getvalidationResults({ state: newState });
    toastrMsg.forEach(toastrData => sappy.showToastr(toastrData));
    if (!this.state.showValidations && Object.keys(alerts).length > 0) return this.setState({ showValidations: true });

    //Validar se há erros ativos
    let hasDanger = Object.keys(alerts).find(f => alerts[f].startsWith("danger"));
    if (hasDanger) {
      if (toastrMsg.length > 0) return; // já deu mensagens
      return sappy.showToastr({
        color: "danger",
        msg: "Há campos com erros. Verifique se preencheu todos os campos obrigatórios..."
      });
    }

    //Validar se há avisos ativos
    let hasWarning = Object.keys(alerts).find(f => alerts[f].startsWith("warning"));

    let postConfirm = () => axios.post(`/api/promocoes/doc/${this.state.ID}/confirm`).then(this.loadDocToState).catch(error => sappy.showError(error, "Não foi possivel criar documento"));

    if (!hasWarning)
      return sappy.showQuestion({
        msg: "Deseja criar esta promoção?",
        onConfirm: postConfirm,
        confirmText: "Criar promoção",
        onCancel: () => { }
      });
    else
      return sappy.showWarning({
        title: "Atenção!",
        msg: "Ainda há campos com avisos!",
        moreInfo: "Deseja mesmo assim criar esta promoção?",
        onConfirm: postConfirm,
        confirmText: "Ignorar e gravar promoção",
        onCancel: () => { }
      });
  }

  handleUpdateDocument() {
    let that = this;

    // perform checks
    //Validar campos de preenchimento obrigatório
    let newState = { ...that.state };
    // let fieldsRequired = []
    // let hasChangesToState = false;

    let { alerts, toastrMsg } = this.getvalidationResults({ state: newState });
    toastrMsg.forEach(toastrData => sappy.showToastr(toastrData));
    if (!this.state.showValidations && Object.keys(alerts).length > 0) return this.setState({ showValidations: true });

    //Validar se há erros ativos
    let hasDanger = Object.keys(alerts).find(f => alerts[f].startsWith("danger"));
    if (hasDanger) {
      if (toastrMsg.length > 0) return; // já deu mensagens
      return sappy.showToastr({
        color: "danger",
        msg: "Há campos com erros. Verifique se preencheu todos os campos obrigatórios..."
      });
    }

    //Validar se há avisos ativos
    let hasWarning = Object.keys(alerts).find(f => alerts[f].startsWith("warning"));

    if (!hasWarning)
      return sappy.showQuestion({
        msg: "Deseja gravar alterações?",
        onConfirm: () => that.saveToDatabase(newState),
        confirmText: "Gravar promoção",
        onCancel: () => { }
      });
    else
      return sappy.showWarning({
        title: "Atenção!",
        msg: "Ainda há campos com avisos!",
        moreInfo: "Deseja mesmo assim criar este promoção?",
        onConfirm: () => that.saveToDatabase(newState),
        confirmText: "Ignorar e gravar promoção",
        onCancel: () => { }
      });
  }

  onClick_AddRemove2(e) {
    let newStateValues = {};
    let fieldName = e.target.id.split("_")[0];

    // Valores em arrays
    let arrName = fieldName.split("#")[0];
    let arrIndex = sappy.getNum(fieldName.split("#")[1]);
    // let propName = fieldName.split('#')[2]

    let arr = this.state[arrName] || [];
    if (e.target.innerText === "-") {
      arr.splice(arrIndex, 1); //remover o item
    } else {
      arr.push({});
    }

    if (arr.length === 0) arr.push({});

    this.setState(newStateValues);
  }

  toggleField(fieldName) {
    this.onFieldChange({ fieldName, rawValue: !this.state[fieldName], value: !this.state[fieldName] });
  }

  handleOnApagarLinhas() {
    let that = this;

    let LINENUMS = that.state.selectedLineNums;

    let title = "Apagar linha?";
    let confirmText = "Apagar linha";
    let moreInfo = "Se continuar a linha " + LINENUMS.toString() + " será removida do documento.";
    if (LINENUMS.length > 1) {
      title = "Apagar linhas?";
      confirmText = "Apagar linhas";
      moreInfo = "Se continuar as linhas " + LINENUMS.toString() + " serão removidas do documento.";
    }

    sappy.showDanger({
      title,
      moreInfo,
      confirmText,
      onConfirm: () => {
        that.serverRequest = axios
          .post(`/api/promocoes/doc/${this.state.ID}/deletelines`, {
            Lines: LINENUMS
          })
          .then(result => {
            that.setState({ selectedLineNums: [], ...result.data });
          })
          .catch(error => sappy.showError(error, "Não foi possível apagar linhas"));
      },
      onCancel: () => { }
    });
  }

  handleDetailRowChange(currentRow, updated) {
    let that = this;

    let callBackend = () => {
      this.serverRequest = axios
        .patch(`/api/promocoes/doc/${this.state.ID}/line/${currentRow.LINENUM}`, { ...updated })
        .then(function (result) {
          let new_row = result.data.UPDATED_LINE;
          // create a new object and replace the line on it, keeping the other intact
          let rows = that.state.LINES.map(r => {
            if (r.LINENUM === new_row.LINENUM) {
              return new_row;
            } else {
              return r;
            }
          });

          if (result.data.ReturnToastr) {
            sappy.showToastr(result.data.ReturnToastr);
          }

          let newDocData = { LINES: rows };
          that.setState(newDocData);
        })
        .catch(error => sappy.showError(error, "Erro ao gravar linha"));
    }

    let searchOfItem = () => {
      let searchApiUrl = SearchAndChooseModalOitm.searchApiUrl;
      let searchText = updated.OFITEMCODE;
      axios.get(searchApiUrl, {
        params: {
          searchTags: [{ value: searchText }]
        }
      })
        .then(result => {
          var listItems = result.data.firstRows;
          let found = listItems.length > 0 ? listItems[0].TOTAL_ROWS : 0;

          if (found === 1) {
            let selectedItems;
            updated.OFITEMCODE = listItems[0].ItemCode;
          } else if (found > 1) {
            sappy.showModal(<SearchAndChooseModalOitm toggleModal={selectedItems => {
               sappy.hideModal();
              if (selectedItems.length) updated.OFITEMCODE = selectedItems[0]; else updated.OFITEMCODE = '';

              return callBackend()

            }} useSearchLimit={false} singleSelect={true} showCatNum={false} searchLimitCondition='' searchText={searchText} />)
          } else {
            updated.OFITEMCODE = "";
            sappy.showWarning({
              title: "Nada encontrado",
              moreInfo: "Não foi possivel encontrar ao procurar por '" + searchText + "'"
            });
          }

          return callBackend()
        })
        .catch(function (error) {
          if (!error.__CANCEL__) sappy.showError(error, "Api error");
          that.setState({ searchText: "" });
        });
    }
    if (updated.OFITEMCODE) return searchOfItem();
    callBackend();
  }

  handleDetailRowSelect(selectedLineNums) {
    this.setState({ selectedLineNums });
  }

  handleDetailRowReorder(draggedRows, rowTarget, orderedRows) {
    let that = this;

    let LINENUMS = orderedRows.map(line => line.LINENUM);
    that.serverRequest = axios
      .post(`/api/promocoes/doc/${that.state.ID}/reorderlines`, {
        Lines: LINENUMS
      })
      .then(result => {
        that.setState({ selectedLineNums: false, ...result.data });
      })
      .catch(error => sappy.showError(error, "Não foi possível reordernar as linhas"));
  }

  handleFooterSearchResult({ selectedItems, barcodes, callback } = {}) {
    let that = this;
    let itemCodes = selectedItems;
    if (!((itemCodes && itemCodes.length > 0) || (barcodes && barcodes.length > 0))) return;

    let createDocLines = () => {
      this.serverRequest = axios
        .post(`/api/promocoes/doc/${this.state.ID}/lines`, { itemCodes, barcodes })
        .then(function (result) {
          let newDocData = { ...result.data };

          that.setState(newDocData, () => {
            //scroll to end
            that.scrollToLastLine();
          });
          if (callback) callback();
        })
        .catch(error => {
          sappy.showError(error, "Erro ao adicionar linhas");
          if (callback) callback();
        });
    };

    // if ((itemCodes && itemCodes.length > 0) || (barcodes && barcodes.length > 0)) {
    //    this.ensureDocHeaderExists(createDocLines);
    // }

    createDocLines();
  }

  scrollToLastLine() {
    return this.refs.grid.scrollToRow(this.refs.grid.getSize());
  }

  render() {
    let that = this;
    let alerts = this.getvalidationResults({ forRender: true, state: this.state }).alerts;
    // let getRightButton = (valor) => !valor ? <i className="icon wb-arrow-left" /> : <i className="icon wb-close" />

    // Build Input Props
    let bip = (name, props) => {
      props.name = name;
      if (name.indexOf("#") > -1) {
        // Valores em arrays
        let arrName = name.split("#")[0];
        let arrIndex = sappy.getNum(name.split("#")[1]);
        let propName = name.split("#")[2];

        let arr = this.state[arrName] || [];
        let obj = arr[arrIndex] || {};
        props.value = obj[propName];
      } else {
        //Normal
        props.value = this.state[name];
      }
      props.state = alerts[name];
      props.onChange = this.onFieldChange;
      props.disabled = props.disabled || !this.state.editable;

      return props;
    };

    let headerActions = [
      {
        name: "toggleArquivado",
        text: this.state.ARQUIVADO ? "Arquivado" : "Arquivar",
        color: this.state.ARQUIVADO ? "danger" : "warning",
        visible: this.state.NUMERO,
        disabled: this.state.ATIVO && !this.state.ARQUIVADO,
        icon: this.state.ARQUIVADO ? "fa-folder" : "fa-folder-open",
        onClick: e => {
          that.saveToDatabase({ ...that.state, ARQUIVADO: !that.state.ARQUIVADO });
        }
      },
      {
        name: "toggleAtivo",
        text: this.state.ATIVO ? "Ativo" : "Inativo",
        color: this.state.ATIVO ? "success" : "warning",
        visible: this.state.NUMERO,
        disabled: this.state.ARQUIVADO,
        icon: this.state.ATIVO ? "fa-check-square-o" : "fa-square-o",
        onClick: e => {
          that.saveToDatabase({ ...that.state, ATIVO: !that.state.ATIVO });
        }
      },
      {
        name: "toogleEdit",
        text: "Alterar",
        color: !this.state.editable ? "" : "danger",
        visible: this.state.NUMERO,
        disabled: this.state.ARQUIVADO,
        icon: this.state.editable ? "fa-close" : "fa-edit",
        onClick: e => {
          if (!that.state.editable) {
            let newState = { ...this.state };
            newState.editable = true;
            if (newState.IC.length === 0) newState.IC.push({});
            if (newState.EC.length === 0) newState.EC.push({});
            if (newState.IA.length === 0) newState.IA.push({});
            if (newState.EA.length === 0) newState.EA.push({});

            return that.setState(newState);
          }
          that.loadDoc();
        }
      }
    ];

    let scopeCliActions = [
      {
        name: "listaClienteAbrangidos",
        text: "Ver Lista",
        visible: true,
        icon: "fa-eye",
        onClick: e => {
          that.saveToDatabase(that.state, "CLIENTES_ABRANGIDOS");
        }
      }
    ];

    let scopeArtActions = [
      {
        name: "listArtigosAbrangidos",
        text: "Ver Lista",
        visible: true,
        icon: "fa-eye",
        onClick: e => {
          that.saveToDatabase(that.state, "ARTIGOS_ABRANGIDOS");
        }
      }
    ];

    let strNumero = (this.state.NUMERO && this.state.NUMERO) || (this.state.ID && "Rascunho") || "Novo";

    let cliColapsedInfo = "";
    if (!this.state.CLI_RESTRICT) cliColapsedInfo = "(Todos os clientes" + (this.state.CLI_EXCLUDE ? ", com algumas exclusões]" : "") + ")";
    if (this.state.CLI_RESTRICT) cliColapsedInfo = "(Alguns clientes" + (this.state.CLI_EXCLUDE ? " , com algumas exclusões]" : "") + ")";

    let artColapsedInfo = "";
    if (!this.state.ART_RESTRICT) artColapsedInfo = "(Todos os artigos" + (this.state.ART_EXCLUDE ? ", com algumas exclusões]" : "") + ")";
    if (this.state.ART_RESTRICT) artColapsedInfo = "(Alguns artigos" + (this.state.ART_EXCLUDE ? ", com algumas exclusões]" : "") + ")";

    let footerProps = {
      // ...this.state.footer,
      // docData,
      editable: (this.state.ID && !this.state.NUMERO) || (this.state.NUMERO && this.state.editable),
      loading: false,
      footerSearchType: "oitm",
      onFooterSearchResult: this.handleFooterSearchResult,
      actions: [
        {
          name: this.state.selectedLineNums.length === 1 ? "Apagar linha" : "Apagar linhas",
          color: "danger",
          icon: "icon wb-trash",
          visible: this.state.ID > 0 && this.state.selectedLineNums.length > 0,
          onClick: this.handleOnApagarLinhas
        },
        {
          name: "Apagar rascunho",
          color: "danger",
          icon: "icon wb-trash",
          visible: this.state.selectedLineNums.length === 0 && !this.state.NUMERO && this.state.ID,
          onClick: this.handleApagarRascunho
        },
        {
          name: "Cancelar",
          color: "primary",
          icon: "icon wb-close",
          visible: this.state.ID && !this.state.NUMERO,
          onClick: this.handleOnCancelar
        },
        {
          name: "Voltar",
          color: "primary",
          icon: "icon wb-close",
          visible: !this.state.ID || (this.state.NUMERO && !this.state.editable),
          onClick: this.handleOnVoltar
        },
        {
          name: "Criar promoção",
          color: "success",
          icon: "icon fa-check",
          visible: !this.state.NUMERO && this.state.ID,
          onClick: this.handleCreateDocument
        },
        {
          name: "Gravar promoção",
          color: "success",
          icon: "icon fa-check",
          visible: this.state.NUMERO && this.state.editable,
          onClick: this.handleUpdateDocument
        }
      ]
    };

    return (
      <div id="doc">
        <div id="docHeader">
          <Panel
            title={(this.state.TIPO === "P" ? "Promoção" : "Folheto") + " (" + strNumero + ")"}
            expanded={this.state.headerExpanded}
            onToogleExpand={() => that.setState({ headerExpanded: !this.state.headerExpanded }, this.recalcComponentsHeight)}
            actions={headerActions}
          >
            <div className="row">
              <div className="col-md-9 col-lg-10 pr-md-1">
                <div className="row">
                  <div className="col-md-8 col-lg-6 pr-md-1">
                    <TextBox {...bip("DESCRICAO", { label: "Descrição" })} />
                  </div>
                  {this.state.TIPO === "P" &&
                    // O desconto só existe em folhetos promocionais
                    <div className="col-md-4 col-lg-2 pl-md-1 pr-md-1">
                      <TextBox {...bip("UDISC", { label: "Desconto", valueType: "discount" })} />
                    </div>}
                  <div className="col-6 col-md-4 col-lg-2 pl-lg-1 pr-1">
                    <Date {...bip("DATAI", { label: "Válido De" })} />
                  </div>
                  <div className="col-6 col-md-4 col-lg-2 pl-1 pr-md-1">
                    <Date {...bip("DATAF", { label: "até" })} />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-8 pr-md-1">
                    <TextBox {...bip("OBSERVACOES", { label: "Observações" })} />
                  </div>

                  <div className="col-md-4 pl-md-1">
                    <ButtonGroup
                      {...bip("DIASEM", {
                        label: "Dias da semana",
                        buttons: [
                          {
                            value: "0",
                            label: "S",
                            disabled: !this.state.editable,
                            className: "btn btn-circle btn-outline " + (!!that.state.DIASEM0 ? "active btn-primary" : "btn-secondary"),
                            onClick: e => {
                              that.onFieldChange({
                                fieldName: "DIASEM0",
                                value: !that.state.DIASEM0,
                                rawValue: !that.state.DIASEM0
                              });
                            }
                          },
                          {
                            value: "1",
                            label: "T",
                            disabled: !this.state.editable,
                            className: "btn btn-circle btn-outline " + (!!that.state.DIASEM1 ? "active btn-primary" : "btn-secondary"),
                            onClick: e => {
                              that.onFieldChange({
                                fieldName: "DIASEM1",
                                value: !that.state.DIASEM1,
                                rawValue: !that.state.DIASEM1
                              });
                            }
                          },
                          {
                            value: "2",
                            label: "Q",
                            disabled: !this.state.editable,
                            className: "btn btn-circle btn-outline " + (!!that.state.DIASEM2 ? "active btn-primary" : "btn-secondary"),
                            onClick: e => {
                              that.onFieldChange({
                                fieldName: "DIASEM2",
                                value: !that.state.DIASEM2,
                                rawValue: !that.state.DIASEM2
                              });
                            }
                          },
                          {
                            value: "3",
                            label: "Q",
                            disabled: !this.state.editable,
                            className: "btn btn-circle btn-outline " + (!!that.state.DIASEM3 ? "active btn-primary" : "btn-secondary"),
                            onClick: e => {
                              that.onFieldChange({
                                fieldName: "DIASEM3",
                                value: !that.state.DIASEM3,
                                rawValue: !that.state.DIASEM3
                              });
                            }
                          },
                          {
                            value: "4",
                            label: "S",
                            disabled: !this.state.editable,
                            className: "btn btn-circle btn-outline " + (!!that.state.DIASEM4 ? "active btn-primary" : "btn-secondary"),
                            onClick: e => {
                              that.onFieldChange({
                                fieldName: "DIASEM4",
                                value: !that.state.DIASEM4,
                                rawValue: !that.state.DIASEM4
                              });
                            }
                          },
                          {
                            value: "5",
                            label: "S",
                            disabled: !this.state.editable,
                            className: "btn btn-circle btn-outline " + (!!that.state.DIASEM5 ? "active btn-primary" : "btn-secondary"),
                            onClick: e => {
                              that.onFieldChange({
                                fieldName: "DIASEM5",
                                value: !that.state.DIASEM5,
                                rawValue: !that.state.DIASEM5
                              });
                            }
                          },
                          {
                            value: "6",
                            label: "D",
                            disabled: !this.state.editable,
                            className: "btn btn-circle btn-outline " + (!!that.state.DIASEM6 ? "active btn-primary" : "btn-secondary"),
                            onClick: e => {
                              that.onFieldChange({
                                fieldName: "DIASEM6",
                                value: !that.state.DIASEM6,
                                rawValue: !that.state.DIASEM6
                              });
                            }
                          }
                        ]
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="col-lg-2 col-md-3 pr-md-1 hidden-sm-down">
                <div style={{ marginTop: "27px", padding: "15px", height: 100 }} data-tip="Prioridade">
                  <Slider
                    ref="PRIORIDADE"
                    disabled={!this.state.editable}
                    vertical
                    min={-2}
                    max={2}
                    value={this.state.PRIORIDADE}
                    onChange={e => {
                      that.onFieldChange({ fieldName: "PRIORIDADE", value: e, rawValue: e });
                    }}
                    marks={{
                      "-2": {
                        label: "Muito baixa",
                        style: { fontWeight: this.state.PRIORIDADE === -2 ? 700 : "normal" }
                      },
                      "-1": { label: "Baixa", style: { fontWeight: this.state.PRIORIDADE === -1 ? 700 : "normal" } },
                      "0": { label: "Normal", style: { fontWeight: this.state.PRIORIDADE === 0 ? 700 : "normal" } },
                      "1": { label: "Alta", style: { fontWeight: this.state.PRIORIDADE === 1 ? 700 : "normal" } },
                      "2": { label: "Muito alta", style: { fontWeight: this.state.PRIORIDADE === 2 ? 700 : "normal" } }
                    }}
                  />
                </div>
              </div>

              <div className="col-lg-2 col-md-3 pr-md-1 hidden-md-up">
                <div
                  style={{
                    marginTop: "27px",
                    paddingTop: "5px",
                    paddingLeft: "30px",
                    paddingRight: "30px",
                    paddingBottom: "20px"
                  }}
                  data-tip="Prioridade"
                >
                  <Slider
                    ref="PRIORIDADE"
                    disabled={!this.state.editable}
                    min={-2}
                    max={2}
                    value={this.state.PRIORIDADE}
                    onChange={e => {
                      that.onFieldChange({ fieldName: "PRIORIDADE", value: e, rawValue: e });
                    }}
                    marks={{
                      "-2": {
                        label: "Muito baixa",
                        style: { fontWeight: this.state.PRIORIDADE === -2 ? 700 : "normal" }
                      },
                      "-1": { label: "Baixa", style: { fontWeight: this.state.PRIORIDADE === -1 ? 700 : "normal" } },
                      "0": { label: "Normal", style: { fontWeight: this.state.PRIORIDADE === 0 ? 700 : "normal" } },
                      "1": { label: "Alta", style: { fontWeight: this.state.PRIORIDADE === 1 ? 700 : "normal" } },
                      "2": { label: "Muito alta", style: { fontWeight: this.state.PRIORIDADE === 2 ? 700 : "normal" } }
                    }}
                  />
                </div>
              </div>
            </div>
          </Panel>

          <Panel
            subtitle="Âmbito de parceiros"
            allowCollapse={true}
            actions={scopeCliActions}
            expanded={this.state.pnScopeExpanded}
            onToogleExpand={() => that.setState({ pnScopeExpanded: !this.state.pnScopeExpanded }, this.recalcComponentsHeight)}
            colapsedInfo={cliColapsedInfo}
          >
            <div className="radio-custom radio-success" style={{ display: "block" }}>
              <input type="radio" id="CLI_RESTRICT" name="CLI_RESTRICT" checked={!this.state.CLI_RESTRICT} disabled={!this.state.editable} onChange={e => that.toggleField("CLI_RESTRICT")} />
              <label htmlFor="CLI_RESTRICT">Todos os clientes</label>
            </div>

            <div className="radio-custom radio-success" style={{ display: "block" }}>
              <input type="radio" disabled={!this.state.editable} id="CLI_RESTRICT2" name="CLI_RESTRICT" checked={!!this.state.CLI_RESTRICT} onChange={e => that.toggleField("CLI_RESTRICT")} />
              <label htmlFor="CLI_RESTRICT2">Clientes com base nas seguintes condições:</label>
            </div>
            {!!this.state.CLI_RESTRICT &&
              <CmpCondicoes
                name="IC"
                items={this.state.IC}
                IC_SPECIFIC={this.state.IC_SPECIFIC}
                onClick_AddRemove={this.onClick_AddRemove2}
                onFieldChange={this.onFieldChange}
                fieldsAllowed={this.state.fieldsAllowedForCli}
                alerts={this.alerts}
                editable={this.state.editable}
              />}

            <div className="checkbox-custom checkbox-danger" style={{ display: "block" }}>
              <input
                type="checkbox"
                id="CLI_EXCLUDE"
                disabled={!this.state.editable}
                name="CLI_EXCLUDE"
                checked={this.state.CLI_EXCLUDE}
                onChange={e => {
                  that.onFieldChange({ fieldName: "CLI_EXCLUDE", value: e.target.checked, rawValue: e.target.checked });
                }}
              />
              <label htmlFor="CLI_EXCLUDE">Excluir clientes com base nas seguintes condições:</label>
            </div>
            {!!this.state.CLI_EXCLUDE &&
              <CmpCondicoes
                name="EC"
                items={this.state.EC}
                EC_SPECIFIC={this.state.EC_SPECIFIC}
                onClick_AddRemove={this.onClick_AddRemove2}
                onFieldChange={this.onFieldChange}
                fieldsAllowed={this.state.fieldsAllowedForCli}
                alerts={this.alerts}
                editable={this.state.editable}
              />}
          </Panel>

          {this.state.TIPO === "P" &&
            // Âmbito de artigos só existe em promoções
            <Panel subtitle="Âmbito de artigos" allowCollapse={true} actions={scopeArtActions} colapsedInfo={artColapsedInfo}>
              <div className="row">
                <div className="col-12">
                  <div className="radio-custom radio-success" style={{ display: "block" }}>
                    <input type="radio" id="ART_RESTRICT" name="ART_RESTRICT" checked={!this.state.ART_RESTRICT} disabled={!this.state.editable} onChange={e => that.toggleField("ART_RESTRICT")} />
                    <label htmlFor="ART_RESTRICT">Todos os artigos</label>
                  </div>

                  <div className="radio-custom radio-success" style={{ display: "block" }}>
                    <input type="radio" id="ART_RESTRICT2" name="ART_RESTRICT" checked={!!this.state.ART_RESTRICT} disabled={!this.state.editable} onChange={e => that.toggleField("ART_RESTRICT")} />
                    <label htmlFor="ART_RESTRICT2">Artigos com base nas seguintes condições:</label>
                  </div>
                  {!!this.state.ART_RESTRICT &&
                    <CmpCondicoes
                      name="IA"
                      items={this.state.IA}
                      IA_SPECIFIC={this.state.IA_SPECIFIC}
                      onClick_AddRemove={this.onClick_AddRemove2}
                      onFieldChange={this.onFieldChange}
                      fieldsAllowed={this.state.fieldsAllowedForArt}
                      alerts={this.alerts}
                      editable={this.state.editable}
                    />}
                </div>
                <div className="col-12">
                  <div className="checkbox-custom checkbox-danger" style={{ display: "block" }}>
                    <input
                      type="checkbox"
                      disabled={!this.state.editable}
                      id="ART_EXCLUDE"
                      name="ART_EXCLUDE"
                      checked={this.state.ART_EXCLUDE}
                      onChange={e => {
                        that.onFieldChange({
                          fieldName: "ART_EXCLUDE",
                          value: e.target.checked,
                          rawValue: e.target.checked
                        });
                      }}
                    />
                    <label htmlFor="ART_EXCLUDE">Excluir artigos com base nas seguintes condições:</label>
                  </div>
                  {!!this.state.ART_EXCLUDE &&
                    <CmpCondicoes
                      name="EA"
                      items={this.state.EA}
                      EA_SPECIFIC={this.state.EA_SPECIFIC}
                      onClick_AddRemove={this.onClick_AddRemove2}
                      onFieldChange={this.onFieldChange}
                      fieldsAllowed={this.state.fieldsAllowedForArt}
                      alerts={this.alerts}
                      editable={this.state.editable}
                    />}
                </div>
              </div>
            </Panel>}
        </div>
        {this.state.TIPO === "F" &&
          // Grelha de artigos só existe em folhetos

          <div id="docDetail">
            <Panel name="panelDetails" allowCollapse={false}>
              <DataGrid
                ref="grid"
                height={this.state.detailHeight}
                fields={this.detailFields}
                disabled={!this.state.editable}
                rows={this.state.LINES}
                onRowUpdate={this.handleDetailRowChange}
                onRowSelectionChange={this.handleDetailRowSelect}
                selectedKeys={this.state.selectedLineNums}
                onRowReorder={this.handleDetailRowReorder}
              />
            </Panel>
          </div>}

        {this.state.TIPO === "P" &&
          // Âmbito de artigos - colocar este espaço adicional para as combos abrirem bem
          <div style={{ height: "100px" }} />}
        <DocFooter {...footerProps} />
      </div>
    );
  }
}

export default DocPromocao;
