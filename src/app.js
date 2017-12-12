import React, { Component } from "react";
import { Router, Route, IndexRoute, hashHistory } from "react-router";
import "./appMenus.js";

// Containers
import Inicio from "./views/Inicio/";
import Full from "./containers/Full/";
import PosContainer from "./containers/PosContainer/";
import Pos from "./views/Pos/";
import Simple from "./containers/Simple/";
import Login from "./views/Auth/Login/";
import ForgotPassword from "./views/Auth/ForgotPassword/";
// import UnderConstruction from "./views/UnderConstruction/";
import NotFound from "./views/NotFound/";

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

var buildedRoutes = [<IndexRoute component={Inicio} />];
var processMenuLevel = menus => {
  menus.forEach(menu => {
    if (menu.menus) {
      processMenuLevel(menu.menus);
    } else if (menu.component) {
      buildedRoutes.push(<Route key={"route_" + menu.fullName} path={menu.fullName} name={menu.fullName} component={menu.component} />);
    }
  });
};

processMenuLevel(sappy.app.menus);

class App extends Component {
  constructor(props) {
    super(props);
    this.requireAuth = this.requireAuth.bind(this);
  }

  requireAuth(nextState, replace, callback) {
    let sessionInfo = sappy.sessionInfo || {};
    var user = sessionInfo.user || {};

    sappy.hideModals();
    sappy.hidePopbox();
    sappy.hidePopover();

    if (user.NAME) {
      if (nextState.location.pathname === "/") {
        let showSappy = ",manager,ibrahim,dora,mansur,marlene,zara,adelaide,antunes,".indexOf("," + sappy.sessionInfo.user.NAME + ",") > -1;
        if (!showSappy) hashHistory.push("/pos");
      }

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
          <Route path="/pos" name="Pos" component={PosContainer} onEnter={this.requireAuth}>
            <IndexRoute component={Pos.PosMenu} />
            <Route path="/pos/oqut" name="." component={Pos.Oqut} />
            <Route path="/pos/ordr" name="." component={Pos.Ordr} />
            <Route path="/pos/oinv" name="." component={Pos.Oinv} />
            <Route path="/pos/orin" name="." component={Pos.Orin} />
            <Route path="/pos/odln" name="." component={Pos.Odln} />
          </Route>
          <Route path="*" component={NotFound} />
        </Router>
      </div>
    );
  }
}
export default App;
