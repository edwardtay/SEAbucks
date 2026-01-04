// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IRouter {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

contract PaymentPortal is Ownable {
    
    // Fee in basis points (1/10000). 100 = 1%.
    uint256 public constant MAX_FEE_BPS = 500; // Max 5%
    uint256 public feeBps;
    
    // Router for swaps
    address public router;

    event PaymentProcessed(
        address indexed from,
        address indexed to,
        address indexed tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee,
        string memo
    );

    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event RouterUpdated(address oldRouter, address newRouter);
    event FeesWithdrawn(address indexed token, address indexed to, uint256 amount);

    constructor(uint256 _initialFeeBps, address _router) Ownable(msg.sender) {
        require(_initialFeeBps <= MAX_FEE_BPS, "Fee too high");
        feeBps = _initialFeeBps;
        router = _router;
    }

    /**
     * @notice Process a payment. Supports optional swap.
     * @param tokenIn The token the payer is sending (e.g. USDC)
     * @param tokenOut The token the merchant wants to receive (e.g. IDR). If same as tokenIn, no swap.
     * @param to The merchant/recipient address
     * @param amountIn The amount of tokenIn to pay (before fees)
     * @param amountOutMin Minimum amount of tokenOut to receive (slippage protection for swap)
     * @param memo A reference string
     */
    function pay(
        address tokenIn,
        address tokenOut,
        address to,
        uint256 amountIn,
        uint256 amountOutMin,
        string calldata memo
    ) external {
        require(to != address(0), "Invalid recipient");
        require(amountIn > 0, "Amount must be > 0");

        // 1. Calculate Fee
        uint256 fee = (amountIn * feeBps) / 10000;
        uint256 amountAfterFee = amountIn - fee;

        // 2. Transfer full amount from payer to this contract
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        uint256 finalAmountOut = amountAfterFee;

        // 3. Swap or Transfer
        if (tokenOut != tokenIn && tokenOut != address(0)) {
            require(router != address(0), "Router not set");
            
            // Approve router to spend tokenIn
            IERC20(tokenIn).approve(router, amountAfterFee);
            
            address[] memory path = new address[](2);
            path[0] = tokenIn;
            path[1] = tokenOut;
            
            // Execute Swap: Payout goes directly to 'to' (merchant)
            uint256[] memory amounts = IRouter(router).swapExactTokensForTokens(
                amountAfterFee,
                amountOutMin,
                path,
                to,
                block.timestamp + 300
            );
            finalAmountOut = amounts[1];
        } else {
            // No swap, direct transfer
            if (amountAfterFee > 0) {
                IERC20(tokenIn).transfer(to, amountAfterFee);
            }
        }

        emit PaymentProcessed(msg.sender, to, tokenIn, tokenOut, amountIn, finalAmountOut, fee, memo);
    }

    function setFee(uint256 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= MAX_FEE_BPS, "Fee too high");
        emit FeeUpdated(feeBps, _newFeeBps);
        feeBps = _newFeeBps;
    }
    
    function setRouter(address _newRouter) external onlyOwner {
        emit RouterUpdated(router, _newRouter);
        router = _newRouter;
    }

    function withdrawFees(address token, address to) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        IERC20(token).transfer(to, balance);
        emit FeesWithdrawn(token, to, balance);
    }
}
