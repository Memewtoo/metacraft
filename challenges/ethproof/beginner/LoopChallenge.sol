//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LoopChallenge {
  
    /** Function that does simple operation 1000 times */
    function doThousand()public pure returns(uint){
        uint num;

        for(int i = 0; i < 1000; i++){
            num += 1;
        }

        return num;
    }

    /** Function that does complex operation 100 times */
    function doHundred()public pure returns(uint){
        uint num;
        uint iterator = 0;

        while(iterator <= 100){
            num = (num * iterator) + iterator;
        }

        return num;
    }

    /* The resulting function above will result in an error 
        because it will reach the block gas limit */
}