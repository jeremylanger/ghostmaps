import { ethers } from "ethers";

const wallet = ethers.Wallet.createRandom();

console.log("=== Review Guardian Wallet ===\n");
console.log(`Address:     ${wallet.address}`);
console.log(`Private Key: ${wallet.privateKey}\n`);
console.log("Next steps:");
console.log("1. Fund this wallet with Base Sepolia ETH:");
console.log("   https://www.coinbase.com/faucets/base-ethereum-goerli-faucet");
console.log("2. Add to your .env file:");
console.log(`   GUARDIAN_PRIVATE_KEY=${wallet.privateKey}`);
console.log(`   GUARDIAN_ADDRESS=${wallet.address}`);
