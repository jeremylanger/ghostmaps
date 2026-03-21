import type { Place } from "./types";

const VENICE_PARSE_MODEL = "mistral-small-3-2-24b-instruct";
const VENICE_RANK_MODEL = "mistral-small-3-2-24b-instruct";
const VENICE_BRIEFING_MODEL = "mistral-small-3-2-24b-instruct";
const VENICE_QUALITY_MODEL = "mistral-small-3-2-24b-instruct";
const VENICE_URL = "https://api.venice.ai/api/v1/chat/completions";

async function veniceChat(
  messages: { role: string; content: string }[],
  model: string,
  options: { temperature?: number } = {},
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(VENICE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VENICE_API_KEY}`,
        "Content-Type": "application/json",
        Connection: "close",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.1,
        max_tokens: 4000,
      }),
      signal: controller.signal,
      keepalive: false,
    } as RequestInit);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Venice API error: ${response.status} ${text}`);
    }

    const data = await response.json();
    const msg = data.choices?.[0]?.message;
    const content = msg?.content || "";
    const reasoning = msg?.reasoning_content || "";
    // Venice sometimes puts structured output in reasoning_content when content is empty
    return content || reasoning;
  } finally {
    clearTimeout(timeout);
  }
}

async function* veniceChatStream(
  messages: { role: string; content: string }[],
  model: string,
  options: { temperature?: number } = {},
): AsyncGenerator<string> {
  const response = await fetch(VENICE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VENICE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.3,
      stream: true,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Venice API error: ${response.status} ${text}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ") && line !== "data: [DONE]") {
        try {
          const json = JSON.parse(line.slice(6));
          const content = json.choices?.[0]?.delta?.content || "";
          if (content) yield content;
        } catch (err) {
          console.error("Venice stream: malformed chunk:", err);
        }
      }
    }
  }
}

interface ParsedQuery {
  query_type: "category" | "name" | "address";
  categories: string[];
  name_query: string | null;
  address_query: string | null;
  time_filter: string | null;
  attributes: string[];
  location_hint: string | null;
  radius: number | null;
}

const PARSE_SYSTEM_PROMPT = `You are a search query parser for a maps app. Extract structured search intent from natural language queries.

Return ONLY valid JSON (no markdown, no code blocks) with these fields:
- query_type: "category" (searching for a type of place), "name" (searching for a specific place by name), or "address" (searching for a street address or coordinates)
- categories: array of Google Places type strings (use snake_case like: restaurant, coffee_shop, cafe, bar, pub, brewery, gym, park, museum, hotel, gas_station, pharmacy, grocery_store, bakery, pizza_restaurant, mexican_restaurant, italian_restaurant, indian_restaurant, thai_restaurant, chinese_restaurant, japanese_restaurant, korean_restaurant, vietnamese_restaurant, sushi_restaurant, ramen_restaurant, burger_restaurant, french_restaurant, american_restaurant, fast_food_restaurant, fine_dining_restaurant, seafood_restaurant, steakhouse, ice_cream_shop, bookstore, hair_salon, dentist, hospital, bank, parking, library, nightclub, movie_theater, spa, clothing_store, electronics_store, supermarket, shopping_mall, tea_house, juice_shop, sandwich_shop, deli). Only relevant for query_type "category".
- name_query: the specific place name being searched for (only when query_type is "name"), or null
- address_query: the address or coordinates being searched for (only when query_type is "address"), or null
- time_filter: "open_now", "late_night", "morning", "lunch", or null
- attributes: relevant attributes like ["outdoor_seating", "wifi", "delivery", "takeout", "pet_friendly", "live_music", "happy_hour", "vegan_options"]
- location_hint: a neighborhood or area name if mentioned, or null
- radius: search radius in meters if implied (e.g. "nearby"/"near me" = 5000, "walking distance" = 1500), or null

Examples:
"best coffee near me" → {"query_type":"category","categories":["coffee_shop","cafe"],"name_query":null,"address_query":null,"time_filter":null,"attributes":[],"location_hint":null,"radius":null}
"late night tacos with outdoor seating" → {"query_type":"category","categories":["mexican_restaurant"],"name_query":null,"address_query":null,"time_filter":"late_night","attributes":["outdoor_seating"],"location_hint":null,"radius":null}
"Verve Coffee Roasters" → {"query_type":"name","categories":[],"name_query":"Verve Coffee Roasters","address_query":null,"time_filter":null,"attributes":[],"location_hint":null,"radius":null}
"Target on Sepulveda" → {"query_type":"name","categories":[],"name_query":"Target on Sepulveda","address_query":null,"time_filter":null,"attributes":[],"location_hint":"sepulveda","radius":null}
"123 Main St, Los Angeles" → {"query_type":"address","categories":[],"name_query":null,"address_query":"123 Main St, Los Angeles","time_filter":null,"attributes":[],"location_hint":null,"radius":null}
"34.0522, -118.2437" → {"query_type":"address","categories":[],"name_query":null,"address_query":"34.0522, -118.2437","time_filter":null,"attributes":[],"location_hint":null,"radius":null}
"123" → {"query_type":"address","categories":[],"name_query":null,"address_query":"123","time_filter":null,"attributes":[],"location_hint":null,"radius":null}
"123 maple" → {"query_type":"address","categories":[],"name_query":null,"address_query":"123 maple","time_filter":null,"attributes":[],"location_hint":null,"radius":null}

IMPORTANT: If the query starts with a number and looks like it could be a street address (even partial, like "123" or "123 maple"), classify it as "address" — not "category" or "name".`;

export async function parseQuery(query: string): Promise<ParsedQuery> {
  try {
    const content = await veniceChat(
      [
        { role: "system", content: PARSE_SYSTEM_PROMPT },
        { role: "user", content: query },
      ],
      VENICE_PARSE_MODEL,
      { temperature: 0.1 },
    );

    // Extract JSON from possible markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [
      null,
      content,
    ];
    const parsed = JSON.parse(jsonMatch[1]!.trim());

    return {
      query_type: parsed.query_type || "category",
      categories: parsed.categories || ["restaurant"],
      name_query: parsed.name_query || null,
      address_query: parsed.address_query || null,
      time_filter: parsed.time_filter || null,
      attributes: parsed.attributes || [],
      location_hint: parsed.location_hint || null,
      radius: parsed.radius || null,
    };
  } catch (err) {
    console.error("Venice parse error:", err);
    return {
      query_type: "category" as const,
      categories: [query.toLowerCase().replace(/\s+/g, "_")],
      name_query: null,
      address_query: null,
      time_filter: null,
      attributes: [],
      location_hint: null,
      radius: null,
    };
  }
}

const RANK_SYSTEM_PROMPT = `You are a local guide AI for Ghost Maps, a private maps app. Pick the BEST place and explain why. For others, give a brief "why not" (max 5 words each).

Return ONLY valid JSON (no markdown, no code blocks):
{
  "top_pick": {"id": "the place id", "reason": "1-2 sentence recommendation"},
  "alternatives": [{"id": "place id", "why_not": "max 5 words"}]
}

Be concise and opinionated. Prefer places with higher confidence scores, real addresses, and phone numbers.`;

export async function rankResults(
  query: string,
  places: Place[],
  attributes: string[],
): Promise<{
  topPick: string | null;
  topPickReason: string;
  alternatives: { id: string; whyNot: string }[];
}> {
  if (places.length === 0) {
    return {
      topPick: null,
      topPickReason: "",
      alternatives: [],
    };
  }

  if (places.length === 1) {
    return {
      topPick: places[0].id,
      topPickReason: `${places[0].name} is your best option nearby.`,
      alternatives: [],
    };
  }

  try {
    const placeSummaries = places.slice(0, 5).map((p) => ({
      id: p.id,
      name: p.name,
      address: p.address || "unknown",
      confidence: Math.round(p.confidence * 100),
    }));

    const userContext =
      attributes.length > 0 ? `\nUser wants: ${attributes.join(", ")}` : "";

    const content = await veniceChat(
      [
        { role: "system", content: RANK_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Query: "${query}"${userContext}\n\nResults:\n${JSON.stringify(placeSummaries)}`,
        },
      ],
      VENICE_RANK_MODEL,
      { temperature: 0.3 },
    );

    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [
      null,
      content,
    ];
    const parsed = JSON.parse(jsonMatch[1]!.trim());

    return {
      topPick: parsed.top_pick?.id || places[0].id,
      topPickReason: parsed.top_pick?.reason || "",
      alternatives: (parsed.alternatives || []).map(
        (a: { id: string; why_not: string }) => ({
          id: a.id,
          whyNot: a.why_not,
        }),
      ),
    };
  } catch (err) {
    console.error("Venice rank error:", err);
    return {
      topPick: places[0].id,
      topPickReason: "",
      alternatives: places.slice(1, 6).map((p) => ({ id: p.id, whyNot: "" })),
    };
  }
}

const BRIEFING_SYSTEM_PROMPT = `You are a concise local guide for Ghost Maps. Given a place's data, write a 2-3 sentence intelligence briefing that helps someone decide whether to visit.

Include: what makes it notable, vibe/atmosphere hints from the category and name, and any practical info (hours, cuisine type). Be opinionated but fair. If data is sparse, say what you can and note what's unknown.

Return plain text only — no JSON, no markdown.`;

export interface PlaceBriefingData {
  name: string;
  category: string;
  address: string;
  phone: string;
  website: string;
  brand: string;
  openingHours: string[] | null;
  isOpen: boolean | null;
  foodTypes: string[];
}

// --- Review Quality Scoring ---

const QUALITY_SYSTEM_PROMPT = `You are a review quality scorer and content moderator for Ghost Maps. You have TWO jobs:
1. Score the review on specificity and authenticity.
2. Flag harmful or policy-violating content. THIS IS CRITICAL — you must catch threats, hate speech, spam, and other violations.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "score": <0-100>,
  "label": "generic" | "decent" | "detailed" | "exceptional",
  "flags": [],
  "reason": "1 sentence explanation"
}

Scoring guide:
- 0-20 (generic): "Great place!" / "5 stars" / no useful info
- 21-50 (decent): mentions what they ordered or a specific detail
- 51-80 (detailed): specific items, prices, experiences, comparisons
- 81-100 (exceptional): detailed with photos, insider tips, specific staff mentions, unique observations

CONTENT MODERATION — you MUST flag violations. Check EVERY review for these. When in doubt, flag it.

BLOCKING flags (review will be rejected — include ALL that apply):
- "sentiment_mismatch" — text sentiment contradicts the numeric rating (e.g. "terrible food" with 5 stars)
- "too_short" — under 25 characters of meaningful content
- "possible_spam" — repetitive, all caps, promotional language, or URLs
- "offensive_content" — threats of violence, death threats, wishes of harm, slurs, or gratuitously vulgar language. Examples: "I hope they die", "someone should burn this place down", "kill the owner". Mild profanity in context is OK ("the damn burger was incredible").
- "hate_speech" — content targeting people based on race, gender, religion, sexuality, disability, etc.
- "adult_content" — sexually explicit content
- "doxxing" — sharing private personal information (home addresses, personal phone numbers). Naming public-facing staff in a legitimate complaint is fine.

NON-BLOCKING flags (review is allowed but marked):
- "ai_generated" — suspiciously perfect prose, lacks personal voice, reads like a template`;

export interface ReviewQualityInput {
  rating: number;
  text: string;
  hasPhoto: boolean;
  structuredResponses?: {
    whatOrdered?: string;
    wouldRecommend?: string;
    oneThingToKnow?: string;
  };
}

export interface ReviewQualityResult {
  score: number;
  label: string;
  flags: string[];
  reason: string;
}

const THREAT_PATTERNS = [
  /\b(kill|murder|shoot|stab|bomb|attack)\b.*\b(them|him|her|owner|staff|manager|employee)\b/i,
  /\b(hope|wish|want)\b.*\b(die|dead|death|burn|suffer)\b/i,
  /\bdeserve[s]?\s+to\s+(die|burn|suffer)\b/i,
  /\b(going\s+to|gonna)\s+(kill|hurt|attack|destroy)\b/i,
];

const SPAM_PATTERNS = [
  /\b(visit|check\s+out|click|go\s+to)\b.*\b(my|our)\b.*\b(website|site|link|page)\b/i,
  /https?:\/\/\S+/i,
  /www\.\S+/i,
  /(.)\1{5,}/i, // 6+ repeated characters
];

/** Server-side content pre-check — catches obvious violations Venice models may miss */
export function preCheckContent(text: string): string[] {
  const flags: string[] = [];
  const lower = text.toLowerCase();

  for (const pattern of THREAT_PATTERNS) {
    if (pattern.test(text)) {
      flags.push("offensive_content");
      break;
    }
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      flags.push("possible_spam");
      break;
    }
  }

  // All caps check (more than 50% uppercase, min 20 chars)
  if (text.length >= 20) {
    const upperCount = (text.match(/[A-Z]/g) || []).length;
    const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
    if (letterCount > 0 && upperCount / letterCount > 0.5) {
      flags.push("possible_spam");
    }
  }

  return [...new Set(flags)];
}

export async function scoreReviewQuality(
  input: ReviewQualityInput,
): Promise<ReviewQualityResult> {
  // Server-side content pre-check — catches obvious violations Venice may miss
  const preCheckFlags = preCheckContent(input.text);

  try {
    const details = [
      `Rating: ${input.rating}/5`,
      `Review text: "${input.text}"`,
      `Has photo: ${input.hasPhoto}`,
      input.structuredResponses?.whatOrdered &&
        `What they ordered: "${input.structuredResponses.whatOrdered}"`,
      input.structuredResponses?.wouldRecommend &&
        `Would recommend: "${input.structuredResponses.wouldRecommend}"`,
      input.structuredResponses?.oneThingToKnow &&
        `One thing to know: "${input.structuredResponses.oneThingToKnow}"`,
    ]
      .filter(Boolean)
      .join("\n");

    const content = await veniceChat(
      [
        { role: "system", content: QUALITY_SYSTEM_PROMPT },
        { role: "user", content: details },
      ],
      VENICE_QUALITY_MODEL,
      { temperature: 0.1 },
    );

    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [
      null,
      content,
    ];
    const parsed = JSON.parse(jsonMatch[1]!.trim());

    const veniceFlags: string[] = parsed.flags || [];
    const allFlags = [...new Set([...veniceFlags, ...preCheckFlags])];

    return {
      score: Math.min(100, Math.max(0, parsed.score || 0)),
      label: parsed.label || "generic",
      flags: allFlags,
      reason: parsed.reason || "",
    };
  } catch (err) {
    console.error("Venice quality scoring error:", err);
    throw new Error("Review quality scoring failed");
  }
}

// --- Review Summarization ---

const SUMMARIZE_SYSTEM_PROMPT = `You are a concise local guide for Ghost Maps. Given a set of on-chain reviews for a place, write a 2-3 sentence summary that captures the overall sentiment, highlights, and any recurring themes.

Focus on: what reviewers loved, what they didn't, specific dishes/experiences mentioned, and overall vibe. Be direct and helpful. If reviews are mixed, say so honestly.

Return plain text only — no JSON, no markdown.`;

export interface ReviewForSummary {
  rating: number;
  text: string;
  qualityScore: number;
}

export async function summarizeReviews(
  placeName: string,
  reviews: ReviewForSummary[],
): Promise<string> {
  if (reviews.length === 0) return "";

  try {
    const reviewTexts = reviews
      .map(
        (r, i) =>
          `Review ${i + 1} (${r.rating}/5, quality: ${r.qualityScore}/100): "${r.text}"`,
      )
      .join("\n");

    const content = await veniceChat(
      [
        { role: "system", content: SUMMARIZE_SYSTEM_PROMPT },
        { role: "user", content: `Place: ${placeName}\n\n${reviewTexts}` },
      ],
      VENICE_BRIEFING_MODEL,
      { temperature: 0.3 },
    );

    return content.trim();
  } catch (err) {
    console.error("Venice review summarization error:", err);
    return "";
  }
}

// --- Photo Verification ---

const PHOTO_VERIFY_SYSTEM_PROMPT = `You are a photo verification assistant for Ghost Maps. Given metadata about a user-uploaded review photo, assess whether it seems legitimate.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "legitimate": true|false,
  "confidence": 0.0-1.0,
  "reason": "1 sentence explanation"
}

Red flags:
- File size too small (< 10KB) for a real photo
- File size too large (> 15MB) suggests stock photo
- Suspicious EXIF: missing all metadata (AI-generated images often lack EXIF)
- Photo taken far from the place location
- Image dimensions suggest a screenshot rather than camera photo

Green flags:
- Has EXIF GPS data near the business
- Reasonable file size (100KB - 10MB)
- Has camera model in EXIF
- Taken recently`;

export interface PhotoMetadata {
  fileSize: number; // bytes
  hasExifGPS: boolean;
  nearPlace: boolean;
  mimeType: string;
  width?: number;
  height?: number;
}

export async function verifyPhoto(
  metadata: PhotoMetadata,
): Promise<{ legitimate: boolean; confidence: number; reason: string }> {
  try {
    const details = [
      `File size: ${(metadata.fileSize / 1024).toFixed(0)} KB`,
      `MIME type: ${metadata.mimeType}`,
      `Has GPS data: ${metadata.hasExifGPS}`,
      `Near place: ${metadata.nearPlace}`,
      metadata.width && `Dimensions: ${metadata.width}x${metadata.height}`,
    ]
      .filter(Boolean)
      .join("\n");

    const content = await veniceChat(
      [
        { role: "system", content: PHOTO_VERIFY_SYSTEM_PROMPT },
        { role: "user", content: details },
      ],
      VENICE_QUALITY_MODEL,
      { temperature: 0.1 },
    );

    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [
      null,
      content,
    ];
    const parsed = JSON.parse(jsonMatch[1]!.trim());

    return {
      legitimate: parsed.legitimate ?? true,
      confidence: parsed.confidence ?? 0.5,
      reason: parsed.reason || "",
    };
  } catch (err) {
    console.error("Venice photo verification error:", err);
    return {
      legitimate: true,
      confidence: 0.5,
      reason: "Could not verify — assuming legitimate.",
    };
  }
}

// --- Comparative Recommendations ---

const COMPARE_SYSTEM_PROMPT = `You are a local guide for Ghost Maps. Compare the given places and help the user choose.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "comparison": "2-3 sentence comparison highlighting key differences",
  "recommendation": "1 sentence pick with reason",
  "tradeoffs": [
    {"place": "place name", "pros": ["pro1", "pro2"], "cons": ["con1"]}
  ]
}

Be concise, opinionated, and helpful. Use review data when available.`;

export interface PlaceForComparison {
  name: string;
  category: string;
  address: string;
  rating?: number | null;
  priceLevel?: string | null;
  reviews?: { rating: number; text: string }[];
}

export async function comparePlaces(places: PlaceForComparison[]): Promise<{
  comparison: string;
  recommendation: string;
  tradeoffs: { place: string; pros: string[]; cons: string[] }[];
}> {
  try {
    const placeSummaries = places
      .map((p) => {
        const lines = [
          `Name: ${p.name}`,
          `Category: ${p.category}`,
          `Address: ${p.address}`,
          p.rating && `Rating: ${p.rating}`,
          p.priceLevel && `Price: ${p.priceLevel}`,
        ]
          .filter(Boolean)
          .join(", ");

        const reviewLines = (p.reviews || [])
          .slice(0, 3)
          .map((r) => `  - ${r.rating}/5: "${r.text.slice(0, 100)}"`)
          .join("\n");

        return reviewLines ? `${lines}\nReviews:\n${reviewLines}` : lines;
      })
      .join("\n\n");

    const content = await veniceChat(
      [
        { role: "system", content: COMPARE_SYSTEM_PROMPT },
        { role: "user", content: `Compare these places:\n\n${placeSummaries}` },
      ],
      VENICE_RANK_MODEL,
      { temperature: 0.3 },
    );

    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [
      null,
      content,
    ];
    const parsed = JSON.parse(jsonMatch[1]!.trim());

    return {
      comparison: parsed.comparison || "",
      recommendation: parsed.recommendation || "",
      tradeoffs: parsed.tradeoffs || [],
    };
  } catch (err) {
    console.error("Venice comparison error:", err);
    return { comparison: "", recommendation: "", tradeoffs: [] };
  }
}

export async function generatePlaceBriefing(
  data: PlaceBriefingData,
): Promise<string> {
  try {
    const details = [
      `Name: ${data.name}`,
      `Category: ${data.category.replace(/_/g, " ")}`,
      data.address && `Address: ${data.address}`,
      data.phone && `Phone: ${data.phone}`,
      data.website && `Website: ${data.website}`,
      data.brand && `Brand: ${data.brand}`,
      data.openingHours && `Hours: ${data.openingHours.join("; ")}`,
      data.isOpen !== null && `Currently: ${data.isOpen ? "Open" : "Closed"}`,
      data.foodTypes.length > 0 && `Cuisine: ${data.foodTypes.join(", ")}`,
    ]
      .filter(Boolean)
      .join("\n");

    const content = await veniceChat(
      [
        { role: "system", content: BRIEFING_SYSTEM_PROMPT },
        { role: "user", content: details },
      ],
      VENICE_BRIEFING_MODEL,
      { temperature: 0.4 },
    );

    return content.trim();
  } catch (err) {
    console.error("Venice briefing error:", err);
    return "";
  }
}
