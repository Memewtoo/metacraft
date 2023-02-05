
// SPDX-License-Identifier: MIT
// compiler version must be greater than or equal to 0.8.17 and less than 0.9.0
pragma solidity ^0.8.17;

contract HelloWorld {
    string public_greet;

    modifier restricted(){
        require(msg.sender == "admin");
        _;
    }

    constructor (){
        public_greet = "Hello World";
    }

    function greet() public restricted view returns (string){
        return public_greet;
    }
}
