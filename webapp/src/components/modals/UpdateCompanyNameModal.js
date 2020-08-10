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

const UpdateCompanyNameModal = props => {
  const [updateCompanyNameStep, setUpdateCompanyNameStep] = useState(0);

  const [newCompanyName, setNewCompanyName] = useState(props.oldCompanyName);

  const [response, setResponse] = useState("");

  const onClosed = () => {
    setUpdateCompanyNameStep(0);
    setNewCompanyName(props.oldCompanyName);
    setResponse("");
  };

  return (
    <Modal isOpen={props.isOpen} toggle={props.toggle} onClosed={onClosed}>
      <ModalHeader toggle={props.toggle}>Organisationsname ändern</ModalHeader>
      <ModalBody>
        {updateCompanyNameStep === 0 && (
          <Form>
            <FormGroup>
              <Label for="oldCompanyName">Aktueller Organisationsname</Label>
              <Input
                type="text"
                name="oldCompanyName"
                id="oldCompanyName"
                value={props.oldCompanyName}
                disabled={true}
              />
            </FormGroup>
            <FormGroup>
              <Label for="companyName">
                Neuer Organisationsname (mind. 3 Zeichen)
              </Label>
              <Input
                type="text"
                name="newCompanyName"
                id="newCompanyName"
                placeholder="Ihr Organisationsname"
                value={newCompanyName}
                onChange={name => setNewCompanyName(name.target.value)}
              />
            </FormGroup>
          </Form>
        )}
        {updateCompanyNameStep === 1 && (
          <div style={{ textAlign: "center" }}>
            <HashLoader
              color={"#037BFF"}
              css="display:block;margin-left:auto;margin-right:auto;margin-top:25px;margin-bottom:25px;"
            />
            <div>Wird ausgeführt. Bitte warten...</div>
            <div>(Bitte Transaktion in MetaMask bestätigen)</div>
          </div>
        )}
        {updateCompanyNameStep === 2 && (
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
        {updateCompanyNameStep === 3 && (
          <div style={{ textAlign: "center" }}>
            <FaExclamationCircle color="#e0a800" size="50px" />
            <div style={{ marginTop: "20px" }}>{response}</div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        {updateCompanyNameStep === 0 && (
          <div>
            <Button color="primary" onClick={props.toggle}>
              Abbrechen
            </Button>{" "}
            <Button
              color="secondary"
              onClick={async () => {
                if (!newCompanyName || newCompanyName.length < 3) {
                  alert("Organsationsname muss mindestens 3 Zeichen haben.");
                  return;
                }
                if (props.oldCompanyName === newCompanyName) {
                  alert(
                    "Neuer Organisationsname entspricht dem bisherigen Organisationsnamen."
                  );
                  return;
                }
                try {
                  setUpdateCompanyNameStep(1);
                  let receipt = await blockchainApi.updateCompanyName(
                    props.marketPartnerAddress,
                    props.oldCompanyName,
                    newCompanyName
                  );
                  if (receipt.status) {
                    setResponse(receipt);
                    setUpdateCompanyNameStep(2);
                  } else {
                    setResponse("Es ist ein Fehler aufgetreten.");
                    setUpdateCompanyNameStep(3);
                  }
                } catch (e) {
                  setResponse(e.message);
                  setUpdateCompanyNameStep(3);
                }
              }}
            >
              Name ändern
            </Button>
          </div>
        )}
        {updateCompanyNameStep === 1 && (
          <Button color="primary" onClick={props.toggle}>
            Schließen
          </Button>
        )}
        {updateCompanyNameStep === 2 && (
          <Button color="primary" onClick={props.toggle}>
            Schließen
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default UpdateCompanyNameModal;
