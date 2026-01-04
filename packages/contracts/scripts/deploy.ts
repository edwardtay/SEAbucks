import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with local account:", deployer.address);

    // 1. Deploy Mock Tokens
    const MockIDR = await ethers.getContractFactory("MockIDR");
    const idr = await MockIDR.deploy();
    await idr.waitForDeployment();
    console.log(`MockIDR deployed to ${await idr.getAddress()}`);

    const MockTHB = await ethers.getContractFactory("MockTHB");
    const thb = await MockTHB.deploy();
    await thb.waitForDeployment();
    console.log(`MockTHB deployed to ${await thb.getAddress()}`);

    const MockVND = await ethers.getContractFactory("MockVND");
    const vnd = await MockVND.deploy();
    await vnd.waitForDeployment();
    console.log(`MockVND deployed to ${await vnd.getAddress()}`);

    const MockPHP = await ethers.getContractFactory("MockPHP");
    const php = await MockPHP.deploy();
    await php.waitForDeployment();
    console.log(`MockPHP deployed to ${await php.getAddress()}`);

    const MockMYR = await ethers.getContractFactory("MockMYR");
    const myr = await MockMYR.deploy();
    await myr.waitForDeployment();
    console.log(`MockMYR deployed to ${await myr.getAddress()}`);

    const MockSGD = await ethers.getContractFactory("MockSGD");
    const sgd = await MockSGD.deploy();
    await sgd.waitForDeployment();
    console.log(`MockSGD deployed to ${await sgd.getAddress()}`);

    const MockERC20 = await ethers.getContractFactory("MockERC20"); // USDC
    const usdc = await MockERC20.deploy("USDC Mock", "mUSDC");
    await usdc.waitForDeployment();
    console.log(`MockUSDC deployed to ${await usdc.getAddress()}`);

    // 2. Deploy Mock Router
    const MockRouter = await ethers.getContractFactory("MockRouter");
    const router = await MockRouter.deploy();
    await router.waitForDeployment();
    console.log(`MockRouter deployed to ${await router.getAddress()}`);

    // 3. Seed Router with Liquidity
    const idrAmount = ethers.parseUnits("100000000", 18);
    const thbAmount = ethers.parseUnits("1000000", 18);
    const vndAmount = ethers.parseUnits("100000000", 18);
    const phpAmount = ethers.parseUnits("100000", 18);
    const myrAmount = ethers.parseUnits("10000", 18);
    const sgdAmount = ethers.parseUnits("10000", 18);

    await idr.transfer(await router.getAddress(), idrAmount);
    await thb.transfer(await router.getAddress(), thbAmount);
    await vnd.transfer(await router.getAddress(), vndAmount);
    await php.transfer(await router.getAddress(), phpAmount);
    await myr.transfer(await router.getAddress(), myrAmount);
    await sgd.transfer(await router.getAddress(), sgdAmount);
    console.log("Seeded MockRouter with IDR, THB, VND, PHP, MYR, SGD liquidity");

    // 4. Deploy PaymentPortal
    const feeBps = 100; // 1%
    const PaymentPortal = await ethers.getContractFactory("PaymentPortal");
    const portal = await PaymentPortal.deploy(feeBps, await router.getAddress());
    await portal.waitForDeployment();

    console.log(
        `PaymentPortal deployed to ${await portal.getAddress()} with fee ${feeBps} bps and Router ${await router.getAddress()}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
