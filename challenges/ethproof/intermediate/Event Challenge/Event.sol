// SPDX-License-Identifier: MIT
// compiler version must be greater than or equal to 0.8.17 and less than 0.9.0
pragma solidity ^0.8.17;

contract EventChallenge{
    /** Event declarations */
    event LogMess(address indexed sender, string message, uint indexed timestamp);
    event LogMessage(address indexed sender, string message, uint indexed timestamp);
    event LogMessages(address indexed sender, string message, uint indexed timestamp);

    /** Functions to emit the events*/

    function emitLogMess(string memory message){
        emit LogMess(msg.sender, message, block.timestamp);
    }

    function emitLogMessage(string memory message){
        emit LogMessage(msg.sender, message, block.timestamp);
    }

    function emitLogMessages(string memory message){
        emit LogMessages(msg.sender, message, block.timestamp);
    }   


}
