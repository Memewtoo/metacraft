//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Upgradeable{

    address sender;
    uint value;
    uint timestamp;

    function setVariables() public payable{
        sender = msg.sender;
        value = msg.value;
        timestamp = block.timestamp;
    }
}

contract Proxy{

    address sender;
    uint value;
    uint timestamp;

    function setVariables(address _contract, uint _num) public payable {
        (bool flag, bytes memory data) = _contract.delegatecall(
            abi.encodeWithSignature("setVariables()", _num));
    }
}