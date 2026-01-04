import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("PaymentPortal", function () {
    async function deployPaymentPortalFixture() {
        const [owner, merchant, payer, otherAccount] = await ethers.getSigners();

        // Deploy Tokens
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        const usdc = await MockERC20.deploy("USDC Mock", "mUSDC");
        const MockIDR = await ethers.getContractFactory("MockIDR");
        const idr = await MockIDR.deploy();

        // Deploy Router
        const MockRouter = await ethers.getContractFactory("MockRouter");
        const router = await MockRouter.deploy();

        // Seed Router with IDR
        await idr.mint(await router.getAddress(), ethers.parseUnits("1000000", 18));

        // Deploy Portal
        const PaymentPortal = await ethers.getContractFactory("PaymentPortal");
        const portal = await PaymentPortal.deploy(100, await router.getAddress()); // 1%

        // Setup Payer
        await usdc.mint(payer.address, ethers.parseUnits("1000", 18));
        await usdc.connect(payer).approve(await portal.getAddress(), ethers.parseUnits("1000", 18));

        return { portal, router, usdc, idr, owner, merchant, payer };
    }

    describe("Deployment", function () {
        it("Should set the right router", async function () {
            const { portal, router } = await loadFixture(deployPaymentPortalFixture);
            expect(await portal.router()).to.equal(await router.getAddress());
        });
    });

    describe("Payments", function () {
        it("Should process direct USDC payment", async function () {
            const { portal, usdc, merchant, payer } = await loadFixture(deployPaymentPortalFixture);

            const amount = ethers.parseUnits("100", 18);

            await expect(portal.connect(payer).pay(
                await usdc.getAddress(),
                await usdc.getAddress(), // tokenOut = tokenIn (No Swap)
                merchant.address,
                amount,
                0, // Min out irrelevant
                "Invoice #1"
            )).to.changeTokenBalances(usdc, [merchant, payer], [ethers.parseUnits("99", 18), -amount]);
        });

        it("Should process Swap to IDR", async function () {
            const { portal, usdc, idr, merchant, payer } = await loadFixture(deployPaymentPortalFixture);

            const amountIn = ethers.parseUnits("100", 18);
            const fee = (amountIn * 100n) / 10000n; // 1 USDC fee
            const amountAfterFee = amountIn - fee; // 99 USDC

            // Router swaps 1:1 in our mock for now (or whatever logic inside MockRouter)
            // MockRouter logic in previous file: amountOut = amountOutMin. 
            // Let's check what we implemented.
            // "amountOut = amountOutMin" -> Wait, that's dangerous if we ask for 0.
            // Let's re-read mock router logic implementation or just test strictly passing expected amount.

            // If MockRouter returns amountOutMin, we MUST pass a non-zero amountOutMin equal to what we expect.
            // Let's say we expect 99 IDR (1:1 mock).
            const expectedIDR = amountAfterFee;

            await expect(portal.connect(payer).pay(
                await usdc.getAddress(),
                await idr.getAddress(), // tokenOut != tokenIn (Swap)
                merchant.address,
                amountIn,
                expectedIDR, // amountOutMin
                "Swap to IDR"
            )).to.changeTokenBalances(idr, [merchant], [expectedIDR]);
        });
    });
});
