---

title: "ModelRuntime"
doc_type: test
prd_test_id: "YA-09-112"

type: test
status: 待开始
---

# YA-09-112: Model Runtime — 测试方案

| 场景 | 期望 |
|------|------|
| 默认模式 | OllamaRuntime 实例 |
| mode="ollama" | OllamaRuntime |
| mode="openai" | OpenAIRuntime（需 api_key） |
| mode="rag" | RAGRuntime |
| 未知 mode | 回退 OllamaRuntime |