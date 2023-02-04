// SPDX-License-Identifier: MIT
// compiler version must be greater than or equal to 0.8.17 and less than 0.9.0
pragma solidity ^0.8.17;

contract FunctionChallenge {
    uint public minContribution;

    /** Instatantiate the minimum contribution upon creating an instance */
    constructor(uint num){
        minContribution = num;
    }

    /** Allow to send money to the contract */
    function contribute() public payable {
        require(msg.value >= minContribution);
    }

    /** Displays the minimum contribution*/
    function getMinContribution() public view returns(uint){
        return minContribution;
    }

    /** Gets the sum of two numbers*/
    function getSum(uint num1, uint num2)public pure returns(uint){
        uint sum = num1 + num2;
        return sum;
    }
    
}
