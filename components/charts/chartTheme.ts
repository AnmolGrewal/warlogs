// Shared Recharts styling so every chart looks the same.
export const AXIS = {
  stroke: "var(--border-strong)",
  tick: { fill: "var(--muted)", fontSize: 12 },
  tickLine: false,
} as const;

export const GRID = {
  stroke: "var(--border)",
  strokeDasharray: "3 3",
  vertical: false,
} as const;

export const TOOLTIP = {
  contentStyle: {
    background: "var(--surface-2)",
    border: "1px solid var(--border-strong)",
    borderRadius: 8,
    color: "var(--text)",
    fontSize: 13,
  },
  labelStyle: { color: "var(--muted)", marginBottom: 4 },
  itemStyle: { color: "var(--text)" },
  cursor: { fill: "rgba(255,255,255,0.04)", stroke: "var(--border-strong)" },
} as const;

/** 1500 → 1.5k, 1250000 → 1.25M */
export function kfmt(v: unknown): string {
  const n = Number(v);
  const a = Math.abs(n);
  if (a >= 1_000_000) return `${+(n / 1_000_000).toFixed(2)}M`;
  if (a >= 1000) return `${+(n / 1000).toFixed(1)}k`;
  return `${n}`;
}
