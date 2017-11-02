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
    let stateColor, stateMsg;
    if (this.props.state) {
      stateColor = this.props.state.split("|")[0];
      stateMsg = this.props.state.split("|")[1];
    }

    let value = this.props.value;
    value = value === 1 || value === "1" || value === "Y" ? 1 : 0;

    let checked = value ? true : false;
    let ON = "icon fa-truck";
    let OFF = "icon fa-truck";
    let color = this.props.color || "success";

    let classNames = "";
    if (checked) {
      classNames = color + " " + ON;
    } else {
      classNames = "inactive " + OFF;
    }

    return (
      <FormGroup color={stateColor} data-tip={this.props.label} title={stateMsg}>
        {/*{renderLabel()}*/}
        <InputGroup>
          <div className="flag" onClick={this.handleToggle}>
            <i className={classNames} aria-hidden="true" />
          </div>
        </InputGroup>

        {/* {stateMsg && <FormFeedback>{stateMsg}</FormFeedback>} */}
      </FormGroup>
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
