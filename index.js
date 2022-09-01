// import 'ethers' for browser  -  https://cdn.ethers.io/lib/ethers-5.2.esm.min.js
import { ethers } from "./ethers-5.6.esm.min.js"; //from online repo
import { abi, contractAddress } from "./constants.js";

//because import type="module", we are doing the connect in this module.
const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    connectButton.innerHTML = "Connected!";
  } else {
    fundButton.innerHTML = "Please install metamask.";
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function withdraw() {
  // if you run into an issue, make sure you use the deployer account in Metamask. it's the hardhat account #1.
  if (typeof window.ethereum !== "undefined") {
    console.log("Withdrawing...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      console.log("here");
      const transactionResponse = await contract.withdraw();
      console.log(" and here");
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`Funding with ${ethAmount}...`);
  if (typeof window.ethereum !== "undefined") {
    //provider /connection to the blockchain
    //signer /wallet
    //contract to interract with (^ ABI + Address)  // ABI is pulled in from backend/artifacts/contracts/FundMe/FundMe.json
    const provider = new ethers.providers.Web3Provider(window.ethereum); // metask is also itself a provide, a connection point.
    const signer = provider.getSigner(); // eg. Acct#1 or 2 on Metamask
    console.log(signer);
    const contract = new ethers.Contract(contractAddress, abi, signer); // run `backend yarn hardhat node` for localnode, and get address of deployment 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
    try {
      const transactionResponse = await contract.fund({
        // catches conditions for rejected funds
        value: ethers.utils.parseEther(ethAmount),
      });
      //listen for the tx to be mined
      // listen for an event <- we haven't learned about it yet!
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done !");
    } catch (error) {
      console.log(error);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  // return new Promise()
  //listen for thsi transaction to finish
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}
