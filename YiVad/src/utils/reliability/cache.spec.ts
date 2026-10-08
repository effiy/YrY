import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ReliableCache } from "@/utils/reliability/cache";

function strBytes(s: string): number {
  return new Blob([s]).size;
}

function makeStr(n: number): string {
  return "x".repeat(n);
}

describe("ReliableCache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("TR-4.1 LRU 字节上限 512KB evict", () => {
    it("should default to 512KB max bytes", () => {
      const cache = new ReliableCache();
      expect(cache.maxBytes).toBe(512 * 1024);
    });

    it("should accept custom max bytes", () => {
      const cache = new ReliableCache({ maxBytes: 1024 });
      expect(cache.maxBytes).toBe(1024);
    });

    it("should set and get within size fit", () => {
      const cache = new ReliableCache<string>({ maxBytes: 1024 });
      const v = makeStr(100);
      cache.set("a", v);
      expect(cache.get("a")).toBe(v);
      expect(cache.has("a")).toBe(true);
      expect(cache.size).toBe(1);
    });

    it("should track total bytes for strings correctly", () => {
      const cache = new ReliableCache<string>({ maxBytes: 1024 * 1024 });
      const s1 = makeStr(100);
      const s2 = makeStr(200);
      cache.set("k1", s1);
      cache.set("k2", s2);
      expect(cache.bytes).toBe(strBytes(s1) + strBytes(s2));
    });

    it("should not accept entries LRU: set overflowing the eldest when over budget; keep within bytes limit after evictions", () => {
      const unit = 100;
      const max = unit * 5;
      const cache = new ReliableCache<string>({ maxBytes: max });
      for (let i = 0; i < 7; i++) {
        const key = String.fromCharCode(97 + i);
        const ok = cache.set(key, makeStr(unit));
        expect(ok).toBe(true);
      }
      expect(cache.bytes).toBeLessThanOrEqual(max);
    });

    it("should reject single item larger than maxBytes", () => {
      const cache = new ReliableCache<string>({ maxBytes: 50 });
      const ok = cache.set("huge", makeStr(1000));
      expect(ok).toBe(false);
      expect(cache.size).toBe(0);
      expect(cache.bytes).toBe(0);
    });

    it("LRU: should evict LRU entries to make room on overflow 512KB exactly", () => {
      const kb = 1024;
      const cache = new ReliableCache<string>({ maxBytes: 512 * kb });
      const per = 100 * kb;
      for (let i = 0; i < 7; i++) {
        cache.set(`k${i}`, makeStr(per));
      }
      expect(cache.bytes).toBeLessThanOrEqual(512 * kb);
      expect(cache.size).toBe(5);
    });

    it("LRU: get() should touch entry (promoted to newest", () => {
      const kb = 1000;
      const cache = new ReliableCache<string>({ maxBytes: 5 * kb });
      cache.set("a", makeStr(kb));
      cache.set("b", makeStr(kb));
      cache.set("c", makeStr(kb));
      cache.set("d", makeStr(kb));
      cache.set("e", makeStr(kb));
      expect(cache.size).toBe(5);

      cache.get("a");
      cache.set("f", makeStr(kb));
      expect(cache.has("a")).toBe(true);
      expect(cache.has("b")).toBe(false);
    });

    it("LRU: keys() should reflect order (eldest first after set/get", () => {
      const cache = new ReliableCache<string>({ maxBytes: 10000 });
      cache.set("a", "1");
      cache.set("b", "2");
      cache.set("c", "3");
      cache.get("a");
      cache.set("d", "4");
      const keys = cache.keys();
      expect(keys.indexOf("a")).toBeGreaterThan(keys.indexOf("b"));
      expect(keys[keys.length - 1]).toBe("d");
    });

    it("onEvict callback fired with size reason when evicted", () => {
      const evictions: Array<{ key: string; value: unknown; reason: "size" | "ttl" }> = [];
      const cache = new ReliableCache<string>({
        maxBytes: 300,
        onEvict: (k, v, r) => evictions.push({ key: k, value: v, reason: r }),
      });
      cache.set("a", makeStr(100));
      cache.set("b", makeStr(100));
      cache.set("c", makeStr(100));
      cache.set("d", makeStr(100));
      expect(evictions.length).toBeGreaterThan(0);
      const sizeEvictions = evictions.filter((e) => e.reason === "size");
      expect(sizeEvictions.length).toBeGreaterThan(0);
      expect(sizeEvictions[0].key).toBe("a");
    });

    it("512KB: fill then overflow should evict exactly until under budget", () => {
      const kb = 1024;
      const cache = new ReliableCache<Uint8Array>({
        maxBytes: 512 * kb,
        sizeOf: (v) => (v as Uint8Array).byteLength,
      });
      for (let i = 0; i < 6; i++) {
        cache.set(`k${i}`, new Uint8Array(100 * kb));
      }
      expect(cache.bytes).toBeLessThanOrEqual(512 * kb);
      expect(cache.size).toBe(5);
    });
  });

  describe("TR-4.2 TTL stale 判断", () => {
    it("should return value when not expired", () => {
      const cache = new ReliableCache<string>();
      cache.set("k", "v", 5000);
      vi.advanceTimersByTime(1000);
      expect(cache.get("k")).toBe("v");
      expect(cache.isStaleKey("k")).toBe(false);
    });

    it("should return undefined when TTL expired", () => {
      const cache = new ReliableCache<string>();
      cache.set("k", "v", 1000);
      vi.advanceTimersByTime(1000);
      expect(cache.get("k")).toBeUndefined();
      expect(cache.has("k")).toBe(false);
    });

    it("isStaleKey should report true after expiry", () => {
      const cache = new ReliableCache<string>();
      cache.set("k", "v", 2000);
      expect(cache.isStaleKey("k")).toBe(false);
      vi.advanceTimersByTime(2000);
      expect(cache.isStaleKey("k")).toBe(true);
    });

    it("defaultTtlMs option should apply when no per-entry ttl", () => {
      const cache = new ReliableCache<string>({ defaultTtlMs: 1500 });
      cache.set("k", "v");
      vi.advanceTimersByTime(1499);
      expect(cache.get("k")).toBe("v");
      vi.advanceTimersByTime(1);
      expect(cache.get("k")).toBeUndefined();
    });

    it("per-entry ttl should override defaultTtlMs", () => {
      const cache = new ReliableCache<string>({ defaultTtlMs: 100 });
      cache.set("k", "v", 5000);
      vi.advanceTimersByTime(3000);
      expect(cache.get("k")).toBe("v");
    });

    it("onEvict fired with ttl reason on expire via get", () => {
      const evictions: Array<{ key: string; reason: "size" | "ttl" }> = [];
      const cache = new ReliableCache<string>({
        maxBytes: 10000,
        onEvict: (k, _v, r) => evictions.push({ key: k, reason: r }),
      });
      cache.set("a", "1", 500);
      vi.advanceTimersByTime(500);
      cache.get("a");
      const ttlEvicts = evictions.filter((e) => e.reason === "ttl" && e.key === "a");
      expect(ttlEvicts.length).toBe(1);
    });

    it("size should exclude stale entries after evictStale", () => {
      const cache = new ReliableCache<string>({ maxBytes: 10000 });
      cache.set("a", "1", 100);
      cache.set("b", "2", 999999);
      cache.set("c", "3", 100);
      vi.advanceTimersByTime(200);
      expect(cache.size).toBe(1);
      expect(cache.has("b")).toBe(true);
    });

    it("entries() / keys() should exclude stale", () => {
      const cache = new ReliableCache<string>({ maxBytes: 10000 });
      cache.set("a", "1", 100);
      cache.set("b", "2", 999999);
      vi.advanceTimersByTime(200);
      expect(cache.keys()).toEqual(["b"]);
      expect(cache.entries()).toEqual([["b", "2"]]);
    });

    it("has() should trigger ttl evict and return false", () => {
      const cache = new ReliableCache<string>();
      cache.set("k", "v", 10);
      vi.advanceTimersByTime(10);
      expect(cache.has("k")).toBe(false);
      expect(cache.size).toBe(0);
    });

    it("getEntryInfo should return metadata or undefined for stale", () => {
      const cache = new ReliableCache<string>();
      cache.set("k", "v", 2000);
      const infoBefore = cache.getEntryInfo("k")!;
      expect(infoBefore).toBeDefined();
      expect(infoBefore.key).toBe("k");
      expect(infoBefore.size).toBeGreaterThan(0);
      vi.advanceTimersByTime(2000);
      expect(cache.getEntryInfo("k")).toBeUndefined();
    });
  });
});
