// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockRouter {
    // Simple mock swap: Takes tokenIn, gives tokenOut based on a fixed rate or 1:1 for simplicity in demo
    // For demo purposes, we will just mint/transfer from own balance if we have it, 
    // or we assume this router has infinite liquidity of everything (it's a mock).
    
    // Let's assume we maintain a reserve or simply mint if the token is mintable.
    // actually, best to just hold a balance.
    
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts) {
        require(path.length >= 2, "Invalid path");
        address tokenIn = path[0];
        address tokenOut = path[path.length - 1];
        
        // Transfer input token from user to this router
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // Calculate output amount.
        // Mock Rates: 
        // 1 USDC = 15000 IDR
        // 1 USDC = 35 THB
        // We will do rough estimations based on symbol/address for the demo, 
        // OR simpler: just return amountOutMin to satisfy the call.
        
        uint256 amountOut = amountOutMin; 
        
        // If we want more realism, we can simple return what was asked (amountOutMin) 
        // assuming the caller (PaymentPortal) calculated the rate.
        // OR we implement a fixed rate here. Let's do a simple fixed rate storage or hardcoded.
        
        // Hardcoded Rates for Demo
        // We can't easily check symbol on-chain without interface, but we can trust the caller asks for reasonable minOut.
        // Let's just give them `amountOutMin` + 1 to be safe and simulate "market"
        amountOut = amountOutMin;

        // Check if we have enough balance
        uint256 balance = IERC20(tokenOut).balanceOf(address(this));
        require(balance >= amountOut, "MockRouter: Insufficient liquidity");
        
        IERC20(tokenOut).transfer(to, amountOut);
        
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        amounts[path.length - 1] = amountOut;
        
        return amounts;
    }
}
