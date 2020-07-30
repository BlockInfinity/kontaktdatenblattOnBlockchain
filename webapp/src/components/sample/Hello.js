"use strict";

import React from "react";
import { connect } from "react-redux";
const blockchainApi = require("../../apis/blockchainApi.js");

const mapStateToProps = state => ({
  greeting: state.SampleReducer.greeting,
  accounts: state.SampleReducer.accounts
});

const mapDispatchToProps = dispatch => {
  return {
    getAccounts: async () => {
      let res = await blockchainApi.getAccounts();

      dispatch({
        type: "SET_ACCOUNTS",
        accounts: res.accounts
      });
    }
  };
};

class Hello extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.getAccounts();
  }

  render() {
    return (
      <div>
        <h1>{this.props.greeting}</h1>
        <h4>Accounts: {this.props.accounts}</h4>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Hello);
