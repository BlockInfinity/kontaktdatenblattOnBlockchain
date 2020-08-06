"use strict";

import React from "react";
import { Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import { withRouter } from "react-router";

import Hello from "./sample/Hello.js";

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => {
  return {};
};

class Main extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className="container-fluid h-100" style={{ marginTop: "100px" }}>
          <Route exact path="/hello" component={Hello} />
          <Route exact path="/" component={Hello} />
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Main));
