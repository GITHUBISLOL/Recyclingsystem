const RecyclingContract = artifacts.require("RecyclingContract");

module.exports = function (deployer) {
    deployer.deploy(RecyclingContract);
};

