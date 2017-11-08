import React, { Component } from "react";
import { TextBox, TextBoxNumeric, ComboBox, Date, Toggle, Flag, IconToggle, IconEdit } from "../../../Inputs";
const sappy = window.sappy;

class PosHeader extends Component {
  render() {
    let getProperInputForField = headerField => {
      if (!headerField) return null;
      let classNames = "col-3  col-sm-2 col-lg-1 col-xl-1 col-xxl-1 px-5";
      classNames = "col-" + headerField.gridSize + " px-5";

      let route = headerField.api;
      if (route && route.indexOf("<") > -1) {
        Object.keys(this.props.docData).forEach(
          field => (route = route.replace("<" + field + ">", this.props.docData[field]))
        );
      }

      let enabled = !headerField.disabled;

      let commonProps = {
        name: headerField.name,
        label: headerField.label,
        disabled: !enabled,
        value: this.props.docData[headerField.name],
        state:
          this.props.docData[headerField.name + "_VALIDATEMSG"] || this.props.docData[headerField.name + "_LOGICMSG"],
        onChange: this.props.onFieldChange,
        getOptionsApiRoute: route,
        options: headerField.options
      };

      let input = null;
      if (headerField.type === "text") input = <TextBox {...commonProps} />;
      else if (headerField.type === "textarea") input = <TextBox {...commonProps} type="textarea" />;
      else if (headerField.type === "integer") input = <TextBoxNumeric {...commonProps} valueType="integer" />;
      else if (headerField.type === "combo") input = <ComboBox {...commonProps} />;
      else if (headerField.type === "date") input = <Date {...commonProps} />;
      else if (headerField.type === "bool") input = <Toggle {...commonProps} />;
      else if (headerField.type.startsWith("flag")) {
        let color = headerField.type.split("|")[1];
        input = <Flag {...commonProps} color={color} />;
      } else if (headerField.type.startsWith("iconToggle")) {
        classNames = "";
        commonProps.ON = headerField.ON;
        commonProps.OFF = headerField.OFF;
        input = <IconToggle {...commonProps} />;
      } else if (headerField.type.startsWith("iconEdit")) {
        classNames = "";
        commonProps.gridSize = headerField.gridSize;
        commonProps.ON = headerField.ON;
        commonProps.OFF = headerField.OFF;
        input = <IconEdit {...commonProps} />;
      }

      return (
        <div key={"headerfield_" + headerField.name} className={classNames}>
          {" "}{input}{" "}
        </div>
      );
    };

    let renderHeaderFields = () => {
      let fields = this.props.fields;
      let ret = [];
      Object.keys(fields).forEach(lineKey => {
        if (lineKey === "icons") return;

        let headerLine = fields[lineKey];
        let headerLineFields = [];
        for (var ix = 0; ix < headerLine.length; ix++) {
          headerLineFields.push(getProperInputForField(headerLine[ix]));
        }
        ret.push(
          <div key={"headerrow_" + lineKey} className="row mx--5">
            {" "}{headerLineFields}
          </div>
        );
      });

      return ret;
    };

    let renderHeaderIcons = () => {
      let ret = [];
      let headerLine = this.props.fields.icons;
      let headerLineFields = [];
      for (var ix = 0; ix < headerLine.length; ix++) {
        headerLineFields.push(getProperInputForField(headerLine[ix]));
      }
      ret.push(
        <div key={"headericons"} className="row mx--5">
          {headerLineFields}
        </div>
      );

      return ret;
    };

    let title = this.props.title;

    return (
      <div id="posHeader">
        <h4 className="posTitle">
          {title}
        </h4>

        <div className="actions">
          {renderHeaderIcons()}
        </div>
        <div className="fields">
          {renderHeaderFields()}
        </div>

        <div className="userMenu" title={"Sessão de " + sappy.sessionInfo.user.NAME}>
          <span className="avatar avatar-online">
            {<img src="img/avatar_male.png" alt="..." />}
            {/* <i className="icon md-account" aria-hidden="true" /> */}
            {<i />}
          </span>
        </div>
      </div>
    );
  }
}

PosHeader.defaultProps = {
  title: "PosHeader title",
  docData: {},
  fields: {},
  api: "", //important for combos
  onFieldChange: changeInfo => {}
};

export default PosHeader;
