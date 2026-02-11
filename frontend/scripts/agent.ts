import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID } from "../src/app/constants";

// Configuration
// In a real agent, this comes from a secure vault or env var
const PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY; 
const NETWORK = "testnet";

async function main() {
  if (!PRIVATE_KEY) {
    console.error("Please set AGENT_PRIVATE_KEY environment variable.");
    process.exit(1);
  }

  // Initialize Client and Signer
  const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });
  const keypair = Ed25519Keypair.fromSecretKey(PRIVATE_KEY);
  const address = keypair.getPublicKey().toSuiAddress();

  console.log(`🤖 Agent Initialized: ${address}`);
  console.log(`Target Contract: ${PACKAGE_ID}`);

  // Example Automation: Create a "Daily Draw"
  await createDailyDraw(client, keypair);

  // Example Automation: Check for ended draws and settle them
  // await settleEndedDraws(client, keypair);
}

async function createDailyDraw(client: SuiClient, keypair: Ed25519Keypair) {
    console.log("Creating Daily Draw...");
    const tx = new Transaction();
    tx.setGasBudget(100000000);

    const description = `Daily Golden Draw #${new Date().toISOString().split('T')[0]}`;
    const price = 100_000_000n; // 0.1 SUI
    const duration = 24 * 60 * 60 * 1000; // 24 hours
    const endTime = Date.now() + duration;

    tx.moveCall({
        target: `${PACKAGE_ID}::draw::create_pool`,
        arguments: [
            tx.pure.string(description),
            tx.pure.u64(price),
            tx.pure.u64(endTime),
        ],
    });

    const result = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
        options: {
            showEffects: true,
            showObjectChanges: true,
        },
    });

    console.log("Daily Draw Created:", result.digest);
}

// Check for draws that are past end_time and not yet drawn
async function settleEndedDraws(client: SuiClient, keypair: Ed25519Keypair) {
    // 1. Query events to find pools
    // 2. Check on-chain state of each pool
    // 3. If end_time passed and is_drawn == false, call draw_winner
    // This requires more complex querying logic (e.g. indexer), simplifying for demo.
    console.log("Settlement logic implementation placeholder.");
}

main().catch(console.error);
