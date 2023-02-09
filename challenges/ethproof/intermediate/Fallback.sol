//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Fallback{

    /** Fallback function*/
    fallback() external payable {

    }
}

contract Sender{
    //Tries to invoke non existent function
    function transfer(Fallback fall) public payable returns(bool) {
        (bool success,) = address(fall).call(abi.encodeWithSignature("nonExistingFunction()"));
        require (success);

        return true;
    }
}