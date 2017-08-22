
import React, { Component } from "react";
// import { Button } from "reactstrap";

import { ByUsTextBoxNumeric } from "../../../Inputs";
const byUs = window.byUs;

class DocFooter extends Component {
  constructor(props) {
    super(props)
    this.handleDocTotalChange = this.handleDocTotalChange.bind(this);

  }

  handleDocTotalChange(changeInfo) {
    // let desiredDocTotal = byUs.getNum(this.props.DOCTOTAL)
    // let { grossAmmount,
    //   discountAmmount,
    //   liquidAmount,
    //   vatAmount,
    //   totalAmount
    //    } = this.props.totals

    //  TODO: implement total caculations

  }

  render() {
    let docData = this.props.docData || {}
    let editable = docData.DOCNUM > 0 ? false : true;
    let totals = this.props.totals

    return (
      <div id="docTotal" className="container" >

        <div className="row">
          <div className="col">Mercadoria</div>
          <div className="col"><span className="float-right">{byUs.format.valor(totals.grossAmmount)}</span></div>
        </div>
        <div className="row">
          <div className="col">Descontos</div>
          <div className="col"><span className="float-right">{byUs.format.valor(totals.discountAmmount)}</span></div>
        </div>
        <div className="row">
          <div className="col">Valor Líquido</div>
          <div className="col"><span className="float-right">{byUs.format.valor(totals.liquidAmount)}</span></div>
        </div>
        {byUs.getNum(docData.EXTRADISC) !== 0 &&
          <div className="row">
            <div className="col-6">Desc.Adicional</div>
            <div className="col"><span className="float-right">{byUs.format.valor(byUs.getNum(docData.EXTRADISC))}</span></div>
          </div>
        }
        <div className="row">
          <div className="col">IVA</div>
          <div className="col"><span className="float-right">{byUs.format.valor(totals.vatAmount)}</span></div>
        </div>
        <div className="row">
          <div className="col-6">Arredondamento</div>
          <div className="col-6">
            <ByUsTextBoxNumeric
              name="ROUNDVAL"
              disabled={!editable}
              value={byUs.getNum(docData.ROUNDVAL)}
              onChange={this.props.onFieldChange}
              valueType="valor" />
          </div>
        </div>
        <hr />
        <div className="row total">
          <div className="col-4">TOTAL</div>
          <div className="col-8">
            <ByUsTextBoxNumeric
              name="DOCTOTAL"
              disabled={!editable}
              value={totals.totalAmount /*byUs.getNum(this.props.DOCTOTAL) ||  totals.totalAmount */}
              onChange={this.props.onFieldChange}
              valueType="valor" />
          </div>
        </div>
      </div>
    );
  }
}

DocFooter.defaultProps = {
  footerSearchType: "",
  totals: {}
}

export default DocFooter;

