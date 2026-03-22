/**
 * Test Harness — Generate fake review attestations for Guardian testing.
 *
 * Creates review attestations on Base Sepolia simulating various scenarios:
 * - Legitimate reviews (diverse wallets, varied content)
 * - Sybil cluster (multiple new wallets, same place, short timeframe)
 * - Spam (promotional content)
 * - Organic spike (many reviews, diverse wallets)
 *
 * Usage: npx tsx agent/test-harness.ts [scenario]
 * Scenarios: legitimate, sybil, spam, organic, all
 */

import "dotenv/config";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { Interface, JsonRpcProvider, Wallet } from "ethers";
import { BASE_SEPOLIA_RPC, EAS_CONTRACT, REVIEW_SCHEMA_UID } from "./schema.js";

const REVIEW_SCHEMA =
  "uint8 rating, string text, string placeId, string placeName, bytes32 photoHash, int256 lat, int256 lng, uint8 qualityScore";

const ZERO_BYTES32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const EAS_ABI = [
  "function attest((bytes32 schema, (address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value) data)) external payable returns (bytes32)",
];

interface TestReview {
  rating: number;
  text: string;
  placeId: string;
  placeName: string;
  lat: number;
  lng: number;
  qualityScore: number;
}

function encodeReview(review: TestReview): string {
  const encoder = new SchemaEncoder(REVIEW_SCHEMA);
  return encoder.encodeData([
    { name: "rating", value: review.rating, type: "uint8" },
    { name: "text", value: review.text, type: "string" },
    { name: "placeId", value: review.placeId, type: "string" },
    { name: "placeName", value: review.placeName, type: "string" },
    { name: "photoHash", value: ZERO_BYTES32, type: "bytes32" },
    {
      name: "lat",
      value: BigInt(Math.round(review.lat * 1e6)),
      type: "int256",
    },
    {
      name: "lng",
      value: BigInt(Math.round(review.lng * 1e6)),
      type: "int256",
    },
    { name: "qualityScore", value: review.qualityScore, type: "uint8" },
  ]);
}

async function submitReview(
  wallet: Wallet,
  review: TestReview,
): Promise<string> {
  const encodedData = encodeReview(review);
  const iface = new Interface(EAS_ABI);
  const calldata = iface.encodeFunctionData("attest", [
    {
      schema: REVIEW_SCHEMA_UID,
      data: {
        recipient: "0x0000000000000000000000000000000000000000",
        expirationTime: BigInt(0),
        revocable: false,
        refUID: ZERO_BYTES32,
        data: encodedData,
        value: BigInt(0),
      },
    },
  ]);

  const tx = await wallet.sendTransaction({ to: EAS_CONTRACT, data: calldata });
  const receipt = await tx.wait();
  console.log(
    `  Review submitted: "${review.text.slice(0, 50)}..." TX: ${tx.hash}`,
  );
  return tx.hash;
}

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

export const SCENARIOS = {
  /** Legitimate reviews from established-looking wallets */
  legitimate: (): TestReview[] => [
    {
      rating: 4,
      text: "Great atmosphere and the lavender latte was excellent. Service was a bit slow during the weekend rush but the staff was friendly. Would come back for their pastry selection.",
      placeId: "test-guardian-cafe-001",
      placeName: "Guardian Test Cafe",
      lat: 40.3978,
      lng: -105.0748,
      qualityScore: 72,
    },
    {
      rating: 3,
      text: "Decent coffee but nothing special. The chai was overly sweet for my taste. Nice outdoor patio though, perfect for working on a laptop. WiFi was solid.",
      placeId: "test-guardian-cafe-001",
      placeName: "Guardian Test Cafe",
      lat: 40.3978,
      lng: -105.0748,
      qualityScore: 58,
    },
    {
      rating: 5,
      text: "Best brunch spot in town. The eggs benedict with house-made hollandaise was phenomenal. My partner had the avocado toast and loved it. Reservation recommended on Sundays.",
      placeId: "test-guardian-brunch-001",
      placeName: "Guardian Test Brunch",
      lat: 40.395,
      lng: -105.078,
      qualityScore: 81,
    },
  ],

  /** Sybil attack: multiple new wallets, same place, same timeframe, similar content */
  sybil: (): TestReview[] => [
    {
      rating: 5,
      text: "Amazing place, best food ever! Highly recommend to everyone.",
      placeId: "test-guardian-sybil-target",
      placeName: "Sybil Target Restaurant",
      lat: 40.396,
      lng: -105.076,
      qualityScore: 28,
    },
    {
      rating: 5,
      text: "Incredible experience! Best restaurant in the area, must visit!",
      placeId: "test-guardian-sybil-target",
      placeName: "Sybil Target Restaurant",
      lat: 40.396,
      lng: -105.076,
      qualityScore: 25,
    },
    {
      rating: 5,
      text: "Outstanding food and service! Can't recommend enough, truly the best!",
      placeId: "test-guardian-sybil-target",
      placeName: "Sybil Target Restaurant",
      lat: 40.396,
      lng: -105.076,
      qualityScore: 26,
    },
    {
      rating: 5,
      text: "Wonderful place! The food was absolutely perfect, five stars!",
      placeId: "test-guardian-sybil-target",
      placeName: "Sybil Target Restaurant",
      lat: 40.396,
      lng: -105.076,
      qualityScore: 24,
    },
  ],

  /** Spam: promotional content */
  spam: (): TestReview[] => [
    {
      rating: 5,
      text: "VISIT WWW.BEST-DEALS-2026.COM FOR 50% OFF ALL MEALS!!! USE CODE GHOST50 FOR FREE DELIVERY. BEST RESTAURANT DEALS IN YOUR AREA!!!",
      placeId: "test-guardian-spam-target",
      placeName: "Spam Target Bistro",
      lat: 40.397,
      lng: -105.075,
      qualityScore: 5,
    },
    {
      rating: 1,
      text: "DO NOT EAT HERE go to my restaurant instead at 123 Main St we have better food and cheaper prices call 555-0199 for reservations mention this review for 10% off",
      placeId: "test-guardian-spam-target",
      placeName: "Spam Target Bistro",
      lat: 40.397,
      lng: -105.075,
      qualityScore: 8,
    },
  ],

  /** Organic spike: many reviews from diverse wallets with varied content */
  organic: (): TestReview[] => [
    {
      rating: 5,
      text: "Just discovered this place last night. The hand-pulled noodles are incredible — watched the chef make them fresh. The spicy beef soup base had real depth. Already planning my next visit.",
      placeId: "test-guardian-viral-spot",
      placeName: "Viral Noodle House",
      lat: 40.3985,
      lng: -105.073,
      qualityScore: 78,
    },
    {
      rating: 4,
      text: "Good but crowded. Got the pork dumplings and the dan dan noodles. Dumplings were perfect, noodles were a touch oversalted. The line was 30 min on a Tuesday night. Worth it though.",
      placeId: "test-guardian-viral-spot",
      placeName: "Viral Noodle House",
      lat: 40.3985,
      lng: -105.073,
      qualityScore: 70,
    },
    {
      rating: 3,
      text: "Decent noodles but overhyped. I've had better hand-pulled noodles in Flushing. The ambiance is nice and the staff is attentive. Portions could be bigger for the price.",
      placeId: "test-guardian-viral-spot",
      placeName: "Viral Noodle House",
      lat: 40.3985,
      lng: -105.073,
      qualityScore: 62,
    },
    {
      rating: 5,
      text: "My new favorite spot! The mapo tofu had the perfect Sichuan numbing spice level. The cold appetizer platter is a must-order. Bring cash — card machine was down when I visited.",
      placeId: "test-guardian-viral-spot",
      placeName: "Viral Noodle House",
      lat: 40.3985,
      lng: -105.073,
      qualityScore: 75,
    },
    {
      rating: 4,
      text: "Tried the new noodle place everyone's talking about. The broth is seriously complex — I could taste star anise, Sichuan pepper, and something smoky. Seating is tight, go off-peak.",
      placeId: "test-guardian-viral-spot",
      placeName: "Viral Noodle House",
      lat: 40.3985,
      lng: -105.073,
      qualityScore: 73,
    },
  ],
};

export type ScenarioName = keyof typeof SCENARIOS;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function runScenario(
  scenarioName: ScenarioName,
  provider: JsonRpcProvider,
  fundingWallet: Wallet,
) {
  const reviews = SCENARIOS[scenarioName]();
  console.log(
    `\n=== Scenario: ${scenarioName} (${reviews.length} reviews) ===`,
  );

  for (const review of reviews) {
    // For sybil scenario: each review from a different fresh wallet
    // For others: use the funding wallet directly (simulates established users)
    let wallet: Wallet;
    if (scenarioName === "sybil") {
      // Create a fresh wallet for each sybil review
      const fresh = Wallet.createRandom().connect(provider);
      // Fund it with a tiny amount for gas
      const fundTx = await fundingWallet.sendTransaction({
        to: fresh.address,
        value: BigInt("2000000000000000"), // 0.002 ETH (enough for one attestation)
      });
      await fundTx.wait();
      wallet = fresh;
      console.log(`  New sybil wallet: ${fresh.address}`);
    } else {
      wallet = fundingWallet;
    }

    await submitReview(wallet, review);
  }

  console.log(`=== ${scenarioName} complete ===\n`);
}

async function main() {
  const pk = process.env.GUARDIAN_PRIVATE_KEY;
  if (!pk) {
    console.error("Set GUARDIAN_PRIVATE_KEY in .env");
    process.exit(1);
  }

  const provider = new JsonRpcProvider(BASE_SEPOLIA_RPC);
  const wallet = new Wallet(pk, provider);
  console.log(`Test harness wallet: ${wallet.address}`);

  const scenario = (process.argv[2] || "all") as ScenarioName | "all";

  if (scenario === "all") {
    for (const name of Object.keys(SCENARIOS) as ScenarioName[]) {
      await runScenario(name, provider, wallet);
    }
  } else if (scenario in SCENARIOS) {
    await runScenario(scenario, provider, wallet);
  } else {
    console.error(`Unknown scenario: ${scenario}`);
    console.error(`Available: ${Object.keys(SCENARIOS).join(", ")}, all`);
    process.exit(1);
  }
}

// Only run when executed directly
const isDirectRun =
  process.argv[1]?.endsWith("test-harness.ts") ||
  process.argv[1]?.endsWith("test-harness.js");

if (isDirectRun) {
  main().catch((err) => {
    console.error("Test harness failed:", err);
    process.exit(1);
  });
}
