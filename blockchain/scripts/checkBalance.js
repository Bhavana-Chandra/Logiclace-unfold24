// scripts/checkBalance.js
async function main() {
    const { ethers } = require("hardhat");
  
    const accountAddress = "YOUR_ACCOUNT_ADDRESS"; // Replace with the account address you want to check
    const provider = new ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY"); // Use your Infura API key
  
    const balance = await provider.getBalance(accountAddress);
    console.log(`Balance of ${accountAddress}:`, ethers.utils.formatEther(balance), "ETH");
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  