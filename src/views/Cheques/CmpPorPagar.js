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

    this.handleDetailRowSelect = this.handleDetailRowSelect.bind(this);
    this.handleDocRefresh = this.handleDocRefresh.bind(this);

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

  handleDetailRowSelect(selectedDocKeys) {
    this.setState({
      selectedDocKeys,
      showActions: false
    });
  }

  handleDocRefresh(e) {
    this.setState({ selectedDocKeys: [] });
  }

  render() {
    let that = this;
    let { selectedDocKeys } = this.state;
    let docsList = [];
    if (this.docsComponent) {
      docsList = this.docsComponent.state.listItems;
    }

    let selStatus = "";

    let totalOfSelectedDocs = 0;

    // É importante preservar a ordem de seleção para o caso de pagamento parciais
    let selectedDocs = selectedDocKeys.map(docKey => docsList.find(doc => doc.CheckKey === docKey));
    selectedDocs.forEach(doc => {
      if (selStatus === "") selStatus = doc.STATUS;
      if (selStatus !== "?" && selStatus !== doc.STATUS) selStatus = "?";

      totalOfSelectedDocs += sappy.getNum(doc.CheckSum);
    });

    let getfixedActions = () => {
      let currentShowActions = this.state.showActions;
      let fixedActions = [
        {
          name: "main",
          visible: false,
          // totalOfSelectedDocs > 0,
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
          name: "Devolver ao Cliente",
          color: "warning",
          icon: "icon fa-exclamation",
          visible: selStatus === "Em carteira",
          onClick: e => {
            selectedDocs.forEach(doc => {
              doc.U_apyDTSTATUS = sappy.moment();
              axios.post(`/api/cheques/updatestatus/${doc.CheckKey}`, { status: "3-Devolvido ao Cliente" }).catch(error => sappy.showError(error, "Não foi possivel gravar status"));
            });
          }
        },
        {
          name: "Depositar",
          color: "success",
          icon: "icon fa-check",
          visible: selStatus === "Em carteira",
          onClick: e => {
            selectedDocs.forEach(doc => {
              doc.U_apyDTSTATUS = sappy.moment();
              axios.post(`/api/cheques/updatestatus/${doc.CheckKey}`, { status: "1-Em transito" }).catch(error => sappy.showError(error, "Não foi possivel gravar status"));
            });
          }
        },
        {
          name: "Selecionado",
          content: (
            <span>
              {"Total "}
              <strong>
                {sappy.format.amount(Math.abs(totalOfSelectedDocs))}
              </strong>
            </span>
          ),
          color: "dark",
          visible: totalOfSelectedDocs > 0
        }
      ]
    };

    let gridFields = [
      { name: "CheckDate", label: "Dt.Cheque", type: "date", width: 100, editable: false },
      { name: "DIAS", label: "Dias", type: "text", width: 50, editable: false },
      // { name: "BankAcct", label: "Conta", type: "text", width: 100, editable: false },
      { name: "RcptNum", label: "Nº Recibo", type: "text", width: 100, editable: false },
      { name: "PARCEIRO", label: "Parceiro", type: "text", width: 300, editable: false },
      { name: "CheckSum", label: "Montante", type: "amount", width: 100, editable: false },
      { name: "CheckNum", label: "Nº Cheque", type: "text", width: 100, editable: false },
      { name: "BankName", label: "Banco", type: "text", width: 100, editable: false },
      { name: "STATUS", label: "Status", type: "text", width: 100, editable: false },
      { name: "U_apyDTSTATUS", label: "Dt.Status", type: "date", width: 100, editable: false },
      { name: "U_apyOBS", label: "Observações", type: "text", width: 300, editable: true },
      { name: "DeposDate", label: "Dt.Pago", type: "date", width: 100, editable: false }
    ];
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
                if (updated.hasOwnProperty("U_apyOBS")) {
                  //Save it to DB
                  updated.U_apyDTSTATUS = sappy.moment();
                  axios.post(`/api/cheques/updateobs/${currentRow.CheckKey}`, { obs: updated.U_apyOBS }).catch(error => sappy.showError(error, "Não foi possivel gravar descrição"));
                }
              }}
              height={this.props.height}
              fields={gridFields}
              groupBy={[{ key: "STATUS", name: "" }]}
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
