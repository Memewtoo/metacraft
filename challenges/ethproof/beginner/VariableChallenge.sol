//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Variables {
    /** State Variable */
    uint num;

    /** Getter and Setter for State Variable*/
    function getNum() public view returns(uint){
        return num;
    }

    function setNum(uint n) public{
        num = n;
    }

    /** 
    Local Variable as well as the
    Getter and Setter method for Local variable
    */

    function setStr(string memory message) public pure returns(string memory){
         return message;
    }

    /** Getting the value of a global variable */
    function getTimestamp() public view returns(uint){
        return block.timestamp;
    }
}