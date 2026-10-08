---
title: store 中 sort() 直接修改原数组而非创建副本
tags: [yipet, code-quality, immutability]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# store 中 sort() 直接修改原数组而非创建副本

## 现象

多处在 Pinia store 和 composable 中使用 `.sort()` 直接修改原数组，而非创建排序后的副本：

```typescript
// chat.ts:346 — 直接修改 state.sessions
state.sessions.sort((a, b) => {
  if (!!a.isFavorite !== !!b.isFavorite) return a.isFavorite ? -1 : 1;
  return (b.updatedAt || 0) - (a.updatedAt || 0);
});

// ContextFilesPanel.vue:170 — 直接修改 nodes 数组
nodes.sort((a, b) => { ... });
```

`Array.sort()` 会原地修改数组，在 Pinia 的响应式系统中可能触发多次不必要的渲染。对于从 `chrome.storage` 加载后需要排序的场景，使用 `.toSorted()`（ES2023）或 `[...arr].sort()` 可以避免修改原始源数据。

## 根因分析

- `.sort()` 是开发者的直觉选择（简短且直接）
- 这些排序后的数组通常直接赋值给响应式状态（`state.sessions`），原地修改仍能触发更新
- 但语义上"加载 → 排序 → 存储"比"加载 → 修改 → 存储"更安全

## 涉及文件

- `src/chat/stores/chat.ts:96,346` — sessions 和 files 排序
- `src/chat/components/ContextFilesPanel/ContextFilesPanel.vue:170` — 节点排序

## 修复方案

```typescript
state.sessions = [...state.sessions].sort((a, b) => ...);
// 或 Chrome 110+
state.sessions = state.sessions.toSorted((a, b) => ...);
```


## 影响范围

**影响模块**：使用 `Array.sort()` 直接修改响应式数组的代码。
**影响用户**：Vue 的响应式系统可能无法正确追踪直接修改的数组变更，导致 UI 不更新或更新延迟。
**影响范围**：所有使用 Pinia 响应式数组的排序操作。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 在响应式数组上使用 `sort()` 前先用 `[...arr]` 创建副本 | 开发者 |
| 代码 | 或使用 `toRaw()` 获取原始数组后排序 | 开发者 |
| 工具 | ESLint 规则检测对 Proxy 对象使用变异方法 | DevOps |
| 知识 | 团队分享 Vue 3 响应式数组的最佳实践 | 开发者 |


## 经验教训

Vue 3 的 `Proxy` 响应式系统虽然比 Vue 2 的 `Object.defineProperty` 更完善，但 `Array.sort()` 是就地排序——修改原数组。在某些边界场景下，Vue 的响应式追踪可能无法正确检测到变化。使用 `[...arr].sort()` 创建新数组是最安全的做法。
