const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545')

const address = "0x.....";
const abi = ""

const contract = new web3.eth.Contract(abi,address);

/** Listening to Events */

contract.events.LogMess({}, (error, event) => {
    console.log(`LogMess: ${event.returnValues.sender} (${event.returnValues.message}) (${event.returnValues.timestamp})`)
});

contract.events.LogMessage({}, (error, event) => {
    console.log(`LogMessage: ${event.returnValues.sender} (${event.returnValues.message}) (${event.returnValues.timestamp})`)
});

contract.events.LogMessages({}, (error, event) => {
    console.log(`LogMessages: ${event.returnValues.sender} (${event.returnValues.message}) (${event.returnValues.timestamp})`)
});
