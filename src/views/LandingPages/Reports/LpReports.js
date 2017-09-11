import React, { Component } from "react";
import axios from "axios";
const $ = window.$;
const byUs = window.byUs;

import BaseLandingPage from "../BaseLandingPage";
import ModalReportParams from "./ModalReportParams";

class LpReports extends Component {
  constructor(props) {
    super(props);
    this.toggleModal = this.toggleModal.bind(this);
    this.handleOnClick_report = this.handleOnClick_report.bind(this);

    this.state = {
      currentModal: null
    };
  }

  toggleModal(refresh) {
    this.setState({
      currentModal: null,
      forceLandingPageRefresh: refresh
    });
  }

  handleOnClick_report(e) {
    e.preventDefault();
    var that = this;
    // var thisBtn = $(e.target).closest("button")[0];

    var vrow = $(e.target).closest(".byusVirtualRow")[0];
    let id = vrow.id;
    let DocCode = id.split("|")[1];
    let DocName = id.split("|")[2];


    // byUs.showProgress

    byUs.showWaitProgress("A processar, aguarde por favor...");

    if (this.cancelPreviousAxiosRequest) this.cancelPreviousAxiosRequest();
    var CancelToken = axios.CancelToken;
    this.serverRequest = axios
      .get("/api/reports/getParameters(" + DocCode + ")", {
        cancelToken: new CancelToken(function executor(c) {
          // An executor function receives a cancel function as a parameter
          that.cancelPreviousAxiosRequest = c;
        })
      })
      .then(function (result) {
        byUs.hideWaitProgress();

        let reportParameters = result.data;
        if (typeof reportParameters === "string") {
          reportParameters = JSON.parse(reportParameters);
        }


        if (reportParameters.length === 0) {
          var baseUrl = "";

          if (window.location.port === "3000") {
            //   Nota: Em desenv, é preciso redirecionar o pedido.Já em produtivo a api é servida na mesma porta do pedido
            baseUrl = "http://localhost:3005";
          }

          var apiRoute = "/api/reports/getPdf(" + DocCode + ")";
          var apiQuery = "?parValues=" + encodeURIComponent(JSON.stringify(reportParameters));
          // Executar o mapa

          window.open(baseUrl + apiRoute + apiQuery, "_blank");

        } else {
          that.setState({
            currentModal: <ModalReportParams
              modal={true}
              DocCode={DocCode}
              DocName={DocName}
              reportParameters={reportParameters}
              toggleModal={that.toggleModal}
            />
          });
        }
      })
      .catch(function (error) {
        if (!error.__CANCEL__) byUs.showError(error, "Api error")
      });
  }

  render() {
    const renderRow = ({ row, index }) => {

      let rowId = "row|" + row.DocCode + "|" + row.DocName;
      let rowStyleClass = "";
      return (
        <div className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={this.handleOnClick_report} id={rowId} >
          <div className="container vertical-align-middle">

            {/*large displays*/}
            <div className="row ">
              <div className="col-1 hidden-lg-down">
                <a className="avatar">
                  <img className="img-fluid" src="/img/report.jpg" alt="..." />
                </a>
              </div>
              <div className="col lastcol">
                <span className="title hidden-md-up"> {row.DocName}</span>
                <span className="title hidden-sm-down"> <strong>{row.DocName}</strong></span>
                <br className="hidden-sm-down" />
                <span className="metas hidden-sm-down">{row.Notes}</span>
                {/* <span className="float-right">
                  <button
                    type="button"
                    className="byus-execute btn btn-round btn-outline btn-default"
                    id={row.DocCode}
                    name={row.DocName}
                    onClick={this.handleOnClick_report}
                  >
                    <i className="icon fa-file-pdf-o font-size-20 active" />
                    <span className="hidden-sm-down"> Executar</span>
                  </button>
                </span> */}
              </div>
            </div>
          </div >
        </div >
      );
    };

    return (
      <BaseLandingPage
        pageTitle="Reports"
        searchPlaceholder="Procurar..."
        searchApiUrl="api/reports"
        renderRow={renderRow}
        renderRowHeight={60}
        currentModal={this.state.currentModal}
        currentPopover={null}
        refresh={false}
        actions={[]}
      />
    );
  }
}

export default LpReports;
