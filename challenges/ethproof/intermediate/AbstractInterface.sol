//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/** Contract in which we will apply interface*/
contract Feed{
    function feed() external pure returns(string memory){
        return "Nom nom nom";
    }
}

/** Interface for Animal Contract*/
interface IAnimal{
    function feed() external view returns(string memory);
}

/** Abstract Contract*/
abstract contract AbstractAnimal{
    function sound() public pure virtual returns(string memory);
}

contract Animal is AbstractAnimal{
    //overriding of the function from the abstract parent
    function sound() public pure override returns(string memory){
        return "Meow";
    }

    //Calling feed function using interface as connection to the other contract
    function feed(address _feed) external view returns(string memory){
        return IAnimal(_feed).feed();
    }
}