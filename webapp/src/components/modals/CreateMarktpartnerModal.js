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

const CreateMarktpartnerModal = props => {
  const [createMarktpartnerStep, setCreateMarktpartnerStep] = useState(0);

  const [companyName, setCompanyName] = useState("");

  const [response, setResponse] = useState("");

  const onClosed = () => {
    setCreateMarktpartnerStep(0);
    setCompanyName("");
    setResponse("");
  };

  return (
    <Modal isOpen={props.isOpen} toggle={props.toggle} onClosed={onClosed}>
      <ModalHeader toggle={props.toggle}>Marktpartner anlegen</ModalHeader>
      <ModalBody>
        {createMarktpartnerStep === 0 && (
          <div>
            <p>
              <b>Allgemeine Informationen</b>
            </p>
            <p>Das Anlegen eines Marktpartner besteht aus 2 Schritten:</p>
            <p>1.) Anlegen einer Marktpartner Identität. (Schritt 1)</p>
            <p>
              2.) Verifizieren der Marktpartner Identität mit einem von der
              "T-Systems-EnergyCA.CA" Zertifikate-Authorität ausgestellten
              Zertifikat. (Schritt 2)
            </p>
            <p>
              <b>Voraussetzungen Schritt 1:</b>
            </p>
            <p>
              Bitte stellen Sie sicher, das Metamask in Ihrem Browser korrekt
              installiert, mit dem gewünschten Netzwerk verbunden und Ihr
              Account über ausreichend Guthaben verfügt.
            </p>
            <p>
              <b>Weiterer Ablauf:</b>
            </p>
            <p>
              Bitte geben Sie Ihren Organisationsnamen ein. Nach betätigen des
              Buttons "Marktpartner Anlegen" öffnet sich Metamask und fordert
              Sie auf, die Transaktion zum Anlegen der Marktpartner Identität
              digital zu signieren. Der zum signieren ausgewählte Account ist
              der Eigentümer der Marktpartner Identität und muss für
              nachfolgende Aktionen verwendet werden. Nach dem Anlegen der
              Identität werden Ihnen die Informationen angezeigt, die im
              Zertifikat enthalten sein müssen. Leiten Sie diese bitte an den
              Zertifikat-Aussteller weiter. Sobald Sie Ihr Zertifikat erhalten
              haben, können Sie Ihre Identität verifizieren.
            </p>
            <Form>
              <FormGroup>
                <Label for="companyName">Ihr Organisationsname</Label>
                <Input
                  type="text"
                  name="companyName"
                  id="companyName"
                  placeholder="Ihr Organisationsname"
                  value={companyName}
                  onChange={name => setCompanyName(name.target.value)}
                />
              </FormGroup>
            </Form>
          </div>
        )}
        {createMarktpartnerStep === 1 && (
          <div style={{ textAlign: "center" }}>
            <HashLoader
              color={"#037BFF"}
              css="display:block;margin-left:auto;margin-right:auto;margin-top:25px;margin-bottom:25px;"
            />
            <div>Wird ausgeführt. Bitte warten...</div>
            <div>(Bitte Transaktion in MetaMask bestätigen)</div>
          </div>
        )}
        {createMarktpartnerStep === 2 && (
          <div style={{ textAlign: "center" }}>
            <FaCheckCircle color="#28a745" size="50px" />
            <div style={{ marginTop: "20px" }}>
              <a
                href={
                  blockchainApi.addressExplorerHost +
                  response.logs[0].data
                    .replace("0x000000000000000000000000", "0x")
                    .substring(0, 42)
                }
                target="_blank"
              >
                Marktpartner Identität anzeigen
              </a>
            </div>
            <div style={{ marginTop: "20px" }}>
              Bitte beantragen Sie ein Zertifikat bei Ihrer Zertifikat Autorität
              (aktuell nur "T-Systems-EnergyCA.CA" unterstützt) mit folgenden
              Inhalten:
            </div>
            <div style={{ marginTop: "20px" }}>
              <Form>
                <FormGroup>
                  <Label for="companyName">Subject - Organisationsname</Label>
                  <Input
                    type="text"
                    disabled={true}
                    name="companyName"
                    id="companyName"
                    value={companyName}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="relativeDistinguishedName">
                    RelativeDistinguishedName (
                    <a
                      href="https://tools.ietf.org/html/rfc5280#section-4.1.2.4"
                      target="_blank"
                    >
                      RFC5280
                    </a>
                    )
                  </Label>
                  <Input
                    type="text"
                    disabled={true}
                    name="marketPartnerAddress"
                    id="marketPartnerAddress"
                    value={response.logs[0].data
                      .replace("0x000000000000000000000000", "0x")
                      .substring(0, 42)}
                  />
                </FormGroup>
              </Form>
            </div>
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
        {createMarktpartnerStep === 3 && (
          <div style={{ textAlign: "center" }}>
            <FaExclamationCircle color="#e0a800" size="50px" />
            <div style={{ marginTop: "20px" }}>{response}</div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        {createMarktpartnerStep === 0 && (
          <div>
            <Button color="primary" onClick={props.toggle}>
              Abbrechen
            </Button>{" "}
            <Button
              color="secondary"
              onClick={async () => {
                if (!companyName || companyName.length < 1) {
                  alert("Organisationsname muss mindestens 1 Zeichen haben.");
                  return;
                }
                try {
                  setCreateMarktpartnerStep(1);
                  let receipt = await blockchainApi.createMarketPartnerContract(
                    companyName
                  );
                  console.log(receipt);
                  if (receipt.status) {
                    setResponse(receipt);
                    setCreateMarktpartnerStep(2);
                  } else {
                    setResponse("Es ist ein Fehler aufgetreten.");
                    setCreateMarktpartnerStep(3);
                  }
                } catch (e) {
                  setResponse(e.message);
                  setCreateMarktpartnerStep(3);
                }
              }}
            >
              Marktpartner Anlegen
            </Button>
          </div>
        )}
        {createMarktpartnerStep === 1 && (
          <Button color="primary" onClick={props.toggle}>
            Schließen
          </Button>
        )}
        {createMarktpartnerStep === 2 && (
          <Button color="primary" onClick={props.toggle}>
            Schließen
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default CreateMarktpartnerModal;
