---
title: "Tech Selection: React State Management"
tags: [tech-selection, react, state-management, yipet]
category: leader/architecture
created: 2026-08-21
updated: 2026-09-10
source: internal
type: reference
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader]
benefit: "YiPet 中 React 状态管理方案选择的标准和理由，为 Chrome 扩展场景的状态管理提供决策参考"
related:
  - ../../../engineer/learn/projects/yipet/README.md
---

# 技术选型：React 状态管理

> **背景**：YiPet 的聊天窗口和弹出面板需要对 SSE 流式数据、会话状态和用户偏好进行状态管理。在 React 18 生态中，可选项很多，但在 Chrome 扩展的特定约束下（CSP 限制、体积敏感、双世界架构），选择需格外审慎。

## 决策：`useSyncExternalStore` + 自定义 Controller

YiPet 使用 React 18 内置的 `useSyncExternalStore` Hook 配合自定义 `ChatController` 类进行状态管理，而非 Redux、Zustand 或 React Context。

### 架构设计

```
ChatController (外部 Store)
  ├── state: { messages[], isLoading, error, ... }
  ├── actions: send(), abort(), retry(), clearHistory()
  ├── subscribe(callback) → unsubscribe
  └── getSnapshot() → current state

ChatWindow 组件
  └── useSyncExternalStore(controller.subscribe, controller.getSnapshot)
       └── 仅在 store 快照变化时重新渲染
```

`ChatController` 拥有流式状态、操作方法和终止逻辑，与 React 组件生命周期解耦。`useSyncExternalStore` 将 Controller 连接到 React 的渲染循环，同时避免不必要的重新渲染。

## 选项对比

| 方案 | 优势 | 劣势 |
|--------|------|------|
| `useSyncExternalStore`（选用）| 零依赖；React 18 内置；外部 store 模式 | 需手动管理订阅 |
| Redux | 丰富的生态系统、中间件 | 对 Chrome 扩展弹出面板而言过度设计 |
| Zustand | 轻量级、简洁 API | 新增依赖；仅 2 个视图不需要 |
| React Context | 内置、简单 | 级联重新渲染；不适合流式状态 |

### 详细分析

**Redux**：约 10KB+ min+gzip，对 YiPet 仅 2 个 React 视图的场景是过度设计。Redux 的最佳场景是有复杂的数据流、多 reducer 交互和多组件共享状态的中大型应用。

**Zustand**：API 设计优雅、体积小。但从零依赖的角度考虑，YiPet 已经是一个依赖众多的 Chrome 扩展（80+ 厂商库通过 CDN 加载），减少 npm 依赖是值得追求的目标。

**React Context**：对于高频变化的状态（如 SSE 流式聊天消息），Context 的性能缺陷会暴露。Context 的任何值变化都会导致所有消费者重新渲染——在流式场景中意味着每次 token 到达都将触发整个组件树的渲染。

**`useSyncExternalStore`**：React 18 内置，无需额外依赖。外部 store 模式天然适合处理流式数据——Controller 可以独立于 React 渲染循环管理 SSE 连接、缓冲和状态更新。

## 选择理由

- YiPet 仅有 2 个 React 视图（popup + chat）——完整的状态管理库是过度设计
- `useSyncExternalStore` 是 React 18 内置——零新依赖，对 MV3 CSP 友好
- `ChatController` 拥有流式状态、操作和终止逻辑——职责分离清晰
- MV3 的内容安全策略限制外部脚本——npm 包越少越好

## YiVad 的差异

YiVad 使用 Pinia 4（Vue 生态）。跨项目的状态管理方案差异是可接受的——每个项目使用其框架的原生解决方案。Pinia 是 Vue 生态的事实标准，正如 `useSyncExternalStore` 是 React 18 的内置方案。跨项目一致性不是目标——每个框架的最佳实践才是。

## 适用场景

- 为 YiPet 新功能选择状态管理模式时作为参考
- 评估 Chrome 扩展中 React 状态管理的约束条件
- 对比前端（YiVad 的 Pinia）和扩展（YiPet 的 useSyncExternalStore）的差异

## 常见问题

**Q: 为什么不统一使用 Pinia？**
A: Pinia 是 Vue 专属的状态管理库，无法在 React 中运行。YiVad 使用 Vue 3.5，YiPet 使用 React 18——分别使用各自生态的最佳方案是合理的选择。如果未来 YiPet 也迁移到 Vue，再考虑统一。

**Q: `useSyncExternalStore` 在流式场景下如何处理高频率更新？**
A: `useSyncExternalStore` 接收 `getSnapshot` 函数，返回的是当前状态的快照。React 使用 `Object.is` 比较前后快照来决定是否重新渲染。通过在 `ChatController` 中使用不可变更新模式（每次状态变化返回新引用），可以精确控制渲染频率。

## 反模式

- **为了跨项目统一而选择不适用的方案。** YiVad 用 Pinia 不代表 YiPet 也应该用 Vue。技术栈差异是合理的架构选择，不应被不合理的统一性目标驱动
- **为简单场景引入重型状态库。** 2 个视图不需要 Redux。选择与项目规模匹配的工具，避免为未来可能永远不需要的场景预先设计