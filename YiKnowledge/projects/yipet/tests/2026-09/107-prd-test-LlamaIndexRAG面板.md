---

title: "LlamaIndexRAG面板"
doc_type: test
prd_test_id: "YP-09-107"

type: test
status: 待开始
---

# YP-09-107: LlamaIndex RAG 管理面板 — 测试方案

| 场景 | 期望 |
|------|------|
| 索引已构建 | 绿色 Badge + num_docs |
| 索引未构建 | 黄色 Badge |
| 加载中 | 蓝色旋转器 |
| 点击重建 | POST /rag-build → 轮询状态 |
| 重建完成 | Badge 变绿 + 时间更新 |