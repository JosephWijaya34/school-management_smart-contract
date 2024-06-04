// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";
//import fs from 'node:fs';

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import VotingArtifact from "../contracts/SchoolManagement.json" with { type: "json"};
import contractAddress from "../contracts/contract-address.json" with { type: "json"};

//to do
//ganti connect ke Metamask!
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

/*export function readFile({path}) {
    let data = fs.readFileSync(path, 'utf8');
    return JSON.parse(data);
}*/

export async function constructSmartContract() {
    return (new ethers.Contract(ethers.getAddress(contractAddress.Voting), VotingArtifact.abi, await provider.getSigner(0)));
}

/*export function getAddress() {
    console.log(contractAddress);
    //let obj = fs.readFile(contractAddress);
    return (ethers.utils.getAddress(obj.address));
}

export function getContractABI() {
    let obj = fs.readFile(VotingArtifact);
    return (obj.abi);
}*/

/*
var self = module.exports = {
    readFile: function (path) {
        let data = fs.readFileSync(path, 'utf8');
        return JSON.parse(data);
    },
    
    constructSmartContract: function (address, abi) {
        //return new web3.eth.Contract(abi, address);
        return new ethers.Contract(address, abi, provider.getSigner(0));
    },

    getContractAddress: function () {
        let obj = self.readFile(contractAddress);
        return ethers.utils.getAddress(obj.address);
    },
    getContractABI: function () {
        let obj = self.readFile(VotingArtifact);
        return obj.abi;
    }
}*/