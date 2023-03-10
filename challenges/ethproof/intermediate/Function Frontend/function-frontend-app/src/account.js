import web3 from "./web3";

const address = "0xeD962B6754D154DD30aF5c4bdc651A7c9f092c0E";

const abi = [
  {
    inputs: [],
    name: "contribute",
    outputs: [],
    stateMutability: "payable",
    type: "function",
    payable: true,
    signature: "0xd7bb99ba",
  },
  {
    inputs: [],
    name: "displayContractBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0xfaf96bbb",
  },
  {
    inputs: [],
    name: "getContributors",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0xaf157c19",
  },
];

export default new web3.eth.Contract(abi, address);
