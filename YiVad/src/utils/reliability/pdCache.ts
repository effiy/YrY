/**
 * 持久化 ReliableCache 适配器：以 localStorage 为后端。
 *
 * 存储 key 前缀 = `yivad:pd-cache:`。
 *
 * 提供：
 *   - typedGet / typedSet：对每个 endpoint（knowledge/issues/modules/readme）提供强类型。
 *   - 条目字节统计：每个条目存储时先算 sizeB，超过 maxTotalSizeB(512KB) 做 LRU 驱逐到 80% 水位。
 *   - safeJsonParse / safeJsonStringify：任意异常吞掉并返回 null/空串。
 */
import { ReliableCache } from "./cache";

const KEY_PREFIX = "yivad:pd-cache:";
const MAX_TOTAL_BYTES = 512 * 1024; // 512KB 上限
const WATERMARK = Math.floor(MAX_TOTAL_BYTES * 0.8);

export const pdCache = new ReliableCache<string>({
  maxBytes: MAX_TOTAL_BYTES
});

// 启动时尝试从 localStorage 热加载已有的缓存条目（size 超限则按 LRU 逐步剔除）
try {
  for (let i = 0; i < localStorage.length; i++) {
    const rawKey = localStorage.key(i);
    if (!rawKey || !rawKey.startsWith(KEY_PREFIX)) continue;
    const data = localStorage.getItem(rawKey);
    if (!data) continue;
    const entry = safeJsonParse<{ v: string; ts: number; ttlMs: number; sizeB: number }>(data);
    if (!entry) continue;
    const key = rawKey.slice(KEY_PREFIX.length);
    const age = Date.now() - entry.ts;
    if (entry.ttlMs > 0 && age >= entry.ttlMs) {
      // 过期条目：不加载但保留其 value 供 stale（可选策略：不进内存，让下次请求触发 revalidate）
      continue;
    }
    const ok = pdCache.set(key, entry.v, Math.max(0, entry.ttlMs - age));
    if (!ok) {
      // set 失败（超大或 LRU 无法腾出空间） → 删除 localStorage 条目
      try { localStorage.removeItem(rawKey); } catch { /* noop */ }
    }
  }
} catch {
  /* 读取 localStorage 失败（隐私模式/配额）则跳过预加载 */
}

// 监听内存 evict，同步从 localStorage 清理
// 注：ReliableCache 构造参数有 onEvict，但这里通过 patch 的方式在内存层监听；若 onEvict 已设置则以 patch 为准
try {
  (pdCache as any).onEvict = (key: string, _value: unknown, _reason: "size" | "ttl") => {
    try { localStorage.removeItem(KEY_PREFIX + key); } catch { /* noop */ }
  };
} catch { /* noop */ }

export function typedSet<T>(
  key: string,
  value: T,
  ttlMs: number
): boolean {
  const json = safeJsonStringify(value);
  if (json === null) return false;
  const ok = pdCache.set(key, json, ttlMs);
  if (ok) {
    try {
      localStorage.setItem(
        KEY_PREFIX + key,
        JSON.stringify({ v: json, ts: Date.now(), ttlMs, sizeB: json.length })
      );
    } catch {
      // localStorage 配额不足时做一次 LRU 清理到 WATERMARK，再尝试 1 次
      try { drainToWatermark(); localStorage.setItem(
        KEY_PREFIX + key,
        JSON.stringify({ v: json, ts: Date.now(), ttlMs, sizeB: json.length })
      ); } catch { /* 真没空间就只保留内存 */ ok ? undefined : false; }
    }
  }
  return ok;
}

export interface TypedGetResult<T> {
  hit: boolean;
  stale: boolean;
  value?: T;
  ageMs?: number;
}

export function typedGet<T>(key: string): TypedGetResult<T> {
  // 1) 内存层
  const mem = pdCache.getWithStale(key);
  if (mem.hit) {
    const parsed = safeJsonParse<T>(mem.value);
    if (parsed !== null) {
      return {
        hit: true,
        stale: mem.stale,
        value: parsed,
        ageMs: pdCache.ageOf(key)
      };
    }
  }
  // 2) 回退 localStorage（当内存被刷新或热加载时可能没有，兜底）
  try {
    const raw = localStorage.getItem(KEY_PREFIX + key);
    if (!raw) return { hit: false, stale: false };
    const entry = safeJsonParse<{ v: string; ts: number; ttlMs: number }>(raw);
    if (!entry) return { hit: false, stale: false };
    const age = Date.now() - entry.ts;
    const stale = entry.ttlMs > 0 && age >= entry.ttlMs;
    const parsed = safeJsonParse<T>(entry.v);
    if (parsed === null) return { hit: false, stale: false };
    // 回填内存，以便下次 get 走 LRU
    if (!stale) pdCache.set(key, entry.v, Math.max(0, entry.ttlMs - age));
    return { hit: true, stale, value: parsed, ageMs: age };
  } catch {
    return { hit: false, stale: false };
  }
}

export function cacheTotalBytes(): number {
  return pdCache.bytes;
}

export function cacheKeys(): string[] {
  return pdCache.keys();
}

export function evictStale(): void {
  // 手动剔旧：ReliableCache.has/get 内部会剔旧，这里只对 localStorage 做一次清理
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const rawKey = localStorage.key(i);
    if (!rawKey || !rawKey.startsWith(KEY_PREFIX)) continue;
    const data = localStorage.getItem(rawKey);
    if (!data) continue;
    const entry = safeJsonParse<{ ts: number; ttlMs: number }>(data);
    if (!entry || (entry.ttlMs > 0 && Date.now() - entry.ts >= entry.ttlMs)) {
      try { localStorage.removeItem(rawKey); } catch { /* noop */ }
    }
  }
}

function drainToWatermark(): void {
  const total = pdCache.bytes;
  if (total <= WATERMARK) return;
  const keys = pdCache.keys();
  for (const key of keys) {
    if (pdCache.bytes <= WATERMARK) break;
    pdCache.delete(key);
  }
}

export function safeJsonParse<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

export function safeJsonStringify(v: unknown): string | null {
  try {
    return JSON.stringify(v);
  } catch {
    return null;
  }
}

// 单次加载时先剔一次旧
try { evictStale(); } catch { /* noop */ }
