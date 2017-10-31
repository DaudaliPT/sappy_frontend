import React from "react";
import EditModal from "../Produtos/EditModal";
const sappy = window.sappy;

exports.prepareDocType = function({ tableName }) {
  let objInfo = sappy.b1.sapObjectInfo({ tableName });
  tableName = objInfo.tableName.toLowerCase();
  let objType = objInfo.objectCode.toString();
  let title = objInfo.description;

  let cardCodeLabel = "";
  let cardCodeApi = "";
  let contactLabel = "";
  let dueDateLabel = "15,16,17, 20,21,22".indexOf(objType) > -1 ? "Data Entrega" : "Data Vencimento"; //Encomendas/Entregas/Devoluções
  let footerLimitSearchCondition = "";
  let priceHover = {};
  let numatcardLabel = "";

  cardCodeLabel = "Cliente";
  cardCodeApi = "/api/cbo/ocrd/c";
  contactLabel = "Contato";
  footerLimitSearchCondition = "";
  priceHover = {};
  numatcardLabel = "Ref. Cliente";

  let headerFields = {};
  headerFields.line1 = [];
  headerFields.line1.push({
    name: "CARDCODE",
    label: cardCodeLabel,
    type: "combo",
    api: cardCodeApi,
    gridSize: 6,
    required: true
  });
  headerFields.line2 = [];
  if ("15,16,17, 20,21,22".indexOf(objType) > -1) {
    //Encomendas/Entregas/Devoluções
    headerFields.line2.push({
      name: "SHIPADDR",
      label: "Morada Envio",
      type: "combo",
      api: "/api/cbo/crd1/<CARDCODE>/s",
      gridSize: 4
    });
  } else {
    headerFields.line2.push({
      name: "BILLADDR",
      label: "Morada Faturação",
      type: "combo",
      api: "/api/cbo/crd1/<CARDCODE>/b",
      gridSize: 2
    });
  }
  headerFields.line2.push({
    name: "TAXDATE",
    label: "Data",
    type: "date",
    gridSize: 2,
    required: false
  });
  headerFields.line2.push({
    name: "COMMENTS",
    label: "Observações",
    type: "text",
    gridSize: 5
  });

  let getCellStyle = props => {
    let { column, dependentValues, rowIdx, value } = props;
    let classes = "";
    if (sappy.getNum(dependentValues.PRICE_CHANGED)) classes += " bellow-cost";

    return classes;
  };

  let detailFields = [];
  detailFields.push({
    name: "ITEMNAME",
    label: "Descrição",
    type: "tags",
    width: 400,
    editable: false,
    getCellStyle
  });
  detailFields.push({
    name: "QTCX",
    label: "Cx",
    type: "quantity",
    width: 60,
    editable: true,
    getCellStyle
  });
  detailFields.push({
    name: "QTPK",
    label: "Pk",
    type: "quantity",
    width: 60,
    editable: true,
    getCellStyle
  });
  detailFields.push({
    name: "QTSTK",
    label: "Qtd",
    type: "quantity",
    width: 60,
    editable: true,
    getCellStyle
  });
  detailFields.push({
    name: "QTBONUS",
    label: "Qt.Bónus",
    type: "bonus",
    width: 120,
    editable: true,
    getCellStyle
  });
  detailFields.push({
    name: "PRICE",
    label: "Preço",
    type: "price",
    width: 70,
    editable: true,
    hover: priceHover,
    getCellStyle
  });
  detailFields.push({
    name: "USER_DISC",
    label: "Descontos",
    type: "text",
    width: 120,
    editable: true,
    getCellStyle
  });
  detailFields.push({
    name: "VATGROUP",
    label: "IVA",
    type: "vatpercent",
    width: 40,
    editable: false,
    getCellStyle
  });

  return {
    priceHover,
    propsToPosBase: {
      tableName,
      objType,
      title,
      headerFields,
      detailFields,
      apiDocsNew: `/api/docs/new/${tableName}`,
      footerSearchType: "oitm",
      footerSearchShowCatNum: true,
      footerLimitSearchCondition
    }
  };
};
