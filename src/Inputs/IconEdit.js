import React, { Component } from "react";
import { FormGroup, InputGroup } from "reactstrap";
import Textbox from "./TextBox";
var $ = window.$;
// const sappy = window.sappy;

class Flag extends Component {
  constructor(props) {
    super(props);
    this.handleToggle = this.handleToggle.bind(this);
    this.state = { opened: false };
  }

  handleToggle() {
    let that = this;
    if (this.state.opened) {
      // this.setState({ opened: false });
      // o lost focus do campo fará esconder
    } else {
      this.setState({ opened: true }, () => {
        let $el = $(".sappy-icon>div.opened input");
        setTimeout(e => $el.focus(), 100);
      });
    }
  }

  render() {
    let that = this;

    let value = this.props.value;
    let checked = value ? true : false;
    let classNames = "icon ";

    if (checked) {
      classNames += this.props.ON;
    } else {
      classNames += this.props.OFF;
    }

    return (
      <div className={"sappy-icon"}>
        <i className={classNames} aria-hidden="true" onClick={this.handleToggle} />
        <i className={this.state.opened ? "opened" : "closed"} aria-hidden="true" />

        <div className={"opened size" + this.props.gridSize + (this.state.opened ? "" : " hidden-xxl-down")}>
          <Textbox {...this.props} onBlur={e => setTimeout(e => that.setState({ opened: false }), 100)} />
        </div>
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
