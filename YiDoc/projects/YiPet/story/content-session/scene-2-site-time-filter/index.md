# US-S2 · 按站点 / 时长筛选会话

> Story: [content-session](../index.md) · 前端组件化

## 用户故事

作为累积大量会话的用户，我想按站点与时间段筛选 popup 列表，并按"使用时长"排序定位重点 tab，以便快速回到最常使用的会话。

## 验收标准

- 顶部筛选条：站点下拉（多选）+ 时间范围（今天/最近 7 天/自定义）+ 排序键（活跃时间/使用时长）。
- 筛选结果 300ms 内更新；空结果时显示"暂无会话"占位与"重置筛选"按钮。
- 筛选状态持久化到 `chrome.storage.local`，下次打开 popup 恢复筛选。

## 使用场景 · 组件化

- `<SessionFilters>` 受控组件，输出 `filters` 对象给 `useCrossTabSessions()`；不直接读 storage。
- `useSessionFilters()` composable 负责 storage 读写 + 去抖 300ms，避免筛选输入时频繁全量重算。
