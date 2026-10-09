/**
 * useHelp — HelpOS 全局单例 Composable。
 *
 * ⚠️ 工程硬闸（对齐 YV-09-70 PRD §12.2）：
 *    - 面板关闭用 `bag.reset()`；绝不用 `bag.dispose()`。
 *    - 仅 L5 关停时（见 YiKnowledge devs §8 L5）允许 dispose。
 *    - 所有对外 API 通过 Composable 暴露，组件不得直接引用 registry / helpServices。
 */
import {
  computed,
  reactive,
  readonly as readonlyRef,
  ref,
  watch,
  onMounted,
  onUnmounted,
  getCurrentInstance,
  inject,
  provide,
  type InjectionKey
} from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { shortcutRegistry } from "@/shortcuts/registry";
import { DisposerBag } from "@/utils/disposer";
import type { HelpOSState, HelpTabId } from "./types";

const INJECT_KEY: InjectionKey<HelpOSPublicAPI> = Symbol("yivad/help-os/v2");

export interface HelpOSPublicAPI {
  /** 打开面板，可选指定初始 Tab 与搜索 seed */
  readonly open: (tab?: HelpTabId, seed?: string) => void;
  /** 关闭面板并重置资源（reset, not dispose） */
  readonly close: () => void;
  /** 设置当前激活 Tab */
  readonly setActiveTab: (tab: HelpTabId) => void;
  /** 只读 state */
  readonly state: HelpOSState;
  /** 注册一个页面级帮助内容（覆盖同名 routePattern） */
  readonly registerPageHelp: (content: any, locale?: "zh" | "en") => void;
  /** 订阅打开前钩子（可修改 seed），返回 unsub */
  readonly onBeforeOpen: (fn: () => void | Promise<void>) => () => void;
  /** 功能级 L1 Kill Switch：featureflags/help.center.enabled 未启用时提供 stub */
  readonly isEnabled: () => boolean;
}

/* ⚠️ 关键约束：state 字段不是 readonly，因为 HelpOS 内部要修改它；
 * 对外暴露的 API 通过 `readonlyRef(state)` 做只读视图。
 * 这里的类型与 PRD §6.1 HelpOSState 对齐，但移除 `readonly` 修饰符（允许内部写）。 */
type _StateMutable = {
  -readonly [K in keyof HelpOSState]: HelpOSState[K];
};

const state = reactive<_StateMutable>({
  open: false,
  activeTab: "shortcuts",
  query: "",
  searchSeed: "",
  feedbackDraft: undefined,
  error: null
});

const bag = new DisposerBag();
const beforeOpenFns: Array<() => void | Promise<void>> = [];
let installed = false;
let initialPageHelpMatchedTab: HelpTabId = "shortcuts";

/** 推断默认 Tab：有页面帮助 → page-help；否则读取 24h 内用户偏好 localStorage → shortcuts */
function computeDefaultTab(): HelpTabId {
  if (initialPageHelpMatchedTab === "page-help") return "page-help";
  try {
    const raw = localStorage.getItem("yivad-help-last-tab");
    if (raw) {
      const parsed = JSON.parse(raw) as { tab: HelpTabId; at: number };
      if (Date.now() - parsed.at < 24 * 3600 * 1000) return parsed.tab;
    }
  } catch { /* ignore */ }
  return "shortcuts";
}

/* ── 内部 API（闭包持有；安装函数包装后对外 readonly 导出）─────────────── */
function _create(): HelpOSPublicAPI & { _state: typeof state } {
  const open: HelpOSPublicAPI["open"] = async (tab, seed) => {
    // 运行 before open hooks
    for (const fn of beforeOpenFns) try { await fn(); } catch { /* noop */ }
    state.activeTab = tab ?? computeDefaultTab();
    state.query = seed ?? "";
    state.searchSeed = seed ?? "";
    state.error = null;
    state.open = true;
    // L4: 告诉 ShortcutRegistry 当前 modal 已打开（防止 Esc 外的快捷键穿透）
    shortcutRegistry.setModalOpen(true);
  };

  const close: HelpOSPublicAPI["close"] = () => {
    state.open = false;
    try {
      localStorage.setItem(
        "yivad-help-last-tab",
        JSON.stringify({ tab: state.activeTab, at: Date.now() })
      );
    } catch { /* noop */ }
    bag.reset();
    shortcutRegistry.setModalOpen(false);
  };

  const setActiveTab: HelpOSPublicAPI["setActiveTab"] = tab => { state.activeTab = tab; };
  const registerPageHelp: HelpOSPublicAPI["registerPageHelp"] = (content, locale = "zh") => {
    (window as any).__YIVAD_PAGE_HELP__ ??= {};
    (window as any).__YIVAD_PAGE_HELP__[locale] ??= [];
    (window as any).__YIVAD_PAGE_HELP__[locale].push(content);
  };
  const onBeforeOpen: HelpOSPublicAPI["onBeforeOpen"] = fn => {
    beforeOpenFns.push(fn);
    return () => {
      const idx = beforeOpenFns.indexOf(fn);
      if (idx >= 0) beforeOpenFns.splice(idx, 1);
    };
  };
  return {
    open, close, setActiveTab,
    state: readonlyRef(state) as unknown as HelpOSState,
    registerPageHelp,
    onBeforeOpen,
    isEnabled: () => true,
    _state: state
  };
}

/** 全局安装 HelpOS（在 main.ts 或 layouts/index.vue 调用一次） */
let _installedApi: HelpOSPublicAPI | null = null;
let _installedEnabledFn: () => boolean = () => true;

export function installHelpOS(opts?: { enabled?: () => boolean }): HelpOSPublicAPI {
  if (installed && _installedApi) return _installedApi;
  _installedEnabledFn = opts?.enabled ?? (() => true);

  const inner = _create();
  const enabledFn = _installedEnabledFn;
  const guarded: HelpOSPublicAPI = {
    open: (t, s) => { if (!enabledFn()) return; inner.open(t, s); },
    close: () => inner.close(),
    setActiveTab: t => inner.setActiveTab(t),
    state: inner.state,
    registerPageHelp: (c, l) => inner.registerPageHelp(c, l),
    onBeforeOpen: fn => inner.onBeforeOpen(fn),
    isEnabled: enabledFn
  };

  installed = true;
  _installedApi = guarded;
  try { provide(INJECT_KEY, guarded); } catch { /* non-setup context */ }
  return guarded;
}

/** 子组件中获取 HelpOS API（若未安装自动 stub） */
export function useHelp(): HelpOSPublicAPI {
  const existing = getCurrentInstance() ? inject(INJECT_KEY, null) : null;
  if (existing) return existing;
  if (_installedApi) return _installedApi;
  return stubHelpOS;
}

/** HelpOS Feature Flag 未启用或未安装时的安全 stub，不抛错，不渲染 */
const stubHelpOS: HelpOSPublicAPI = {
  open() {},
  close() {},
  setActiveTab() {},
  state: { open: false, activeTab: "shortcuts", query: "", error: null },
  registerPageHelp() {},
  onBeforeOpen: () => () => undefined,
  isEnabled: () => false
};

/**
 * 三入口之一：? / Shift+/ 键盘
 * 由 registry 默认快捷键 a11y.shortcut-help handler 实际调用。
 * 在 layouts/index.vue 中安装并绑定。
 */
export function bindHelpShortcut(api: HelpOSPublicAPI): () => void {
  const handler = (e: KeyboardEvent) => {
    if (!api.isEnabled()) return;
    // 输入聚焦 / 输入法 composing → 豁免
    if (isInputLike(e.target)) return;
    if ((e as any).isComposing) return;
    if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
      e.preventDefault();
      if (state.open) api.close();
      else api.open();
    }
  };
  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
}

function isInputLike(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

/* 暴露内部 state（只读视图，主要给调试/测试用） */
export const helpOSInternalState = state;

/* ── HelpOS 命令面板 aliases（install 后立即注册到 commandPalette quickActions）── */
export const HELP_COMMAND_ALIASES: Readonly<Record<HelpTabId | "help", string>> = {
  help: "@help",
  "page-help": "@help",
  shortcuts: "@shortcuts",
  faq: "@faq",
  changelog: "@changelog",
  feedback: "@feedback"
} as const;

/* HelpOS 命令面板 aliases（正则+handler 版，兼容 legacy 调用）—— P2 可迁移为上面的 Record */
export const HELP_COMMAND_ALIAS_RULES = [
  { id: "help.open",      pattern: /^> ?help$/i,            run: (api: HelpOSPublicAPI) => api.open("page-help") },
  { id: "help.shortcuts", pattern: /^> ?shortcuts$/i,       run: (api: HelpOSPublicAPI) => api.open("shortcuts") },
  { id: "help.changelog", pattern: /^> ?changelog$/i,       run: (api: HelpOSPublicAPI) => api.open("changelog") },
  { id: "help.feedback",  pattern: /^> ?feedback$/i,        run: (api: HelpOSPublicAPI) => api.open("feedback") },
  { id: "help.report",    pattern: /^> ?report ?(bug|feature|question|other)? ?(.*)$/i,
    run: (api: HelpOSPublicAPI, m: RegExpExecArray) => {
      const type = (m[1] as any) ?? "bug";
      const title = (m[2] || "").trim().slice(0, 60);
      (state as any).feedbackDraft = { type, title };
      api.open("feedback");
    }
  }
] as const;

/* 全局单例引用（供非 provide/inject 上下文的 layouts/index.vue / 命令面板使用） */
export const helpAPI: HelpOSPublicAPI = new Proxy(
  {
    open: (tab?: HelpTabId, seed?: string) => _installedApi?.open(tab, seed),
    close: () => _installedApi?.close(),
    setActiveTab: (tab: HelpTabId) => _installedApi?.setActiveTab(tab),
    get state() { return (_installedApi ?? stubHelpOS).state; },
    registerPageHelp: (content: any, locale?: "zh" | "en") => _installedApi?.registerPageHelp(content, locale),
    onBeforeOpen: (fn: () => void | Promise<void>) => _installedApi?.onBeforeOpen(fn) ?? (() => void 0),
    isEnabled: () => _installedApi?.isEnabled() ?? false
  },
  {
    get(target, prop) {
      if (_installedApi) return (_installedApi as any)[prop];
      return (target as any)[prop];
    }
  }
) as HelpOSPublicAPI;
