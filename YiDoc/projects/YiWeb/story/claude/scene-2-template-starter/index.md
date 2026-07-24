# Scene · 从预设 Prompt 模板发起新对话

> Story: [claude](../index.md) · US-C2

## 用户故事

作为用户，我能从预设 Prompt 模板发起新对话。

## 验收

- 模板选择器列出可用模板，分类显示。
- 选中后自动填充输入框，用户可在发送前编辑。
- 最近使用模板置顶；支持收藏。

## 使用场景 · 组件化

- `<TemplatePicker>` 组件 emit `pick` 事件，承载分类与搜索。
- `useTemplates()` composable 管理模板列表、最近使用、收藏（localStorage 持久化）。
