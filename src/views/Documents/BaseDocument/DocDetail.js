
import React, { PureComponent } from "react";
import ByUsDataGrid from "../../../components/ByUsDataGrid";
import { ByUsTextBox, ByUsTextBoxNumeric, ByUsComboBox, ByUsDate, ByUsToggle, ByUsFlag, ByUsCheck } from "../../../Inputs";

class DocDetail extends PureComponent {
  constructor(props) {
    super(props);

    this.getSelectedRows = this.getSelectedRows.bind(this);
  }

  getSelectedRows() {
    return this.refs.grid.getState().selectedIndexes.map(i => this.refs.grid.getRowAt(i).LINENUM)
  }

  render() {

    let hasSidebar = (Object.keys(this.props.sidebarFields).length > 0)

    let getProperInputForField = (sidebarField) => {
      if (!sidebarField) return null;

      let classNames = "";
      let style = { width: sidebarField.width }

      let route = sidebarField.api;
      if (route && route.indexOf('<') > -1) {
        Object.keys(this.props.docData).forEach(field => route = route.replace('<' + field + '>', this.props.docData[field]))
      }


      let commonProps = {
        name: sidebarField.name,
        label: sidebarField.label,
        disabled: this.props.docData.DOCNUM > 0 ? true : sidebarField.disabled,
        value: this.props.docData[sidebarField.name],
        state: this.props.docData[sidebarField.name + "_VALIDATEMSG"] || this.props.docData[sidebarField.name + "_LOGICMSG"],
        onChange: this.props.onSideBarFieldChange,
        getOptionsApiRoute: route,
        options: sidebarField.options
      };

      let input = null;
      if (sidebarField.type === "text") input = <ByUsTextBox {...commonProps} />
      else if (sidebarField.type === "textarea") input = <ByUsTextBox {...commonProps} type="textarea" />
      else if (sidebarField.type === "integer") input = <ByUsTextBoxNumeric {...commonProps} valueType="integer" />
      else if (sidebarField.type === "percent") input = <ByUsTextBoxNumeric {...commonProps} valueType="percent" />
      else if (sidebarField.type === "combo") input = <ByUsComboBox {...commonProps } />
      else if (sidebarField.type === "date") input = <ByUsDate {...commonProps} />
      else if (sidebarField.type === "bool") input = <ByUsToggle {...commonProps} />
      else if (sidebarField.type.startsWith('flag')) {
        let color = sidebarField.type.split('|')[1];
        input = <ByUsFlag {...commonProps} color={color} />
      }
      else if (sidebarField.type.startsWith('check')) {
        let color = sidebarField.type.split('|')[1];
        input = <ByUsCheck {...commonProps} color={color} />
      }

      return <div key={"sidebarField_" + sidebarField.name} className={classNames} style={style}> {input} </div>;
    }

    let renderSidebarFields = () => {
      let fields = this.props.sidebarFields;
      let ret = [];
      Object.keys(fields).forEach(lineKey => {

        let headerLine = fields[lineKey];
        let headerLineFields = [];
        for (var ix = 0; ix < headerLine.length; ix++) {
          headerLineFields.push(getProperInputForField(headerLine[ix]))
        }
        let style = { display: "inline-flex", width: "100%" }
        ret.push(<div key={"sidebarRow_" + lineKey} style={style} > {headerLineFields}</div>)
      })

      return ret;
    };

    let docDetailGridStyle = {}
    let docDetailSidebarStyle = {}
    if (Object.keys(this.props.sidebarFields).length > 0) {
      //colocar sidebar
      docDetailGridStyle = { width: "calc(100% - 200px)" }
      docDetailSidebarStyle = { width: "190px" }
    }

    return (
      <div id="docDetail">
        <div id="docDetailGrid" style={docDetailGridStyle}  >
          <ByUsDataGrid
            ref="grid"
            height={this.props.height}
            fields={this.props.fields}
            disabled={this.props.docData.DOCNUM > 0 ? true : false}
            rows={this.props.docData.LINES}
            onRowUpdate={this.props.onRowUpdate}
            onRowSelect={this.props.onRowSelect}
          ></ByUsDataGrid>
        </div >
        {hasSidebar &&
          <div id="docDetailSidebar" style={docDetailSidebarStyle} >
            {renderSidebarFields()}
          </div >
        }
      </div >
    );
  }
}
DocDetail.defaultProps = {
  height: 300,
  fields: [],
  sidebarFields: [],
  rows: [],
  onRowUpdate: (currentRow, updated) => { },
  onRowSelect: (selectedIndexes) => { },
  onSideBarFieldChange: changeInfo => { }
}

export default DocDetail;
