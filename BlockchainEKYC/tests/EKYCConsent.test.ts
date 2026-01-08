import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("EKYCConsent Contract", function () {
  let consent: Contract;
  let user: SignerWithAddress;
  let requester1: SignerWithAddress;
  let requester2: SignerWithAddress;
  let otherAccount: SignerWithAddress;

  beforeEach(async function () {
    [user, requester1, requester2, otherAccount] = await ethers.getSigners();
    
    const EKYCConsent = await ethers.getContractFactory("EKYCConsent");
    consent = await EKYCConsent.deploy();
  });

  describe("Consent Management", function () {
    it("Should allow a user to grant consent", async function () {
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("user KYC data"));
      const validityPeriod = 60 * 60 * 24 * 30; // 30 days
      
      const tx = await consent.connect(user).grantConsent(
        requester1.address,
        dataHash,
        validityPeriod
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs[0];
      const consentId = event.args[0];
      
      const consentDetails = await consent.getConsentDetails(consentId);
      expect(consentDetails[0]).to.equal(requester1.address); // requester
      expect(consentDetails[1]).to.equal(user.address); // user
      expect(consentDetails[2]).to.equal(dataHash); // dataHash
      expect(consentDetails[3]).to.be.gt(0); // expiryTimestamp
      expect(consentDetails[4]).to.be.false; // isRevoked
    });

    it("Should allow a user to revoke consent", async function () {
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("user KYC data"));
      const validityPeriod = 60 * 60 * 24 * 30; // 30 days
      
      const tx = await consent.connect(user).grantConsent(
        requester1.address,
        dataHash,
        validityPeriod
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs[0];
      const consentId = event.args[0];
      
      await consent.connect(user).revokeConsent(consentId);
      
      const consentDetails = await consent.getConsentDetails(consentId);
      expect(consentDetails[4]).to.be.true; // isRevoked
    });

    it("Should not allow non-owner to revoke consent", async function () {
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("user KYC data"));
      const validityPeriod = 60 * 60 * 24 * 30; // 30 days
      
      const tx = await consent.connect(user).grantConsent(
        requester1.address,
        dataHash,
        validityPeriod
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs[0];
      const consentId = event.args[0];
      
      await expect(
        consent.connect(otherAccount).revokeConsent(consentId)
      ).to.be.revertedWith("Not the consent owner");
    });
  });

  describe("Consent Validation", function () {
    let consentId: string;
    
    beforeEach(async function () {
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("user KYC data"));
      const validityPeriod = 60 * 60 * 24 * 30; // 30 days
      
      const tx = await consent.connect(user).grantConsent(
        requester1.address,
        dataHash,
        validityPeriod
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs[0];
      consentId = event.args[0];
    });

    it("Should return true for valid consent", async function () {
      const isValid = await consent.isConsentValid(consentId);
      expect(isValid).to.be.true;
    });

    it("Should return false for revoked consent", async function () {
      await consent.connect(user).revokeConsent(consentId);
      
      const isValid = await consent.isConsentValid(consentId);
      expect(isValid).to.be.false;
    });

    it("Should return false for expired consent", async function () {
      // Create a consent with short validity
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("short-lived consent"));
      const shortValidityPeriod = 60; // 1 minute
      
      const tx = await consent.connect(user).grantConsent(
        requester1.address,
        dataHash,
        shortValidityPeriod
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs[0];
      const shortConsentId = event.args[0];
      
      // Fast forward time past expiry
      await time.increase(120); // 2 minutes
      
      const isValid = await consent.isConsentValid(shortConsentId);
      expect(isValid).to.be.false;
    });
  });

  describe("User Consent Listing", function () {
    beforeEach(async function () {
      // Create multiple consents for the user
      const dataHash1 = ethers.keccak256(ethers.toUtf8Bytes("data1"));
      const dataHash2 = ethers.keccak256(ethers.toUtf8Bytes("data2"));
      const validityPeriod = 60 * 60 * 24 * 30; // 30 days
      
      await consent.connect(user).grantConsent(
        requester1.address,
        dataHash1,
        validityPeriod
      );
      
      await consent.connect(user).grantConsent(
        requester2.address,
        dataHash2,
        validityPeriod
      );
    });

    it("Should list all consents for a user", async function () {
      const userConsents = await consent.getUserConsents(user.address);
      expect(userConsents.length).to.equal(2);
    });

    it("Should return empty array for user with no consents", async function () {
      const otherUserConsents = await consent.getUserConsents(otherAccount.address);
      expect(otherUserConsents.length).to.equal(0);
    });
  });
});
