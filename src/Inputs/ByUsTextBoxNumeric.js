import React, { Component } from "react";
import { FormGroup, FormFeedback, Button, InputGroup, Input } from "reactstrap";
var byUs = window.byUs;
// var $ = window.$;

class ByUsTextBoxNumeric extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.getFormatedValue = this.getFormatedValue.bind(this);

    this.state = this.createStateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.createStateFromProps(nextProps))
  }

  createStateFromProps(props) {
    let val = this.getFormatedValue(props.valueType, props.value)
    return { receivedValue: val, value: val }
  }


  handleChange(e) {
    this.setState({ value: e.target.value })
  }

  getFormatedValue(valueType, value) {
    if (value === null || value === undefined) return ""
    if (typeof value === "string") {
      if (value === "") return ""
      if (byUs.sessionInfo.company.oadm.DecSep === "," && value.indexOf(".") > -1 && value.indexOf(",") === -1) {
        value = value.replace(".", ",");
      }
    }


    let rawValue = byUs.unformat.number(value)
    let formatedValue;
    if (valueType === "price") formatedValue = byUs.format.price(rawValue)
    if (valueType === "valor") formatedValue = byUs.format.valor(rawValue)
    if (valueType === "percent") formatedValue = byUs.format.percent(rawValue)
    if (valueType === "integer") formatedValue = byUs.format.integer(rawValue)

    return formatedValue;
  }

  handleBlur(e) {
    let formatedValue = this.getFormatedValue(this.props.valueType, e.target.value)
    if (byUs.isDiferent(formatedValue, this.state.receivedValue)) {
      let rawValue = byUs.unformat.number(formatedValue)
      let changeInfo = { fieldName: this.props.name, rawValue, formatedValue };
      this.props.onChange(changeInfo);
    }
  }

  render() {
    var renderRightButton = () => {
      if (this.props.rightButton) {
        let color = "success";
        if (this.props.rightButton === "-") {
          color = " warning";
        }
        return (
          <span className="input-group-btn">
            <Button color={color} outline id={this.props.name + "_rbtn"} className="right-button"

              disabled={this.props.disabled || false}
              onClick={this.props.onRightButtonClick}
            >              {this.props.rightButton}            </Button>
          </span>
        );
      }
    };


    let stateColor, stateMsg;
    if (this.props.state) {
      stateColor = this.props.state.split('|')[0];
      stateMsg = this.props.state.split('|')[1];
    }


    return (
      <FormGroup color={stateColor} data-tip={this.props.label} title={stateMsg}>
        {/*{renderLabel()}*/}
        <InputGroup>
          <Input
            type="text"
            id={this.props.name}
            className="text-right"
            value={this.state.value}
            placeholder={this.props.placeholder}
            disabled={this.props.disabled}
            onChange={e => this.handleChange(e)}
            onBlur={e => this.handleBlur(e)}
          />
          {renderRightButton()}
        </InputGroup>

        {stateMsg && <FormFeedback>{stateMsg}</FormFeedback>}
      </FormGroup>
    );
  }
}

ByUsTextBoxNumeric.defaultProps = {
  name: "TextBox",
  valueType: "price",
  disabled: false,
  rightButton: null,
  onChange: (changeInfo) => {
    console.log(changeInfo);
  },
  value: ""
};

export default ByUsTextBoxNumeric;
