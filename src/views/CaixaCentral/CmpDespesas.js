import React, { Component } from "react";
import SearchPage from "../../components/SearchPage";
import axios from "axios";
import { Badge } from "reactstrap";
import { ButtonGetPdf } from "../../Inputs";
import uuid from "uuid/v4";

// import { Badge } from "reactstrap";
// import uuid from "uuid/v4";
const sappy = window.sappy;
const $ = window.$;
import CmpFooter from "./CmpFooter";
import ModalAdiantamento from "./ModalAdiantamento";

class CmpDespesas extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedRow: '',
            defaultLayoutCode18: "",
            defaultLayoutCode46: ""
        }
    }
    componentDidMount() {
        let that = this


        axios
            .all([
                axios.get(`/api/docs/opch/report`),
                axios.get(`/api/caixa/despesas/dfltReport`)
            ])
            .then(axios.spread(function (r1, r2) {
                debugger
                that.setState({
                    defaultLayoutCode18: r1.data.LayoutCode,
                    defaultLayoutCode46: r2.data.LayoutCode
                })
            }))
            .catch(function (error) {
                if (!error.__CANCEL__) sappy.showError(error, "Api error")
            });



    }

    handleRowselection(e, row) {
        var rowDiv = $(e.target).closest(".byusVirtualRow")[0];
        let rowId = rowDiv.id;
        let { selectedRow } = this.state;
        if (selectedRow === rowId) {
            selectedRow = '';
        } else {
            selectedRow = rowId;
        }

        this.setState({ selectedRow, showActions: false });
    }


    render() {
        let that = this
        let { selectedRow, showActions } = this.state;

        let renderRowPN = ({ row, index }) => {
            let rowId = 'row_' + row.DocEntry
            const selected = rowId === selectedRow;
            let rowStyleClass = "";
            let r = { ...row }
            if (selected) rowStyleClass += " sappy-selected-row";
            if (row.ObjType === "46") rowStyleClass += " vlist-row-danger";

            const renderBadges = () => {
                const badges = row.ITEM_TAGS.split("|");
                return badges.map((item, ix) => {
                    let color = item.split("_")[0];
                    let text = item.split("_")[1];
                    return <Badge key={uuid()} color={color} pill>{text}</Badge>;
                });
            };

            return (
                <div id={rowId} className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={e => this.handleRowselection(e, r)}>
                    <div className="container vertical-align-middle">
                        <div className="row">
                            <div className="col-2 text-nowrap firstcol">       {sappy.format.datetime2(row.DOC_DATETIME)}  </div>
                            <div className="col-2 text-nowrap "> {row.ObjType + " - " + row.DocNum}  </div>
                            <div className="col-5 text-nowrap "> {(row.CardCode ? row.CardCode + ' - ' : "") + row.CardName}
                                {renderBadges()}
                            </div>
                            <div className="col-2 text-nowrap ">  <span className="float-right">{sappy.format.amount(row.DocTotal)}</span> </div>
                            <div className="col-1 lastcol"> <ButtonGetPdf DocEntry={row.DocEntry} ObjectID={row.ObjType} defaultLayoutCode={this.state["defaultLayoutCode" + row.ObjType]} />  </div>
                        </div>
                    </div>
                </div>
            );
        };


        let getfixedActions = () => {
            let fixedActions = [];
            fixedActions.push({
                name: "main", color: "primary",
                icon: showActions ? "icon wb-close animation-fade" : "icon wb-plus",
                onClick: e => { that.setState({ showActions: !showActions }) }
            })
            if (showActions) fixedActions.push({
                name: "Novo adiantamento", color: "success",
                icon: "icon fa-money",
                onClick: e => {
                    return sappy.showModal(<ModalAdiantamento
                        toggleModal={({ success } = {}) => {

                            sappy.hideModal()
                            that.pnComponent.findAndGetFirstRows()
                        }}
                    />)
                }
            }, {
                    name: "Nova despesa", color: "success",
                    icon: "icon fa-file-text-o",
                    onClick: e => {
                        return sappy.showModal(<ModalAdiantamento
                            toggleModal={({ success } = {}) => {

                                sappy.hideModal()
                                that.pnComponent.findAndGetFirstRows()
                            }}
                        />)
                    }
                })
            return fixedActions;
        };


        let footerProps = {
            fixedActions: getfixedActions(),
            actions: [
                // { name: "Numerário", color: "primary", icon: "icon fa-flash", visible: true, onClick: e => alert("teste"), showAtLeft: true },
                // { name: "Nenhuma", color: "default", icon: "icon fa-close", visible: true, onClick: e => { } },
            ]
        }


        return (
            <div>
                <div className="row">
                    <div className="col-12">
                        <SearchPage
                            ref={node => this.pnComponent = node}
                            searchApiUrl={`/api/caixa/despesas`}
                            renderRow={renderRowPN}
                            renderRowHeight={50}
                        />
                    </div>
                </div>
                <CmpFooter {...footerProps }></CmpFooter>

            </div>)

    }
}

export default CmpDespesas;
