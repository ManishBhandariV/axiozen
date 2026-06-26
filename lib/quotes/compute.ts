import type { QuoteItem } from "./types";

/** Round to 2 decimals without binary-float drift. */
export function round2(n: number): number {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export function lineAmount(it: QuoteItem): number {
  return round2((Number(it.qty) || 0) * (Number(it.unitPrice) || 0));
}

export function computeTotals(items: QuoteItem[], gstRate: number) {
  const net = round2(items.reduce((s, it) => s + lineAmount(it), 0));
  const gst = round2((net * (Number(gstRate) || 0)) / 100);
  const total = round2(net + gst);
  return { net, gst, total };
}

/** Indian-grouped number with 2 decimals, e.g. 40415 -> "40,415.00". */
export function formatINR(n: number): string {
  return (Number(n) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** "Rs. 40,415.00" */
export function rs(n: number): string {
  return `Rs. ${formatINR(n)}`;
}
