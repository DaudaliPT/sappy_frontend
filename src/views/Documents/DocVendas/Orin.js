import React, { Component } from "react";
import DocBase from "../DocBase";
import Shared from "../Shared";

export default class Opch extends Component {
  constructor(props) {
    super(props);

    this.prepared = Shared.prepareDocType({ tableName: "orin", module: 1 });
  }

  render() {
    return <DocBase {...this.props} ref="doc" {...this.prepared.propsToDocBase} />;
  }
}
