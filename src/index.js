// console.clear();
import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";

import "./js/sappy.js";
import AppBase from "./appBase";
import App from "./app";
import "./index.css";
import "./modified_site.css";
import "react-select/dist/react-select.css";
import "react-toggle/style.css";
import "rc-slider/assets/index.css";
import "rc-tooltip/assets/bootstrap.css";

var sappy = window.sappy;

try {
  ReactDOM.render(<AppBase />, document.getElementById("shared"));
} catch (error) {
  // alert("Render error");
  console.error(error);
}

axios
  .get("auth/sessioninfo")
  .then(result => {
    sappy.sessionInfo = result.data;

    //check if session is  valid
    if (sappy.sessionInfo && sappy.sessionInfo.company && sappy.sessionInfo.company.oadm) {
      sappy.applySapDeformats();
    } else {
      axios.get("auth/logout").then(result => (window.location = window.location));
    }

    try {
      ReactDOM.render(<App />, document.getElementById("root"));
    } catch (error) {
      sappy.showError(error, "Render error");
    }
  })
  .catch(error => {
    sappy.showError(error, "Sappy backend unavailable!");
  });
