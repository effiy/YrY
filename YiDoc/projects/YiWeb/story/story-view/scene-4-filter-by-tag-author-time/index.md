# Scene · 按标签 / 作者 / 时间范围筛选故事

> Story: [story-view](../index.md) · US-S4

## 用户故事

作为用户，能按标签 / 作者 / 时间范围筛选故事。

## 验收

- 筛选条：标签 chips（多选）/ 作者下拉 / 日期范围 picker。
- 筛选状态同步到 URL hash，刷新可恢复。
- 重置按钮一键清空；空结果显示引导。

## 使用场景 · 组件化

- `<FilterBar>` 组件 emit `change(filters)`，与 `<StoryCard>` 列表解耦。
- `useFilters()` composable 承载 URL hash 双向同步与默认值管理。
