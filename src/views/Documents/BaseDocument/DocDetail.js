
import React, { PureComponent } from "react";
import ByUsDataGrid from "../../../components/ByUsDataGrid";

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
