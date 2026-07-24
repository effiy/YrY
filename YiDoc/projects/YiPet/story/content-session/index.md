# Story · content/session · 会话历史

> 页面：[YiPet Story](../index.md) · `src/content/session/`

## 场景

- [US-S1 · 查看跨页面的会话历史](scene-1-cross-page-history/index.md)
- [US-S2 · 会话按站点 / 时间筛选](scene-2-site-time-filter/index.md)

## 使用场景 · 组件化

- `content/session/` 与 `content/chat` 通过 `state.js` 共享状态；列表组件可复用 YiH5 的 `useListPage` 思路（跨项目复用 CDN composable）。
