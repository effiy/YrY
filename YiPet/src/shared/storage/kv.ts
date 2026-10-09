/**
 * Unified chrome.storage.local wrapper — type-safe KV helpers with built-in
 * error isolation, value validation, and map/patch primitives.
 *
 * Replaces ~dozens of identical boilerplate blocks scattered across 12+ files:
 *   try {
 *     const r = await chrome.storage.local.get(KEY);
 *     const val = r[KEY];
 *     if (typeof val === '...') return val;
 *   } catch { ... }
 *   return fallback;
 *
 * Every helper is safe to call outside the extension context
 * (e.g. unit tests, iframe sandboxes) — it degrades to a noop/fallback silently.
 */

/* ═══════════════════════════════════════════════════════════════════════
   Context detection
   ═══════════════════════════════════════════════════════════════════════ */

type ChromeStorageArea = 'local' | 'sync' | 'session';

function hasStorageArea(area: ChromeStorageArea): boolean {
  try {
    if (typeof chrome === 'undefined' || !chrome.storage) return false;
    const store = chrome.storage[area];
    return !!store
      && typeof store.get === 'function'
      && typeof store.set === 'function'
      && typeof store.remove === 'function';
  } catch {
    return false;
  }
}

const hasStorageLocal = () => hasStorageArea('local');
const hasStorageSync  = () => hasStorageArea('sync');

/* ═══════════════════════════════════════════════════════════════════════
   Cross-area primitives (local + sync) — internal use only
   ═══════════════════════════════════════════════════════════════════════ */

async function _readFromArea<T = unknown>(
  area: ChromeStorageArea,
  key: string,
): Promise<T | null> {
  if (!hasStorageArea(area)) return null;
  try {
    const store = chrome.storage[area];
    const result = await store.get([key]);
    const raw = result?.[key];
    return raw === undefined ? null : (raw as T);
  } catch {
    return null;
  }
}

async function _writeToArea<T>(
  area: ChromeStorageArea,
  key: string,
  value: T,
): Promise<boolean> {
  if (!hasStorageArea(area)) return false;
  try {
    await chrome.storage[area].set({ [key]: value });
    return true;
  } catch {
    return false;
  }
}

async function _removeFromArea(
  area: ChromeStorageArea,
  key: string,
): Promise<boolean> {
  if (!hasStorageArea(area)) return false;
  try {
    await chrome.storage[area].remove(key);
    return true;
  } catch {
    return false;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   Core primitives (local area — default for all YiPet state)
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Read a single key from chrome.storage.local.
 * Returns `null` when the key is missing, the context has no storage API,
 * or the read throws.
 */
export async function readKV<T = unknown>(key: string): Promise<T | null> {
  return _readFromArea<T>('local', key);
}

/**
 * Write a single key to chrome.storage.local.
 * Returns `true` on success, `false` on any failure.
 */
export async function writeKV<T = unknown>(key: string, value: T): Promise<boolean> {
  return _writeToArea<T>('local', key, value);
}

/**
 * Remove a single key from chrome.storage.local.
 * Returns `true` on success, `false` on any failure.
 */
export async function removeKV(key: string): Promise<boolean> {
  return _removeFromArea('local', key);
}

/**
 * Subscribe to changes for a specific key (chrome.storage.local only).
 * Returns an unsubscribe function. Safe noop outside extension context.
 */
export function watchKV<T = unknown>(
  key: string,
  onChange: (newValue: T | null, oldValue: T | null) => void,
): () => void {
  if (!hasStorageLocal() || typeof chrome.storage?.onChanged?.addListener !== 'function') {
    return () => {};
  }
  const listener = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
    if (areaName !== 'local') return;
    if (!changes[key]) return;
    const ch = changes[key];
    onChange(
      ch.newValue === undefined ? null : (ch.newValue as T),
      ch.oldValue === undefined ? null : (ch.oldValue as T),
    );
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged?.removeListener?.(listener);
}

/* ═══════════════════════════════════════════════════════════════════════
   Sync-area with local fallback (user-preference tiered persistence)
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Try `chrome.storage.sync` first, fall back to `chrome.storage.local`.
 * Used for user-level preferences that should roam across signed-in Chrome
 * profiles, but degrade gracefully when sync storage is unavailable
 * (managed devices, guest mode, enterprise policy).
 */
export async function readSyncWithFallback<T = unknown>(key: string): Promise<T | null> {
  const fromSync = await _readFromArea<T>('sync', key);
  if (fromSync !== null) return fromSync;
  return readKV<T>(key);
}

/**
 * Try to write to `chrome.storage.sync` first; on failure, persist to local.
 * Returns `true` if either area accepted the write.
 */
export async function writeSyncWithFallback<T>(key: string, value: T): Promise<boolean> {
  const syncOk = await _writeToArea<T>('sync', key, value);
  if (syncOk) return true;
  return writeKV<T>(key, value);
}

/**
 * Remove a key from BOTH sync and local areas (best-effort — failures are
 * swallowed, because cleanup should never break surrounding logic).
 * Returns `true` if at least one area accepted the removal.
 */
export async function removeSyncAndLocal(key: string): Promise<boolean> {
  const syncOk = await _removeFromArea('sync', key);
  const localOk = await removeKV(key);
  return syncOk || localOk;
}

/* ═══════════════════════════════════════════════════════════════════════
   Validated reads (with fallback)
   ═══════════════════════════════════════════════════════════════════════ */

/** Validator predicate — narrows `unknown` to `T`. */
export type ValidatorFn<T> = (raw: unknown) => raw is T;

/**
 * Read a key and validate its type. Returns the fallback when missing, invalid,
 * or on I/O error.
 */
export async function readValidatedKV<T>(
  key: string,
  fallback: T,
  validator: ValidatorFn<T> | ((raw: unknown) => boolean),
): Promise<T> {
  const raw = await readKV<T>(key);
  if (raw === null) return fallback;
  try {
    return validator(raw as unknown) ? (raw as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Convenience: read a string key. */
export async function readStringKV(key: string, fallback: string | null = null): Promise<string | null> {
  const raw = await readKV<unknown>(key);
  return typeof raw === 'string' ? raw : fallback;
}

/** Convenience: read a number key. */
export async function readNumberKV(key: string, fallback: number | null = null): Promise<number | null> {
  const raw = await readKV<unknown>(key);
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : fallback;
}

/** Convenience: read a boolean key. Accepts 'true'/'1' string legacy values. */
export async function readBoolKV(key: string, fallback: boolean | null = null): Promise<boolean | null> {
  const raw = await readKV<unknown>(key);
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'string' && (raw === 'true' || raw === '1')) return true;
  if (typeof raw === 'string' && (raw === 'false' || raw === '0')) return false;
  if (typeof raw === 'number') return raw !== 0;
  return fallback;
}

/** Convenience: read and merge a plain-object key with defaults (shallow). */
export async function readObjectKV<T extends object>(
  key: string,
  defaults: T,
): Promise<T> {
  const raw = await readKV<unknown>(key);
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return { ...defaults, ...(raw as Partial<T>) };
  }
  return { ...defaults };
}

/* ═══════════════════════════════════════════════════════════════════════
   Map-keyed operations — `{ [subKey]: V }` stored under a single storage key
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Read one entry from a map stored at `mapKey`.
 *
 * Pattern:   storage.local[mapKey] = { "tab-42": { ... }, "tab-43": { ... } }
 * Usage:     const tab = await readMapEntry<{visible: boolean}>('tabs_map', 'tab-42', {});
 */
export async function readMapEntry<V>(
  mapKey: string,
  subKey: string | number,
  fallback: V,
): Promise<V> {
  const map = await readKV<Record<string | number, V>>(mapKey);
  if (!map || typeof map !== 'object') return fallback;
  const entry = map[subKey];
  return entry === undefined ? fallback : entry;
}

/**
 * Atomically patch one entry inside a map (read → merge → write).
 * Returns the updated entry (old + patch, shallow merge).
 */
export async function patchMapEntry<V extends object>(
  mapKey: string,
  subKey: string | number,
  patch: Partial<V>,
  fallbackBase: V = {} as V,
): Promise<V> {
  const current = await readMapEntry<V>(mapKey, subKey, fallbackBase);
  const updated: V = { ...current, ...patch } as V;
  // Re-read the full map to avoid dropping concurrent writes to other sub-keys
  const map = (await readKV<Record<string | number, V>>(mapKey)) || ({} as Record<string | number, V>);
  (map as Record<string | number, V>)[subKey] = updated;
  await writeKV(mapKey, map);
  return updated;
}

/** Fully replace a map key with a new sub-entry map (equivalent to writeKV). */
export async function writeMapEntry<V>(
  mapKey: string,
  subKey: string | number,
  value: V,
): Promise<void> {
  const map = (await readKV<Record<string | number, V>>(mapKey)) || ({} as Record<string | number, V>);
  (map as Record<string | number, V>)[subKey] = value;
  await writeKV(mapKey, map);
}

/* ═══════════════════════════════════════════════════════════════════════
   Session storage (in-memory, not persisted — for secrets/auth tokens)
   ═══════════════════════════════════════════════════════════════════════ */

/** True when chrome.storage.session is available (MV3 only, not in tests). */
function hasStorageSession(): boolean {
  return hasStorageArea('session');
}

/** Read a key from chrome.storage.session (in-memory, non-persistent). */
export async function readSessionKV<T = unknown>(key: string): Promise<T | null> {
  return _readFromArea<T>('session', key);
}

/** Write a key to chrome.storage.session (in-memory, non-persistent). */
export async function writeSessionKV<T>(key: string, value: T): Promise<boolean> {
  return _writeToArea<T>('session', key, value);
}

/* ═══════════════════════════════════════════════════════════════════════
   Batch & object patch — N keys, one round-trip
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Batch-read multiple storage.local keys in a single round-trip.
 * Missing keys are omitted from the returned map (no `null` placeholder).
 */
export async function readBatchKV<T extends Record<string, unknown>>(
  keys: Array<keyof T & string>,
): Promise<Partial<T>> {
  if (!hasStorageLocal()) return {};
  try {
    const raw = await chrome.storage.local.get(keys as string[]);
    const out: Partial<T> = {} as Partial<T>;
    for (const k of keys) {
      if (k in raw) (out as Record<string, unknown>)[k] = raw[k];
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Shallow-patch the object stored at `key`. If no value exists yet,
 * `defaults` is used as the base before applying the patch.
 *
 * Equivalent to:
 *   const curr = (await readKV(key)) ?? defaults;
 *   await writeKV(key, { ...curr, ...patch });
 */
export async function patchObjectKV<T extends object>(
  key: string,
  patch: Partial<T>,
  defaults: T = {} as T,
): Promise<T> {
  const curr = await readKV<unknown>(key);
  const base: T =
    curr && typeof curr === 'object' && !Array.isArray(curr) ? (curr as T) : defaults;
  const updated: T = { ...base, ...patch } as T;
  await writeKV<T>(key, updated);
  return updated;
}

/* ────────────────────────────────────────────────────────────────────────
   Batch writes (symmetric to readBatchKV)
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Write multiple unrelated KV entries in a single `chrome.storage.local.set`
 * call. Internal try/catch + capability check is handled just like writeKV.
 * Returns `true` only when the whole batch succeeded.
 *
 * Use instead of several individual `writeKV` calls when you want to
 * reduce IPC round-trips (e.g. `resetXxxSettings()` blocks).
 */
export async function writeBatchKV(entries: Record<string, unknown>): Promise<boolean> {
  if (!hasStorageLocal()) return false;
  try {
    await chrome.storage.local.set(entries);
    return true;
  } catch {
    return false;
  }
}
