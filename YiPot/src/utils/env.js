import { type as osTypeFn, arch as archFn, version } from '@tauri-apps/api/os';
import { getVersion } from '@tauri-apps/api/app';

export let osType = '';
export let arch = '';
export let osVersion = '';
export let appVersion = '';

/**
 * 初始化运行时环境字段。
 * 非 Tauri 窗口（直接浏览器访问 vite）或 IPC 未就绪时，给出合理默认值并吞掉异常，
 * 避免在 `pnpm tauri dev` 控制台 / 浏览器控制台出现未处理的 rejected Promise。
 */
export async function initEnv() {
    // 快速识别：无 window.__TAURI_METADATA__ 时，直接用 navigator / platform 兜底
    const hasTauri = typeof window !== 'undefined' && !!window.__TAURI_METADATA__;
    try {
        osType = await osTypeFn();
        arch = await archFn();
        osVersion = await version();
        appVersion = await getVersion();
    } catch (e) {
        const warn = (msg) => (hasTauri ? console.warn : console.info)(`[env] ${msg}`, e?.message ?? e);
        warn('Tauri OS API unavailable, using browser fallback');
        try {
            osType =
                (typeof navigator !== 'undefined' &&
                    (navigator.platform || navigator.userAgentData?.platform)) ||
                '';
            arch = '';
            osVersion =
                (typeof navigator !== 'undefined' && navigator.userAgent) || '';
            appVersion = '';
        } catch (_) {
            /* final noop */
        }
    }
}
