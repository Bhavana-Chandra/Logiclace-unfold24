require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

console.log("Using Infura API Key: ", process.env.INFURA_API_KEY);
console.log("Using Private Key: ", process.env.DEPLOYER_PRIVATE_KEY ? "Yes" : "No");

module.exports = {
  solidity: {
    version: "0.8.27", // Match the version with the contracts you're using
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    base_sepolia: {
      url: `https://base-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`, // Replace with Base Sepolia RPC URL
      accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
    },
  },
};
