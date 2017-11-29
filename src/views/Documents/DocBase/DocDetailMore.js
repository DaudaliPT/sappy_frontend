import React, { Component } from "react";
import { TextBox, TextBoxNumeric, ComboBox, Date, Toggle, Flag, Check } from "../../../Inputs";

const sappy = window.sappy;

class DocDetailMore extends Component {
  constructor(props) {
    super(props);

    this.onFieldChange = this.onFieldChange.bind(this);

    this.state = {
      dependentValues: props.dependentValues
    };
  }

  onFieldChange(changeInfo) {
    let that = this;
    // be notified of changes
    changeInfo.callback = updated_row => {
      that.setState({ dependentValues: updated_row });
    };
    this.props.onChange(changeInfo);
  }

  render() {
    // console.log("render", this.props);
    let { dependentValues } = this.state;

    return (
      <div>
        <TextBox
          {...{
            name: "UIEC",
            label: "IEC",
            disabled: false,
            value: dependentValues.UIEC,
            onChange: this.onFieldChange,
            valueType: "discount"
          }}
        />
        <TextBox
          {...{
            name: "UECOVALOR",
            label: "Ecovalor",
            disabled: false,
            value: dependentValues.UECOVALOR,
            onChange: this.onFieldChange,
            valueType: "discount"
          }}
        />
        <TextBox
          {...{
            name: "UECOREE",
            label: "Ecoree",
            disabled: false,
            value: dependentValues.UECOREE,
            onChange: this.onFieldChange,
            valueType: "discount"
          }}
        />
        <TextBoxNumeric
          {...{
            name: "LINETOTAL2",
            label: "Total",
            disabled: true,
            value: dependentValues.LINETOTAL2,
            valueType: "amount"
          }}
        />
        <ComboBox
          {...{
            name: "WHSCODE",
            label: "Armazém",
            getOptionsApiRoute: "/api/cbo/owhs",
            disabled: false,
            value: dependentValues.WHSCODE,
            onChange: this.onFieldChange
          }}
        />
      </div>
    );
  }
}

export default DocDetailMore;
