// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockPHP is ERC20 {
    constructor() ERC20("Philippine Peso", "PHP") {
        _mint(msg.sender, 1000000000 * 10 ** decimals()); // Mint a lot
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
