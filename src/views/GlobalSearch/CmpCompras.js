import React, { Component } from "react";
import GlobalSearchPage from "./GlobalSearchPage";

const sappy = window.sappy;

class CmpCompras extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const renderRow = ({ row, index }) => {
      let rowStyleClass = "";
      if (row.ObjType === "19") rowStyleClass = "vlist-row-danger";
      if (row.ObjType === "21") rowStyleClass = "vlist-row-danger";
      return (
        <div className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={this.handleRowSelection}>
          <div className="container vertical-align-middle">
            {/*large displays*/}
            <div className="row hidden-lg-down">
              <div className="col-2 text-nowrap firstcol">
                {sappy.format.date(row.DOC_DATETIME)}
              </div>
              <div className="col-2 text-nowrap">
                {sappy.GetLinkTo(row.ObjType, row.DocEntry)}
                {row.DESCDOC + " " + row.DocNum}
              </div>
              <div className="col-6 text-truncate" title={row.CardCode + " - " + row.CardName}>
                {sappy.GetLinkTo("2", row.CardCode)}
                {row.CardCode + " - " + row.CardName}
              </div>
              <div className="col-2 text-nowrap lastcol">
                <span className="float-right">
                  {row.FORMATED_DOCTOTAL}
                </span>
              </div>
            </div>

            {/*mobile*/}
            <div className="hidden-xl-up">
              <div className="row">
                <div className="col text-nowrap">
                  {row.CardCode + " - " + row.CardName}
                </div>
              </div>
              <div className="row secondrow">
                <div className="col-3 text-nowrap firstcol">
                  {sappy.format.date(row.DOC_DATETIME)}
                </div>
                <div className="col-6 text-nowrap">
                  {sappy.GetLinkTo(row.ObjType, row.DocEntry)}
                  {row.DESCDOC + " " + row.DocNum}
                </div>
                <div className="col-3 text-nowrap lastcol">
                  <span className="float-right">
                    {row.FORMATED_DOCTOTAL}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <GlobalSearchPage
        onTabStatusUpdate={newState => this.props.onTabStatusUpdate("compras", newState)}
        searchTags={this.props.searchTags}
        searchText={this.props.searchText}
        searchApiUrl={this.props.searchApiUrl}
        noRecordsMessage="Nenhum documento de venda encontrado"
        renderRow={renderRow}
        renderRowHeight={50}
      />
    );
  }
}
CmpCompras.defaultProps = {
  onTabStatusUpdate: newState => {}
};
export default CmpCompras;
