"use strict";

import React, { useState, useEffect } from "react";

import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input
} from "reactstrap";

import HashLoader from "react-spinners/HashLoader";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const blockchainApi = require("../../apis/blockchainApi.js");

const CreateOrUpdateContactInformationModal = props => {
  const [
    createOrUpdateContactInformationStep,
    setCreateOrUpdateContactInformationStep
  ] = useState(0);

  const [headquartersAddress, setHeadquartersAddress] = useState(
    props.headquartersAddress
  );
  const [marketRole, setMarketRole] = useState(props.marketRole);
  const [marktpartnerId, setMarktpartnerId] = useState(props.marktpartnerId);
  const [sector, setSector] = useState(props.sector);
  const [vatId, setVatId] = useState(props.vatId);
  const [webAddress, setWebAddress] = useState(props.webAddress);

  const [response, setResponse] = useState("");

  const onClosed = () => {
    setCreateOrUpdateContactInformationStep(0);
    setHeadquartersAddress(props.headquartersAddress);
    setMarketRole(props.marketRole);
    setMarktpartnerId(props.marktpartnerId);
    setSector(props.sector);
    setVatId(props.vatId);
    setWebAddress(props.webAddress);
    setResponse("");
  };

  return (
    <Modal isOpen={props.isOpen} toggle={props.toggle} onClosed={onClosed}>
      <ModalHeader toggle={props.toggle}>
        Kontaktinformationen {props.readOnly ? "ansehen" : "ändern"}
      </ModalHeader>
      <ModalBody>
        {createOrUpdateContactInformationStep === 0 && (
          <Form>
            <FormGroup>
              <Label for="companyName">Organisationsname</Label>
              <Input
                type="text"
                name="companyName"
                id="companyName"
                value={props.companyName}
                disabled={true}
              />
            </FormGroup>
            <FormGroup>
              <Label for="headquartersAddress">Adresse</Label>
              <Input
                type="text"
                name="headquartersAddress"
                id="headquartersAddress"
                placeholder="Adresse"
                value={
                  props.readOnly && !props.headquartersAddress
                    ? "keine Angabe"
                    : headquartersAddress
                }
                disabled={props.readOnly}
                onChange={name => setHeadquartersAddress(name.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label for="marketRole">Marktrolle</Label>
              <Input
                type="text"
                name="marketRole"
                id="marketRole"
                placeholder="Marktrolle"
                value={
                  props.readOnly && !props.marketRole
                    ? "keine Angabe"
                    : marketRole
                }
                disabled={props.readOnly}
                onChange={name => setMarketRole(name.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label for="marktpartnerId">Marktpartner ID</Label>
              <Input
                type="text"
                name="marktpartnerId"
                id="marktpartnerId"
                placeholder="Marktpartner ID"
                value={
                  props.readOnly && !props.marktpartnerId
                    ? "keine Angabe"
                    : marktpartnerId
                }
                disabled={props.readOnly}
                onChange={name => setMarktpartnerId(name.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label for="sector">Sektor</Label>
              <Input
                type="text"
                name="sector"
                id="sector"
                placeholder="Sektor"
                value={
                  props.readOnly && !props.sector ? "keine Angabe" : sector
                }
                disabled={props.readOnly}
                onChange={name => setSector(name.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label for="vatId">Vat ID</Label>
              <Input
                type="text"
                name="vatId"
                id="vatId"
                placeholder="Vat ID"
                value={props.readOnly && !props.vatId ? "keine Angabe" : vatId}
                disabled={props.readOnly}
                onChange={name => setVatId(name.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label for="webAddress">Web-Adresse</Label>
              <Input
                type="text"
                name="webAddress"
                id="webAddress"
                placeholder="Web-Adresse"
                value={
                  props.readOnly && !props.webAddress
                    ? "keine Angabe"
                    : webAddress
                }
                disabled={props.readOnly}
                onChange={name => setWebAddress(name.target.value)}
              />
            </FormGroup>
          </Form>
        )}
        {!props.readOnly && createOrUpdateContactInformationStep === 1 && (
          <div style={{ textAlign: "center" }}>
            <HashLoader
              color={"#037BFF"}
              css="display:block;margin-left:auto;margin-right:auto;margin-top:25px;margin-bottom:25px;"
            />
            <div>Wird ausgeführt. Bitte warten...</div>
            <div>(Bitte Transaktion in MetaMask bestätigen)</div>
          </div>
        )}
        {!props.readOnly && createOrUpdateContactInformationStep === 2 && (
          <div style={{ textAlign: "center" }}>
            <FaCheckCircle color="#28a745" size="50px" />
            <div style={{ marginTop: "20px" }}>
              <a
                href={blockchainApi.txExplorerHost + response.transactionHash}
                target="_blank"
              >
                Zeige Transaktions Status
              </a>
            </div>
          </div>
        )}
        {!props.readOnly && createOrUpdateContactInformationStep === 3 && (
          <div style={{ textAlign: "center" }}>
            <FaExclamationCircle color="#e0a800" size="50px" />
            <div style={{ marginTop: "20px" }}>{response}</div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        {props.readOnly && (
          <Button color="primary" onClick={props.toggle}>
            Schließen
          </Button>
        )}
        {!props.readOnly && createOrUpdateContactInformationStep === 0 && (
          <div>
            <Button color="primary" onClick={props.toggle}>
              Abbrechen
            </Button>{" "}
            <Button
              color="secondary"
              onClick={async () => {
                try {
                  setCreateOrUpdateContactInformationStep(1);
                  let receipt = await blockchainApi.updateContactInformation(
                    props.marketPartnerAddress,
                    headquartersAddress,
                    marketRole,
                    marktpartnerId,
                    sector,
                    vatId,
                    webAddress
                  );
                  if (receipt.status) {
                    setResponse(receipt);
                    setCreateOrUpdateContactInformationStep(2);
                  } else {
                    setResponse("Es ist ein Fehler aufgetreten.");
                    setCreateOrUpdateContactInformationStep(3);
                  }
                } catch (e) {
                  setResponse(e.message);
                  setCreateOrUpdateContactInformationStep(3);
                }
              }}
            >
              Kontaktinformationen ändern
            </Button>
          </div>
        )}
        {!props.readOnly && createOrUpdateContactInformationStep === 1 && (
          <Button color="primary" onClick={props.toggle}>
            Schließen
          </Button>
        )}
        {!props.readOnly && createOrUpdateContactInformationStep === 2 && (
          <Button color="primary" onClick={props.toggle}>
            Schließen
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default CreateOrUpdateContactInformationModal;
