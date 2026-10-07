---

title: "ModelRuntime"
doc_type: task
prd_task_id: "YA-09-112"

type: task
status: 待开始
---

# YA-09-112: Model Runtime — 技术设计

## 实现

**文件**：`services/ai/model_runtime.py`

```python
def get_runtime(mode: str | None = None) -> ModelRuntime:
    if mode == "openai": return OpenAIRuntime()
    if mode == "rag": return RAGRuntime()
    return OllamaRuntime()  # default
```

**Runtime 接口**：`chat(messages)`, `chat_stream(messages)`, `embed(text)`

## 非功能需求

| 维度 | 实现 |
|------|------|
| 扩展性 | 新增 runtime 只需添加新类 |
| 测试 | unittest.mock patch settings |