---

doc_type: test
title: "YA-09-08: API 契约校验 — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-08"
source_prds: ["08-需求-API契约校验"]
source_modules: ["08-prd-task-API契约校验"]
source_okr: [yiai-001]

type: test
---

# YA-09-08: API 契约校验 — 测试规格

> 来源 PRD：[08-需求-API契约校验.md](../../prds/2026-09/08-需求-API契约校验.md)
> 开发方案：[08-prd-task-API契约校验.md](../../devs/2026-09/08-prd-task-API契约校验.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 RPC 参数白名单校验、未知参数 WARNING 日志、常见参数名错误自动检测、长线 Pydantic 模型迁移。

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 参数白名单校验逻辑 | pytest + unittest.mock | 白名单匹配、未知参数检测、常见错误名映射 |
| L2 集成测试 | 真实 RPC 调用 | pytest-asyncio + httpx + motor | 参数校验中间件、WARNING 日志输出、API 行为不变 |

### 1.2 已知的参数名不匹配案例

| 接口 | 正确参数名 | 常见错误参数名 | 后果 |
|------|-----------|---------------|------|
| `data_service.query_documents` | `filter` | `query` | 过滤条件失效，返回全量数据 |
| `/read-file` | `target_file` | `path` | 422 错误 |
| `/write-file` | `target_file` | `path` | 422 错误 |
| `knowledge.list_files` | `scope` | `path` | 返回空列表 |

### 1.3 设计决策回顾

```
短期: 警告 + 透传（代码内联白名单）——不破坏现有调用
长期: Pydantic 模型校验——拒绝未知参数 + 自动文档生成
```

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import logging
from unittest.mock import MagicMock, patch

@pytest.fixture
def allowed_params_map():
    """各 Service 方法的参数白名单。"""
    return {
        "services.database.data_service.query_documents": ["cname", "filter", "pageNum", "pageSize", "sort", "projection"],
        "services.database.data_service.create_document": ["cname", "data"],
        "services.database.data_service.update_document": ["cname", "doc_id", "data"],
        "services.database.data_service.delete_document": ["cname", "doc_id"],
        "services.knowledge.knowledge_service.list_files": ["scope"],
        "services.ai.chat_service.chat": ["session_key", "message", "model"],
    }

@pytest.fixture
def common_param_mistakes():
    """常见参数名错误映射表。"""
    return {
        "query": "filter",                # query → filter
        "path": "target_file",            # path → target_file
        "collection_name": "cname",       # collection_name → cname
        "query_params": "filter",         # query_params → filter
        "doc_data": "data",               # doc_data → data
        "sort_by": "sort",                # sort_by → sort
    }

@pytest.fixture
def valid_rpc_request():
    """参数完全正确的 RPC 请求。"""
    return {
        "module_name": "services.database.data_service",
        "method_name": "query_documents",
        "parameters": {
            "cname": "bugs",
            "filter": {"status": "open"},
            "pageNum": 1,
            "pageSize": 10,
        }
    }

@pytest.fixture
def invalid_rpc_request_query():
    """使用错误参数名 `query` 的 RPC 请求。"""
    return {
        "module_name": "services.database.data_service",
        "method_name": "query_documents",
        "parameters": {
            "cname": "bugs",
            "query": {"status": "open"},  # 应为 filter
            "pageNum": 1,
            "pageSize": 10,
        }
    }

@pytest.fixture
def invalid_rpc_request_path():
    """使用错误参数名 `path` 的 RPC 请求。"""
    return {
        "module_name": "services.database.data_service",
        "method_name": "read_file",
        "parameters": {
            "path": "/data/test.md",  # 应为 target_file
        }
    }

@pytest.fixture
def mixed_rpc_request():
    """已知参数与未知参数混合的 RPC 请求。"""
    return {
        "module_name": "services.database.data_service",
        "method_name": "query_documents",
        "parameters": {
            "cname": "bugs",
            "filter": {"status": "open"},
            "query": {"status": "closed"},  # 错误参数
            "extra_field": "unexpected",    # 未知参数
        }
    }

@pytest.fixture
def caplog_warning_handler():
    """捕获 WARNING 级别日志的 fixture。"""
    import logging
    logger = logging.getLogger("rpc.contract")
    logger.setLevel(logging.WARNING)
    handler = logging.StreamHandler()
    logger.addHandler(handler)
    yield handler
    logger.removeHandler(handler)
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 参数白名单基本校验

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-AP-01 | 全部已知参数通过 | valid_rpc_request | 1. 参数白名单包含所有参数<br>2. 执行校验 | 校验通过，无 WARNING | P0 |
| TC-AP-02 | 单个未知参数 WARNING | parameters 含 `query` | 1. 检测到 `query` 不在白名单<br>2. 检查日志 | WARNING "未知参数 query in query_documents，建议使用 filter" | P0 |
| TC-AP-03 | 已知+未知混合处理 | mixed_rpc_request | 1. `cname` 和 `filter` 通过<br>2. `query` 和 `extra_field` WARNING | 已知参数正常处理，未知参数仅记录不阻断 | P0 |
| TC-AP-04 | 参数名 `path` 而非 `target_file` | invalid_rpc_request_path | 1. 检测到 `path` 不在白名单<br>2. 建议使用 `target_file` | WARNING 含建议 "已知错误: path → target_file" | P0 |
| TC-AP-05 | 参数名 `collection_name` 而非 `cname` | parameters 含 `collection_name` | 1. 检测到 `collection_name`<br>2. 检查建议映射 | WARNING 含建议 "已知错误: collection_name → cname" | P1 |

### 3.2 常见错误名映射

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-AP-06 | `query` 自动建议 `filter` | common_param_mistakes 中兜底 `query` | 1. 检测未知参数 `query`<br>2. 检查建议内容 | WARNING 含 "建议: 使用 filter 而非 query" | P1 |
| TC-AP-07 | `path` 自动建议 `target_file` | common_param_mistakes 中兜底 `path` | 1. 检测未知参数 `path`<br>2. 在 /read-file 上下文中 | WARNING 含 "建议: 使用 target_file 而非 path" | P1 |
| TC-AP-08 | 未映射的新错误名仅 WARNING | 未知参数 `unknown_param` | 1. 新参数名不在常见错误映射表 | WARNING "未知参数 unknown_param"（无建议） | P2 |
| TC-AP-09 | 参数名为空字符串 | `parameters: {"": "value"}` | 1. 空字符串参数名<br>2. 校验行为 | WARNING "空参数名" | P2 |

### 3.3 白名单覆盖完整性

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-AP-10 | `query_documents` 完整参数覆盖 | 所有该方法的有效参数 | 1. 逐一检查 cname/filter/pageNum/pageSize/sort/projection | 所有参数通过白名单 | P1 |
| TC-AP-11 | `create_document` 参数覆盖 | data_service 创建方法 | 1. 检查 cname + data 通过 | 白名单正确 | P1 |
| TC-AP-12 | 文件读写端点参数覆盖 | /read-file + /write-file | 1. 检查 `target_file` 为有效参数 | 白名单正确 | P1 |

### 3.4 WARNING 日志输出

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-AP-13 | WARNING 日志格式规范 | 未知参数触发 | 1. 检查日志文本结构 | 包含: 时间戳、模块名、方法名、未知参数名、建议 | P1 |
| TC-AP-14 | WARNING 不影响响应 code | valid_rpc_request + 1 未知参数 | 1. 业务逻辑正常执行<br>2. 检查 RPC 响应 | code=0，data 正常，message=ok | P0 |
| TC-AP-15 | 多条 WARNING 聚合 | 3 个未知参数同时出现 | 1. `query` + `path` + `extra` 同时传入<br>2. 检查日志 | 三条 WARNING 分别记录 | P2 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-AP-01 | 参数完全为空 | `parameters: {}` | 校验通过（无未知参数），不报错 | P1 |
| EG-AP-02 | 白名单列表为空 | 新方法暂未登记白名单 | 所有参数通过（无白名单=不校验），日志 INFO "白名单未配置" | P1 |
| EG-AP-03 | 特殊字符参数名 | `parameters: {"$set": "value"}` | 正常处理，WARNING 如果不在白名单 | P2 |
| EG-AP-04 | 嵌套对象作为未知参数 | `parameters: {"nested": {"a": 1}}` | WARNING "未知参数 nested"（仅检查顶层键） | P2 |
| EG-AP-05 | 大量未知参数 | 50 个未知参数 | 全部 WARNING（无性能问题），业务逻辑正常 | P2 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-AP-01 | 已知参数使用不受影响 | `query_documents` 使用 `filter` | 过滤正常，分页正常 | P0 |
| RG-AP-02 | YiVad 列表页数据正确 | YiVad Issues/Bugs 列表查询 | 数据量正确，分页正确 | P0 |
| RG-AP-03 | YiPet RPC 调用不受影响 | YiPet 通过 RPC 信封调用 | 所有现有调用正常 | P1 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: 参数白名单校验 | TC-AP-01 ~ TC-AP-03, TC-AP-10 ~ TC-AP-12 | 已知/未知/混合/覆盖 |
| FR2: 未知参数 WARNING 日志 | TC-AP-02 ~ TC-AP-05, TC-AP-13 ~ TC-AP-15 | 检测/建议/格式/响应不中断 |
| FR3: 常见参数名错误检测 | TC-AP-04 ~ TC-AP-08 | 四组已知错误映射 |
| FR4: API 行为不变 | TC-AP-14, RG-AP-01 ~ RG-AP-03 | 校验不阻断 + 回归 |
| 决策1: 警告 + 透传 | TC-AP-03, TC-AP-14 | 不破坏现有调用 |
| 决策2: 代码内联白名单 | TC-AP-10 ~ TC-AP-12 | 覆盖所有 Service 方法 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| Pydantic 模型迁移后拒绝模式 | 长期方案未测试 | 当迁移到 Pydantic 后，添加 400 拒绝未知参数测试 |
| 跨项目契约自动检测 | CI 中未自动校验 YiVad/YiPet 参数名 | 添加 CI 流水线——解析前端 API 调用参数名对比白名单 |
| 白名单自动生成 | 当前白名单手动维护，可能与代码不一致 | 添加从 Python 函数签名自动提取参数白名单的工具 |
| WARNING 日志告警集成 | WARNING 仅写日志，未被告警系统消费 | 添加 WARNING 日志 → Prometheus 指标 → 告警 |