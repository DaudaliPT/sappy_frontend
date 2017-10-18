import React, { Component } from "react";
import { Router, Route, IndexRoute, hashHistory } from "react-router";
import './appMenus.js'

// Containers
import Inicio from "./views/Inicio/";
import Full from "./containers/Full/";
import Simple from "./containers/Simple/";
import Login from "./views/Auth/Login/";
import ForgotPassword from "./views/Auth/ForgotPassword/";
import UnderConstruction from "./views/UnderConstruction/";

var sappy = window.sappy;

var processMenuFullName = (fathername, menus) => {
  menus.forEach(menu => {
    menu.fullName = (fathername || "") + "/" + menu.name;
    if (menu.menus) {
      // processar submenus
      processMenuFullName(menu.fullName, menu.menus);
    } else {
      menu.to = menu.to || menu.fullName;
    }
  });
};
processMenuFullName(null, sappy.app.menus);

var routes = [<IndexRoute component={Inicio} />];
var processMenuLevel = menus => {
  menus.forEach(menu => {
    if (menu.menus) {
      processMenuLevel(menu.menus);
    } else if (menu.component) {
      routes.push(<Route key={"route_" + menu.fullName} path={menu.fullName} name={menu.fullName} component={menu.component} />);
    }
  });
};
processMenuLevel(sappy.app.menus);

const buildedRoutes = [...routes]; // tentativa falhada de construir

class App extends Component {
  constructor(props) {
    super(props);
    this.requireAuth = this.requireAuth.bind(this);

  }

  requireAuth(nextState, replace, callback) {
    let sessionInfo = sappy.sessionInfo || {}
    var user = sessionInfo.user || {};
    if (user.NAME) {
      callback();
    } else {
      hashHistory.push("/login");
    }
  }

  render() {
    return (
      <div>
        <Router history={hashHistory}>
          <Route path="/" name="Main" component={Full} children={buildedRoutes} onEnter={this.requireAuth} />
          <Route path="/" name="Login" component={Simple}>
            <IndexRoute component={Login} />
            <Route path="/login" name="." component={Login} />
            <Route path="/forgotpass" name="ForgotPassword" component={ForgotPassword} />
          </Route>
        </Router>
      </div>
    );
  }
}
export default App;
