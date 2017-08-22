
import React, { PureComponent } from "react";
import ByUsDataGrid from "../../../components/ByUsDataGrid";
import { ByUsTextBox, ByUsTextBoxNumeric, ByUsComboBox, ByUsDate, ByUsToggle, ByUsFlag } from "../../../Inputs";

class DocDetail extends PureComponent {
  constructor(props) {
    super(props);

    this.getSelectedRows = this.getSelectedRows.bind(this);
  }

  getSelectedRows() {
    return this.refs.grid.getState().selectedIndexes.map(i => this.refs.grid.getRowAt(i).LINENUM)
  }

  render() {
    return (
      <div id="docDetail">
        <div className="rowXXXXXXX">
          <div id="docDetailGridXXXX" className="colXXXX-10">
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
          <div id="docDetailSidebarXXX" className="colXXXX-2">

          </div >
        </div >
      </div >
    );
  }
}
DocDetail.defaultProps = {
  height: 300,
  fields: [],
  rows: [],
  onRowUpdate: (currentRow, updated) => { },
  onRowSelect: (selectedIndexes) => { }
}

export default DocDetail;
