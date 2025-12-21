import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { Claimable, MockERC20 } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Claimable", function () {
  let claimable: Claimable;
  let mockToken: MockERC20;
  let depositor: HardhatEthersSigner;
  let claimant: HardhatEthersSigner;
  let other: HardhatEthersSigner;

  const ONE_HOUR = 60 * 60;
  const ONE_DAY = 24 * ONE_HOUR;
  const ETH_AMOUNT = ethers.parseEther("1");
  const TOKEN_AMOUNT = ethers.parseUnits("1000", 6); // USDC-like (6 decimals)

  beforeEach(async function () {
    [depositor, claimant, other] = await ethers.getSigners();

    // Deploy Claimable contract
    const ClaimableFactory = await ethers.getContractFactory("Claimable");
    claimable = await ClaimableFactory.deploy();

    // Deploy mock ERC20 token (USDC-like with 6 decimals)
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20Factory.deploy("Mock USDC", "MUSDC", 6);

    // Mint tokens to depositor
    await mockToken.mint(depositor.address, TOKEN_AMOUNT * 10n);
  });

  describe("ETH Deposits", function () {
    describe("depositETH", function () {
      it("should create an ETH deposit successfully", async function () {
        const deadline = (await time.latest()) + ONE_DAY;

        await expect(
          claimable.connect(depositor).depositETH(claimant.address, deadline, {
            value: ETH_AMOUNT,
          })
        )
          .to.emit(claimable, "DepositCreated")
          .withArgs(0, depositor.address, claimant.address, ethers.ZeroAddress, ETH_AMOUNT, deadline);

        const deposit = await claimable.getDeposit(0);
        expect(deposit.depositor).to.equal(depositor.address);
        expect(deposit.claimant).to.equal(claimant.address);
        expect(deposit.token).to.equal(ethers.ZeroAddress);
        expect(deposit.amount).to.equal(ETH_AMOUNT);
        expect(deposit.deadline).to.equal(deadline);
        expect(deposit.claimed).to.equal(false);
      });

      it("should increment deposit count", async function () {
        const deadline = (await time.latest()) + ONE_DAY;

        expect(await claimable.depositCount()).to.equal(0);
        
        await claimable.connect(depositor).depositETH(claimant.address, deadline, {
          value: ETH_AMOUNT,
        });
        expect(await claimable.depositCount()).to.equal(1);

        await claimable.connect(depositor).depositETH(claimant.address, deadline, {
          value: ETH_AMOUNT,
        });
        expect(await claimable.depositCount()).to.equal(2);
      });

      it("should revert if amount is zero", async function () {
        const deadline = (await time.latest()) + ONE_DAY;

        await expect(
          claimable.connect(depositor).depositETH(claimant.address, deadline, {
            value: 0,
          })
        ).to.be.revertedWithCustomError(claimable, "ZeroAmount");
      });

      it("should revert if claimant is zero address", async function () {
        const deadline = (await time.latest()) + ONE_DAY;

        await expect(
          claimable.connect(depositor).depositETH(ethers.ZeroAddress, deadline, {
            value: ETH_AMOUNT,
          })
        ).to.be.revertedWithCustomError(claimable, "ZeroClaimant");
      });

      it("should revert if deadline is in the past", async function () {
        const pastDeadline = (await time.latest()) - 1;

        await expect(
          claimable.connect(depositor).depositETH(claimant.address, pastDeadline, {
            value: ETH_AMOUNT,
          })
        ).to.be.revertedWithCustomError(claimable, "DeadlineNotInFuture");
      });
    });

    describe("claim (ETH)", function () {
      let deadline: number;
      let depositId: bigint;

      beforeEach(async function () {
        deadline = (await time.latest()) + ONE_DAY;
        await claimable.connect(depositor).depositETH(claimant.address, deadline, {
          value: ETH_AMOUNT,
        });
        depositId = 0n;
      });

      it("should allow claimant to claim before deadline", async function () {
        const balanceBefore = await ethers.provider.getBalance(claimant.address);

        await expect(claimable.connect(claimant).claim(depositId))
          .to.emit(claimable, "Claimed")
          .withArgs(depositId, claimant.address);

        const balanceAfter = await ethers.provider.getBalance(claimant.address);
        expect(balanceAfter - balanceBefore).to.be.closeTo(ETH_AMOUNT, ethers.parseEther("0.01"));

        const deposit = await claimable.getDeposit(depositId);
        expect(deposit.claimed).to.equal(true);
      });

      it("should allow claimant to claim after deadline", async function () {
        await time.increase(ONE_DAY + 1);

        await expect(claimable.connect(claimant).claim(depositId))
          .to.emit(claimable, "Claimed")
          .withArgs(depositId, claimant.address);
      });

      it("should revert if not claimant", async function () {
        await expect(
          claimable.connect(other).claim(depositId)
        ).to.be.revertedWithCustomError(claimable, "NotClaimant");
      });

      it("should revert if already claimed", async function () {
        await claimable.connect(claimant).claim(depositId);

        await expect(
          claimable.connect(claimant).claim(depositId)
        ).to.be.revertedWithCustomError(claimable, "AlreadyClaimed");
      });
    });

    describe("refund (ETH)", function () {
      let deadline: number;
      let depositId: bigint;

      beforeEach(async function () {
        deadline = (await time.latest()) + ONE_DAY;
        await claimable.connect(depositor).depositETH(claimant.address, deadline, {
          value: ETH_AMOUNT,
        });
        depositId = 0n;
      });

      it("should allow depositor to refund after deadline", async function () {
        await time.increase(ONE_DAY + 1);

        const balanceBefore = await ethers.provider.getBalance(depositor.address);

        await expect(claimable.connect(depositor).refund(depositId))
          .to.emit(claimable, "Refunded")
          .withArgs(depositId, depositor.address);

        const balanceAfter = await ethers.provider.getBalance(depositor.address);
        expect(balanceAfter - balanceBefore).to.be.closeTo(ETH_AMOUNT, ethers.parseEther("0.01"));

        const deposit = await claimable.getDeposit(depositId);
        expect(deposit.claimed).to.equal(true);
      });

      it("should revert if deadline not reached", async function () {
        await expect(
          claimable.connect(depositor).refund(depositId)
        ).to.be.revertedWithCustomError(claimable, "DeadlineNotReached");
      });

      it("should revert if not depositor", async function () {
        await time.increase(ONE_DAY + 1);

        await expect(
          claimable.connect(other).refund(depositId)
        ).to.be.revertedWithCustomError(claimable, "NotDepositor");
      });
    });
  });

  describe("ERC20 Token Deposits", function () {
    describe("depositToken", function () {
      it("should create a token deposit successfully", async function () {
        const deadline = (await time.latest()) + ONE_DAY;

        await mockToken.connect(depositor).approve(await claimable.getAddress(), TOKEN_AMOUNT);

        await expect(
          claimable.connect(depositor).depositToken(
            claimant.address,
            await mockToken.getAddress(),
            TOKEN_AMOUNT,
            deadline
          )
        )
          .to.emit(claimable, "DepositCreated")
          .withArgs(
            0,
            depositor.address,
            claimant.address,
            await mockToken.getAddress(),
            TOKEN_AMOUNT,
            deadline
          );

        const deposit = await claimable.getDeposit(0);
        expect(deposit.depositor).to.equal(depositor.address);
        expect(deposit.claimant).to.equal(claimant.address);
        expect(deposit.token).to.equal(await mockToken.getAddress());
        expect(deposit.amount).to.equal(TOKEN_AMOUNT);

        expect(await mockToken.balanceOf(await claimable.getAddress())).to.equal(TOKEN_AMOUNT);
      });
    });

    describe("claim (ERC20)", function () {
      let deadline: number;
      let depositId: bigint;

      beforeEach(async function () {
        deadline = (await time.latest()) + ONE_DAY;
        await mockToken.connect(depositor).approve(await claimable.getAddress(), TOKEN_AMOUNT);
        await claimable.connect(depositor).depositToken(
          claimant.address,
          await mockToken.getAddress(),
          TOKEN_AMOUNT,
          deadline
        );
        depositId = 0n;
      });

      it("should allow claimant to claim tokens", async function () {
        const balanceBefore = await mockToken.balanceOf(claimant.address);

        await expect(claimable.connect(claimant).claim(depositId))
          .to.emit(claimable, "Claimed")
          .withArgs(depositId, claimant.address);

        const balanceAfter = await mockToken.balanceOf(claimant.address);
        expect(balanceAfter - balanceBefore).to.equal(TOKEN_AMOUNT);
      });
    });

    describe("refund (ERC20)", function () {
      let deadline: number;
      let depositId: bigint;

      beforeEach(async function () {
        deadline = (await time.latest()) + ONE_DAY;
        await mockToken.connect(depositor).approve(await claimable.getAddress(), TOKEN_AMOUNT);
        await claimable.connect(depositor).depositToken(
          claimant.address,
          await mockToken.getAddress(),
          TOKEN_AMOUNT,
          deadline
        );
        depositId = 0n;
      });

      it("should allow depositor to refund tokens after deadline", async function () {
        await time.increase(ONE_DAY + 1);

        const balanceBefore = await mockToken.balanceOf(depositor.address);

        await expect(claimable.connect(depositor).refund(depositId))
          .to.emit(claimable, "Refunded")
          .withArgs(depositId, depositor.address);

        const balanceAfter = await mockToken.balanceOf(depositor.address);
        expect(balanceAfter - balanceBefore).to.equal(TOKEN_AMOUNT);
      });
    });
  });
});

