---

doc_type: test
title: "YA-09-51: 服务端请求体 JSON Schema 自动校验 — Pydantic 模型驱动的参数验证管道 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-51"
source_prds: ["55-需求-Pydantic参数校验"]
source_modules: []
source_okr: [yiai-002]

type: test
---

# YA-09-51: Pydantic 参数校验 — 测试规格

> **文档职责**：本文档定义 Pydantic 参数校验的**怎么验证**（VERIFY），覆盖类型校验、必填字段、自定义验证器和错误消息格式化。

> 来源 PRD：[55-需求-Pydantic参数校验.md](../../prds/2026-09/55-需求-Pydantic参数校验.md)

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | Pydantic 模型验证、自定义 validator | pytest | 类型检查、字段约束 |
| L2 集成 | FastAPI 端点参数自动校验 | pytest + httpx | 422 错误、校验错误格式 |

### 1.2 测试数据

```python
from pydantic import BaseModel, Field, validator

class RpcRequest(BaseModel):
    module_name: str = Field(min_length=1)
    method_name: str = Field(min_length=1)
    parameters: dict
    version: str | None = Field(default=None, pattern=r"^v[1-9]$")

class QueryDocumentRequest(BaseModel):
    cname: str = Field(min_length=1)
    filter: dict = Field(default_factory=dict)
    projection: dict | None = None
    limit: int = Field(default=100, ge=1, le=1000)
```

---

## 二、测试用例

### 2.1 类型校验

#### TC-PYD-001: 字段类型不匹配返回 422

| **ID** | TC-PYD-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. `parameters` 传入字符串 `"not_a_dict"` (期望 dict) |
| **预期结果** | - `ValidationError`<br/>- 错误: `parameters: value is not a valid dict` |

#### TC-PYD-002: 整数范围校验（ge/le）

| **ID** | TC-PYD-002 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. `limit=0`（< ge=1）<br/>2. `limit=2000`（> le=1000） |
| **预期结果** | - 0: `limit: ensure this value is greater than or equal to 1`<br/>- 2000: `limit: ensure this value is less than or equal to 1000` |

#### TC-PYD-003: 正则 pattern 校验

| **ID** | TC-PYD-003 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. `version="v999"`（不匹配 `^v[1-9]$`） |
| **预期结果** | - `version: string does not match regex "^v[1-9]$"` |

### 2.2 必填字段

#### TC-PYD-004: 缺少 module_name 返回 422

| **ID** | TC-PYD-004 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 发送 `{"method_name": "query", "parameters": {}}` 缺 module_name |
| **预期结果** | - HTTP 422<br/>- `{code: 1001, message: "Validation failed", errors: [{field: "module_name", error: "field required"}]}` |

### 2.3 验证错误格式

#### TC-PYD-005: 多个字段错误一次性返回

| **ID** | TC-PYD-005 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 发送 `{"module_name": "", "method_name": "", "limit": 0}` — 3 个错误 |
| **预期结果** | - 3 个错误一次性返回<br/>- 每个错误包含 `field`、`error`、`input_value` |

#### TC-PYD-006: 错误消息包含中文友好提示

| **ID** | TC-PYD-006 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. `cname=""` 触发空字符串校验 |
| **预期结果** | - 错误消息: `集合名称不能为空`（中文）<br/>- 或通过自定义 validator 覆盖默认英文消息 |

### 2.4 自定义验证器

#### TC-PYD-007: 自定义 validator——参数名兼容性检测

| **ID** | TC-PYD-007 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. `parameters` 包含 `query`（废弃参数名）<br/>2. 在 v2 模式 |
| **预期结果** | - 自定义 validator 检测到废弃参数<br/>- 错误: `parameters.query: 参数已废弃，请使用 'filter'` |

---

## 三、边界与异常测试

### TC-EDGE-001: None 字段处理
**步骤**：`projection=None`（可选字段）。  
**预期结果**：通过校验。

### TC-EDGE-002: 空 parameters 对象
**步骤**：`parameters={}`。  
**预期结果**：通过校验（空字典是合法 dict）。

### TC-EDGE-003: 超长字符串
**步骤**：module_name 为 10000 字符。  
**预期结果**：截断到 max_length + 校验错误信息中截断。

---

## 四、回归测试

### TC-REG-001: 所有现有 RPC 请求通过 Pydantic 校验
**步骤**：运行全部 76 个测试。  
**预期结果**：100% 通过。

---

## 五、需求-测试追溯矩阵

| PRD FR | 测试用例 | 覆盖层级 |
|--------|---------|---------|
| FR-类型校验 | TC-PYD-001~003 | L1 |
| FR-必填字段 | TC-PYD-004 | L2 |
| FR-错误格式 | TC-PYD-005~006 | L1+L2 |
| FR-自定义验证 | TC-PYD-007 | L1 |
| FR-边界 | TC-EDGE-001~003 | L1 |
| FR-回归 | TC-REG-001 | L2 |

## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| 嵌套对象深度校验 | 当前测试仅平铺字段 | 复杂嵌套场景测试 |
| 条件必填（depends on 其他字段） | 未实现 | 后续版本评估 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/55-需求-Pydantic参数校验.md`*