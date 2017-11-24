import React from "react";
import EditModal from "../Produtos/EditModal";
const sappy = window.sappy;

exports.prepareDocType = function({ tableName, module }) {
  let objInfo = sappy.b1.sapObjectInfo({ tableName });
  tableName = objInfo.tableName.toLowerCase();
  let objType = objInfo.objectCode.toString();
  let title = objInfo.description;

  let cardCodeLabel = "";
  let cardCodeApi = "";
  let contactLabel = "";
  let dueDateLabel = "15,16,17,23, 20,21,22".indexOf(objType) > -1 ? "Data Entrega" : "Data Vencimento"; //Encomendas/Entregas/Devoluções
  let footerBaseDocLinesCondition = "";
  let footerSearchLimitCondition = "";
  let priceHover = {};
  let contractHover = {};
  let numatcardLabel = "";

  if ("13,14,15,16,17,23".indexOf(objType) > -1) {
    //Vendas
    cardCodeLabel = "Cliente";
    cardCodeApi = "/api/cbo/ocrd/c";
    contactLabel = "Contato";
    footerSearchLimitCondition = "";
    priceHover = {};
    numatcardLabel = "Ref. Cliente";

    // as cotações não se podem basear em documentos
    if (objType !== "23")
      footerBaseDocLinesCondition = `
          BASEDOC."CardCode"='<CARDCODE>' 
      AND BASEDOC."ShipToCode"='<SHIPADDR>' 
      AND BASEDOC."QTYSTK_AVAILABLE">0 `;
  } else if ("18,19,20,21,22".indexOf(objType) > -1) {
    // as encomendas de compra não se podem basear em documentos
    if (objType !== "22")
      footerBaseDocLinesCondition = `
            BASEDOC."CardCode"='<CARDCODE>' 
        AND BASEDOC."ShipToCode"='<SHIPADDR>' 
        AND BASEDOC."QTYSTK_AVAILABLE">0 `;
    //Compras
    cardCodeLabel = "Fornecedor";
    cardCodeApi = "/api/cbo/ocrd/s";
    contactLabel = "Contato/Sub.For";
    footerSearchLimitCondition = `OITM."CardCode"='<CARDCODE>' AND 1= CASE WHEN OCRD."U_apyITMCNT"='Y' THEN CASE WHEN CASE WHEN OITM."FirmCode"=-1 THEN 'null' ELSE  OMRC."FirmName" END = '<CONTACT>' THEN 1 ELSE 0 END  ELSE 1 END`; //<CONTACT> vazio retorna null

    priceHover = {
      api: "api/prod/info/<ITEMCODE>/upc",
      render: ({ result, context }) => {
        let content = [];

        if (result.data.length === 0)
          content.push(
            <tr>
              <td>Nenhum histórico</td>
            </tr>
          );
        else {
          content.push(
            <tr>
              <td>Data</td>
              <td>Fornecedor</td>
              <td>Preço</td>
              <td>Pr.NET</td>
            </tr>
          );
          result.data.forEach(popuprow => {
            content.push(
              <tr>
                <td>
                  {sappy.format.date(popuprow.DocDate)}
                </td>
                <td style={{ maxWidth: "130px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {popuprow.CardName}
                </td>
                <td>
                  {sappy.format.price(popuprow.PUR_PRICE, 3)}
                </td>
                <td>
                  {sappy.format.price(popuprow.PRCNET, 3)}
                </td>
              </tr>
            );
          });
        }
        return (
          <table>
            {content}
          </table>
        );
      }
    };

    contractHover = {
      api: "api/contratos/doc/<CONTRATO>",
      render: ({ result, context }) => {
        let content = [];

        let lines = result.data.LINES || [];
        lines.forEach(line => {
          if (line.TIPO === "DC" && line.DESCRICAO) {
            content.push(
              <tr>
                <td>Descontos comerciais:</td>
              </tr>
            );
            content.push(
              <tr>
                <td style={{ maxWidth: "130px" }}>
                  {line.DESCRICAO}
                </td>
              </tr>
            );
          }
        });
        if (content.length === 0) return null;

        return (
          <table>
            {content}
          </table>
        );
      }
    };
    numatcardLabel = "Ref. Fornecedor";
  }

  if ("14".indexOf(objType) > -1) {
    let settings = sappy.getSettings(["VND.ORIN.MAXDIASTODEV"]);
    let MAXDIASTODEV = sappy.getNum(settings["VND.ORIN.MAXDIASTODEV"]);

    footerBaseDocLinesCondition = `
          BASEDOC."CardCode"='<CARDCODE>' 
      AND BASEDOC."ShipToCode"='<SHIPADDR>' 
      AND BASEDOC."QTYSTK_AVAILABLE">0
      AND BASEDOC."DocDate" > ADD_DAYS(CURRENT_DATE, -${MAXDIASTODEV})`;
  }

  const DESCDEBOP_options = [
    { value: "P", label: "Pagamento" },
    { value: "M", label: "Mensal" },
    { value: "T", label: "Trimestral" },
    { value: "S", label: "Semestral" },
    { value: "-", label: "Anual", type: "group" },
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "11", label: "Dezembro" }
  ];

  let headerFields = {};
  headerFields.line1 = [];
  headerFields.line1.push({ name: "CARDCODE", label: cardCodeLabel, type: "combo", api: cardCodeApi, gridSize: 6, required: true });
  headerFields.line1.push({ name: "DOCSERIES", label: "Série", type: "combo", api: "/api/cbo/nnm1/" + objType, gridSize: 4, required: true });
  headerFields.line1.push({ name: "TAXDATE", label: "Data Documento", type: "date", gridSize: 2, required: true });
  headerFields.line1.push({ name: "DOCDUEDATE", label: dueDateLabel, type: "date", gridSize: 2, required: true, savedEditable: true });
  headerFields.line2 = [];
  if ("15,16,17 20,21,22".indexOf(objType) > -1) {
    //Encomendas/Entregas/Devoluções
    headerFields.line2.push({ name: "SHIPADDR", label: "Morada Envio", type: "combo", api: "/api/cbo/crd1/<CARDCODE>/s", gridSize: 4 });
  } else {
    headerFields.line2.push({ name: "BILLADDR", label: "Morada Faturação", type: "combo", api: "/api/cbo/crd1/<CARDCODE>/b", gridSize: 2 });
  }
  headerFields.line2.push({ name: "CONTACT", label: contactLabel, type: "combo", api: "/api/cbo/ocpr/<CARDCODE>", gridSize: 2 });

  if ("18".indexOf(objType) > -1) {
    // Faturas de compra é obrigatório
    headerFields.line2.push({ name: "NUMATCARD", label: numatcardLabel, type: "text", gridSize: 2, required: true });
  } else {
    headerFields.line2.push({ name: "NUMATCARD", label: numatcardLabel, type: "text", gridSize: 2, required: false });
  }
  headerFields.line2.push({ name: "COMMENTS", label: "Observações", type: "text", gridSize: 5, savedEditable: true });
  headerFields.line2.push({ name: "HASINCONF", label: "", type: "flag|danger", gridSize: 1, savedEditable: true });

  let sidebarFields = {};
  if ("18".indexOf(objType) > -1) {
    //Compras
    sidebarFields.line0 = [];
    sidebarFields.line0.push({ name: "CONTRATO", label: "Regras Contratuais", type: "combo", api: "/api/docs/new/contratos/<CARDCODE>/<CONTACT>/<TAXDATE>", width: "100%", hover: contractHover });

    // sidebarFields.line1 = [];
    // sidebarFields.line1.push({ name: 'DESCCOM', label: 'Desc. Comercial', type: "text", width: "100%" })
    sidebarFields.line2 = [];
    sidebarFields.line2.push({ name: "DESCFIN", label: "Desc. Financeiro", type: "text", width: "calc(100% - 35px)" });
    sidebarFields.line2.push({ name: "DESCFINAC", label: " ", type: "check|success", width: "35px" });
    sidebarFields.line3 = [];
    sidebarFields.line3.push({ name: "DESCDEB", label: "Desc. em Débito", type: "text", width: "calc(100% - 35px)" });
    sidebarFields.line3.push({ name: "DESCDEBAC", label: " ", type: "check|success", width: "35px" });
    sidebarFields.line4 = [];
    sidebarFields.line4.push({ name: "DESCDEBPER", label: "Tipo débito:", type: "combo", width: "100%", options: DESCDEBOP_options });
    sidebarFields.line5 = [];
    sidebarFields.line5.push({ name: "DESCNET", label: "Total Desc. NET", type: "percent", width: "100%", disabled: true });
  }

  let detailFields = [];
  // detailFields.push({ name: 'LINENUM', label: '#', type: "text", width: 40, editable: false })
  // detailFields.push({ name: 'ITEMCODE', label: 'Artigo', type: "text", width: 220, editable: false, dragable: false, onLinkClick: this.handleItemcodeLinkClick })
  detailFields.push({
    name: "CATNUM_OR_ITEMCODE",
    label: "Catálogo",
    type: "text",
    width: 100,
    editable: false,
    dragable: false,
    onLinkClick: props => sappy.showModal(<EditModal toggleModal={sappy.hideModal} itemcode={props.dependentValues.ITEMCODE} />)
  });
  detailFields.push({ name: "ITEMNAME", label: "Descrição", type: "tags", width: 400, editable: true });
  detailFields.push({ name: "QTCX", label: "Cx", type: "quantity", width: 60, editable: true });
  detailFields.push({ name: "QTPK", label: "Pk", type: "quantity", width: 60, editable: true });
  detailFields.push({ name: "QTSTK", label: "Qtd", type: "quantity", width: 60, editable: true });
  detailFields.push({ name: "QTBONUS", label: "Qt.Bónus", type: "bonus", width: 120, editable: true });
  // detailFields.push({ name: 'BONUS_NAP', label: 'NAP', type: "check", width: 40, editable: true })
  detailFields.push({ name: "PRICE", label: "Preço", type: "price", width: 70, editable: true, hover: priceHover });
  detailFields.push({ name: "USER_DISC", label: "Descontos", type: "text", width: 120, editable: true });
  detailFields.push({ name: "LINETOTAL", label: "Total", width: 90, type: "amount", editable: true });
  // detailFields.push({ name: 'LINETOTALBONUS', label: 'TotalB', width: 90, type: "amount", editable: true })
  detailFields.push({ name: "VATGROUP", label: "IVA", type: "vat", width: 70, editable: true });
  // detailFields.push({ name: 'WHSCODE', label: 'Arm', type: "text", width: 50, editable: true })
  detailFields.push({ name: "HASINCONF", label: "", type: "flag|danger", width: 35, editable: true });
  if ("18".indexOf(objType) > -1) {
    //Compras
    detailFields.push({ name: "NETPRICE", label: "Pr.NET", width: 70, type: "price", editable: false });
  }
  // detailFields.push({ name: 'NETTOTAL', label: 'V.NET', width: 70, type: "amount", editable: false })
  // detailFields.push({ name: 'NETTOTALBONUS', label: 'V.NET.BONUS', width: 70, type: "amount", editable: false })

  return {
    priceHover,
    contractHover,
    DESCDEBOP_options,
    propsToDocBase: {
      tableName,
      objType,
      module,
      title,
      headerFields,
      sidebarFields,
      detailFields,
      apiDocsNew: `/api/docs/new/${tableName}`,
      apiDocsEdit: `/api/docs/edit/${tableName}`,

      footerSearchType: "oitm",
      footerSearchShowCatNum: true,
      footerSearchLimitCondition,
      footerBaseDocLinesCondition
    }
  };
};
