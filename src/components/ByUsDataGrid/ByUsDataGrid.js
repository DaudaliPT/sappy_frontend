import React, { Component } from "react";
import ReactDataGrid from 'react-data-grid/packages/react-data-grid/dist/react-data-grid';
const byUs = window.byUs;
import HeaderAlignRight from './HeaderAlignRight'
import Formatters from './Formatters'

const {
  ToolsPanel: { AdvancedToolbar, GroupedColumnsPanel },
  Data: { Selectors },
  Draggable
} = require('react-data-grid/packages/react-data-grid-addons/dist/react-data-grid-addons');

const RowRenderer = Draggable.DropTargetRowContainer(ReactDataGrid.Row);

class ByUsDataGrid extends Component {
  constructor(props) {
    super(props);

    this.getRowAt = this.getRowAt.bind(this);
    this.getSize = this.getSize.bind(this);
    this.buildColumnList = this.buildColumnList.bind(this);
    this.onRowsSelected = this.onRowsSelected.bind(this);
    this.onRowsDeselected = this.onRowsDeselected.bind(this);
    this.onRowReorder = this.onRowReorder.bind(this);
    this.onColumnGroupAdded = this.onColumnGroupAdded.bind(this);
    this.onColumnGroupDeleted = this.onColumnGroupDeleted.bind(this);
    this.onRowExpandToggle = this.onRowExpandToggle.bind(this);
    this.handleGridRowsUpdated = this.handleGridRowsUpdated.bind(this);
    this.getState = this.getState.bind(this);
    this.scrollToRow = this.scrollToRow.bind(this);

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
      selectedIndexes: [],
      selectedIds: []
    };
  }

  getState() {
    return this.state;
  }


  // onRowsSelected(rows) {
  //   let selectedIndexes = this.state.selectedIndexes.concat(rows.map(r => r.rowIdx))

  //   this.setState({ selectedIndexes });
  //   this.props.onRowSelect && this.props.onRowSelect(selectedIndexes);
  // }
  onRowsSelected(rows) {
    let selectedIds = this.state.selectedIds.concat(rows.map(r => r.row[this.props.rowKey]))
    this.setState({ selectedIds });
    this.props.onRowSelect && this.props.onRowSelect(selectedIds);
  }

  // onRowsDeselected(rows) {
  //   let rowIndexes = rows.map(r => r.rowIdx);
  //   let selectedIndexes = this.state.selectedIndexes.filter(i => rowIndexes.indexOf(i) === -1);

  //   this.setState({ selectedIndexes });
  //   this.props.onRowSelect && this.props.onRowSelect(selectedIndexes);
  // }
  onRowsDeselected(rows) {
    let rowIds = rows.map(r => r.row[this.props.rowKey]);
    let selectedIds = this.state.selectedIds.filter(i => rowIds.indexOf(i) === -1);
    this.setState({ selectedIds });
    this.props.onRowSelect && this.props.onRowSelect(selectedIds);
  }

  onRowReorder(e) {

    // let selectedRows = this.state.selectedIndexes.map(i => this.getRowAt(i))
    // let draggedRows = selectedRows.indexOf(e.rowSource.idx) > -1 ? selectedRows : [e.rowSource.data];

    // let orderedRows = this.getRows.filter(function (r) {
    //   return draggedRows.indexOf(r) === -1;
    // });

    // let args = [e.rowTarget.idx, 0].concat(orderedRows);
    // Array.prototype.splice.apply(orderedRows, args);
    // this.setState({ rows: orderedRows });

    // this.props.onRowReorder && this.props.onRowReorder(draggedRows, e.rowTarget, orderedRows);



    // let selectedRows = Selectors.getSelectedRowsByKey({ rowKey: this.props.rowKey, selectedKeys: this.state.selectedIds, rows: this.state.rows });
    // let draggedRows = this.isDraggedRowSelected(selectedRows, e.rowSource) ? selectedRows : [e.rowSource.data];
    // let undraggedRows = this.state.rows.filter(function (r) {
    //   return draggedRows.indexOf(r) === -1;
    // });
    // let args = [e.rowTarget.idx, 0].concat(draggedRows);
    // Array.prototype.splice.apply(undraggedRows, args);
    // this.setState({ rows: undraggedRows });

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

  scrollToRow(idx) {
    var top = this.thisComponent.getRowOffsetHeight() * idx;
    var gridCanvas = this.thisComponent.getDataGridDOMNode().querySelector('.react-grid-Canvas');
    gridCanvas.scrollTop = top;
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
        formatter: Formatters.Default,
        onLinkClick: field.onLinkClick,
        getRowMetaData: row => row,
        type: field.type
      };

      if (gridWidth > totalWidth) col.width *= proporcao

      if ("quantity,price,amount".indexOf(field.type) > -1) {
        col.headerRenderer = HeaderAlignRight;
      } else if (field.type === "vat") {
        col.formatter = Formatters.Vat;
      } else if (field.type === "tags") {
        col.formatter = Formatters.Tags;
      } else if (field.type.startsWith("check") || field.type.startsWith("switch") || field.type.startsWith("flag")) {

        let parts = field.type.split('|');
        let type = parts[0];
        col.color = parts[1];
        col.valueON = parts[2];
        col.valueOFF = parts[3];

        if (type === "check") col.formatter = Formatters.Check;
        if (type === "switch") col.formatter = Formatters.Switch;
        if (type === "flag") col.formatter = Formatters.Flag;
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
        col.formatter = Formatters.Discount;
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
      } else if (field.type.startsWith("bonus")) {

        let parts = field.type.split('|');
        // let type = parts[0];
        col.color = parts[1];
        col.valueON = parts[2];
        col.valueOFF = parts[3];
        col.formatter = Formatters.Bonus;
        if (editable) {
          col.events = {
            onClick: (ev, args) => {
              let currentRow = this.getRowAt(args.rowIdx);
              if (byUs.getNum(currentRow.QTBONUS) !== 0) {
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
              if (byUs.getNum(currentRow.QTBONUS) !== 0 && ev.keyCode === 32) {
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
    let col = this.state.columns.find(col => col.key === colUpdated)

    if ("quantity,price,amount".indexOf(col.type) > -1) {
      let newValue = updated[colUpdated];
      if (newValue.replace) newValue = newValue.replace(',', '.');

      let chars = newValue.split('');
      let hasOperators = false;
      let hasInvalidChars = false;

      chars.forEach(c => {
        if ('.'.indexOf(c) > -1) return;
        if ('+-*/^'.indexOf(c) > -1) return hasOperators = true;
        let charCode = c.charCodeAt(0);
        if (charCode < 48 || charCode > 57) return hasInvalidChars = true;
      });


      if (hasInvalidChars) return byUs.showError({ message: "'" + newValue + "' não é uma expressão válida" }, "Erro na expressão")
      if (hasOperators) {
        try {
          newValue = eval(newValue)
        } catch (error) {
          return byUs.showError(error, "Erro na expressão")
        }
      }
      updated[colUpdated] = newValue
    }

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
          columns={this.state.columns}
          minHeight={this.props.height}
          enableDragAndDrop={true}
          enableCellSelect={true}
          enableCellSelection={true}
          onRowExpandToggle={this.onRowExpandToggle}
          onGridRowsUpdated={this.handleGridRowsUpdated}
          onCellClick={this.handleOnCellClick}
          rowGetter={this.getRowAt}
          rowActionsCell={Draggable.RowActionsCell}
          rowRenderer={<RowRenderer onRowDrop={this.onRowReorder} />}
          rowsCount={this.getSize()}
          rowSelection={{
            showCheckbox: true,
            enableShiftSelect: true,
            onRowsSelected: this.onRowsSelected,
            onRowsDeselected: this.onRowsDeselected,
            selectBy: {
              keys: { rowKey: this.props.rowKey, values: this.state.selectedIds }
            }
          }}
          toolbar={
            <AdvancedToolbar>
              <GroupedColumnsPanel groupBy={this.state.groupBy}
                onColumnGroupAdded={this.onColumnGroupAdded}
                onColumnGroupDeleted={this.onColumnGroupDeleted} />
            </AdvancedToolbar>
          }
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
  rowKey: "LINENUM",
  rows: [
    // {FIELD1: "FEILD1_ROW1", FIELD2: "FIELD2_ROW1" },
    // {FIELD1: "FEILD1_ROW2", FIELD2: "FIELD2_ROW2" }
  ],
  hideToolbar: true,
  height: 300,
  onRowUpdate: (currentRow, updated) => { },
  onRowSelect: (selectedIndexes) => { },
  onRowReorder: (draggedRows, rowTarget, orderedRows) => { },
}

export default ByUsDataGrid;
