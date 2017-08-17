import React, { Component } from "react";

import { Badge } from "reactstrap";
import ByUsSearchPage from "../../../components/ByUsSearchPage";
const byUs = window.byUs;

class CmpVendas extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        const renderRow = ({ row, index }) => {

            let rowStyleClass = "";
            if (row.ObjType === "14") rowStyleClass = "vlist-row-danger"
            if (row.ObjType === "16") rowStyleClass = "vlist-row-danger"
            return (
                <div className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={this.handleRowSelection}>
                    <div className="container vertical-align-middle">

                        {/*large displays*/}
                        <div className="row hidden-lg-down">

                            <div className="col-1 text-nowrap firstcol"> {byUs.format.properDisplayDate(row.DOC_DATETIME)} </div>
                            <div className="col-2 text-nowrap"> {row.DESCDOC + ' ' + row.DocNum} </div>
                            <div className="col-5 text-truncate" title={row.CardCode + ' - ' + row.CardName}> {row.CardCode + ' - ' + row.CardName} </div>
                            <div className="col-2 text-nowrap"> <span className="float-right">{byUs.format.quantity(row.InvQty, 0) + " " + row.InvntryUom + " x " + byUs.format.price(row.Price, 3)}</span> </div>
                            <div className="col-2 text-nowrap lastcol">
                                <span className="float-left"> <Badge color="success" pill>{byUs.format.percent(row.MARGEM, 2)} </Badge> </span>
                                <span className="float-right"> {row.FORMATED_LINETOTAL} </span>
                            </div>
                        </div>

                        {/*mobile*/}
                        <div className="hidden-xl-up">
                            <div className="row">
                                <div className="col text-nowrap">  {row.CardCode + ' - ' + row.CardName} </div>
                            </div>
                            <div className="row secondrow">
                                <div className="col-3 text-nowrap firstcol"> {byUs.format.properDisplayDate(row.DOC_DATETIME)} </div>
                                <div className="col-4 text-nowrap"> {row.DESCDOC + ' ' + row.DocNum} </div>
                                <div className="col-5 text-nowrap lastcol">  <span className="float-right">{byUs.format.quantity(row.InvQty, 0) + " x " + byUs.format.price(row.Price, 3)}</span> </div>
                            </div>
                        </div>
                    </div>
                </div >
            );
        };

        return (
            <ByUsSearchPage
                searchPlaceholder="Procurar..."
                searchApiUrl={`/api/inv/oitm/vendas/${this.props.ItemCode}`}
                noRecordsMessage="Não há vendas deste artigo"
                renderRow={renderRow}
                searchText={this.props.searchText} s
                renderRowHeight={50}
                currentModal={this.state.currentModal}
            />)
    }
}

export default CmpVendas;
