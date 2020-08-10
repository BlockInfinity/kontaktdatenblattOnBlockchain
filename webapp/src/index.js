"use strict";

import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import Main from "./components/Main.js";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";

const wrapper = document.getElementById("root");

ReactDOM.render(
  <Router>
    <Main />
  </Router>,
  wrapper
);
