---
doc_type: module
prd_task_id: "YA-09-153"
title: "YA-09-153: LLM 输出格式化校验 — JSON Schema 验证 + 自动修复 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "231-需求-LLM输出格式化校验.md"
source_okr: [yiai-001]
---

# YA-09-153: LLM 输出格式化校验 — JSON Schema 验证 + 自动修复 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[231-需求-LLM输出格式化校验.md](../../prds/2026-09/231-需求-LLM输出格式化校验.md)
> 需求编号：YA-09-153 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

LLM function calling 返回的 JSON 可能格式错误（多余逗号、未闭合引号）。jsonschema 验证 + regex 自动修复 + 重试。

```python
import jsonschema, json, re

def validate_and_fix(raw: str, schema: dict) -> dict:
    # 1. 尝试直接解析
    try: data = json.loads(extract_json(raw))
    except json.JSONDecodeError: data = auto_fix(raw)
    # 2. Schema 验证
    jsonschema.validate(data, schema)
    return data

def auto_fix(raw: str) -> dict:
    raw = re.sub(r',(\s*[}\]])', r'\1', raw)  # 移除尾部逗号
    raw = re.sub(r'```json|```', '', raw)      # 移除 markdown 标记
    return json.loads(raw)
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | jsonschema 验证 + 自动修复 | 格式错误 JSON 被修复 | 0.25 |
| 2 | 重试 + 降级 + 测试 | 3 次修复失败返回原始文本 | 0.25 |

**合计：0.5d**。