# ADR-002 · Hooks 业务域组合式函数目录索引

- **类别**：代码组织 / 架构约定
- **状态**：已采纳（生效日期 2026-10-09）
- **生命周期**：长期（每个大版本前同步核对）
- **评审周期**：每季度一次，或新增 ≥3 个 hooks 时触发
- **角色**：全体前端开发者 / Code Reviewer
- **收益**：与 composables/（通用域） 解耦；所有业务域组合函数的 import 图一眼可见；消除「一个功能既在 hooks 又在 composables」的选型歧义
- **验收标准**：
  1. 每个 `hooks/*.ts` 必须在本 ADR 索引中登记「所属业务域 / 关键依赖」
  2. 纯通用能力不得继续新增到 hooks/（触发时机：Code Review 阶段 block）
  3. useUndoRedo / useTabWorkspace / useUndoKeyboard 的迁移自本次 ADR 生效起视为完成
- **关联记录**：src/composables/README-ADR-001.md；.refactor-reduncies-report.md §2.1、§2.8

---

## 1. 迁移登记（2026-10-09）

| Hook | 迁移前路径 | 迁移后路径 | 业务依赖（判据） |
|---|---|---|---|
| useUndoRedo | composables/useUndoRedo.ts | hooks/useUndoRedo.ts | `@/utils/undo/*` + `CommandManager`（业务命令栈） |
| useUndoKeyboard | composables/useUndoKeyboard.ts | hooks/useUndoKeyboard.ts | `@/stores/modules/undoRedo`（业务 store） |
| useTabWorkspace | composables/useTabWorkspace.ts | hooks/useTabWorkspace.ts | `@/stores/modules/tabWorkspace` + `vue-router`（业务路由） |

## 2. Hooks 域索引（按业务域）

| 域 | 代表文件 | 关键依赖 |
|---|---|---|
| 表格 / ProTable 生态 | useTable、useTableState、useTableView、useTableExport、useColumnManager、useSelection、useRowSelection | `@/api/*`、`@/services/sortPersistence`、`@/utils/export` |
| AI Chat 生态 | useAiChatBridge、useAiChatShortcuts、useAiChatTools、useConversationTree、useContextChanges、usePromptHistory、useSlashCommands、useToolRegistry | `@/stores/modules/aiChat/*`、`@/api/interface/yiAi/*` |
| 确认/对话框 | useConfirmAction、useHandleData | `element-plus`（ElMessageBox） |
| 表单 / 向导 | useFormWizard、useConditionalLogic、useAutoSave、useInlineEdit | `@/stores/modules/formDraft`（表单草稿业务态） |
| 撤销重做 | **useUndoRedo**、**useUndoKeyboard**、useUndoRedo（store 代理） | `@/stores/modules/undoRedo` + `@/utils/undo/*` |
| 标签工作区 | **useTabWorkspace** | `@/stores/modules/tabWorkspace` + `vue-router` |
| 项目/知识库/OKR 域 | useProjectDetail、useRelatedByProject、useOkrFormat、useKnowledgeInsight、useDailyInsight、useHomeData、useCodeHealth | `@/api/modules/*` |
| 视图展示/格式化 | useMarkdown、useMermaidRender、useMermaidRenderCache、useMermaidViewer、useCountUp、useAnimatedNumber、useMenuI18n、useTheme、useDownload | `mermaid`、`marked`、`vue-i18n` |
| 指标 / 实时 / 阈值 | useLiveMetrics、useDataFreshness、useSlowThreshold、useSparkLegendToggle | `@/utils` |
| 详情页 / 列表页通用 | useDetailTabs、useTagHelpers、useResizable、useImeComposition | 无业务强绑定，但目前只在业务视图中使用（暂留此侧） |
| 通知 SSE | useNotificationSSE | `eventsource-parser` + `@/api` |
| 工具注册 / AI | useToolRegistry（已在正确域） | `@/stores/modules/aiChat` |
