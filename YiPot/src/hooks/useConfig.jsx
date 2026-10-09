import { useEffect, useState, useMemo } from 'react';
import { debounce } from '../utils';
import { store, whenStoreReady } from '../utils/store';

/**
 * 按 store key 全局共享 debounce 句柄（LRU 上限 256）。
 * 旧实现：每调用一次 useConfig(key) 就 new 一个 debounce(500)，
 *   - 一个页面 100+ key → 100+ 个独立 setTimeout
 *   - 组件卸载后句柄未被 cancel（会在 500ms 后触发一次 store.set，虽然结果被覆盖但属于无意义 I/O
 *   - 同一 key 在多组件里各自有独立 debounce，无法合并高频 set）
 *
 * 新实现：
 *   - debounce 实例放在 WeakRef → WeakMap? 不，key 是字符串，用 Map<key, {ref, lastRefTouched}> 维护。
 *   - LRU：超限后 evict 最早未 touched 的 25%
 *   - useEffect cleanup 调用 debounce.cancel，避免卸载后的 setStore 回调
 */

const DEBOUNCE_WAIT_MS = 500;
const MAX_DEBOUNCES = 256;

/** @type {Map<string, { ref: ReturnType<typeof debounce>, touched: number, counter: number }>} */
const __debounces = new Map();
let __serial = 0;

const evictIfNeeded = () => {
    if (__debounces.size < MAX_DEBOUNCES) return;
    // evict 25%
    const evictCount = Math.ceil(MAX_DEBOUNCES / 4);
    const sorted = [...__debounces.entries()].sort((a, b) => a[1].touched - b[1].touched);
    for (let i = 0; i < evictCount && i < sorted.length; i++) {
        const [k, v] = sorted[i];
        try {
            v.ref.cancel();
        } catch {
            /* noop */
        }
        __debounces.delete(k);
    }
};

const getDebounce = (key) => {
    evictIfNeeded();
    const existing = __debounces.get(key);
    if (existing) {
        existing.touched = ++__serial;
        existing.counter += 1;
        return existing.ref;
    }
    const fn = debounce(async (v) => {
        try {
            await whenStoreReady();
            await store.set(key, v);
        } catch (e) {
            // 单个 key 写失败不影响其他调用：此处不抛，只打日志
            // eslint-disable-next-line no-console
            console.warn(`[useConfig] store.set('${key}') failed:`, e);
        }
    }, DEBOUNCE_WAIT_MS);
    __debounces.set(key, { ref: fn, touched: ++__serial, counter: 1 });
    return fn;
};

const releaseDebounce = (key, ref) => {
    const entry = __debounces.get(key);
    if (!entry) {
        try {
            ref.cancel();
        } catch {
            /* noop */
        }
        return;
    }
    entry.counter -= 1;
    if (entry.counter <= 0) {
        try {
            entry.ref.cancel();
        } catch {
            /* noop */
        }
        __debounces.delete(key);
    }
};

/**
 * 原子配置 hook：[state, setState, reset]。
 *   - setState 自动 debounce 写 store（500ms，按 key 共享实例）
 *   - 组件卸载时 cancel 挂起的写
 */
export function useConfig(key, defaultValue = undefined) {
    const [innerValue, setInnerValue] = useState(defaultValue);
    const syncToStore = useMemo(() => getDebounce(key), [key]);

    // 初始化：从 store 加载真实值（如果 store 没 ready，先默认值，ready 后再覆盖）
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                await whenStoreReady();
                const v = await store.get(key);
                if (!cancelled) setInnerValue(v === null || v === undefined ? defaultValue : v);
            } catch {
                // store 初始化失败时保持 defaultValue
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [key, defaultValue]);

    // 卸载 cleanup：cancel 本组件对该 debounce 的使用引用
    useEffect(() => {
        return () => releaseDebounce(key, syncToStore);
    }, [key, syncToStore]);

    const set = (newValue) => {
        setInnerValue(newValue);
        syncToStore(newValue);
    };
    const reset = () => set(defaultValue);

    return [innerValue, set, reset];
}

/** 直接删除某个 store key（含 cancel 对应 debounce）。 */
export const deleteKey = async (key) => {
    const entry = __debounces.get(key);
    if (entry) {
        try {
            entry.ref.cancel();
        } catch {
            /* noop */
        }
        __debounces.delete(key);
    }
    try {
        await whenStoreReady();
        await store.delete(key);
    } catch {
        /* noop */
    }
};

/** 仅在单元测试中使用：清空内部 debounce 缓存 */
export const __flushDebounceCacheForTest = () => {
    for (const [, v] of __debounces) {
        try {
            v.ref.cancel();
        } catch {
            /* noop */
        }
    }
    __debounces.clear();
};
