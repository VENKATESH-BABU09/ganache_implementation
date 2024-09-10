// migrations/1_deploy_contracts.js
const IPFSStorage = artifacts.require("IPFSStorage");

module.exports = function (deployer) {
  deployer.deploy(IPFSStorage);
};
