// console.clear();
import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";

import "./js/byus.js";
import App from "./app";
import "./index.css";
import "./modified_site.css";
import 'react-select/dist/react-select.css'
import "react-toggle/style.css"
var byUs = window.byUs;

axios
  .get("auth/sessioninfo")
  .then(result => {
    byUs.sessionInfo = result.data;

    //check if session is  valid
    if (byUs.sessionInfo && byUs.sessionInfo.company && byUs.sessionInfo.company.oadm) {
      byUs.applySapDeformats();
    } else {
      axios
        .get("auth/logout")
        .then(result => window.location = window.location)
    }

    try {
      ReactDOM.render(<App />, document.getElementById("root"));
    } catch (error) {
      byUs.parseBackendError("Não foi possível fazer render da página: ", error);
      alert("Não foi possível fazer render da página: " + error.message);
    }
  })
  .catch(error => {
    byUs.parseBackendError("Não foi possível obter a informação do utilizador: ", error);
    alert("Não foi possível obter a informação do utilizador: " + error.message);
  });
