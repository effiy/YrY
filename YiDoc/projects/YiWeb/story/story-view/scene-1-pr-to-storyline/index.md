# Scene · PR 转化为故事线

> Story: [story-view](../index.md) · US-S1

## 用户故事

作为用户，我能将 PR 转化为故事线（每 commit 一张卡片）。

## 验收

- 输入 PR URL 后，拉取 commit 列表，渲染为纵向卡片流。
- 每张卡片显示：commit hash（短）/ author / message（首行）/ 时间。
- 卡片按 commit 时间倒序排列；加载中显示骨架屏。

## 使用场景 · 组件化

- `<StoryCard>` 组件单卡片渲染；props 接收 commit 节点。
- `useStoryLine()` composable 调用 `utils/commitToNode.js` 纯函数转换数据；组件仅消费。
