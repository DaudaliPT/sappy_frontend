import React, { Component } from "react";
import PosBase from "./PosBase";
import Shared from "./Shared";

export default class Oqut extends Component {
  constructor(props) {
    super(props);

    this.prepared = Shared.prepareDocType({ tableName: "oqut" });
  }

  render() {
    return <PosBase {...this.props} ref="doc" {...this.prepared.propsToPosBase} />;
  }
}
