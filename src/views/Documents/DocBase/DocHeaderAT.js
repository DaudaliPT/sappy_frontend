import React, { Component } from "react";
import { TextBox, TextBoxNumeric, ComboBox, Date, Toggle, Flag, Check } from "../../../Inputs";

const sappy = window.sappy;

class DocHeaderAT extends Component {
  constructor(props) {
    super(props);

    this.onFieldChange = this.onFieldChange.bind(this);

    this.state = {
      docData: props.docData
    };
  }

  onFieldChange(changeInfo) {
    let that = this;
    // be notified of changes
    changeInfo.callback = updated_row => {
      that.setState({ docData: updated_row });
    };
    this.props.onChange(changeInfo);
  }

  render() {
    // console.log("render", this.props);
    let { docData } = this.state;

    let aprovedAT = docData.ElCoStatus === "0";
    let rejectedAT = docData.ElCoStatus === "1";
    let pendingAT = docData.ElCoStatus === "2";
    return (
      <div>
        <ComboBox
          {...{
            name: "AtDocType",
            label: "Documento AT",
            options: [{ value: "GT", label: "GT" }, { value: "GA", label: "GA" }, { value: "GD", label: "GD" }, { value: "GR", label: "GR" }, { value: "GC", label: "GC" }],
            disabled: !!docData.DOCENTRY,
            value: docData.AtDocType,
            onChange: this.onFieldChange
          }}
        />
        <TextBox
          {...{
            name: "VclPlate",
            label: "Matricula",
            disabled: !aprovedAT,
            value: docData.VclPlate,
            onChange: this.onFieldChange
          }}
        />
        <TextBox
          {...{
            name: "AuthCode",
            label: "Código autorização",
            disabled: aprovedAT || pendingAT,
            value: docData.AuthCode,
            onChange: this.onFieldChange
          }}
        />
      </div>
    );
  }
}

export default DocHeaderAT;
