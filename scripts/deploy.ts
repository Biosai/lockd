import { ethers, run, network } from "hardhat";
import * as dotenv from "dotenv";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import Eth from "@ledgerhq/hw-app-eth";
import { Transaction } from "ethers";

dotenv.config();

// Create a Ledger signer that works with ethers v6
class LedgerSigner {
  private eth: Eth | null = null;
  private transport: any = null;
  private _address: string;
  private provider: any;
  private derivationPath: string;

  constructor(address: string, provider: any, derivationPath = "44'/60'/0'/0/0") {
    this._address = address;
    this.provider = provider;
    this.derivationPath = derivationPath;
  }

  get address() {
    return this._address;
  }

  async connect() {
    if (!this.transport) {
      this.transport = await TransportNodeHid.open("");
      this.eth = new Eth(this.transport);
    }
    return this;
  }

  async close() {
    if (this.transport) {
      await this.transport.close();
      this.transport = null;
      this.eth = null;
    }
  }

  async getAddress() {
    return this._address;
  }

  async signTransaction(tx: any): Promise<string> {
    await this.connect();
    if (!this.eth) throw new Error("Ledger not connected");

    // Build transaction
    const baseTx: any = {
      type: tx.type ?? 2,
      chainId: tx.chainId,
      nonce: tx.nonce,
      to: tx.to,
      data: tx.data,
      value: tx.value,
      maxFeePerGas: tx.maxFeePerGas,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
      gasLimit: tx.gasLimit,
    };

    // Serialize unsigned transaction
    const unsignedTx = Transaction.from(baseTx).unsignedSerialized.slice(2);

    console.log("📱 Please confirm the transaction on your Ledger...");
    
    // Sign with Ledger
    const sig = await this.eth.signTransaction(this.derivationPath, unsignedTx, null);

    // Add signature to transaction
    const signedTx = Transaction.from({
      ...baseTx,
      signature: {
        r: "0x" + sig.r,
        s: "0x" + sig.s,
        v: parseInt(sig.v, 16),
      },
    });

    return signedTx.serialized;
  }

  async sendTransaction(tx: any): Promise<any> {
    // Get nonce and fee data
    const nonce = await this.provider.getTransactionCount(this._address, "pending");
    const feeData = await this.provider.getFeeData();

    const fullTx = {
      ...tx,
      from: this._address,
      nonce,
      chainId: (await this.provider.getNetwork()).chainId,
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      type: 2,
    };

    // Estimate gas if not provided
    if (!fullTx.gasLimit) {
      fullTx.gasLimit = await this.provider.estimateGas(fullTx);
    }

    const signedTx = await this.signTransaction(fullTx);
    const response = await this.provider.broadcastTransaction(signedTx);
    
    return response;
  }
}

async function main() {
  console.log("Deploying ExclusiveClaim contract...");
  console.log(`Network: ${network.name}`);

  // Get deployer - works with both private key and Ledger
  const signers = await ethers.getSigners();
  let deployer: any;
  let ledgerSigner: LedgerSigner | null = null;

  if (signers.length > 0) {
    deployer = signers[0];
  } else {
    // For Ledger: create custom signer
    const ledgerAddress = process.env.LEDGER_ACCOUNT;
    if (!ledgerAddress) {
      throw new Error("No signer available. Set PRIVATE_KEY or LEDGER_ACCOUNT in .env");
    }
    console.log("🔐 Using Ledger hardware wallet...");
    ledgerSigner = new LedgerSigner(ledgerAddress, ethers.provider);
    await ledgerSigner.connect();
    deployer = ledgerSigner;
  }

  console.log(`Deployer address: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${ethers.formatEther(balance)} ETH`);

  // Get contract bytecode
  const ExclusiveClaim = await ethers.getContractFactory("ExclusiveClaim");
  const deployTx = await ExclusiveClaim.getDeployTransaction();

  console.log("\n📝 Deploying contract...");
  
  // Send deployment transaction
  const txResponse = await deployer.sendTransaction({
    data: deployTx.data,
  });

  console.log(`Transaction hash: ${txResponse.hash}`);
  console.log("Waiting for confirmation...");

  const receipt = await txResponse.wait();
  const contractAddress = receipt.contractAddress;

  console.log(`\n✅ ExclusiveClaim deployed to: ${contractAddress}`);

  // Close Ledger connection
  if (ledgerSigner) {
    await ledgerSigner.close();
  }

  // Wait for a few block confirmations before verifying
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for additional block confirmations...");
    // Wait for 4 more blocks (we already waited for 1)
    await new Promise((resolve) => setTimeout(resolve, 10000));

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
      if (
        error.message.includes("Already Verified") ||
        error.message.includes("already verified")
      ) {
        console.log("✅ Contract is already verified on Sourcify.");
      } else {
        // Sourcify verification is optional, don't fail
        console.log(
          "ℹ️  Sourcify verification skipped (may already be verified via Arbiscan)"
        );
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
