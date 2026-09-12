/**
 * Content-hash cache for Mermaid rendered SVGs.
 * Identical diagram source → cached SVG, avoiding expensive mermaid.render() re-runs
 * across regenerations and theme switches (cache is cleared on theme change).
 */

const svgCache = new Map<string, string>();

/** Simple content hash using a 32-bit FNV-1a variant. Fast enough for in-session caching. */
function hash(content: string): string {
  let h = 2166136261;
  for (let i = 0; i < content.length; i++) {
    h ^= content.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

export function getCachedSvg(source: string): string | undefined {
  return svgCache.get(hash(source));
}

export function setCachedSvg(source: string, svg: string): void {
  svgCache.set(hash(source), svg);
}

export function clearMermaidCache(): void {
  svgCache.clear();
}