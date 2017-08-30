import React, { Component } from "react";
import { FormGroup, InputGroup } from "reactstrap";

// var $ = window.$;
// const byUs = window.byUs;

class ByUsFlag extends Component {
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
    let ON = "icon ion-ios-flag";
    let OFF = "icon ion-ios-flag-outline";
    let color = this.props.color || "success";

    let classNames = "";
    if (checked) {
      classNames = color + " " + ON
    } else {
      classNames = "inactive " + OFF
    }

    return (
      <FormGroup color={stateColor} data-tip={this.props.label} title={stateMsg}>
        {/*{renderLabel()}*/}
        <InputGroup>

          <div className="flag" onClick={this.handleToggle} >
            <i className={classNames} aria-hidden="true" />
          </div >

        </InputGroup>

        {/* {stateMsg && <FormFeedback>{stateMsg}</FormFeedback>} */}
      </FormGroup>
    );
  }
}

ByUsFlag.defaultProps = {
  name: "",
  disabled: false,
  onChange: (newValue, name) => {
    console.log(name, newValue);
  },
  value: ""
};

export default ByUsFlag;
