/** Compact number formatting matching the index_78 mockup ("1.5M", "865K"). */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000
    return `${m >= 10 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, '')}M`
  }
  if (n >= 1_000) {
    const k = n / 1_000
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')}K`
  }
  return String(n)
}

/** Thai-grouped integer ("2,043"). */
export function formatGrouped(n: number): string {
  return n.toLocaleString('th-TH')
}
