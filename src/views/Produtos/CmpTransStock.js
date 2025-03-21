import React, { Component } from "react";
import SearchPage from "../../components/SearchPage";
const sappy = window.sappy;

class CmpTransStock extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        const renderRow = ({ row, index }) => {
            // let rowId = "row_" + index;
            let rowStyleClass = "";
            let seta = null;
            if (row.InvQty < 0) seta = <span className="float-left" style={{ color: "red" }}><i className="icon wb-upload" /></span>;
            if (row.InvQty > 0) seta = <span className="float-left" style={{ color: "green" }}><i className="icon wb-download" /></span>;
            return (
                <div className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={this.handleRowSelection}>
                    <div className="container vertical-align-middle">


                        {/*large displays*/}
                        <div className="row hidden-lg-down">

                            <div className="col-1 text-nowrap firstcol"> {sappy.format.date(row.DOC_DATETIME)} </div>
                            <div className="col-2 text-nowrap">
                                {sappy.GetLinkTo(row.ObjType, row.DocEntry)}
                                {row.DESCDOC + ' ' + row.DocNum} </div>
                            <div className="col-4 text-nowrap"> {row.WhsCode + ' - ' + row.WhsName} </div>
                            <div className="col-2 text-nowrap">{seta} <span className="float-right">{sappy.format.quantity(row.InvQty, 0) + " " + row.InvntryUom}</span> </div>
                            <div className="col-2 text-nowrap"><span className="float-right">{sappy.format.price(row.Price, 3)}</span> </div>
                            <div className="col-1 text-nowrap lastcol"> <span className="float-right"> {row.FORMATED_LINETOTAL} </span> </div>

                        </div>
                        {/*mobile*/}
                        <div className="hidden-xl-up">
                            <div className="row">
                                {/* <div className="col text-nowrap">  {row.CardCode + ' - ' + row.CardName} </div> */}
                            </div>
                            <div className="row secondrow">
                                <div className="col-3 text-nowrap firstcol"> {sappy.format.date(row.DOC_DATETIME)} </div>
                                <div className="col-4 text-nowrap">
                                    {sappy.GetLinkTo(row.ObjType, row.DocEntry)}
                                    {row.DocNum} </div>
                                <div className="col-5 text-nowrap lastcol">  <span className="float-right">{sappy.format.quantity(row.InvQty, 0)}</span> </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <SearchPage
                searchPlaceholder="Procurar..."
                searchApiUrl={`/api/prod/transstock/${this.props.ItemCode}`}
                noRecordsMessage="Não há movimentos deste artigo"
                renderRow={renderRow}
                searchText={this.props.searchText} s
                renderRowHeight={50}
                currentModal={this.state.currentModal}
            />)
    }
}

export default CmpTransStock;
