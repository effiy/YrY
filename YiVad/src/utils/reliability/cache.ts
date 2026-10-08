interface CacheEntry<V> {
  key: string;
  value: V;
  size: number;
  createdAt: number;
  expiresAt: number;
  lastAccessedAt: number;
  accessCount: number;
}

export interface ReliableCacheOptions {
  maxBytes?: number;
  defaultTtlMs?: number;
  onEvict?: (key: string, value: unknown, reason: "size" | "ttl") => void;
  sizeOf?: (value: unknown, key: string) => number;
}

const DEFAULT_MAX_BYTES = 512 * 1024;
const DEFAULT_TTL_MS = Number.POSITIVE_INFINITY;

export class ReliableCache<V = unknown> {
  private readonly map = new Map<string, CacheEntry<V>>();
  private readonly order: string[] = [];
  private totalBytes = 0;

  private readonly _maxBytes: number;
  private readonly defaultTtlMs: number;
  private readonly onEvict?: (key: string, value: unknown, reason: "size" | "ttl") => void;
  private readonly sizeOf: (value: unknown, key: string) => number;

  constructor(options: ReliableCacheOptions = {}) {
    this._maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
    this.defaultTtlMs = options.defaultTtlMs ?? DEFAULT_TTL_MS;
    this.onEvict = options.onEvict;
    this.sizeOf = options.sizeOf ?? this.defaultSizeOf;
  }

  get(key: string): V | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;

    if (this.isStale(entry)) {
      this.deleteEntry(key, "ttl");
      return undefined;
    }

    this.touch(entry);
    return entry.value;
  }

  set(key: string, value: V, ttlMs?: number): boolean {
    const size = this.sizeOf(value, key);
    if (size > this._maxBytes) {
      return false;
    }

    const existing = this.map.get(key);
    if (existing) {
      this.removeFromOrder(key);
      this.totalBytes -= existing.size;
    }

    const now = Date.now();
    const entry: CacheEntry<V> = {
      key,
      value,
      size,
      createdAt: now,
      expiresAt: ttlMs !== undefined ? now + ttlMs : (this.defaultTtlMs === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY : now + this.defaultTtlMs),
      lastAccessedAt: now,
      accessCount: 0,
    };

    this.evictStale();
    while (this.totalBytes + size > this._maxBytes && this.order.length > 0) {
      const lruKey = this.order[0];
      this.deleteEntry(lruKey, "size");
    }

    this.map.set(key, entry);
    this.order.push(key);
    this.totalBytes += size;
    return true;
  }

  has(key: string): boolean {
    const entry = this.map.get(key);
    if (!entry) return false;
    if (this.isStale(entry)) {
      this.deleteEntry(key, "ttl");
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    return this.deleteEntry(key, undefined);
  }

  clear(): void {
    for (const key of [...this.map.keys()]) {
      this.deleteEntry(key, undefined);
    }
  }

  get size(): number {
    this.evictStale();
    return this.map.size;
  }

  get bytes(): number {
    return this.totalBytes;
  }

  get maxBytes(): number {
    return this._maxBytes;
  }

  keys(): string[] {
    this.evictStale();
    return [...this.order].filter((k) => this.map.has(k));
  }

  entries(): Array<[string, V]> {
    this.evictStale();
    const result: Array<[string, V]> = [];
    for (const key of this.order) {
      const entry = this.map.get(key);
      if (entry) {
        result.push([key, entry.value]);
      }
    }
    return result;
  }

  forEach(fn: (value: V, key: string) => void): void {
    this.evictStale();
    for (const key of this.order) {
      const entry = this.map.get(key);
      if (entry) {
        fn(entry.value, key);
      }
    }
  }

  getEntryInfo(key: string): Omit<CacheEntry<V>, "value"> | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (this.isStale(entry)) {
      this.deleteEntry(key, "ttl");
      return undefined;
    }
    const { value: _value, ...info } = entry;
    return info;
  }

  isStaleKey(key: string): boolean {
    const entry = this.map.get(key);
    if (!entry) return true;
    return this.isStale(entry);
  }

  /** stale-while-revalidate 语义：fresh 返回 {hit:true, stale:false, value}；stale 返回 {hit:true, stale:true, value} 但不删除条目（让上层决定是否继续使用并后台 revalidate）；miss 返回 {hit:false, stale:false}。 */
  getWithStale(key: string):
    | { hit: false; stale: false; value?: undefined }
    | { hit: true; stale: false; value: V }
    | { hit: true; stale: true; value: V } {
    const entry = this.map.get(key);
    if (!entry) return { hit: false, stale: false };
    const stale = this.isStale(entry);
    this.touch(entry);
    return { hit: true, stale, value: entry.value };
  }

  /** 条目年龄（毫秒）。不存在返回 Infinity。 */
  ageOf(key: string): number {
    const entry = this.map.get(key);
    if (!entry) return Infinity;
    return Date.now() - entry.createdAt;
  }

  private touch(entry: CacheEntry<V>): void {
    entry.lastAccessedAt = Date.now();
    entry.accessCount++;
    this.removeFromOrder(entry.key);
    this.order.push(entry.key);
  }

  private isStale(entry: CacheEntry<V>): boolean {
    if (entry.expiresAt === Number.POSITIVE_INFINITY) return false;
    return Date.now() >= entry.expiresAt;
  }

  private evictStale(): void {
    const staleKeys: string[] = [];
    for (const [key, entry] of this.map) {
      if (this.isStale(entry)) {
        staleKeys.push(key);
      }
    }
    for (const key of staleKeys) {
      this.deleteEntry(key, "ttl");
    }
  }

  private deleteEntry(key: string, reason: "size" | "ttl" | undefined): boolean {
    const entry = this.map.get(key);
    if (!entry) return false;
    this.map.delete(key);
    this.removeFromOrder(key);
    this.totalBytes -= entry.size;
    if (reason && this.onEvict) {
      this.onEvict(key, entry.value, reason);
    }
    return true;
  }

  private removeFromOrder(key: string): void {
    const idx = this.order.indexOf(key);
    if (idx !== -1) {
      this.order.splice(idx, 1);
    }
  }

  private defaultSizeOf(value: unknown, _key: string): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === "string") {
      return new Blob([value]).size;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return 8;
    }
    if (value instanceof Uint8Array || value instanceof ArrayBuffer) {
      return value.byteLength;
    }
    if (typeof value === "object") {
      try {
        return new Blob([JSON.stringify(value)]).size;
      } catch {
        return 64;
      }
    }
    return 16;
  }
}
