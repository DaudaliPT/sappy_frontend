import React, { Component } from "react";
import BaseDocument from "../BaseDocument";
import EditModal from "../../LandingPages/Produtos/EditModal";
const byUs = window.byUs;


let headerFields = {
    line1: [
        { name: 'CARDCODE', label: 'Cliente', type: "combo", api: "/api/cbo/ocrd/c", gridSize: 6, required: true },
        { name: 'DOCSERIES', label: 'Série', type: "combo", api: "/api/cbo/nnm1/17", gridSize: 4, required: true },
        { name: 'DOCDATE', label: 'Data', type: "date", gridSize: 2, required: true },
        { name: 'DOCDUEDATE', label: 'Data entrega', type: "date", gridSize: 2, required: true }
    ],
    line2: [
        { name: 'SHIPADDR', label: 'Morada Envio', type: "combo", api: "/api/cbo/crd1/<CARDCODE>/s", gridSize: 4 },
        // { name: 'BILLADDR', label: 'Morada Facturação', type: "combo", api: "/api/cbo/crd1/<CARDCODE>/b", gridSize: 2 },
        { name: 'CONTACT', label: 'Contacto/Sub.Cli', type: "combo", api: "/api/cbo/ocpr/<CARDCODE>", gridSize: 2 },
        { name: 'NUMATCARD', label: 'Ref.cliente', type: "text", gridSize: 2 },
        { name: 'COMMENTS', label: 'Observações', type: "text", gridSize: 5 },
        { name: 'HASINCONF', label: 'Inconf.', type: "flag|danger", gridSize: 1 }
    ]
}


let detailFields = [
    { name: 'LINENUM', label: '#', type: "text", width: 40, editable: false },
    {
        name: 'ITEMCODE', label: 'Artigo', type: "text", width: 100, editable: false, dragable: false,
        onLinkClick: props => byUs.showModal(<EditModal modal={true} toggleModal={byUs.hideModal} itemcode={props.dependentValues.ITEMCODE} />)
    },
    { name: 'ITEMNAME', label: 'Descrição', type: "tags", width: 400, editable: true },
    { name: 'QTCX', label: 'Cx', type: "quantity", width: 70, editable: true },
    { name: 'QTPK', label: 'Pk', type: "quantity", width: 70, editable: true },
    { name: 'QTSTK', label: 'Qtd', type: "quantity", width: 70, editable: true },
    { name: 'PRICE', label: 'Preço', type: "price", width: 70, editable: true },
    { name: 'BONUS', label: 'Bónus/Descontos', type: "check", width: 35, editable: true },
    { name: 'USER_DISC', label: '', type: "discount", width: 110, editable: true },
    { name: 'LINETOTAL', label: 'Total', width: 90, type: "amount", editable: true },
    { name: 'TAXRATE', label: 'IVA', type: "vat", width: 70, editable: false },
    { name: 'WHSCODE', label: 'Arm', type: "text", width: 50, editable: true },
    { name: 'HASINCONF', label: 'Inc.', type: "flag|danger", width: 35, editable: true }
]

export default class Ordr extends Component {
    constructor(props) {
        super(props)
        this.state = { currentModal: null }
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
            title="Encomenda de cliente"
            baseApiUrl='/api/docs/doc/ordr'
            footerSearchType="oitm"
            headerFields={headerFields}
            onHeaderChange={this.onHeaderChange}
            onRowChange={this.onBeforeRowChange}
            detailFields={detailFields}
            currentModal={this.state.currentModal}
        />
    }
}
