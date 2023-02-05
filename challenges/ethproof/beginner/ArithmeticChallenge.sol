//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ArithmeticChallenge {
    int x;
    int y;

    constructor(int _x, int _y){
        x = _x;
        y = _y;
    }

    /** Function for adding to numbers */
    function sumNum() public view returns(int){
        return x + y;
    }

    /** Function for subtracting to numbers */
    function subNum() public view returns(int){
        return x - y;
    }

    /** Function for multiplying to numbers */
    function mulNum() public view returns(int){
        return x * y;
    }

    /** Function for dividing to numbers */
    function divNum() public view returns(int){
        return x / y;
    }
    
}