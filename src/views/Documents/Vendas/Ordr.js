import React, { Component } from "react";
import BaseDocument from "../BaseDocument";
import Shared from "../Shared";
const byUs = window.byUs;

export default class Opch extends Component {
    constructor(props) {
        super(props)

        this.prepared = Shared.prepareDocType({ tableName: "ordr" });
    }

    render() {
        return <BaseDocument
            {...this.props}
            ref="doc"
            {...this.prepared.propsToBaseDocument}
        />
    }
}
