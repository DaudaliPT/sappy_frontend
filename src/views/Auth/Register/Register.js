import React, { Component } from "react";
var $ = window.$;
import "../login-v3.css";

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    $("body").addClass("page-login-v3").addClass("layout-full");
  }

  componentDidUnmount() {
    $("body").removeClass("page-login-v3").removeClass("layout-full");
  }

  render() {
    return (
      <div className="page vertical-align text-center" data-animsition-in="fade-in" data-animsition-out="fade-out">
        &gt;
        <div className="page-content vertical-align-middle animation-slide-top animation-duration-1">
          <div className="panel">
            <div className="panel-body">
              <div className="brand">
                <img id="logo" className="brand-img" src="img/site.ico" alt="..." />
                <h2 className="brand-text font-size-18">Rachida's Cash & Carry</h2>
              </div>
              <form method="post" action="/auth/register">
                <div className="form-group form-material floating" data-plugin="formMaterial">
                  <input type="text" className="form-control" name="name" />
                  <label className="floating-label">Nome de utilizador</label>
                </div>
                <div className="form-group form-material floating" data-plugin="formMaterial">
                  <input type="email" className="form-control" name="email" />
                  <label className="floating-label">Email</label>
                </div>
                <div className="form-group form-material floating" data-plugin="formMaterial">
                  <input type="password" className="form-control" name="password" />
                  <label className="floating-label">Senha de acesso</label>
                </div>
                <div className="form-group form-material floating" data-plugin="formMaterial">
                  <input type="password" className="form-control" name="PasswordCheck" />
                  <label className="floating-label">Confirme a senha de acesso</label>
                </div>
                <button type="submit" className="btn btn-primary btn-block btn-lg mt-40">Registar</button>
              </form>
              <p>Já tem conta? Aceda a <a href="/#/login">Iniciar sessão</a></p>
            </div>
          </div>
          <footer className="page-copyright page-copyright-inverse">
            <p>{"Rachida's "} © 2017. All RIGHT RESERVED.</p>
            <p />
            <p>{"byU's, powered with SAP HANA"}</p>

          </footer>
        </div>
      </div>
    );
  }
}

export default Register;
