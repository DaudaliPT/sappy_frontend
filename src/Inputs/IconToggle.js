import React, { Component } from "react";
import { FormGroup, InputGroup } from "reactstrap";

// var $ = window.$;
// const sappy = window.sappy;

class Flag extends Component {
  constructor(props) {
    super(props);
    this.handleToggle = this.handleToggle.bind(this);
  }

  handleToggle() {
    if (this.props.disabled) return;

    let value = this.props.value;
    value = value === 1 || value === "1" || value === "Y" ? 0 : 1;

    let changeInfo = { fieldName: this.props.name, rawValue: value, formatedValue: value };

    this.props.onChange(changeInfo);
  }

  render() {
    let value = this.props.value;
    value = value === 1 || value === "1" || value === "Y" ? 1 : 0;
    let checked = value ? true : false;
    let classNames = "icon ";
    if (checked) {
      classNames += this.props.ON;
    } else {
      classNames += this.props.OFF;
    }

    return (
      <div className="sappy-icon" onClick={this.handleToggle}>
        <i className={classNames} aria-hidden="true" />
      </div>
    );
  }
}

Flag.defaultProps = {
  name: "",
  disabled: false,
  onChange: (newValue, name) => {
    console.log(name, newValue);
  },
  value: ""
};

export default Flag;
