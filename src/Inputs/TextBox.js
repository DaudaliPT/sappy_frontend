import React, { Component } from "react";
import { FormGroup, FormFeedback, Button, InputGroup, Input } from "reactstrap";
const sappy = window.sappy;

class TextBox extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);

    this.state = this.createStateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.createStateFromProps(nextProps));
  }

  createStateFromProps(props) {
    return { receivedValue: props.value, value: props.value };
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  handleBlur(e) {
    let formatedValue = e.target.value;

    if (this.props.valueType === "discount") {
      formatedValue = sappy.formatUserDisc(sappy.parseUserDisc(formatedValue));
    }

    if (sappy.isDiferent(formatedValue, this.state.receivedValue) || sappy.isDiferent(formatedValue, e.target.value)) {
      let rawValue = formatedValue;
      let changeInfo = { fieldName: this.props.name, rawValue, formatedValue };
      this.props.onChange(changeInfo);
    }

    if (this.props.onBlur) this.props.onBlur(e);
  }

  render() {
    let that = this;

    var renderRightButton = () => {
      if (this.props.rightButton) {
        let color = "success";
        if (this.props.rightButton === "-") color = "warning";

        return (
          <span className="input-group-btn">
            <Button
              color={color}
              outline
              id={this.props.name + "_rbtn"}
              className="right-button"
              disabled={this.props.disabled || false}
              onClick={() => {
                that.props.onRightButtonClick(that);
              }}
            >
              {this.props.rightButton}
            </Button>
          </span>
        );
      }
    };

    let stateColor, stateMsg;
    if (this.props.state) {
      stateColor = this.props.state.split("|")[0];
      stateMsg = this.props.state.split("|")[1];
    }

    return (
      <FormGroup color={stateColor} className={this.props.label ? "" : "no-label"} data-tip={this.props.label} title={stateMsg}>
        {/*{renderLabel()}*/}
        <InputGroup>
          <Input
            type={this.props.type}
            ref={this.props.name}
            id={this.props.name}
            value={this.state.value || ""}
            placeholder={this.props.placeholder}
            disabled={this.props.disabled}
            onChange={e => this.handleChange(e)}
            onBlur={e => this.handleBlur(e)}
          />
          {renderRightButton()}
        </InputGroup>

        {stateMsg &&
          <FormFeedback>
            {stateMsg}
          </FormFeedback>}
      </FormGroup>
    );
  }
}

TextBox.defaultProps = {
  name: "TextBox",
  type: "text", //"text or textarea"
  disabled: false,
  onChange: (newValue, name) => {
    console.log(name, newValue);
  },
  value: ""
};

export default TextBox;
