import React, { Component } from "react";
import { Button } from "reactstrap";
import axios from "axios";

import { hashHistory } from "react-router";
// var $ = window.$;
var sappy = window.sappy;

import Slider from 'rc-slider';

import { TextBox, Date, ComboBox, ButtonGroup, TagInput } from "../../Inputs";
import Panel from "../../components/Panel"
import CmpCondicoes from "./CmpCondicoes"
import ModalCoveredItems from './ModalCoveredItems'
import ModalCoveredPNs from './ModalCoveredPNs'

const getinitialState = (props) => {
  let locationState = props.location.state || {};
  return {
    loading: locationState.id ? true : false,
    editable: locationState.id ? false : true,
    showValidations: false,
    fieldsAllowedForCli: [],
    fieldsAllowedForArt: [],
    DIASEM0: 1,
    DIASEM1: 1,
    DIASEM2: 1,
    DIASEM3: 1,
    DIASEM4: 1,
    DIASEM5: 1,
    DIASEM6: 1,
    IC: [{}],
    EC: [{}],
    IA: [{}],
    EA: [{}]
  }
}

class DocPromocoes extends Component {
  constructor(props) {
    super(props);

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


    this.fieldsAllowedForCli = [
      { value: "SlpCode", label: "Vendedor", optionsApi: "/api/cbo/oslp", multi: true },
      { value: "GroupCode", label: "Grupo de PN", optionsApi: "/api/cbo/ocrg", multi: true },
      { value: "GroupNum", label: "Condições de pagamento", optionsApi: "/api/cbo/octg", multi: true },
      { value: "ListNum", label: "Lista de preços", optionsApi: "/api/cbo/opln", multi: true },
    ]

    this.fieldsAllowedForArt = [
      { value: "ItmsGrpCod", label: "Família", optionsApi: "/api/cbo/oitb", multi: true },
      { value: "U_SubFamilia1", label: "Sub-Família", optionsApi: "/api/cbo/subfamilia1", multi: true },
      { value: "CardCode", label: "Fornecedor", optionsApi: "/api/cbo/ocrd/s", multi: true },
      { value: "FirmCode", label: "Fabricante", optionsApi: "/api/cbo/omrc", multi: true },
    ]

    this.state = getinitialState(props)
  }

  componentDidMount() {
    let that = this
    this.serverRequest = axios
      .get(`/api/cbo/ocqg`)
      .then(result => {
        that.setState({ fieldsAllowedForCli: [...that.fieldsAllowedForCli, ...result.data] })
      })
      .catch(error => sappy.showError(error, "Erro ao obter dados"));

    this.serverRequest = axios
      .get(`/api/cbo/oitg/forpromo`)
      .then(result => {
        that.setState({ fieldsAllowedForArt: [...that.fieldsAllowedForArt, ...result.data] })
      })
      .catch(error => sappy.showError(error, "Erro ao obter dados"));

    this.loadDoc();
  }
  componentWillReceiveProps(nextProps) {
    let locationState = this.props.location.state || {};
    let nextlocationState = nextProps.location.state || {};

    if (locationState.id !== nextlocationState.id)
      this.setState(getinitialState(nextProps), this.loadDoc);;
  }

  loadDoc() {
    let that = this;
    let locationState = this.props.location.state || {}
    if (locationState.id) {
      this.serverRequest = axios
        .get(`/api/promocoes/doc/${locationState.id}`)
        .then(result => {
          that.loadDocToState(result)
        })
        .catch(error => sappy.showError(error, "Erro ao obter dados"));
    }
  }


  loadDocToState(result) {
    let newState = { ...result.data };
    newState.IC = newState.LINES.filter(line => line.TIPO === "IC")
    newState.EC = newState.LINES.filter(line => line.TIPO === "EC")
    newState.IA = newState.LINES.filter(line => line.TIPO === "IA")
    newState.EA = newState.LINES.filter(line => line.TIPO === "EA")

    if (newState.editable) {
      if (newState.IC.length === 0) newState.IC.push({});
      if (newState.EC.length === 0) newState.EC.push({});
      if (newState.IA.length === 0) newState.IA.push({});
      if (newState.EA.length === 0) newState.EA.push({});
    }
    delete newState.LINES

    newState.loading = false
    newState.editable = (!newState.NUMERO)

    this.setState(newState);
  }


  saveToDatabase(stateValues, specialOption) {

    let { IC, EC, IA, EA, DATAI, DATAF, UDISC, IC_SPECIFIC, EC_SPECIFIC, IA_SPECIFIC, EA_SPECIFIC, DESCRICAO, OBSERVACOES, ID, NUMERO, ATIVO, ARQUIVADO, DIASEM0, DIASEM1, DIASEM2, DIASEM3, DIASEM4, DIASEM5, DIASEM6, PRIORIDADE, CLI_RESTRICT, ART_RESTRICT, CLI_EXCLUDE, ART_EXCLUDE } = stateValues;
    let data = { ID, NUMERO, UDISC, DATAI, DATAF, IC_SPECIFIC, EC_SPECIFIC, IA_SPECIFIC, EA_SPECIFIC, DESCRICAO, OBSERVACOES, ATIVO, ARQUIVADO, DIASEM0, DIASEM1, DIASEM2, DIASEM3, DIASEM4, DIASEM5, DIASEM6, PRIORIDADE, CLI_RESTRICT, ART_RESTRICT, CLI_EXCLUDE, ART_EXCLUDE }

    IC.forEach((item, ix) => { item.TIPO = 'IC'; item.LINE = ix; })
    EC.forEach((item, ix) => { item.TIPO = 'EC'; item.LINE = ix; })
    IA.forEach((item, ix) => { item.TIPO = 'IA'; item.LINE = ix; })
    EA.forEach((item, ix) => { item.TIPO = 'EA'; item.LINE = ix; })
    data.LINES = [...IC, ...EC, ...IA, ...EA]

    if (!specialOption) {
      axios
        .post(`/api/promocoes/doc/`, data)
        .then(this.loadDocToState)
        .catch(error => sappy.showError(error, "Não foi possivel gravar a promoção"));
    }
    else {
      data.ATIVO = 1; // para que consiga simular
      data.NUMERO = 999999999;
      if (specialOption === "CLIENTES_ABRANGIDOS") sappy.showModal(<ModalCoveredPNs contentPromocao={data} toggleModal={sappy.hideModal} />)
      if (specialOption === "ARTIGOS_ABRANGIDOS") sappy.showModal(<ModalCoveredItems contentPromocao={data} toggleModal={sappy.hideModal} />)
    }

  }

  // Recebe os valores dos campos MY*
  onFieldChange(changeInfo) {
    // let that = this;
    let formatedValue = changeInfo.formatedValue;
    let val = changeInfo.rawValue;
    let fieldName = changeInfo.fieldName;

    let newStateValues = { ...this.state };

    if (fieldName === "CLI_RESTRICT" && !val) {
      newStateValues.IC = [{}]
      newStateValues.IC_SPECIFIC = ""
    }
    if (fieldName === "CLI_EXCLUDE" && !val) {
      newStateValues.EC = [{}]
      newStateValues.EC_SPECIFIC = ""
    }
    if (fieldName === "ART_RESTRICT" && !val) {
      newStateValues.IA = [{}]
      newStateValues.IA_SPECIFIC = ""
    }
    if (fieldName === "ART_EXCLUDE" && !val) {
      newStateValues.EA = [{}]
      newStateValues.EA_SPECIFIC = ""
    }



    if (fieldName.indexOf("#") > -1) {
      // Valores em arrays
      let arrName = fieldName.split('#')[0]
      let arrIndex = sappy.getNum(fieldName.split('#')[1])
      let propName = fieldName.split('#')[2]

      let arr = [... this.state[arrName]];

      let obj = { ...arr[arrIndex] }
      obj[propName] = val;
      arr[arrIndex] = obj

      Object.assign(newStateValues, { [arrName]: [...arr] })

    } else {
      //Normal
      //Correctly save to ServiceLayer properties
      Object.assign(newStateValues, { [fieldName]: (fieldName.indexOf("Valor") > -1 ? formatedValue : val) })
    }


    if (!newStateValues.NUMERO) {
      // Rascunho salvar logo
      return this.saveToDatabase(newStateValues)
    }
    else {
      // Em alteração de documento, tem que ser confirmado
      return this.setState(newStateValues)
    }
  }

  getvalidationResults({ forRender, state } = { forRender: false }) {
    let alerts = {};
    let toastrMsg = []

    if (!forRender || state.showValidations) {
      if (!state.DATAI) alerts.DATAI = "danger|Preenchimento obrigatório"
      if (!state.DATAF) alerts.DATAF = "danger|Preenchimento obrigatório"
      if (!state.DESCRICAO) alerts.DESCRICAO = "danger|Preenchimento obrigatório"
    } else if (forRender && !state.showValidations) {
    }

    return { alerts, toastrMsg }
  }

  handleApagarRascunho() {
    let that = this;

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
    })

  }


  handleCreateDocument() {
    let that = this;

    // perform checks
    //Validar campos de preenchimento obrigatório
    let newState = { ...that.state };

    let { alerts, toastrMsg } = this.getvalidationResults({ state: newState });
    toastrMsg.forEach(toastrData => sappy.showToastr(toastrData));
    if (!this.state.showValidations && Object.keys(alerts).length > 0) return this.setState({ showValidations: true })

    //Validar se há erros ativos
    let hasDanger = Object.keys(alerts).find(f => alerts[f].startsWith("danger"))
    if (hasDanger) {
      if (toastrMsg.length > 0) return // já deu mensagens
      return sappy.showToastr({ color: "danger", msg: "Há campos com erros. Verifique se preencheu todos os campos obrigatórios..." })
    }

    //Validar se há avisos ativos
    let hasWarning = Object.keys(alerts).find(f => alerts[f].startsWith("warning"))

    let postConfirm = () =>
      axios
        .post(`/api/promocoes/doc/${this.state.ID}/confirm`)
        .then(this.loadDocToState)
        .catch(error => sappy.showError(error, "Não foi possivel criar a promoção"));


    if (!hasWarning)
      return sappy.showQuestion({
        msg: "Deseja criar esta promoção?",
        onConfirm: postConfirm,
        confirmText: "Criar promoção",
        onCancel: () => { }
      })
    else
      return sappy.showWarning({
        title: "Atenção!",
        msg: "Ainda há campos com avisos!",
        moreInfo: "Deseja mesmo assim criar esta promoção?",
        onConfirm: postConfirm,
        confirmText: "Ignorar e gravar promoção",
        onCancel: () => { }
      })

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
    if (!this.state.showValidations && Object.keys(alerts).length > 0) return this.setState({ showValidations: true })

    //Validar se há erros ativos
    let hasDanger = Object.keys(alerts).find(f => alerts[f].startsWith("danger"))
    if (hasDanger) {
      if (toastrMsg.length > 0) return // já deu mensagens
      return sappy.showToastr({ color: "danger", msg: "Há campos com erros. Verifique se preencheu todos os campos obrigatórios..." })
    }

    //Validar se há avisos ativos
    let hasWarning = Object.keys(alerts).find(f => alerts[f].startsWith("warning"))


    if (!hasWarning)
      return sappy.showQuestion({
        msg: "Deseja gravar alterações?",
        onConfirm: () => that.saveToDatabase(newState),
        confirmText: "Gravar promoção",
        onCancel: () => { }
      })
    else
      return sappy.showWarning({
        title: "Atenção!",
        msg: "Ainda há campos com avisos!",
        moreInfo: "Deseja mesmo assim criar este promoção?",
        onConfirm: () => that.saveToDatabase(newState),
        confirmText: "Ignorar e gravar promoção",
        onCancel: () => { }
      })

  }

  onClick_AddRemove2(e) {
    let newStateValues = {}
    let fieldName = e.target.id.split("_")[0];

    // Valores em arrays
    let arrName = fieldName.split('#')[0]
    let arrIndex = sappy.getNum(fieldName.split('#')[1])
    let propName = fieldName.split('#')[2]

    let arr = this.state[arrName] || [];
    if (e.target.innerText === "-") {
      arr.splice(arrIndex, 1); //remover o item
    } else {
      arr.push({})
    }

    if (arr.length === 0) arr.push({})

    this.setState(newStateValues);
  }

  toggleField(fieldName) {
    this.onFieldChange({ fieldName, rawValue: !this.state[fieldName], value: !this.state[fieldName] })
  }

  render() {
    let that = this
    let alerts = this.getvalidationResults({ forRender: true, state: this.state }).alerts;
    let getRightButton = (valor) => !valor ? <i className="icon wb-arrow-left" /> : <i className="icon wb-close" />

    // Build Input Props 
    let bip = (name, props) => {
      props.name = name;
      if (name.indexOf("#") > -1) {
        // Valores em arrays
        let arrName = name.split('#')[0]
        let arrIndex = sappy.getNum(name.split('#')[1])
        let propName = name.split('#')[2]

        let arr = this.state[arrName] || [];
        let obj = arr[arrIndex] || {}
        props.value = obj[propName]

      } else {
        //Normal
        props.value = this.state[name];
      }
      props.state = alerts[name];
      props.onChange = this.onFieldChange;
      props.disabled = props.disabled || !this.state.editable;

      return props;
    }

    let headerActions = [
      {
        name: "toggleArquivado",
        text: this.state.ARQUIVADO ? "Arquivado" : "Arquivar",
        color: this.state.ARQUIVADO ? "danger" : "warning",
        visible: this.state.NUMERO,
        disabled: this.state.ATIVO && !this.state.ARQUIVADO,
        icon: this.state.ARQUIVADO ? "fa-folder" : "fa-folder-open",
        onClick: e => {
          that.saveToDatabase({ ...that.state, ARQUIVADO: !that.state.ARQUIVADO })
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
          that.saveToDatabase({ ...that.state, ATIVO: !that.state.ATIVO })
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
            newState.editable = true
            if (newState.IC.length === 0) newState.IC.push({});
            if (newState.EC.length === 0) newState.EC.push({});
            if (newState.IA.length === 0) newState.IA.push({});
            if (newState.EA.length === 0) newState.EA.push({});

            return that.setState(newState)
          }
          that.loadDoc()
        }

      }
    ];

    let scopeCliActions = [
      {
        name: "listaClienteAbrangidos",
        text: "Ver Lista",
        visible: true,
        icon: "fa-eye",
        onClick: e => { that.saveToDatabase(that.state, "CLIENTES_ABRANGIDOS") }
      }
    ];

    let scopeArtActions = [
      {
        name: "listArtigosAbrangidos",
        text: "Ver Lista",
        visible: true,
        icon: "fa-eye",
        onClick: e => { that.saveToDatabase(that.state, "ARTIGOS_ABRANGIDOS") }
      }
    ];


    let strNumero =
      (this.state.NUMERO && this.state.NUMERO)
      || (this.state.ID && "Rascunho")
      || "Novo";

    return (
      <div className="scrollable-doc" >

        <Panel title={"Promoção (" + strNumero + ")"} actions={headerActions} >

          <div className="row">
            <div className="col-md-9 col-lg-10 pr-md-1">
              <div className="row">
                <div className="col-md-8 col-lg-6 pr-md-1">
                  <TextBox {...bip("DESCRICAO", { label: "Descrição" }) } />
                </div>
                <div className="col-md-4 col-lg-2 pl-md-1 pr-md-1">
                  <TextBox  {...bip("UDISC", { label: "Desconto", valueType: "discount" }) } />
                </div>
                <div className="col-6 col-md-4 col-lg-2 pl-lg-1 pr-1">
                  <Date  {...bip("DATAI", { label: "Válido De" }) } />
                </div>
                <div className="col-6 col-md-4 col-lg-2 pl-1 pr-md-1">
                  <Date  {...bip("DATAF", { label: "até" }) } />
                </div>
              </div>
              {/* <div className="row">
                <div className="col-md-8 pr-md-1">
                  <TagInput name="tags" label="Observações" getOptionsApiRoute="/api/cbo/ocrd/c" />

                </div>
              </div> */}


              <div className="row">
                <div className="col-md-8 pr-md-1">
                  <TextBox {...bip("OBSERVACOES", { label: "Observações" }) } />

                </div>

                <div className="col-md-4 pl-md-1">
                  <ButtonGroup  {...bip("DIASEM", {
                    label: "Dias da semana", buttons: [
                      { value: "0", label: "S", disabled: !this.state.editable, className: "btn btn-circle btn-outline " + (!!that.state.DIASEM0 ? "active btn-primary" : "btn-secondary"), onClick: (e) => { that.onFieldChange({ fieldName: "DIASEM0", value: !that.state.DIASEM0, rawValue: !that.state.DIASEM0 }) } },
                      { value: "1", label: "T", disabled: !this.state.editable, className: "btn btn-circle btn-outline " + (!!that.state.DIASEM1 ? "active btn-primary" : "btn-secondary"), onClick: (e) => { that.onFieldChange({ fieldName: "DIASEM1", value: !that.state.DIASEM1, rawValue: !that.state.DIASEM1 }) } },
                      { value: "2", label: "Q", disabled: !this.state.editable, className: "btn btn-circle btn-outline " + (!!that.state.DIASEM2 ? "active btn-primary" : "btn-secondary"), onClick: (e) => { that.onFieldChange({ fieldName: "DIASEM2", value: !that.state.DIASEM2, rawValue: !that.state.DIASEM2 }) } },
                      { value: "3", label: "Q", disabled: !this.state.editable, className: "btn btn-circle btn-outline " + (!!that.state.DIASEM3 ? "active btn-primary" : "btn-secondary"), onClick: (e) => { that.onFieldChange({ fieldName: "DIASEM3", value: !that.state.DIASEM3, rawValue: !that.state.DIASEM3 }) } },
                      { value: "4", label: "S", disabled: !this.state.editable, className: "btn btn-circle btn-outline " + (!!that.state.DIASEM4 ? "active btn-primary" : "btn-secondary"), onClick: (e) => { that.onFieldChange({ fieldName: "DIASEM4", value: !that.state.DIASEM4, rawValue: !that.state.DIASEM4 }) } },
                      { value: "5", label: "S", disabled: !this.state.editable, className: "btn btn-circle btn-outline " + (!!that.state.DIASEM5 ? "active btn-primary" : "btn-secondary"), onClick: (e) => { that.onFieldChange({ fieldName: "DIASEM5", value: !that.state.DIASEM5, rawValue: !that.state.DIASEM5 }) } },
                      { value: "6", label: "D", disabled: !this.state.editable, className: "btn btn-circle btn-outline " + (!!that.state.DIASEM6 ? "active btn-primary" : "btn-secondary"), onClick: (e) => { that.onFieldChange({ fieldName: "DIASEM6", value: !that.state.DIASEM6, rawValue: !that.state.DIASEM6 }) } }
                    ]
                  }) } />
                </div>

              </div>

            </div>

            <div className="col-lg-2 col-md-3 pr-md-1 hidden-sm-down">
              <div style={{ marginTop: "27px", padding: "15px", height: 100 }} data-tip="Prioridade">
                <Slider ref="PRIORIDADE"
                  disabled={!this.state.editable}
                  vertical min={-2} max={2} value={this.state.PRIORIDADE}
                  onChange={e => { that.onFieldChange({ fieldName: "PRIORIDADE", value: e, rawValue: e }) }}
                  marks={{
                    '-2': { label: "Muito baixa", style: { fontWeight: this.state.PRIORIDADE === -2 ? 700 : "normal" } },
                    '-1': { label: 'Baixa', style: { fontWeight: this.state.PRIORIDADE === -1 ? 700 : "normal" } },
                    '0': { label: 'Normal', style: { fontWeight: this.state.PRIORIDADE === 0 ? 700 : "normal" } },
                    '1': { label: 'Alta', style: { fontWeight: this.state.PRIORIDADE === 1 ? 700 : "normal" } },
                    '2': { label: 'Muito alta', style: { fontWeight: this.state.PRIORIDADE === 2 ? 700 : "normal" } },
                  }} />
              </div>
            </div>

            <div className="col-lg-2 col-md-3 pr-md-1 hidden-md-up">
              <div style={{
                marginTop: "27px",
                paddingTop: "5px",
                paddingLeft: "30px",
                paddingRight: "30px",
                paddingBottom: "20px"
              }} data-tip="Prioridade">
                <Slider ref="PRIORIDADE"
                  disabled={!this.state.editable}
                  min={-2} max={2} value={this.state.PRIORIDADE}
                  onChange={e => { that.onFieldChange({ fieldName: "PRIORIDADE", value: e, rawValue: e }) }}
                  marks={{
                    '-2': { label: "Muito baixa", style: { fontWeight: this.state.PRIORIDADE === -2 ? 700 : "normal" } },
                    '-1': { label: 'Baixa', style: { fontWeight: this.state.PRIORIDADE === -1 ? 700 : "normal" } },
                    '0': { label: 'Normal', style: { fontWeight: this.state.PRIORIDADE === 0 ? 700 : "normal" } },
                    '1': { label: 'Alta', style: { fontWeight: this.state.PRIORIDADE === 1 ? 700 : "normal" } },
                    '2': { label: 'Muito alta', style: { fontWeight: this.state.PRIORIDADE === 2 ? 700 : "normal" } },
                  }} />
              </div>
            </div>
          </div>

        </Panel>

        <Panel title="Âmbito de parceiros" allowCollapse={true} actions={scopeCliActions}>
          <div className="radio-custom radio-success" style={{ display: "block" }}>
            <input type="radio"
              id="CLI_RESTRICT"
              name="CLI_RESTRICT"
              checked={!this.state.CLI_RESTRICT}
              disabled={!this.state.editable}
              onChange={e => that.toggleField("CLI_RESTRICT")} />
            <label htmlFor="CLI_RESTRICT">Todos os clientes</label>
          </div>

          <div className="radio-custom radio-success" style={{ display: "block" }}>
            <input type="radio"
              disabled={!this.state.editable}
              id="CLI_RESTRICT2"
              name="CLI_RESTRICT"
              checked={!!this.state.CLI_RESTRICT}
              disabled={!this.state.editable}
              onChange={e => that.toggleField("CLI_RESTRICT")} />
            <label htmlFor="CLI_RESTRICT2">Clientes com base nas seguintes condições:</label>
          </div>
          {
            !!this.state.CLI_RESTRICT &&
            <CmpCondicoes name="IC"
              items={this.state.IC}
              IC_SPECIFIC={this.state.IC_SPECIFIC}
              onClick_AddRemove={this.onClick_AddRemove2}
              onFieldChange={this.onFieldChange}
              fieldsAllowed={this.state.fieldsAllowedForCli}
              alerts={this.alerts}
              editable={this.state.editable} />
          }

          <div className="checkbox-custom checkbox-danger" style={{ display: "block" }}>
            <input type="checkbox"
              id="CLI_EXCLUDE"
              disabled={!this.state.editable}
              name="CLI_EXCLUDE" checked={this.state.CLI_EXCLUDE}
              onChange={e => { that.onFieldChange({ fieldName: "CLI_EXCLUDE", value: e.target.checked, rawValue: e.target.checked }) }} />
            <label htmlFor="CLI_EXCLUDE">Excluir clientes com base nas seguintes condições:</label>
          </div>
          {
            !!this.state.CLI_EXCLUDE &&

            <CmpCondicoes name="EC"
              items={this.state.EC}
              EC_SPECIFIC={this.state.EC_SPECIFIC}
              onClick_AddRemove={this.onClick_AddRemove2}
              onFieldChange={this.onFieldChange}
              fieldsAllowed={this.state.fieldsAllowedForCli}
              alerts={this.alerts}
              editable={this.state.editable} />
          }
        </Panel>
        <Panel title="Âmbito de artigos" allowCollapse={true} actions={scopeArtActions}>
          <div className="row">
            <div className="col-12">
              <div className="radio-custom radio-success" style={{ display: "block" }}>
                <input type="radio"
                  id="ART_RESTRICT"
                  name="ART_RESTRICT"
                  checked={!this.state.ART_RESTRICT}
                  disabled={!this.state.editable}
                  onChange={e => that.toggleField("ART_RESTRICT")} />
                <label htmlFor="ART_RESTRICT">Todos os artigos</label>
              </div>


              <div className="radio-custom radio-success" style={{ display: "block" }}>
                <input type="radio"
                  id="ART_RESTRICT2"
                  name="ART_RESTRICT"
                  checked={!!this.state.ART_RESTRICT}
                  disabled={!this.state.editable}
                  onChange={e => that.toggleField("ART_RESTRICT")} />
                <label htmlFor="ART_RESTRICT2">Artigos com base nas seguintes condições:</label>
              </div>
              {
                !!this.state.ART_RESTRICT &&

                <CmpCondicoes name="IA"
                  items={this.state.IA}
                  IA_SPECIFIC={this.state.IA_SPECIFIC}
                  onClick_AddRemove={this.onClick_AddRemove2}
                  onFieldChange={this.onFieldChange}
                  fieldsAllowed={this.state.fieldsAllowedForArt}
                  alerts={this.alerts}
                  editable={this.state.editable} />
              }

            </div>
            <div className="col-12">
              <div className="checkbox-custom checkbox-danger" style={{ display: "block" }}>
                <input type="checkbox"
                  disabled={!this.state.editable} id="ART_EXCLUDE" name="ART_EXCLUDE" checked={this.state.ART_EXCLUDE}
                  onChange={e => { that.onFieldChange({ fieldName: "ART_EXCLUDE", value: e.target.checked, rawValue: e.target.checked }) }} />
                <label htmlFor="ART_EXCLUDE">Excluir artigos com base nas seguintes condições:</label>
              </div>
              {
                !!this.state.ART_EXCLUDE &&
                <CmpCondicoes name="EA"
                  items={this.state.EA}
                  EA_SPECIFIC={this.state.EA_SPECIFIC}
                  onClick_AddRemove={this.onClick_AddRemove2}
                  onFieldChange={this.onFieldChange}
                  fieldsAllowed={this.state.fieldsAllowedForArt}
                  alerts={this.alerts}
                  editable={this.state.editable} />
              }
            </div>
          </div>
        </Panel>

        < div className="sappy-action-bar animation-slide-left">
          {!this.state.NUMERO && this.state.ID &&
            < Button color={"danger"} onClick={this.handleApagarRascunho}>
              <i className="icon wb-trash" />Apagar rascunho
            </Button>}

          {!this.state.NUMERO && this.state.ID &&
            <Button color={"success"} onClick={this.handleCreateDocument}>
              <i className="icon wb-check" />Criar promoção
            </Button>}

          {this.state.NUMERO && this.state.editable &&
            <Button color={"success"} onClick={this.handleUpdateDocument}>
              <i className="icon wb-check" />Gravar promoção
            </Button>}

        </div>

        <div style={{ height: "100px" }}>
        </div>
      </div >
    );
  }
}

export default DocPromocoes;
