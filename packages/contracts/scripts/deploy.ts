import { ethers, run, network } from "hardhat";

async function main() {
  console.log("Deploying Claimable contract...");

  const Claimable = await ethers.getContractFactory("Claimable");
  const claimable = await Claimable.deploy();

  await claimable.waitForDeployment();

  const address = await claimable.getAddress();
  console.log(`Claimable deployed to: ${address}`);

  // Wait for a few block confirmations for verification
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await new Promise((resolve) => setTimeout(resolve, 30000));

    console.log("Verifying contract on Etherscan...");
    try {
      await run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully!");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("Contract is already verified!");
      } else {
        console.error("Error verifying contract:", error);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


