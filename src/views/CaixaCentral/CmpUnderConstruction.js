import React, { Component } from "react";


class UnderConstruction extends Component {
  render() {

    return (
      <div className="page-content container-fluid ">
        <div className="row justify-content-center" data-plugin="matchHeight" data-by-row="true">

          <div className="col col-md-8 col-lg-6  ">
            <div id="centeredWidget" className="card card-shadow pb-20">

              <div className="card-block">
                <div className="row text-center mb-20">
                  <div className="col-12">
                    <h1><i className="icon wb-settings icon-spin page-maintenance-icon" aria-hidden="true" /></h1>
                    <p>Trabalhos em curso...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default UnderConstruction;
