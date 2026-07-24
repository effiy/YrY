# US-S1 · 跨页面会话历史 + 恢复

> Story: [content-session](../index.md) · 前端组件化

## 用户故事

作为多 tab 浏览的用户，我想在 popup 看到所有 tab 的聊天历史按站点分组，点击即可恢复到对应 tab 的对应会话，以便跨 tab 追踪思路。

## 验收标准

- popup 会话列表按 host 分组，每组按最近活跃时间降序；每条显示首问 + 时间 + tab 标题。
- 点击会话项 → 激活对应 tab → content-chat 面板自动展开并定位到该会话，焦点落在输入框。
- tab 已关闭时显示"已离线"标记，点击后弹出"在新 tab 恢复"按钮，原 URL + 上下文一并重建。

## 使用场景 · 组件化

- `<SessionGroup>` 按 host 渲染分组，组内由 `<SessionItem>` 列表；两者只消费 `useCrossTabSessions()` 返回的视图。
- `useCrossTabSessions()` composable 订阅 background 的 sessions 集合，自动去重并按 host 分组；组件不感知数据源。
