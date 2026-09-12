---
title: 多个 composable/hook 模块存在死代码
tags: [yipet, code-quality, code-smell, dead-code]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# 多个 composable/hook 模块存在死代码

## 现象

代码库中存在 5 个 composable 文件和 2 个 hook 文件，它们在各自的 `src/chat/composables/` 和 `src/hooks/` 目录中被定义和导出，但没有任何生产代码导入它们。

| 文件 | 注释声称来源 | 状态 |
|------|-------------|------|
| `src/chat/composables/useMentionDetection.ts` | Extracted from ChatInput.vue | ChatInput.vue 有内联实现，从未使用此 composable |
| `src/chat/composables/useExpandCollapse.ts` | Extracted from MessageBubble.vue | 从未被导入 |
| `src/chat/composables/usePromptHistory.ts` | Extracted from ChatToolbar.vue | 从未被导入 |
| `src/chat/composables/useTokenTrend.ts` | Extracted from MessageBubble.vue | 从未被导入 |
| `src/chat/composables/useRagSources.ts` | Extracted from MessageBubble.vue | 从未被导入 |
| `src/hooks/useTheme.ts` | Mirrors YiVad's useTheme | 从未被导入 |
| `src/hooks/useMessage.ts` | Mirrors YiVad's useMessage pattern | 从未被导入 |

这些文件总计约 250+ 行 —— 它们曾在重构过程中从组件中"抽出"，但调用点从未更新为使用新的 composable。组件保留了原始的内联实现，使 composable 成为孤立的。

## 根因分析

这些 composable 是在重构过程中创建的（注释为 "Extracted from MessageBubble.vue" / "Extracted from ChatToolbar.vue"），但调用它们的组件从未被更新为导入和使用它们。组件保留了原始的内联实现，使 composable 文件成为死代码。

## 涉及文件

- `src/chat/composables/useMentionDetection.ts` — ~42 行，ChatInput.vue 有重复的内联实现（第 44-69 行）
- `src/chat/composables/useExpandCollapse.ts` — ~83 行，导出 `useExpandCollapse`、`formatDuration`、`previewContent`、`callLatencyLevel`
- `src/chat/composables/usePromptHistory.ts` — ~63 行，导入自 `useTextSearch`（使 `useTextSearch` 也被牵连）
- `src/chat/composables/useTokenTrend.ts` — ~66 行
- `src/chat/composables/useRagSources.ts` — ~112 行
- `src/hooks/useTheme.ts` — ~25 行
- `src/hooks/useMessage.ts` — ~35 行

## 修复方案

1. **移除死代码**：删除未使用的 composable 文件 —— 如果功能确有需求，将组件重构为使用 composable
2. **接线 composable**（备选方案）：如果 composable 包含的是有意设计的功能，重构组件使其调用 composable 而非内联实现：

   - `useMentionDetection` → 接线到 `ChatInput.vue`（替换内联的 `updateMention()` / `mentionQuery` / 等）
   - `useExpandCollapse` + `useTokenTrend` + `useRagSources` → 接线到 `MessageBubble.vue`
   - `usePromptHistory` → 接线到 `ChatToolbar.vue` 或 `ChatInput.vue`

推荐方案：如果可以移除就移除。除非有计划重新接线到组件中，否则不应保留已提取但未接线的 composable。保留会造成混淆 —— 读者会认为它们正在被使用。


## 影响范围

**影响模块**：多个 composable/hook 模块。
**影响用户**：死代码增加构建产物体积，新开发者可能误用已废弃的 composable。
**影响范围**：`src/chat/composables/` 和 `src/hooks/` 目录。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 工具 | 使用 `ts-prune` 或 ESLint `no-unused-vars` 检测未使用的导出 | DevOps |
| 流程 | 定期清理未使用的 composable 和 hook 模块 | 开发者 |
| 代码 | 废弃的 composable 添加 `@deprecated` JSDoc 注释 | 开发者 |
| 构建 | Tree-shaking 可以移除未使用的导出，但代码库需要保持整洁 | DevOps |


## 经验教训

死代码有隐蔽的成本——新开发者阅读代码时会尝试理解它，构建工具需要处理它，它增加了搜索和导航的噪音。删除死代码是最简单的代码质量改进之一。
