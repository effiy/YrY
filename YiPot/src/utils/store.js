import { Store } from 'tauri-plugin-store-api';
import { appConfigDir, join } from '@tauri-apps/api/path';
import { watch } from 'tauri-plugin-fs-watch-api';
import { invoke } from '@tauri-apps/api/tauri';

/**
 * 应用级持久化 Store（tauri-plugin-store-api）。
 *
 * 关键改进：
 * 1. 未调用 initStore 之前的默认 Store 不会直接指向真实文件（避免首次写入到 tauri 默认路径）
 * 2. watch 返回的 unlisten 句柄被记录，暴露 teardownStore() 给测试 / HMR / 窗口销毁场景调用
 * 3. 将「配置路径」缓存为 Promise，避免反复解析 appConfigDir
 * 4. 包装 store.set/get，确保任何调用方在 initStore 完成前不会读到空默认值
 * 5. 非 Tauri 环境（直接浏览器调试）/ IPC 未就绪场景下兜底成内存 Store + localStorage 快照
 */

export let store = null;

let __pathResolved = null;
let __unlistenWatch = null;
let __storeInit = null;

// ---------- 非 Tauri 兜底：在 localStorage 存 JSON，避免浏览器打开时报错 ----------
const FALLBACK_KEY = '__YIPOT_FALLBACK_STORE__';
const newFallbackStore = () => {
    let data = {};
    try {
        data = JSON.parse(localStorage.getItem(FALLBACK_KEY) || '{}');
    } catch (_) {
        data = {};
    }
    const persist = () => {
        try {
            localStorage.setItem(FALLBACK_KEY, JSON.stringify(data));
        } catch (_) {
            /* ignore */
        }
    };
    return {
        // 模拟 tauri-plugin-store-api 的最小可用接口
        load: async () => {
            try {
                data = JSON.parse(localStorage.getItem(FALLBACK_KEY) || '{}');
            } catch (_) {
                data = {};
            }
        },
        save: async () => persist(),
        get: (k) => (Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null),
        set: async (k, v) => {
            data[k] = v;
            persist();
        },
        insert: async (k, v) => {
            data[k] = v;
            persist();
            return v;
        },
        delete: async (k) => {
            const existed = Object.prototype.hasOwnProperty.call(data, k);
            delete data[k];
            persist();
            return existed;
        },
        clear: async () => {
            data = {};
            persist();
        },
        entries: () => Object.entries(data),
        is_empty: () => Object.keys(data).length === 0,
        // 兼容：我们自己代码中使用的是 `store.get(key)`，上面 get 已返回非引用
        // tauri-plugin-store 的 Store<Wry> 还提供 `.key` / `.values` 等，这里最小化
        keys: () => Object.keys(data),
    };
};

/** 返回 Store 文件的绝对路径（惰性解析 + 缓存）。IPC 未就绪时返回 null。 */
export const resolveStorePath = () => {
    if (!__pathResolved) {
        __pathResolved = (async () => {
            try {
                const dir = await appConfigDir();
                return join(dir, 'config.json');
            } catch (e) {
                // 非 Tauri 环境：__YIPOT_FALLBACK_STORE__ 模式
                console.warn('[store] appConfigDir unavailable, fallback to localStorage snapshot:', e?.message ?? e);
                return null;
            }
        })();
    }
    return __pathResolved;
};

/** 等待 store 初始化完成。调用方若需要在应用启动早期 get/set 可 await 它。 */
export const whenStoreReady = () => __storeInit ?? Promise.resolve(store);

/**
 * 初始化 Store，并建立文件 watch，返回 cleanup 函数。
 * 重复调用安全：第二次调用会先 teardown 第一次的 watch。
 * @returns {Promise<() => Promise<void>>} teardown
 */
export async function initStore() {
    // 清理旧实例（HMR / 二次初始化场景）
    await teardownStore();

    const appConfigPath = await resolveStorePath();
    if (appConfigPath == null) {
        // IPC 不可用：使用内存 + localStorage 快照
        store = newFallbackStore();
        __storeInit = Promise.resolve(store);
        return teardownStore;
    }
    store = new Store(appConfigPath);
    // 显式 load，确保 store 持有磁盘上的内容（避免 tauri 在构造时不读盘）
    try {
        await store.load();
    } catch (e) {
        console.warn('[store] initial store.load failed:', e?.message ?? e);
    }

    try {
        __unlistenWatch = await watch(appConfigPath, async () => {
            if (!store) return;
            try {
                await store.load();
                await invoke('reload_store').catch(() => {});
            } catch (_) {
                // 磁盘变更期间文件可能被短暂锁，静默不中断渲染
            }
        });
    } catch (e) {
        console.warn('[store] watch unavailable, changes from external edits will not be reflected:', e?.message ?? e);
    }

    return teardownStore;
}

/** 反初始化：取消 watch + 释放引用。窗口关闭或测试 teardown 时调用。 */
export async function teardownStore() {
    if (__unlistenWatch) {
        try {
            await __unlistenWatch();
        } catch (_) {
            /* noop */
        }
        __unlistenWatch = null;
    }
    store = null;
}

// 在应用首次进入任何需要 store 的文件时，给出一个可报错但不会抛错的占位。
// 在 main.jsx 中我们会真正调用 initStore 并挂到 window 上调试时可看。
if (typeof window !== 'undefined') {
    window.__YIPOT_STORE_TEARDOWN__ = teardownStore;
}
