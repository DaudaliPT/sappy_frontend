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
    let inputType = "text"
    if ("quantity,price,amount,integer".indexOf(type) > -1) formatedValue = value === null ? null : sappy.getNum(value)
    if ("quantity,price,amount,integer".indexOf(type) > -1) inputType = "number"

    return (<input
      ref={(node) => this.input = node}
      type={inputType}
      onBlur={this.props.onBlur}
      className="form-control"
      onFocus={e => {
        setTimeout(() => {
          that.input.setSelectionRange(0, 9999);
        }, 0)
      }
      } onMouseUp={e => e.preventDefault()}
      defaultValue={formatedValue}
    />);
  }
}

let Editors = {
  Default: DefaultEditor
}
export default Editors;