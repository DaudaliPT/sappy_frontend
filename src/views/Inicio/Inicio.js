import React, { Component } from "react";
var $ = window.$;
var sappy = window.sappy;

class Inicio extends Component {
  constructor(props) {
    super(props);
    this.handleLogoImageError = this.handleLogoImageError.bind(this);

    this.state = {
      companyLogo: "img/" + sappy.sessionInfo.company.dbName + "/logo.png"
    };
  }

  handleLogoImageError(event) {
    if (this.state.companyLogo !== "img/company.png") {
      this.setState({ companyLogo: "img/company.png" });
    }
  }

  componentWillMount() {
    $("body").addClass("page-maintenance").addClass("layout-full");
  }

  componentDidMount() {
    $('.tokenfield').tokenfield()
  }
  componentWillUnmount() {
    $("body").removeClass("page-maintenance").removeClass("layout-full");
  }

  render() {
    var { user, company } = sappy.sessionInfo;
    var { companyLogo } = this.state;

    return (
      <div className="page-content container-fluid ">
        <div className="row justify-content-center" data-plugin="matchHeight" data-by-row="true">

          {/*<!-- Personal -->*/}
          <div className="col col-md-8 col-lg-6  ">
            <div id="centeredWidget" className="card card-shadow pb-20">
              <div className="card-header card-header-transparent cover overlay">
                <img className="cover-image" src="../../global/photos/placeholder.png" alt="..." />
                <div className="overlay-panel overlay-background vertical-align">
                  <div className="vertical-align-middle">
                    <a className="avatar">
                      <img onError={this.handleLogoImageError} src={companyLogo} alt="..." />
                    </a>
                  </div>
                </div>
              </div>
              <div className="card-block">
                <div className="row text-center mb-20">
                  <div className="col-12">
                    <div className="font-size-14 mt-10">Sessão iniciada como <em>{user.NAME}</em>, na empresa:</div>
                    <div className="font-size-20 mt-10">{company.cmpName}</div>
                    <div className="font-size-14">({company.dbName})</div>
                  </div>
                </div>
                <div className="row text-center mb-20">
                  <div className="col-6">
                    <div className="counter">
                      <div className="counter-label total-completed">Versão</div>
                      <div className="counter-number green-600">{company.versStr}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="counter">
                      <div className="counter-label">Localização</div>
                      <div className="counter-number blue-600">{company.LOC}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div >
    );
  }
}

export default Inicio;
