import React, { PureComponent } from "react";
import DataGrid from "../../../components/DataGrid";
import { TextBox, TextBoxNumeric, ComboBox, Date, Toggle, Flag, Check } from "../../../Inputs";
import Panel from "../../../components/Panel";
const sappy = window.sappy;

class PosDetail extends PureComponent {
  constructor(props) {
    super(props);

    this.getSelectedRows = this.getSelectedRows.bind(this);
    this.scrollToLastLine = this.scrollToLastLine.bind(this);
  }

  getSelectedRows() {
    // return this.refs.grid.getState().selectedIndexes.map(i => this.refs.grid.getRowAt(i).LINENUM)
    return this.refs.grid.getState().selectedKeys;
  }

  scrollToLastLine() {
    return this.refs.grid.scrollToRow(this.refs.grid.getSize());
  }

  render() {
    let hasSidebar = Object.keys(this.props.sidebarFields).length > 0;

    let getProperInputForField = sidebarField => {
      if (!sidebarField) return null;

      let classNames = "";
      let style = { width: sidebarField.width };

      let route = sidebarField.api;
      if (route && route.indexOf("<") > -1) {
        Object.keys(this.props.docData).forEach(field => (route = route.replace("<" + field + ">", this.props.docData[field])));
      }

      let divID = "sidebarField_" + sidebarField.name;

      let onMouseLeave;
      let onMouseEnter;
      let hover = sidebarField.hover;
      if (hover && hover.render) {
        onMouseLeave = e => sappy.hidePopover();

        onMouseEnter = e => {
          let api = hover.api || "";
          if (api && api.indexOf("<") > -1) {
            Object.keys(this.props.docData).forEach(field => (api = api.replace("<" + field + ">", this.props.docData[field])));
          }

          sappy.showPopover({
            target: divID,
            api,
            renderContext: this.props.docData,
            render: hover.render,
            placement: hover.placement
          });
        };
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
      if (sidebarField.type === "text") input = <TextBox {...commonProps} />;
      else if (sidebarField.type === "textarea") input = <TextBox {...commonProps} type="textarea" />;
      else if (sidebarField.type === "integer") input = <TextBoxNumeric {...commonProps} valueType="integer" />;
      else if (sidebarField.type === "percent") input = <TextBoxNumeric {...commonProps} valueType="percent" />;
      else if (sidebarField.type === "combo") input = <ComboBox {...commonProps} />;
      else if (sidebarField.type === "date") input = <Date {...commonProps} />;
      else if (sidebarField.type === "bool") input = <Toggle {...commonProps} />;
      else if (sidebarField.type.startsWith("flag")) {
        let color = sidebarField.type.split("|")[1];
        input = <Flag {...commonProps} color={color} />;
      } else if (sidebarField.type.startsWith("check")) {
        let color = sidebarField.type.split("|")[1];
        input = <Check {...commonProps} color={color} />;
      }

      return (
        <div key={divID} id={divID} className={classNames} onMouseLeave={onMouseLeave} onMouseEnter={onMouseEnter} style={style}>
          {" "}{input}{" "}
        </div>
      );
    };

    let renderSidebarFields = () => {
      let fields = this.props.sidebarFields;
      let ret = [];
      Object.keys(fields).forEach(lineKey => {
        let headerLine = fields[lineKey];
        let headerLineFields = [];
        for (var ix = 0; ix < headerLine.length; ix++) {
          headerLineFields.push(getProperInputForField(headerLine[ix]));
        }
        let style = { display: "inline-flex", width: "100%" };
        ret.push(
          <div key={"sidebarRow_" + lineKey} style={style}>
            {" "}{headerLineFields}
          </div>
        );
      });

      return ret;
    };

    let posDetailGridStyle = {};
    let posDetailSidebarStyle = {};
    if (Object.keys(this.props.sidebarFields).length > 0) {
      //colocar sidebar
      posDetailGridStyle = { width: "calc(100% - 200px)" };
      posDetailSidebarStyle = { width: "190px" };
    }
    let LINES = [...this.props.docData.LINES];
    LINES.reverse();
    return (
      <div id="posDetail">
        <Panel name="panelDetails" allowCollapse={false}>
          <div id="posDetailGrid" style={posDetailGridStyle}>
            <DataGrid
              ref="grid"
              height={this.props.height}
              fields={this.props.fields}
              disabled={this.props.docData.DOCNUM > 0 ? true : false}
              rows={LINES}
              onRowUpdate={this.props.onRowUpdate}
              onRowSelectionChange={this.props.onRowSelectionChange}
              selectedKeys={this.props.selectedKeys}
              onRowReorder={this.props.onRowReorder}
            />
          </div>

          {hasSidebar &&
            <div id="posDetailSidebar" style={posDetailSidebarStyle}>
              {renderSidebarFields()}
            </div>}
        </Panel>
      </div>
    );
  }
}
PosDetail.defaultProps = {
  height: 300,
  fields: [],
  sidebarFields: [],
  rows: [],
  onRowUpdate: (currentRow, updated) => {},
  onRowSelectionChange: selectedIndexes => {},
  onRowReorder: (draggedRows, rowTarget, orderedRows) => {},
  onSideBarFieldChange: changeInfo => {}
};

export default PosDetail;
