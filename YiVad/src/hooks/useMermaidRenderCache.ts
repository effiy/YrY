/**
 * Mermaid SVG render cache — content-hash-based, module-level singleton.
 *
 * Caches rendered SVG output keyed by a fast 32-bit hash of the mermaid
 * source code. This deduplicates renders across regenerations, edits,
 * and different DOM surfaces showing the same diagram.
 *
 * Capped at 50 entries to prevent unbounded memory growth over long
 * chat sessions. Cleared on theme switch so cached SVGs are re-rendered
 * with the new theme colors.
 */

const MAX_CACHE_SIZE = 50;
const svgCache = new Map<number, string>();

/** djb2 — fast 32-bit string hash, sufficient for dedup (not security). */
function hash32(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}

/**
 * Look up a previously-rendered SVG for the given mermaid source code.
 * Returns `undefined` on cache miss.
 */
export function getCachedSvg(code: string): string | undefined {
  return svgCache.get(hash32(code));
}

/**
 * Store a rendered SVG in the cache. If the cache exceeds the size cap,
 * the oldest entries are evicted (LRU via Map insertion order).
 */
export function setCachedSvg(code: string, svg: string): void {
  const key = hash32(code);
  // Delete-then-set to move the key to the end (most-recently-used position)
  svgCache.delete(key);
  svgCache.set(key, svg);
  // Evict oldest if over cap
  if (svgCache.size > MAX_CACHE_SIZE) {
    const first = svgCache.keys().next();
    if (!first.done) svgCache.delete(first.value);
  }
}

/** Clear the entire cache (e.g., on theme switch). */
export function clearMermaidCache(): void {
  svgCache.clear();
}
