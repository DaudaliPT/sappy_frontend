import React, { Component } from "react";
import axios from "axios";
var sappy = window.sappy;

import { ComboBox, ButtonGroup } from "../../Inputs";


const tYEStNO_options = [
  { value: 'Y', label: 'Sim' },
  { value: 'N', label: 'Não' }
]

class CmpCondicoes extends Component {
  render() {
    let that = this
    let items = this.props.items || [];
    let alerts = this.props.alerts || [];

    // Build Input Props 
    let bip = (name, props) => {
      props.name = name;

      // Valores em arrays
      let arrName = name.split('#')[0]
      let arrIndex = sappy.getNum(name.split('#')[1])
      let propName = name.split('#')[2]

      let obj = items[arrIndex] || {}
      props.value = obj[propName]

      props.state = alerts[name];
      props.onChange = this.props.onFieldChange;
      props.disabled = props.disabled || !this.props.editable;

      return props;
    }

    let renderCondicoes = () => {
      let nrItems = items.length
      let ret = []
      for (var index = 0; index < nrItems; index++) {
        let name = `${this.props.name}#${index}#`
        let line = items[index] || {}
        let cboValuesProps = { label: (index === 0 ? "Igual a" : "") }
        let selectedField = this.props.fieldsAllowed.find(item => item.value === line.FIELD);
        if (selectedField) {
          if (selectedField.optionsApi) cboValuesProps.getOptionsApiRoute = selectedField.optionsApi
          if (!selectedField.optionsApi) cboValuesProps.options = tYEStNO_options
          if (selectedField.multi) cboValuesProps.multi = true
        }

        ret.push(
          <div key={`${name}`} className="row">
            <div className="col-12 col-md-4 col-xl-3 pr-md-1">
              <ComboBox {...bip(`${name}FIELD`, { label: (index === 0 ? "Campo" : ""), options: this.props.fieldsAllowed }) } />
            </div>
            <div className="col-9 col-md-5 col-xl-5 pl-md-1 pr-1">
              <ComboBox {...bip(`${name}VALUE`, cboValuesProps) } />
            </div>
            <div className="col-3 col-md-2 col-xl-1 pl-1">
              <ButtonGroup  {...bip(`${name}ADDREMOVE`, {
                label: (index === 0 ? " " : ""),
                buttons: [
                  { value: "-", label: "-", disabled: !this.props.editable, className: "btn btn-secondary btn-circle-30px btn-outline", onClick: this.props.onClick_AddRemove },
                  { value: "+", label: "+", disabled: !this.props.editable, className: "btn btn-secondary btn-circle-30px btn-outline", onClick: this.props.onClick_AddRemove }
                ]
              }) } />
            </div>
          </div>
        )
      }
      return ret;
    }

    return (
      <div style={{ border: "1px solid #EEE", marginLeft: "30px", padding: "15px", backgroundColor: "#fcfcfc" }}>
        {renderCondicoes()}
      </div>
    );
  }
}

export default CmpCondicoes;
