import React, { Component } from "react";
import RootMenu from "./ByUsMenus";
import { hashHistory } from "react-router";
import axios from "axios";
var $ = window.$;
var byUs = window.byUs;

class MenuBar extends Component {
  constructor(props) {
    super(props);

    this.onClickLogout = this.onClickLogout.bind(this);
    this.handleLogoImageError = this.handleLogoImageError.bind(this);

    this.state = {
      menus: byUs.app.menus
    };
  }

  onClickLogout(e) {
    e.preventDefault();
    this.serverRequest = axios
      .post("auth/logout")
      .then(result => {
        hashHistory.push("/login");
      })
      .catch(error => byUs.showError(error, "Não foi possível fazer logout"));
  }

  componentDidMount() {
    $(".site-menu-item").on("click", e => {
      var thisMenu = $(e.target).closest(".site-menu-item");
      var temSubMenus = thisMenu.hasClass("has-sub");

      if (temSubMenus) {
        thisMenu.toggleClass("open");
        e.stopPropagation();
      } else {

        let btnHamburger = $(".navbar-toggler.hamburger");

        if (btnHamburger.css("display") === "block") {
          // Estamos em mobile
          btnHamburger.click();
          $(".site-menu-item.has-sub.open").removeClass("open");
        } else {
          // Estamos com menus no topo
          // Embora o mouse ainda esteja em cima do menu, forçar a esconde-los
          $(".site-menu-sub").css("display", "none");
          setTimeout(function () {
            // Algum tempo depois, remover esta propriedade (os menus já forame escondidos, o mouse
            // já não está em cima deles), de forma que o ccs:hover funcione novamente
            $(".site-menu-sub").css("display", "");
          }, 1000);
        }
      }
    });
  }
  handleLogoImageError(event) {
    $(".navbar-brand-logo").css("display", "none");
    $("#nologotext").css("display", "");
  }

  componentWillUnmount() {
    if (this.serverRequest && this.serverRequest.abort) this.serverRequest.abort();

    // $("body").removeClass("page-login-v3").removeClass("layout-full");
  }

  render() {
    var user = byUs.sessionInfo.user;

    var renderTopMenus = () => {
      if (user && user.NAME) {
        return this.state.menus.map(menu => {
          return <RootMenu key={"menu_" + menu.fullName} menu={menu} />;
        });
      }
    };

    var renderUser = () => {
      if (user && user.NAME) {
        return (
          <ul className="nav navbar-toolbar navbar-right navbar-toolbar-right">

            {/*<li className="nav-item hidden-float">
              <a
                className="nav-link icon md-search waves-effect waves-light waves-round"
                data-toggle="collapse"
                href="#"
                data-target="#site-navbar-search"
                role="button"
              >
                <span className="sr-only">Toggle Search</span>
              </a>
            </li>*/}

            <li className="nav-item hidden-sm-down" id="toggleFullscreen">
              <a
                className="nav-link icon icon-fullscreen waves-effect waves-light waves-round"
                data-toggle="fullscreen"
                href="#"
                role="button"
              >
                <span className="sr-only">Toggle fullscreen</span>
              </a>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link navbar-avatar waves-effect waves-light waves-round"
                data-toggle="dropdown"
                href="#"
                aria-expanded="false"
                data-animation="scale-up"
                role="button"
              >
                <span className="avatar avatar-online">
                  <img src="img/avatar_male.png" alt="..." />
                  {/*<i className="icon md-account" aria-hidden="true" />*/}
                  <i />
                </span>
              </a>
              <div className="dropdown-menu" role="menu">
                {/*<a className="dropdown-item waves-effect waves-light waves-round" href="#" role="menuitem">
                  <i className="icon md-account" aria-hidden="true" /> Profile
                </a>
                <a className="dropdown-item waves-effect waves-light waves-round" href="#" role="menuitem">
                  <i className="icon md-settings" aria-hidden="true" /> Settings
                </a>
                <div className="dropdown-divider" />*/}
                <a className="dropdown-item waves-effect waves-light waves-round" href="#" role="menuitem" onClick={this.onClickLogout}>
                  <i className="icon md-power" aria-hidden="true" /> Terminar sessão de {user.NAME}
                </a>
              </div>
            </li>

          </ul>
        );
      } else {
        return (
          <ul className="nav navbar-toolbar navbar-right navbar-toolbar-right">
            <a id="login" className="dropdown-item waves-effect waves-light waves-round" href="/#/login" role="button">
              <i className="icon md-power" aria-hidden="true" /> Iniciar sessão
            </a>
          </ul>
        );
      }
    };

    return (
      <nav className="site-navbar navbar navbar-default navbar-fixed-top navbar-inverse" role="navigation">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggler hamburger hamburger-close collapsed navbar-toggler-left"
            data-target="#site-navbar-collapse"
            data-toggle="collapse"
          >
            <span className="hamburger-bar" />
          </button>

          <div className="navbar-brand navbar-brand-center site-gridmenu-toggle" data-toggle="gridmenu">
            <p id="nologotext" style={{ display: "none", wordBreak: "break-word" }}>{byUs.sessionInfo.company.dbName} </p>
            <img
              className="navbar-brand-logo"
              style={{ height: "3rem" }}
              onError={this.handleLogoImageError}
              src={"./img/" + byUs.sessionInfo.company.dbName + "/logo_white.png"}
              title="Rachidas"
              alt={byUs.sessionInfo.company.dbName}
            />
          </div>
          <button type="button" className="navbar-toggler collapsed" data-target="#site-navbar-search" data-toggle="collapse">
            <span className="sr-only">Toggle Search</span>
            <i className="icon md-search" aria-hidden="true" />
          </button>
        </div>
        <div className="navbar-container container-fluid">
          {/*Navbar Collapse*/}
          <div className="collapse navbar-collapse navbar-collapse-toolbar" id="site-navbar-collapse">
            {/*Navbar Toolbar */}
            <ul className="nav navbar-toolbar">
              <li className="nav-item hidden-float" id="toggleMenubar">
                <a className="nav-link waves-effect waves-light waves-round" data-toggle="menubar" href="#" role="button">
                  <i className="icon hamburger hamburger-arrow-left">
                    <span className="sr-only">Toggle menubar</span>
                    <span className="hamburger-bar" />
                  </i>
                </a>
              </li>

              <li id="menubar">
                <ul className="site-menu site-menubar-light" data-plugin="menu">
                  {renderTopMenus()}
                </ul>
              </li>

            </ul>

            {/*End Navbar Toolbar */}
            {/*Navbar Toolbar Right */}
            {renderUser()}
            {/*End Navbar Toolbar Right */}
          </div>
          {/*End Navbar Collapse */}

          {/*Site Navbar Seach */}
          {/*<div className="collapse navbar-search-overlap" id="site-navbar-search">
            <form role="search">
              <div className="form-group">
                <div className="input-search">
                  <i className="input-search-icon md-search" aria-hidden="true" />
                  <input type="text" className="form-control" name="site-search" placeholder="Search..." />
                  <button
                    type="button"
                    className="input-search-close icon md-close"
                    data-target="#site-navbar-search"
                    data-toggle="collapse"
                    aria-label="Close"
                  />
                </div>
              </div>
            </form>
          </div>*/}
          {/*End Site Navbar Seach */}
        </div>
      </nav>
    );
  }
}

export default MenuBar;
