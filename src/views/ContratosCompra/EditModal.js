import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import axios from "axios";
// var $ = window.$;
var sappy = window.sappy;

import { TextBox, TextBoxNumeric, Date, ComboBox } from "../../Inputs";

class EditModal extends Component {
  constructor(props) {
    super(props);

    this.onFieldChange = this.onFieldChange.bind(this);
    this.onAddDespesa = this.onAddDespesa.bind(this);
    this.getvalidationResults = this.getvalidationResults.bind(this);

    this.state = {
      showValidations: false
    }
  }

  // Recebe os valores dos campos MY*
  onFieldChange(changeInfo) {
    // let that = this;
    let formatedValue = changeInfo.formatedValue;
    let val = changeInfo.rawValue;
    let fieldName = changeInfo.fieldName;

    let newStateValues = {};

    //Correctly save to ServiceLayer properties
    Object.assign(newStateValues, { [fieldName]: (fieldName.indexOf("Valor") > -1 ? formatedValue : val) })

    // // Guardar as propriedades adicionais do adiantamento selecionado
    // if (fieldName === "MeioDePagamento") {
    //   newStateValues.MeioDePagamentoEscolhido = formatedValue
    //   if (!newStateValues.MeioDePagamento) newStateValues.TrocoRecebido = ""
    // }

    // let totalPagar = sappy.getNum(newStateValues.totalPagar || this.state.totalPagar)
    // let MeioDePagamentoEscolhido = (newStateValues.MeioDePagamentoEscolhido || this.state.MeioDePagamentoEscolhido);
    // if (MeioDePagamentoEscolhido.VALOR_PENDENTE) {
    //   newStateValues.DiferrencaAdiantamento = sappy.getNum(MeioDePagamentoEscolhido.VALOR_PENDENTE) - totalPagar;
    // }

    if (changeInfo.realtime) newStateValues[fieldName] = this.state[fieldName]
    this.setState(newStateValues);
  }

  getvalidationResults({ forRender, state } = { forRender: false }) {
    let alerts = {};
    let toastrMsg = []

    if (!forRender || state.showValidations) {
      // if (!state.CardCode) alerts.CardCode = "danger|Preenchimento obrigatório"
      // toastrMsg.push({ color: "danger", msg: "O valor do troco, não pode ser ultrapassar o valor adiantado." })
    } else if (forRender && !state.showValidations) {
    }

    return { alerts, toastrMsg }
  }

  onAddDespesa() {
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

    let invokeAddDocAPI = () => {
      let data = {
        CardCode: this.state.CardCode,
        Series: this.state.settings['FIN.CCD.SERIE_FACTURAS'],
        TaxDate: this.state.TaxDate,
        Comments: this.state.Comments,
        NumAtCard: this.state.NumAtCard,
        Lines: [{
          ItemCode: this.state.ItemCode,
          ValorComIva: sappy.getNum(this.state.totalPagar)
        }],
        MeioDePagamento: { ...this.state.MeioDePagamentoEscolhido },
        TrocoRecebido: sappy.getNum(this.state.TrocoRecebido),

        CAIXA_PRINCIPAL: this.state.settings['FIN.CC.CAIXA_PRINCIPAL'],
        CAIXA_PASSAGEM: this.state.settings['FIN.CCD.CAIXA_PASSAGEM']
      }
      //Para que o c# faça o parse correctamente
      data.MeioDePagamento.VALOR_ORIGINAL = sappy.getNum(data.MeioDePagamento.VALOR_ORIGINAL)
      data.MeioDePagamento.VALOR_PENDENTE = sappy.getNum(data.MeioDePagamento.VALOR_PENDENTE)

      sappy.showWaitProgress("A criar documento...")
      axios
        .post(`/api/caixa/despesas/despesa`, data)
        .then(result => {
          sappy.hideWaitProgress()
          sappy.showToastr({
            color: "success",
            msg: `Criou com sucesso a despesa ${result.data.DocNum}!`
          })

          that.props.toggleModal({ success: result.data.DocNum });
        })
        .catch(error => sappy.showError(error, "Não foi possivel adicionar a despesa"));
    }

    if (!hasWarning)
      return sappy.showQuestion({
        title: "Deseja Continuar?",
        msg: "Se continuar irá criar esta despesa.",
        onConfirm: invokeAddDocAPI,
        confirmText: "Criar despesa",
        onCancel: () => { }
      })
    else
      return sappy.showWarning({
        title: "Atenção!",
        msg: "Ainda há campos com avisos!",
        moreInfo: "Deseja mesmo assim criar esta despesa?",
        onConfirm: invokeAddDocAPI,
        confirmText: "Ignorar e criar despesa",
        onCancel: () => { }
      })

  }

  render() {
    let that = this
    let alerts = this.getvalidationResults({ forRender: true, state: this.state }).alerts;
    let MeioDePagamentoEscolhido = this.state.MeioDePagamentoEscolhido || {};

    let getRightButton = (valor) => !valor ? <i className="icon wb-arrow-left" /> : <i className="icon wb-close" />
    return (
      <Modal isOpen={true} className="modal-lg modal-success">
        < ModalHeader toggle={this.props.toggleModal}  >
          Registar despesa de caixa
        </ModalHeader>
        <ModalBody >
          <div className="container">
            <div className="row">
              <div className="col-9 pr-1">
                <ComboBox
                  label="Fornecedor"
                  name="CardCode"
                  value={this.state.CardCode}
                  state={alerts.CardCode}
                  getOptionsApiRoute={"/api/cbo/ocrd/s"}
                  onChange={this.onFieldChange}
                />
              </div>
              <div className="col-3 pl-1">
                <TextBoxNumeric
                  valueType="integer"
                  name="NUMERO"
                  label="Numero"
                  value={this.state.NUMERO}
                  state={alerts.NUMERO}
                  onChange={this.onFieldChange}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-3 pr-1  ">
                <Date
                  label="Valido De"
                  name="DATAI"
                  value={this.state.DATAI}
                  state={alerts.DATAI}
                  onChange={this.onFieldChange} />
              </div>
              <div className="col-3 pl-1  ">
                <Date
                  label="Até"
                  name="DATAF"
                  value={this.state.DATAF}
                  state={alerts.DATAF}
                  onChange={this.onFieldChange} />
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <TextBox
                  name="DESCRICAO"
                  label="Descrição"
                  value={this.state.DESCRICAO}
                  state={alerts.DESCRICAO}
                  onChange={this.onFieldChange}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-3">
                <h5 className="section-title">Descontos Comerciais</h5>
                <div className="row">
                  <div className="col-12">
                    <TextBox
                      name="MeioDePagamento"
                      label="Descrição das condições comerciais"
                      value={this.state.MeioDePagamento}
                      state={alerts.MeioDePagamento}
                      onChange={this.onFieldChange}
                    />
                  </div>
                </div>
              </div>

              <div className="col-3">
                <h5 className="section-title">Descontos financeiros</h5>
                <div className="row">
                  <div className="col-6 pr-1">
                    <TextBoxNumeric
                      valueType="percent"
                      name="MeioDePagamento"
                      value={this.state.MeioDePagamento}
                      state={alerts.MeioDePagamento}
                      onChange={this.onFieldChange}
                    />
                  </div>
                  <div className="col-6 pl-1">
                    <TextBoxNumeric
                      valueType="integer"
                      name="dia"
                      label="a "
                      value={this.state.MeioDePagamento}
                      state={alerts.MeioDePagamento}
                      onChange={this.onFieldChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sappy-action-bar animation-slide-left">
            <Button color={"success"}
              onClick={this.onAddDespesa}
              disabled={sappy.getNum(this.state.totalPagar) === 0}
            >
              <i className="icon wb-check" />Adicionar contrato
            </Button>
          </div>
        </ModalBody>
      </Modal >
    );
  }
}

export default EditModal;
