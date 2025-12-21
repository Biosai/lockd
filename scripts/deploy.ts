import { ethers, run, network } from "hardhat";

async function main() {
  console.log("Deploying ExclusiveClaim contract...");
  console.log(`Network: ${network.name}`);

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${ethers.formatEther(balance)} ETH`);

  // Deploy the contract
  const ExclusiveClaim = await ethers.getContractFactory("ExclusiveClaim");
  const exclusiveClaim = await ExclusiveClaim.deploy();

  await exclusiveClaim.waitForDeployment();

  const contractAddress = await exclusiveClaim.getAddress();
  console.log(`ExclusiveClaim deployed to: ${contractAddress}`);

  // Wait for a few block confirmations before verifying
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await exclusiveClaim.deploymentTransaction()?.wait(5);

    // Verify on Arbiscan
    console.log("\n=== Contract Verification ===");
    console.log("Verifying contract on Arbiscan...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Arbiscan!");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract is already verified on Arbiscan.");
      } else {
        console.error("⚠️  Arbiscan verification failed:", error.message);
        console.log("   Make sure ARBISCAN_API_KEY is set in your .env file");
      }
    }

    // Also verify on Sourcify (no API key needed)
    console.log("\nVerifying contract on Sourcify...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
        force: true,
      });
      console.log("✅ Contract verified on Sourcify!");
    } catch (error: any) {
      if (error.message.includes("Already Verified") || error.message.includes("already verified")) {
        console.log("✅ Contract is already verified on Sourcify.");
      } else {
        // Sourcify verification is optional, don't fail
        console.log("ℹ️  Sourcify verification skipped (may already be verified via Arbiscan)");
      }
    }
  }

  // Log useful information
  console.log("\n=== Deployment Summary ===");
  console.log(`Contract: ExclusiveClaim`);
  console.log(`Address: ${contractAddress}`);
  console.log(`Network: ${network.name}`);
  console.log(`Chain ID: ${network.config.chainId}`);
  
  // Log common token addresses for convenience
  if (network.name === "arbitrum") {
    console.log("\n=== Common Token Addresses on Arbitrum ===");
    console.log("USDC: 0xaf88d065e77c8cC2239327C5EDb3A432268e5831");
    console.log("USDT: 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9");
    console.log("WETH: 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1");
    console.log("ARB: 0x912CE59144191C1204E64559FE8253a0e49E6548");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

