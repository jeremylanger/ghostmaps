import { useState } from "react";
import type { ReviewVerification } from "../types";

const BADGE_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  legitimate: {
    label: "Verified",
    bg: "bg-emerald-900/40",
    text: "text-emerald-400",
  },
  sybil: { label: "Flagged", bg: "bg-coral/15", text: "text-coral" },
  spam: { label: "Flagged", bg: "bg-coral/15", text: "text-coral" },
  suspicious: {
    label: "Suspicious",
    bg: "bg-amber/15",
    text: "text-amber",
  },
};

export function verdictBadgeConfig(verdict: string) {
  return BADGE_CONFIG[verdict] ?? null;
}

export default function VerificationBadge({
  verification,
}: {
  verification: ReviewVerification;
}) {
  const [showDetail, setShowDetail] = useState(false);
  const config = verdictBadgeConfig(verification.verdict);
  if (!config) return null;

  return (
    <span className="relative inline-block">
      <button
        type="button"
        className={`text-[10px] font-semibold px-1.5 py-px rounded cursor-pointer ${config.bg} ${config.text}`}
        onClick={() => setShowDetail((v) => !v)}
        aria-label={`Guardian ${config.label}`}
      >
        Guardian {config.label}
      </button>
      {showDetail && (
        <div className="absolute z-50 top-full left-0 mt-1 w-56 rounded-lg bg-surface-raised border border-edge p-2.5 shadow-lg">
          <p className="text-xs text-bone font-semibold mb-1">
            {config.label} — {verification.confidence}% confidence
          </p>
          <p className="text-[11px] text-blue-gray leading-snug">
            {verification.reasoningSummary}
          </p>
        </div>
      )}
    </span>
  );
}
