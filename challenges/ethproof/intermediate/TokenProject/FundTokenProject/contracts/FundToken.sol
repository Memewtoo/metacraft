//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract FundToken is ERC20Capped, ERC20Burnable {

    address payable public owner;

    /** 
        Mints 700,000 tokens directly to owners address,
        and create a token cap that is passed as a parameter
    */
    constructor(uint cap) ERC20("FundToken", "FBMT") ERC20Capped(cap * (10 ** decimals())) { 
        owner = payable(msg.sender);
        _mint(owner, 7000000 * (10 ** decimals()));
        
    }

    function _mint(address account, uint256 amount) internal virtual override(ERC20Capped, ERC20) {
        require(ERC20.totalSupply() + amount <= cap(), "ERC20Capped: cap exceeded");
        super._mint(account, amount);
    }

    modifier restricted {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    /** Allows for termination of the contract on the blockchain */
    function destroy() public restricted {
        selfdestruct(owner);
    } 

}