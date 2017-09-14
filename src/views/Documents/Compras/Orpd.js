import React, { Component } from "react";
import BaseDocument from "../BaseDocument";
import Shared from "../Shared"; 

export default class Opch extends Component {
    constructor(props) {
        super(props)

        this.prepared = Shared.prepareDocType({ tableName: "orpd" });
    }

    render() {
        return <BaseDocument
            {...this.props}
            ref="doc"
            {...this.prepared.propsToBaseDocument}
        />
    }
}