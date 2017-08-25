import React, { Component } from "react";
import ByUsSearchPage from "../../../components/ByUsSearchPage";
const byUs = window.byUs;

class CmpStock extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        const renderRow = ({ row, index }) => {
            let rowStyleClass = "";
            return (
                <div className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={this.handleRowSelection}>
                    <div className="container vertical-align-middle">

                        {/*large displays*/}
                        <div className="row hidden-lg-down">

                            <div className="col-4 text-nowrap firstcol"> {row.WhsCode + ' - ' + row.WhsName} </div>
                            <div className="col-2 text-nowrap lastcol"> <span className="float-right">{byUs.format.quantity(row.OnHand, 0) + " " + row.InvntryUom}</span> </div>

                        </div>
                        {/*mobile*/}
                        <div className="hidden-xl-up">
                            <div className="row">
                                <div className="col text-nowrap">  {row.WhsCode + ' - ' + row.WhsName} </div>
                                <div className="col-2 text-nowrap lastcol"> <span className="float-right">{byUs.format.quantity(row.OnHand, 0) + " " + row.InvntryUom}</span> </div>
                            </div>
                        </div>

                    </div>
                </div>
            );
        };

        return (
            <ByUsSearchPage
                searchPlaceholder="Procurar..."
                searchApiUrl={`/api/prod/stock/${this.props.ItemCode}`}
                renderRow={renderRow}
                searchText={this.props.searchText} s
                renderRowHeight={50}
                currentModal={this.state.currentModal}
            />)
    }
}

export default CmpStock;
