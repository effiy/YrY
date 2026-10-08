---
title: 8 个 hooks 文件未被任何代码引用（死代码）
tags: [yivad, code-quality, dead-code, code-smell]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: minor
priority: p2
benefit: "缺陷记录：质量-未使用的hooks死代码"
lifecycle: active
---

# 8 个 hooks 文件未被任何代码引用（死代码）

## 现象

扫描 `YiVad/src/hooks/` 目录（44 个文件），发现以下 8 个 hooks 文件仅在自身文件中被引用，未被项目中任何其他文件导入或使用：

1. `useChatContext.ts` (93 lines)
2. `useCollapse.ts` (32 lines)
3. `useSseReconnect.ts` (36 lines)
4. `useOptimisticUpdate.ts` (32 lines)
5. `useRssReadStar.ts` (43 lines)
6. `useKnowledgeDragDrop.ts` (108 lines)
7. `useRssAiChat.ts` (93 lines)
8. `useMermaid.ts` (11 lines)
9. `useReadingList.ts` (约 30 lines)

## 根因分析

这些文件可能是以下原因造成的死代码：

- **重构残留**：功能被迁移到其他位置（如 composable 内联到组件中），但原文件未被删除。例如 `useCollapse` 的逻辑已内联到 `AiChatBox.vue` 中，`useMermaid` 的功能通过 `useMarkdown.ts` 中的 `runMermaid` 直接暴露。
- **提前抽象**：为未来功能提前创建的 hooks，但实际功能从未接入。例如 `useSseReconnect` 创建了 AbortController 但从未暴露给调用方，`useOptimisticUpdate` 的乐观更新模式未被任何组件使用。
- **功能废弃**：RSS 相关 hooks（`useRssReadStar`、`useRssAiChat`）可能因 RSS 功能重构而废弃。

## 涉及文件

- `YiVad/src/hooks/useChatContext.ts` — 未使用，93 行 Pi-inspired context building pipeline
- `YiVad/src/hooks/useCollapse.ts` — 未使用，功能已在 AiChatBox.vue 中内联实现
- `YiVad/src/hooks/useSseReconnect.ts` — 未使用，AbortController 创建后未暴露
- `YiVad/src/hooks/useOptimisticUpdate.ts` — 未使用，含硬编码中文 "操作失败"
- `YiVad/src/hooks/useRssReadStar.ts` — 未使用，RSS 收藏功能
- `YiVad/src/hooks/useKnowledgeDragDrop.ts` — 未使用，知识文件拖拽功能
- `YiVad/src/hooks/useRssAiChat.ts` — 未使用，RSS AI 对话桥接
- `YiVad/src/hooks/useMermaid.ts` — 未使用，功能已被 useMarkdown 覆盖
- `YiVad/src/hooks/useReadingList.ts` — 未使用，阅读列表功能

## 修复方案

1. 删除确认无用的 hooks 文件（`useCollapse`、`useMermaid`、`useSseReconnect`、`useOptimisticUpdate`、`useRssReadStar`、`useKnowledgeDragDrop`、`useReadingList`）
2. 对于 `useChatContext` 和 `useRssAiChat`，确认是否有计划接入的功能，如确认无用则删除
3. 运行 `pnpm typecheck` 确认删除后无编译错误

## 预防措施

- 在 hooks 目录添加 `index.ts` 统一导出，便于通过 tree-shaking 分析发现未使用的导出
- 重构时同步清理旧文件，避免残留
- 代码审查时检查新增 hook 是否有实际调用方

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- **三种死代码来源的治理策略不同**：重构残留（需删除）、提前抽象（需评审是否接入或删除）、功能废弃（需确认无回滚需求后删除）。三者不能统一「全部删除」处理——提前抽象的 hook 可能对应计划中的功能
- **目录级 index.ts 的价值**：通过 barrel export（`index.ts` 统一导出），未使用的导出会被 TypeScript/ESLint 的 `no-unused-vars` 规则检测到。没有 barrel 的目录中，文件层面的死代码对工具不可见
- **重构时的清理纪律**：当某个 hook 的功能被内联或迁移到其他位置时，应同步删除原文件。重构完成标志不只是「新代码能跑」，还包括「旧代码已移除」

