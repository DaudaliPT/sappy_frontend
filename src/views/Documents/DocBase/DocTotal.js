
import React, { Component } from "react";
// import { Button } from "reactstrap";

import { TextBoxNumeric } from "../../../Inputs";
const sappy = window.sappy;

class DocFooter extends Component { 
  render() {
    let docData = this.props.docData || {}
    let editable = docData.DOCNUM > 0 ? false : true;
    let totals = this.props.totals
    let changing = this.props.changingTotals;

    return (
      <div id="docTotal" className="container" >

        <div className="row">
          <div className="col">Mercadoria</div>
          <div className="col"><span className="float-right">{sappy.format.amount(totals.grossAmmount)}</span></div>
        </div>
        <div className="row">
          <div className="col">Desc.Linha</div>
          <div className="col"><span className="float-right">{sappy.format.amount(totals.discountAmmount)}</span></div>
        </div>
        <div className="row">
          <div className="col">Valor Líquido</div>
          <div className="col"><span className="float-right">{sappy.format.amount(totals.liquidAmount)}</span></div>
        </div>

        {!editable && sappy.getNum(docData.EXTRADISC) !== 0 &&
          <div className="row">
            <div className="col-8">Desconto{" (" + sappy.format.percent(sappy.getNum(docData.EXTRADISCPERC)) + ")"}</div>
            <div className="col">
              <span className="float-right">{sappy.format.amount(sappy.getNum(docData.EXTRADISC))}</span>
            </div>
          </div>}
        {editable &&
          <div className="row">
            <div className="col-4">Desconto</div>
            <div className="col-3 pl-0 pr-0">
              <TextBoxNumeric
                name="EXTRADISCPERC"
                disabled={!editable || changing}
                value={(!docData.FORCEFIELD || changing) ? "" : sappy.getNum(docData.EXTRADISCPERC)}
                onChange={this.props.onFieldChange}
                valueType="percent" />
            </div>
            <div className="col-5 pl-1">
              <TextBoxNumeric
                name="EXTRADISC"
                disabled={!editable || changing}
                value={(!docData.FORCEFIELD || changing) ? "" : sappy.getNum(docData.EXTRADISC)}
                onChange={this.props.onFieldChange}
                valueType="amount" />
            </div>
          </div>}



        <div className="row">
          <div className="col">IVA</div>
          <div className="col"><span className="float-right">{changing ? "" : sappy.format.amount(totals.vatAmount)}</span></div>
        </div>




        {!editable && sappy.getNum(docData.ROUNDVAL) !== 0 &&
          <div className="row">
            <div className="col-6">Arredondamento</div>
            <div className="col"><span className="float-right">{sappy.format.amount(sappy.getNum(docData.ROUNDVAL))}</span></div>
          </div>}
        {editable &&
          < div className="row">
            <div className="col-6">Arredondamento</div>
            <div className="col-6">
              <TextBoxNumeric
                name="ROUNDVAL"
                disabled={!editable || changing}
                value={changing ? "" : sappy.getNum(docData.ROUNDVAL)}
                onChange={this.props.onFieldChange}
                valueType="amount" />
            </div>
          </div>}
        <hr />

        <div className="row total changed">
          <div className="col-4">TOTAL</div>
          <div className="col-8">
            {!editable &&
              <span className="float-right">{sappy.format.amount(sappy.getNum(totals.totalAmount))}</span>}

            {editable &&
              <TextBoxNumeric
                name="DOCTOTAL"
                disabled={!editable || changing}
                value={changing ? "" : totals.totalAmount}
                onChange={this.props.onFieldChange}
                valueType="amount" />}
          </div>
        </div>
      </div >
    );
  }
}

DocFooter.defaultProps = {
  footerSearchType: "",
  totals: {},
  changingTotals: false
}

export default DocFooter;

