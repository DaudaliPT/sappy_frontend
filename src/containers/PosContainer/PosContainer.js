import React, { Component } from "react";
import Idle from "react-idle";
import axios from "axios";
import { hashHistory } from "react-router";
const sappy = window.sappy;

class Pos extends Component {
  constructor(props) {
    super(props);

    let settings = sappy.getSettings(["POS.GERAL.SESSION_TIMEOUT"]);

    this.SESSION_TIMEOUT = sappy.getNum(settings["POS.GERAL.SESSION_TIMEOUT"]) * 1000;
  }

  render() {
    return (
      <div className="pos">
        {this.SESSION_TIMEOUT > 0 &&
          <Idle
            timeout={this.SESSION_TIMEOUT}
            onChange={({ idle }) => {
              axios
                .post("auth/logout")
                .then(result => {
                  hashHistory.push("/login");
                })
                .catch(error => sappy.showError(error, "Não foi possível fazer logout"));
            }}
          />}
        <div className="pos-content">
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Pos;
