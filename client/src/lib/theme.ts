/** Shared theme color constants for use in JS/TS (map markers, MapLibre paint, etc.)
 *  Keep in sync with --color-* variables in index.css @theme block. */
export const THEME = {
  void: "#080c14",
  surface: "#0d1420",
  edge: "#1a2535",
  cyan: "#00e5ff",
  bone: "#e8e6e1",
  coral: "#ff3d5a",
  phosphor: "#00ff9d",
} as const;

/** Quality score → display label */
export function qualityLabel(score: number): string {
  if (score >= 81) return "exceptional";
  if (score >= 51) return "detailed";
  if (score >= 21) return "decent";
  return "generic";
}

/** Quality label → Tailwind class string */
export const QUALITY_STYLES: Record<string, string> = {
  generic: "bg-coral/15 text-coral",
  decent: "bg-amber/15 text-amber",
  detailed: "bg-phosphor/15 text-phosphor",
  exceptional: "bg-cyan-muted text-cyan",
};

/** Truncate an EVM address for display: 0x1234...abcd */
export function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
