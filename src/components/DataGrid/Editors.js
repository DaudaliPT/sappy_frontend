import React, { Component } from "react";
import ReactDOM from "react-dom";
// const { editors: { EditorBase } } = require('react-data-grid/packages/react-data-grid/dist/react-data-grid');
const sappy = window.sappy;

class DefaultEditor extends Component {
  getStyle() {
    return {
      width: "100%"
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
    let name = this.props.column.name;
    let value = this.props.value;
    let inputType = "text";
    let formatedValue = value;

    return (
      <input
        ref={node => (this.input = node)}
        type={inputType}
        onBlur={this.props.onBlur}
        className="form-control"
        onFocus={e => {
          let previousValue = that.props.rowData[name];
          if ("quantity,price,amount,integer".indexOf(type) > -1) previousValue = previousValue === null ? null : sappy.getNum(previousValue);

          setTimeout(() => {
            // Esta condição é para não perder o 1º caracter digitado com o teclado
            if ((that.input && that.input.value !== previousValue) || !previousValue) return;

            that.input.setSelectionRange(0, 9999);
          }, 0);
        }}
        onMouseUp={e => e.preventDefault()}
        defaultValue={formatedValue}
      />
    );
  }
}

let Editors = {
  Default: DefaultEditor
};
export default Editors;
