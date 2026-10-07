import Fuse from "fuse.js";

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
 * Fuzzy search backed by Fuse.js — the standard JS fuzzy search library
 * with superior CJK support and bitap algorithm scoring.
 */
export function fuzzySearch<T extends Record<string, any>>(list: T[], query: string, options: FuseOptions<T>): FuseResult<T>[] {
  if (!query.trim()) return list.map(item => ({ item, score: 0 }));

  const fuse = new Fuse(list, {
    keys: options.keys as any,
    threshold: options.threshold ?? 0.6,
    distance: options.distance,
    minMatchCharLength: options.minMatchCharLength,
    includeScore: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (fuse.search(query) as any[]).map((r: any) => ({
    item: r.item,
    score: r.score ?? 0,
  }));
}