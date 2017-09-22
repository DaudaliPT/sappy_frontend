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
    this.onIncreaseOrDecrease_click = this.onIncreaseOrDecrease_click.bind(this);

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
    let formatedValue = sappy.format.integer(rawValue)

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

  onIncreaseOrDecrease_click(e) {
    let that = this
    let value = sappy.getNum(this.state.value)

    if (e.target.innerText === "-") value--
    if (e.target.innerText === "+") value++
    if (value < 0) value = 0;
    this.setState({ value }, () => {
      let changeInfo = {
        fieldName: that.props.name,
        rawValue: sappy.getNum(value),
        formatedValue: value
      };
      that.props.onChange(changeInfo);
    })
  }


  render() {
    let stateColor, stateMsg;
    if (this.props.state) {
      stateColor = this.props.state.split('|')[0];
      stateMsg = this.props.state.split('|')[1];
    }


    return (
      <FormGroup color={stateColor} title={stateMsg} className="notas">

        <InputGroup >
          <span className="input-group-btn">
            <Button color="dark" outline id={this.props.name + "_cbtn"} className="caption-button" tabIndex={-1} >
              {this.props.label}
            </Button>
          </span>
          <span className="input-group-btn">
            <Button color="secondary" outline id={this.props.name + "_lbtn"} className="left-button" tabIndex={-1}
              disabled={this.props.disabled || false}
              onClick={this.onIncreaseOrDecrease_click}>
              -
            </Button>
          </span>

          <Input
            type="text"
            ref={this.props.name}
            id={this.props.name}
            className="text-center"
            value={this.state.value}
            placeholder={this.props.placeholder}
            disabled={this.props.disabled}
            onChange={e => this.handleChange(e)}
            onBlur={e => this.handleBlur(e)}
            size="sm"
          />
          <span className="input-group-btn">
            <Button color="secondary" outline id={this.props.name + "_rbtn"} className="right-button" tabIndex={-1}
              disabled={this.props.disabled || false}
              onClick={this.onIncreaseOrDecrease_click}>
              +
            </Button>
          </span>
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
