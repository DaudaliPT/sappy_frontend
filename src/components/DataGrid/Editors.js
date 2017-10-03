import React, { Component } from "react";
import ReactDOM from 'react-dom';
// const { editors: { EditorBase } } = require('react-data-grid/packages/react-data-grid/dist/react-data-grid');
const sappy = window.sappy

class DefaultEditor extends Component {

  getStyle() {
    return {
      width: '100%'
    };
  }

  getValue() {
    let updated = {};
    updated[this.props.column.key] = this.getInputNode().value;
    return updated;
  }

  inheritContainerStyles() {
    return true;
  }

  getInputNode() {
    return ReactDOM.findDOMNode(this);
  }

  onClick() {
    this.getInputNode().focus();
  }

  onDoubleClick() {
    this.getInputNode().focus();
  }

  render() {
    let that = this;
    let type = this.props.column.type;
    let value = this.props.value;
    let formatedValue = value;
    if (type === "quantity") formatedValue = value === null ? null : sappy.format.quantity(sappy.getNum(value))
    else if (type === "price") formatedValue = value === null ? null : sappy.format.price(sappy.getNum(value))
    else if (type === "amount") formatedValue = value === null ? null : sappy.format.amount(sappy.getNum(value))
    else if (type === "integer") formatedValue = value === null ? null : sappy.format.integer(sappy.getNum(value))
    else if (type === "date") formatedValue = value === null ? null : sappy.format.date(sappy.unformat.date(value));
    return (<input
      ref={(node) => this.input = node}
      type="text" onBlur={this.props.onBlur}
      className="form-control"
      onFocus={e => {
        debugger
        that.input.select()

      }
      } onMouseUp={e => false}
      defaultValue={formatedValue}
    />);
  }
}

let Editors = {
  Default: DefaultEditor
}
export default Editors;