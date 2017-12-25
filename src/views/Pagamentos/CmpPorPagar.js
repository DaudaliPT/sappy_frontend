import React, { Component } from "react";
import axios from "axios";
import SearchPage from "../../components/SearchPage";
import SearchPage2 from "../../components/SearchPage2";

// import { Badge } from "reactstrap";
// import uuid from "uuid/v4";
const sappy = window.sappy;
const $ = window.$;
import CmpFooter from "./CmpFooter";
import ModalMeiosPagPagamento from "../CaixaCentral/ModalMeiosPagPagamento";

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
    let { selectedPN, selectedPNname } = this.state;
    if (selectedPN === cardCode) {
      selectedPN = "";
      selectedPNname = "";
    } else {
      selectedPN = cardCode;
      selectedPNname = row.CARDNAME;
    }

    this.setState({ selectedPN, selectedPNname, selectedDocKeys: [] });
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
    let { selectedPN, selectedPNname, selectedDocKeys } = this.state;
    let docsList = [];
    if (this.docsComponent) {
      docsList = this.docsComponent.state.listItems;
    }

    let totalOfSelectedDocs = 0;

    // É importante preservar a ordem de seleção para o caso de pagamento parciais
    let selectedDocs = selectedDocKeys.map(docKey => docsList.find(doc => doc.TRANSID_AND_LINEID === docKey));
    selectedDocs.forEach(doc => {
      totalOfSelectedDocs += sappy.getNum(doc.LIQBALANCE);
    });

    let renderRowPN = ({ row, index }) => {
      const selected = row.CARDCODE === selectedPN;
      let rowStyleClass = "";
      let r = { ...row };
      if (selected) rowStyleClass += " sappy-selected-row";

      let descDocs;
      if (sappy.getNum(row.LIQBALANCE) === sappy.getNum(row.TOTAL_LIQBALANCE)) {
        descDocs = row.NUMDOCS + " " + (row.NUMDOCS === 1 ? " documento " : " documentos ");
      } else descDocs = sappy.format.amount(row.LIQBALANCE) + ", " + row.NUMDOCS + " " + (row.NUMDOCS === 1 ? " documento " : " documentos ");

      return (
        <div id={"PN_" + row.CARDCODE} className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={e => this.handlePNselection(e, r)}>
          <div className="container vertical-align-middle">
            <div className="row">
              <div className="col-10 text-nowrap firstcol">
                {row.CARDNAME + " (" + row.CARDCODE + ")"}
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
            return sappy.showModal(
              <ModalMeiosPagPagamento
                toggleModal={({ success } = {}) => {
                  if (success) {
                    //force refresh
                    let selectedPN = this.state.selectedPN;
                    this.setState({ selectedPN: "", selectedDocKeys: [] }, () => setTimeout(this.setState({ selectedPN }), 1));
                  }

                  sappy.hideModal();
                }}
                selectedPN={selectedPN}
                selectedPNType="S"
                selectedPNname={selectedPNname}
                selectedDocs={selectedDocs}
                totalPagar={totalOfSelectedDocs}
              />
            );
          }
        }
      ]
    };

    return (
      <div>
        <div className="row">
          <div className="col-4">
            <SearchPage
              ref={node => (this.pnComponent = node)}
              searchApiUrl={`/api/caixa/pagar/pn`}
              autoRefreshTime={5000}
              renderRow={renderRowPN}
              placeholder={"Pesquisar o fornecedor"}
              renderRowHeight={50}
            />
          </div>
          <div className="col-8">
            <SearchPage2
              ref={node => (this.docsComponent = node)}
              searchApiUrl={`/api/caixa/pagar/docs?cardcode=${selectedPN}`}
              noRecordsMessage="Selecione primeiro um fornecedor"
              onRefresh={this.handleDocRefresh}
              renderRowHeight={35}
              rowKey="TRANSID_AND_LINEID"
              onRowSelectionChange={this.handleDetailRowSelect}
              selectedKeys={selectedDocKeys}
              onValidateUpdate={(currentRow, updated) => {
                if (updated.hasOwnProperty("UDISC")) {
                  let p = sappy.parseUserDisc(updated.UDISC);
                  let totalDisc = sappy.round(sappy.getNum(currentRow.BaseSum) * p.DiscountPercent / 100, 2) + p.DiscountVal * Math.sign(sappy.getNum(currentRow.BaseSum));
                  // if (p.DiscountPercent) p.RESULT = totalDisc;
                  updated.UDISC = sappy.formatUserDisc(p);
                  updated.LIQBALANCE = sappy.getNum(currentRow.BALANCE) - totalDisc;
                }

                if (updated.hasOwnProperty("UDEBITO")) updated.UDEBITO = sappy.formatUserDisc(sappy.parseUserDisc(updated.UDEBITO));

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
              fields={[
                { name: "REFDATE", label: "Data", type: "date", width: 80, editable: false },
                { name: "DUEDATE", label: "Venc", type: "date", width: 80, editable: false },
                {
                  name: "DOCUMENTO",
                  label: "Documento",
                  type: "text",
                  width: 120,
                  editable: false,
                  onLinkClick: props => sappy.LinkTo(props.dependentValues.TransType, props.dependentValues.CreatedBy)
                },
                // { name: "DOCTOTAL", label: "Total", type: "amount", width: 60, editable: false },
                // { name: "BaseSum", label: "BaseSum", type: "amount", width: 60, editable: false },
                { name: "BALANCE", label: "Em aberto", type: "amount", width: 80, editable: false },
                { name: "UDISC", label: "Desconto", type: "discount", width: 60, editable: true },
                { name: "LIQBALANCE", label: "Pagar", type: "amount", width: 80, editable: false },
                {
                  name: "CONTRATO",
                  label: "Contrato",
                  type: "dropdown",
                  width: 100,
                  editable: true,
                  options: ["", { id: 1, value: "Urbino" }, { id: 4, value: "Nuno" }]
                },
                { name: "UDEBITO", label: "Débito", type: "discount", width: 60, editable: true }
              ]}
              groupBy={[{ key: "GRUPO", name: "" }]}
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
