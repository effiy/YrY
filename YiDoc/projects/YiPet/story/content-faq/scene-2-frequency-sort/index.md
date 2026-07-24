# US-F2 · 预设问答 + 频次排序

> Story: [content-faq](../index.md) · 前端组件化

## 用户故事

作为重复访问同类文档的用户，我想在 FAQ 面板看到按使用频次排序的预设问答，以便一秒点到最常问的问题，不必重复输入。

## 验收标准

- 预设问答列表按"近 30 天使用次数"降序排列，前 5 条以 chips 形式平铺。
- 点击 chip 直接发送并展开答案；答案下方有"本次帮助度"反馈按钮，反馈写入频次统计。
- 新增预设问答可在 popup 设置中维护，content-faq 面板下次唤起即生效。

## 使用场景 · 组件化

- `<PresetList>` 只渲染 items + 排序键；排序由 `useFrequentPresets()` composable 计算，组件本身不持状态。
- `<FeedbackChip>` 自包含：接收 `presetId` 与 `onRate`，内部 `useState` 管理高亮，不依赖父级刷新。
