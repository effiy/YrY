/**
 * YiPet Chat — Text search utilities.
 * Pure functions extracted from ChatToolbar.vue for reuse across components.
 */

/** Truncate text to max chars, appending … if needed. */
export function truncatePrompt(t: string, max = 40): string {
  const trimmed = t.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max - 1) + '\u2026';
}

/** Split text into segments, marking which match the query (case-insensitive). */
export function highlightSegments(text: string, query: string): { text: string; match: boolean }[] {
  if (!query.trim()) return [{ text, match: false }];
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  const testRe = new RegExp(`^${escaped}$`, 'i');
  return parts.map((p) => ({ text: p, match: testRe.test(p) }));
}

/** Generate trigram set from a string for fuzzy matching. */
export function trigrams(str: string): Set<string> {
  const t = str.toLowerCase().trim();
  if (t.length < 3) return new Set([t]);
  const set = new Set<string>();
  for (let i = 0; i + 3 <= t.length; i++) set.add(t.slice(i, i + 3));
  return set;
}

/** Jaccard similarity coefficient between two sets. */
export function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const item of a) if (b.has(item)) intersection++;
  return intersection / (a.size + b.size - intersection);
}

/** Fuzzy search: find similar items from a list using trigram + Jaccard. */
export function fuzzySearch<T>(
  query: string,
  items: T[],
  extractText: (item: T) => string,
  minScore = 0.1,
  limit = 3,
): { item: T; score: number }[] {
  const q = query.trim();
  if (!q) return [];
  const qt = trigrams(q);
  if (!qt.size) return [];
  return items
    .map((item) => ({ item, score: jaccard(qt, trigrams(extractText(item))) }))
    .filter((x) => x.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}