import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import axios from "axios";
var $ = window.$;
var sappy = window.sappy;

import { TextBox, TextBoxNumeric, Date, ComboBox, Notas } from "../../Inputs";

class ModalMeiosPagPagamento extends Component {
  constructor(props) {
    super(props);

    this.handleOnTabClick = this.handleOnTabClick.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.onCreatePayment = this.onCreatePayment.bind(this);
    this.onClick_GetRemaingValue = this.onClick_GetRemaingValue.bind(this);
    this.onClick_AddRemoveCheque = this.onClick_AddRemoveCheque.bind(this);
    this.updateTotalCheques = this.updateTotalCheques.bind(this);
    this.getvalidationResults = this.getvalidationResults.bind(this);

    this.state = {
      activeTab: "tab1",
      cheques: [{ data: sappy.unformat.date(".") }],
      showValidations: false,
      settings: {}
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.calcPageHeight);

    this.setState({
      settings: sappy.getSettings(["FIN.CC.CAIXA_PRINCIPAL", "FIN.CC.MULTIBANCO", "FIN.CC.CHEQUES"])
    });

    this.onFieldChange({
      fieldName: "originalTotalPagar",
      formatedValue: sappy.format.amount(this.props.totalPagar),
      rawValue: sappy.getNum(this.props.totalPagar)
    });
    this.calcPageHeight();
  }

  calcPageHeight() {
    let $el = $(".modal-content>.main-body");
    // console.log($el)
    let $scrollAbleparent = $("body");
    if ($scrollAbleparent && $el && $el.position) {
      let pos = $el.position();
      if (pos) {
        let minH = $scrollAbleparent.height() - $el.position().top - 370;
        $el.css("height", minH.toString() + "px");
      }
    }
  }

  handleOnTabClick(e) {
    e.preventDefault();
    let tab = e.target.id;
    this.setState({ activeTab: tab });
  }

  updateTotalCheques(cheques) {
    let v = cheques.reduce((sum, fld) => sum + sappy.getNum(fld.valor), 0);
    // Alterar apenas o valor total de cheques
    return this.onFieldChange({
      fieldName: "ValorCheques",
      rawValue: v,
      formatedValue: sappy.format.amount(v)
    });
  }

  // Recebe os valores dos campos MY*
  onFieldChange(changeInfo) {
    let that = this;
    let formatedValue = changeInfo.formatedValue;
    let val = changeInfo.rawValue;
    let fieldName = changeInfo.fieldName;

    // console.log("onFieldChange:" + fieldName)

    let newStateValues = {};

    if (fieldName.indexOf("cheques#") > -1) {
      let ix = sappy.getNum(fieldName.split("#")[1]);
      let prop = fieldName.split("#")[2];

      let cheques = [...this.state.cheques];

      if (prop === "valor") {
        cheques[ix] = Object.assign({}, cheques[ix], { [prop]: formatedValue });
        if (!changeInfo.realtime) cheques[ix] = Object.assign({}, cheques[ix], { valorCommited: formatedValue });

        // if (changeInfo.realtime) {
        // Alterar apenas o valor total de cheques
        // return that.updateTotalCheques(cheques);
        // } else {
        return this.setState(
          { cheques },
          //Após alterar o valor do cheque, alterar o valor total de cheques
          () => that.updateTotalCheques(cheques)
        );
        // }
      } else {
        cheques[ix][prop] = val;
        newStateValues.cheques = cheques;
      }
    } else if (fieldName === "originalTotalPagar") {
      Object.assign(newStateValues, { originalTotalPagar: formatedValue });
      if (val < 0) {
        Object.assign(newStateValues, { totalPagar: sappy.format.amount(val * -1) });
        Object.assign(newStateValues, { isPayment: true });
      } else {
        Object.assign(newStateValues, { totalPagar: sappy.format.amount(val) });
        Object.assign(newStateValues, { isPayment: false });
      }
    } else {
      //Correctly save to ServiceLayer properties
      Object.assign(newStateValues, { [fieldName]: fieldName.indexOf("Valor") > -1 ? formatedValue : val });
    }

    // if (this.state[fieldName + "_VALIDATEMSG"]) newStateValues[fieldName + "_VALIDATEMSG"] = ""

    let originalTotalPagar = sappy.getNum(newStateValues.originalTotalPagar ? newStateValues.originalTotalPagar : this.state.originalTotalPagar);
    let totalPagar = sappy.getNum(newStateValues.totalPagar ? newStateValues.totalPagar : this.state.totalPagar);
    let ValorNumerario = sappy.getNum(fieldName === "ValorNumerario" ? formatedValue : this.state.ValorNumerario);
    let ValorMultibanco = sappy.getNum(fieldName === "ValorMultibanco" ? formatedValue : this.state.ValorMultibanco);
    let ValorTransferencia = sappy.getNum(fieldName === "ValorTransferencia" ? formatedValue : this.state.ValorTransferencia);
    let ValorCheques = sappy.getNum(fieldName === "ValorCheques" ? formatedValue : this.state.ValorCheques);

    let NrNotas5 = sappy.getNum(fieldName === "NrNotas5" ? formatedValue : this.state.NrNotas5);
    let NrNotas10 = sappy.getNum(fieldName === "NrNotas10" ? formatedValue : this.state.NrNotas10);
    let NrNotas20 = sappy.getNum(fieldName === "NrNotas20" ? formatedValue : this.state.NrNotas20);
    let NrNotas50 = sappy.getNum(fieldName === "NrNotas50" ? formatedValue : this.state.NrNotas50);
    let NrNotas100 = sappy.getNum(fieldName === "NrNotas100" ? formatedValue : this.state.NrNotas100);
    let NrNotas200 = sappy.getNum(fieldName === "NrNotas200" ? formatedValue : this.state.NrNotas200);
    let NrNotas500 = sappy.getNum(fieldName === "NrNotas500" ? formatedValue : this.state.NrNotas500);
    let ValorNotas = NrNotas5 * 5 + NrNotas10 * 10 + NrNotas20 * 20 + NrNotas50 * 50 + NrNotas100 * 100 + NrNotas200 * 200 + NrNotas500 * 500;
    Object.assign(newStateValues, { ValorNotas: sappy.format.amount(ValorNotas) });

    let ValorMoedas = sappy.getNum(fieldName === "ValorMoedas" ? formatedValue : this.state.ValorMoedas);
    let ValorVales = sappy.getNum(fieldName === "ValorVales" ? formatedValue : this.state.ValorVales);
    let ValorTickets = sappy.getNum(fieldName === "ValorTickets" ? formatedValue : this.state.ValorTickets);

    let TotalNumerarioCalculado = ValorNotas + ValorMoedas + ValorVales + ValorTickets;
    Object.assign(newStateValues, { TotalNumerarioCalculado: sappy.format.amount(TotalNumerarioCalculado) });
    if (TotalNumerarioCalculado) {
      ValorNumerario = TotalNumerarioCalculado;
      Object.assign(newStateValues, { ValorNumerario: sappy.format.amount(ValorNumerario) });
    }

    let continuarColor;
    let continuarContent;

    //Não pode ter transferência e multibanco
    if (fieldName.indexOf("ValorTransferencia") > -1 && ValorMultibanco) {
      sappy.showToastr({ color: "warning", msg: "Não pode ter Transferência e Multibanco em simultaneo." });
      newStateValues.ValorMultibanco = "";
      ValorMultibanco = 0;
    } else if (fieldName.indexOf("ValorMultibanco") > -1 && ValorTransferencia) {
      sappy.showToastr({ color: "warning", msg: "Não pode ter Multibanco e Transferência em simultaneo." });
      newStateValues.ValorTransferencia = "";
      ValorTransferencia = 0;
    }

    let totalMeiosPag = ValorNumerario + ValorMultibanco + ValorTransferencia + ValorCheques;
    let pagamentoPorConta = totalPagar > Math.abs(originalTotalPagar) ? sappy.round(totalPagar - Math.abs(originalTotalPagar), 2) : 0;
    let troco = sappy.round(totalMeiosPag - totalPagar, 2);

    if (troco > ValorNumerario) {
      sappy.showToastr({ color: "danger", msg: "O troco não pode ser superior ao valor em numerário" });
      continuarColor = "danger";
      continuarContent = (
        <span>
          <i className="icon wb-warning" /> Troco {sappy.format.amount(troco)}
        </span>
      );
    } else if (troco < 0) {
      continuarColor = "danger";
      continuarContent = (
        <span>
          <i className="icon wb-warning" /> Em falta {sappy.format.amount(-1 * troco)}
        </span>
      );
    } else if (troco > 0) {
      continuarColor = "warning";
      continuarContent = (
        <span>
          <i className="icon wb-check" /> Concluir (Troco {sappy.format.amount(troco)})
        </span>
      );
    } else {
      continuarColor = "success";
      continuarContent = (
        <span>
          <i className="icon wb-check" /> Concluir {sappy.format.amount(troco)}
        </span>
      );
    }

    newStateValues.continuarColor = continuarColor;
    newStateValues.continuarContent = continuarContent;
    newStateValues.totalMeiosPag = totalMeiosPag;
    newStateValues.troco = troco;
    newStateValues.pagamentoPorConta = pagamentoPorConta;

    if (changeInfo.realtime) newStateValues[fieldName] = this.state[fieldName];

    this.setState(newStateValues);
  }

  onClick_AddRemoveCheque(cmpThis) {
    let that = this;
    // let fieldName = cmpThis.props.name.split("#")[0];
    let ix = sappy.getNum(cmpThis.props.name.split("#")[1]);
    let cheques = [...this.state.cheques];
    let currVal = sappy.getNum(cheques[ix].valor);
    let totalPagar = sappy.getNum(this.state.totalPagar);
    let totalMeiosPag = sappy.getNum(this.state.totalMeiosPag);
    let cheque = cheques[ix];
    let emFalta = 0;
    if (totalPagar > totalMeiosPag) emFalta = totalPagar - totalMeiosPag;

    let removerCheque = () => {
      cheques.splice(ix, 1);
      this.setState({ cheques }, that.updateTotalCheques(cheques));
    };
    let adicionarCheque = () => {
      //Assumir dados co cheque atual +1
      if (emFalta > 0) {
        cheques.push({
          banco: cheque.banco,
          numero: cheque.numero ? (sappy.getNum(cheque.numero) + 1).toString() : "",
          valor: sappy.format.amount(currVal < emFalta ? currVal : emFalta),
          valorCommited: sappy.format.amount(currVal < emFalta ? currVal : emFalta)
        });
        this.setState({ cheques }, that.updateTotalCheques(cheques));
      }
    };
    let assumirValor = () => that.onFieldChange({ fieldName: "cheques#" + ix + "#valor", rawValue: emFalta, formatedValue: sappy.format.amount(totalPagar - totalMeiosPag) });
    let removerValor = () => that.onFieldChange({ fieldName: "cheques#" + ix + "#valor", rawValue: 0, formatedValue: "" });

    if (cheques.length === 1) {
      if (sappy.getNum(cheque.valor) === 0) assumirValor();
      else if (this.state.troco === 0) removerValor();
      else adicionarCheque();
    } else {
      if (ix === 0) adicionarCheque();
      else if (sappy.getNum(cheque.valor) === 0 && ix === cheques.length - 1) assumirValor();
      else removerCheque();
    }
  }

  onClick_GetRemaingValue(cmpThis) {
    let fieldName = cmpThis.props.name;
    let currVal = sappy.getNum(this.state[fieldName]);
    let totalPagar = sappy.getNum(this.state.totalPagar);
    if (totalPagar < 0) totalPagar *= -1;

    let totalMeiosPag = sappy.getNum(this.state.totalMeiosPag);
    if (fieldName.indexOf("ValorTransferencia") > -1 || fieldName.indexOf("ValorMultibanco") > -1) {
      totalMeiosPag -= sappy.getNum(this.state.ValorTransferencia);
      totalMeiosPag -= sappy.getNum(this.state.ValorMultibanco);
    } else {
      totalMeiosPag -= currVal;
    }

    let rawValue = 0;
    if (!currVal && totalPagar - totalMeiosPag > 0) rawValue = totalPagar - totalMeiosPag;

    if (currVal !== rawValue)
      this.onFieldChange({
        fieldName,
        formatedValue: rawValue ? sappy.format.amount(rawValue) : "",
        rawValue
      });
  }

  getvalidationResults({ forRender, state } = { forRender: false }) {
    let alerts = {};
    let toastrMsg = [];
    if (!forRender || state.showValidations) {
      if (state.ValorTransferencia && (!state.RefTransferencia || !state.ContaTransferencia)) {
        if (!state.RefTransferencia) alerts.RefTransferencia = "warning|Deve preencher a referência";
        if (!state.ContaTransferencia) alerts.ContaTransferencia = "danger|Indique a conta de destino da transferência";
      }

      state.cheques.forEach((cheque, ix) => {
        if (sappy.getNum(cheque.valor)) {
          if (!cheque.data) alerts["cheques#" + ix + "data"] = "danger|Data em falta";
          if (!this.state.isPayment && !cheque.banco) alerts["cheques#" + ix + "banco"] = "danger|Deve preencher o banco";
          if (this.state.isPayment && !cheque.contabnc) alerts["cheques#" + ix + "contabnc"] = "danger|Deve preencher a conta";
          if (!cheque.numero) alerts["cheques#" + ix + "numero"] = "danger|Numero em falta";
        }
      });
      if (sappy.getNum(state.pagamentoPorConta) > 0) alerts.totalPagar = "warning|Para crédito de conta " + sappy.format.amount(state.pagamentoPorConta);
    } else if (forRender && !state.showValidations) {
      if (sappy.getNum(state.pagamentoPorConta) > 0) alerts.totalPagar = "secondary|Para crédito de conta " + sappy.format.amount(state.pagamentoPorConta);
    }

    return { alerts, toastrMsg };
  }

  onCreatePayment() {
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
      return sappy.showToastr({ color: "danger", msg: "Há campos com erros. Verifique se preencheu todos os campos obrigatórios..." });
    }

    //Validar se há avisos ativos
    let hasWarning = Object.keys(alerts).find(f => alerts[f].startsWith("warning"));

    let strDocDesc = this.state.isPayment ? "pagamento" : "recebimento";

    let invokeAddDocAPI = () => {
      let DocType = this.props.selectedPNType === "C" ? "rCustomer" : "rSupplier";

      let data = {
        DocType,
        CardCode: this.props.selectedPN,
        CashAccount: this.state.settings["FIN.CC.CAIXA_PRINCIPAL"],
        CashSum: sappy.getNum(this.state.ValorNumerario) - sappy.getNum(this.state.troco),
        Remarks: this.state.Observacoes,
        PaymentInvoices: [],

        U_apyNotas5: sappy.getNum(this.state.NrNotas5),
        U_apyNotas10: sappy.getNum(this.state.NrNotas10),
        U_apyNotas20: sappy.getNum(this.state.NrNotas20),
        U_apyNotas50: sappy.getNum(this.state.NrNotas50),
        U_apyNotas100: sappy.getNum(this.state.NrNotas100),
        U_apyNotas200: sappy.getNum(this.state.NrNotas200),
        U_apyNotas500: sappy.getNum(this.state.NrNotas500),
        U_apyNotas: sappy.getNum(this.state.ValorNotas),
        U_apyMoedas: sappy.getNum(this.state.ValorMoedas),
        U_apyVales: sappy.getNum(this.state.ValorVales),
        U_apyTickets: sappy.getNum(this.state.ValorTickets),
        U_apyTroco: sappy.getNum(this.state.troco)
      };

      if (sappy.getNum(this.state.ValorMultibanco)) {
        data.TransferAccount = this.state.settings["FIN.CC.MULTIBANCO"];
        data.TransferSum = sappy.getNum(this.state.ValorMultibanco);
        data.TransferReference = "MB";
      }

      if (sappy.getNum(this.state.ValorTransferencia)) {
        data.TransferAccount = this.state.ContaTransferencia;
        data.TransferSum = sappy.getNum(this.state.ValorTransferencia);
        data.TransferReference = this.state.RefTransferencia;
      }

      data.PaymentChecks = [];
      data.CheckAccount = this.state.settings["FIN.CC.CHEQUES"];

      this.state.cheques.forEach(cheque => {
        if (sappy.getNum(cheque.valor) > 0) {
          if (!this.state.isPayment) {
            data.PaymentChecks.push({
              DueDate: sappy.format.YYYY_MM_DD(cheque.data),
              CheckNumber: cheque.numero,
              BankCode: cheque.banco,
              CheckSum: sappy.getNum(cheque.valor)
            });
          } else {
            let contabnc = cheque.contabnc || "";
            let BankCode = contabnc.split("|")[0];
            let CountryCode = contabnc.split("|")[1];
            let AccounttNum = contabnc.split("|")[2];
            let CheckAccount = contabnc.split("|")[3];

            data.PaymentChecks.push({
              DueDate: sappy.format.YYYY_MM_DD(cheque.data),
              CheckNumber: cheque.numero,
              CheckSum: sappy.getNum(cheque.valor),
              CountryCode,
              BankCode,
              AccounttNum,
              CheckAccount,
              ManualCheck: "tYES"
            });
          }
        }
      });

      let pendingValue = sappy.getNum(this.state.totalPagar);

      // nota: os valores a pagar são negativos.
      // Num recebimento o total de valores a receber(positivos) é superior aos valores a deduzir(negativos)
      // Num pagamento o total de valores a pagar(negativos) é superior aos valores a deduzir(positivos)
      let docsDeducao = this.props.selectedDocs.filter(doc => (this.state.isPayment ? sappy.getNum(doc.BALANCE) > 0 : sappy.getNum(doc.BALANCE) < 0));
      let docsPagar = this.props.selectedDocs.filter(doc => (this.state.isPayment ? sappy.getNum(doc.BALANCE) < 0 : sappy.getNum(doc.BALANCE) > 0));

      // Para que quando há valores parciais funcione bem, vamos colocar sempre primeiro os valores a deduzir
      docsDeducao.forEach(doc => {
        let valueToUse = Math.abs(sappy.getNum(doc.BALANCE));
        pendingValue += valueToUse;

        if (sappy.getNum(doc.TransType) !== 24 && sappy.getNum(doc.TransType) !== 46) {
          data.PaymentInvoices.push({
            DocEntry: doc.CreatedBy,
            InvoiceType: sappy.b1.getBoRcptInvTypes(doc.TransType),
            SumApplied: -1 * valueToUse
          });
        } else {
          data.PaymentInvoices.push({
            DocEntry: doc.TransId,
            DocLine: doc.Line_ID,
            InvoiceType: sappy.b1.getBoRcptInvTypes(doc.TransType),
            SumApplied: -1 * valueToUse
          });
        }
      });

      // Para que quando há valores parciais funcione bem, vamos colocar sempre depois os vaores a Pagar
      docsPagar.forEach(doc => {
        let valueToUse = 0;
        let docBalance = Math.abs(sappy.getNum(doc.BALANCE));

        if (pendingValue - docBalance >= 0) {
          valueToUse = docBalance;
        } else {
          valueToUse = pendingValue;
        }
        pendingValue -= valueToUse;
        if (valueToUse <= 0) return;

        if (sappy.getNum(doc.TransType) !== 24 && sappy.getNum(doc.TransType) !== 46) {
          data.PaymentInvoices.push({
            DocEntry: doc.CreatedBy,
            InvoiceType: sappy.b1.getBoRcptInvTypes(doc.TransType),
            SumApplied: valueToUse
          });
        } else {
          data.PaymentInvoices.push({
            DocEntry: doc.TransId,
            DocLine: doc.Line_ID,
            InvoiceType: sappy.b1.getBoRcptInvTypes(doc.TransType),
            SumApplied: valueToUse
          });
        }
      });

      sappy.showWaitProgress("A criar documento...");
      axios
        .post(`/api/caixa/receber/${this.state.isPayment ? "payment" : "receipt"}`, data)
        .then(result => {
          sappy.hideWaitProgress();
          sappy.showToastr({
            color: "success",
            msg: `Criou com sucesso o ${strDocDesc} ${result.data.DocNum} no valor de ${sappy.format.amount(sappy.getNum(that.state.totalPagar))}, de ${result.data.CardName}!`
          });

          that.props.toggleModal({ success: result.data.DocNum });
        })
        .catch(error => sappy.showError(error, "Não foi possivel adicionar o " + strDocDesc));
    };

    if (!hasWarning)
      return sappy.showQuestion({
        title: "Deseja Continuar?",
        msg: "Se continuar irá criar este " + strDocDesc + ".",
        onConfirm: invokeAddDocAPI,
        confirmText: "Criar " + strDocDesc,
        onCancel: () => {}
      });
    else
      return sappy.showWarning({
        title: "Atenção!",
        msg: "Ainda há campos com avisos!",
        moreInfo: "Deseja mesmo assim criar este " + strDocDesc + "?",
        onConfirm: invokeAddDocAPI,
        confirmText: "Ignorar e criar " + strDocDesc,
        onCancel: () => {}
      });
  }

  render() {
    let alerts = this.getvalidationResults({ forRender: true, state: this.state }).alerts;
    let getRightButton = valor => (!valor ? <i className="icon wb-arrow-left" /> : <i className="icon wb-close" />);

    let renderNumerario = () =>
      <div>
        <div className="row">
          <div className="col-4">
            <div className="row">
              <div className="col pr-1">
                <Notas valueType="amount" label="5 €" name="NrNotas5" value={this.state.NrNotas5} onChange={this.onFieldChange} realTimeChange={true} />
              </div>
            </div>
            <div className="row">
              <div className="col pr-1">
                <Notas valueType="amount" label="10 €" name="NrNotas10" value={this.state.NrNotas10} onChange={this.onFieldChange} realTimeChange={true} />
              </div>
            </div>
            <div className="row">
              <div className="col pr-1">
                <Notas valueType="amount" label="20 €" name="NrNotas20" value={this.state.NrNotas20} onChange={this.onFieldChange} realTimeChange={true} />
              </div>
            </div>
            <div className="row">
              <div className="col pr-1">
                <Notas valueType="amount" label="50 €" name="NrNotas50" value={this.state.NrNotas50} onChange={this.onFieldChange} realTimeChange={true} />
              </div>
            </div>
            <div className="row">
              <div className="col pr-1">
                <Notas valueType="amount" label="100 €" name="NrNotas100" value={this.state.NrNotas100} onChange={this.onFieldChange} realTimeChange={true} />
              </div>
            </div>
            <div className="row">
              <div className="col pr-1">
                <Notas valueType="amount" label="200 €" name="NrNotas200" value={this.state.NrNotas200} onChange={this.onFieldChange} realTimeChange={true} />
              </div>
            </div>
            <div className="row">
              <div className="col pr-1">
                <Notas valueType="amount" label="500 €" name="NrNotas500" value={this.state.NrNotas500} onChange={this.onFieldChange} realTimeChange={true} />
              </div>
            </div>
          </div>
          <div className="col-3">
            <div className="row">
              <div className="col">
                <TextBoxNumeric valueType="amount" label="Moedas:" name="ValorMoedas" value={this.state.ValorMoedas} onChange={this.onFieldChange} realTimeChange={true} />
              </div>
            </div>
            <div className="row">
              <div className="col">
                <TextBoxNumeric valueType="amount" label="Vales:" name="ValorVales" value={this.state.ValorVales} onChange={this.onFieldChange} realTimeChange={true} />
              </div>
            </div>
            <div className="row">
              <div className="col">
                <TextBoxNumeric valueType="amount" label="Tickets:" name="ValorTickets" value={this.state.ValorTickets} onChange={this.onFieldChange} realTimeChange={true} />
              </div>
            </div>
            {/* <div className="row">
              <div className="col"> <TextBoxNumeric valueType="amount" label="Notas:" name="ValorNotas" value={this.state.ValorNotas} disabled={true} /></div>
            </div> */}
          </div>
          <div className="col-4 offset-1">
            <TextBoxNumeric
              valueType="amount"
              label="Valor em numerário:"
              name="ValorNumerario"
              value={this.state.ValorNumerario}
              onChange={this.onFieldChange}
              disabled={sappy.getNum(this.state.TotalNumerarioCalculado) > 0}
              realTimeChange={true}
              rightButton={getRightButton(this.state.ValorNumerario)}
              onRightButtonClick={this.onClick_GetRemaingValue}
            />
          </div>
        </div>
      </div>;

    let renderMultibanco = () =>
      <div>
        <div className="row">
          <div className="col-4 pr-1">
            <TextBoxNumeric
              valueType="amount"
              label="Valor do pagamento:"
              name="ValorMultibanco"
              value={this.state.ValorMultibanco}
              onChange={this.onFieldChange}
              realTimeChange={true}
              rightButton={getRightButton(this.state.ValorMultibanco)}
              onRightButtonClick={this.onClick_GetRemaingValue}
            />
          </div>
        </div>
      </div>;

    let renderTransferencia = () =>
      <div>
        <div className="row">
          <div className="col-4 pr-1">
            <TextBoxNumeric
              valueType="amount"
              label="Valor da transferência:"
              name="ValorTransferencia"
              value={this.state.ValorTransferencia}
              onChange={this.onFieldChange}
              realTimeChange={true}
              rightButton={getRightButton(this.state.ValorTransferencia)}
              onRightButtonClick={this.onClick_GetRemaingValue}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-4 pr-1">
            <TextBox label="Referência:" name="RefTransferencia" state={alerts.RefTransferencia} value={this.state.RefTransferencia} onChange={this.onFieldChange} />
          </div>
          <div className="col-4 pl-1">
            <ComboBox
              name="ContaTransferencia"
              label="Destino"
              value={this.state.ContaTransferencia}
              state={alerts.ContaTransferencia}
              getOptionsApiRoute="/api/cbo/oact/cnt12"
              onChange={this.onFieldChange}
            />
          </div>
        </div>
      </div>;

    let renderCheques = () => {
      let cheques = this.state.cheques || [];
      let renderCheque = (cheque, ix) => {
        let rightButton;

        if (cheques.length === 1) {
          if (sappy.getNum(cheque.valor) === 0) rightButton = <i className="icon wb-arrow-left" />;
          else if (this.state.troco === 0) rightButton = <i className="icon wb-close" />;
          else rightButton = "+";
        } else {
          if (ix === 0) rightButton = "+";
          else if (sappy.getNum(cheque.valor) === 0 && ix === cheques.length - 1) rightButton = <i className="icon wb-arrow-left" />;
          else rightButton = "-";
        }

        return (
          <div key={"cheques#" + ix} className="row">
            <div className="col-3 pr-1">
              <Date label={ix === 0 ? "Data" : ""} name={"cheques#" + ix + "#data"} value={cheque.data} state={alerts["cheques#" + ix + "data"]} onChange={this.onFieldChange} />
            </div>
            <div className="col-4 pl-1 pr-1">
              {!this.state.isPayment &&
                <ComboBox
                  label={ix === 0 ? "Banco" : ""}
                  name={"cheques#" + ix + "#banco"}
                  value={cheque.banco}
                  state={alerts["cheques#" + ix + "banco"]}
                  getOptionsApiRoute="/api/cbo/odsc"
                  onChange={this.onFieldChange}
                />}
              {this.state.isPayment &&
                <ComboBox
                  label={ix === 0 ? "Conta" : ""}
                  name={"cheques#" + ix + "#contabnc"}
                  value={cheque.contabnc}
                  state={alerts["cheques#" + ix + "contabnc"]}
                  getOptionsApiRoute="/api/cbo/dsc1"
                  onChange={this.onFieldChange}
                />}
            </div>
            <div className="col-2 pl-1 pr-1">
              <TextBoxNumeric
                valueType="integer"
                align="left"
                label={ix === 0 ? "Número" : ""}
                name={"cheques#" + ix + "#numero"}
                value={cheque.numero}
                state={alerts["cheques#" + ix + "numero"]}
                onChange={this.onFieldChange}
              />
            </div>
            <div className="col-3 pl-1">
              <TextBoxNumeric
                valueType="amount"
                label={ix === 0 ? "Valor" : ""}
                name={"cheques#" + ix + "#valor"}
                value={cheque.valorCommited}
                onChange={this.onFieldChange}
                realTimeChange={true}
                rightButton={rightButton}
                onRightButtonClick={this.onClick_AddRemoveCheque}
              />
            </div>
          </div>
        );
      };

      let chequeElemts = [];
      for (var ix = 0; ix < cheques.length; ix++) {
        let cheque = cheques[ix] || {};
        chequeElemts.push(renderCheque(cheque, ix));
      }
      return (
        <div>
          {chequeElemts}
          <div className="row">
            <div className="col-3 offset-9 pl-1">
              <TextBoxNumeric valueType="amount" label="Total de cheques:" name="ValorCheques" value={this.state.ValorCheques} disabled={true} />
            </div>
          </div>
        </div>
      );
    };

    let strMeioPagOrRecTo = this.state.isPayment ? "Meio de pagamento a " : "Meio de recebimento de ";
    let className = this.state.isPayment ? "modal-warning" : "modal-success";

    return (
      <Modal isOpen={true} className={"modal-md " + className}>
        <ModalHeader toggle={this.props.toggleModal}>
          {strMeioPagOrRecTo + this.props.selectedPNname + " (" + this.props.selectedPN + ")"}
        </ModalHeader>
        <ModalBody>
          <div className="panel">
            {/* <div className="panel-body "> */}
            <div className="container">
              <div className="row">
                <div className="col   px-0">
                  <p />
                </div>
              </div>
              <div className="row">
                <div className="col-2   px-0">
                  <div className="list-group faq-list" role="tablist">
                    <a
                      className={"list-group-item list-group-item-action active " + (this.state.ValorNumerario ? "filled" : "")}
                      data-toggle="tab"
                      role="tab"
                      id="tab1"
                      onClick={this.handleOnTabClick}
                    >
                      Numerário
                    </a>
                    <a className={"list-group-item " + (this.state.ValorMultibanco ? "filled" : "")} data-toggle="tab" role="tab" id="tab2" onClick={this.handleOnTabClick}>
                      Multibanco
                    </a>
                    <a className={"list-group-item " + (this.state.ValorTransferencia ? "filled" : "")} data-toggle="tab" role="tab" id="tab3" onClick={this.handleOnTabClick}>
                      Transferência
                    </a>
                    <a className={"list-group-item " + (this.state.ValorCheques ? "filled" : "")} data-toggle="tab" role="tab" id="tab4" onClick={this.handleOnTabClick}>
                      Cheque
                    </a>
                  </div>
                </div>
                <div className="col-10      px-0">
                  <div className="painel-modopag">
                    {this.state.activeTab === "tab1" && renderNumerario()}
                    {this.state.activeTab === "tab2" && renderMultibanco()}
                    {this.state.activeTab === "tab3" && renderTransferencia()}
                    {this.state.activeTab === "tab4" && renderCheques()}
                  </div>

                  <div className="painel-modopag-bottom">
                    <div className="row">
                      <div className="col-8 pr-1  ">
                        <TextBox label="Observações" name="Observacoes" value={this.state.Observacoes} state={alerts.Observacoes} onChange={this.onFieldChange} />
                      </div>
                      <div className="col-4 pl-1">
                        <TextBoxNumeric
                          valueType="amount"
                          label={this.state.isPayment ? "Total a pagar" : "Total a receber"}
                          name="totalPagar"
                          state={alerts.totalPagar}
                          value={this.state.totalPagar}
                          onChange={this.onFieldChange}
                          realTimeChange={true}
                        />
                      </div>
                    </div>

                    {/* <div className="row">
                      <div className="col-12   ">
                        <CheckHr
                          label="Enviar por email para... (ainda em desenvolvimento...)"
                          name="apyByMail"
                          value={this.state.apyByMail}
                          onChange={this.onFieldChange}
                        />
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sappy-action-bar animation-slide-left">
            <Button color={this.state.continuarColor} disabled={this.state.continuarColor === "danger"} onClick={this.onCreatePayment}>
              {this.state.continuarContent}
            </Button>
          </div>
        </ModalBody>
      </Modal>
    );
  }
}

export default ModalMeiosPagPagamento;
