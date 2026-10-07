---

doc_type: test
title: "YA-07-05: 模块执行沙箱 — RPC 分发 + 白名单校验 + Observer 沙箱 + 重入保护 — 测试规格"
status: 待开始
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202607"
prd_task_id: "YA-07-05"
source_prds: ["05-需求-模块执行沙箱"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-07-05: 模块执行沙箱 — RPC 分发 + 白名单校验 + Observer 沙箱 + 重入保护 — 测试规格

> **文档职责**：本文档定义模块执行沙箱的**怎么验证**（VERIFY），覆盖参数解析、白名单校验、四种函数类型分支调用、Observer 沙箱隔离、重入保护和脚本执行。

> 来源 PRD：[05-需求-模块执行沙箱.md](../../prds/2026-07/05-需求-模块执行沙箱.md)
> 来源 Dev：[05-prd-task-模块执行沙箱.md](../../devs/2026-07/05-prd-task-模块执行沙箱.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 纯函数级，mock 外部依赖 | pytest + unittest.mock | `parse_parameters()`、`_check_whitelist()`、`_import_target_function()` |
| L2 集成测试 | 真实模块导入 + RPC 调用 | pytest-asyncio + httpx | 动态导入、四种函数类型、Observer 沙箱、重入保护、`run_script()` |
| L3 手动回归 | 前端 RPC 调用 | 手动 + curl + YiVad | 前端 RPC 请求经过沙箱到达 Service |
| L4 安全审计 | 恶意输入渗透测试 | 手动 | 路径遍历、SQL 注入尝试、命令注入尝试 |

### 1.2 测试数据

```python
# tests/conftest.py 新增 fixtures

@pytest.fixture
def allowed_module_name():
    """白名单中的模块名。"""
    return "services.database.data_service"

@pytest.fixture
def forbidden_module_name():
    """不在白名单中的模块名。"""
    return "os"

@pytest.fixture
def valid_parameters_dict():
    """有效的 dict 参数。"""
    return {"cname": "menus", "filter": {}}

@pytest.fixture
def valid_parameters_json_str():
    """有效的 JSON 字符串参数。"""
    return '{"cname": "menus", "filter": {}}'

@pytest.fixture
def invalid_parameters_json():
    """非法的 JSON 字符串。"""
    return "{broken json"

@pytest.fixture
def parameters_not_dict():
    """JSON 解析后不是 dict（是数组）。"""
    return "[1, 2, 3]"

# 测试用四种函数类型的 mock

@pytest.fixture
def sync_function():
    """同步函数。"""
    def _sync(a: int, b: int) -> int:
        return a + b
    return _sync

@pytest.fixture
async def async_function():
    """异步函数。"""
    async def _async(a: int, b: int) -> int:
        return a + b
    return _async

@pytest.fixture
def generator_function():
    """生成器函数。"""
    def _gen(n: int):
        for i in range(n):
            yield i
    return _gen

@pytest.fixture
async def asyncgen_function():
    """异步生成器函数。"""
    async def _asyncgen(n: int):
        for i in range(n):
            yield i
    return _asyncgen
```

---

<a id="sec-test-cases"></a>
## 二、测试用例

### 2.1 参数解析 — `parse_parameters()`

---

#### TC-EXEC-001: dict 类型参数直接返回

| 字段 | 内容 |
|------|------|
| **ID** | TC-EXEC-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. 调用 `parse_parameters({"key": "value"})` |
| **预期结果** | - 返回原 dict `{"key": "value"}`<br/>- 不被修改 |

---

#### TC-EXEC-002: JSON 字符串参数正确解析

| 字段 | 内容 |
|------|------|
| **ID** | TC-EXEC-002 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. 调用 `parse_parameters('{"cname": "menus", "filter": {}}')` |
| **预期结果** | - 返回 `{"cname": "menus", "filter": {}}`<br/>- JSON 解析正确 |

---

#### TC-EXEC-003: 非法 JSON 字符串抛出 BusinessException

| 字段 | 内容 |
|------|------|
| **ID** | TC-EXEC-003 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. 调用 `parse_parameters("{broken json")` |
| **预期结果** | - 抛出 `BusinessException(ErrorCode.INVALID_PARAMS)`<br/>- message 包含 "Invalid JSON" |

---

#### TC-EXEC-004: JSON 数组被拒绝

| 字段 | 内容 |
|------|------|
| **ID** | TC-EXEC-004 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | — |
| **步骤** | 1. 调用 `parse_parameters("[1, 2, 3]")` |
| **预期结果** | - 抛出 `BusinessException(ErrorCode.INVALID_PARAMS)`<br/>- message 包含 "Parameters must be a JSON object" |

---

### 2.2 白名单校验

---

#### TC-WL-001: 白名单中包含 "*" 时跳过校验

| 字段 | 内容 |
|------|------|
| **ID** | TC-WL-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `EXEC_ALLOWLIST = {"*"}` (开发模式) |
| **步骤** | 1. 调用 `_check_whitelist("any.module", "any_method")` |
| **预期结果** | - 不抛出异常<br/>- 日志可能记录 "Whitelist bypassed (dev mode)" |

---

#### TC-WL-002: 模块不在白名单中抛出 PERMISSION_DENIED

| 字段 | 内容 |
|------|------|
| **ID** | TC-WL-002 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `EXEC_ALLOWLIST = {"services.database.data_service:query_documents"}` (生产模式) |
| **步骤** | 1. 调用 `_check_whitelist("os", "system")` |
| **预期结果** | - 抛出 `BusinessException(ErrorCode.PERMISSION_DENIED)`<br/>- message 包含 "Execution forbidden: os:system" |

---

#### TC-WL-003: 白名单精确匹配放行

| 字段 | 内容 |
|------|------|
| **ID** | TC-WL-003 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `EXEC_ALLOWLIST = {"services.database.data_service:query_documents"}` |
| **步骤** | 1. 调用 `_check_whitelist("services.database.data_service", "query_documents")` |
| **预期结果** | - 不抛出异常<br/>- 精确匹配通过 |

---

#### TC-WL-004: 模块空白字段引发错误

| 字段 | 内容 |
|------|------|
| **ID** | TC-WL-004 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | — |
| **步骤** | 1. `_check_whitelist("", "method")` <br/>2. `_check_whitelist("module", "")` |
| **预期结果** | - 抛出 `BusinessException(ErrorCode.INVALID_PARAMS)`<br/>- message 包含 "Module path and function name required" |

---

### 2.3 动态导入与函数调用

---

#### TC-IMPORT-001: 正常模块导入

| 字段 | 内容 |
|------|------|
| **ID** | TC-IMPORT-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 有效的模块路径 |
| **步骤** | 1. 调用 `_import_target_function("services.database.data_service", "query_documents")` |
| **预期结果** | - 返回可调用对象<br/>- 日志包含 `RPC dispatch: module=... function=query_documents` |

---

#### TC-IMPORT-002: 模块不存在

| 字段 | 内容 |
|------|------|
| **ID** | TC-IMPORT-002 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. 调用 `_import_target_function("nonexistent.module", "method")` |
| **预期结果** | - 抛出 `BusinessException(ErrorCode.INVALID_PARAMS)`<br/>- message 包含 "Module or function not found" |

---

#### TC-IMPORT-003: 方法不存在

| 字段 | 内容 |
|------|------|
| **ID** | TC-IMPORT-003 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. 调用 `_import_target_function("services.database.data_service", "nonexistent_method")` |
| **预期结果** | - 抛出 `BusinessException(ErrorCode.INVALID_PARAMS)`<br/>- 不返回 None（避免后续 `None(**kwargs)` 错误） |

---

### 2.4 四种函数类型分支调用

---

#### TC-CALL-001: 同步函数调用

| 字段 | 内容 |
|------|------|
| **ID** | TC-CALL-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `sync_function` fixture |
| **步骤** | 1. 调用 `_run_function(sync_function, {"a": 1, "b": 2})`<br/>2. 检查返回值 |
| **预期结果** | - 返回 `3`<br/>- 函数在沙箱 context 中执行（如果已启用） |

---

#### TC-CALL-002: 异步函数 await 调用

| 字段 | 内容 |
|------|------|
| **ID** | TC-CALL-002 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `async_function` fixture |
| **步骤** | 1. 调用 `await _run_function(async_function, {"a": 1, "b": 2})` |
| **预期结果** | - 返回 `3`<br/>- `inspect.iscoroutinefunction` 返回 True<br/>- 使用 `await method(**params)` |

---

#### TC-CALL-003: 同步生成器函数返回生成器对象

| 字段 | 内容 |
|------|------|
| **ID** | TC-CALL-003 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | `generator_function` fixture |
| **步骤** | 1. 调用 `_run_function(generator_function, {"n": 3})`<br/>2. 检查返回类型 |
| **预期结果** | - 返回生成器对象（不消耗）<br/>- 消费生成器得到 `[0, 1, 2]` |

---

#### TC-CALL-004: 异步生成器函数直接返回

| 字段 | 内容 |
|------|------|
| **ID** | TC-CALL-004 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | `asyncgen_function` fixture |
| **步骤** | 1. 调用 `_run_function(asyncgen_function, {"n": 3})`<br/>2. 检查返回类型 |
| **预期结果** | - 返回异步生成器对象（不 await）<br/>- `inspect.isasyncgenfunction` 返回 True |

---

#### TC-CALL-005: 参数类型不匹配时抛出 TypeError

| 字段 | 内容 |
|------|------|
| **ID** | TC-CALL-005 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | — |
| **步骤** | 1. 调用 `_run_function(sync_function, {"a": "not_a_number", "b": 2})`<br/>2. 检查异常 |
| **预期结果** | - 抛出 Python `TypeError` 或 `BusinessException(ErrorCode.INVALID_PARAMS)`<br/>- 全局异常处理器转换为统一信封 |

---

### 2.5 Observer 沙箱

---

#### TC-SANDBOX-001: 沙箱启用时限制文件系统访问

| 字段 | 内容 |
|------|------|
| **ID** | TC-SANDBOX-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `observer.sandbox_enabled=true`，`fs_allowlist` 为空或仅包含白名单路径 |
| **步骤** | 1. 在沙箱 context 中尝试 `open("/etc/passwd", "r")`<br/>2. 检查是否被拒绝 |
| **预期结果** | - 沙箱拦截非白名单路径的文件访问<br/>- 抛出 `PermissionError` 或 Observer 自定义异常 |

---

#### TC-SANDBOX-002: 沙箱禁用时允许正常文件操作

| 字段 | 内容 |
|------|------|
| **ID** | TC-SANDBOX-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `observer.sandbox_enabled=false` |
| **步骤** | 1. 在沙箱 context 中尝试 `open("/tmp/test.txt", "w")` |
| **预期结果** | - 文件正常创建和写入<br/>- 不抛出沙箱相关异常 |

---

#### TC-SANDBOX-003: 白名单中的文件路径可正常访问

| 字段 | 内容 |
|------|------|
| **ID** | TC-SANDBOX-003 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | `fs_allowlist` 包含 `/tmp/allowed/` |
| **步骤** | 1. 在沙箱 context 中访问 `/tmp/allowed/test.txt` |
| **预期结果** | - 文件正常访问<br/>- 不被沙箱拦截 |

---

### 2.6 重入保护

---

#### TC-REENTRY-001: 调用深度在限制内正常执行

| 字段 | 内容 |
|------|------|
| **ID** | TC-REENTRY-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `observer.guard_enabled=true`，`guard_max_depth=10` |
| **步骤** | 1. 在深度 5 的调用链中执行 RPC 调用<br/>2. 检查是否被拒绝 |
| **预期结果** | - 深度 5 < 10，正常执行<br/>- `ReentrancyGuard` 计数器正确递增和递减 |

---

#### TC-REENTRY-002: 超过最大深度时拒绝执行

| 字段 | 内容 |
|------|------|
| **ID** | TC-REENTRY-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `guard_max_depth=3` |
| **步骤** | 1. 构造深度 4 的递归 RPC 调用<br/>2. 检查第 4 层调用 |
| **预期结果** | - 第 4 层调用被拒绝<br/>- 返回 `{code: 4002, message: "Reentrancy limit exceeded"}`<br/>- 前 3 层正常返回 |

---

#### TC-REENTRY-003: 重入保护禁用时无深度限制

| 字段 | 内容 |
|------|------|
| **ID** | TC-REENTRY-003 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | `observer.guard_enabled=false` |
| **步骤** | 1. 构造深度 20 的递归调用 |
| **预期结果** | - 不因深度被拒绝<br/>- 可能因 Python 递归限制或其他原因失败 |

---

### 2.7 脚本执行 — `run_script()`

---

#### TC-SCRIPT-001: subprocess 正常执行

| 字段 | 内容 |
|------|------|
| **ID** | TC-SCRIPT-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 测试脚本存在于文件系统 |
| **步骤** | 1. 调用 `run_script(script_path, timeout=30)`<br/>2. 检查返回结构 |
| **预期结果** | - 返回 `{stdout: "...", stderr: "...", return_code: 0}`<br/>- 子进程正常退出 |

---

#### TC-SCRIPT-002: subprocess 超时终止

| 字段 | 内容 |
|------|------|
| **ID** | TC-SCRIPT-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 测试脚本包含 `time.sleep(60)` |
| **步骤** | 1. 调用 `run_script(script_path, timeout=2)` |
| **预期结果** | - 子进程在 2s 后被 `kill()`<br/>- 抛出 `asyncio.TimeoutError` 或 `BusinessException`<br/>- 日志记录 "Script execution timed out after 2s" |

---

#### TC-SCRIPT-003: 脚本文件不存在

| 字段 | 内容 |
|------|------|
| **ID** | TC-SCRIPT-003 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | — |
| **步骤** | 1. 调用 `run_script("/nonexistent/script.sh", timeout=30)` |
| **预期结果** | - 抛出 `FileNotFoundError` 或 `BusinessException`<br/>- message 明确指示脚本路径不存在 |

---

<a id="sec-edge-cases"></a>
## 三、边界与异常测试

### TC-EDGE-001: 模块白名单配置为空列表

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-001 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 配置 `module_allowlist=[]`<br/>2. 发送 RPC 请求 |
| **预期结果** | - 所有请求被拒绝（白名单为空）<br/>- 返回 `{code: 4002}` |

### TC-EDGE-002: `asyncio.CancelledError` 不被吞掉

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 客户端断开连接<br/>2. 检查服务端是否取消协程 |
| **预期结果** | - `except Exception` 不捕获 `CancelledError`<br/>- 协程正确取消<br/>- Ollama 推理资源被释放 |

### TC-EDGE-003: concurrent RPC 调用不共享状态

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-003 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 同时发起 5 个不同 module 的 RPC 调用<br/>2. 检查各自的执行上下文 |
| **预期结果** | - 5 个请求独立执行<br/>- `importlib` 模块缓存无竞争<br/>- `ReentrancyGuard` 深度各自独立 |

### TC-EDGE-004: Observer 沙箱和重入保护同时启用

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-004 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 同时启用沙箱和重入保护<br/>2. 执行常规 RPC 调用 |
| **预期结果** | - 沙箱限制和重入保护同时生效<br/>- 两者不冲突<br/>- 性能开销在可接受范围内 |

### TC-EDGE-005: 脚本执行重定向检测 (SSRF)

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-005 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 创建脚本内含 `curl http://internal-service:8080/admin` 的脚本<br/>2. 执行脚本 |
| **预期结果** | - `asyncio.create_subprocess_exec` 不继承父进程环境<br/>- 沙箱限制脚本的网络请求<br/>- 或文档明确说明 subprocess 隔离级别 |

---

<a id="sec-regression"></a>
## 四、回归测试

### TC-REG-001: 已有 Service 通过沙箱调用仍正常

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 通过沙箱调用 `data_service.query_documents`<br/>2. 通过沙箱调用 `chat_service.chat` (mock Ollama)<br/>3. 通过沙箱调用 `knowledge_service.list_files` |
| **预期结果** | - 所有 Service 方法正常返回<br/>- 沙箱不改变方法行为 |

### TC-REG-002: importlib.reload 不影响生产环境

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 生产环境下不执行 `importlib.reload`<br/>2. `sys.modules` 缓存行为正常 |
| **预期结果** | - 方法签名变更在重启后才生效<br/>- 运行时无模块重载开销 |

---

<a id="sec-traceability"></a>
## 五、需求-测试追溯矩阵

| PRD FR | 模块 | 测试用例 | 覆盖层级 |
|--------|------|---------|---------|
| FR-参数解析 (dict/JSON) | executor.py | TC-EXEC-001~004 | L1 |
| FR-白名单校验 | executor.py | TC-WL-001~004 | L1 |
| FR-动态模块导入 | executor.py | TC-IMPORT-001~003 | L1+L2 |
| FR-四种函数类型分支 | executor.py | TC-CALL-001~005 | L1 |
| FR-Observer 沙箱 | executor.py + observer | TC-SANDBOX-001~003 | L2 |
| FR-重入保护 (ReentrancyGuard) | executor.py + observer | TC-REENTRY-001~003 | L2 |
| FR-脚本执行 (run_script) | executor.py | TC-SCRIPT-001~003 | L2 |
| FR-边缘场景 | executor.py | TC-EDGE-001~005 | L2 |
| — | — | TC-REG-001~002 (回归) | L2 |

---

<a id="sec-coverage"></a>
## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| Observer 沙箱库实际行为 | Observer 沙箱是外部依赖，需集成测试环境 | 在 CI 中配置 Observer 沙箱环境 |
| 真实 Docker 容器隔离 | 当前使用 subprocess，非 Docker | 如未来切到 Docker，补充容器隔离测试 |
| 脚本执行的资源限制 (cgroup) | subprocess 无法限制 CPU/内存 | 仅通过 timeout 控制，文档明确限制 |
| Agent 工具调用重入场景 | 需要完整的 Agent 循环 | 在 Agent 测试中补充 |
| 恶意 Python 代码注入 (eval/exec) | 白名单校验后未做 AST 分析 | 安全审计层面补充 |

---

<a id="sec-references"></a>
## 七、参考文档

| 资源 | 路径 |
|------|------|
| 源 PRD | [05-需求-模块执行沙箱.md](../../prds/2026-07/05-需求-模块执行沙箱.md) |
| 源 Dev Module | [05-prd-task-模块执行沙箱.md](../../devs/2026-07/05-prd-task-模块执行沙箱.md) |
| RPC 信封协议测试 | [03-prd-test-RPC信封协议.md](./03-prd-test-RPC信封协议.md) |
| Agent 可靠性测试 (九月) | [../2026-09/07-prd-test-Agent可靠性.md](../2026-09/07-prd-test-Agent可靠性.md) |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-07/05-需求-模块执行沙箱.md`*