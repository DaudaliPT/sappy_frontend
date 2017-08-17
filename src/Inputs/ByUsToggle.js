import React, { Component } from "react";
import { FormGroup, FormFeedback, Button, InputGroup, Input } from "reactstrap";

var $ = window.$;
const byUs = window.byUs;

class ByUsToggle extends Component {
  constructor(props) {
    super(props);
    this.handleToggle = this.handleToggle.bind(this);
  }


  handleToggle() {
    let value = this.props.value;
    let changeInfo = { fieldName: this.props.name, rawValue: !value, formatedValue: !value };
    this.props.onChange(changeInfo);
  }

  render() {
    let sliderColor = this.props.value ? "warning" : "secondary";
    let stateColor, stateMsg;
    if (this.props.state) {
      stateColor = this.props.state.split('|')[0];
      stateMsg = this.props.state.split('|')[1];
    }

    return (
      <FormGroup color={stateColor} data-tip={this.props.label} title={stateMsg}>
        {/*{renderLabel()}*/}
        <InputGroup>

          <label className="switch" >
            <input type="checkbox" checked={this.props.value} onChange={this.handleToggle} />
            <span className={"slider round " + sliderColor}>{this.props.value ? (this.props.contentON || "ON") : (this.props.contentOFF || "OFF")} </span>
          </label>
        </InputGroup>

        {/* {stateMsg && <FormFeedback>{stateMsg}</FormFeedback>} */}
      </FormGroup>
    );
  }
}

ByUsToggle.defaultProps = {
  name: "",
  disabled: false,
  onChange: (newValue, name) => {
    console.log(name, newValue);
  },
  value: ""
};

export default ByUsToggle;
