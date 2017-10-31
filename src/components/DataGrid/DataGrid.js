import React, { Component } from "react";
import ReactDataGrid, { Cell } from "react-data-grid/packages/react-data-grid/dist/react-data-grid";
const sappy = window.sappy;
const $ = window.$;
import HeaderAlignRight from "./HeaderAlignRight";
import Formatters from "./Formatters";
import Editors from "./Editors";

const { ToolsPanel: { AdvancedToolbar, GroupedColumnsPanel }, Data: { Selectors }, Draggable } = require("react-data-grid/packages/react-data-grid-addons/dist/react-data-grid-addons");
// We want to capture the event before any thing else
let useCapturingFase = true; // see https://www.quirksmode.org/js/events_order.html

class DataGrid extends Component {
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
    this.getSelectedKeys = this.getSelectedKeys.bind(this);
    this.getSelectedRows = this.getSelectedRows.bind(this);
    this.scrollToRow = this.scrollToRow.bind(this);
    this.focusCell = this.focusCell.bind(this);

    let that = this;
    class myRowRenderer extends Component {
      render() {
        let extraClasses = "";
        if (that.props.getRowStyle) extraClasses = that.props.getRowStyle(this.props);
        return <ReactDataGrid.Row {...this.props} extraClasses={extraClasses} />;
      }
    }

    this.RowRenderer = Draggable.DropTargetRowContainer(myRowRenderer);

    this.state = this.createStateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.createStateFromProps(nextProps));
  }

  createStateFromProps(props) {
    return {
      gridHeight: 300,
      columns: this.buildColumnList(props),
      groupBy: props.groupBy || [],
      rows: JSON.parse(JSON.stringify(props.rows)),
      // rows: props.rows,
      expandedRows: {},
      selectedKeys: []
    };
  }

  getState() {
    return this.state;
  }

  getSelectedKeys() {
    if (this.props.onRowSelectionChange) return this.props.selectedKeys || [];
    return this.state.selectedKeys;
  }

  getSelectedRows() {
    let selectedKeys = [...this.getSelectedKeys()];

    // let rows = this.state.rows.filter(row => selectedKeys.indexOf(row[this.props.rowKey]))
    let selectedRows = Selectors.getSelectedRowsByKey({ rowKey: this.props.rowKey, selectedKeys: selectedKeys, rows: this.state.rows });
    return selectedRows;
  }

  onRowsSelected(rows) {
    let selectedKeys = [...this.getSelectedKeys()];
    rows.forEach(r => {
      if (r.row && r.row.__metaData && r.row.__metaData.isGroup) return;
      selectedKeys.push(r.row[this.props.rowKey]);
    });

    if (this.props.onRowSelectionChange) {
      this.props.onRowSelectionChange(selectedKeys);
    } else {
      this.setState({ selectedKeys });
    }
  }

  onRowsDeselected(rows) {
    let rowIds = rows.map(r => r.row[this.props.rowKey]);
    let selectedKeys = this.getSelectedKeys().filter(key => rowIds.indexOf(key) === -1);

    if (this.props.onRowSelectionChange) {
      this.props.onRowSelectionChange(selectedKeys);
    } else {
      this.setState({ selectedKeys });
    }
  }

  onRowReorder(e) {
    let selectedRows = this.getSelectedRows();
    let isDraggedRowSelected = selectedRows.find(row => row[this.props.rowKey] === e.rowSource.data[this.props.rowKey]);
    let draggedRows = isDraggedRowSelected ? selectedRows : [e.rowSource.data];
    let orderedRows = this.state.rows.filter(function(r) {
      return draggedRows.indexOf(r) === -1;
    });
    let args = [e.rowTarget.idx, 0].concat(draggedRows);
    Array.prototype.splice.apply(orderedRows, args);
    this.props.onRowReorder && this.props.onRowReorder(draggedRows, e.rowTarget, orderedRows);
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
    var gridCanvas = this.thisComponent.getDataGridDOMNode().querySelector(".react-grid-Canvas");
    gridCanvas.scrollTop = top;
  }

  focusCell({ rowIdx, idx }) {
    let that = this;
    let ll = document.activeElement;
    setTimeout(() => {
      var $e = $(".react-grid-Row .react-grid-Cell");
      $e[idx].focus();
      that.thisComponent.onSelect({ rowIdx, idx: idx + 1 });
    }, 10);
  }

  buildColumnList(props) {
    let that = this;
    let gridWidth = this.thisComponent ? this.thisComponent.DOMMetrics.gridWidth() : 0;
    let totalWidth = this.props.fields.reduce((sum, field) => sum + sappy.getNum(field.width || 100), 0);
    totalWidth += 60; //Levar em conta a coluna de select

    let proporcao = 1;
    if (gridWidth) proporcao = 1 / (totalWidth / gridWidth);

    let ret = props.fields.map((field, ix) => {
      let editable = props.disabled ? false : field.editable;
      let cellClass = editable ? "editable-col" : "locked-col";
      let col = {
        key: field.name,
        name: field.label,
        width: field.width || 100,
        condition: field.condition,
        getCellStyle: field.getCellStyle,
        hover: field.hover,
        editable,
        editor: editable ? Editors.Default : null,
        cellClass,
        formatter: Formatters.Default,
        onLinkClick: field.onLinkClick,
        getRowMetaData: row => row,
        type: field.type
      };

      if (gridWidth > totalWidth) col.width *= proporcao;

      if ("quantity,price,amount".indexOf(field.type) > -1) {
        col.headerRenderer = HeaderAlignRight;
      } else if (field.type === "vat") {
        col.formatter = Formatters.Vat;
      } else if (field.type === "vatpercent") {
        col.formatter = Formatters.VatPercent;
      } else if (field.type === "tags") {
        col.formatter = Formatters.Tags;
      } else if (field.type.startsWith("check") || field.type.startsWith("switch") || field.type.startsWith("flag")) {
        let parts = field.type.split("|");
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
              that.handleGridRowsUpdated({
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
                that.handleGridRowsUpdated({
                  fromRow: args.rowIdx,
                  toRow: args.rowIdx,
                  updated: { [args.column.key]: !currentRow[args.column.key] }
                });
              }
            }
          };
        }
      } else if (field.type.startsWith("discount")) {
        let parts = field.type.split("|");
        // let type = parts[0];
        col.color = parts[1];
        col.valueON = parts[2];
        col.valueOFF = parts[3];
        col.formatter = Formatters.Discount;
        if (editable) {
          col.events = {
            onClick: (ev, args) => {
              let currentRow = this.getRowAt(args.rowIdx);
              if (currentRow.USER_DISC === "BONUS") {
                ev.stopPropagation();

                let currentValue = currentRow["BONUS_NAP"];
                currentValue = currentValue === 1 ? 0 : 1;
                that.handleGridRowsUpdated({
                  fromRow: args.rowIdx,
                  toRow: args.rowIdx,
                  updated: { BONUS_NAP: currentValue }
                });
              }
            },
            onKeyDown: (ev, args) => {
              let currentRow = this.getRowAt(args.rowIdx);
              if (currentRow.USER_DISC === "BONUS" && ev.keyCode === 32) {
                ev.preventDefault();
                ev.stopPropagation();

                let currentRow = this.getRowAt(args.rowIdx);
                let currentValue = currentRow["BONUS_NAP"];
                currentValue = currentValue === 1 ? 0 : 1;
                that.handleGridRowsUpdated({
                  fromRow: args.rowIdx,
                  toRow: args.rowIdx,
                  updated: { BONUS_NAP: currentValue }
                });
              }
            }
          };
        }
      } else if (field.type.startsWith("bonus")) {
        let parts = field.type.split("|");
        // let type = parts[0];
        col.color = parts[1];
        col.valueON = parts[2];
        col.valueOFF = parts[3];
        col.formatter = Formatters.Bonus;
        if (editable) {
          col.events = {
            onClick: (ev, args) => {
              let currentRow = this.getRowAt(args.rowIdx);
              if (sappy.getNum(currentRow.QTBONUS) !== 0) {
                ev.stopPropagation();

                let currentValue = currentRow["BONUS_NAP"];
                currentValue = currentValue === 1 ? 0 : 1;
                that.handleGridRowsUpdated({
                  fromRow: args.rowIdx,
                  toRow: args.rowIdx,
                  updated: { BONUS_NAP: currentValue }
                });
              }
            },
            onKeyDown: (ev, args) => {
              let currentRow = this.getRowAt(args.rowIdx);
              if (sappy.getNum(currentRow.QTBONUS) !== 0 && ev.keyCode === 32) {
                ev.preventDefault();
                ev.stopPropagation();

                let currentRow = this.getRowAt(args.rowIdx);
                let currentValue = currentRow["BONUS_NAP"];
                currentValue = currentValue === 1 ? 0 : 1;
                that.handleGridRowsUpdated({
                  fromRow: args.rowIdx,
                  toRow: args.rowIdx,
                  updated: { BONUS_NAP: currentValue }
                });
              }
            }
          };
        }
      } else if (field.type.startsWith("pkpos")) {
        let parts = field.type.split("|");
        // let type = parts[0];
        col.color = parts[1];
        col.valueON = parts[2];
        col.valueOFF = parts[3];
        col.formatter = Formatters.Pkpos;
        if (editable) {
          col.events = {
            onClick: (ev, args) => {
              let currentRow = this.getRowAt(args.rowIdx);

              if (sappy.getNum(currentRow.QTPK) !== 0) {
                ev.preventDefault();
                ev.stopPropagation();

                let currentValue = currentRow["QTPK"];
                let defaultValue = currentRow["QTPK_ORIGINAL"];
                currentValue = currentValue > 1 ? 1 : defaultValue;
                that.handleGridRowsUpdated({
                  fromRow: args.rowIdx,
                  toRow: args.rowIdx,
                  updated: { QTPK: currentValue }
                });
              }
            },
            onKeyDown: (ev, args) => {
              let currentRow = this.getRowAt(args.rowIdx);
              if (sappy.getNum(currentRow.QTPK) !== 0 && ev.keyCode === 32) {
                ev.preventDefault();
                ev.stopPropagation();

                let currentRow = this.getRowAt(args.rowIdx);
                let currentValue = currentRow["QTPK"];
                let defaultValue = currentRow["QTPK_ORIGINAL"];
                currentValue = currentValue > 1 ? 1 : defaultValue;
                that.handleGridRowsUpdated({
                  fromRow: args.rowIdx,
                  toRow: args.rowIdx,
                  updated: { QTPK: currentValue }
                });
              }
            }
          };
        }
      }

      return col;
    });

    if (gridWidth > totalWidth) {
      // colocar as diferenças na última coluna
      let lastField = ret[ret.length - 1];
      let totalW = ret.reduce((sum, fld) => sum + sappy.getNum(fld.width), 0) + 60;
      lastField.width += gridWidth - totalW - 8; // -8 por causa do scroll
    }

    // let finalTotalWidth = ret.reduce((sum, field) => sum + sappy.getNum(field.width), 0) + 60;
    // console.log({ gridWidth, totalWidth, finalTotalWidth, diff: gridWidth - finalTotalWidth })
    return ret;
  }

  handleGridRowsUpdated({ fromRow, toRow, updated }) {
    let colUpdated = Object.keys(updated)[0];

    let colType = "string";
    if (true) {
      // make sure col is not available because it can not exist
      let col = this.state.columns.find(col => col.key === colUpdated);
      if (col) colType = col.type;
    }

    if ("quantity,price,amount,bonus".indexOf(colType) > -1) {
      let newValue = updated[colUpdated];

      if (colType === "price" && newValue.toString().indexOf("p") > -1) {
        let pk = sappy.getNum(this.getRowAt(fromRow).QTPK);
        if (pk) {
          newValue = newValue.toString().replace("/pk", "/" + pk);
          newValue = newValue.toString().replace("pk", "/" + pk);
          newValue = newValue.toString().replace("p", "/" + pk);
          newValue = newValue.toString().replace("/p", "/" + pk);
        }
      }

      newValue = sappy.evaluateNumericExpression(newValue);

      if (colType === "price" && sappy.getNum(newValue) < 0) {
        return sappy.showToastr({ color: "warning", msg: "Os preços não podem ser negativos, use a quantidade para obter um valor negativo." });
      }
      updated[colUpdated] = newValue;
    }

    for (var index = fromRow; index <= toRow; index++) {
      let ix = index;
      let currentRow = this.getRowAt(ix);

      this.props.onRowUpdate(currentRow, { ...updated });
    }
  }

  onColumnGroupAdded(colName) {
    let documentoBloqueado = this.state.docData.DOCNUM > 0;
    let baseadoEmDocumentos = this.state.docData.DOCS && this.state.docData.DOCS.length !== 0;

    let columns = this.getColumns({ allowEdit: !documentoBloqueado, baseadoEmDocumentos });
    let columnGroups = this.state.groupBy.slice(0);
    let activeColumn = columns.find(c => c.key === colName);
    let isNotInGroups = columnGroups.find(c => activeColumn.key === c.name) == null;
    if (isNotInGroups) {
      columnGroups.push({ key: activeColumn.key, name: activeColumn.name });
    }

    this.setState({ groupBy: columnGroups });
  }

  onColumnGroupDeleted(name) {
    let columnGroups = this.state.groupBy.filter(function(g) {
      return typeof g === "string" ? g !== name : g.key !== name;
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
    let RowRenderer = this.RowRenderer;
    return (
      <Draggable.Container>
        <ReactDataGrid
          ref={node => (this.thisComponent = node)}
          columns={this.state.columns}
          minHeight={this.props.height || 0}
          enableDragAndDrop={true}
          enableCellSelect={true}
          onRowExpandToggle={this.onRowExpandToggle}
          onGridRowsUpdated={this.handleGridRowsUpdated}
          rowGetter={this.getRowAt}
          rowActionsCell={this.state.groupBy.length !== 0 ? null : Draggable.RowActionsCell}
          rowRenderer={<RowRenderer onRowDrop={this.onRowReorder} />}
          rowsCount={this.getSize()}
          rowGroupRenderer={props => {
            let treeDepth = props.treeDepth || 0;
            let marginLeft = treeDepth * 20;

            let style = {
              height: "50px",
              border: "1px solid #dddddd",
              paddingTop: "15px",
              paddingLeft: "5px"
            };

            let onKeyDown = e => {
              if (e.key === "ArrowLeft") return props.onRowExpandToggle(false);
              if (e.key === "ArrowRight") return props.onRowExpandToggle(true);
              if (e.key === "Enter") return props.onRowExpandToggle(!props.isExpanded);
            };
            return (
              <div style={style} onKeyDown={onKeyDown} tabIndex={0}>
                <span className="row-expand-icon pl-5 pr-5" style={{ float: "left", marginLeft: marginLeft, cursor: "pointer" }} onClick={props.onRowExpandClick}>
                  {props.isExpanded ? String.fromCharCode("9660") : String.fromCharCode("9658")}
                </span>
                <span className="pl-5">
                  <strong>
                    {" "}{props.name}
                  </strong>
                </span>
              </div>
            );
          }}
          rowSelection={{
            showCheckbox: true,
            enableShiftSelect: true,
            onRowsSelected: this.onRowsSelected,
            onRowsDeselected: this.onRowsDeselected,
            selectBy: {
              keys: { rowKey: this.props.rowKey, values: this.getSelectedKeys() }
            }
          }}
          toolbar={
            <AdvancedToolbar>
              <GroupedColumnsPanel groupBy={this.state.groupBy} onColumnGroupAdded={this.onColumnGroupAdded} onColumnGroupDeleted={this.onColumnGroupDeleted} />
            </AdvancedToolbar>
          }
        />
      </Draggable.Container>
    );
  }
}

DataGrid.defaultProps = {
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
  // selectedKeys: [],
  // onRowSelectionChange: (selectedKeys) => { },
  onRowUpdate: (currentRow, updated) => {},
  onRowReorder: (draggedRows, rowTarget, orderedRows) => {}
};

export default DataGrid;
