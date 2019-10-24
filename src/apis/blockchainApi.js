"use strict";

exports.getAccounts = async function() {
  if (typeof window.ethereum !== "undefined") {
    await ethereum.enable();
    web3 = new Web3(web3.currentProvider);
  } else {
    throw new Error("Not connected to Metamask");
  }

  return {
    accounts: ethereum.selectedAddress
  };
};
