import React, { Component } from "react";
var $ = window.$;
import axios from "axios";
var sappy = window.sappy;

class Login extends Component {
  constructor(props) {
    super(props);
    this.onSubmitLogin = this.onSubmitLogin.bind(this);
    this.onSelectCompany = this.onSelectCompany.bind(this);

    this.state = {
      company: "",
      companys: []
    };
  }

  componentWillMount() {
    $("body").addClass("page-login-v3").addClass("layout-full");

    var that = this;
    this.serverRequest = axios
      .get("auth/companys")
      .then(result => {
        let company = "";

        if (result.data && result.data.length === 1) company = result.data[0].dbName
        that.setState({ companys: result.data, company });
      })
      .catch(error => {
        sappy.parseBackendError("Não foi possível obter a informação do utilizador:", error);
      });
  }

  componentWillUnmount() {
    $("body").removeClass("page-login-v3").removeClass("layout-full");
  }

  onSelectCompany(e) {
    this.setState({ company: e.target.value });
  }

  onSubmitLogin(e) {
    e.preventDefault();
    // get item data
    var { username, password, company } = this.refs;
    var that = this;
    this.serverRequest = axios({
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({ username: username.value, password: password.value, company: company.value }),
      url: "auth/login"
    })
      .then(result => {
        console.log(result);
        window.location.href = "/";
      })
      .catch(error => sappy.showError(error));
  }
  render() {
    var { companys, company } = this.state;


    let renderCompanys = () => {
      var options = [
        <option key="none" value={""} />,
        companys.map(cmp => {
          var { dbName, cmpName } = cmp;
          return <option key={dbName} value={dbName}>{cmpName}</option>;
        })
      ];

      return (
        <select className="form-control" name="company" ref="company" onChange={this.onSelectCompany} value={company}>
          {options}
        </select>
      );
    };

    return (
      <div className="page vertical-align text-center" data-animsition-in="fade-in" data-animsition-out="fade-out">
        <div className="page-content vertical-align-middle animation-slide-top animation-duration-1">
          <div className="panel">

            <div className="panel-body">
              <div className="brand">
                <img id="logo" className="brand-img" src="img/site_red.png" alt="..." />

              </div>
              <form onSubmit={this.onSubmitLogin}>
                <div className="form-group form-material floating" data-plugin="formMaterial">
                  <input type="username" className="form-control" name="username" ref="username" autoFocus />
                  <label className="floating-label">Utilizador</label>
                </div>
                <div className="form-group form-material floating" data-plugin="formMaterial">
                  <input type="password" className="form-control" name="password" ref="password" />
                  <label className="floating-label">Senha de acesso</label>
                </div>
                <div className="form-group form-material floating" data-plugin="formMaterial">
                  {renderCompanys()}
                  <label className="floating-label">Empresa SAP</label>
                  <label> {company}</label>
                </div>
                <button type="submit" className="btn btn-primary btn-block btn-lg mt-40">Iniciar sessão</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
