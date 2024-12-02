async function interactWithContract() {
    const [sender] = await ethers.getSigners();
    const contractAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with the actual deployed contract address
    const contract = await ethers.getContractAt("MyContract", contractAddress);
    
    // Call a function on the contract (replace with actual function name)
    const tx = await contract.someFunction();  // Replace with your contract's function
    await tx.wait();  // Wait for the transaction to be mined
    
    console.log("Transaction successful!");
  }
  
  // Call the interaction function and handle errors
  interactWithContract().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  