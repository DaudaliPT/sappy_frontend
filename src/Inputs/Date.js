import React, { Component } from "react";
import PropTypes from 'prop-types';
import { FormGroup, FormFeedback, InputGroup, Input } from "reactstrap";
import moment from 'moment';

import DatePicker from 'react-datepicker'
import './Date.css';
import "./react-datepicker_modified.css";
var sappy = window.sappy;


class CustomInputForDatePicker extends React.Component {
  render() {
    return (
      <button
        className="input-date-btn  vertical-align-middle"
        onClick={this.props.onClick}
        tabIndex="-1">

        <i className="icon wb-calendar" />
      </button>
    )
  }
}

CustomInputForDatePicker.propTypes = {
  onClick: PropTypes.func,
  value: PropTypes.string
};

class Date extends Component {
  constructor(props) {
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleValidate = this.handleValidate.bind(this);

    this.state = this.createStateFromProps(props)
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.createStateFromProps(nextProps))
  }

  createStateFromProps(props) {
    let dateValue = sappy.unformat.date(props.value)

    return {
      receivedValue: dateValue,
      value: sappy.format.date(dateValue),
      pickerValue: dateValue && moment(dateValue, "YYYY-MM-DD")
    }
  }

  handleInputChange(e) {
    if (this.props.disabled) return
    let dateValue = sappy.unformat.date(e.target.value)

    this.setState({
      value: e.target.value,
      pickerValue: dateValue && moment(dateValue, "YYYY-MM-DD")
    })
  }

  handleValidate(val) {
    if (this.props.disabled) return
    let rawValue = sappy.unformat.date(val)

    if (sappy.isEqual(rawValue, this.state.receivedValue)) return this.setState(this.createStateFromProps({ value: this.state.receivedValue }))

    this.setState(this.createStateFromProps({ value: rawValue }))
    this.props.onChange({
      fieldName: this.props.name
      , rawValue
      , formatedValue: sappy.format.date(rawValue)
    });


  }

  render() {
    let stateColor, stateMsg;
    if (this.props.state) {
      stateColor = this.props.state.split('|')[0];
      stateMsg = this.props.state.split('|')[1];
    }

    return (
      <FormGroup color={stateColor} className={this.props.label ? "" : "no-label"} data-tip={this.props.label} title={stateMsg} >
        <InputGroup className="input-date">
          <Input
            type="text"
            id={this.props.name}
            value={this.state.value}
            placeholder={this.props.placeholder}
            disabled={this.props.disabled}
            onChange={e => this.handleInputChange(e)}
            onBlur={e => this.handleValidate(e.target.value)}
          />
          <DatePicker
            customInput={<CustomInputForDatePicker />}
            locale="pt"
            showMonthDropdown
            showYearDropdown
            selected={this.state.pickerValue}
            onChange={this.handleValidate} />

        </InputGroup>
        {stateMsg && <FormFeedback>{stateMsg}</FormFeedback>}
      </FormGroup>
    );
  }
}

Date.defaultProps = {
  name: "Date",
  disabled: false,
  onChange: (changeInfo) => {
    console.log(changeInfo);
  },
  value: ""
};

export default Date;
