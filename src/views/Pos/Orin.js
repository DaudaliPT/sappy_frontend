import React, { Component } from "react";
import PosBase from "./PosBase";
import Shared from "./Shared";

export default class Opch extends Component {
  constructor(props) {
    super(props);
    this.handleOnHeaderChange = this.handleOnHeaderChange.bind(this);
    this.prepared = Shared.prepareDocType({ tableName: "orin" });
  }

  handleOnHeaderChange(docData, updated) {
    return updated;
  }
  render() {
    return <PosBase {...this.props} ref="doc" {...this.prepared.propsToPosBase} onHeaderChange={this.handleOnHeaderChange} />;
  }
}
