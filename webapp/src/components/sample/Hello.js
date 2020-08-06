"use strict";

import React from "react";
import { connect } from "react-redux";
const blockchainApi = require("../../apis/blockchainApi.js");

import { Container, Row, Col, Button, Table } from "reactstrap";

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
      <Container>
        <Row>
          <Col xs="9" className="text-md-left">
            <b>Kontaktdatenblatt auf der Blockchain</b>
          </Col>
          <Col xs="3" className="text-md-right">
            <Button color="success">Marktpartner anlegen</Button>{" "}
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <Table>
              <thead>
                <tr>
                  <th className="text-md-left">Name</th>
                  <th className="text-md-center">Blockchain Identitäten</th>
                  <th className="text-md-center">Verifiziert</th>
                  <th className="text-md-center">Verifizierung gültig bis</th>
                  <th className="text-md-center">Kontaktdaten</th>
                  <th className="text-md-right">Kontaktdaten ändern</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" className="text-md-left">
                    50Hertz
                  </th>
                  <td className="text-md-center">0x12</td>
                  <td className="text-md-center">Verifiziert</td>
                  <td className="text-md-center">01.01.2021</td>
                  <td className="text-md-center">
                    <Button color="success">Anzeigen</Button>{" "}
                  </td>
                  <td className="text-md-right">
                    <Button color="warning">Ändern</Button>{" "}
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="text-md-left">
                    EnBW
                  </th>
                  <td className="text-md-center">0x34</td>
                  <td className="text-md-center">
                    <Button color="danger">Verifizieren</Button>{" "}
                  </td>
                  <td className="text-md-center">01.01.2022</td>
                  <td className="text-md-center">
                    <Button color="success">Anzeigen</Button>{" "}
                  </td>
                  <td className="text-md-right">
                    <Button color="warning">Ändern</Button>{" "}
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="text-md-left">
                    E.ON
                  </th>
                  <td className="text-md-center">0x56</td>
                  <td className="text-md-center">
                    <Button color="danger">Verifizieren</Button>{" "}
                  </td>
                  <td className="text-md-center">01.01.2023</td>
                  <td className="text-md-center">
                    <Button color="success">Anzeigen</Button>{" "}
                  </td>
                  <td className="text-md-right">
                    <Button color="warning">Ändern</Button>{" "}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
        <Row>
          <Col>
            Marktpartner Register:{" "}
            <a href="https://www.etherscan.org/0x123" target="_blank">
              Anzeigen
            </a>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Hello);

// <h1>{this.props.greeting}</h1>
// <h4>Accounts: {this.props.accounts}</h4>
