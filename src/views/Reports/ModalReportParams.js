import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import axios from "axios";
var $ = window.$;
var sappy = window.sappy;
import { TextBox, ComboBox, Date } from "../../Inputs";

class ModalReportParams extends Component {
  constructor(props) {
    super(props);

    this.onFieldChange = this.onFieldChange.bind(this);
    this.handleVerPdf = this.handleVerPdf.bind(this);
    this.handleImprimir = this.handleImprimir.bind(this);

    this.state = {
      parValues: {},
      reportParameters: [],
      loading: true
    };
  }

  componentWillMount() {
    $("body").css("position", "fixed");
  }
  componentDidMount() {
    let that = this;

    axios
      .get("/api/reports/params/" + this.props.DocCode)
      .then(function(result) {
        let parameters = result.data;
        if (typeof parameters === "string") parameters = JSON.parse(parameters);
        that.setState({ loading: false, reportParameters: parameters });
      })
      .catch(function(error) {
        if (!error.__CANCEL__) sappy.showError(error, "Api error");
      });
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

  handleVerPdf(e) {
    var baseUrl = "";

    if (window.location.port === "3000") {
      // Nota: Em desev, é preciso redirecionar o pedido. Já em produtivo a api é servida na mesma porta do pedido
      baseUrl = "http://byusserver:3005";
    }

    var apiRoute = "/api/reports/pdf/" + this.props.DocCode;
    var apiQuery = "?parValues=" + encodeURIComponent(JSON.stringify(this.state.parValues));
    // Executar o mapa

    window.open(baseUrl + apiRoute + apiQuery, "_blank");
    this.props.toggleModal();
  }

  handleImprimir(e) {
    let that = this;
    var apiRoute = "/api/reports/print/" + this.props.DocCode;
    var apiQuery = "?parValues=" + encodeURIComponent(JSON.stringify(this.state.parValues));
    // Executar o mapa

    sappy.showToastr({ color: "info", msg: `A impimir...` });
    that.props.toggleModal();
    axios
      .get(apiRoute + apiQuery)
      .then(function(rrrr) {
        sappy.showToastr({ color: "success", msg: `Relatório enviado para a impressora!` });
      })
      .catch(function(error) {
        sappy.showError(error, "Api error");
      });
  }

  componentWillUnmount() {
    $("body").css("position", "initial");
    if (this.serverRequest && this.serverRequest.abort) {
      this.serverRequest.abort();
    }
  }
  render() {
    let { reportParameters, loading } = this.state;

    let renderParameters = () => {
      let parameterComponents = [];

      if (loading) {
        let parComponent = (
          <div>
            <div className="example-loading example-well h-150 vertical-align text-center">
              <div className="loader vertical-align-middle loader-tadpole" />
            </div>
            <div className="vertical-align text-center">
              <div className="vertical-align-middle">
                <p>A analisar relatório...</p>
              </div>
            </div>
          </div>
        );
        parameterComponents.push(parComponent);
      } else if (reportParameters.length === 0) {
        let parComponent = (
          <div>
            <div className="vertical-align text-center">
              <div className="vertical-align-middle">
                <p>Este relatório não requer parametros...</p>
              </div>
            </div>
          </div>
        );
        parameterComponents.push(parComponent);
      } else {
        reportParameters
          .filter(par => {
            // Bitwise compare
            let isShowOnPanel = (par.ParameterFieldUsage2 & sappy.CrystalReports.ParameterFieldUsage2.ShowOnPanel) === sappy.CrystalReports.ParameterFieldUsage2.ShowOnPanel;
            let isEditableOnPanel = (par.ParameterFieldUsage2 & sappy.CrystalReports.ParameterFieldUsage2.EditableOnPanel) === sappy.CrystalReports.ParameterFieldUsage2.EditableOnPanel;
            let isDataFetching = (par.ParameterFieldUsage2 & sappy.CrystalReports.ParameterFieldUsage2.DataFetching) === sappy.CrystalReports.ParameterFieldUsage2.DataFetching;

            return par.ReportName === "" && (isShowOnPanel || isEditableOnPanel || isDataFetching);
          })
          .forEach(par => {
            let parComponent;
            let parComponentTo;

            let hasSelect = par.Name.toUpperCase().indexOf("@SELECT") >= 0;
            let isRange = par.DiscreteOrRangeKind === sappy.CrystalReports.DiscreteOrRangeKind.RangeValue;
            let isDiscreteAndRange = par.DiscreteOrRangeKind === sappy.CrystalReports.DiscreteOrRangeKind.DiscreteAndRangeValue;
            let value = this.state.parValues[par.Name] || {};
            let label = par.PromptText || par.Name;

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
                      label={label}
                      name={par.Name}
                      getOptionsApiRoute={"/api/reports/param/values?parName=" + encodeURIComponent(modifParName)}
                      value={value.Value}
                      onChange={this.onFieldChange}
                    />
                  );
                  parComponentTo = (
                    <ComboBox
                      key={"EndValueOf_" + par.Name}
                      label=""
                      name={"EndValueOf_" + par.Name}
                      getOptionsApiRoute={"/api/reports/param/values?parName=" + encodeURIComponent(modifParName)}
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
                  label={label}
                  name={par.Name}
                  getOptionsApiRoute={"/api/reports/param/values?parName=" + encodeURIComponent(par.Name)}
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
                    getOptionsApiRoute={"/api/reports/param/values?parName=" + encodeURIComponent(par.Name)}
                    value={value.EndValue}
                    onChange={this.onFieldChange}
                  />
                );
              }
            } else {
              if (par.ParameterValueKind === sappy.CrystalReports.ParameterValueKind.DateParameter || par.ParameterValueKind === sappy.CrystalReports.ParameterValueKind.DateTimeParameter) {
                parComponent = <Date key={par.Name} label={label} name={par.Name} value={value.Value} onChange={this.onFieldChange} />;
              } else {
                parComponent = <TextBox key={par.Name} label={label} name={par.Name} value={value.Value} onChange={this.onFieldChange} />;
              }
            }

            if (parComponent) parameterComponents.push(parComponent);
            if (parComponentTo) parameterComponents.push(parComponentTo);
          });
      }
      return parameterComponents;
    };

    return (
      <Modal isOpen={true} className={"modal-m modal-success"}>
        <ModalHeader toggle={this.props.toggleModal}>
          {this.props.DocName}
        </ModalHeader>
        <ModalBody>
          <div style={{ minHeight: "150px" }}>
            {renderParameters()}
          </div>
          <div className="sappy-action-bar animation-slide-left">
            <Button color="secondary" onClick={this.handleImprimir} disabled={this.state.loading}>
              <i className="icon fa-print" /> Imprimir
            </Button>
            <Button color="secondary" onClick={this.handleVerPdf} disabled={this.state.loading}>
              <i className="icon fa-file-pdf-o" /> Visualizar
            </Button>
          </div>
        </ModalBody>
      </Modal>
    );
  }
}

export default ModalReportParams;
