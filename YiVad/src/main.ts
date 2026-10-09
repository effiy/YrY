import { createApp } from "vue";
import App from "./App.vue";
// reset style sheet
import "@/styles/reset.scss";
// CSS common style sheet
import "@/styles/common.scss";
// iconfont css
import "@/assets/iconfont/iconfont.scss";
// font css
import "@/assets/fonts/font.scss";
// element css
import "element-plus/dist/index.css";
// element dark css
import "element-plus/theme-chalk/dark/css-vars.css";
// custom element dark css
import "@/styles/element-dark.scss";
// element plus css variable mapping
import "@/styles/element-override.css";
// custom element css
import "@/styles/element.scss";
// svg icons
import "@yivad/svg-icons-register";
// element icons
import * as Icons from "@element-plus/icons-vue";
// custom directives
import directives from "@/directives/index";
// vue Router
import router from "@/routers";
// vue i18n
import I18n from "@/languages/index";
// pinia store
import pinia from "@/stores";
// errorHandler
import { setupGlobalErrorHandler, setupUnhandledRejectionHandler, setupGlobalScriptErrorHandler } from "@/utils/errorHandler";
// Global shortcut registry + defaultShortcuts
import { shortcutRegistry } from "@/shortcuts/registry";
import { defaultShortcuts } from "@/shortcuts/defaults";
import mittBus from "@/utils/mittBus";

const app = createApp(App);

// Register global error handlers
setupGlobalErrorHandler(app);
setupUnhandledRejectionHandler();
setupGlobalScriptErrorHandler();

// register the element Icons component
Object.keys(Icons).forEach(key => {
  app.component(key, Icons[key as keyof typeof Icons]);
});

app.use(directives).use(router).use(I18n).use(pinia).mount("#app");

/* ── Global shortcuts registry bootstrap ──────────────────────────────── */
/**
 * 为什么在 main.ts 注册（而不是每个组件/子页面各自调用 useKeyboardShortcuts）：
 *   1. defaultShortcuts 是"全局生命周期"的 — 它们属于 application 级别，不与任何子组件
 *      的 mount/unmount 绑定；把它们放在 indexAsync.vue 生命周期里会在 layout 切回时
 *      出现重复注册（历史 bug：Ctrl+K 触发 2~3 次 mittBus.emit）。
 *   2. shortcutRegistry 需要统一的 document-level 分发点，否则每个组件都各自 addEventListener
 *      会出现 3 层 stopPropagation 竞态，导致 Ctrl+K 被浏览器地址栏抢占。
 *   3. 与 PRD §2 GC-4 的"单一注册点"契约对齐：defaults.ts 永远不会被业务代码 import
 *      进局部组件，避免局部 scope 意外覆盖全局 scope。
 *
 * 执行顺序保证：
 *   a) router 先完成 app.mount() 后，router.afterEach 仍然未 fire；但 __YIVAD_ROUTER__
 *      在 app.mount 之后立即赋值，所以 shortcuts handler 的 G I / G P 永远能拿到。
 *   b) defaultShortcuts 注册时 scope 固定为 global（而不是 input/component/page），这样
 *      registry.buildKeyString 的 scope 排序最后匹配，页面级快捷键优先级更高（对齐
 *      HelpOS 3-way 调度模型的 Best Match 规则）。
 */
for (const s of defaultShortcuts) shortcutRegistry.register({ ...s, scope: "global" });

// 暴露 router 到 window 上，给 defaultShortcuts 中那些不依赖具体组件实例的导航型快捷键使用。
// 只用到 push / replace，不暴露内部。
declare global {
  interface Window {
    __YIVAD_ROUTER__: typeof router;
    __YIVAD_SHOW_SHORTCUT_HELP__?: number;
  }
}
(window as unknown as Record<string, unknown>).__YIVAD_ROUTER__ = router;

/**
 * 全局 keydown 分发（capture:true）。
 *   - 顺序：先执行 registry.handleKeydown（Ctrl+K、G I、a11y 等全局默认），
 *           再执行 CommandPalette 的 local capture 监听器（它会 stopImmediatePropagation 阻止
 *           Chrome 地址栏 ⌘K 抢占；因此这里不能放在 CommandPalette 之后监听，否则
 *           stopImmediatePropagation 会切断 registry 的分发 — 解决方法：registry 在
 *           capture 最早阶段监听，不依赖 stopImmediatePropagation）。
 *   - 当 HelpOS 面板或其他 modal 打开时 shortcutRegistry.setModalOpen(true) 会被调用，
 *     此时除 Escape 外，所有其它 handler 被跳过；这与 indexAsync 版本行为一致。
 */
function onDocumentKeydownCapture(e: KeyboardEvent) {
  // ? / Escape 等非 modifier 键在 <input>/<textarea> 内不触发 handler（避免打断用户输入）
  const target = e.target as HTMLElement | null;
  const tag = target?.tagName ?? "";
  const isEditable = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable === true;

  // 序列（G I）、a11y(? / Escape) 等纯字母按键：当用户正在打字时，直接跳过
  const isModifierCombo = e.ctrlKey || e.metaKey || e.altKey || e.key === "Escape" || e.key === "F2" || e.key === "Delete";
  if (isEditable && !isModifierCombo) return;

  // G 键：开启序列缓冲（仅当不在可编辑控件中时）
  if (!isEditable && e.key && e.key.length === 1 && /^[A-Z]$/i.test(e.key)) {
    const k = e.key.toUpperCase();
    if (k === "G") shortcutRegistry.startSequence(["G"]);
  }

  shortcutRegistry.handleKeydown(e);
}

document.addEventListener("keydown", onDocumentKeydownCapture, { capture: true });

/* ── mittBus ↔ 帮助面板双向绑定（defaultShortcuts 的 mittBus emit 落地） ── */
// shortcuts/defaults.ts 里的 a11y.shortcut-help handler 只 emit('shortcut-help:show')，
// 不直接引用 KeyboardShortcuts 组件，避免 main.ts 引入 .vue 文件破坏类型纯度。
mittBus.on("shortcut-help:show", () => {
  // 策略：双重通道。(1) 设 window 标志位，KeyboardShortcuts 组件 watch；
  //       (2) mittBus 再广播一次（未来其它监听者可用）。
  const w = window as unknown as { __YIVAD_SHOW_SHORTCUT_HELP__?: number };
  w.__YIVAD_SHOW_SHORTCUT_HELP__ = !w.__YIVAD_SHOW_SHORTCUT_HELP__ ? 1 : (w.__YIVAD_SHOW_SHORTCUT_HELP__ | 0) + 1;
  mittBus.emit("shortcut-help:toggle");
});
mittBus.on("a11y:escape", () => {
  // HelpOS / 其它全局 modal 统一关；交由 HelpCenter 自行处理。
  shortcutRegistry.setModalOpen(false);
  mittBus.emit("a11y:escape:fired");
});
