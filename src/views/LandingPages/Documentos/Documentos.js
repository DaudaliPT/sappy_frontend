let Documentos = {
  //Vendas
  odln: require("./LpVendas/odln.js").default,
  oinv: require("./LpVendas/oinv.js").default,
  ordn: require("./LpVendas/ordn.js").default,
  ordr: require("./LpVendas/ordr.js").default,
  orin: require("./LpVendas/orin.js").default,
  //Compras
  opor: require("./LpCompras/opor.js").default,
  opdn: require("./LpCompras/opdn.js").default,
  orpd: require("./LpCompras/orpd.js").default,
  opch: require("./LpCompras/opch.js").default,
  orpc: require("./LpCompras/orpc.js").default
};
export default Documentos;
