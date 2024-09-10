// src/index.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');
const Web3 = require('web3');
require('dotenv').config();

// Initialize Pinata SDK
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY,
});

// Initialize Web3 and connect to local blockchain (Ganache)
const web3 = new Web3('http://localhost:7545');

// Smart Contract ABI and Address (replace with actual values)
const contractABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "ipfsHash",
          "type": "string"
        }
      ],
      "name": "HashStored",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "ipfsHashes",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_ipfsHash",
          "type": "string"
        }
      ],
      "name": "storeHash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getHash",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
const contractAddress = '0xA07e71aCDF98dd4ddc5C857EB81765a6e2383c91'; // Replace with your deployed contract address
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Set up Express app
const app = express();

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
}));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Route for file upload and IPFS/Blockchain integration
app.post('/upload', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const readableStreamForFile = fs.createReadStream(filePath);

  const options = {
    pinataMetadata: {
      name: req.file.originalname,
    },
    pinataOptions: {
      cidVersion: 0,
    }
  };

  try {
    // Upload file to IPFS via Pinata
    const pinataResult = await pinata.pinFileToIPFS(readableStreamForFile, options);
    console.log('Pinata upload successful:', pinataResult);

    const ipfsHash = pinataResult.IpfsHash;

    // Interact with the smart contract to store the IPFS hash
    const accounts = await web3.eth.getAccounts(); // Get available accounts
    const senderAddress = accounts[0]; // Use the first account

    // Send the transaction to store the hash on the blockchain
    await contract.methods.storeHash(ipfsHash).send({ from: senderAddress });

    res.json({
      message: 'File uploaded and IPFS hash stored on blockchain!',
      ipfsHash: ipfsHash,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'File upload or blockchain interaction failed' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
