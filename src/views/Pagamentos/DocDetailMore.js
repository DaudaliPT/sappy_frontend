import React, { Component } from "react";
import { ComboBox } from "../../Inputs";

// const sappy = window.sappy;

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

    //change descritption of contract, discount, débit
    changeInfo.fieldName2 = "CONTRATO_DESC";
    changeInfo.rawValue2 = changeInfo.formatedValue.label;
    changeInfo.fieldName3 = "UDISC";
    changeInfo.rawValue3 = changeInfo.formatedValue.UDISC;
    changeInfo.fieldName4 = "UDEBITO";
    changeInfo.rawValue4 = changeInfo.formatedValue.UDEBITO;

    this.props.onChange(changeInfo);
  }

  render() {
    // console.log("render", this.props);
    let { dependentValues } = this.state;

    return (
      <div style={{ minWidth: "400px" }}>
        <ComboBox
          {...{
            name: "CONTRATO",
            label: "Contrato",
            getOptionsApiRoute: `/api/cbo/contratos/${dependentValues.CardCode}/${dependentValues.CONTACT}`,
            disabled: false,
            value: dependentValues.CONTRATO,
            onChange: this.onFieldChange
          }}
        />
      </div>
    );
  }
}

export default DocDetailMore;
