import React, { Component } from "react";
const $ = window.$;
const sappy = window.sappy;

import BaseLandingPage from "../BaseLandingPage";
import ModalReportParams from "./ModalReportParams";

class LpReports extends Component {
  constructor(props) {
    super(props);
    this.toggleModal = this.toggleModal.bind(this);
    this.handleOnClick_report = this.handleOnClick_report.bind(this);

    this.state = {
      currentModal: null,
      settings: {}
    };
  }

  componentDidMount() {
    this.setState({
      settings: sappy.getSettings(["GERAL.GERAL.IMPRESSORA"])
    })
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

    return that.setState({
      currentModal: <ModalReportParams
        DocCode={DocCode}
        DocName={DocName}
        toggleModal={that.toggleModal}
      />
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
                    className="sappy-execute btn btn-round btn-outline btn-default"
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
