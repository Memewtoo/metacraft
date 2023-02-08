const path = require('path');
const fs = require('fs');
const solc = require('solc');

const accountPath = path.resolve(__dirname, "Account.sol");
const source = fs.readFileSync(accountPath, 'utf8');

const input = {
  language: "Solidity",
  sources: {
    "Account.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

module.exports = JSON.parse(solc.compile(JSON.stringify(input))).contracts["Account.sol"].Account;