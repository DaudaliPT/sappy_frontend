import React, { Component } from "react";
import ReactDataGrid from "react-data-grid";
const byUs = window.byUs;
import HeaderAlignRight from './HeaderAlignRight'
import Formatters from './Formatters'

const {
  ToolsPanel: { AdvancedToolbar, GroupedColumnsPanel },
  Data: { Selectors },
  Draggable
} = require('react-data-grid-addons');

class ByUsDataGrid extends Component {
  constructor(props) {
    super(props);

    this.getRowAt = this.getRowAt.bind(this);
    this.getSize = this.getSize.bind(this);
    this.buildColumnList = this.buildColumnList.bind(this);
    this.onRowsSelected = this.onRowsSelected.bind(this);
    this.onRowsDeselected = this.onRowsDeselected.bind(this);
    this.onColumnGroupAdded = this.onColumnGroupAdded.bind(this);
    this.onColumnGroupDeleted = this.onColumnGroupDeleted.bind(this);
    this.onRowExpandToggle = this.onRowExpandToggle.bind(this);
    this.handleGridRowsUpdated = this.handleGridRowsUpdated.bind(this);
    this.getState = this.getState.bind(this);

    this.state = this.createStateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.createStateFromProps(nextProps))
  }

  createStateFromProps(props) {
    return {
      gridHeight: 300,
      columns: this.buildColumnList(props),
      groupBy: [],
      rows: JSON.parse(JSON.stringify(props.rows)),
      // rows: props.rows,
      expandedRows: {},
      selectedIndexes: []
    };
  }

  getState() {
    return this.state;
  }


  onRowsSelected(rows) {
    let selectedIndexes = this.state.selectedIndexes.concat(rows.map(r => r.rowIdx))

    this.setState({ selectedIndexes });
    this.props.onRowSelect && this.props.onRowSelect(selectedIndexes);
  }

  onRowsDeselected(rows) {
    let rowIndexes = rows.map(r => r.rowIdx);
    let selectedIndexes = this.state.selectedIndexes.filter(i => rowIndexes.indexOf(i) === -1);

    this.setState({ selectedIndexes });
    this.props.onRowSelect && this.props.onRowSelect(selectedIndexes);
  }

  getRows() {
    let rows = Selectors.getRows(this.state);
    return rows;
  }

  getRowAt(index) {
    let rows = this.getRows();
    return rows[index];
  }

  getSize() {
    return this.getRows().length;
  }

  buildColumnList(props) {
    let gridWidth = this.thisComponent ? this.thisComponent.DOMMetrics.gridWidth() : 0;
    let totalWidth = this.props.fields.reduce((sum, field) => sum + byUs.getNum(field.width || 100), 0);
    totalWidth += 60; //Levar em conta a coluna de select

    let proporcao = 1;
    if (gridWidth) proporcao = 1 / (totalWidth / gridWidth);

    let ret = props.fields.map((field, ix) => {
      let editable = props.disabled ? false : field.editable;
      let col = {
        key: field.name,
        name: field.label,
        width: field.width || 100,
        condition: field.condition,
        hover: field.hover,
        editable,
        cellClass: editable ? "editable-col" : "locked-col",
        formatter: <Formatters.Default />,
        onLinkClick: field.onLinkClick,
        getRowMetaData: row => row,
        type: field.type
      };

      if (gridWidth > totalWidth) col.width *= proporcao

      if ("quantity,price,amount".indexOf(field.type) > -1) {
        // col.formatter = <Formatters.Number />;
        col.headerRenderer = HeaderAlignRight;
      } else if (field.type === "vat") {
        col.formatter = <Formatters.Vat />;
      } else if (field.type === "tags") {
        col.formatter = <Formatters.Tags />;
      } else if (field.type.startsWith("check") || field.type.startsWith("switch") || field.type.startsWith("flag")) {

        let parts = field.type.split('|');
        let type = parts[0];
        col.color = parts[1];
        col.valueON = parts[2];
        col.valueOFF = parts[3];

        if (type === "check") col.formatter = <Formatters.Check />;
        if (type === "switch") col.formatter = <Formatters.Switch />;
        if (type === "flag") col.formatter = <Formatters.Flag />;
        if (editable) {
          col.editable = false; //don't allow double ckick and enter the edit mode with textBox
          col.events = {
            onClick: (ev, args) => {
              ev.stopPropagation();

              let currentRow = this.getRowAt(args.rowIdx);
              this.handleGridRowsUpdated({
                fromRow: args.rowIdx,
                toRow: args.rowIdx,
                updated: { [args.column.key]: !currentRow[args.column.key] }
              });
            },
            onKeyDown: (ev, args) => {
              if (ev.keyCode === 32) {
                ev.preventDefault();
                ev.stopPropagation();

                let currentRow = this.getRowAt(args.rowIdx);
                this.handleGridRowsUpdated({
                  fromRow: args.rowIdx,
                  toRow: args.rowIdx,
                  updated: { [args.column.key]: !currentRow[args.column.key] }
                });
              }
            }
          }
        }
      } else if (field.type.startsWith("discount")) {

        let parts = field.type.split('|');
        // let type = parts[0];
        col.color = parts[1];
        col.valueON = parts[2];
        col.valueOFF = parts[3];
        col.formatter = <Formatters.Discount />;
        if (editable) {
          col.events = {
            onClick: (ev, args) => {
              let currentRow = this.getRowAt(args.rowIdx);
              if (currentRow.USER_DISC === 'BONUS') {
                ev.stopPropagation();

                let currentValue = currentRow["BONUS_NAP"];
                currentValue = currentValue === 1 ? 0 : 1;
                this.handleGridRowsUpdated({
                  fromRow: args.rowIdx,
                  toRow: args.rowIdx,
                  updated: { BONUS_NAP: currentValue }
                });
              }
            },
            onKeyDown: (ev, args) => {
              let currentRow = this.getRowAt(args.rowIdx);
              if (currentRow.USER_DISC === 'BONUS' && ev.keyCode === 32) {
                ev.preventDefault();
                ev.stopPropagation();

                let currentRow = this.getRowAt(args.rowIdx);
                let currentValue = currentRow["BONUS_NAP"];
                currentValue = currentValue === 1 ? 0 : 1;
                this.handleGridRowsUpdated({
                  fromRow: args.rowIdx,
                  toRow: args.rowIdx,
                  updated: { BONUS_NAP: currentValue }
                });
              }
            }
          }
        }
      }

      return col
    })
    if (gridWidth > totalWidth) {
      // colocar as diferenças na última coluna
      let lastField = ret[ret.length - 1];
      let totalW = ret.reduce((sum, fld) => sum + byUs.getNum(fld.width), 0) + 60;
      lastField.width += gridWidth - totalW - 8; // -8 por causa do scroll
    }

    // let finalTotalWidth = ret.reduce((sum, field) => sum + byUs.getNum(field.width), 0) + 60;
    // console.log({ gridWidth, totalWidth, finalTotalWidth, diff: gridWidth - finalTotalWidth })
    return ret;
  }

  handleGridRowsUpdated({ fromRow, toRow, updated }) {
    let colUpdated = Object.keys(updated)[0];
    let newValue = updated[colUpdated];
    if (newValue.replace) updated[colUpdated] = newValue.replace(',', '.');

    for (var index = fromRow; index <= toRow; index++) {
      let ix = index;
      let currentRow = this.getRowAt(ix);

      this.props.onRowUpdate(currentRow, { ...updated })
    }
  }

  onColumnGroupAdded(colName) {

    let documentoBloqueado = this.state.docData.DOCNUM > 0;
    let baseadoEmDocumentos = this.state.docData.DOCS && this.state.docData.DOCS.length !== 0;

    let columns = this.getColumns({ allowEdit: !documentoBloqueado, baseadoEmDocumentos })
    let columnGroups = this.state.groupBy.slice(0);
    let activeColumn = columns.find((c) => c.key === colName)
    let isNotInGroups = columnGroups.find((c) => activeColumn.key === c.name) == null;
    if (isNotInGroups) {
      columnGroups.push({ key: activeColumn.key, name: activeColumn.name });
    }

    this.setState({ groupBy: columnGroups });
  }

  onColumnGroupDeleted(name) {
    let columnGroups = this.state.groupBy.filter(function (g) {
      return typeof g === 'string' ? g !== name : g.key !== name;
    });
    this.setState({ groupBy: columnGroups });
  }

  onRowExpandToggle({ columnGroupName, name, shouldExpand }) {
    let expandedRows = Object.assign({}, this.state.expandedRows);
    expandedRows[columnGroupName] = Object.assign({}, expandedRows[columnGroupName]);
    expandedRows[columnGroupName][name] = { isExpanded: shouldExpand };
    this.setState({ expandedRows: expandedRows });
  }


  render() {
    return (
      <Draggable.Container >
        <ReactDataGrid
          ref={node => this.thisComponent = node}
          rowGetter={this.getRowAt}
          columns={this.state.columns}
          rowsCount={this.getSize()}
          rowSelection={{
            showCheckbox: true,
            enableShiftSelect: true,
            onRowsSelected: this.onRowsSelected,
            onRowsDeselected: this.onRowsDeselected,
            selectBy: { indexes: this.state.selectedIndexes }
          }}
          toolbar={
            <AdvancedToolbar>
              <GroupedColumnsPanel groupBy={this.state.groupBy}
                onColumnGroupAdded={this.onColumnGroupAdded}
                onColumnGroupDeleted={this.onColumnGroupDeleted} />
            </AdvancedToolbar>
          }
          minHeight={this.props.height}
          enableCellSelect={true}
          enableDragAndDrop={true}
          onGridRowsUpdated={this.handleGridRowsUpdated}
          onCellClick={this.handleOnCellClick}
          onRowExpandToggle={this.onRowExpandToggle}
        ></ReactDataGrid >
      </Draggable.Container >
    );
  }
};

ByUsDataGrid.defaultProps = {
  fields: [
    // {key: "FIELD1", name: "col1" },
    // {key: "FIELD2", name: "col2" }
  ],
  rows: [
    // {FIELD1: "FEILD1_ROW1", FIELD2: "FIELD2_ROW1" },
    // {FIELD1: "FEILD1_ROW2", FIELD2: "FIELD2_ROW2" }
  ],
  hideToolbar: true,
  height: 300,
  onRowUpdate: (currentRow, updated) => { }
}

export default ByUsDataGrid;
