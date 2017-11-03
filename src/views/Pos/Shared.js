// import React from "react";
// import EditModal from "../Produtos/EditModal";
const sappy = window.sappy;

exports.prepareDocType = function({ tableName }) {
  let objInfo = sappy.b1.sapObjectInfo({ tableName });
  tableName = objInfo.tableName.toLowerCase();
  let objType = objInfo.objectCode.toString();
  let title = objInfo.description;

  let cardCodeLabel = "";
  let cardCodeApi = "";
  let footerLimitSearchCondition = "";

  cardCodeLabel = "Cliente";
  cardCodeApi = "/api/cbo/ocrd/c";
  footerLimitSearchCondition = "";

  let headerFields = {};
  headerFields.line1 = [];
  headerFields.line1.push({
    name: "CARDCODE",
    label: cardCodeLabel,
    type: "combo",
    api: cardCodeApi,
    gridSize: 8,
    required: true
  });
  if ("15,16,17, 20,21,22".indexOf(objType) > -1) {
    //Encomendas/Entregas/Devoluções
    headerFields.line1.push({
      name: "SHIPADDR",
      label: "Morada Envio",
      type: "combo",
      api: "/api/cbo/crd1/<CARDCODE>/s",
      gridSize: 4
    });
  } else {
    headerFields.line1.push({
      name: "BILLADDR",
      label: "Morada Faturação",
      type: "combo",
      api: "/api/cbo/crd1/<CARDCODE>/b",
      gridSize: 4
    });
  }

  headerFields.icons = [];
  headerFields.icons.push({ name: "DISTRIBUICAO", label: "Distribuição", type: "iconToggle", ON: "fa-truck success", OFF: "fa-truck secondary" });
  headerFields.icons.push({ name: "HAPPYDAY", label: "Happy Day", type: "iconToggle", ON: "fa-tag success", OFF: "fa-tag secondary" });
  headerFields.icons.push({ name: "MATRICULA", label: "Matricula", gridSize: 6, type: "iconEdit", ON: "fa-road success", OFF: "fa-road secondary" });
  headerFields.icons.push({ name: "COMMENTS", label: "Observações", gridSize: 12, type: "iconEdit", ON: "fa-info-circle success", OFF: "fa-info-circle secondary" });

  let detailFields = [
    { name: "ITEMNAME", label: "Descrição", type: "tags", width: 400, editable: false },
    { name: "QTCX", label: "Cx", type: "quantity", width: 60, editable: true },
    { name: "QTPK", label: "Pk", type: "pkpos", width: 60, editable: true },
    { name: "QTSTK", label: "Qtd", type: "quantity", width: 60, editable: true },
    { name: "QTBONUS", label: "Qt.Bónus", type: "bonus", width: 100, editable: true },
    {
      name: "PRICE",
      label: "Preço",
      type: "price",
      width: 80,
      editable: true,
      getCellStyle: props => {
        let classes = "";
        if (props.dependentValues.PRICE_CHANGEDBY) classes += " has-been-changed";
        return classes;
      }
    },
    {
      name: "USER_DISC",
      label: "Descontos",
      type: "text",
      width: 120,
      editable: true,
      getCellStyle: props => {
        let classes = "";
        if (props.dependentValues.DISC_CHANGEDBY) classes += " has-been-changed";
        return classes;
      }
    },
    { name: "VATGROUP", label: "IVA", type: "vatpercent", width: 40, editable: false }
  ];

  return {
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
