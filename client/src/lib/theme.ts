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
  if (score >= 81) return "Exceptional";
  if (score >= 51) return "Detailed";
  if (score >= 21) return "Decent";
  return "Generic";
}

/** Quality label → Tailwind class string */
export const QUALITY_STYLES: Record<string, string> = {
  Generic: "bg-coral/15 text-coral",
  Decent: "bg-amber/15 text-amber",
  Detailed: "bg-phosphor/15 text-phosphor",
  Exceptional: "bg-cyan-muted text-cyan",
};

/** Truncate an EVM address for display: 0x1234...abcd */
export function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
