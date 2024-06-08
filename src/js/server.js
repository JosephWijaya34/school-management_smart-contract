const ethers = require('ethers');
const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

// Koneksi ke node lokal Hardhat
const provider = new ethers.JsonRpcProvider('http://localhost:8545');

// ABI dan alamat smart contract (alamat didapatkan dari output deploy)
const contractABI = JSON.parse(fs.readFileSync('artifacts/contracts/SchoolManagement.sol/SchoolManagement.json', 'utf8')).abi;
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const contract = new ethers.Contract(contractAddress, contractABI, provider);

app.get('/', async (req, res) => {
  try {
    // const students = await contract.getMataPelajaranStudents(0);
    res.render('index', {  });
  } catch (error) {
    console.error(error);
    res.status(500).send('Terjadi kesalahan');
  }
});

app.listen(port, () => {
  console.log(`Aplikasi berjalan di http://localhost:${port}`);
});
