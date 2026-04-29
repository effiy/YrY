# message-pusher 评测示例（配合 wework-bot）

真源：`.claude/agents/message-pusher.md`。

**评测约束**：示例的预期链路以 **`send-message.js` 真发**收尾（见 [skills/wework-bot.md](../skills/wework-bot.md)）；message-pusher 只负责对稿，不得以「仅草稿」代替群内推送。

---

## 用户故事

**故事**：在调用 `send-message.js` 之前，先把结论、描述、度量与证据对齐会话事实，避免占位符与幻觉数字进入企业微信群。

---

## 示例输入（对话）

- 「按 message-pusher：先把这条阻断通知的 🎯 结论 / 📝 描述 / ⏱️ / 🪙 会话用量列成草稿，核对数字与来源后 **再执行 wework-bot 真发到群**。」
- 「完成通知要带上 📐 实施总结图表、🧩 MCP 明细：先从 06 统计再写稿，**写完立刻跑 send-message 正式推送**。」

---

## 与 eval 的关联

- Skill 侧示例： [skills/wework-bot.md](../skills/wework-bot.md)
