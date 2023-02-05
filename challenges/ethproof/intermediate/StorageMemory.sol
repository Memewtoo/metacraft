//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StorageMemory {
    /** Storage variables */
    uint num1; 
    uint num2;
    bytes message;


    function getSum() public view returns(uint){
        return num1 + num2;
    }

    /** Function that utilizes memory stored variables*/
    function getMessage (bytes memory _message) public returns(bytes memory){
        message = _message;
        return message;
    }

}