---
title: "ADR: YiVad AiCR Phase Port from YiWeb"
tags: [adr, yivad, aicr, port, migration]
category: leader/decisions/yivad
created: 2026-08-21
updated: 2026-09-10
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "理解从 YiWeb 分阶段移植 AiCR 到 YiVad 的决策——为什么将代码审查功能合并到 aiChat 组件而非创建独立的页面树"
related:
  - ../../../engineer/learn/projects/yivad/README.md
---

# ADR: YiVad AiCR 从 YiWeb 分阶段移植

> **状态**：已接受 (2026-07-27) — aiChat 已移植；AiCR 功能已合并到 aiChat 组件中

## 上下文

YiWeb 有一个独立的 AiCR（AI 代码审查）页面，包含 9 个 Pinia stores、8 个模态组件和完整的 CodeViewer/ChatPanel 对等功能。在将功能移植到 YiVad 时，需要决定：是将 AiCR 作为独立的页面树移植，还是将 AiCR 功能合并到已有的 aiChat 组件中？

**关键考量**：
- AiCR 页面的核心功能（代码查看、聊天面板、专家审查、样式审查等）与 aiChat 的聊天基础设施高度重叠
- 独立的页面树意味着：独立的路由、独立的 stores、独立的组件——大量的代码重复
- aiChat 已经提供了流式 SSE、消息操作、会话管理等 AiCR 需要的核心能力
- AiCR 本质上是"专业化聊天模式"——它需要的是不同的提示词和 UI 配置，而非不同的基础设施

## 决策

**从 YiWeb 分阶段移植 AiCR：先移植核心 aiChat 页面，再将 AiCR 专属功能合并到 aiChat 组件中，而非创建独立的页面树。**

### 执行结果（2026-08-04 审计）

- `src/views/aicr/` 和 `src/stores/modules/aicr/` 在 master 分支上不存在 — 确认未创建独立页面树
- AiCR 风格的功能已合并到 aiChat 组件中
- 代码审查视图位于 `src/views/code-review/` 下，包含具体子页面：
  - i18n-a11y（国际化与无障碍）
  - error-handling（错误处理）
  - explain（代码解释）
  - security（安全审查）
  - dead-code（死代码检测）
  - observability-gap（可观测性差距）
  - tests（测试覆盖）
  - bugs（缺陷分析）
  - style（代码风格）
  - access-review（权限审查）

### 审查类型与 aiChat 的集成方式

每个审查类型在 aiChat 中作为一个"角色"或"模式"存在——用户选择审查类型后，系统加载对应的系统提示词和上下文构建策略，但底层的消息流和会话管理复用了 aiChat 基础设施。

## 选择理由

- 避免独立的页面树减少了路由/组件重复
- aiChat 已经提供了 AiCR 所需的聊天基础设施
- 代码审查是"专业化聊天模式"而非独立应用——共享 90% 的基础设施，差异在 10% 的审查逻辑
- 跨项目一致性：YiPet 也做了同样的决策（AiCR 合并到聊天窗口）

## 后果

### 正面影响
- 无独立的 AiCR 路由和 store 树——维护负担降低
- 每种审查类型的代码集中在 `src/views/code-review/` 下的子目录
- 新审查类型可以通过添加新的系统提示词和子页面来扩展

### 负面影响
- aiChat 组件的复杂度增加——需要根据不同的审查模式调整 UI 行为
- 代码审查的某些精细化交互（如代码 diff 高亮）受限于聊天界面的范式

## 适用场景

- 功能移植时评估"独立模块 vs 集成到已有系统"的决策参考
- 理解 YrY 中 AiCR 功能在 YiVad 和 YiPet 中的一致性设计

## 反模式

- **为相似功能创建独立系统。** AiCR 和 aiChat 共享大量基础设施——为审查功能创建独立的 stores、路由和组件是典型的"过度模块化"，结果是需要维护两份几乎相同的代码