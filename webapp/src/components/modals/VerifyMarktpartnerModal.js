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

const VerifyMarktpartnerModal = props => {
  const [verifyMarktpartnerStep, setVerifyMarktpartnerStep] = useState(0);

  const [certificate, setCertificate] = useState("");

  const [response, setResponse] = useState("");

  const onClosed = () => {
    setVerifyMarktpartnerStep(0);
    setCertificate("");
    setResponse("");
  };

  return (
    <Modal isOpen={props.isOpen} toggle={props.toggle} onClosed={onClosed}>
      <ModalHeader toggle={props.toggle}>Marktpartner verifizieren</ModalHeader>
      <ModalBody>
        {verifyMarktpartnerStep === 0 && (
          <div>
            <Form>
              <FormGroup>
                <Label for="certificate">Zertifikat</Label>
                <Input
                  type="textarea"
                  name="certificate"
                  id="certificate"
                  placeholder="Zertifikat"
                  rows="16"
                  value={certificate}
                  onChange={certificate =>
                    setCertificate(certificate.target.value)
                  }
                />
              </FormGroup>
            </Form>
            <div>
              Hinweis:
              <ul>
                <li>Nur 1 Zeile, ohne "-----BEGIN CERTIFICATE-----" Wrapper</li>
                <li>Aktuell werden nur "ECDSA mit SHA256" unterstützt</li>
                <li>Zertifikate müssen Base64-kodiert und vom Issuer</li>
                <li>"T-Systems-EnergyCA.CA" ausgestellt worden sein</li>
              </ul>
            </div>
          </div>
        )}
        {verifyMarktpartnerStep === 1 && (
          <div style={{ textAlign: "center" }}>
            <HashLoader
              color={"#037BFF"}
              css="display:block;margin-left:auto;margin-right:auto;margin-top:25px;margin-bottom:25px;"
            />
            <div>Wird ausgeführt. Bitte warten...</div>
            <div>(Bitte Transaktion in MetaMask bestätigen)</div>
          </div>
        )}
        {verifyMarktpartnerStep === 2 && (
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
        {verifyMarktpartnerStep === 3 && (
          <div style={{ textAlign: "center" }}>
            <FaExclamationCircle color="#e0a800" size="50px" />
            <div style={{ marginTop: "20px" }}>{response}</div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        {verifyMarktpartnerStep === 0 && (
          <div>
            <Button color="primary" onClick={props.toggle}>
              Abbrechen
            </Button>{" "}
            <Button
              color="secondary"
              onClick={async () => {
                if (!certificate || certificate.length === 0) {
                  alert("Zertifikat nicht angegeben.");
                  return;
                }
                try {
                  setVerifyMarktpartnerStep(1);
                  let receipt = await blockchainApi.verifyCompanyName(
                    props.marketPartnerAddress,
                    certificate
                  );
                  if (receipt.status) {
                    setResponse(receipt);
                    setVerifyMarktpartnerStep(2);
                  } else {
                    setResponse("Es ist ein Fehler aufgetreten.");
                    setVerifyMarktpartnerStep(3);
                  }
                } catch (e) {
                  setResponse(e.message);
                  setVerifyMarktpartnerStep(3);
                }
              }}
            >
              Verifizieren
            </Button>
          </div>
        )}
        {verifyMarktpartnerStep === 1 && (
          <Button color="primary" onClick={props.toggle}>
            Schließen
          </Button>
        )}
        {verifyMarktpartnerStep === 2 && (
          <Button color="primary" onClick={props.toggle}>
            Schließen
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default VerifyMarktpartnerModal;
