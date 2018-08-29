import React, { Component } from "react";

class NotFound extends Component {
  render() {
    var { route, location } = this.props;

    return (
      <div className="page-content container-fluid ">
        <div
          className="row justify-content-center"
          data-plugin="matchHeight"
          data-by-row="true"
        >
          <div className="col col-md-8 col-lg-6  ">
            <div id="centeredWidget" className="card card-shadow pb-20">
              <div className="card-header card-header-transparent cover overlay">
                {/* <img
                  className="cover-image"
                  src="../../global/photos/placeholder.png"
                  alt="..."
                /> */}
                <div className="overlay-panel overlay-background vertical-align">
                  <div className="vertical-align-middle">
                    <h3>
                      {route.name}
                    </h3>
                    <p>
                      [{location.pathname}]
                    </p>
                  </div>
                </div>
              </div>
              <div className="card-block">
                <div className="row text-center mb-20">
                  <div className="col-12">
                    <h1>
                      <i
                        className="icon fa-asterisk icon-spin"
                        aria-hidden="true"
                      />
                    </h1>
                    <p>Conteúdo não encontrado...</p>
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

export default NotFound;
