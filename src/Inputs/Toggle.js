import React, { Component } from "react";
import { FormGroup, InputGroup } from "reactstrap";

// var $ = window.$;
// const sappy = window.sappy;

class Toggle extends Component {
  constructor(props) {
    super(props);
    this.handleToggle = this.handleToggle.bind(this);
  }


  handleToggle() {
    if (this.props.disabled) return
    let value = this.props.value;
    let changeInfo = { fieldName: this.props.name, rawValue: !value, formatedValue: !value };
    this.props.onChange(changeInfo);
  }

  render() {
    let sliderColor = this.props.disabled ? "secondary" : (this.props.color || "warning");
    let stateColor, stateMsg;
    if (this.props.state) {
      stateColor = this.props.state.split('|')[0];
      stateMsg = this.props.state.split('|')[1];
    }

    return (
      <FormGroup color={stateColor} data-tip={this.props.label} title={stateMsg}>
        {/*{renderLabel()}*/}
        <InputGroup>

          <label className="switch large" >
            <input type="checkbox" checked={this.props.value} onChange={this.handleToggle} />
            <span className={"slider sm round " + sliderColor}>{this.props.value ? (this.props.contentON || "ON") : (this.props.contentOFF || "OFF")} </span>
          </label>
        </InputGroup>

        {/* {stateMsg && <FormFeedback>{stateMsg}</FormFeedback>} */}
      </FormGroup>
    );
  }
}

Toggle.defaultProps = {
  name: "",
  disabled: false,
  onChange: (newValue, name) => {
    console.log(name, newValue);
  },
  value: ""
};

export default Toggle;
