---

title: "AiChatBox"
doc_type: task
prd_task_id: "YV-09-106"

type: task
status: 待开始
---

# YV-09-106: AiChatBox — 技术设计

## 实现

**文件**：`src/components/AiChatBox/` + `src/stores/modules/aiChat.ts` + `src/api/modules/chatService.ts`

**SSE 流式**：fetch POST RPC → `readableStream` → `extractDelta` → 增量追加到 store → Vue 响应式渲染

**消息持久化**：send/receive 时通过 `SessionService.upsert` → MongoDB `sessions` 集合

**跨项目桥接**：YiPet → `bridge_service` → YiVad aiChat?session=key → onMounted 读取参数 → 选择已植入会话

## 非功能需求

| 维度 | 实现 |
|------|------|
| 流式 | SSE text/event-stream |
| 持久化 | Pinia + pinia-plugin-persistedstate |
| 桥接 | 一次性 token + window.open |