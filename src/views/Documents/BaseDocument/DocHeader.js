
import React, { Component } from "react";
import { ByUsTextBox, ByUsTextBoxNumeric, ByUsComboBox, ByUsDate, ByUsToggle, ByUsFlag } from "../../../Inputs";
// import Switch from 'react-bootstrap-switch';//'react-switchery';
import ToggleButton from 'react-toggle-button'

class DocHeader extends Component {
  render() {


    let getProperInputForField = (headerField) => {
      if (!headerField) return null;
      let classNames = "col-3  col-sm-2 col-lg-1 col-xl-1 col-xxl-1 px-5";
      if (headerField.gridSize === 2) classNames = "col-6 col-sm-4 col-lg-2 col-xl-2 col-xxl-2 px-5";
      if (headerField.gridSize === 4) classNames = "col-12 col-sm-4 col-lg-2 col-xl-2 col-xxl-2 px-5";
      if (headerField.gridSize === 5) classNames = "col-9          col-lg-5 col-xl-5 col-xxl-5 px-5"; // esepecial para obeservações e Inconf
      if (headerField.gridSize === 6) classNames = "col-12          col-lg-6                    px-5";
      if (headerField.gridSize === 12) classNames = "col-12                                     px-5";

      let route = headerField.api;
      if (route && route.indexOf('<') > -1) {
        Object.keys(this.props.docData).forEach(field => route = route.replace('<' + field + '>', this.props.docData[field]))
      }

      let commonProps = {
        name: headerField.name,
        label: headerField.label,
        disabled: this.props.docData.DOCNUM > 0 ? true : headerField.disabled,
        value: this.props.docData[headerField.name],
        state: this.props.docData[headerField.name + "_VALIDATEMSG"] || this.props.docData[headerField.name + "_LOGICMSG"],
        onChange: this.props.onFieldChange,
        getOptionsApiRoute: route,
        options: headerField.options
      };

      let input = null;
      if (headerField.type === "text") input = <ByUsTextBox {...commonProps} />
      else if (headerField.type === "textarea") input = <ByUsTextBox {...commonProps} type="textarea" />
      else if (headerField.type === "integer") input = <ByUsTextBoxNumeric {...commonProps} valueType="integer" />
      else if (headerField.type === "combo") input = <ByUsComboBox {...commonProps } />
      else if (headerField.type === "date") input = <ByUsDate {...commonProps} />
      else if (headerField.type === "bool") input = <ByUsToggle {...commonProps} />
      else if (headerField.type.startsWith('flag')) {
        let color = headerField.type.split('|')[1];
        input = <ByUsFlag {...commonProps} color={color} />
      }

      return <div key={"headerfield_" + headerField.name} className={classNames}> {input} </div>;
    }

    let renderHeaderFields = () => {
      let fields = this.props.fields;
      let ret = [];
      Object.keys(fields).forEach(lineKey => {
        let headerLine = fields[lineKey];
        let headerLineFields = [];
        for (var ix = 0; ix < headerLine.length; ix++) {
          headerLineFields.push(getProperInputForField(headerLine[ix]))
        }
        ret.push(<div key={"headerrow_" + lineKey} className="row mx--5" > {headerLineFields}</div >)
      })

      return ret;
    };

    let expandIcon = this.props.expanded ? "wb-minus" : "wb-plus";
    let hiddenClass = this.props.expanded ? "" : "hidden-xxl-down";
    let notHiddenClass = this.props.expanded ? "hidden-xxl-down" : "";
    let title = this.props.title;
    if (this.props.docData.DOCNUM > 0) title += " (" + this.props.docData.DOCNUM + ")";

    return (
      <div id="docHeader">
        <div className="header-title">
          <h3 className="header-title-text" onClick={this.props.toggleHeader}>{title}</h3>
          <div className="header-actions">
            <a className={"header-action icon " + expandIcon} onClick={this.props.toggleHeader}></a>
          </div>
        </div>
        <div className={"header-body " + hiddenClass}>
          {renderHeaderFields()}
        </div>
        <div className={"header-body " + notHiddenClass}>
          {this.props.docData.CARDCODE + " - " + this.props.docData.CARDNAME}
        </div>
      </div>
    );
  }
}

DocHeader.defaultProps = {
  title: "DocHeader title",
  docData: {},
  fields: {},
  api: '', //important for combos
  onFieldChange: changeInfo => { }
}

export default DocHeader;
