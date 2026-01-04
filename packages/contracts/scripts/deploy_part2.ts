import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Resuming deployment with account:", deployer.address);

    const IDR_ADDR = "0xcfF09905F8f18B35F5A1Ba6d2822D62B3d8c48bE";
    const THB_ADDR = "0xf98a4A0482d534c004cdB9A3358fd71347c4395B";
    const VND_ADDR = "0xa7056B7d2d7B97dE9F254C17Ab7E0470E5F112c0";
    const PHP_ADDR = "0x073b61f5Ed26d802b05301e0E019f78Ac1A41D23";
    const MYR_ADDR = "0x8F878deCd44f7Cf547D559a6e6D0577E370fa0Db";
    const SGD_ADDR = "0xEff2eC240CEB2Ddf582Df0e42fc66a6910D3Fe3f";
    const ROUTER_ADDR = "0x8e41d5A088C1923Cc59795D61f2F0Cef284E52Ac";
    // USDC: 0xDb993d5dc583017b7624F650deBc8B140213C490 (Not needed for this script, we just need to seed router with non-USDC)

    const MockIDR = await ethers.getContractFactory("MockIDR");
    const idr = MockIDR.attach(IDR_ADDR);

    const MockTHB = await ethers.getContractFactory("MockTHB");
    const thb = MockTHB.attach(THB_ADDR);

    const MockVND = await ethers.getContractFactory("MockVND");
    const vnd = MockVND.attach(VND_ADDR);

    const MockPHP = await ethers.getContractFactory("MockPHP");
    const php = MockPHP.attach(PHP_ADDR);

    const MockMYR = await ethers.getContractFactory("MockMYR");
    const myr = MockMYR.attach(MYR_ADDR);

    const MockSGD = await ethers.getContractFactory("MockSGD");
    const sgd = MockSGD.attach(SGD_ADDR);

    // Seeding Liquidity
    console.log("Seeding liquidity...");

    const tx1 = await idr.transfer(ROUTER_ADDR, ethers.parseUnits("100000000", 18));
    await tx1.wait();
    console.log("Seeded IDR");

    const tx2 = await thb.transfer(ROUTER_ADDR, ethers.parseUnits("1000000", 18));
    await tx2.wait();
    console.log("Seeded THB");

    const tx3 = await vnd.transfer(ROUTER_ADDR, ethers.parseUnits("100000000", 18));
    await tx3.wait();
    console.log("Seeded VND");

    const tx4 = await php.transfer(ROUTER_ADDR, ethers.parseUnits("100000", 18));
    await tx4.wait();
    console.log("Seeded PHP");

    const tx5 = await myr.transfer(ROUTER_ADDR, ethers.parseUnits("10000", 18));
    await tx5.wait();
    console.log("Seeded MYR");

    const tx6 = await sgd.transfer(ROUTER_ADDR, ethers.parseUnits("10000", 18));
    await tx6.wait();
    console.log("Seeded SGD");

    // Deploy PaymentPortal
    console.log("Deploying PaymentPortal...");
    const feeBps = 100; // 1%
    const PaymentPortal = await ethers.getContractFactory("PaymentPortal");
    const portal = await PaymentPortal.deploy(feeBps, ROUTER_ADDR);
    await portal.waitForDeployment();

    console.log(
        `PaymentPortal deployed to ${await portal.getAddress()} with fee ${feeBps} bps and Router ${ROUTER_ADDR}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
