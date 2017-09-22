import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
var $ = window.$;
var sappy = window.sappy;
import { TextBox, ComboBox, Date } from "../../Inputs";

class ModalReportParams extends Component {
  constructor(props) {
    super(props);

    this.onFieldChange = this.onFieldChange.bind(this);
    this.handleClickContinuar = this.handleClickContinuar.bind(this);

    this.state = {
      saving: false,
      numberOfBarCodes: 2,
      parValues: {}
    };
  }

  componentWillMount() {
    $("body").css("position", "fixed");
  }

  // Recebe os valores dos campos MY*
  onFieldChange(changeInfo) {
    // let formatedValue = changeInfo.formatedValue;
    let val = changeInfo.rawValue;
    let fieldName = changeInfo.fieldName;

    let parValues = this.state.parValues;
    let parName = fieldName;
    let parValue = parValues[parName] || {};

    if (val._isAMomentObject) val = val.hour(12);

    if (parName.startsWith("EndValueOf_")) {
      parName = parName.replace("EndValueOf_", "");
      parValue = parValues[parName] || {};
      parValue.EndValue = val;
    } else {
      parValue.Value = val;
    }
    Object.assign(parValues, { [parName]: parValue });

    this.setState(parValues);
  }

  handleClickContinuar(e) {
    var baseUrl = "";

    if (window.location.port === "3000") {
      // Nota: Em desev, é preciso redirecionar o pedido. Já em produtivo a api é servida na mesma porta do pedido
      baseUrl = "http://localhost:3005";
    }

    var apiRoute = "/api/reports/getPdf(" + this.props.DocCode + ")";
    var apiQuery = "?parValues=" + encodeURIComponent(JSON.stringify(this.state.parValues));
    // Executar o mapa

    window.open(baseUrl + apiRoute + apiQuery, "_blank");
    this.props.toggleModal();
  }

  componentWillUnmount() {
    $("body").css("position", "initial");
    if (this.serverRequest && this.serverRequest.abort) {
      this.serverRequest.abort();
    }
  }
  render() {
    let { reportParameters } = this.props;

    let renderParameters = () => {
      let parameterComponents = [];

      if (reportParameters.length === 0) {
        let parComponent = <p key="nopar">Este relatório não requer parametros.</p>;
        parameterComponents.push(parComponent);
      }

      reportParameters
        .filter(par => {
          // Bitwise compare
          let isShowOnPanel =
            (par.ParameterFieldUsage2 & sappy.CrystalReports.ParameterFieldUsage2.ShowOnPanel) ===
            sappy.CrystalReports.ParameterFieldUsage2.ShowOnPanel;
          let isEditableOnPanel =
            (par.ParameterFieldUsage2 & sappy.CrystalReports.ParameterFieldUsage2.EditableOnPanel) ===
            sappy.CrystalReports.ParameterFieldUsage2.EditableOnPanel;
          let isDataFetching =
            (par.ParameterFieldUsage2 & sappy.CrystalReports.ParameterFieldUsage2.DataFetching) ===
            sappy.CrystalReports.ParameterFieldUsage2.DataFetching;

          return par.ReportName === "" && (isShowOnPanel || isEditableOnPanel || isDataFetching);
        })
        .forEach(par => {
          let parComponent;
          let parComponentTo;

          let hasSelect = par.Name.toUpperCase().indexOf("@SELECT") >= 0;
          let isRange = par.DiscreteOrRangeKind === sappy.CrystalReports.DiscreteOrRangeKind.RangeValue;
          let isDiscreteAndRange = par.DiscreteOrRangeKind === sappy.CrystalReports.DiscreteOrRangeKind.DiscreteAndRangeValue;
          let value = this.state.parValues[par.Name] || {};

          if (isDiscreteAndRange) {
            if (hasSelect) {
              // Ecrã de seleção de artigo com de...a e propriedades

              let isOCRD = par.Name.toUpperCase().indexOf("OCRD") > 0;
              let isOITM = par.Name.toUpperCase().indexOf("OITM") > 0;

              let nameParts = par.Name.split("@");
              let modifParName = nameParts[0];
              if (isOCRD) modifParName += '@SELECT "CardCode", "CardName" FROM (' + nameParts[1] + ")";
              else if (isOITM) modifParName += '@SELECT "ItemCode", "ItemName" FROM (' + nameParts[1] + ")";

              if (isOCRD || isOITM) {
                parComponent = (
                  <ComboBox
                    key={par.Name}
                    label={par.PromptText}
                    name={par.Name}
                    getOptionsApiRoute={"/api/reports/getParameterOptions?parName=" + encodeURIComponent(modifParName)}
                    value={value.Value}
                    onChange={this.onFieldChange}
                  />
                );
                parComponentTo = (
                  <ComboBox
                    key={"EndValueOf_" + par.Name}
                    label=""
                    name={"EndValueOf_" + par.Name}
                    getOptionsApiRoute={"/api/reports/getParameterOptions?parName=" + encodeURIComponent(modifParName)}
                    value={value.EndValue}
                    onChange={this.onFieldChange}
                  />
                );
              }
            }
          } else if (hasSelect) {
            parComponent = (
              <ComboBox
                key={par.Name}
                label={par.PromptText}
                name={par.Name}
                getOptionsApiRoute={"/api/reports/getParameterOptions?parName=" + encodeURIComponent(par.Name)}
                value={value.Value}
                onChange={this.onFieldChange}
              />
            );
            if (isRange) {
              parComponentTo = (
                <ComboBox
                  key={"EndValueOf_" + par.Name}
                  label=""
                  name={"EndValueOf_" + par.Name}
                  getOptionsApiRoute={"/api/reports/getParameterOptions?parName=" + encodeURIComponent(par.Name)}
                  value={value.EndValue}
                  onChange={this.onFieldChange}
                />
              );
            }
          } else {
            if (
              par.ParameterValueKind === sappy.CrystalReports.ParameterValueKind.DateParameter ||
              par.ParameterValueKind === sappy.CrystalReports.ParameterValueKind.DateTimeParameter
            ) {
              parComponent = (
                <Date key={par.Name} label={par.PromptText} name={par.Name} value={value.Value} onChange={this.onFieldChange} />
              );
            } else {
              parComponent = (
                <TextBox key={par.Name} label={par.PromptText} name={par.Name} value={value.Value} onChange={this.onFieldChange} />
              );
            }
          }

          if (parComponent) parameterComponents.push(parComponent);
          if (parComponentTo) parameterComponents.push(parComponentTo);
        });

      return parameterComponents;
    };

    return (
      <Modal isOpen={true} className={"modal-md"}>
        <ModalHeader toggle={this.props.toggleModal}>{this.props.DocName} </ModalHeader>
        <ModalBody>

          {renderParameters()}

        </ModalBody>
        <ModalFooter>
          <Button color="success" disabled={this.state.saving} onClick={this.handleClickContinuar}>
            Continuar
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default ModalReportParams;
