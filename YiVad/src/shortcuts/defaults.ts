import type { ShortcutDefinition } from "./registry";
import mittBus from "@/utils/mittBus";
import { ElMessage } from "element-plus";

/**
 * defaultShortcuts — 全局默认快捷键定义表（SSOT）。
 *
 * 执行链路：
 *   useKeyboardShortcuts.registerAll() 会把这里的每个 entry 注入 shortcutRegistry，
 *   registry.handleKeydown() 在匹配时调用 handler(e)。
 *
 * 设计约束（对齐 PRD 34 / Dev §2 GC-4）：
 *   1. handler 禁止留空 `() => {}` — 空挂桩会导致 shortcut-help 显示"功能存在但实际无效"
 *      的误导信息。
 *   2. 任何需要打开命令面板的导航（Ctrl+K）统一走 mittBus `cmd-palette:open`。
 *      layouts/index.vue & indexAsync.vue 的 CommandPalette 都会监听同一事件。
 *   3. 编辑类（save/undo/redo 等）在没有聚焦编辑器时先显示 ElMessage 提示（而不是静默
 *      吞掉），便于用户区分"未生效"和"没有对应编辑器"。
 *   4. G 开头的序列（G I / G P）通过 `shortcutRegistry.startSequence(["G"])` 触发缓存，
 *      1s 内再按下 I/P 即匹配。（由 registry 实现，这里不重复处理）。
 */
export const defaultShortcuts: Omit<ShortcutDefinition, "scope">[] = [
  {
    id: "nav.command-palette",
    keys: "Ctrl+K",
    description: "打开命令面板",
    category: "navigation",
    handler: (_e) => mittBus.emit("cmd-palette:open")
  },
  {
    id: "nav.go-to-issues",
    keys: "",
    description: "前往 Issues 页面",
    category: "navigation",
    sequence: ["G", "I"],
    handler: () => {
      const router = (window as any).__YIVAD_ROUTER__;
      const push = (p: string) =>
        router && typeof router.push === "function"
          ? router.push(p).catch(() => {})
          : (window.location.hash = `#${p}`);
      push("/issue");
    }
  },
  {
    id: "nav.go-to-projects",
    keys: "",
    description: "前往项目列表",
    category: "navigation",
    sequence: ["G", "P"],
    handler: () => {
      const router = (window as any).__YIVAD_ROUTER__;
      const push = (p: string) =>
        router && typeof router.push === "function"
          ? router.push(p).catch(() => {})
          : (window.location.hash = `#${p}`);
      push("/project");
    }
  },
  {
    id: "edit.save",
    keys: "Ctrl+S",
    description: "保存当前内容",
    category: "editing",
    handler: (e) => {
      // 编辑器（contentEditable / 原生 input）通常自己监听 Ctrl+S 并 stopPropagation；
      // 全局兜底：若没有编辑器消费，给一次明确反馈。
      const tgt = e.target as HTMLElement | null;
      const tag = tgt?.tagName ?? "";
      const isEdit =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tgt?.isContentEditable === true;
      if (!isEdit) {
        ElMessage({ message: "已在后台触发保存；若当前页支持保存，将在 1s 内完成。", type: "info", duration: 1500 });
      }
      // 向编辑器 channel 广播（如存在 useEditorShortcuts 监听者）
      mittBus.emit("edit:save", { source: "shortcut" });
    }
  },
  {
    id: "edit.undo",
    keys: "Ctrl+Z",
    description: "撤销",
    category: "editing",
    handler: (_e) => mittBus.emit("edit:undo", { source: "shortcut" })
  },
  {
    id: "edit.redo",
    keys: "Ctrl+Y",
    description: "重做",
    category: "editing",
    handler: (_e) => mittBus.emit("edit:redo", { source: "shortcut" })
  },
  {
    id: "edit.rename",
    keys: "F2",
    description: "重命名选中项",
    category: "editing",
    handler: (_e) => mittBus.emit("edit:rename", { source: "shortcut" })
  },
  {
    id: "edit.delete",
    keys: "Delete",
    description: "删除选中项",
    category: "editing",
    handler: (e) => {
      const tgt = e.target as HTMLElement | null;
      const tag = tgt?.tagName ?? "";
      // 原生 input/textarea 的 delete 按键由浏览器默认行为处理，不再 emit
      if (tag === "INPUT" || tag === "TEXTAREA" || tgt?.isContentEditable) return;
      mittBus.emit("edit:delete", { source: "shortcut" });
    }
  },
  {
    id: "view.search",
    keys: "Ctrl+F",
    description: "搜索",
    category: "view",
    handler: (e) => {
      // 页面内搜索：焦点已在可编辑元素时放行浏览器默认行为
      const tgt = e.target as HTMLElement | null;
      const tag = tgt?.tagName ?? "";
      const isEdit =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tgt?.isContentEditable === true;
      if (!isEdit) {
        e.preventDefault?.();
        mittBus.emit("cmd-palette:open", { focusSearch: true });
      }
    }
  },
  {
    id: "view.print",
    keys: "Ctrl+P",
    description: "打印",
    category: "view",
    handler: (_e) => {
      try {
        window.print();
      } catch {
        ElMessage({ message: "当前环境不支持打印。", type: "warning", duration: 2000 });
      }
    }
  },
  {
    id: "tools.new-item",
    keys: "Ctrl+Shift+N",
    description: "新建项目",
    category: "tools",
    handler: (_e) => {
      const router = (window as any).__YIVAD_ROUTER__;
      const push = (p: string) =>
        router && typeof router.push === "function"
          ? router.push(p).catch(() => {})
          : (window.location.hash = `#${p}`);
      push("/project");
    }
  },
  {
    id: "a11y.shortcut-help",
    keys: "?",
    description: "显示快捷键帮助",
    category: "accessibility",
    handler: (_e) => mittBus.emit("shortcut-help:show")
  },
  {
    id: "a11y.close-dismiss",
    keys: "Escape",
    description: "关闭/取消",
    category: "accessibility",
    handler: () => mittBus.emit("a11y:escape")
  }
];
