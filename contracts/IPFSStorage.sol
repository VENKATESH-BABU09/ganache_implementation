// contracts/IPFSStorage.sol

// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;

contract IPFSStorage {
    // Event to emit when a new IPFS hash is stored
    event HashStored(address indexed sender, string ipfsHash);

    // Mapping to store IPFS hashes based on user address
    mapping(address => string) public ipfsHashes;

    // Function to store an IPFS hash
    function storeHash(string memory _ipfsHash) public {
        ipfsHashes[msg.sender] = _ipfsHash;
        emit HashStored(msg.sender, _ipfsHash);
    }

    // Function to retrieve the IPFS hash for a user
    function getHash(address user) public view returns (string memory) {
        return ipfsHashes[user];
    }
}
