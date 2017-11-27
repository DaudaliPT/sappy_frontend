import React, { Component } from "react";
import { TextBox, TextBoxNumeric, ComboBox, Date, Toggle, Flag } from "../../../Inputs";
// import { Button } from "reactstrap";
import Panel from "../../../components/Panel";

class DocHeader extends Component {
  render() {
    let { TAGS, CARDCODE, CARDNAME, OBJTYPE, DOCENTRY, DOCNUM, DOCSTATUS, CANCELED } = this.props.docData;

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
      if (DOCNUM > 0) {
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

    let title = this.props.title;
    if (DOCNUM > 0) title += " (" + DOCNUM + ")";

    let docFuncs = this.props.DocBaseActions || {};
    let isDoc = !!DOCENTRY;
    let canCancel = isDoc && DOCSTATUS === "O";
    let canClose = isDoc && DOCSTATUS === "O" && "23,17,15, 22,20,21".indexOf(OBJTYPE) > -1;

    let headerActions = [
      {
        name: "toogleEdit",
        text: "Alterar",
        color: !this.props.editable ? "" : "danger",
        visible: isDoc,
        icon: this.props.editable ? "fa-close" : "fa-edit",
        onClick: this.props.toggleEditable
      },
      {
        name: "movePreviows",
        text: "",
        color: !this.props.editable ? "" : "danger",
        visible: isDoc,
        icon: "fa-angle-left",
        onClick: () => docFuncs.handleMovePrevious({ that: this.props.mainThis })
      },
      {
        name: "moveNext",
        text: "",
        color: !this.props.editable ? "" : "danger",
        visible: isDoc,
        icon: "fa-angle-right",
        onClick: () => docFuncs.handleMoveNext({ that: this.props.mainThis })
      }
    ];
    let migrateTo = [];
    if (OBJTYPE === "23") migrateTo = [{ objtype: "17", name: "Encomenda" }, { objtype: "15", name: "Entrega" }, { objtype: "13", name: "Fatura" }];
    if (OBJTYPE === "17") migrateTo = [{ objtype: "15", name: "Entrega" }, { objtype: "13", name: "Fatura" }];
    if (OBJTYPE === "15") migrateTo = [{ objtype: "16", name: "Devolução" }, { objtype: "13", name: "Fatura" }];
    if (OBJTYPE === "13") migrateTo = [{ objtype: "14", name: "Nota de crédito", allowIfClosed: true }];
    if (OBJTYPE === "22") migrateTo = [{ objtype: "20", name: "Entrega" }, { objtype: "18", name: "Fatura" }];
    if (OBJTYPE === "20") migrateTo = [{ objtype: "21", name: "Devolução" }, { objtype: "18", name: "Fatura" }];
    if (OBJTYPE === "18") migrateTo = [{ objtype: "19", name: "Nota de crédito", allowIfClosed: true }];

    let migrateToMenus = migrateTo.map(m => {
      return {
        name: "Migrar p/" + m.name,
        visible: isDoc && CANCELED === "N" && (DOCSTATUS === "O" || m.allowIfClosed),
        icon: "fa-share-square-o",
        onClick: () => docFuncs.handleForwardDocument({ that: this.props.mainThis, toObjtype: m.objtype })
      };
    });

    let headerMenus = [
      {
        name: "Duplicar",
        visible: isDoc,
        icon: "fa-clone",
        onClick: () => docFuncs.handleOnDuplicarDocumento({ that: this.props.mainThis })
      },
      {
        name: "Cancelar documento",
        visible: canCancel,
        icon: "fa-close",
        onClick: () => docFuncs.handleOnCancelarDocumento({ that: this.props.mainThis })
      },
      {
        name: "Fechar documento",
        visible: canClose,
        icon: "fa-lock",
        onClick: () => docFuncs.handleOnFecharDocumento({ that: this.props.mainThis })
      },
      {
        name: "Ligações",
        visible: isDoc,
        icon: "fa-code-fork",
        onClick: () => docFuncs.handleGetDocLinks({ that: this.props.mainThis })
      },
      ...migrateToMenus,
      {
        name: "Imprimir",
        visible: isDoc,
        icon: "fa-print",
        onClick: () => docFuncs.handleExport({ that: this.props.mainThis, cmd: "print" })
      },
      {
        name: "Descarregar",
        visible: isDoc,
        icon: "fa-download",
        onClick: () => docFuncs.handleExport({ that: this.props.mainThis, cmd: "pdf" }), //por defeito o download é pdf
        content: (
          <span className="float-right">
            <i className="icon fa-file-pdf-o download" title="Formato PDF" onClick={() => docFuncs.handleExport({ that: this.props.mainThis, cmd: "pdf" })} />
            <i className="icon fa-file-excel-o download" title="Formato Excel" onClick={() => docFuncs.handleExport({ that: this.props.mainThis, cmd: "xls" })} />
            <i className="icon fa-file-word-o download" title="Formato Winword" onClick={() => docFuncs.handleExport({ that: this.props.mainThis, cmd: "doc" })} />
            <i className="icon fa-file-text-o download" title="Formato texto(*.csv)" onClick={() => docFuncs.handleExport({ that: this.props.mainThis, cmd: "csv" })} />
          </span>
        )
      }
    ];

    return (
      <div id="docHeader">
        <Panel
          title={title}
          tags={TAGS}
          colapsedInfo={CARDCODE && " (" + CARDCODE + " - " + CARDNAME + ")"}
          expanded={this.props.expanded}
          onToogleExpand={this.props.toggleHeader}
          actions={headerActions}
          menus={headerMenus}
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
