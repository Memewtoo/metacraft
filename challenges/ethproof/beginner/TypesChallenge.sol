//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EtherChallenge {
    uint public n;

    /* Function to take some ether from user */
    function contribute() public payable {
        n = msg.value;
    }

    /* Function to show wei*/
    function showWei() public view returns(uint){
        return n;
    }

    /* Function to show ether*/
    function showEther() public view returns(uint){
        return n / 1 ether;
    }

    /* Function to show gwei*/
    function showGwei() public view returns(uint){
        return n / 1 gwei;
    }
}