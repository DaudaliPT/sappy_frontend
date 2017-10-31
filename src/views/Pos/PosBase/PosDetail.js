import React, { PureComponent } from "react";
import DataGrid from "../../../components/DataGrid";
import { TextBox, TextBoxNumeric, ComboBox, Date, Toggle, Flag, Check } from "../../../Inputs";
import Panel from "../../../components/Panel";
const sappy = window.sappy;

class PosDetail extends PureComponent {
  constructor(props) {
    super(props);

    this.focusCell = this.focusCell.bind(this);
  }

  focusCell({ rowIdx, idx }) {
    return this.refs.grid.focusCell({ rowIdx, idx });
  }

  render() {
    let LINES = [...this.props.docData.LINES];
    LINES.reverse();
    return (
      <div id="posDetail">
        <Panel name="panelDetails" allowCollapse={false}>
          <div id="posDetailGrid">
            <DataGrid
              ref="grid"
              height={this.props.height}
              fields={this.props.fields}
              disabled={false}
              rows={LINES}
              getRowStyle={props => {
                let row = props.row;
                let classes = "";
                if (row.IDPROMO) classes += "has-promo";
                // if (sappy.getNum(row.AvgPrice) * sappy.getNum(row.QTSTK) > sappy.getNum(row.LINETOTAL)) classes += " bellow-cost";

                return classes;
              }}
              onRowUpdate={this.props.onRowUpdate}
              onRowSelectionChange={this.props.onRowSelectionChange}
              selectedKeys={this.props.selectedKeys}
              onRowReorder={this.props.onRowReorder}
            />
          </div>
        </Panel>
      </div>
    );
  }
}
PosDetail.defaultProps = {
  height: 300,
  fields: [],
  rows: [],
  onRowUpdate: (currentRow, updated) => {},
  onRowSelectionChange: selectedIndexes => {},
  onRowReorder: (draggedRows, rowTarget, orderedRows) => {},
  onSideBarFieldChange: changeInfo => {}
};

export default PosDetail;
