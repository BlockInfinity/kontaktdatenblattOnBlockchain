"use strict";

import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import Main from "./components/Main.js";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, combineReducers } from "redux";
import { BrowserRouter as Router, Route } from "react-router-dom";
import SampleReducer from "./reducers/SampleReducer.js";

let reducers = combineReducers({
  SampleReducer: SampleReducer
});

const store = createStore(reducers);

const wrapper = document.getElementById("root");

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Main />
    </Router>
  </Provider>,
  wrapper
);
