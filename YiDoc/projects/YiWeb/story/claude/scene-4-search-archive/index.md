# Scene · 历史会话列表搜索与归档

> Story: [claude](../index.md) · US-C4

## 用户故事

作为用户，历史会话列表能搜索与归档。

## 验收

- 搜索框 debounce 300ms，按关键词命中会话标题与消息体。
- 归档按钮将会话移入"已归档"分组；主列表默认折叠。
- 归档可撤销；支持批量归档（多选）。

## 使用场景 · 组件化

- `<SearchBar>` + `<HistoryList>` 组件；SearchBar emit `query`，HistoryList 接收过滤后的列表。
- `useArchive()` composable 承载归档状态与批量操作；与 `useConversation()` 解耦。
