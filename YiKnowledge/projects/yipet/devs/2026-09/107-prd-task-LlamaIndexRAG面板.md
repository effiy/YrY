---

title: "LlamaIndexRAG面板"
doc_type: task
prd_task_id: "YP-09-107"

type: task
status: 待开始
---

# YP-09-107: LlamaIndex RAG 管理面板 — 技术设计

## 实现

**文件**：`src/chat/components/LlamaIndexPanel/` + `chat/stores/chat.ts::loadRagStatus/rebuildRagIndex`

**状态管理**：`ragStatus: {built, num_docs, last_built_at}` → Badge 颜色：绿色(已构建)/黄色(未构建)/蓝色(加载中)

**重建流程**：`rebuildRagIndex()` → POST /rag-build → 轮询 `loadRagStatus()` 直到 built=true