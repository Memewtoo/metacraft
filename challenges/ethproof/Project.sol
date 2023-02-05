// SPDX-License-Identifier: MIT
// compiler version must be greater than or equal to 0.8.17 and less than 0.9.0
pragma solidity ^0.8.17;

contract Project {
    uint256 minContribution;

    /** Constructor function that is automatically called
        when an instance is created 
    */
    constructor (uint256 minimum) {
        minContribution = minimum;
    }

    /** Different types error handling */
    function contribute() public payable {
        require(msg.value >= minContribution, "Insufficient amount to be able to contribute");
    }

    function getContribute() public payable {
        assert(msg.value >= minContribution);
    }

    error InvalidAmount (uint256 sent, uint256 minRequired);

    function validContribute() public payable {
        uint256 amount = msg.value;

        if(amount < minContribution){
            revert InvalidAmount({
                sent: amount,
                minRequired: minContribution
            });
        }
    }
}
