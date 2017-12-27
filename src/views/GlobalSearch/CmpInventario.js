import React, { Component } from "react";
import GlobalSearchPage from "./GlobalSearchPage";
// import { Badge } from "reactstrap";
// import uuid from "uuid/v4";

const sappy = window.sappy;

class CmpInventario extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const renderRow = ({ row, index }) => {
      let rowId = "row_" + row.DocEntry;
      // const selected = rowId === selectedRowId;
      let rowStyleClass = "";
      let r = { ...row };
      // if (selected) rowStyleClass += " sappy-selected-row";

      return (
        <div id={rowId} className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={e => this.handleRowselection(e, r)}>
          <div className="container vertical-align-middle">
            <div className="row">
              <div className="col-2 text-nowrap firstcol">
                {sappy.format.datetime2(row.DOC_DATETIME)}
              </div>
              <div className="col-2 text-nowrap ">
                {row.DESCDOC + " " + row.DocNum}
              </div>
              <div className="col-6 text-nowrap ">
                {row.WhsCode + " - " + row.WhsName}
              </div>
              <div className="col-2 text-nowrap lastcol">
                <span className="float-right">
                  {/* {sappy.format.amount(row.DocTotal)} */}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <GlobalSearchPage
        onTabStatusUpdate={newState => this.props.onTabStatusUpdate("inventario", newState)}
        searchTags={this.props.searchTags}
        searchText={this.props.searchText}
        searchApiUrl={this.props.searchApiUrl}
        noRecordsMessage="Nenhum movimento de inventário encontrado"
        renderRow={renderRow}
        renderRowHeight={50}
      />
    );
  }
}
CmpInventario.defaultProps = {
  onTabStatusUpdate: newState => {}
};
export default CmpInventario;
