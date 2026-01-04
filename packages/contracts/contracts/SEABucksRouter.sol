// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SEABucksRouter
 * @notice A Dealer-based router where an off-chain signer (Oracle/Dealer) provides a signed quote for a swap.
 * This mimics professional OTC desks and Remittance apps.
 */
contract SEABucksRouter is EIP712, Ownable {
    using ECDSA for bytes32;

    address public dealer; // The trusted signer

    // EIP-712 TypeHash
    bytes32 private constant QUOTE_TYPEHASH = keccak256(
        "Quote(address tokenIn,address tokenOut,uint256 amountIn,uint256 amountOut,address recipient,uint256 nonce,uint256 deadline)"
    );

    mapping(address => uint256) public nonces;

    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    event DealerUpdated(address indexed newDealer);

    constructor(address _dealer) EIP712("SEABucksRouter", "1") Ownable(msg.sender) {
        dealer = _dealer;
    }

    function setDealer(address _dealer) external onlyOwner {
        dealer = _dealer;
        emit DealerUpdated(_dealer);
    }

    /**
     * @notice Executed a swap with a valid signature from the Dealer.
     */
    function swapExactTokensForTokensWithSignature(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address recipient,
        uint256 deadline,
        bytes calldata signature
    ) external {
        require(block.timestamp <= deadline, "SEABucks: Quote expired");
        require(amountIn > 0, "SEABucks: Zero amount");

        // Verify Signature
        bytes32 structHash = keccak256(abi.encode(
            QUOTE_TYPEHASH,
            tokenIn,
            tokenOut,
            amountIn,
            amountOut,
            recipient,
            nonces[msg.sender]++, // Increment nonce to prevent replay
            deadline
        ));

        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(hash, signature);

        require(signer == dealer, "SEABucks: Invalid signature");

        // Execute Transfer
        // 1. Pull TokenIn from User
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        // 2. Mock Liquidity / Dealer Settlement
        // In a real generic router, we might swap on Uniswap here.
        // For SEABucks, this contract IS the Liquidity Pool (or has infinite mint access for demo).
        // Check if we have enough TokenOut.
        uint256 balanceOut = IERC20(tokenOut).balanceOf(address(this));
        require(balanceOut >= amountOut, "SEABucks: Insufficient liquidity");

        // 3. Send TokenOut to Recipient
        IERC20(tokenOut).transfer(recipient, amountOut);

        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    // Fallback solely for the "Mock" behavior if we want to bypass signature (Optional, maybe for old tests)
    // Deprecating the old function but keeping interface if strictly needed. 
    // We will REMOVE the old `swapExactTokensForTokens` to force usage of the secure path.
}
