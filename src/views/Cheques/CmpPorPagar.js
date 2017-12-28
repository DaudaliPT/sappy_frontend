import React, { Component } from "react";
import axios from "axios";
import SearchPage from "../../components/SearchPage";
import SearchPage2 from "../../components/SearchPage2";
// import DocDetailMore from "./DocDetailMore";

// import { Badge } from "reactstrap";
// import uuid from "uuid/v4";
const sappy = window.sappy;
const $ = window.$;
import CmpFooter from "./CmpFooter";

class CmpPorPagar extends Component {
  constructor(props) {
    super(props);

    this.handlePNselection = this.handlePNselection.bind(this);
    this.handleDetailRowSelect = this.handleDetailRowSelect.bind(this);
    this.handleDocRefresh = this.handleDocRefresh.bind(this);
    this.handlePrintDoc = this.handlePrintDoc.bind(this);

    this.state = {
      selectedPN: "",
      selectedPNname: "",
      selectedPNcodeCli: "",
      selectedDocKeys: [],
      shiftKey: false,
      ctrlKey: false,
      settings: {}
    };
  }

  componentDidMount() {
    this.setState({
      settings: sappy.getSettings(["FIN.CC.CAIXA_PRINCIPAL", "FIN.CC.MULTIBANCO"])
    });
  }

  handlePNselection(e, row) {
    var rowDiv = $(e.target).closest(".byusVirtualRow")[0];

    let cardCode = rowDiv.id.split("_")[1];
    let { selectedPN, selectedPNname, selectedPNcodeCli } = this.state;
    if (selectedPN === cardCode) {
      selectedPN = "";
      selectedPNname = "";
      selectedPNcodeCli = "";
    } else {
      selectedPN = cardCode;
      selectedPNname = row.CARDNAME;
      selectedPNcodeCli = row.U_apyCLIENTE;
    }

    this.setState({ selectedPN, selectedPNname, selectedPNcodeCli, selectedDocKeys: [] });
  }

  handleDetailRowSelect(selectedDocKeys) {
    this.setState({
      selectedDocKeys,
      showActions: false
    });
  }

  handleDocRefresh(e) {
    let { selectedDocKeys } = this.state;
    this.setState({ selectedDocKeys: [...selectedDocKeys] });
  }

  handlePrintDoc(e) {
    // let that = this;
    // let selectedPN = this.state.selectedPN;
    let docsList = [];
    if (this.docsComponent) docsList = this.docsComponent.state.listItems;
    // let totalOfSelectedDocs = 0;
    let selectedDocs = docsList.filter(doc => this.state.selectedDocKeys.indexOf(doc.TRANSID_AND_LINEID) > -1);

    this.setState({
      showActions: false
    });

    selectedDocs.forEach(doc => {
      // let InvoiceType = "";
      let transType = sappy.getNum(doc.TransType);

      // let url = `/api/reports/printdoc/${transType}/${doc.CreatedBy}`;
      let url = `/api/reports/print/${transType}/${doc.CreatedBy}`;

      // let url = `/api/reports/pdf/${transType}/${doc.CreatedBy}`;
      // var baseUrl = ""; // Nota: Em desenv, é preciso redirecionar o pedido. Já em produtivo a api é servida na mesma porta do pedido
      // if (window.location.port === "3000") baseUrl = "http://byusserver:3005";
      // window.open(baseUrl + url, "_blank");

      axios
        .get(url)
        .then(result => {
          sappy.showToastr({
            color: "success",
            msg: `${doc.DOCUMENTO} impresso!`
          });
        })
        .catch(error => {
          sappy.showError(error, "Não foi possivel imprimir o documento");
        });
    });
  }

  render() {
    let that = this;
    let { selectedPN, selectedPNname, selectedPNcodeCli, selectedDocKeys } = this.state;
    let docsList = [];
    if (this.docsComponent) {
      docsList = this.docsComponent.state.listItems;
    }

    let totalOfSelectedDocs = 0;
    // let totalOfEncontroContas = 0;

    // É importante preservar a ordem de seleção para o caso de pagamento parciais
    let selectedDocs = selectedDocKeys.map(docKey => docsList.find(doc => doc.TRANSID_AND_LINEID === docKey));
    selectedDocs.forEach(doc => {
      totalOfSelectedDocs += sappy.getNum(doc.LIQBALANCE);
      // if (doc.CardType === "C") totalOfEncontroContas += sappy.getNum(doc.LIQBALANCE);
    });

    let renderRowPN = ({ row, index }) => {
      const selected = row.CardCode === selectedPN;
      let rowStyleClass = "";
      let r = { ...row };
      if (selected) rowStyleClass += " sappy-selected-row";

      let descDocs;
      if (sappy.getNum(row.LIQBALANCE) === sappy.getNum(row.TOTAL_LIQBALANCE)) {
        descDocs = row.NUMDOCS + " " + (row.NUMDOCS === 1 ? " documento " : " documentos ");
      } else descDocs = sappy.format.amount(row.LIQBALANCE) + ", " + row.NUMDOCS + " " + (row.NUMDOCS === 1 ? " documento " : " documentos ");

      return (
        <div id={"PN_" + row.CardCode} className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={e => this.handlePNselection(e, r)}>
          <div className="container vertical-align-middle">
            <div className="row">
              <div className="col-10 text-nowrap firstcol">
                {row.CARDNAME + " (" + row.CardCode + ")"}
              </div>
            </div>
            <div className="row secondrow">
              <div className="col-6 text-nowrap firstcol">
                {descDocs}
              </div>
              <div className="col-6 text-nowrap lastcol">
                <span className="float-right">
                  {sappy.format.amount(row.TOTAL_LIQBALANCE)}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    };

    let getfixedActions = () => {
      let currentShowActions = this.state.showActions;
      let fixedActions = [
        {
          name: "main",
          visible: totalOfSelectedDocs > 0,
          color: "primary",
          icon: currentShowActions ? "icon wb-close animation-fade" : "icon fa-flash",
          onClick: e => this.setState({ showActions: !this.state.showActions })
        },
        {
          name: "Imprimir",
          visible: currentShowActions,
          color: "primary",
          icon: "icon fa-print",
          onClick: e => this.handlePrintDoc()
        }
      ];

      return fixedActions;
    };

    let footerProps = {
      fixedActions: getfixedActions(),

      actions: [
        {
          name: "PagarOuPagar",
          content: (
            <span>
              {totalOfSelectedDocs > 0 ? "Receber " : "Pagar "}
              <strong>
                {sappy.format.amount(Math.abs(totalOfSelectedDocs))}
              </strong>
            </span>
          ),
          color: totalOfSelectedDocs > 0 ? "danger" : "success",
          icon: "icon fa-check",
          visible: totalOfSelectedDocs !== 0,
          onClick: e => {
            return sappy.showToastr({
              color: "danger",
              msg: `Não é permitido emitir recebimentos!`
            });
          }
        }
      ]
    };

    let gridFields = [
      { name: "CheckDate", label: "Dt.Cheque", type: "date", width: 100, editable: false },
      { name: "DeposDate", label: "Dt.Deposito", type: "date", width: 100, editable: false },
      { name: "BankAcct", label: "Conta", type: "text", width: 100, editable: false },
      { name: "DepNum2", label: "Dep Num 2", type: "date", width: 100, editable: false },
      { name: "RcptNum", label: "Nº Recibo", type: "text", width: 100, editable: false },
      { name: "CardCode", label: "Parceiro", type: "text", width: 80, editable: false },
      { name: "CardName", label: "Nome", type: "text", width: 300, editable: false },
      { name: "CheckSum", label: "Montante", type: "amount", width: 100, editable: false },
      { name: "CheckNum", label: "Nº Cheque", type: "text", width: 100, editable: false },
      { name: "BankName", label: "Banco", type: "text", width: 100, editable: false },
      { name: "Status", label: "Estado", type: "text", width: 100, editable: false },
      { name: "Observacoes", label: "Observações", type: "text", width: 300, editable: false }
    ];
    if (selectedPNcodeCli) gridFields.push({ name: "UDEBITO", label: "Débito", type: "discount", width: 60, editable: true });

    return (
      <div>
        <div className="row">
          <div className="col-12">
            <SearchPage2
              ref={node => (this.docsComponent = node)}
              searchApiUrl={`/api/cheques/`}
              onRefresh={this.handleDocRefresh}
              renderRowHeight={35}
              rowKey="CheckKey"
              onRowSelectionChange={this.handleDetailRowSelect}
              selectedKeys={selectedDocKeys}
              onValidateUpdate={(currentRow, updated, callback) => {
                if (updated.hasOwnProperty("UDISC")) {
                  let p = sappy.parseUserDisc(updated.UDISC);
                  let totalDisc = sappy.round(sappy.getNum(currentRow.BaseSum) * p.DiscountPercent / 100, 2) + p.DiscountVal * Math.sign(sappy.getNum(currentRow.BaseSum));
                  if (totalDisc) updated.UDISC = sappy.formatUserDisc(p);
                  else updated.UDISC = "";

                  updated.LIQBALANCE = sappy.getNum(currentRow.BALANCE) - totalDisc;
                }
                if (updated.hasOwnProperty("UDEBITO")) {
                  let p = sappy.parseUserDisc(updated.UDEBITO);
                  let debito = sappy.round(sappy.getNum(currentRow.BaseSum) * p.DiscountPercent / 100, 2) + p.DiscountVal * Math.sign(sappy.getNum(currentRow.BaseSum));
                  updated.UDEBITO = sappy.formatUserDisc(p);
                  updated.DEBITO = debito;
                }

                if (updated.hasOwnProperty("UDEBITO")) updated.UDEBITO = sappy.formatUserDisc(sappy.parseUserDisc(updated.UDEBITO));

                callback && callback({ ...currentRow, ...updated });

                setImmediate(() => {
                  //give time to update row
                  let sel = that.state.selectedDocKeys;
                  let docKey = currentRow.TRANSID_AND_LINEID;
                  if (sel.indexOf(docKey) < 0) {
                    that.setState({ selectedDocKeys: [...sel, docKey] });
                  } else {
                    that.setState({ selectedDocKeys: [...sel] });
                  }
                });
              }}
              height={this.props.height}
              fields={gridFields}
              groupBy={[{ key: "GRUPO", name: "" }]}
              getRowStyle={props => {
                let row = props.row;
                let classes = "";
                if (row.CardType === "C") classes += "has-promo";

                return classes;
              }}
            />
          </div>
        </div>
        {/* <p>{this.state.ctrlKey ? "ctrl" : ""} {this.state.shiftKey ? " shift" : ""}</p> */}
        <CmpFooter {...footerProps} />
      </div>
    );
  }
}

export default CmpPorPagar;
