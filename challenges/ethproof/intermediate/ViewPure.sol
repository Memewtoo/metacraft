//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ViewPure{
    uint x = 5;

    /** View function — does not modify state variables*/
    function addNum(uint y) public view returns(uint){
        return x + y;
    }

    /** Pure functio — does not read/write from the state variables */
    function mulNum(uint a, uint b) public pure returns(uint){
        return a * b;
    }
}