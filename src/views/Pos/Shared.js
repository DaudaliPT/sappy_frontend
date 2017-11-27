import React from "react";
// import EditModal from "../Produtos/EditModal";
const sappy = window.sappy;

exports.prepareDocType = function({ tableName }) {
  let objInfo = sappy.b1.sapObjectInfo({ tableName });
  tableName = objInfo.tableName.toLowerCase();
  let objType = objInfo.objectCode.toString();
  let title = objInfo.description;

  let cardCodeLabel = "Cliente";
  let cardCodeApi = "/api/cbo/ocrd/c";
  let footerSearchLimitCondition = "";
  let footerBaseDocLinesCondition = "";
  let footerSearchType = "oitmpos";
  if ("14".indexOf(objType) > -1) {
    let settings = sappy.getSettings(["VND.ORIN.MAXDIASTODEV"]);
    let MAXDIASTODEV = sappy.getNum(settings["VND.ORIN.MAXDIASTODEV"]);

    footerBaseDocLinesCondition = `
          BASEDOC."CardCode"='<CARDCODE>' 
      AND BASEDOC."ShipToCode"='<SHIPADDR>' 
      AND BASEDOC."QTYSTK_AVAILABLE">0
      AND BASEDOC."DocDate" > ADD_DAYS(CURRENT_DATE, -${MAXDIASTODEV})`;
  }

  let headerFields = {};
  headerFields.line1 = [];
  headerFields.line1.push({ name: "CARDCODE", label: cardCodeLabel, type: "combo", api: cardCodeApi, gridSize: 8, required: true });
  headerFields.line1.push({ name: "SHIPADDR", label: "Morada Envio", type: "combo", api: "/api/cbo/crd1/<CARDCODE>/s", required: true, gridSize: 4 });

  headerFields.icons = [];
  headerFields.icons.push({ name: "DISTRIBUICAO", label: "Distribuição", type: "iconToggle", ON: "fa-truck success", OFF: "fa-truck secondary" });
  headerFields.icons.push({ name: "HAPPYDAY", label: "Happy Day", type: "iconToggle", ON: "fa-tag success", OFF: "fa-tag secondary" });
  headerFields.icons.push({ name: "MATRICULA", label: "Matricula", gridSize: 6, type: "iconEdit", ON: "fa-road success", OFF: "fa-road secondary" });
  headerFields.icons.push({ name: "COMMENTS", label: "Observações", gridSize: 12, type: "iconEdit", ON: "fa-info-circle success", OFF: "fa-info-circle secondary" });

  let itemHover = {
    api: "api/prod/item/<ITEMCODE>",
    placement: "right",
    render: ({ result, context }) => {
      let content = [];

      content.push(
        <tr>
          <td>
            {"Código: " + result.data.Item.ItemCode}
          </td>
        </tr>
      );
      result.data.Item.ItemBarCodeCollection.forEach(popuprow => {
        content.push(
          <tr>
            <td>
              {popuprow.Barcode + " (PK" + popuprow.FreeText + ")"}
            </td>
          </tr>
        );
      });
      return (
        <table>
          {content}
        </table>
      );
    }
  };

  let detailFields = [
    { name: "ITEMNAME", label: "Descrição", type: "tags", width: 400, editable: false, hover: itemHover },
    { name: "QTCX", label: "Cx", type: "quantity", width: 60, editable: true },
    { name: "QTPK", label: "Pk", type: "pkpos", width: 60, editable: true },
    { name: "QTSTK", label: "Qtd", type: "quantity", width: 60, editable: true },
    {
      name: "PRICE",
      label: "Preço",
      type: "price",
      width: 80,
      editable: "14".indexOf(objType) > -1 ? false : true,
      getCellStyle: props => {
        let classes = "";
        if (props.dependentValues.PRICE_CHANGEDBY) classes += " has-been-changed";
        return classes;
      }
    },

    // { name: "LINETOTAL", label: "Total", type: "amount", width: 80, editable: false },
    // { name: "IDPROMO", label: "Promo", type: "text", width: 50, editable: false },
    {
      name: "USER_DISC",
      label: "Descontos",
      type: "text",
      width: 120,
      editable: "14".indexOf(objType) > -1 ? false : true,
      getCellStyle: props => {
        let classes = "";
        if (props.dependentValues.DISC_CHANGEDBY) classes += " has-been-changed";
        return classes;
      }
    },
    { name: "VATGROUP", label: "IVA", type: "vatpercent", width: 40, editable: false },
    {
      name: "PLVP",
      label: "Pr. c/Iva",
      type: "price",
      width: 80,
      editable: false
    }
    // { name: "BASE_OBJTYPE", label: "T", type: "text", width: 40, editable: false },
    // { name: "BASE_DOCENTRY", label: "E", type: "text", width: 40, editable: false },
    // { name: "BASE_LINENUM", label: "L", type: "text", width: 40, editable: false },
    // { name: "BASE_DOCNUM", label: "N", type: "text", width: 40, editable: false }
  ];

  return {
    propsToPosBase: {
      tableName,
      objType,
      title,
      headerFields,
      detailFields,
      apiDocsNew: `/api/docs/new/${tableName}`,
      footerSearchType,
      footerSearchShowCatNum: false,
      footerSearchLimitCondition,
      footerBaseDocLinesCondition
    }
  };
};

// useBaseDoclines: false,
// baseDocLinesCondition: "",
// onToogleUseBaseDoclines: () => {},
