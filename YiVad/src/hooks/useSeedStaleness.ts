import type { RssSeedDocument } from "@/api/modules/rssService";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function useSeedStaleness() {
  function seedStaleMs(row: RssSeedDocument): number | null {
    const ts = row.updatedAt ?? row.createdAt;
    if (!ts) return null;
    return Date.now() - ts;
  }

  function seedStaleDays(row: RssSeedDocument): number | null {
    const ms = seedStaleMs(row);
    if (ms === null) return null;
    return Math.floor(ms / (24 * 60 * 60 * 1000));
  }

  function seedIsStale(row: RssSeedDocument): boolean {
    const ms = seedStaleMs(row);
    if (ms === null) return true;
    return ms > SEVEN_DAYS_MS;
  }

  return { seedStaleMs, seedStaleDays, seedIsStale };
}