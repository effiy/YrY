---
doc_type: module
prd_task_id: "YA-09-112"
title: "YA-09-112: 响应格式协商 — Accept 头驱动的 JSON/YAML/XML — 开发方案"
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
source_prd: "72-需求-响应格式协商.md"
source_okr: [yiai-001]
---

# YA-09-112: 响应格式协商 — Accept 头驱动的 JSON/YAML/XML — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[72-需求-响应格式协商.md](../../prds/2026-09/72-需求-响应格式协商.md)
> 需求编号：YA-09-112 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

当前仅返回 JSON。通过 `Accept` 头支持 YAML 和 XML 格式。调试时 YAML 更可读。

```python
import yaml, dicttoxml

@app.middleware("http")
async def format_negotiation(request, call_next):
    response = await call_next(request)
    accept = request.headers.get("Accept", "application/json")

    if "application/yaml" in accept:
        data = json.loads(response.body)
        return Response(content=yaml.dump(data, allow_unicode=True), media_type="application/yaml")
    if "application/xml" in accept:
        data = json.loads(response.body)
        return Response(content=dicttoxml.dicttoxml(data), media_type="application/xml")
    return response  # 默认 JSON
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | Accept 头解析 + YAML/XML 输出 | `Accept: yaml` → YAML 响应 | 0.25 |
| 2 | 测试 | 三格式均正确 | 0.25 |

**合计：0.5d**。