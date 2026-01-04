import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy Mock Tokens if needed (USDC, IDR, etc.)
    // For Real Prod, we might attach to existing, but for Hackathon/Testnet we often deploy mocks.
    const MockERC20 = await ethers.getContractFactory("MockERC20");

    const usdc = await MockERC20.deploy("USD Coin", "USDC");
    await usdc.waitForDeployment();
    console.log("USDC deployed to:", await usdc.getAddress());

    const usdt = await MockERC20.deploy("Tether USD", "USDT");
    await usdt.waitForDeployment();
    console.log("USDT deployed to:", await usdt.getAddress());

    // 2. Deploy SEABucksRouter
    const SEABucksRouter = await ethers.getContractFactory("SEABucksRouter");

    // In a real scenario, this 'dealer' address would be a specialized backend wallet.
    // For the hackathon, we will use the deployer or a specific generated address as the 'Dealer'.
    // Let's use the deployer as the dealer for simplicity in tests unless we generate one.
    // Actually, let's pick a known "Server/Dealer" address that we will put in our .env or API

    // For Demo purpose, let's say the deployer is the dealer initially. 
    // We can change it later with setDealer.
    const dealerAddress = deployer.address;

    const router = await SEABucksRouter.deploy(dealerAddress);
    await router.waitForDeployment();
    console.log("SEABucksRouter deployed to:", await router.getAddress());

    // 3. Setup Liquidity (Optional, for the router to actually work it needs tokens)
    // Mint some tokens to the router so it can PAY OUT users.
    // Mint 1 billion IDR to router
    const idr = await MockERC20.deploy("Indonesian Rupiah", "IDR");
    await idr.waitForDeployment();
    console.log("IDR deployed to:", await idr.getAddress());

    await idr.mint(await router.getAddress(), ethers.parseUnits("1000000000", 18));
    console.log("Minted IDR liquidity to Router");

    // Mint USDC/USDT to deployer/user for testing
    await usdc.mint(deployer.address, ethers.parseUnits("1000", 18));
    await usdt.mint(deployer.address, ethers.parseUnits("1000", 18));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
