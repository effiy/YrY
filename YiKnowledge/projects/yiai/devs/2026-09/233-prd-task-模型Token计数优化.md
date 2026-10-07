---

doc_type: module
prd_task_id: ""
title: "模型Token计数优化 — 开发任务"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 0.3
source_prd: "233-需求-模型Token计数优化.md"
source_okr: [yiai-002]

type: task
---

# 模型Token计数优化 — 开发任务

> **文档职责**: 本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD: [233-需求-模型Token计数优化.md](../../prds/2026-09/233-需求-模型Token计数优化.md)
> 需求编号: N/A · 优先级: P2 · 人天: 0.3d

---

<a id="sec-1"></a>
## 一、架构概览

```mermaid
graph TD
  subgraph Before["实现前"]
    B1["chars/4 估算<br/>误差 30-50%"]
    B2["统一估算所有模型<br/>忽略 tokenizer 差异"]
    B3["无 Token 预算<br/>超限后 LLM 报错"]
    B4["简单截断<br/>可能切断语义"]
  end

  subgraph After["实现后"]
    A1["tiktoken 精确计数<br/>误差 < 5%"]
    A2["模型专属 tokenizer<br/>自动映射"]
    A3["Token 预算管理<br/>预防性截断"]
    A4["边界感知截断<br/>保证语义完整"]
  end

  B1 --> A1
  B2 --> A2
  B3 --> A3
  B4 --> A4

  style Before fill:#f8d7da,stroke:#dc3545
  style After fill:#d4edda,stroke:#28a745
```

<a id="sec-2"></a>
## 二、文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `domain/XXX/models.py` | 新增 | 数据模型定义 |
| `domain/XXX/service.py` | 新增 | 核心服务逻辑 |
| `services/XXX/rpc_handler.py` | 新增 | RPC 路由处理器 |
| `tests/test_XXX.py` | 新增 | 单元测试 |

<a id="sec-3"></a>
## 三、模块设计

### 1. 核心组件

```python
mport tiktoken
from functools import lru_cache
from typing import Optional

class TokenCounter:
    """精确 Token 计数：tiktoken 集成 + 模型映射"""

    # 模型 → tiktoken 编码名称映射
    MODEL_TOKENIZER_MAP: dict[str, str] = {
        # Qwen 系列（基于 GPT 架构，使用 cl100k_base）
        "qwen3.5:4b":    "cl100k_base",
        "qwen3.5:7b":    "cl100k_base",
        "qwen3.5:14b":   "cl100k_base",
        "qwen3.5:32b":   "cl100k_base",

        # Llama 系列（使用 o200k_base）
        "llama3:8b":     "o200k_base",
        "llama3:70b":    "o200k_base",
        "llama3.1:8b":   "o200k_base",

        # Mistral 系列
        "mistral:7b":    "cl100k_base",

        # 通用回退
        "default":       "cl100k_base",
# ... (完整实现见 PRD)
```

### 2. 核心组件

```python
rom dataclasses import dataclass

@dataclass
class BudgetReport:
    total_tokens: int
    max_tokens: int
    within_budget: bool
    system_tokens: int
    history_tokens: int
    current_tokens: int
    overhead_tokens: int
    available_tokens: int
    truncated_count: int
    truncation_applied: bool

class TokenBudget:
    """Token 预算管理：分配与超限检测"""

    def __init__(self, counter: TokenCounter):
        self.counter = counter

    def allocate(
        self,
        messages: list[dict],
        system_prompt: str,
# ... (完整实现见 PRD)
```

### 3. 核心组件




<a id="sec-4"></a>
## 四、数据流

```mermaid
sequenceDiagram
    participant C as Client (YiVad/YiPet)
    participant R as RPC Router
    participant S as Service
    participant D as Domain
    participant M as MongoDB

    C->>R: RPC 信封 (module_name.method_name)
    R->>S: 路由到对应 service
    S->>D: 调用 domain 层业务逻辑
    D->>M: Motor 异步读写
    M-->>D: 返回数据
    D-->>S: 处理结果
    S-->>R: 标准 RPC 响应
    R-->>C: {code, message, data}
```

**调用链路**: `Client → RPC Router → Service → Domain → MongoDB`  
**响应格式**: `{code: 0, message: "ok", data: ...}`  
**异步模型**: 全链路 `async/await`，Motor 异步 MongoDB 驱动。

<a id="sec-5"></a>
## 五、实施路线图

**预估人天**: 0.3d

| # | 步骤 | 验证 | 人天 |
|---|------|------|------|
| 1 | 数据模型 + 基础设施 | Pydantic 校验通过 | 0.05 |
| 2 | 核心服务逻辑 | 单元测试通过 | 0.10 |
| 3 | RPC 路由 + 集成 | 集成测试通过 | 0.08 |
| 4 | 边界处理 + 文档 | 验收测试通过 | 0.07 |

<a id="sec-6"></a>
## 六、代码审查检查清单

- [ ] 数据模型使用 Pydantic BaseModel，枚举完整
- [ ] 服务层遵循 RPC 信封规范（module_name.method_name）
- [ ] 参数校验完整，错误码使用标准 ErrorCode
- [ ] MongoDB 操作使用 Motor 异步驱动
- [ ] `ruff` 代码规范通过
- [ ] `mypy` 类型检查通过
- [ ] 单元测试覆盖率 > 80%

<a id="sec-7"></a>
## 七、风险评估

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 性能劣化 | 低 | 中 | 异步处理 + 缓存 |
| 数据一致性 | 中 | 中 | MongoDB 事务 + 幂等设计 |
| 接口兼容性 | 低 | 低 | RPC 信封向后兼容 |
