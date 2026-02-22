import { ethers, run, network } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import Eth from "@ledgerhq/hw-app-eth";
import { Transaction } from "ethers";

dotenv.config();

const CONTRACTS_TO_DEPLOY = [
  "ExclusiveClaim",
  "FileCertification",
  "CryptoInheritance",
];

const DERIVATION_PATHS = [
  "44'/60'/0'/0/0",
  "44'/60'/0'/0/1",
  "44'/60'/0'/0/2",
  "44'/60'/1'/0/0",
  "44'/60'/2'/0/0",
  "44'/60'/0'",
  "44'/60'/0'/0",
];

async function findDerivationPath(eth: Eth, targetAddress: string): Promise<string | null> {
  const normalizedTarget = targetAddress.toLowerCase();
  console.log(`🔍 Searching for address ${targetAddress} on Ledger...`);

  for (const derivationPath of DERIVATION_PATHS) {
    try {
      const result = await eth.getAddress(derivationPath);
      const foundAddress = result.address.toLowerCase();
      console.log(`   Path ${derivationPath}: ${result.address}`);
      if (foundAddress === normalizedTarget) {
        console.log(`✅ Found matching path: ${derivationPath}`);
        return derivationPath;
      }
    } catch {
      // Some paths may not be valid
    }
  }

  for (let account = 0; account < 10; account++) {
    for (let index = 0; index < 5; index++) {
      const derivationPath = `44'/60'/${account}'/0/${index}`;
      if (DERIVATION_PATHS.includes(derivationPath)) continue;

      try {
        const result = await eth.getAddress(derivationPath);
        if (result.address.toLowerCase() === normalizedTarget) {
          console.log(`✅ Found matching path: ${derivationPath} -> ${result.address}`);
          return derivationPath;
        }
      } catch {
        // Skip invalid paths
      }
    }
  }

  return null;
}

class LedgerSigner {
  private eth: Eth | null = null;
  private transport: any = null;
  private _address: string;
  private provider: any;
  private derivationPath: string;

  constructor(address: string, provider: any, derivationPath: string) {
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

  async signTransaction(transaction: any): Promise<string> {
    await this.connect();
    if (!this.eth) throw new Error("Ledger not connected");

    const baseTx: any = {
      type: transaction.type ?? 2,
      chainId: transaction.chainId,
      nonce: transaction.nonce,
      to: transaction.to,
      data: transaction.data,
      value: transaction.value,
      maxFeePerGas: transaction.maxFeePerGas,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
      gasLimit: transaction.gasLimit,
    };

    const unsignedTransaction = Transaction.from(baseTx).unsignedSerialized.slice(2);

    console.log("📱 Please confirm the transaction on your Ledger...");

    // Provide explicit empty resolution to avoid CDN calls to Ledger servers
    const resolution = { domains: [], erc20Tokens: [], nfts: [], externalPlugin: [], plugin: [] };
    const signature = await this.eth.signTransaction(this.derivationPath, unsignedTransaction, resolution);

    const signedTransaction = Transaction.from({
      ...baseTx,
      signature: {
        r: "0x" + signature.r,
        s: "0x" + signature.s,
        v: parseInt(signature.v, 16),
      },
    });

    return signedTransaction.serialized;
  }

  async sendTransaction(transaction: any): Promise<any> {
    const nonce = await this.provider.getTransactionCount(this._address, "pending");
    const feeData = await this.provider.getFeeData();

    const fullTransaction = {
      ...transaction,
      from: this._address,
      nonce,
      chainId: (await this.provider.getNetwork()).chainId,
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      type: 2,
    };

    if (!fullTransaction.gasLimit) {
      fullTransaction.gasLimit = await this.provider.estimateGas(fullTransaction);
    }

    const signedTransaction = await this.signTransaction(fullTransaction);
    return await this.provider.broadcastTransaction(signedTransaction);
  }
}

async function getDeployer(): Promise<{ deployer: any; ledgerSigner: LedgerSigner | null }> {
  const signers = await ethers.getSigners();

  if (signers.length > 0) {
    return { deployer: signers[0], ledgerSigner: null };
  }

  const ledgerAddress = process.env.LEDGER_ACCOUNT;
  if (!ledgerAddress) {
    throw new Error("No signer available. Set PRIVATE_KEY or LEDGER_ACCOUNT in .env");
  }

  console.log("🔐 Using Ledger hardware wallet...");
  const transport = await TransportNodeHid.open("");
  const eth = new Eth(transport);
  const derivationPath = await findDerivationPath(eth, ledgerAddress);
  await transport.close();

  if (!derivationPath) {
    throw new Error(`Could not find derivation path for address ${ledgerAddress}.`);
  }

  const ledgerSigner = new LedgerSigner(ledgerAddress, ethers.provider, derivationPath);
  await ledgerSigner.connect();
  return { deployer: ledgerSigner, ledgerSigner };
}

async function verifyContract(contractAddress: string, contractName: string): Promise<void> {
  if (network.name === "hardhat" || network.name === "localhost") return;

  console.log("Waiting for block confirmations...");
  await new Promise((resolve) => setTimeout(resolve, 10000));

  console.log(`\n=== Verifying ${contractName} ===`);
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log(`✅ ${contractName} verified on Arbiscan!`);
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log(`✅ ${contractName} is already verified on Arbiscan.`);
    } else {
      console.error(`⚠️  Arbiscan verification failed for ${contractName}:`, error.message);
    }
  }

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
      force: true,
    });
    console.log(`✅ ${contractName} verified on Sourcify!`);
  } catch (error: any) {
    if (error.message.includes("Already Verified") || error.message.includes("already verified")) {
      console.log(`✅ ${contractName} is already verified on Sourcify.`);
    } else {
      console.log(`ℹ️  Sourcify verification skipped for ${contractName}`);
    }
  }
}

async function deployContract(contractName: string, deployer: any): Promise<string> {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`📝 Deploying ${contractName}...`);
  console.log(`${"=".repeat(50)}`);

  const factory = await ethers.getContractFactory(contractName);
  const deployTransaction = await factory.getDeployTransaction();

  const transactionResponse = await deployer.sendTransaction({
    data: deployTransaction.data,
  });

  console.log(`Transaction hash: ${transactionResponse.hash}`);
  console.log("Waiting for confirmation...");

  const receipt = await transactionResponse.wait();
  const contractAddress = receipt.contractAddress;

  console.log(`✅ ${contractName} deployed to: ${contractAddress}`);
  return contractAddress;
}

function updateDeploymentsFile(deployedContracts: Record<string, string>): void {
  const deploymentsPath = path.join(__dirname, "..", "deployments.json");
  let deployments: any = {};

  if (fs.existsSync(deploymentsPath)) {
    deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  }

  const networkName = network.name;
  const chainId = network.config.chainId;
  const today = new Date().toISOString().split("T")[0];

  if (!deployments.networks) deployments.networks = {};

  if (deployedContracts["ExclusiveClaim"]) {
    deployments.networks[networkName] = {
      ...deployments.networks[networkName],
      chainId,
      name: networkName === "arbitrum" ? "Arbitrum One" : "Arbitrum Sepolia",
      contract: deployedContracts["ExclusiveClaim"],
      deployedAt: today,
      blockExplorer: networkName === "arbitrum" ? "https://arbiscan.io" : "https://sepolia.arbiscan.io",
    };
  }

  if (deployedContracts["CryptoInheritance"]) {
    if (!deployments.networks[networkName]) deployments.networks[networkName] = {};
    deployments.networks[networkName].inheritanceContract = deployedContracts["CryptoInheritance"];
  }

  if (deployedContracts["FileCertification"]) {
    if (!deployments.networks[networkName]) deployments.networks[networkName] = {};
    deployments.networks[networkName].certificationContract = deployedContracts["FileCertification"];
  }

  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2) + "\n");
  console.log(`\n📄 Updated deployments.json`);
}

async function main() {
  console.log("🚀 Lockd — Full Contract Deployment");
  console.log(`Network: ${network.name} (Chain ID: ${network.config.chainId})`);
  console.log(`Contracts: ${CONTRACTS_TO_DEPLOY.join(", ")}\n`);

  const { deployer, ledgerSigner } = await getDeployer();
  console.log(`Deployer address: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${ethers.formatEther(balance)} ETH`);

  const deployedContracts: Record<string, string> = {};

  for (const contractName of CONTRACTS_TO_DEPLOY) {
    const contractAddress = await deployContract(contractName, deployer);
    deployedContracts[contractName] = contractAddress;
    await verifyContract(contractAddress, contractName);
  }

  if (ledgerSigner) {
    await ledgerSigner.close();
  }

  updateDeploymentsFile(deployedContracts);

  console.log("\n" + "=".repeat(50));
  console.log("🎉 DEPLOYMENT COMPLETE");
  console.log("=".repeat(50));
  console.log(`Network: ${network.name} (Chain ID: ${network.config.chainId})`);
  for (const [contractName, address] of Object.entries(deployedContracts)) {
    console.log(`${contractName}: ${address}`);
  }

  const explorerBase = network.name === "arbitrum"
    ? "https://arbiscan.io/address/"
    : "https://sepolia.arbiscan.io/address/";

  console.log("\n=== Block Explorer Links ===");
  for (const [contractName, address] of Object.entries(deployedContracts)) {
    console.log(`${contractName}: ${explorerBase}${address}`);
  }

  if (network.name === "arbitrum") {
    console.log("\n=== Update .env.local with ===");
    console.log(`NEXT_PUBLIC_CLAIMABLE_ADDRESS_ARBITRUM=${deployedContracts["ExclusiveClaim"]}`);
    console.log(`NEXT_PUBLIC_INHERITANCE_ADDRESS_ARBITRUM=${deployedContracts["CryptoInheritance"]}`);
    console.log(`NEXT_PUBLIC_CERTIFICATION_ADDRESS_ARBITRUM=${deployedContracts["FileCertification"]}`);
  } else if (network.name === "arbitrumSepolia") {
    console.log("\n=== Update .env.local with ===");
    console.log(`NEXT_PUBLIC_CLAIMABLE_ADDRESS_ARBITRUM_SEPOLIA=${deployedContracts["ExclusiveClaim"]}`);
    console.log(`NEXT_PUBLIC_INHERITANCE_ADDRESS_ARBITRUM_SEPOLIA=${deployedContracts["CryptoInheritance"]}`);
    console.log(`NEXT_PUBLIC_CERTIFICATION_ADDRESS_ARBITRUM_SEPOLIA=${deployedContracts["FileCertification"]}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
