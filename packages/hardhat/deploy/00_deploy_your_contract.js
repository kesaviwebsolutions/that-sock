const { ethers } = require("hardhat");

const localChainId = "5";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  // deploy Patterns
  await deploy("PondNFTs", {
    from: deployer,
    log: true,
    waitConfirmations: 5,
  });

  const PondNFT = await ethers.getContract("PondNFTs", deployer);

  try {
    if (chainId !== localChainId) {
      await run("verify:verify", {
        address: PondNFT.address,
        contractArguments: [],
      });
    }
  } catch (err) {
    if (err.message.includes("Reason: Already Verified")) {
      console.log("Contract is already verified!");
    }
  }
};
module.exports.tags = [
  // "SockPinLibrary",
  // "Eye",
  "PondNFTs",
];
