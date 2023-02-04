
// SPDX-License-Identifier: MIT
// compiler version must be greater than or equal to 0.8.17 and less than 0.9.0
pragma solidity ^0.8.17;

contract GlobalFunction {
    function getAddress() public view returns (address) {
        return address(this);
    }

    function getBlockTimestamp() public view returns (uint) {
        return block.timestamp;
    }

    function getTransactionOrigin() public view returns (address) {
        return tx.origin;
    }

    function getTransactionGasPrice() public view returns (uint256) {
        return tx.gasprice;
    }

    function getSender() public view returns (address) {
        return msg.sender;
    }

    function  getSenderValue()  public  payable returns (uint) {
        return msg.value;
    }

    function getBlockCoinbase() public view returns (address) {
        return block.coinbase;
    }

    function getBlockDifficulty() public view returns (uint) {
        return block.difficulty;
    }

    function getBlockGasLimit() public view returns (uint) {
        return block.gaslimit;
    }

    function getBlockNumber() public view returns (uint) {
        return block.number;
    }
}
