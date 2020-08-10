"use strict";

const promiseTimout = require("promise-timeout");
const registerContract = require(`../../contracts/register.json`);
const marktpartnerContract = require(`../../contracts/marktpartner.json`);

var web3;

// config

export const registerContractAddress =
  "0x04bc977A8918114Edd48fFbb8192c1A65B227912";
export const txExplorerHost = "https://rinkeby.etherscan.io/tx/";
export const addressExplorerHost = "https://rinkeby.etherscan.io/address/";

export async function createMarketPartnerContract(companyName) {
  await checkMetamaskConnection();

  const RegisterContractInstance = new web3.eth.Contract(
    registerContract.abi,
    registerContractAddress
  );

  const encoded = await RegisterContractInstance.methods
    .createMarktpartner(companyName)
    .encodeABI();

  const rawTransaction = {
    from: window.ethereum.selectedAddress,
    to: RegisterContractInstance.options.address,
    data: encoded,
    gas: 3000000
  };

  return await web3.eth.sendTransaction(rawTransaction);
}

export async function getMarketPartners() {
  await checkMetamaskConnection();

  const RegisterContractInstance = new web3.eth.Contract(
    registerContract.abi,
    registerContractAddress
  );

  let marktpartnerCreatedAddresses = await RegisterContractInstance.methods
    .getMarktpartnerCreatedAddresses()
    .call();

  return await Promise.all(
    marktpartnerCreatedAddresses.map(async marktpartnerCreatedAddress => {
      let MarketpartnerContractInstance = new web3.eth.Contract(
        marktpartnerContract.abi,
        marktpartnerCreatedAddress
      );

      let contactInformation = await MarketpartnerContractInstance.methods
        .getContactInformation()
        .call();

      let verified = await MarketpartnerContractInstance.methods
        .verified()
        .call();

      let validityEndTimestamp = await MarketpartnerContractInstance.methods
        .validityEndTimestamp()
        .call();

      return {
        address: marktpartnerCreatedAddress,
        verified: verified,
        validityEndTimestamp: parseInt(validityEndTimestamp),
        companyName: contactInformation.__companyName,
        headquartersAddress: contactInformation.__headquartersAddress,
        marketRole: contactInformation.__marketRole,
        marktpartnerId: contactInformation.__marktpartnerId,
        sector: contactInformation.__sector,
        vatId: contactInformation.__vatId,
        webAddress: contactInformation.__webAddress
      };
    })
  );
}

export async function updateCompanyName(
  marketPartnerAddress,
  oldCompanyName,
  newCompanyName
) {
  await checkMetamaskConnection();

  const RegisterContractInstance = new web3.eth.Contract(
    registerContract.abi,
    registerContractAddress
  );

  const encoded = await RegisterContractInstance.methods
    .setCompanyName(marketPartnerAddress, oldCompanyName, newCompanyName)
    .encodeABI();

  const rawTransaction = {
    from: window.ethereum.selectedAddress,
    to: RegisterContractInstance.options.address,
    data: encoded,
    gas: 1000000
  };

  return await web3.eth.sendTransaction(rawTransaction);
}

export async function verifyCompanyName(marketPartnerAddress, certificate) {
  await checkMetamaskConnection();

  const RegisterContractInstance = new web3.eth.Contract(
    registerContract.abi,
    registerContractAddress
  );

  const encoded = await RegisterContractInstance.methods
    .verifyAndRegisterMarktpartner(
      marketPartnerAddress,
      web3.utils.asciiToHex(window.atob(certificate))
    )
    .encodeABI();

  const rawTransaction = {
    from: window.ethereum.selectedAddress,
    to: RegisterContractInstance.options.address,
    data: encoded,
    gas: 30000000
  };

  return await web3.eth.sendTransaction(rawTransaction);
}

export async function updateContactInformation(
  marketPartnerAddress,
  headquartersAddress,
  marketRole,
  marktpartnerId,
  sector,
  vatId,
  webAddress
) {
  await checkMetamaskConnection();

  const MarktPartnerContractInstance = new web3.eth.Contract(
    marktpartnerContract.abi,
    marketPartnerAddress
  );

  const encoded = await MarktPartnerContractInstance.methods
    .setContactInformation(
      headquartersAddress,
      webAddress,
      vatId,
      marktpartnerId,
      sector,
      marketRole
    )
    .encodeABI();

  const rawTransaction = {
    from: window.ethereum.selectedAddress,
    to: MarktPartnerContractInstance.options.address,
    data: encoded,
    gas: 1000000
  };

  return await web3.eth.sendTransaction(rawTransaction);
}

// ########################################################################################################################################################
// ###################################### HELPER FUNCTIONS ################################################################################################
// ########################################################################################################################################################

async function checkMetamaskConnection() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    window.ethereum.request({ method: "eth_requestAccounts" });
  } else {
    throw new Error("Not connected to Metamask");
  }
}
