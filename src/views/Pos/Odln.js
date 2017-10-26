import React, { Component } from "react";
import PosBase from "./PosBase";
import Shared from "./Shared";
export default class Opch extends Component {
  constructor(props) {
    super(props);

    this.prepared = Shared.prepareDocType({ tableName: "odln" });
  }

  render() {
    return (
      <PosBase {...this.props} ref="doc" {...this.prepared.propsToPosBase} />
    );
  }
}
