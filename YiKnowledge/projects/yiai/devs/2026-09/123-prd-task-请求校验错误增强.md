---
doc_type: module
prd_task_id: "YA-09-68"
title: "YA-09-68: 请求校验错误增强 — 字段级定位 + 修复建议 — 开发方案"
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
source_prd: "123-需求-请求校验错误增强.md"
source_okr: [yiai-001]
---

# YA-09-68: 请求校验错误增强 — 字段级定位 + 修复建议 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[123-需求-请求校验错误增强.md](../../prds/2026-09/123-需求-请求校验错误增强.md)
> 需求编号：YA-09-68 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

Pydantic `ValidationError` 的错误信息对前端不够友好。增强为字段级定位 + 修复建议 + 中文消息。

```python
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_handler(request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = " → ".join(str(loc) for loc in error["loc"])
        msg = error["msg"]
        suggestion = SUGGESTIONS.get(error["type"], "")

        # 翻译常见错误
        if error["type"] == "type_error.integer":
            msg = f"字段 '{field}' 应为整数"
            suggestion = f"当前值 '{error.get('input')}' 不是有效整数"

        errors.append({"field": field, "error": msg, "suggestion": suggestion, "input": error.get("input")})

    return JSONResponse(status_code=422, content={"code": 1002, "message": "参数校验失败", "data": {"errors": errors}})
```

### 错误增强示例

```json
// 原来: "Invalid params"
// 增强后:
{
  "code": 1002,
  "message": "参数校验失败",
  "data": {
    "errors": [
      {"field": "body → parameters → pageSize", "error": "字段应为整数", "suggestion": "当前值 'abc' 不是有效整数，请传入数字", "input": "abc"},
      {"field": "body → module_name", "error": "必填字段缺失", "suggestion": "请提供 module_name，例如 'services.database.data_service'"}
    ]
  }
}
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | exception_handler 增强 | 校验错误含字段级定位 | 0.25 |
| 2 | 中文翻译 + 修复建议 + 测试 | 前端可展示友好错误提示 | 0.25 |

**合计：0.5d**。