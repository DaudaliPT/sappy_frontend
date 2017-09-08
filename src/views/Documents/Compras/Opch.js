
import React, { Component } from "react";
import BaseDocument from "../BaseDocument";
import EditModal from "../../LandingPages/Produtos/EditModal";
const byUs = window.byUs;

export default class Opch extends Component {
    constructor(props) {
        super(props)
        this.state = { currentModal: null }




        let priceHover = {
            api: 'api/prod/info/<ITEMCODE>/upc',
            render: ({ result, context }) => {
                let content = []

                if (result.data.length === 0)
                    content.push(<tr><td>Nenhum histórico</td></tr>)
                else {
                    content.push(<tr >
                        <td>Data</td>
                        <td>Fornecedor</td>
                        <td>Preço</td>
                        <td>Pr.NET</td>
                    </tr>)
                    result.data.forEach(popuprow => {
                        content.push(<tr >
                            <td>{byUs.format.properDisplayDate(popuprow.DocDate)}</td>
                            <td style={{ maxWidth: "130px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{popuprow.CardName}</td>
                            <td>{byUs.format.price(popuprow.PUR_PRICE, 3)}</td>
                            <td>{byUs.format.price(popuprow.PRCNET, 3)}</td>
                        </tr>)
                    });
                }
                return <table>{content}</table>
            }
        }


        this.DESCDEBOP_options = [
            { value: 'P', label: 'Pagamento' },
            { value: 'M', label: 'Mensal' },
            { value: 'T', label: 'Trimestral' },
            { value: 'S', label: 'Semestral' },
            { value: 'A', label: 'Anual' },
        ]

        this.headerFields = {
            line1: [
                { name: 'CARDCODE', label: 'Fornecedor', type: "combo", api: "/api/cbo/ocrd/s", gridSize: 6, required: true },
                { name: 'DOCSERIES', label: 'Série', type: "combo", api: "/api/cbo/nnm1/18", gridSize: 4, required: true },
                { name: 'TAXDATE', label: 'Data Documento', type: "date", gridSize: 2, required: true },
                { name: 'DOCDUEDATE', label: 'Data vencimento', type: "date", gridSize: 2, required: true }
            ],
            line2: [
                // { name: 'SHIPADDR', label: 'Morada Envio', type: "combo", api: "/api/cbo/crd1/<CARDCODE>/s", gridSize: 4 },
                { name: 'BILLADDR', label: 'Morada Faturação', type: "combo", api: "/api/cbo/crd1/<CARDCODE>/b", gridSize: 2 },
                { name: 'CONTACT', label: 'Contato/Sub.For', type: "combo", api: "/api/cbo/ocpr/<CARDCODE>", gridSize: 2 },
                { name: 'NUMATCARD', label: 'Ref.fornecedor', type: "text", gridSize: 2, required: true },
                { name: 'COMMENTS', label: 'Observações', type: "text", gridSize: 5 },
                { name: 'HASINCONF', label: '', type: "flag|danger", gridSize: 1 }
            ]
        }
        this.sidebarFields = {
            // line1: [
            //     { name: 'DESCCOM', label: 'Desc. Comercial', type: "text", width: "100%" },
            // ],
            line2: [
                { name: 'DESCFIN', label: 'Desc. Financeiro', type: "text", width: "calc(100% - 35px)" },
                { name: 'DESCFINAC', label: '', type: "check|success", width: "35px" },
            ],
            line3: [
                { name: 'DESCDEB', label: 'Desc. em Débito', type: "text", width: "calc(100% - 35px)" },
                { name: 'DESCDEBAC', label: '', type: "check|success", width: "35px" },
            ],
            line4: [
                { name: 'DESCDEBPER', label: 'Tipo débito:', type: "combo", width: "100%", options: this.DESCDEBOP_options },
            ],
            line5: [
                { name: 'DESCNET', label: 'Total Desc. NET', type: "percent", width: "100%", disabled: true }
            ]
        }


        this.detailFields = [
            { name: 'LINENUM', label: '#', type: "text", width: 40, editable: false },
            // { name: 'ITEMCODE', label: 'Artigo', type: "text", width: 220, editable: false, dragable: false, onLinkClick: this.handleItemcodeLinkClick },
            {
                name: 'CATNUM_OR_ITEMCODE', label: 'Catálogo', type: "text", width: 100, editable: false, dragable: false,
                onLinkClick: props => byUs.showModal(<EditModal modal={true} toggleModal={byUs.hideModal} itemcode={props.dependentValues.ITEMCODE} />)
            },
            { name: 'ITEMNAME', label: 'Descrição', type: "tags", width: 400, editable: true },
            { name: 'QTCX', label: 'Cx', type: "quantity", width: 60, editable: true },
            { name: 'QTPK', label: 'Pk', type: "quantity", width: 60, editable: true },
            { name: 'QTSTK', label: 'Qtd', type: "quantity", width: 60, editable: true },
            { name: 'QTBONUS', label: 'Qt.Bónus', type: "bonus", width: 120, editable: true },
            // { name: 'BONUS_NAP', label: 'NAP', type: "check", width: 40, editable: true },
            { name: 'PRICE', label: 'Preço', type: "price", width: 70, editable: true, hover: priceHover },
            { name: 'USER_DISC', label: 'Descontos', type: "text", width: 120, editable: true },
            { name: 'LINETOTAL', label: 'Total', width: 90, type: "amount", editable: true },
            // { name: 'LINETOTALBONUS', label: 'TotalB', width: 90, type: "amount", editable: true },
            { name: 'VATGROUP', label: 'IVA', type: "vat", width: 70, editable: true },
            // { name: 'WHSCODE', label: 'Arm', type: "text", width: 50, editable: true },
            { name: 'HASINCONF', label: '', type: "flag|danger", width: 35, editable: true },
            { name: 'NETPRICE', label: 'Pr.NET', width: 70, type: "price", editable: false },
            { name: 'NETTOTAL', label: 'V.NET', width: 70, type: "amount", editable: false },
            { name: 'NETTOTALBONUS', label: 'V.NET.BONUS', width: 70, type: "amount", editable: false }
        ]
    }

    onBeforeHeaderChange(docData, updated) {

        return updated;
    }

    onBeforeRowChange(currentRow, updated) {

        return updated;
    }

    render() {
        return <BaseDocument
            {...this.props}
            ref="doc"
            title="Fatura de compra"
            baseApiUrl='/api/docs/doc/opch'
            footerSearchType="oitm"
            footerSearchShowCatNum={true}
            footerLimitSearchCondition={`OITM."CardCode"='<CARDCODE>' 
                AND 1= CASE WHEN OCRD."U_apyITMCNT"='Y'  
                            THEN CASE WHEN 
                                    CASE WHEN OITM."FirmCode"=-1 THEN 'null' ELSE  OMRC."FirmName" END = '<CONTACT>'
                                 THEN 1 ELSE 0 END
                            ELSE 1 END` //<CONTACT> vazio retorna null
            }
            headerFields={this.headerFields}
            onHeaderChange={this.onHeaderChange}
            sidebarFields={this.sidebarFields}
            onRowChange={this.onBeforeRowChange}
            detailFields={this.detailFields}
            currentModal={this.state.currentModal}
        />
    }
}
