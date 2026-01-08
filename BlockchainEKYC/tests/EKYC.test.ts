import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("EKYC Contract", function () {
  let ekyc: Contract;
  let owner: SignerWithAddress;
  let verifier: SignerWithAddress;
  let user: SignerWithAddress;
  let otherAccount: SignerWithAddress;

  // Enum values from contract
  const VerificationStatus = {
    NotVerified: 0,
    Pending: 1,
    Verified: 2,
    Rejected: 3
  };

  beforeEach(async function () {
    [owner, verifier, user, otherAccount] = await ethers.getSigners();
    
    const EKYC = await ethers.getContractFactory("EKYC");
    ekyc = await EKYC.deploy();
    
    // Add verifier role
    const VERIFIER_ROLE = await ekyc.VERIFIER_ROLE();
    await ekyc.grantRole(VERIFIER_ROLE, verifier.address);
  });

  describe("User Registration", function () {
    it("Should register a new user", async function () {
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("user KYC data"));
      await ekyc.connect(user).registerUser(dataHash);
      
      const userData = await ekyc.users(user.address);
      expect(userData.userAddress).to.equal(user.address);
      expect(userData.dataHash).to.equal(dataHash);
      expect(userData.status).to.equal(VerificationStatus.Pending);
    });

    it("Should not allow registering the same user twice", async function () {
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("user KYC data"));
      await ekyc.connect(user).registerUser(dataHash);
      
      await expect(
        ekyc.connect(user).registerUser(dataHash)
      ).to.be.revertedWith("User already registered");
    });

    it("Should allow updating user data", async function () {
      const dataHash1 = ethers.keccak256(ethers.toUtf8Bytes("user KYC data 1"));
      const dataHash2 = ethers.keccak256(ethers.toUtf8Bytes("user KYC data 2"));
      
      await ekyc.connect(user).registerUser(dataHash1);
      await ekyc.connect(user).updateUserData(dataHash2);
      
      const userData = await ekyc.users(user.address);
      expect(userData.dataHash).to.equal(dataHash2);
      expect(userData.status).to.equal(VerificationStatus.Pending);
    });
  });

  describe("User Verification", function () {
    beforeEach(async function () {
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("user KYC data"));
      await ekyc.connect(user).registerUser(dataHash);
    });

    it("Should allow verifier to verify a user", async function () {
      const expiryDuration = 60 * 60 * 24 * 365; // 1 year
      await ekyc.connect(verifier).verifyUser(user.address, VerificationStatus.Verified, expiryDuration);
      
      const userData = await ekyc.users(user.address);
      expect(userData.status).to.equal(VerificationStatus.Verified);
      expect(userData.verifiedBy).to.equal(verifier.address);
      expect(userData.expiryTimestamp).to.be.gt(0);
    });

    it("Should allow verifier to reject a user", async function () {
      await ekyc.connect(verifier).verifyUser(user.address, VerificationStatus.Rejected, 0);
      
      const userData = await ekyc.users(user.address);
      expect(userData.status).to.equal(VerificationStatus.Rejected);
      expect(userData.verifiedBy).to.equal(verifier.address);
      expect(userData.expiryTimestamp).to.equal(0);
    });

    it("Should not allow non-verifier to verify a user", async function () {
      await expect(
        ekyc.connect(otherAccount).verifyUser(user.address, VerificationStatus.Verified, 0)
      ).to.be.reverted;
    });
  });

  describe("Verification Status Checking", function () {
    beforeEach(async function () {
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("user KYC data"));
      await ekyc.connect(user).registerUser(dataHash);
    });

    it("Should correctly report verification status", async function () {
      // Initially user should not be verified
      expect(await ekyc.isVerified(user.address)).to.be.false;
      
      // Verify the user
      const expiryDuration = 60 * 60 * 24 * 365; // 1 year
      await ekyc.connect(verifier).verifyUser(user.address, VerificationStatus.Verified, expiryDuration);
      
      // Now user should be verified
      expect(await ekyc.isVerified(user.address)).to.be.true;
    });

    it("Should return correct user verification details", async function () {
      const expiryDuration = 60 * 60 * 24 * 365; // 1 year
      await ekyc.connect(verifier).verifyUser(user.address, VerificationStatus.Verified, expiryDuration);
      
      const details = await ekyc.getUserVerificationDetails(user.address);
      expect(details[0]).to.equal(VerificationStatus.Verified); // status
      expect(details[1]).to.equal(verifier.address); // verifiedBy
      expect(details[2]).to.be.gt(0); // verificationTimestamp
      expect(details[3]).to.be.gt(0); // expiryTimestamp
    });
  });

  describe("Role Management", function () {
    it("Should allow admin to add a verifier", async function () {
      await ekyc.connect(owner).addVerifier(otherAccount.address);
      
      const VERIFIER_ROLE = await ekyc.VERIFIER_ROLE();
      expect(await ekyc.hasRole(VERIFIER_ROLE, otherAccount.address)).to.be.true;
    });

    it("Should allow admin to remove a verifier", async function () {
      await ekyc.connect(owner).addVerifier(otherAccount.address);
      await ekyc.connect(owner).removeVerifier(otherAccount.address);
      
      const VERIFIER_ROLE = await ekyc.VERIFIER_ROLE();
      expect(await ekyc.hasRole(VERIFIER_ROLE, otherAccount.address)).to.be.false;
    });

    it("Should not allow non-admin to add a verifier", async function () {
      await expect(
        ekyc.connect(otherAccount).addVerifier(otherAccount.address)
      ).to.be.reverted;
    });
  });
});
