import React, { Component } from "react";
import { Button } from "reactstrap";
import { TextBox, TextBoxNumeric, ComboBox, Date, Toggle, Flag, Check } from "../../../Inputs";

const sappy = window.sappy;

class DocHeaderAT extends Component {
  constructor(props) {
    super(props);

    this.onFieldChange = this.onFieldChange.bind(this);

    this.state = {
      docData: props.docData
    };
  }

  onFieldChange(changeInfo) {
    let that = this;
    // be notified of changes
    changeInfo.callback = newDocData => {
      that.setState({ docData: { ...newDocData } });
    };
    this.props.onChange(changeInfo);
  }

  render() {
    let that = this;
    // console.log("render", this.props);
    let { docData } = this.state;

    let aprovedAT = docData.ElCoStatus === "0";
    let pendingAT = docData.ElCoStatus === "1";
    let rejectedAT = docData.ElCoStatus === "2";
    return (
      <div>
        <ComboBox
          {...{
            name: "ATDOCTYPE",
            label: "Documento AT",
            options: [{ value: "GT", label: "GT" }, { value: "GA", label: "GA" }, { value: "GD", label: "GD" }, { value: "GR", label: "GR" }, { value: "GC", label: "GC" }],
            disabled: !!docData.DOCENTRY,
            value: docData.ATDOCTYPE,
            onChange: this.onFieldChange
          }}
        />
        <TextBox
          {...{
            name: "MATRICULA",
            label: "Matricula",
            disabled: aprovedAT,
            value: docData.MATRICULA,
            onChange: this.onFieldChange
          }}
        />
        <TextBox
          {...{
            name: "ATAUTHCODE",
            label: "Código autorização",
            disabled: aprovedAT || pendingAT,
            value: docData.ATAUTHCODE,
            onChange: this.onFieldChange
          }}
        />
        {rejectedAT &&
          docData.ElCoMsg &&
          <div className="pt-10">
            Mensagem: {docData.ElCoMsg}
          </div>}
        {rejectedAT &&
          <div className={"checkbox-custom checkbox-success"} style={{ display: "block" }}>
            <input
              type="checkbox"
              checked={sappy.getNum(docData.ATTRYAGAIN) === 1}
              onChange={e => that.onFieldChange({ fieldName: `ATTRYAGAIN`, rawValue: sappy.getNum(docData.ATTRYAGAIN) ? 0 : 1, formatedValue: sappy.getNum(docData.ATTRYAGAIN) ? 0 : 1 })}
              disabled={!this.props.editable}
              id="TRYAGAIN"
            />
            <label htmlFor="TRYAGAIN">Tentar novamente</label>
          </div>}
      </div>
    );
  }
}

export default DocHeaderAT;
