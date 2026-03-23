/**
 * Review Guardian — Autonomous Review Verification Agent
 *
 * The agent IS the LLM. It reasons natively about review patterns,
 * decides what to investigate, and takes on-chain actions.
 *
 * Usage: npx tsx agent/guardian.ts
 */

import "dotenv/config";
import { JsonRpcProvider, Wallet } from "ethers";
import { processRewards } from "./contracts/RewardDistributor.js";
import { GUARDIAN_MODEL, GUARDIAN_SYSTEM_PROMPT } from "./guidelines.js";
import { BASE_SEPOLIA_RPC, type OnChainReview } from "./schema.js";
import {
  type PublishResult,
  publishSybilAlert,
  publishVerification,
  queryExistingVerification,
  queryNewReviews,
  queryPlaceReviews,
  queryWalletHistory,
  TOOL_DEFINITIONS,
} from "./tools.js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const VENICE_URL = "https://api.venice.ai/api/v1/chat/completions";
const POLL_INTERVAL_MS = 14_400_000; // 4 hours between runs
const LOOKBACK_SECONDS = 604800; // On first run, look back 7 days

// ---------------------------------------------------------------------------
// Venice API helper
// ---------------------------------------------------------------------------

interface VeniceMessage {
  role: "system" | "user" | "assistant" | "tool";
  content?: string;
  tool_calls?: VeniceToolCall[];
  tool_call_id?: string;
}

interface VeniceToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

interface VeniceResponse {
  choices: {
    message: {
      role: string;
      content: string | null;
      tool_calls?: VeniceToolCall[];
    };
    finish_reason: string;
  }[];
}

async function veniceChat(
  apiKey: string,
  messages: VeniceMessage[],
  tools: typeof TOOL_DEFINITIONS,
): Promise<VeniceResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1800000); // 30 min

  try {
    const response = await fetch(VENICE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Connection: "close",
      },
      body: JSON.stringify({
        model: GUARDIAN_MODEL,
        messages,
        tools,
        temperature: 0.1,
        max_tokens: 4096,
      }),
      signal: controller.signal,
      keepalive: false,
    } as RequestInit);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Venice API error: ${response.status} ${text}`);
    }

    return (await response.json()) as VeniceResponse;
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// Tool executor
// ---------------------------------------------------------------------------

async function executeTool(
  name: string,
  input: Record<string, unknown>,
  wallet: Wallet,
): Promise<string> {
  switch (name) {
    case "queryNewReviews": {
      const reviews = await queryNewReviews(input.sinceTimestamp as number);
      return JSON.stringify(reviews, null, 2);
    }
    case "queryWalletHistory": {
      const reviews = await queryWalletHistory(input.walletAddress as string);
      return JSON.stringify(reviews, null, 2);
    }
    case "queryPlaceReviews": {
      const reviews = await queryPlaceReviews(input.placeId as string);
      return JSON.stringify(reviews, null, 2);
    }
    case "publishVerification": {
      // Check for existing verification first (dedup)
      const exists = await queryExistingVerification(
        input.reviewUID as string,
        wallet.address,
      );
      if (exists) {
        return JSON.stringify({
          skipped: true,
          reason: "Verification already exists for this review",
        });
      }
      const result = await publishVerification(
        wallet,
        input.reviewUID as string,
        input.verdict as "legitimate" | "suspicious" | "sybil" | "spam",
        input.confidence as number,
        input.reasoningSummary as string,
      );
      return JSON.stringify(result);
    }
    case "publishSybilAlert": {
      const results = await publishSybilAlert(
        wallet,
        input.reviewUIDs as string[],
        input.confidence as number,
        input.reasoningSummary as string,
      );
      return JSON.stringify(results);
    }
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

interface LogEntry {
  timestamp: string;
  type:
    | "cycle_start"
    | "reasoning"
    | "tool_call"
    | "tool_result"
    | "verdict"
    | "error"
    | "cycle_end";
  detail: Record<string, unknown>;
}

const runLog: LogEntry[] = [];

function log(type: LogEntry["type"], detail: Record<string, unknown>) {
  const entry: LogEntry = { timestamp: new Date().toISOString(), type, detail };
  runLog.push(entry);

  // Also print to console
  switch (type) {
    case "cycle_start":
      console.log(`\n=== Guardian Cycle ${detail.since} ===`);
      break;
    case "reasoning":
      console.log(`\n[REASONING] ${detail.text}`);
      break;
    case "tool_call":
      console.log(
        `  [TOOL] ${detail.name}(${JSON.stringify(detail.args).slice(0, 120)})`,
      );
      break;
    case "tool_result":
      console.log(
        `  [RESULT] ${detail.name}: ${String(detail.summary).slice(0, 150)}`,
      );
      break;
    case "verdict":
      console.log(
        `  [VERDICT] ${detail.verdict} (${detail.confidence}%) → review ${String(detail.reviewUID).slice(0, 12)}... | ${detail.reason}`,
      );
      break;
    case "error":
      console.error(`  [ERROR] ${detail.message}`);
      break;
    case "cycle_end":
      console.log(
        `\n=== Cycle complete: ${detail.verdicts} verdicts published, ${detail.iterations} iterations ===\n`,
      );
      break;
  }
}

export function getRunLog(): LogEntry[] {
  return [...runLog];
}

// ---------------------------------------------------------------------------
// Agent loop
// ---------------------------------------------------------------------------

export async function runGuardianCycle(
  apiKey: string,
  wallet: Wallet,
  sinceTimestamp: number,
): Promise<{ results: PublishResult[]; lastTimestamp: number }> {
  const results: PublishResult[] = [];
  runLog.length = 0; // Reset log for this cycle

  const userMessage = `It is now ${new Date().toISOString()}. Check for new reviews since timestamp ${sinceTimestamp} (${new Date(sinceTimestamp * 1000).toISOString()}).

Investigate all new reviews. For each review or group of reviews, decide whether to verify, flag, or investigate further. Use your tools to gather context and publish verdicts.

Your wallet address is ${wallet.address} — skip any attestations from this address (those are your own prior verdicts).`;

  log("cycle_start", {
    since: new Date(sinceTimestamp * 1000).toISOString(),
    wallet: wallet.address,
  });

  const messages: VeniceMessage[] = [
    { role: "system", content: GUARDIAN_SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ];

  let maxIterations = 20;
  let iterationCount = 0;
  while (maxIterations-- > 0) {
    iterationCount++;
    const response = await veniceChat(apiKey, messages, TOOL_DEFINITIONS);

    const choice = response.choices[0];
    if (!choice) break;

    const assistantMessage = choice.message;
    const toolCalls = assistantMessage.tool_calls || [];

    // Log reasoning
    if (assistantMessage.content?.trim()) {
      log("reasoning", {
        text: assistantMessage.content,
        iteration: iterationCount,
      });
    }

    // If no tool calls, the agent is done
    if (toolCalls.length === 0) {
      log("reasoning", {
        text: "(no more tool calls — cycle complete)",
        iteration: iterationCount,
      });
      break;
    }

    // Add assistant message with tool_calls to conversation
    messages.push({
      role: "assistant",
      content: assistantMessage.content || undefined,
      tool_calls: toolCalls,
    });

    // Execute each tool call and add results as tool messages
    for (const toolCall of toolCalls) {
      const fnName = toolCall.function.name;
      let fnArgs: Record<string, unknown>;
      try {
        fnArgs = JSON.parse(toolCall.function.arguments);
      } catch (err) {
        log("error", {
          message: `Failed to parse tool args for ${fnName}`,
          error: String(err),
        });
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: `Error: Invalid JSON arguments`,
        });
        continue;
      }

      log("tool_call", {
        name: fnName,
        args: fnArgs,
        iteration: iterationCount,
      });

      try {
        const result = await executeTool(fnName, fnArgs, wallet);

        // Summarize result for logging
        let resultSummary: string;
        try {
          const parsed = JSON.parse(result);
          if (Array.isArray(parsed)) {
            resultSummary = `${parsed.length} items returned`;
          } else if (parsed.txHash) {
            resultSummary = `TX: ${parsed.txHash.slice(0, 16)}... verdict=${parsed.verdict} confidence=${parsed.confidence}%`;
          } else if (parsed.skipped) {
            resultSummary = `Skipped: ${parsed.reason}`;
          } else {
            resultSummary = `${JSON.stringify(parsed).slice(0, 100)}`;
          }
        } catch {
          resultSummary = result.slice(0, 100);
        }
        log("tool_result", {
          name: fnName,
          summary: resultSummary,
          iteration: iterationCount,
        });

        // Track publish results and log verdicts
        if (
          fnName === "publishVerification" ||
          fnName === "publishSybilAlert"
        ) {
          try {
            const parsed = JSON.parse(result);
            if (Array.isArray(parsed)) {
              for (const p of parsed) {
                if (p.txHash) {
                  log("verdict", {
                    reviewUID: p.reviewUID,
                    verdict: p.verdict,
                    confidence: p.confidence,
                    reason: fnArgs.reasoningSummary,
                  });
                }
              }
              results.push(...parsed);
            } else if (parsed.txHash) {
              log("verdict", {
                reviewUID: parsed.reviewUID,
                verdict: parsed.verdict,
                confidence: parsed.confidence,
                reason: fnArgs.reasoningSummary,
              });
              results.push(parsed);
            }
          } catch {
            // Not a publish result, ignore
          }
        }

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      } catch (err) {
        log("error", {
          message: `Tool error (${fnName})`,
          error: err instanceof Error ? err.message : String(err),
        });
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: `Error: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }
  }

  if (maxIterations <= 0) {
    log("error", { message: "Hit max iteration limit" });
  }

  log("cycle_end", { verdicts: results.length, iterations: iterationCount });

  // Write log to repo root as agent_log.json (DevSpot compatibility)
  const fs = await import("node:fs");
  const path = await import("node:path");
  const repoRoot = path.resolve(new URL(".", import.meta.url).pathname, "..");
  const logPath = path.join(repoRoot, "agent_log.json");
  fs.writeFileSync(logPath, JSON.stringify(runLog, null, 2));
  console.log(`Log written to agent_log.json`);

  return { results, lastTimestamp: Math.floor(Date.now() / 1000) };
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

async function main() {
  const pk = process.env.GUARDIAN_PRIVATE_KEY;
  if (!pk) {
    console.error("Set GUARDIAN_PRIVATE_KEY in .env");
    process.exit(1);
  }

  const veniceKey = process.env.VENICE_API_KEY;
  if (!veniceKey) {
    console.error("Set VENICE_API_KEY in .env");
    process.exit(1);
  }

  const provider = new JsonRpcProvider(BASE_SEPOLIA_RPC);
  const wallet = new Wallet(pk, provider);

  console.log(`Review Guardian started`);
  console.log(`Wallet: ${wallet.address}`);
  console.log(`Model: ${GUARDIAN_MODEL}`);
  console.log(`Poll interval: ${POLL_INTERVAL_MS / 1000}s`);

  let lastTimestamp = Math.floor(Date.now() / 1000) - LOOKBACK_SECONDS;

  // Run once if --once flag is passed (for testing / demo)
  const runOnce = process.argv.includes("--once");

  const tokenAddress = process.env.GHOST_TOKEN_ADDRESS;
  if (tokenAddress) {
    console.log(`GHOST token: ${tokenAddress}`);
  } else {
    console.log("GHOST_TOKEN_ADDRESS not set — reward distribution disabled");
  }

  while (true) {
    try {
      const result = await runGuardianCycle(veniceKey, wallet, lastTimestamp);
      lastTimestamp = result.lastTimestamp;

      // Distribute rewards for legitimate verdicts
      if (tokenAddress && result.results.length > 0) {
        const legitimateReviews = result.results
          .filter((r) => r.verdict === "legitimate")
          .map((r) => ({
            uid: r.reviewUID,
            attester: "", // Will be looked up from EAS
            qualityScore: r.confidence, // Use confidence as proxy for quality
          }));

        if (legitimateReviews.length > 0) {
          // Fetch attester addresses from EAS for reward distribution
          const reviewsWithAttesters = [];
          for (const rev of legitimateReviews) {
            const reviews = await queryNewReviews(0);
            const match = reviews.find((r) => r.uid === rev.uid);
            if (match) {
              reviewsWithAttesters.push({
                uid: rev.uid,
                attester: match.attester,
                qualityScore: match.qualityScore,
              });
            }
          }

          if (reviewsWithAttesters.length > 0) {
            console.log(
              `\n--- Distributing GHOST rewards for ${reviewsWithAttesters.length} verified reviews ---`,
            );
            const rewards = await processRewards(
              wallet,
              tokenAddress,
              wallet.address,
              reviewsWithAttesters,
            );
            console.log(
              `Rewards: ${rewards.distributed} distributed (${rewards.totalGhost.toFixed(2)} GHOST total), ${rewards.skipped} skipped`,
            );
          }
        }
      }
    } catch (err) {
      console.error("Guardian cycle error:", err);
    }

    if (runOnce) {
      console.log("Single run complete (--once flag). Exiting.");
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

// Only run main() when executed directly (not imported by tests)
const isDirectRun =
  process.argv[1]?.endsWith("guardian.ts") ||
  process.argv[1]?.endsWith("guardian.js");

if (isDirectRun) {
  main().catch((err) => {
    console.error("Guardian fatal error:", err);
    process.exit(1);
  });
}
