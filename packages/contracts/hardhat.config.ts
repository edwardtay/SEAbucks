import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
    solidity: "0.8.28",
    networks: {
        "lisk-sepolia": {
            url: "https://rpc.sepolia-api.lisk.com",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        },
    },
    sourcify: {
        enabled: false
    },
    etherscan: {
        apiKey: {
            "lisk-sepolia": "123" // Blockscout doesn't require a valid API key usually, or uses a specific one
        },
        customChains: [
            {
                network: "lisk-sepolia",
                chainId: 4202,
                urls: {
                    apiURL: "https://sepolia-blockscout.lisk.com/api",
                    browserURL: "https://sepolia-blockscout.lisk.com"
                }
            }
        ]
    }
};

export default config;
