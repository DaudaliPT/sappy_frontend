let Documentos = {
  //Vendas
  odln: require("./Vendas/odln.js").default,
  oinv: require("./Vendas/oinv.js").default,
  ordn: require("./Vendas/ordn.js").default,
  ordr: require("./Vendas/ordr.js").default,
  orin: require("./Vendas/orin.js").default,
  //Compras
  opor: require("./Compras/opor.js").default,
  opdn: require("./Compras/opdn.js").default,
  orpd: require("./Compras/orpd.js").default,
  opch: require("./Compras/opch.js").default,
  orpc: require("./Compras/orpc.js").default
};
export default Documentos;
