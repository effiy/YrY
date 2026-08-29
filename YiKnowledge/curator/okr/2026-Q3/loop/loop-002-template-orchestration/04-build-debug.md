---
type: loop-record
loopId: loop-002
stage: build-debug
title: 清零 23 个 vue-tsc 既有类型错误 + 新增 3 类模板
role: engineer
goalId: eng-005
status: done
created: 2026-08-17
updated: 2026-08-17
tags: [loop-record, build-debug, vue-tsc, type-safety]
---

# 04 构建调试 — loop-002

> 需求编号：loop-002 · 负责人：Engineering Lead · 状态：已完成

## 改动文件清单

| 文件 | 改动类型 | 说明 |
|---|---|---|
| `YiVad/src/views/dashboard/knowledgeBase/index.vue` | 修改 | 补 `Refresh`/`Search` 图标导入 + 17 处 `DefaultRow→KnowledgeFileSummary` 收窄 |
| `YiVad/src/views/rag/history.vue` | 修改 | 2 处 `DefaultRow→HistoryEntry` 收窄 |
| `YiVad/src/views/rag/retrieval.vue` | 修改 | 2 处 `DefaultRow→RagSource` 收窄 |
| `YiVad/src/views/proTable/complexProTable/index.vue` | 修改 | 补泛型约束 `T extends Record<PropertyKey, any>` |
| `YiVad/src/views/system/menuMange/index.vue` | 修改 | `el-tree-select` `props.value`→`node-key` |
| `YiKnowledge/curator/okr/2026-Q3/loop/_templates/03-code-review.md` | 新增 | 代码审查模板（5 维度：架构/类型/安全/性能/可维护） |
| `YiKnowledge/curator/okr/2026-Q3/loop/_templates/06-deployment.md` | 新增 | 部署记录模板（部署步骤 + 验证 + 回滚预案） |
| `YiKnowledge/curator/okr/2026-Q3/loop/_templates/08-retrospective.md` | 新增 | 复盘总结模板（Keep/Improve/行动项） |
| `YiKnowledge/curator/okr/2026-Q3/loop/INDEX.md` | 修改 | 更新为 8 阶段目录结构 + frontmatter 规范 |

## 问题 → 修复 → 验证

| # | 问题 | 根因 | 修复 | 验证结果 |
|---|---|---|---|---|
| 1 | knowledgeBase 模板用 `:icon="Refresh"` / `:prefix-icon="Search"` 但未导入 | 图标作为值绑定使用，auto-import 不处理表达式 | 显式 `import { Refresh, Search } from "@element-plus/icons-vue"` | ✅ 0 错误 |
| 2 | knowledgeBase 17 处 `DefaultRow` 传给 `KnowledgeFileSummary` 形参 | el-table slot 的 `row` 推断为 `DefaultRow` | 调用点 `as KnowledgeFileSummary` 收窄 | ✅ 0 错误 |
| 3 | rag history/retrieval 4 处同样问题 | 同上 | `as HistoryEntry` / `as RagSource` 收窄 | ✅ 0 错误 |
| 4 | complexProTable `SummaryMethodProps<T>` 泛型无约束 | `TableColumnCtx<T>` 要求 `T extends DefaultRow` | 加约束 `T extends Record<PropertyKey, any>` | ✅ 0 错误 |
| 5 | menuMange el-tree-select `props.value` 报 TS2353 | Element Plus 2.14 已移除 `TreeOptionProps.value` | 改用 `node-key="path"` | ✅ 0 错误 |

## 门禁结果

| 门禁 | 命令 | 结果 |
|---|---|---|
| 类型检查 | `pnpm type:check`（vue-tsc --noEmit --skipLibCheck） | ✅ 0 错误 |
| Lint | `pnpm lint`（ESLint + Prettier + Stylelint） | ✅ 通过 |
| 构建 | `pnpm build:dev`（vue-tsc && rsbuild build） | ✅ 成功 |

## 遗留项

- 无阻塞项。23 个既有类型错误已全部清零，维护 0 错误基线。
- `knowledgeBase` 17 处 `as` 收窄可后续提取为 composable（非阻塞）。