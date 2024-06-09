const path = require("path");
// import path from 'path';

async function main() {


    if (network.name === "hardhat") {
      console.warn(
        "You are trying to deploy a contract to the Hardhat Network, which" +
          "gets automatically created and destroyed every time. Use the Hardhat" +
          " option '--network localhost'"
      );
    }
  
    // ethers is available in the global scope
    const [deployer] = await ethers.getSigners();
    console.log(
      "Deploying the contracts with the account:",
      await deployer.getAddress()
    );
  
    const SchoolManagement = await ethers.getContractFactory("SchoolManagement");
    const schoolManagement = await SchoolManagement.deploy();

    //console.log(JSON.stringify(voting));
    //console.log(voting.target);
  
    console.log("Voting smart contract address:", schoolManagement.target);
  
    // We also save the contract's artifacts and address in the frontend directory
    saveFrontendFiles(schoolManagement);
  }

  function saveFrontendFiles(param) {
    const fs = require("fs");
    const contractsDir = path.join(__dirname, "..", "src", "contracts");
  
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir);
    }
  
    fs.writeFileSync(
      path.join(contractsDir, "contract-address.json"),
      JSON.stringify({ SchoolManagement: param.target }, undefined, 2)
    );
  
    const SchoolManagementArtifact = artifacts.readArtifactSync("SchoolManagement");
  
    fs.writeFileSync(
      path.join(contractsDir, "SchoolManagementArtifact.json"),
      JSON.stringify(SchoolManagementArtifact, null, 2)
    );
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
  