import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { CryptoInheritance, MockERC20 } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("CryptoInheritance", function () {
  let cryptoInheritance: CryptoInheritance;
  let mockToken: MockERC20;
  let depositor: HardhatEthersSigner;
  let claimant: HardhatEthersSigner;
  let other: HardhatEthersSigner;

  const ONE_HOUR = 60 * 60;
  const ONE_DAY = 24 * ONE_HOUR;
  const ONE_YEAR = 365 * ONE_DAY;
  const ETH_AMOUNT = ethers.parseEther("1");
  const TOKEN_AMOUNT = ethers.parseUnits("1000", 6);
  const DEFAULT_TITLE = "Inheritance Plan";
  const ZERO_HASH = ethers.ZeroHash;

  function computeSecretHash(secret: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(secret));
  }

  beforeEach(async function () {
    [depositor, claimant, other] = await ethers.getSigners();

    const CryptoInheritanceFactory = await ethers.getContractFactory("CryptoInheritance");
    cryptoInheritance = await CryptoInheritanceFactory.deploy();

    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20Factory.deploy("Mock USDC", "MUSDC", 6);

    await mockToken.mint(depositor.address, TOKEN_AMOUNT * 10n);
  });

  // ============ ETH Deposits ============

  describe("ETH Deposits", function () {
    describe("depositETH", function () {
      it("should create an ETH deposit with all parameters", async function () {
        const startTime = (await time.latest()) + ONE_HOUR;
        const deadline = (await time.latest()) + ONE_YEAR;
        const contentHash = ethers.keccak256(ethers.toUtf8Bytes("will document"));

        const tx = await cryptoInheritance.connect(depositor).depositETH(
          claimant.address, startTime, deadline, DEFAULT_TITLE, contentHash, ZERO_HASH,
          { value: ETH_AMOUNT }
        );

        await expect(tx).to.emit(cryptoInheritance, "DepositCreated");

        const deposit = await cryptoInheritance.getDeposit(0);
        expect(deposit.depositor).to.equal(depositor.address);
        expect(deposit.claimant).to.equal(claimant.address);
        expect(deposit.amount).to.equal(ETH_AMOUNT);
        expect(deposit.startTime).to.equal(startTime);
        expect(deposit.deadline).to.equal(deadline);
        expect(deposit.contentHash).to.equal(contentHash);
      });

      it("should allow startTime of 0 for immediate claiming", async function () {
        const deadline = (await time.latest()) + ONE_YEAR;
        await cryptoInheritance.connect(depositor).depositETH(
          claimant.address, 0, deadline, DEFAULT_TITLE, ZERO_HASH, ZERO_HASH,
          { value: ETH_AMOUNT }
        );
        const deposit = await cryptoInheritance.getDeposit(0);
        expect(deposit.startTime).to.equal(0);
      });

      it("should revert if amount is zero", async function () {
        const deadline = (await time.latest()) + ONE_YEAR;
        await expect(
          cryptoInheritance.connect(depositor).depositETH(
            claimant.address, 0, deadline, DEFAULT_TITLE, ZERO_HASH, ZERO_HASH,
            { value: 0 }
          )
        ).to.be.revertedWithCustomError(cryptoInheritance, "ZeroAmount");
      });

      it("should revert if no claim method provided", async function () {
        const deadline = (await time.latest()) + ONE_YEAR;
        await expect(
          cryptoInheritance.connect(depositor).depositETH(
            ethers.ZeroAddress, 0, deadline, DEFAULT_TITLE, ZERO_HASH, ZERO_HASH,
            { value: ETH_AMOUNT }
          )
        ).to.be.revertedWithCustomError(cryptoInheritance, "NoClaimMethod");
      });

      it("should allow deposit with only secretHash", async function () {
        const deadline = (await time.latest()) + ONE_YEAR;
        const secretHash = computeSecretHash("my-secret");
        await cryptoInheritance.connect(depositor).depositETH(
          ethers.ZeroAddress, 0, deadline, DEFAULT_TITLE, ZERO_HASH, secretHash,
          { value: ETH_AMOUNT }
        );
        const deposit = await cryptoInheritance.getDeposit(0);
        expect(deposit.claimant).to.equal(ethers.ZeroAddress);
        expect(deposit.claimSecretHash).to.equal(secretHash);
      });

      it("should revert if startTime after deadline", async function () {
        const deadline = (await time.latest()) + ONE_DAY;
        const startTime = deadline + ONE_HOUR;
        await expect(
          cryptoInheritance.connect(depositor).depositETH(
            claimant.address, startTime, deadline, DEFAULT_TITLE, ZERO_HASH, ZERO_HASH,
            { value: ETH_AMOUNT }
          )
        ).to.be.revertedWithCustomError(cryptoInheritance, "StartTimeAfterDeadline");
      });
    });

    describe("claim (ETH)", function () {
      beforeEach(async function () {
        const deadline = (await time.latest()) + ONE_YEAR;
        await cryptoInheritance.connect(depositor).depositETH(
          claimant.address, 0, deadline, DEFAULT_TITLE, ZERO_HASH, ZERO_HASH,
          { value: ETH_AMOUNT }
        );
      });

      it("should allow claimant to claim", async function () {
        await expect(cryptoInheritance.connect(claimant).claim(0))
          .to.emit(cryptoInheritance, "Claimed")
          .withArgs(0, claimant.address);
      });

      it("should revert if not claimant", async function () {
        await expect(
          cryptoInheritance.connect(other).claim(0)
        ).to.be.revertedWithCustomError(cryptoInheritance, "NotClaimant");
      });

      it("should revert if already claimed", async function () {
        await cryptoInheritance.connect(claimant).claim(0);
        await expect(
          cryptoInheritance.connect(claimant).claim(0)
        ).to.be.revertedWithCustomError(cryptoInheritance, "AlreadyClaimed");
      });
    });

    describe("claim with startTime", function () {
      it("should revert if claiming before startTime", async function () {
        const startTime = (await time.latest()) + ONE_DAY;
        const deadline = (await time.latest()) + ONE_YEAR;
        await cryptoInheritance.connect(depositor).depositETH(
          claimant.address, startTime, deadline, DEFAULT_TITLE, ZERO_HASH, ZERO_HASH,
          { value: ETH_AMOUNT }
        );
        await expect(
          cryptoInheritance.connect(claimant).claim(0)
        ).to.be.revertedWithCustomError(cryptoInheritance, "ClaimNotYetAllowed");
      });

      it("should allow claiming after startTime", async function () {
        const startTime = (await time.latest()) + ONE_HOUR;
        const deadline = (await time.latest()) + ONE_YEAR;
        await cryptoInheritance.connect(depositor).depositETH(
          claimant.address, startTime, deadline, DEFAULT_TITLE, ZERO_HASH, ZERO_HASH,
          { value: ETH_AMOUNT }
        );
        await time.increaseTo(startTime + 1);
        await expect(cryptoInheritance.connect(claimant).claim(0))
          .to.emit(cryptoInheritance, "Claimed");
      });
    });

    describe("refund (ETH)", function () {
      let deadline: number;

      beforeEach(async function () {
        deadline = (await time.latest()) + ONE_YEAR;
        await cryptoInheritance.connect(depositor).depositETH(
          claimant.address, 0, deadline, DEFAULT_TITLE, ZERO_HASH, ZERO_HASH,
          { value: ETH_AMOUNT }
        );
      });

      it("should allow depositor to refund after deadline", async function () {
        await time.increase(ONE_YEAR + 1);
        await expect(cryptoInheritance.connect(depositor).refund(0))
          .to.emit(cryptoInheritance, "Refunded")
          .withArgs(0, depositor.address);
      });

      it("should revert if deadline not reached", async function () {
        await expect(
          cryptoInheritance.connect(depositor).refund(0)
        ).to.be.revertedWithCustomError(cryptoInheritance, "DeadlineNotReached");
      });

      it("should revert if not depositor", async function () {
        await time.increase(ONE_YEAR + 1);
        await expect(
          cryptoInheritance.connect(other).refund(0)
        ).to.be.revertedWithCustomError(cryptoInheritance, "NotDepositor");
      });
    });
  });

  // ============ Secret-Based Claiming ============

  describe("Secret-Based Claiming", function () {
    const SECRET = "family-inheritance-2026";
    let secretHash: string;
    let deadline: number;

    beforeEach(async function () {
      secretHash = computeSecretHash(SECRET);
      deadline = (await time.latest()) + ONE_YEAR;
    });

    describe("claimWithSecret", function () {
      beforeEach(async function () {
        await cryptoInheritance.connect(depositor).depositETH(
          ethers.ZeroAddress, 0, deadline, DEFAULT_TITLE, ZERO_HASH, secretHash,
          { value: ETH_AMOUNT }
        );
      });

      it("should allow anyone with correct secret to claim", async function () {
        await expect(cryptoInheritance.connect(other).claimWithSecret(0, SECRET))
          .to.emit(cryptoInheritance, "Claimed")
          .withArgs(0, other.address);
      });

      it("should revert with wrong secret", async function () {
        await expect(
          cryptoInheritance.connect(other).claimWithSecret(0, "wrong-secret")
        ).to.be.revertedWithCustomError(cryptoInheritance, "InvalidSecret");
      });

      it("should revert if secret claim not enabled", async function () {
        await cryptoInheritance.connect(depositor).depositETH(
          claimant.address, 0, deadline, DEFAULT_TITLE, ZERO_HASH, ZERO_HASH,
          { value: ETH_AMOUNT }
        );
        await expect(
          cryptoInheritance.connect(other).claimWithSecret(1, SECRET)
        ).to.be.revertedWithCustomError(cryptoInheritance, "SecretClaimNotEnabled");
      });

      it("should revert if claiming before startTime", async function () {
        const startTime = (await time.latest()) + ONE_DAY;
        await cryptoInheritance.connect(depositor).depositETH(
          ethers.ZeroAddress, startTime, deadline, DEFAULT_TITLE, ZERO_HASH, secretHash,
          { value: ETH_AMOUNT }
        );
        await expect(
          cryptoInheritance.connect(other).claimWithSecret(1, SECRET)
        ).to.be.revertedWithCustomError(cryptoInheritance, "ClaimNotYetAllowed");
      });
    });
  });

  // ============ Deadline Extension ============

  describe("Deadline Extension", function () {
    let deadline: number;

    beforeEach(async function () {
      deadline = (await time.latest()) + ONE_YEAR;
      await cryptoInheritance.connect(depositor).depositETH(
        claimant.address, 0, deadline, DEFAULT_TITLE, ZERO_HASH, ZERO_HASH,
        { value: ETH_AMOUNT }
      );
    });

    describe("extendDeadline", function () {
      it("should allow depositor to extend deadline", async function () {
        const newDeadline = deadline + ONE_YEAR;
        await expect(cryptoInheritance.connect(depositor).extendDeadline(0, newDeadline))
          .to.emit(cryptoInheritance, "DeadlineExtended")
          .withArgs(0, deadline, newDeadline);
        const deposit = await cryptoInheritance.getDeposit(0);
        expect(deposit.deadline).to.equal(newDeadline);
      });

      it("should revert if not depositor", async function () {
        await expect(
          cryptoInheritance.connect(other).extendDeadline(0, deadline + ONE_YEAR)
        ).to.be.revertedWithCustomError(cryptoInheritance, "NotDepositor");
      });

      it("should revert if new deadline not after current", async function () {
        await expect(
          cryptoInheritance.connect(depositor).extendDeadline(0, deadline)
        ).to.be.revertedWithCustomError(cryptoInheritance, "NewDeadlineNotAfterCurrent");
      });

      it("should revert if already claimed", async function () {
        await cryptoInheritance.connect(claimant).claim(0);
        await expect(
          cryptoInheritance.connect(depositor).extendDeadline(0, deadline + ONE_YEAR)
        ).to.be.revertedWithCustomError(cryptoInheritance, "AlreadyClaimed");
      });
    });

    describe("batchExtendDeadline", function () {
      beforeEach(async function () {
        await cryptoInheritance.connect(depositor).depositETH(
          claimant.address, 0, deadline, "Plan 2", ZERO_HASH, ZERO_HASH,
          { value: ETH_AMOUNT }
        );
        await cryptoInheritance.connect(depositor).depositETH(
          other.address, 0, deadline, "Plan 3", ZERO_HASH, ZERO_HASH,
          { value: ETH_AMOUNT }
        );
      });

      it("should extend multiple deposits at once", async function () {
        const newDeadline = deadline + ONE_YEAR;
        await cryptoInheritance.connect(depositor).batchExtendDeadline([0, 1, 2], newDeadline);
        for (let i = 0; i < 3; i++) {
          const deposit = await cryptoInheritance.getDeposit(i);
          expect(deposit.deadline).to.equal(newDeadline);
        }
      });

      it("should revert if any deposit not owned", async function () {
        await cryptoInheritance.connect(other).depositETH(
          claimant.address, 0, deadline, "Other's", ZERO_HASH, ZERO_HASH,
          { value: ETH_AMOUNT }
        );
        await expect(
          cryptoInheritance.connect(depositor).batchExtendDeadline([0, 3], deadline + ONE_YEAR)
        ).to.be.revertedWithCustomError(cryptoInheritance, "NotDepositor");
      });
    });
  });

  // ============ Batch Deposits ============

  describe("Batch Deposits", function () {
    describe("batchDepositETH", function () {
      let deadline: number;
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes("will"));

      beforeEach(async function () {
        deadline = (await time.latest()) + ONE_YEAR;
      });

      it("should create multiple deposits in one transaction", async function () {
        const claimants = [claimant.address, other.address];
        const amounts = [ethers.parseEther("1"), ethers.parseEther("2")];
        const totalAmount = amounts[0] + amounts[1];

        await cryptoInheritance.connect(depositor).batchDepositETH(
          claimants, amounts, 0, deadline, DEFAULT_TITLE, contentHash,
          { value: totalAmount }
        );

        expect(await cryptoInheritance.depositCount()).to.equal(2);
        const deposit0 = await cryptoInheritance.getDeposit(0);
        expect(deposit0.claimant).to.equal(claimant.address);
        expect(deposit0.amount).to.equal(amounts[0]);
        const deposit1 = await cryptoInheritance.getDeposit(1);
        expect(deposit1.claimant).to.equal(other.address);
        expect(deposit1.amount).to.equal(amounts[1]);
      });

      it("should revert if arrays length mismatch", async function () {
        await expect(
          cryptoInheritance.connect(depositor).batchDepositETH(
            [claimant.address, other.address], [ethers.parseEther("1")],
            0, deadline, DEFAULT_TITLE, ZERO_HASH,
            { value: ethers.parseEther("1") }
          )
        ).to.be.revertedWithCustomError(cryptoInheritance, "ArrayLengthMismatch");
      });

      it("should revert if total ETH doesn't match", async function () {
        await expect(
          cryptoInheritance.connect(depositor).batchDepositETH(
            [claimant.address], [ethers.parseEther("2")],
            0, deadline, DEFAULT_TITLE, ZERO_HASH,
            { value: ethers.parseEther("1") }
          )
        ).to.be.revertedWithCustomError(cryptoInheritance, "TotalAmountMismatch");
      });

      it("should revert if any amount is zero", async function () {
        await expect(
          cryptoInheritance.connect(depositor).batchDepositETH(
            [claimant.address, other.address], [ethers.parseEther("1"), 0n],
            0, deadline, DEFAULT_TITLE, ZERO_HASH,
            { value: ethers.parseEther("1") }
          )
        ).to.be.revertedWithCustomError(cryptoInheritance, "ZeroAmount");
      });
    });

    describe("batchDepositToken", function () {
      let deadline: number;

      beforeEach(async function () {
        deadline = (await time.latest()) + ONE_YEAR;
      });

      it("should create multiple token deposits", async function () {
        const claimants = [claimant.address, other.address];
        const amounts = [TOKEN_AMOUNT / 2n, TOKEN_AMOUNT / 2n];
        const totalAmount = amounts[0] + amounts[1];

        await mockToken.connect(depositor).approve(await cryptoInheritance.getAddress(), totalAmount);
        await cryptoInheritance.connect(depositor).batchDepositToken(
          claimants, await mockToken.getAddress(), amounts, 0, deadline, DEFAULT_TITLE, ZERO_HASH
        );

        expect(await cryptoInheritance.depositCount()).to.equal(2);
      });
    });
  });

  // ============ ERC20 Token Deposits ============

  describe("ERC20 Token Deposits", function () {
    describe("depositToken", function () {
      it("should create a token deposit successfully", async function () {
        const deadline = (await time.latest()) + ONE_YEAR;
        await mockToken.connect(depositor).approve(await cryptoInheritance.getAddress(), TOKEN_AMOUNT);

        await expect(
          cryptoInheritance.connect(depositor).depositToken(
            claimant.address, await mockToken.getAddress(), TOKEN_AMOUNT,
            0, deadline, DEFAULT_TITLE, ZERO_HASH, ZERO_HASH
          )
        ).to.emit(cryptoInheritance, "DepositCreated");

        const deposit = await cryptoInheritance.getDeposit(0);
        expect(deposit.amount).to.equal(TOKEN_AMOUNT);
      });
    });

    describe("claimWithSecret (ERC20)", function () {
      const SECRET = "token-secret";

      it("should allow claiming tokens with secret", async function () {
        const deadline = (await time.latest()) + ONE_YEAR;
        const secretHash = computeSecretHash(SECRET);

        await mockToken.connect(depositor).approve(await cryptoInheritance.getAddress(), TOKEN_AMOUNT);
        await cryptoInheritance.connect(depositor).depositToken(
          ethers.ZeroAddress, await mockToken.getAddress(), TOKEN_AMOUNT,
          0, deadline, DEFAULT_TITLE, ZERO_HASH, secretHash
        );

        await expect(cryptoInheritance.connect(other).claimWithSecret(0, SECRET))
          .to.emit(cryptoInheritance, "Claimed");

        expect(await mockToken.balanceOf(other.address)).to.equal(TOKEN_AMOUNT);
      });
    });
  });

  // ============ Content Hash ============

  describe("Content Hash (Document Certification)", function () {
    it("should store and return content hash", async function () {
      const deadline = (await time.latest()) + ONE_YEAR;
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes("Last will and testament"));

      await cryptoInheritance.connect(depositor).depositETH(
        claimant.address, 0, deadline, "My Will", contentHash, ZERO_HASH,
        { value: ETH_AMOUNT }
      );

      const deposit = await cryptoInheritance.getDeposit(0);
      expect(deposit.contentHash).to.equal(contentHash);
    });
  });

  // ============ Inheritance Scenario ============

  describe("Full Inheritance Scenario", function () {
    it("should handle complete inheritance flow with check-ins", async function () {
      // Setup: Depositor creates inheritance for heir with 1-year check-in
      const startTime = (await time.latest()) + ONE_DAY; // Can't claim for 1 day
      const deadline = (await time.latest()) + ONE_YEAR;
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes("will"));

      await cryptoInheritance.connect(depositor).depositETH(
        claimant.address, startTime, deadline, "Inheritance", contentHash, ZERO_HASH,
        { value: ethers.parseEther("10") }
      );

      // Heir tries to claim early - should fail
      await expect(
        cryptoInheritance.connect(claimant).claim(0)
      ).to.be.revertedWithCustomError(cryptoInheritance, "ClaimNotYetAllowed");

      // 6 months pass, depositor does check-in
      await time.increase(ONE_YEAR / 2);
      const newDeadline = (await time.latest()) + ONE_YEAR;
      await cryptoInheritance.connect(depositor).extendDeadline(0, newDeadline);

      // Verify deadline extended
      const deposit = await cryptoInheritance.getDeposit(0);
      expect(deposit.deadline).to.equal(newDeadline);

      // More time passes, depositor misses check-in (presumed deceased)
      await time.increase(ONE_YEAR + ONE_DAY);

      // Now heir can claim
      await expect(cryptoInheritance.connect(claimant).claim(0))
        .to.emit(cryptoInheritance, "Claimed");
    });

    it("should handle secret-based inheritance for non-crypto beneficiary", async function () {
      const SECRET = "grandma-loves-you-2026";
      const secretHash = computeSecretHash(SECRET);
      const deadline = (await time.latest()) + ONE_YEAR;

      // Create deposit with secret (no wallet address needed)
      await cryptoInheritance.connect(depositor).depositETH(
        ethers.ZeroAddress, 0, deadline, "For Grandchild", ZERO_HASH, secretHash,
        { value: ethers.parseEther("5") }
      );

      // Later, beneficiary creates wallet and claims with secret
      const balanceBefore = await ethers.provider.getBalance(other.address);
      await cryptoInheritance.connect(other).claimWithSecret(0, SECRET);
      const balanceAfter = await ethers.provider.getBalance(other.address);

      expect(balanceAfter - balanceBefore).to.be.closeTo(
        ethers.parseEther("5"),
        ethers.parseEther("0.01")
      );
    });
  });
});
