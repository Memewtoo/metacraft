//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Variables {
    uint num;
    string str;
    bool flag;
    address sender;

    /** Getter and Setter method for num*/
    function getNum() public view returns(uint){
        return num;
    }

    function setNum(uint n) public{
        num = n;
    }

    /** Getter and Setter method for str*/
    function getStr() public view returns(string memory){
        return str;
    }

    function setStr(string memory message) public{
        str = message;
    }

    /** Getter and Setter method for flag*/
    function getFlag() public view returns(bool){
        return flag;
    }

    function setFlag(bool check) public{
        flag = check;
    }

    /** Getter and Setter method for sender*/
    function getAddress() public view returns(address){
        return sender;
    }

    function setAddress(address addr) public{
        sender = addr;
    }
}