export const SEABucksRouterABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_dealer",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "newDealer",
                "type": "address"
            }
        ],
        "name": "DealerUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenIn",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenOut",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amountOut",
                "type": "uint256"
            }
        ],
        "name": "SwapExecuted",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "dealer",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "nonces",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_dealer",
                "type": "address"
            }
        ],
        "name": "setDealer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "tokenIn",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "tokenOut",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountOut",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "signature",
                "type": "bytes"
            }
        ],
        "name": "swapExactTokensForTokensWithSignature",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;
