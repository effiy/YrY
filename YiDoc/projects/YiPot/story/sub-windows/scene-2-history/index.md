# Scene · 历史窗口查看 / 搜索 / 重用过往翻译

> Story: [sub-windows](../index.md) · US-W2

## 用户故事

作为用户，历史窗口能查看 / 搜索 / 重用过往翻译。

## 验收

- 历史来自 `tauri-plugin-sql` 本地 DB，按时间倒序。
- 搜索框 debounce 300ms，命中源文本 / 译文 / 引擎名。
- 点击条目回填主窗口输入区并关闭历史窗口。

## 使用场景 · 组件化

- `<HistoryList>` + `<HistoryItem>` 组件；列表只渲染，不持有查询状态。
- `hooks/useHistory()` composable 承载查询 / 搜索 / 分页；与 DB 层解耦。
