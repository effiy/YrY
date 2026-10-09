/**
 * useCommandPalette — App.vue / layouts / 设置页与命令面板交互的统一 inject/provide 入口。
 *
 * 为什么要单独提供一个 composable（而不是直接 import mittBus 到处 .emit）：
 *   1. 测试友好（组件单测时可 mock 注入，不必在 node 环境起全局 mittBus）。
 *   2. 强类型：emit 的 payload 会被 TypeScript 检查，避免未来人改了 open 参数签名时散落各处
 *      的 emit 调用没改全（v1 命令面板就是因为这样出现过 3 处"开面板但初始 query 不生效"的 bug）。
 *   3. 默认走 mittBus fallback：即使调用方忘了 provide，也能 fallback 到全局 mittBus（旧代码兼容）。
 */

import { inject, provide, readonly as _readonly } from "vue";
import mittBus from "@/utils/mittBus";

export interface CommandPaletteHandle {
  /** 打开命令面板；可选 initialQuery 预置搜索词（例：⌘⇧P 从项目详情开 → 预填项目 key） */
  open: (initialQuery?: string) => void;
  /** 关闭命令面板 */
  close: () => void;
  /** 当前是否可见（只读） */
  visible: Readonly<{ value: boolean }>;
  /** 触发一次搜索刷新（跳过 LRU）—— 通常在后端写库完成后调用。 */
  refresh: () => void;
}

export const CommandPaletteKey: symbol = Symbol("yivad.commandPalette");

export function provideCommandPalette(handle: CommandPaletteHandle): CommandPaletteHandle {
  provide(CommandPaletteKey, handle);
  return handle;
}

export function useCommandPalette(): CommandPaletteHandle {
  const injected = inject<CommandPaletteHandle | null>(CommandPaletteKey, null);
  if (injected) return injected;
  // Fallback：没有 provide 时走全局 mittBus + 空 visible stub。
  // 这样 /settings 或第三方模块没挂 provide 时代码也能正常运行（只是不能读 visible）。
  return {
    open: (q?: string) => mittBus.emit("cmd-palette:open", q ? { query: q } : undefined),
    close: () => mittBus.emit("cmd-palette:close"),
    visible: { value: false },
    refresh: () => mittBus.emit("cmd-palette:refresh"),
  };
}

export default useCommandPalette;
