import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("EKYCRegistry Contract", function () {
  let registry: Contract;
  let owner: SignerWithAddress;
  let provider1: SignerWithAddress;
  let provider2: SignerWithAddress;
  let nonOwner: SignerWithAddress;

  beforeEach(async function () {
    [owner, provider1, provider2, nonOwner] = await ethers.getSigners();
    
    const EKYCRegistry = await ethers.getContractFactory("EKYCRegistry");
    registry = await EKYCRegistry.deploy();
  });

  describe("Provider Registration", function () {
    it("Should register a new provider", async function () {
      await registry.connect(owner).registerProvider(
        provider1.address,
        "Provider 1",
        "https://example.com/provider1"
      );
      
      const providerDetails = await registry.getProviderDetails(provider1.address);
      expect(providerDetails[0]).to.equal("Provider 1"); // name
      expect(providerDetails[1]).to.equal("https://example.com/provider1"); // metadataURI
      expect(providerDetails[2]).to.be.true; // isActive
      expect(providerDetails[3]).to.be.gt(0); // registrationTime
    });

    it("Should not allow non-owner to register a provider", async function () {
      await expect(
        registry.connect(nonOwner).registerProvider(
          provider1.address,
          "Provider 1",
          "https://example.com/provider1"
        )
      ).to.be.reverted;
    });

    it("Should not allow registering with empty name", async function () {
      await expect(
        registry.connect(owner).registerProvider(
          provider1.address,
          "",
          "https://example.com/provider1"
        )
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should not allow registering the same provider twice", async function () {
      await registry.connect(owner).registerProvider(
        provider1.address,
        "Provider 1",
        "https://example.com/provider1"
      );
      
      await expect(
        registry.connect(owner).registerProvider(
          provider1.address,
          "Provider 1 Again",
          "https://example.com/provider1_again"
        )
      ).to.be.revertedWith("Provider already registered");
    });
  });

  describe("Provider Status Management", function () {
    beforeEach(async function () {
      await registry.connect(owner).registerProvider(
        provider1.address,
        "Provider 1",
        "https://example.com/provider1"
      );
    });

    it("Should allow owner to deactivate a provider", async function () {
      await registry.connect(owner).setProviderStatus(provider1.address, false);
      
      const isActive = await registry.isProviderActive(provider1.address);
      expect(isActive).to.be.false;
    });

    it("Should allow owner to reactivate a provider", async function () {
      await registry.connect(owner).setProviderStatus(provider1.address, false);
      await registry.connect(owner).setProviderStatus(provider1.address, true);
      
      const isActive = await registry.isProviderActive(provider1.address);
      expect(isActive).to.be.true;
    });

    it("Should not allow non-owner to change provider status", async function () {
      await expect(
        registry.connect(nonOwner).setProviderStatus(provider1.address, false)
      ).to.be.reverted;
    });
  });

  describe("Provider Metadata Management", function () {
    beforeEach(async function () {
      await registry.connect(owner).registerProvider(
        provider1.address,
        "Provider 1",
        "https://example.com/provider1"
      );
    });

    it("Should allow provider to update their metadata", async function () {
      await registry.connect(provider1).updateProviderMetadata(
        provider1.address,
        "https://example.com/provider1_updated"
      );
      
      const providerDetails = await registry.getProviderDetails(provider1.address);
      expect(providerDetails[1]).to.equal("https://example.com/provider1_updated");
    });

    it("Should allow owner to update provider metadata", async function () {
      await registry.connect(owner).updateProviderMetadata(
        provider1.address,
        "https://example.com/provider1_admin_updated"
      );
      
      const providerDetails = await registry.getProviderDetails(provider1.address);
      expect(providerDetails[1]).to.equal("https://example.com/provider1_admin_updated");
    });

    it("Should not allow unauthorized users to update provider metadata", async function () {
      await expect(
        registry.connect(nonOwner).updateProviderMetadata(
          provider1.address,
          "https://example.com/unauthorized"
        )
      ).to.be.revertedWith("Unauthorized");
    });
  });

  describe("Provider Listing", function () {
    beforeEach(async function () {
      await registry.connect(owner).registerProvider(
        provider1.address,
        "Provider 1",
        "https://example.com/provider1"
      );
      await registry.connect(owner).registerProvider(
        provider2.address,
        "Provider 2",
        "https://example.com/provider2"
      );
    });

    it("Should return the correct provider count", async function () {
      const count = await registry.getProviderCount();
      expect(count).to.equal(2);
    });

    it("Should return all provider addresses", async function () {
      const providers = await registry.getAllProviders();
      expect(providers.length).to.equal(2);
      expect(providers).to.include(provider1.address);
      expect(providers).to.include(provider2.address);
    });
  });
});
