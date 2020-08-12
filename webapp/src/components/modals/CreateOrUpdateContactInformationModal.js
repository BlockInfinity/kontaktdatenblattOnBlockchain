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
    props.marketPartner.headquartersAddress
  );
  const [marketRole, setMarketRole] = useState(props.marketPartner.marketRole);
  const [marktpartnerId, setMarktpartnerId] = useState(
    props.marketPartner.marktpartnerId
  );
  const [sector, setSector] = useState(props.marketPartner.sector);
  const [vatId, setVatId] = useState(props.marketPartner.vatId);
  const [webAddress, setWebAddress] = useState(props.marketPartner.webAddress);

  const [readOnly, setReadOnly] = useState(props.readOnly);

  const [response, setResponse] = useState("");

  const onClosed = () => {
    setCreateOrUpdateContactInformationStep(0);
    setHeadquartersAddress(props.marketPartner.headquartersAddress);
    setMarketRole(props.marketPartner.marketRole);
    setMarktpartnerId(props.marketPartner.marktpartnerId);
    setSector(props.marketPartner.sector);
    setVatId(props.marketPartner.vatId);
    setWebAddress(props.marketPartner.webAddress);
    setResponse("");
  };

  return (
    <Modal isOpen={props.isOpen} toggle={props.toggle} onClosed={onClosed}>
      <ModalHeader toggle={props.toggle}>
        Kontaktinformationen {readOnly ? "ansehen" : "ändern"}
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
                value={props.marketPartner.companyName}
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
                  readOnly && !headquartersAddress
                    ? "keine Angabe"
                    : headquartersAddress
                }
                disabled={readOnly}
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
                value={readOnly && !marketRole ? "keine Angabe" : marketRole}
                disabled={readOnly}
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
                  readOnly && !marktpartnerId ? "keine Angabe" : marktpartnerId
                }
                disabled={readOnly}
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
                value={readOnly && !sector ? "keine Angabe" : sector}
                disabled={readOnly}
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
                value={readOnly && !vatId ? "keine Angabe" : vatId}
                disabled={readOnly}
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
                value={readOnly && !webAddress ? "keine Angabe" : webAddress}
                disabled={readOnly}
                onChange={name => setWebAddress(name.target.value)}
              />
            </FormGroup>
          </Form>
        )}
        {!readOnly && createOrUpdateContactInformationStep === 1 && (
          <div style={{ textAlign: "center" }}>
            <HashLoader
              color={"#037BFF"}
              css="display:block;margin-left:auto;margin-right:auto;margin-top:25px;margin-bottom:25px;"
            />
            <div>Wird ausgeführt. Bitte warten...</div>
            <div>(Bitte Transaktion in MetaMask bestätigen)</div>
          </div>
        )}
        {!readOnly && createOrUpdateContactInformationStep === 2 && (
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
        {!readOnly && createOrUpdateContactInformationStep === 3 && (
          <div style={{ textAlign: "center" }}>
            <FaExclamationCircle color="#e0a800" size="50px" />
            <div style={{ marginTop: "20px" }}>{response}</div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        {readOnly && (
          <Button color="primary" onClick={props.toggle}>
            Schließen
          </Button>
        )}
        {!readOnly && createOrUpdateContactInformationStep === 0 && (
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
                    props.marketPartner.address,
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
        {!readOnly && createOrUpdateContactInformationStep === 1 && (
          <Button color="primary" onClick={props.toggle}>
            Schließen
          </Button>
        )}
        {!readOnly && createOrUpdateContactInformationStep === 2 && (
          <Button color="primary" onClick={props.toggle}>
            Schließen
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default CreateOrUpdateContactInformationModal;
