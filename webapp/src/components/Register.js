"use strict";

import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaRegEdit } from "react-icons/fa";
import moment from "moment";

import { Container, Row, Col, Button, ButtonGroup, Table } from "reactstrap";

const blockchainApi = require("../apis/blockchainApi.js");

import CreateMarktpartnerModal from "./modals/CreateMarktpartnerModal.js";
import UpdateCompanyNameModal from "./modals/UpdateCompanyNameModal.js";
import VerifyMarktpartnerModal from "./modals/VerifyMarktpartnerModal.js";
import CreateOrUpdateContactInformationModal from "./modals/CreateOrUpdateContactInformationModal.js";

const Register = props => {
  const [createMarktpartnerModal, setCreateMarktpartnerModal] = useState(false);
  const toggleCreateMarktpartnerModal = () =>
    setCreateMarktpartnerModal(!createMarktpartnerModal);

  const [updateCompanyNameModal, setUpdateCompanyNameModal] = useState(false);
  const toggleUpdateCompanyNameModal = () =>
    setUpdateCompanyNameModal(!updateCompanyNameModal);

  const [verifyMarktpartnerModal, setVerifyMarktpartnerModal] = useState(false);
  const toggleVerifyMarktpartnerModal = () =>
    setVerifyMarktpartnerModal(!verifyMarktpartnerModal);

  const [
    createOrUpdateContactInformationModal,
    setCreateOrUpdateContactInformationModal
  ] = useState(false);
  const toggleCreateOrUpdateContactInformationModal = () =>
    setCreateOrUpdateContactInformationModal(
      !createOrUpdateContactInformationModal
    );

  const [data, updateData] = useState();
  useEffect(() => {
    const getData = async () => {
      const marketPartners = await blockchainApi.getMarketPartners();
      updateData(marketPartners);
    };
    setInterval(() => {
      getData();
    }, 1000);
  }, []);

  const [rSelected, setRSelected] = useState(1);

  return (
    <Container>
      <Row>
        <Col xs="6" className="text-md-left">
          <h5>Kontaktdatenblatt auf der Blockchain</h5>
        </Col>
        <Col xs="3" className="text-md-left">
          <ButtonGroup>
            <Button
              color="primary"
              onClick={() => setRSelected(1)}
              active={rSelected === 1}
            >
              Alle
            </Button>
            <Button
              color="primary"
              onClick={() => setRSelected(2)}
              active={rSelected === 2}
            >
              Verifiziert
            </Button>
            <Button
              color="primary"
              onClick={() => setRSelected(3)}
              active={rSelected === 3}
            >
              Unverifiziert
            </Button>
          </ButtonGroup>
        </Col>
        <Col xs="3" className="text-md-right">
          <Button color="primary" onClick={toggleCreateMarktpartnerModal}>
            Marktpartner anlegen
          </Button>{" "}
          <CreateMarktpartnerModal
            isOpen={createMarktpartnerModal}
            toggle={toggleCreateMarktpartnerModal}
          />
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <Table>
            <thead>
              <tr>
                <th className="text-md-left">Name</th>
                <th className="text-md-center">Kontaktdaten</th>
                <th className="text-md-center">Verifiziert</th>
                <th className="text-md-right">Kontaktdaten ändern</th>
              </tr>
            </thead>
            <tbody>
              {data &&
                data
                  .filter(marketPartner =>
                    rSelected === 1
                      ? true
                      : rSelected === 2
                      ? marketPartner.verified
                      : !marketPartner.verified
                  )
                  .map(marketPartner => (
                    <tr key={marketPartner.address}>
                      <th scope="row" className="text-md-left align-middle">
                        <a
                          href={
                            blockchainApi.addressExplorerHost +
                            marketPartner.address
                          }
                          target="_blank"
                          style={{ textDecoration: "none" }}
                        >
                          {marketPartner.companyName}
                        </a>{" "}
                        <FaRegEdit
                          color="#037BFF"
                          onClick={toggleUpdateCompanyNameModal}
                        />
                        <UpdateCompanyNameModal
                          marketPartnerAddress={marketPartner.address}
                          oldCompanyName={marketPartner.companyName}
                          isOpen={updateCompanyNameModal}
                          toggle={toggleUpdateCompanyNameModal}
                        />
                      </th>
                      <td className="text-md-center align-middle">
                        <Button
                          color={marketPartner.verified ? "success" : "warning"}
                          onClick={toggleCreateOrUpdateContactInformationModal}
                        >
                          Anzeigen
                        </Button>{" "}
                      </td>
                      <td className="text-md-center align-middle">
                        {marketPartner.verified ? (
                          <FaCheckCircle color="#28a745" />
                        ) : (
                          <Button
                            color="primary"
                            onClick={toggleVerifyMarktpartnerModal}
                          >
                            Verifizieren
                          </Button>
                        )}
                        <br />
                        {marketPartner.validityEndTimestamp
                          ? "(bis: " +
                            moment
                              .unix(marketPartner.validityEndTimestamp)
                              .format("MM.DD.YYYY") +
                            ")"
                          : ""}
                        <VerifyMarktpartnerModal
                          marketPartnerAddress={marketPartner.address}
                          isOpen={verifyMarktpartnerModal}
                          toggle={toggleVerifyMarktpartnerModal}
                        />
                      </td>
                      <td className="text-md-right align-middle">
                        <Button
                          color="primary"
                          onClick={toggleCreateOrUpdateContactInformationModal}
                        >
                          Ändern
                        </Button>{" "}
                        <CreateOrUpdateContactInformationModal
                          marketPartnerAddress={marketPartner.address}
                          companyName={marketPartner.companyName}
                          headquartersAddress={
                            marketPartner.headquartersAddress
                          }
                          marketRole={marketPartner.marketRole}
                          marktpartnerId={marketPartner.marktpartnerId}
                          sector={marketPartner.sector}
                          vatId={marketPartner.vatId}
                          webAddress={marketPartner.webAddress}
                          isOpen={createOrUpdateContactInformationModal}
                          toggle={toggleCreateOrUpdateContactInformationModal}
                          readOnly={false}
                        />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          Marktpartner Register:{" "}
          <a
            href={
              blockchainApi.addressExplorerHost +
              blockchainApi.registerContractAddress
            }
            target="_blank"
          >
            Anzeigen
          </a>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
