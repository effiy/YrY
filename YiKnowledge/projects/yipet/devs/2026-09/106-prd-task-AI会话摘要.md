---

title: "AI会话摘要"
doc_type: task
prd_task_id: "YP-09-106"

type: task
status: 待开始
---

# YP-09-106: AI 会话摘要 — 技术设计

## 实现

**文件**：`src/chat/components/SessionSummaryDialog.vue` + `chat/stores/chat.ts::summarizeCurrentSession()`

**流程**：用户点击"摘要" → 构建对话记录（每条截断 800 字符） → `chat.streamWithCallback` → "简洁摘要器"系统提示词 → SSE 流式输出 → `marked` 渲染 markdown → `navigator.clipboard.writeText` 复制