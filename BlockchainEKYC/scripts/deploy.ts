import { ethers } from "hardhat";

async function main() {
  console.log("Deploying BlockchainEKYC contracts...");

  // Deploy EKYC contract
  const EKYC = await ethers.getContractFactory("EKYC");
  const ekyc = await EKYC.deploy();
  await ekyc.waitForDeployment();
  console.log(`EKYC deployed to: ${await ekyc.getAddress()}`);

  // Deploy EKYCRegistry contract
  const EKYCRegistry = await ethers.getContractFactory("EKYCRegistry");
  const registry = await EKYCRegistry.deploy();
  await registry.waitForDeployment();
  console.log(`EKYCRegistry deployed to: ${await registry.getAddress()}`);

  // Deploy EKYCConsent contract
  const EKYCConsent = await ethers.getContractFactory("EKYCConsent");
  const consent = await EKYCConsent.deploy();
  await consent.waitForDeployment();
  console.log(`EKYCConsent deployed to: ${await consent.getAddress()}`);

  console.log("All contracts deployed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
