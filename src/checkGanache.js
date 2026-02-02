const { ethers } = require("ethers");

// Connect to Ganache
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");

async function checkGanache() {
  try {
    // Get network info (chainId)
    const network = await provider.getNetwork();
    console.log("Chain ID:", network.chainId);
    console.log("Network name:", network.name);

    // Get first account
    const accounts = await provider.listAccounts();
    if (accounts.length === 0) {
      console.log("No accounts found in Ganache.");
      return;
    }
    const firstAccount = accounts[0];
    console.log("First account:", firstAccount);

    // Get balance of first account
    const balanceWei = await provider.getBalance(firstAccount);
    const balanceEth = ethers.utils.formatEther(balanceWei); // v5 uses ethers.utils.formatEther
    console.log("Balance (ETH):", balanceEth);
  } catch (err) {
    console.error("Error:", err);
  }
}

checkGanache();
