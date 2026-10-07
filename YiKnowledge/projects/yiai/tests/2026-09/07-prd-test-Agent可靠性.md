---

doc_type: test
title: "YA-09-07: Agent 可靠性修复 — 测试规格"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-07"
source_prds: ["07-需求-Agent可靠性"]
source_modules: ["07-prd-task-Agent可靠性"]
source_okr: [yiai-001]

type: test
---

# YA-09-07: Agent 可靠性修复 — 测试规格

> 来源 PRD：[07-需求-Agent可靠性.md](../../prds/2026-09/07-需求-Agent可靠性.md)
> 开发方案：[07-prd-task-Agent可靠性.md](../../devs/2026-09/07-prd-task-Agent可靠性.md)
> 需求编号：YA-09-07 · 优先级：P0

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖分层超时保护（工具级/迭代级/连接级）、SSE 错误传播、迭代级限流。

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | Agent 循环逻辑 + mock LLM/工具 | pytest + AsyncMock | 分层超时触发、SSE 错误帧发送、迭代上限 |
| L2 集成测试 | 真实 SSE 连接 + 真实工具调用 | pytest-asyncio + httpx + motor | Agent 端到端流程、SSE 事件完整性、真实超时 |
| L4 性能基准 | Agent 延迟/内存测量 | pytest + time.perf_counter | 迭代耗时、并发 Agent 内存 |

### 1.2 三层超时架构

```
连接级超时 (300s)
  ├── 迭代 #1 超时 (60s)
  │     ├── LLM 推理超时 (60s) → 重试 1 次
  │     └── 工具调用超时 (30s) → 跳过该工具
  └── max_iterations=50 强制终止
```

### 1.3 受影响的工具

| 工具 | 外部依赖 | 单独超时 | 超时后行为 |
|------|---------|---------|-----------|
| `search_knowledge` | Ollama Embedding | 30s | 跳过，返回"检索超时" |
| `read_file` | 文件系统 | 10s | 跳过，返回"读取超时" |
| `query_database` | MongoDB | 15s | 跳过，返回"查询超时" |
| `execute_code` | 代码沙箱 | 30s | 跳过，返回"执行超时" |
| `web_search` | 外部 HTTP | 30s | 跳过，返回"搜索超时" |

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

@pytest.fixture
def mock_llm():
    """Mock LLM——返回需要调用工具的响应。"""
    llm = AsyncMock()
    llm.chat = AsyncMock()
    return llm

@pytest.fixture
def mock_tools():
    """Mock 工具注册表——包含 5 个工具。"""
    return {
        "search_knowledge": AsyncMock(return_value="检索结果: 找到 3 条相关文档"),
        "read_file": AsyncMock(return_value="文件内容: ..."),
        "query_database": AsyncMock(return_value="查询结果: 10 条记录"),
        "execute_code": AsyncMock(return_value="执行结果: 成功"),
        "web_search": AsyncMock(return_value="搜索结果: 找到 5 个链接"),
    }

@pytest.fixture
def slow_tool():
    """模拟永远不返回的工具——用于超时测试。"""
    async def never_return(**kwargs):
        await asyncio.sleep(999)
    return AsyncMock(side_effect=never_return)

@pytest.fixture
def mock_sse_sender():
    """Mock SSE 发送器——记录所有发送的事件。"""
    sender = AsyncMock()
    sender.send = AsyncMock()
    sender.send_error = AsyncMock()
    sender.close = AsyncMock()
    sender.events = []  # 记录发送的事件

    async def record_send(data):
        sender.events.append(data)
    sender.send.side_effect = record_send
    return sender

@pytest.fixture
def agent_config():
    """Agent 配置 fixture。"""
    return {
        "llm_timeout": 60,        # LLM 调用超时
        "tool_timeout": 30,        # 工具调用超时
        "iteration_timeout": 60,   # 单次迭代超时
        "connection_timeout": 300, # Agent 连接总超时
        "max_iterations": 50,      # 最大迭代轮次
        "max_retries": 1,          # LLM 重试次数
    }

@pytest.fixture
def agent_messages():
    """标准 Agent 对话消息。"""
    return [
        {"role": "system", "content": "你是一个 AI 助手，可以使用工具帮助用户。"},
        {"role": "user", "content": "请搜索知识库中关于 RAG 优化的文档，并总结要点。"},
    ]
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 工具级超时

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-AG-01 | 工具调用 30s 超时触发 | slow_tool (永不返回) | 1. Agent 调用 `_execute_tool("search_knowledge", args)`<br>2. 工具执行超过 30s | `asyncio.TimeoutError` 被捕获，Agent 继续执行（非崩溃） | P0 |
| TC-AG-02 | 工具超时后跳过该工具 | search_knowledge 超时 | 1. 工具超时<br>2. Agent 检查后续行为 | 跳过超时工具，日志 "工具 search_knowledge 超时 30s" | P0 |
| TC-AG-03 | 多个工具依次超时 | 2 个工具依次超时 | 1. 第 1 个工具超时 → 跳过<br>2. 第 2 个工具正常 → 执行 | Agent 继续正常流程，不因单工具超时终止 | P1 |
| TC-AG-04 | 按工具差异化超时 | read_file(10s) vs execute_code(30s) | 1. read_file 耗时 15s → 超时<br>2. execute_code 耗时 20s → 正常 | 不同工具使用不同超时值 | P1 |
| TC-AG-05 | 所有工具都超时 | 全部 5 个工具均超时 | 1. 每个工具调用都超时<br>2. Agent 总结结果 | Agent 正常结束，输出 "所有工具调用均超时" | P1 |

### 3.2 LLM 调用超时

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-AG-06 | LLM 推理 60s 超时 | Mock LLM 耗时 > 60s | 1. Agent 调用 `llm.chat()`<br>2. LLM 响应超时 | 超时后重试 1 次，仍超时则返回错误 | P0 |
| TC-AG-07 | LLM 重试成功 | 第 1 次超时，第 2 次成功 | 1. 第一次调用超时<br>2. 重试调用成功<br>3. 检查结果 | 使用第 2 次结果继续 Agent 循环 | P1 |
| TC-AG-08 | LLM 重试仍超时 | 2 次调用均超时 | 1. 第一次超时 → 重试<br>2. 第二次超时<br>3. 检查 SSE 事件 | 发送 `type:"error"` SSE 事件，关闭连接 | P0 |

### 3.3 SSE 错误传播

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-AG-09 | 工具超时 → SSE 错误帧 | search_knowledge 超时 | 1. 工具超时触发<br>2. 检查 SSE 事件 | 发送 `{type: "error", code: 2002, message: "工具调用超时"}` | P0 |
| TC-AG-10 | SSE 错误后连接关闭 | SSE 错误帧已发送 | 1. 发送错误帧后<br>2. 检查 SSE 连接状态 | SSE 连接正常关闭（非断开） | P0 |
| TC-AG-11 | SSE 流中断时前端感知 | 异常未通过 SSE 传播（修复前） | 1. 模拟修复前行为：异常仅记日志<br>2. 检查 SSE 连接 | 修复后：SSE 发送 error 帧 | P0 |
| TC-AG-12 | SSE 正常结束发送 done 事件 | Agent 正常完成 | 1. Agent 循环正常结束<br>2. 检查最后事件 | 最后事件为 `{type: "done"}` | P1 |

### 3.4 迭代级限流

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-AG-13 | 达到 max_iterations=50 强制终止 | Agent 循环 > 50 次 | 1. 每次 LLM 返回工具调用<br>2. 达到 50 轮<br>3. 检查行为 | 强制终止，返回已有结果 + WARNING "达到最大迭代次数" | P1 |
| TC-AG-14 | 迭代超时 60s 终止当前迭代 | 单次迭代 > 60s | 1. LLM 推理 50s + 工具调用 20s<br>2. 检查总迭代时间 | 超过 60s 时终止当前迭代，进入下一轮或结束 | P1 |
| TC-AG-15 | 连接总超时 300s 全局终止 | Agent 运行 > 300s | 1. 模拟多轮迭代超时<br>2. 达到 300s 总超时 | 强制终止 Agent，关闭 SSE 连接 | P1 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-AG-01 | 零工具 Agent 循环 | Agent 无可用工具 | LLM 直接回答，不调用工具 | P1 |
| EG-AG-02 | 工具 handler 不存在 | Agent 调用不存在的工具名 | 返回 "Unknown tool: xxx"，不崩溃 | P1 |
| EG-AG-03 | 并发 Agent 实例超时独立 | 3 个 Agent 同时运行 | 各 Agent 超时独立，不互相影响 | P1 |
| EG-AG-04 | SSE 客户端断开后 Agent 停止 | 流式进行中客户端关闭连接 | 3s 内 Agent task 被 cancel，资源释放 | P0 |
| EG-AG-05 | 自定义工具超时覆盖 | 用户自定义工具超时值覆盖默认 | 自定义超时优先生效 | P2 |
| EG-AG-06 | Ollama 完全不可用 | Ollama 服务宕机 | Agent 返回错误 "AI 服务不可用" | P1 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-AG-01 | 正常对话不受超时影响 | 正常 Agent 对话（无超时） | Agent 行为不变，SSE 流完整 | P0 |
| RG-AG-02 | 现有 Agent 工具不变 | 修复后工具调用 | 工具调用参数和返回值格式不变 | P0 |
| RG-AG-03 | YiVad/YiPet SSE 客户端兼容 | 前端 SSE EventSource 解析 | 前端正常显示 Agent 响应和错误提示 | P0 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: 工具调用超时 30s | TC-AG-01 ~ TC-AG-05 | 触发/跳过/多工具/差异化/全超时 |
| FR2: LLM 调用超时 60s + 重试 | TC-AG-06 ~ TC-AG-08 | 超时/重试成功/重试失败 |
| FR3: SSE 错误传播 | TC-AG-09 ~ TC-AG-12 | 错误帧/连接关闭/流中断/done 事件 |
| FR4: 迭代限流 | TC-AG-13 ~ TC-AG-15 | max_iterations/迭代超时/连接总超时 |
| 决策1: 分层超时 | TC-AG-01, TC-AG-04, TC-AG-13 | 三层各有独立超时值 |
| 决策2: SSE 错误帧 | TC-AG-09 ~ TC-AG-11 | error 帧发送 + 连接关闭 |
| 决策3: 配置文件 + 按工具差异化 | TC-AG-04, EG-AG-05 | config.yaml + 自定义覆盖 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| 真实 Ollama 超时模拟 | Mock 超时无法完全模拟真实 LLM 超时网络行为 | 添加网络层超时（ToxiProxy）集成测试 |
| 并发 Agent 资源竞争 | 多 Agent 共享 MongoDB 连接池时的竞争未测 | 添加 20 并发 Agent 的资源竞争测试 |
| 客户端重连机制 | SSE 断开后前端自动重连未测 | 添加 YiVad/YiPet 端 SSE 重连 E2E 测试 |
| 超时配置热更新 | config.yaml 超时值变更后是否即时生效 | 添加配置热更新→超时行为验证测试 |
| Agent 循环死锁检测 | LLM 反复调用同一工具无进展 | 添加死循环检测（连续 5 次相同工具+相同参数） |