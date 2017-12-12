import React, { Component } from "react";
import SearchPage from "../../components/SearchPage";
const sappy = window.sappy;

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

                        <div className="row">

                            <div className="col-4 text-nowrap firstcol"> {row.WhsCode + ' - ' + row.WhsName} </div>
                            <div className="col-2 text-nowrap "> <span className="float-right">{sappy.format.quantity(row.OnHand, 0) + " " + row.InvntryUom}</span> </div>
                            <div className="col-2 text-nowrap lastcol"> <span className="float-right">{sappy.format.price(row.AvgPrice)}</span> </div>

                        </div>

                    </div>
                </div>
            );
        };

        return (
            <SearchPage
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
