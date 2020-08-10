"use strict";

import React from "react";
import { Route, Switch } from "react-router-dom";
import { withRouter } from "react-router";

import Register from "./Register.js";

class Main extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className="container-fluid h-100" style={{ marginTop: "100px" }}>
          <Route exact path="/" component={Register} />
        </div>
      </div>
    );
  }
}

export default withRouter(Main);
