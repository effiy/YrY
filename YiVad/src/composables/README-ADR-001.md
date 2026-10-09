# ADR-001 · Hooks vs Composables 分区准则

- **类别**：代码组织 / 架构约定
- **状态**：已采纳（生效日期 2026-10-09）
- **生命周期**：长期（随目录结构演进同步修订；评审周期 = 每个大版本前）
- **评审周期**：每季度一次，或新增 ≥3 个组合式函数时触发
- **角色**：全体前端开发者 / Code Reviewer
- **收益**：
  - 单功能 = 单入口（消除 useXxx 的双份实现隐患）
  - 新人 30 秒内判断「应该把组合函数放哪」
  - 「通用域可被剥离复用 / 业务域不可被别的项目 import」语义清晰
- **验收标准**：
  1. `composables/**` 所有 import 不得出现 `@/stores/modules/`、`@/views/`、`@/api/modules/`（这些是业务域依赖）
  2. `hooks/**` 内若出现「纯函数 + 无业务依赖 + 已有 3 处以上跨域复用」时，须在下个版本迁移到 `composables/`
  3. 任何新增组合式函数须在本文件的索引里登记条目
- **关联记录**：.refactor-reduncies-report.md §2.1；src/hooks/README-ADR-002.md

---

## 1. 决策

**`composables/`**  =  **纯可复用、与 YiVad 业务域无关** 的基础能力。
- 不得 import：`@/stores/modules/*`、`@/api/*`、`@/views/*`、`@/routers/*`
- 允许 import：`vue`、`@vueuse/*`、`@/utils/*`、`@/components/*/types.ts`（仅类型）、`lodash-es` 等工具库

**`hooks/`**  =  **与 YiVad 业务域绑定** 的组合函数。
- 允许 import：业务 store、业务 api、router、views 内共享 composable
- 如果未来要抽成「第三方库」，它不可能被抽出去（因为绑 YiVad 域）

## 2. 目录索引（Composables Side）

```
composables/
├─ dnd/              # 拖拽/排序/缩放通用原语
│  ├─ useDraggable.ts
│  ├─ useDroppable.ts
│  ├─ useSortable.ts
│  ├─ useKeyboardSortable.ts
│  ├─ useTabDrag.ts
│  └─ useGanttDrag.ts
├─ keyboard/         # 键盘类通用能力（与注册表交互，但不绑具体业务 scope）
│  ├─ useKeyboardShortcuts.ts
│  └─ useMenuKeyboard.ts
├─ menu/             # 右键 / 命令菜单通用状态机
│  └─ useContextMenu.ts
├─ domain/           # 「通用复杂域」——只依赖 types/utils（即便它叫 Gantt）
│  ├─ useGanttChart.ts
│  └─ useCommandSearch.ts
├─ useWatermark.ts   # 水印渲染 + 防篡改（可被任意项目复用）
└─ README-ADR-001.md # 本文件
```

> 注：`useUndoRedo / useUndoKeyboard / useTabWorkspace` 因依赖业务 store（undoRedo / tabWorkspace）或 router，已迁移到 `hooks/` 侧。
