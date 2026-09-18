---
doc_type: module
prd_task_id: "YA-09-56"
title: "YA-09-56: Schema 兼容性检测 — CI 自动识别破坏性变更 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "114-需求-Schema兼容性检测.md"
source_okr: [yiai-002]
---

# YA-09-56: Schema 兼容性检测 — CI 自动识别破坏性变更 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[114-需求-Schema兼容性检测.md](../../prds/2026-09/114-需求-Schema兼容性检测.md)
> 需求编号：YA-09-56 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

Pydantic model 变更可能破坏前端——删除字段、修改类型、新增必填字段。CI 中自动对比当前分支与 main 的 schema 差异。

```python
# 导出当前 schema
import json
from pydantic import schema_json_of

current = {name: schema_json_of(model) for name, model in MODELS.items()}
with open("schema_current.json", "w") as f:
    json.dump(current, f, indent=2)

# CI: 对比 main 和当前分支
diff = compare_schemas("schema_main.json", "schema_current.json")
```

### 破坏性变更检测

| 变更 | 兼容性 | CI 动作 |
|------|--------|--------|
| 新增可选字段 | ✅ 兼容 | — |
| 新增必填字段 | ❌ 破坏 | 阻断 + 要求确认 |
| 删除字段 | ❌ 破坏 | 阻断 + 要求确认 |
| 修改字段类型 | ❌ 破坏 | 阻断 + 要求确认 |
| 重命名字段 | ❌ 破坏 | 阻断 + 要求确认 |
| 新增枚举值 | ✅ 兼容 | — |
| 删除枚举值 | ❌ 破坏 | 阻断 + 要求确认 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | schema 导出 + diff 工具 | 破坏性变更被检测 | 0.5 |
| 2 | CI 集成 + 报告 + 测试 | PR 中自动评论兼容性报告 | 0.5 |

**合计：1.0d**。