interface FuseResult<T> {
  item: T;
  score: number;
}

interface FuseOptions<T> {
  keys: (keyof T | { name: keyof T; weight: number })[];
  threshold?: number;
  distance?: number;
  minMatchCharLength?: number;
}

/**
 * Lightweight fuzzy search based on substring matching with scoring.
 * For production use, consider Fuse.js for better CJK support.
 */
export function fuzzySearch<T extends Record<string, any>>(
  list: T[],
  query: string,
  options: FuseOptions<T>
): FuseResult<T>[] {
  if (!query.trim()) return list.map((item) => ({ item, score: 0 }));

  const q = query.toLowerCase().trim();
  const threshold = options.threshold ?? 0.6;
  const results: FuseResult<T>[] = [];

  for (const item of list) {
    let bestScore = Infinity;

    for (const key of options.keys) {
      const keyName = typeof key === "object" ? key.name : key;
      const weight = typeof key === "object" ? key.weight : 1;
      const value = String(item[keyName] ?? "").toLowerCase();

      if (!value) continue;

      // Exact match
      if (value === q) {
        bestScore = 0;
        break;
      }

      // Starts with
      if (value.startsWith(q)) {
        const score = 0.1 / weight;
        if (score < bestScore) bestScore = score;
        continue;
      }

      // Contains
      const idx = value.indexOf(q);
      if (idx !== -1) {
        const score = (0.3 + idx / value.length) / weight;
        if (score < bestScore) bestScore = score;
        continue;
      }

      // Word boundary match
      const words = value.split(/[\s\-_./]+/);
      for (const word of words) {
        if (word.startsWith(q)) {
          const score = 0.5 / weight;
          if (score < bestScore) bestScore = score;
          break;
        }
      }
    }

    if (bestScore <= threshold) {
      results.push({ item, score: bestScore });
    }
  }

  return results.sort((a, b) => a.score - b.score);
}