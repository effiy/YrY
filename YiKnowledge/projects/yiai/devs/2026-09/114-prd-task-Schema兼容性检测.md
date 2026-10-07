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

type: task
---

# YA-09-56: Schema 兼容性检测 — CI 自动识别破坏性变更 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[114-需求-Schema兼容性检测.md](../../prds/2026-09/114-需求-Schema兼容性检测.md)
> 需求编号：YA-09-56 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

## 一、架构总览

Pydantic model 变更可能无声地破坏前端（YiVad/YiPet）——删除字段导致前端渲染空白，修改类型导致 `undefined` 错误，新增必填字段但前端未适配。当前无自动化检测，全凭代码审查者记忆。方案：CI 中通过 `SchemaComparator` 对比当前分支与 main 分支的 Pydantic schema JSON 差异，识别 6 类破坏性变更（删除字段、修改类型、新增必填字段、重命名字段、删除枚举值、收缩类型范围），非破坏性变更（新增可选字段、新增枚举值、放宽类型）静默通过。

```mermaid
graph TB
    subgraph "CI Pipeline"
        CHECKOUT[checkout main 分支]
        EXPORT_MAIN[导出 main schema<br/>pydantic.schema_json_of()]
        CHECKOUT_CUR[checkout 当前分支]
        EXPORT_CUR[导出当前 schema]
        COMPARE[SchemaComparator.diff()]
        REPORT[生成兼容性报告]
        BLOCK{破坏性变更?}
    end

    subgraph "输出"
        PASS[CI 通过<br/>兼容性报告]
        FAIL["CI 阻断<br/>PR 评论包含破坏性变更列表<br/>需 Reviewer 确认"]
    end

    CHECKOUT --> EXPORT_MAIN
    CHECKOUT_CUR --> EXPORT_CUR
    EXPORT_MAIN --> COMPARE
    EXPORT_CUR --> COMPARE
    COMPARE --> REPORT
    REPORT --> BLOCK
    BLOCK -->|非破坏性| PASS
    BLOCK -->|破坏性| FAIL
```

### 变更分类

| 变更类型 | 兼容性 | CI 动作 | 示例 |
|----------|--------|--------|------|
| 新增可选字段 `Optional[str] = None` | 兼容 | 通过 | `+ description: Optional[str]` |
| 新增必填字段 `str` | **破坏性** | 阻断 | `+ email: str` → 前端未传必报错 |
| 删除字段 | **破坏性** | 阻断 | `- created_by: str` → 前端引用 undefined |
| 修改字段类型 `str` → `int` | **破坏性** | 阻断 | 前端传字符串，后端拒绝 |
| 重命名字段 `old_name` → `new_name` | **破坏性** | 阻断 | 前端用旧字段名，后端不识别 |
| 删除枚举值 | **破坏性** | 阻断 | 前端已存储的旧值被拒绝 |
| 新增枚举值 | 兼容 | 通过 | `+ status: "archived"` |
| 收缩类型 `Union[str,int]` → `str` | **破坏性** | 阻断 | 前端传 int 报错 |
| 放宽类型 `str` → `Union[str,int]` | 兼容 | 通过 | 向后兼容 |

---

## 二、文件清单

| 文件 | 操作 | 行数 | 说明 |
|------|------|------|------|
| `scripts/schema_diff.py` | **新建** | ~120 | SchemaComparator：导出、对比、分类、报告 |
| `.github/workflows/schema-compat.yml` | **新建** | ~50 | CI Workflow：checkout main + current → diff → PR comment |
| `scripts/export_schema.py` | **新建** | ~30 | Pydantic schema 导出工具 |
| `tests/scripts/test_schema_diff.py` | **新建** | ~80 | 4 场景测试 |

---

## 三、模块设计

### 3.1 SchemaComparator

```python
# scripts/schema_diff.py

from dataclasses import dataclass, field
from enum import Enum
import json


class ChangeSeverity(str, Enum):
    BREAKING = "BREAKING"      # 阻断 CI
    COMPATIBLE = "COMPATIBLE"  # 通过


@dataclass
class SchemaChange:
    model: str
    field: str
    change_type: str           # "FIELD_ADDED_REQUIRED" | "FIELD_REMOVED" | "TYPE_CHANGED" | ...
    before: str | None
    after: str | None
    severity: ChangeSeverity


class SchemaComparator:
    """Pydantic Schema 兼容性检测器。

    职责：
    - 加载两个版本的 schema JSON
    - 逐 model 逐 field 对比差异
    - 分类为 BREAKING / COMPATIBLE
    - 生成 markdown 兼容性报告
    - BREAKING 变更时 exit(1)
    """

    BREAKING_CHANGES: set[str] = {
        "FIELD_ADDED_REQUIRED",
        "FIELD_REMOVED",
        "TYPE_CHANGED",
        "FIELD_RENAMED",
        "ENUM_VALUE_REMOVED",
        "TYPE_NARROWED",
    }

    def __init__(self, old_schema_path: str, new_schema_path: str) -> None: ...

    def compare(self) -> list[SchemaChange]: ...
    def _compare_models(self, old: dict, new: dict) -> list[SchemaChange]: ...
    def _classify_field_change(self, old_field: dict, new_field: dict) -> SchemaChange | None: ...
    def generate_report(self, changes: list[SchemaChange]) -> str: ...
    def has_breaking_changes(self, changes: list[SchemaChange]) -> bool: ...
```

### 3.2 Schema 导出

```python
# scripts/export_schema.py
"""导出所有 Pydantic model 的 JSON Schema。"""

import json
from pathlib import Path

# 注册所有 model
from src.shared.models import ALL_MODELS  # dict[str, BaseModel]

def export_schema(output_path: str) -> None:
    schemas = {}
    for name, model in ALL_MODELS.items():
        schemas[name] = model.model_json_schema()

    Path(output_path).write_text(
        json.dumps(schemas, indent=2, ensure_ascii=False)
    )

if __name__ == "__main__":
    export_schema("schema_current.json")
```

---

## 四、数据流

### CI 执行流程

```
1. checkout main → python scripts/export_schema.py → schema_main.json
2. checkout feature branch → python scripts/export_schema.py → schema_current.json
3. python scripts/schema_diff.py schema_main.json schema_current.json
4. SchemaComparator.compare()
   → main: {"SessionCreate": {"properties": {"title": {"type": "string"}, "tags": {"type": "array"}}}}
   → cur:  {"SessionCreate": {"properties": {"title": {"type": "integer"}, "email": {"type": "string"}}}}
   → title: type string→integer → TYPE_CHANGED → BREAKING
   → tags: removed → FIELD_REMOVED → BREAKING
   → email: new required → FIELD_ADDED_REQUIRED → BREAKING
5. 输出:
   ❌ Schema 兼容性检测失败 — 发现 3 个破坏性变更
   - SessionCreate.title: 类型变更 string → integer
   - SessionCreate.tags: 字段删除
   - SessionCreate.email: 新增必填字段
6. exit(1) + PR comment with report
```

---

## 五、实施路线图

| 阶段 | 人天 | 任务 | 产出 | 验证 |
|------|------|------|------|------|
| 一：Schema 导出 | 0.2 | export_schema.py + ALL_MODELS 注册 | 导出脚本 (~30行) | schema JSON 文件正确生成 |
| 二：对比引擎 | 0.3 | SchemaComparator + 6 类破坏性变更检测 + 报告生成 | `schema_diff.py` (~120行) | 单元测试：4 场景通过 |
| 三：CI 集成 | 0.25 | GitHub Actions workflow + PR comment | `.github/workflows/schema-compat.yml` | PR 中自动评论 |
| 四：测试 + 文档 | 0.25 | 完整场景测试 + ALL_MODELS 注册指南 | test + doc | pytest 通过 |

**合计：1.0d。**

---

## 六、代码审查检查清单

- [ ] `ALL_MODELS` 字典注册所有对外暴露的 Pydantic model
- [ ] Schema 导出排除内部 model（仅导出 API 契约相关）
- [ ] 类型变更检测：比较 `properties.field.type` 差异
- [ ] 必填字段检测：比较 `required` 列表差异
- [ ] 枚举值检测：比较 `properties.field.enum` 差异
- [ ] 重命名字段检测：字段名变更 + 类型相同
- [ ] BREAKING 变更时 `exit(1)` 阻断 CI
- [ ] CI workflow 仅在 `.py` 文件变更时触发（避免全量）
- [ ] PR comment 格式化为 markdown table
- [ ] `schema_main.json` 作为 baseline 定期更新

---

## 七、技术风险评估

| 风险 | 概率 | 影响 | 等级 | 缓解措施 |
|------|------|------|------|----------|
| ALL_MODELS 注册遗漏 | 中 | 高 | 中 | CI 检查 model 注册覆盖率 |
| JSON Schema 格式随 Pydantic 版本变化 | 低 | 中 | 低 | 锁定 Pydantic 版本 |
| 字段重命名被误判为删除+新增 | 高 | 低 | 低 | 重命名检测（相同类型 + 相似名称） |
| CI 执行时间过长 | 低 | 低 | 低 | schema 导出 < 1s，对比 < 0.1s |

### 回滚策略：CI 阻断时可人工 override（在紧急修复场景下）。破坏性变更需要 Review 确认 + PR 描述中说明兼容性计划。|