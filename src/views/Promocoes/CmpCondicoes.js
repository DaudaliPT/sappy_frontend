import React, { Component } from "react";
import axios from "axios";
var sappy = window.sappy;

import { ComboBox, ButtonGroup } from "../../Inputs";


const tYEStNO_options = [
  { value: 'Y', label: 'Sim' },
  { value: 'N', label: 'Não' }
]

class CmpCondicoes extends Component {
  constructor(props) {
    super(props)

    this.state = {
      chkSpecific: !!props[props.name + "_SPECIFIC"]
    }
  }

  componentWillReceiveProps(nextProps) {
    let v = nextProps[nextProps.name + "_SPECIFIC"]
    if (v) this.setState({ chkSpecific: !!v })
  }

  render() {
    let that = this
    let items = this.props.items || [];
    let alerts = this.props.alerts || [];

    let nameChkInclude = "chk" + this.props.name + "_SPECIFIC"
    let labelChkInclude = "";
    let includeOptionsRoute = ""
    if (this.props.name === "IC") { labelChkInclude = "Incluir os seguintes clientes especificos:"; includeOptionsRoute = "/api/cbo/ocrd/c" }
    if (this.props.name === "EC") { labelChkInclude = "Excluir os seguintes clientes especificos:"; includeOptionsRoute = "/api/cbo/ocrd/c" }
    if (this.props.name === "IA") { labelChkInclude = "Incluir os seguintes artigos especificos:"; includeOptionsRoute = "/api/cbo/oitm/" }
    if (this.props.name === "EA") { labelChkInclude = "Excluir os seguintes artigos especificos:"; includeOptionsRoute = "/api/cbo/oitm/" }

    // Build Input Props 
    let bip = (name, props) => {
      props.name = name;

      if (name.indexOf("#") > -1) {
        // Valores em arrays
        let arrName = name.split('#')[0]
        let arrIndex = sappy.getNum(name.split('#')[1])
        let propName = name.split('#')[2]

        let obj = items[arrIndex] || {}
        props.value = obj[propName]

      } else {
        //Normal
        props.value = this.props[name];
      }
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
            <div className="col-12 col-md-6 col-lg-5 pr-md-1">
              <ComboBox {...bip(`${name}FIELD`, { label: (index === 0 ? "Campo" : ""), options: this.props.fieldsAllowed }) } />
            </div>
            <div className="col-9 col-md-4 col-lg-4 pl-md-1 pr-1">
              <ComboBox {...bip(`${name}VALUE`, cboValuesProps) } />
            </div>
            <div className="col-3 col-md-2 col-lg-1 pl-1">
              <ButtonGroup  {
                ...bip(`${name}ADDREMOVE`,
                  {
                    label: (index === 0 ? " " : ""),
                    buttons: [
                      { value: "-", label: "-", disabled: !this.props.editable, className: "btn btn-secondary btn-circle-30px btn-outline", onClick: this.props.onClick_AddRemove },
                      { value: "+", label: "+", disabled: !this.props.editable, className: "btn btn-secondary btn-circle-30px btn-outline", onClick: this.props.onClick_AddRemove }
                    ]
                  })
              } />
            </div>
          </div>
        )
      }
      return ret;
    }
    return (
      <div style={{ border: "1px solid #EEE", marginLeft: "30px", padding: "15px", backgroundColor: "#fcfcfc" }}>
        {renderCondicoes()}

        <div className="checkbox-custom checkbox-primary" style={{ display: "block" }}>
          <input type="checkbox"
            checked={this.state.chkSpecific}
            onChange={e => that.setState({ chkSpecific: !that.state.chkSpecific })}
            disabled={!this.props.editable}
            id={nameChkInclude}
          />
          <label htmlFor={nameChkInclude}>{labelChkInclude}</label>
        </div>
        {
          this.state.chkSpecific &&

          <div className="row">
            <div className="col-12 col-md-6 col-lg-5 pr-md-1 one-value-per-line">
              <ComboBox {...bip(`${this.props.name}_SPECIFIC`, { label: "", multi: true, getOptionsApiRoute: includeOptionsRoute }) } />
            </div>
          </div>
        }
      </div>
    );
  }
}

export default CmpCondicoes;
