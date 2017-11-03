import React, { Component } from "react";
import { TextBox, TextBoxNumeric, ComboBox, Date, Toggle, Flag } from "../../../Inputs";
// import { Button } from "reactstrap";
import Panel from "../../../components/Panel";

class DocHeader extends Component {
  render() {
    let getProperInputForField = headerField => {
      if (!headerField) return null;
      let classNames = "col-3  col-sm-2 col-lg-1 col-xl-1 col-xxl-1 px-5";
      if (headerField.gridSize === 2) classNames = "col-6 col-sm-4 col-lg-2 col-xl-2 col-xxl-2 px-5";
      if (headerField.gridSize === 4) classNames = "col-12 col-sm-4 col-lg-2 col-xl-2 col-xxl-2 px-5";
      if (headerField.gridSize === 5) classNames = "col-9          col-lg-5 col-xl-5 col-xxl-5 px-5"; // esepecial para obeservações e Inconf
      if (headerField.gridSize === 6) classNames = "col-12          col-lg-6                    px-5";
      if (headerField.gridSize === 12) classNames = "col-12                                     px-5";

      let route = headerField.api;
      if (route && route.indexOf("<") > -1) {
        Object.keys(this.props.docData).forEach(field => (route = route.replace("<" + field + ">", this.props.docData[field])));
      }

      let enabled = true;
      if (this.props.docData.DOCNUM > 0) {
        enabled = this.props.editable && headerField.savedEditable;
      } else {
        enabled = !headerField.disabled;
      }

      let commonProps = {
        name: headerField.name,
        label: headerField.label,
        disabled: !enabled,
        value: this.props.docData[headerField.name],
        state: this.props.docData[headerField.name + "_VALIDATEMSG"] || this.props.docData[headerField.name + "_LOGICMSG"],
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
        if (lineKey === "sidebar") return;

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

    // let expandIcon = this.props.expanded ? "wb-minus" : "wb-plus";
    // let editIcon = this.props.editable ? "wb-close" : "wb-edit";
    // let hiddenClass = this.props.expanded ? "" : "hidden-xxl-down";
    // let notHiddenClass = this.props.expanded ? "hidden-xxl-down" : "";
    let title = this.props.title;
    if (this.props.docData.DOCNUM > 0) title += " (" + this.props.docData.DOCNUM + ")";

    let headerActions = [
      {
        name: "toogleEdit",
        text: "Alterar",
        color: !this.props.editable ? "" : "danger",
        visible: !!this.props.docData.DOCNUM,
        icon: this.props.editable ? "fa-close" : "fa-edit",
        onClick: this.props.toggleEditable
      }
    ];

    return (
      <div id="docHeader">
        <Panel
          title={title}
          colapsedInfo={this.props.docData.CARDCODE && " (" + this.props.docData.CARDCODE + " - " + this.props.docData.CARDNAME + ")"}
          expanded={this.props.expanded}
          onToogleExpand={this.props.toggleHeader}
          actions={headerActions}
        >
          {renderHeaderFields()}
        </Panel>
      </div>
    );
  }
}

DocHeader.defaultProps = {
  title: "DocHeader title",
  docData: {},
  fields: {},
  api: "", //important for combos
  onFieldChange: changeInfo => {}
};

export default DocHeader;
