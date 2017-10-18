import React, { Component } from "react";
import { FormGroup, FormFeedback, Button, InputGroup, Input } from "reactstrap";
const sappy = window.sappy;

class ButtonGroup extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);

    this.state = this.createStateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.createStateFromProps(nextProps))
  }

  createStateFromProps(props) {
    return { receivedValue: props.value, value: props.value }
  }

  handleChange(e) {
    this.setState({ value: e.target.value })
  }

  handleBlur(e) {
    let formatedValue = e.target.value;

    if (this.props.valueType === "discount") {
      formatedValue = sappy.formatUserDisc(sappy.parseUserDisc(formatedValue))
    }

    if (sappy.isDiferent(formatedValue, this.state.receivedValue)
      || sappy.isDiferent(formatedValue, e.target.value)) {
      let rawValue = formatedValue
      let changeInfo = { fieldName: this.props.name, rawValue, formatedValue };
      this.props.onChange(changeInfo);
    }
  }

  render() {
    let that = this;

    var renderButtons = () => {

      return this.props.buttons.map(btn => {
        let color = btn.color || "success";
        return <span
          key={this.props.name + "_" + btn.value + "_btn"}
          className="input-group-btn">
          <button type="button"
            id={this.props.name + "_" + btn.value + "_btn"}
            {...btn}
          >
            {btn.label}
          </button>
        </span>
      });
    };

    let stateColor, stateMsg;
    if (this.props.state) {
      stateColor = this.props.state.split('|')[0];
      stateMsg = this.props.state.split('|')[1];
    }

    return (
      <FormGroup color={stateColor} className={this.props.label ? "" : "no-label"} data-tip={this.props.label} title={stateMsg}>
        <InputGroup>

          {renderButtons()}

        </InputGroup>

        {stateMsg && <FormFeedback>{stateMsg}</FormFeedback>}
      </FormGroup>
    );
  }
}

ButtonGroup.defaultProps = {
  name: "ButtonGroup",
  type: "text", //"text or textarea"
  disabled: false,
  onChange: (newValue, name) => {
    console.log(name, newValue);
  },
  value: ""
};

export default ButtonGroup;
