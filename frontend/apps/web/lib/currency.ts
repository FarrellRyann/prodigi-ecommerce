/**
 * Currency utility — all prices in this app use Indonesian Rupiah (IDR).
 * Use these helpers everywhere instead of inline "$" + toLocaleString().
 */

/** Format a number as IDR, e.g. formatIDR(50000) → "Rp 50.000" */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Compact format for large numbers, e.g. formatIDRCompact(1250000) → "Rp 1,25 jt" */
export function formatIDRCompact(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} jt`;
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)} rb`;
  }
  return formatIDR(amount);
}
