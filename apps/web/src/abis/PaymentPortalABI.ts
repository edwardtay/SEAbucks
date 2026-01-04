export const PaymentPortalABI = [
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "tokenIn", "type": "address" },
            { "indexed": false, "internalType": "address", "name": "tokenOut", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amountIn", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "amountOut", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256" },
            { "indexed": false, "internalType": "string", "name": "memo", "type": "string" }
        ],
        "name": "PaymentProcessed",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "feeBps",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "router",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "tokenIn", "type": "address" },
            { "internalType": "address", "name": "tokenOut", "type": "address" },
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
            { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
            { "internalType": "string", "name": "memo", "type": "string" }
        ],
        "name": "pay",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;
