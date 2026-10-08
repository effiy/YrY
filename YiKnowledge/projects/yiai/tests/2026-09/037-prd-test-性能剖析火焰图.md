---

doc_type: test
title: "YA-09-33: 服务性能剖析与火焰图集成 — py-spy 生产级 CPU Profiling — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa, sre]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-33"
source_prds: ["37-需求-性能剖析火焰图"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-33: 服务性能剖析与火焰图集成 — 测试规格

> **文档职责**：本文档定义性能剖析模块的**怎么验证**（VERIFY），覆盖 py-spy 集成、CPU/内存 Profile 采集、火焰图生成和性能回归检测。

> 来源 PRD：[37-需求-性能剖析火焰图.md](../../prds/2026-09/37-需求-性能剖析火焰图.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | Profile 数据解析、SVG 生成逻辑 | pytest | py-spy 输出解析、热点函数提取 |
| L2 集成 | 真实进程 py-spy 采集 | pytest + subprocess | CPU Profile、内存 Profile、定时采样 |
| L3 手动回归 | 火焰图可视化验证 | 手动 + 浏览器 | SVG 交互、函数搜索、调用栈展示 |
| L4 性能基准 | Profile 采集开销测量 | pytest + time.perf_counter | 采样开销 < 1% CPU |

### 1.2 测试数据

```python
# tests/profiling/conftest.py

import subprocess
import json

@pytest.fixture
def sample_py_spy_output():
    """py-spy 输出样本——模拟 5s 采样的 CPU Profile。"""
    return """Process 12345: python main.py
Python v3.10.12 (CPython)

Total Samples 500
GIL: 80.00%, Active: 90.00%, Threads: 4

%Own   %Total  OwnTime  TotalTime  Function
 0.00%   0.00%   0.00s    0.50s    asyncio.run (asyncio/runners.py:44)
 0.00%  40.00%   0.00s    2.00s    uvicorn.main (uvicorn/main.py:577)
 5.00%  35.00%   0.25s    1.75s    rpc_router.dispatch (server/rpc_router.py:89)
10.00%  25.00%   0.50s    1.25s    data_service.query_documents (services/database/data_service.py:67)
20.00%  15.00%   1.00s    0.75s    motor.motor_asyncio.find (motor/core.py:234)
15.00%   0.00%   0.75s    0.00s    ollama.Client.chat (ollama/client.py:156)
"""

@pytest.fixture
def profile_output_dir(tmp_path):
    """Profile 输出目录。"""
    d = tmp_path / "profiles"
    d.mkdir()
    return d

@pytest.fixture
def parse_profile_output():
    """解析 py-spy JSON 输出。"""
    def _parse(raw: str) -> dict:
        lines = raw.strip().split("\n")
        result = {"functions": []}
        in_data = False
        for line in lines:
            if line.startswith("%Own"):
                in_data = True
                continue
            if in_data and line.strip():
                parts = line.split()
                if len(parts) >= 6:
                    result["functions"].append({
                        "own_pct": parts[0],
                        "total_pct": parts[1],
                        "own_time": parts[2],
                        "total_time": parts[3],
                        "function": " ".join(parts[4:-1]),
                        "location": parts[-1] if parts[-1].startswith("(") else "",
                    })
        return result
    return _parse
```

---

<a id="sec-test-cases"></a>
## 二、测试用例

### 2.1 py-spy 采集

---

#### TC-PROF-001: py-spy 成功附加到运行中的 YiAi 进程

| 字段 | 内容 |
|------|------|
| **ID** | TC-PROF-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | YiAi 服务运行，py-spy 已安装 |
| **步骤** | 1. 获取 YiAi 进程 PID<br/>2. 执行 `py-spy top --pid <PID> --duration 5`<br/>3. 检查输出 |
| **预期结果** | - py-spy 成功附加<br/>- 5 秒后输出采样结果<br/>- 输出包含函数名、耗时百分比和调用位置 |

---

#### TC-PROF-002: 5 秒 CPU Profile 包含热点函数

| 字段 | 内容 |
|------|------|
| **ID** | TC-PROF-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 在 Profile 采集期间发送 RAG 查询请求 |
| **步骤** | 1. 启动 py-spy 5 秒采样<br/>2. 同时发送 5 个 RAG 请求<br/>3. 分析 Profile 输出 |
| **预期结果** | - `rpc_router.dispatch` 在热点列表中<br/>- `data_service.query_documents` 在热点列表中<br/>- `ollama.Client.chat` 或 LLM 调用函数占比最高 |

---

#### TC-PROF-003: py-spy dump 生成 SVG 火焰图

| 字段 | 内容 |
|------|------|
| **ID** | TC-PROF-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | py-spy 已安装 |
| **步骤** | 1. 执行 `py-spy record -o profile.svg --pid <PID> --duration 10`<br/>2. 检查输出文件 |
| **预期结果** | - `profile.svg` 文件生成<br/>- 文件大小 > 10KB<br/>- SVG 可在浏览器中打开<br/>- 火焰图展示调用栈和耗时比例 |

---

#### TC-PROF-004: 定时采样——每 30 分钟自动采集

| 字段 | 内容 |
|------|------|
| **ID** | TC-PROF-004 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | `profiling.interval_minutes=30` 配置启用 |
| **步骤** | 1. 启动 YiAi（带 Profile 定时任务）<br/>2. 等待 35 分钟<br/>3. 检查 Profile 输出目录 |
| **预期结果** | - 至少 1 个 `profile_*.svg` 文件<br/>- 文件命名包含时间戳<br/>- apscheduler 日志记录采样完成 |

---

### 2.2 Profile 数据解析

---

#### TC-PROF-005: 解析 py-spy 文本输出提取热点 Top 10

| 字段 | 内容 |
|------|------|
| **ID** | TC-PROF-005 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `sample_py_spy_output` + `parse_profile_output` |
| **步骤** | 1. 解析 `sample_py_spy_output`<br/>2. 按 `total_pct` 降序排列<br/>3. 取前 10 个函数 |
| **预期结果** | - Top 1: `uvicorn.main` (40%)<br/>- Top 2: `rpc_router.dispatch` (35%)<br/>- Top 3: `data_service.query_documents` (25%)<br/>- Top 10 列表完整 |

---

#### TC-PROF-006: Profile JSON 导出格式

| 字段 | 内容 |
|------|------|
| **ID** | TC-PROF-006 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | py-spy `--format json` 输出 |
| **步骤** | 1. 执行 `py-spy record -o profile.json --format json --pid <PID>`<br/>2. `json.load()` 解析 |
| **预期结果** | - `json.load` 成功<br/>- 包含 `sample_interval` 字段<br/>- 包含 `threads` 数组<br/>- 每个 thread 包含 `frames` 数组 |

---

### 2.3 性能回归检测

---

#### TC-PROF-007: 对比两次 Profile 检测热点变化 > 10%

| 字段 | 内容 |
|------|------|
| **ID** | TC-PROF-007 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | 两次 Profile: baseline（修改前）和 current（修改后） |
| **步骤** | 1. 运行性能基准 Profile<br/>2. 修改代码<br/>3. 运行当前 Profile<br/>4. 对比热点函数占比变化 |
| **预期结果** | - 检测到函数占比变化 > 10% 时标记 WARNING<br/>- 变化 > 30% 时标记 ERROR<br/>- 输出差异报告 |

---

#### TC-PROF-008: 内存 Profile 识别内存泄漏模式

| 字段 | 内容 |
|------|------|
| **ID** | TC-PROF-008 |
| **层级** | L2 集成 |
| **优先级** | P2 |
| **前提** | py-spy 支持 `--memory` 或使用 `tracemalloc` |
| **步骤** | 1. 连续运行 100 次 RAG 查询<br/>2. 采集内存快照<br/>3. 检查 `tracemalloc` Top 10 |
| **预期结果** | - 内存最大分配函数列出<br/>- 无明显持续增长（泄漏）模式<br/>- `tracemalloc.take_snapshot()` 正常 |

---

<a id="sec-edge-cases"></a>
## 三、边界与异常测试

### TC-EDGE-001: py-spy 附加到不存在的 PID

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-001 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 使用不存在的 PID 执行 py-spy |
| **预期结果** | - py-spy 返回错误码 1<br/>- stderr: "Could not attach to PID 99999"<br/>- Python 包装代码捕获 `CalledProcessError` |

### TC-EDGE-002: Profile 采集期间服务重启

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-002 |
| **层级** | L2 集成 |
| **优先级** | P2 |
| **步骤** | 1. 启动 30 秒 Profile 采集<br/>2. 5 秒后 kill 进程<br/>3. 检查 py-spy 行为 |
| **预期结果** | - py-spy 检测到进程退出<br/>- 输出部分 Profile（5 秒数据）<br/>- 不崩溃 |

### TC-EDGE-003: Profile 文件大小限制——超大火焰图

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-003 |
| **层级** | L1 单元 |
| **优先级** | P2 |
| **步骤** | 1. 生成 10 分钟采样的 Profile<br/>2. 检查 SVG 文件大小 |
| **预期结果** | - SVG > 50MB 时降级为简化版<br/>- 或限制采样时长为 120 秒 |

### TC-EDGE-004: 采样开销验证——< 1% CPU

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-004 |
| **层级** | L4 性能 |
| **优先级** | P1 |
| **步骤** | 1. 测量无 Profile 时的 CPU 使用率（基线）<br/>2. 测量 py-spy 采集时的 CPU 使用率<br/>3. 计算增量 |
| **预期结果** | - py-spy 采样开销 < 1% CPU<br/>- 业务请求延迟无明显增加 |

---

<a id="sec-regression"></a>
## 四、回归测试

### TC-REG-001: Profile 定时任务不阻塞业务

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. Profile 定时采样期间<br/>2. 发送 100 个 RPC 请求<br/>3. 测量 P50/P99 延迟 |
| **预期结果** | - P50 延迟与无 Profile 时一致<br/>- P99 延迟与无 Profile 时一致<br/>- 无 5xx 错误 |

### TC-REG-002: Profile 开关可配置

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 配置 `profiling.enabled=false`<br/>2. 启动 YiAi |
| **预期结果** | - 无 py-spy 进程<br/>- 无 Profile 文件生成<br/>- 无性能开销 |

---

<a id="sec-traceability"></a>
## 五、需求-测试追溯矩阵

| PRD FR | 模块 | 测试用例 | 覆盖层级 |
|--------|------|---------|---------|
| FR-py-spy 集成 | subprocess | TC-PROF-001~003 | L2 |
| FR-定时采样 | apscheduler | TC-PROF-004 | L2 |
| FR-Profile 解析 | Parser | TC-PROF-005~006 | L1 |
| FR-性能回归检测 | Comparator | TC-PROF-007~008 | L2 |
| FR-容错 | 异常处理 | TC-EDGE-001~003 | L2 |
| FR-性能开销 | Benchmark | TC-EDGE-004 | L4 |
| FR-回归 | 全模块 | TC-REG-001~002 | L2 |

---

<a id="sec-coverage"></a>
## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| 生产容器环境 py-spy 权限 | Docker 需要 SYS_PTRACE 能力 | 在容器测试中补充 |
| Memory Profile 深度分析 | py-spy 仅支持 CPU Profile | 使用 `tracemalloc` + `memory_profiler` 补充 |
| goroutine/coroutine 级别 Profile | py-spy 是进程级别 | 评估 `pyinstrument` 异步支持 |
| Profile 文件自动上传 | 需 OSS/CDN 存储 | 在文件存储测试中补充 |

---

<a id="sec-references"></a>
## 七、参考文档

| 资源 | 路径 |
|------|------|
| 源 PRD | [37-需求-性能剖析火焰图.md](../../prds/2026-09/37-需求-性能剖析火焰图.md) |
| 冷启动优化 | [../2026-09/0038-prd-test-冷启动优化.md](../2026-09/038-prd-test-冷启动优化.md) |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/37-需求-性能剖析火焰图.md`*