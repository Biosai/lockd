import { expect } from "chai";
import { ethers } from "hardhat";
import { FileCertification } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("FileCertification", function () {
  let fileCertification: FileCertification;
  let certifier: HardhatEthersSigner;
  let otherUser: HardhatEthersSigner;

  // Sample hashes (simulating SHA-256 file hashes)
  const HASH_1 = ethers.keccak256(ethers.toUtf8Bytes("file1.pdf"));
  const HASH_2 = ethers.keccak256(ethers.toUtf8Bytes("file2.pdf"));
  const HASH_3 = ethers.keccak256(ethers.toUtf8Bytes("file3.pdf"));
  const ZERO_HASH = ethers.ZeroHash;

  beforeEach(async function () {
    [certifier, otherUser] = await ethers.getSigners();

    // Deploy FileCertification contract
    const FileCertificationFactory = await ethers.getContractFactory("FileCertification");
    fileCertification = await FileCertificationFactory.deploy();
  });

  describe("Deployment", function () {
    it("should initialize with zero certifications", async function () {
      expect(await fileCertification.certificationCount()).to.equal(0);
    });
  });

  describe("certify", function () {
    it("should certify a hash successfully", async function () {
      const tx = await fileCertification.connect(certifier).certify(HASH_1);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      // Check event emission
      await expect(tx)
        .to.emit(fileCertification, "Certified")
        .withArgs(HASH_1, certifier.address, block!.timestamp);

      // Verify certification was stored
      const cert = await fileCertification.getCertification(HASH_1);
      expect(cert.certifier).to.equal(certifier.address);
      expect(cert.timestamp).to.equal(block!.timestamp);

      // Verify count increased
      expect(await fileCertification.certificationCount()).to.equal(1);
    });

    it("should add hash to certifier's list", async function () {
      await fileCertification.connect(certifier).certify(HASH_1);

      const hashes = await fileCertification.getHashesByCertifier(certifier.address);
      expect(hashes.length).to.equal(1);
      expect(hashes[0]).to.equal(HASH_1);
    });

    it("should allow a certifier to certify multiple different hashes", async function () {
      await fileCertification.connect(certifier).certify(HASH_1);
      await fileCertification.connect(certifier).certify(HASH_2);
      await fileCertification.connect(certifier).certify(HASH_3);

      expect(await fileCertification.certificationCount()).to.equal(3);

      const hashes = await fileCertification.getHashesByCertifier(certifier.address);
      expect(hashes.length).to.equal(3);
      expect(hashes[0]).to.equal(HASH_1);
      expect(hashes[1]).to.equal(HASH_2);
      expect(hashes[2]).to.equal(HASH_3);
    });

    it("should allow different users to certify different hashes", async function () {
      await fileCertification.connect(certifier).certify(HASH_1);
      await fileCertification.connect(otherUser).certify(HASH_2);

      expect(await fileCertification.certificationCount()).to.equal(2);

      const certifierHashes = await fileCertification.getHashesByCertifier(certifier.address);
      const otherUserHashes = await fileCertification.getHashesByCertifier(otherUser.address);

      expect(certifierHashes.length).to.equal(1);
      expect(otherUserHashes.length).to.equal(1);
    });

    it("should revert when certifying empty hash", async function () {
      await expect(fileCertification.connect(certifier).certify(ZERO_HASH))
        .to.be.revertedWithCustomError(fileCertification, "EmptyHash");
    });

    it("should revert when hash is already certified", async function () {
      await fileCertification.connect(certifier).certify(HASH_1);

      // Same user trying again
      await expect(fileCertification.connect(certifier).certify(HASH_1))
        .to.be.revertedWithCustomError(fileCertification, "AlreadyCertified");

      // Different user trying
      await expect(fileCertification.connect(otherUser).certify(HASH_1))
        .to.be.revertedWithCustomError(fileCertification, "AlreadyCertified");
    });

    it("should preserve first certifier (first come, first served)", async function () {
      await fileCertification.connect(certifier).certify(HASH_1);

      // Second user tries to certify same hash
      await expect(fileCertification.connect(otherUser).certify(HASH_1))
        .to.be.revertedWithCustomError(fileCertification, "AlreadyCertified");

      // Verify first certifier is still the owner
      const cert = await fileCertification.getCertification(HASH_1);
      expect(cert.certifier).to.equal(certifier.address);
    });
  });

  describe("isCertified", function () {
    it("should return true for certified hash", async function () {
      await fileCertification.connect(certifier).certify(HASH_1);
      expect(await fileCertification.isCertified(HASH_1)).to.be.true;
    });

    it("should return false for non-certified hash", async function () {
      expect(await fileCertification.isCertified(HASH_1)).to.be.false;
    });

    it("should return false for zero hash", async function () {
      expect(await fileCertification.isCertified(ZERO_HASH)).to.be.false;
    });
  });

  describe("getCertification", function () {
    it("should return certification details for certified hash", async function () {
      const tx = await fileCertification.connect(certifier).certify(HASH_1);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      const cert = await fileCertification.getCertification(HASH_1);
      expect(cert.certifier).to.equal(certifier.address);
      expect(cert.timestamp).to.equal(block!.timestamp);
    });

    it("should return zero values for non-certified hash", async function () {
      const cert = await fileCertification.getCertification(HASH_1);
      expect(cert.certifier).to.equal(ethers.ZeroAddress);
      expect(cert.timestamp).to.equal(0);
    });
  });

  describe("getHashesByCertifier", function () {
    it("should return empty array for address with no certifications", async function () {
      const hashes = await fileCertification.getHashesByCertifier(certifier.address);
      expect(hashes.length).to.equal(0);
    });

    it("should return all hashes for a certifier", async function () {
      await fileCertification.connect(certifier).certify(HASH_1);
      await fileCertification.connect(certifier).certify(HASH_2);

      const hashes = await fileCertification.getHashesByCertifier(certifier.address);
      expect(hashes.length).to.equal(2);
      expect(hashes).to.include(HASH_1);
      expect(hashes).to.include(HASH_2);
    });
  });

  describe("getCertifierHashCount", function () {
    it("should return 0 for address with no certifications", async function () {
      expect(await fileCertification.getCertifierHashCount(certifier.address)).to.equal(0);
    });

    it("should return correct count for certifier", async function () {
      await fileCertification.connect(certifier).certify(HASH_1);
      expect(await fileCertification.getCertifierHashCount(certifier.address)).to.equal(1);

      await fileCertification.connect(certifier).certify(HASH_2);
      expect(await fileCertification.getCertifierHashCount(certifier.address)).to.equal(2);
    });
  });

  describe("certifications mapping (public getter)", function () {
    it("should return certification via public mapping", async function () {
      await fileCertification.connect(certifier).certify(HASH_1);

      const cert = await fileCertification.certifications(HASH_1);
      expect(cert.certifier).to.equal(certifier.address);
      expect(cert.timestamp).to.be.greaterThan(0);
    });
  });

  describe("Gas efficiency", function () {
    it("should certify hash with reasonable gas", async function () {
      const tx = await fileCertification.connect(certifier).certify(HASH_1);
      const receipt = await tx.wait();
      
      // Certification should be gas-efficient (under 150k gas)
      // First certification includes storage slot initialization
      expect(receipt!.gasUsed).to.be.lessThan(150000);
    });
  });

  describe("Edge cases", function () {
    it("should handle maximum bytes32 hash value", async function () {
      const maxHash = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
      await expect(fileCertification.connect(certifier).certify(maxHash))
        .to.emit(fileCertification, "Certified");
      
      expect(await fileCertification.isCertified(maxHash)).to.be.true;
    });

    it("should handle hash with leading zeros", async function () {
      const hashWithLeadingZeros = "0x0000000000000000000000000000000000000000000000000000000000000001";
      await expect(fileCertification.connect(certifier).certify(hashWithLeadingZeros))
        .to.emit(fileCertification, "Certified");
      
      expect(await fileCertification.isCertified(hashWithLeadingZeros)).to.be.true;
    });
  });
});
