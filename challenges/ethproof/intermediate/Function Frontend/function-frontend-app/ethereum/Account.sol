//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/** 
    Lets users contribute some value to the contract
    and the contract will keep track of the number of
    contributors
*/
contract Account {
    /** 
        State variables for counting contributors
        and checking if contributor already exists 
    */

    uint contributorsCount;
    mapping (address => bool) contributorExist;

    /** Function that allows user to contribute*/
    function contribute() public payable{
        require (contributorExist[msg.sender] == false, "You already contributed.");
        contributorExist[msg.sender] = true;
        contributorsCount++;
    }

    /** Function that displays the number of contributors */
    function getContributors() public view returns (uint) {
        return contributorsCount;
    }

    /** Function that allows users to view the current balance of the contract */
    function displayContractBalance() public view returns (uint) {
        //Convert balance from wei to ether
        return address(this).balance / 1000000000000000000;
    }

}