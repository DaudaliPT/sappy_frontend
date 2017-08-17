import React, { Component } from "react";
var $ = window.$;
// import "../login-v3.css";

class ForgotPassword extends Component {
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
                <img className="brand-img" src="site.ico" alt="..." />
                <h2 className="brand-text font-size-18">Rachida's Cash & Carry</h2>
              </div>

              <h2>Forgot Your Password ?</h2>
              <p>Input your registered email to reset your password</p>
              <form method="post" role="form">
                <div className="form-group">
                  <input type="email" className="form-control" id="inputEmail" name="email" placeholder="Your Email" />
                </div>
                <div className="form-group">
                  <button type="submit" className="btn btn-primary btn-block">Reset Your Password</button>
                </div>
              </form>

              <p>Have account already? Please go to <a href="/#/login">Sign In</a></p>
            </div>
          </div>
          <footer className="page-copyright page-copyright-inverse">
            <p>WEBSITE BY amazingSurge</p>
            <p>© 2017. All RIGHT RESERVED.</p>
            <div className="social">
              <a className="btn btn-icon btn-pure" href="#">
                <i className="icon bd-twitter" aria-hidden="true" />
              </a>
              <a className="btn btn-icon btn-pure" href="#">
                <i className="icon bd-facebook" aria-hidden="true" />
              </a>
              <a className="btn btn-icon btn-pure" href="#">
                <i className="icon bd-google-plus" aria-hidden="true" />
              </a>
            </div>
          </footer>
        </div>
      </div>
    );
  }
}

export default ForgotPassword;
