// console.clear();
import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";

import "./js/sappy.js";
import App from "./app";
import "./index.css";
import "./modified_site.css";
import 'react-select/dist/react-select.css'
import "react-toggle/style.css"
var sappy = window.sappy;

axios
  .get("auth/sessioninfo")
  .then(result => {
    sappy.sessionInfo = result.data;

    //check if session is  valid
    if (sappy.sessionInfo && sappy.sessionInfo.company && sappy.sessionInfo.company.oadm) {
      sappy.applySapDeformats();
    } else {
      axios
        .get("auth/logout")
        .then(result => window.location = window.location)
    }

    try {
      ReactDOM.render(<App />, document.getElementById("root"));
    } catch (error) {
      sappy.parseBackendError("Não foi possível fazer render da página: ", error);
      alert("Não foi possível fazer render da página: " + error.message);
    }
  })
  .catch(error => {
    sappy.parseBackendError("Não foi possível obter a informação do utilizador: ", error);
    alert("Não foi possível obter a informação do utilizador: " + error.message);
  });
