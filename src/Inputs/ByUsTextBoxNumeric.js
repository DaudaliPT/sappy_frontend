import React, { Component } from "react";
import { FormGroup, FormFeedback, Button, InputGroup, Input } from "reactstrap";
var sappy = window.sappy;
// var $ = window.$;

class TextBoxNumeric extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.getFormatedValue = this.getFormatedValue.bind(this);

    this.state = this.createStateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {

    if (this.props.value !== nextProps.value)
      this.setState(this.createStateFromProps(nextProps))
  }

  createStateFromProps(props) {
    let val = this.getFormatedValue(props.valueType, props.value)
    return { receivedValue: val, value: val }
  }


  handleChange(e) {
    let that = this;
    let value = e.target.value;
    this.setState({ value }, () => {
      if (that.props.realTimeChange) {
        let changeInfo = {
          fieldName: that.props.name,
          rawValue: sappy.getNum(value),
          formatedValue: value,
          realtime: true
        };
        that.props.onChange(changeInfo);
      }
    })
  }

  getFormatedValue(valueType, value) {
    if (value === null || value === undefined) return ""
    let rawValue = sappy.evaluateNumericExpression(value)
    let formatedValue;
    if (valueType === "price") formatedValue = sappy.format.price(rawValue)
    if (valueType === "amount") formatedValue = sappy.format.amount(rawValue)
    if (valueType === "percent") formatedValue = sappy.format.percent(rawValue)
    if (valueType === "integer") formatedValue = sappy.format.integer(rawValue)

    return formatedValue;
  }

  handleBlur(e) {
    let formatedValue = this.getFormatedValue(this.props.valueType, e.target.value)
    if (sappy.isDiferent(formatedValue, this.state.receivedValue)) {
      let rawValue = sappy.unformat.number(formatedValue)
      let changeInfo = { fieldName: this.props.name, rawValue, formatedValue };
      this.props.onChange(changeInfo);
    }
  }

  render() {
    let that = this
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
              onClick={() => {
                that.props.onRightButtonClick(that)
              }}>
              {this.props.rightButton}
            </Button>
          </span >
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
            ref={this.props.name}
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

TextBoxNumeric.defaultProps = {
  name: "TextBox",
  valueType: "price",
  disabled: false,
  realTimeChange: false,
  rightButton: null,
  onChange: (changeInfo) => {
    console.log(changeInfo);
  },
  value: ""
};

export default TextBoxNumeric;
