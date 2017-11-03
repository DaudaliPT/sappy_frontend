import React, { Component } from "react";
// import { Button } from "reactstrap";

// import { TextBoxNumeric } from "../../../Inputs";
const sappy = window.sappy;

class PosFooter extends Component {
  render() {
    // let docData = this.props.docData || {};
    let totals = this.props.totals;

    return (
      <div id="posTotal" className="container">
        <div className="row">
          <div className="col">Mercadoria</div>
          <div className="col">
            <span className="float-right">
              {sappy.format.amount(totals.grossAmmount)}
            </span>
          </div>
        </div>
        <div className="row">
          <div className="col">Desc.Linha</div>
          <div className="col">
            <span className="float-right">
              {sappy.format.amount(totals.discountAmmount)}
            </span>
          </div>
        </div>
        <div className="row">
          <div className="col">Valor Líquido</div>
          <div className="col">
            <span className="float-right">
              {sappy.format.amount(totals.liquidAmount)}
            </span>
          </div>
        </div>

        <div className="row">
          <div className="col">IVA</div>
          <div className="col">
            <span className="float-right">
              {sappy.format.amount(totals.vatAmount)}
            </span>
          </div>
        </div>

        <hr />
        <div className="row total changed">
          <div className="col-4">TOTAL</div>
          <div className="col-8">
            <span className="float-right">
              {sappy.format.amount(sappy.getNum(totals.totalAmount))}
            </span>
          </div>
        </div>
      </div>
    );
  }
}

PosFooter.defaultProps = {
  footerSearchType: "",
  totals: {}
};

export default PosFooter;
