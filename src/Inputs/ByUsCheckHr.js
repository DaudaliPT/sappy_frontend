import React, { Component } from "react";
import { FormGroup, InputGroup } from "reactstrap";

// var $ = window.$;
// const byUs = window.byUs;

class ByUsCheckHr extends Component {
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
    let stateColor, stateMsg;
    if (this.props.state) {
      stateColor = this.props.state.split('|')[0];
      stateMsg = this.props.state.split('|')[1];
    }


    let checked = this.props.value != null ? this.props.value : false;
    let ON = "icon ion-ios-checkmark-circle-outline";
    let OFF = "icon ion-ios-radio-button-off";//-ios-close-circle-outline";
    let color = this.props.color || "success";

    let classNames = "";
    if (checked) {
      classNames = color + " " + ON
    } else {
      classNames = "inactive " + OFF
    }

    return (
      < div className="checkbox-custom checkbox-primary" >
        <input className="checkbox"
          type="checkbox"
          name={this.props.name}
          id={this.props.name}
          value={checked}
          onChange={this.handleToggle}
          disabled={this.props.disabled || false} />
        <label htmlFor={this.props.name} >{this.props.label}</label>
      </div >

    );
  }
}

ByUsCheckHr.defaultProps = {
  name: "",
  disabled: false,
  onChange: (newValue, name) => {
    console.log(name, newValue);
  },
  value: ""
};

export default ByUsCheckHr;
