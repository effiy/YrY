---

doc_type: test
title: "Agent 工具系统 — 测试规格"
status: 待开始
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-15"
source_prds: ["13-需求-Agent工具系统"]
source_modules: ["13-prd-task-Agent工具系统"]
source_okr: [yiai-003]

type: test
---

# Agent 工具系统 — 测试规格

> 来源 PRD：[13-需求-Agent工具系统.md](../../prds/2026-08/13-需求-Agent工具系统.md)
> 开发方案：[13-prd-task-Agent工具系统.md](../../devs/2026-08/13-prd-task-Agent工具系统.md)
> 提取日期：2026-09-23

本文档定义**验证方式**——测什么、怎么测、通过标准是什么。覆盖 `ToolRegistry` 注册表、12 个内置工具、JSON Schema 参数校验、路径沙箱、确认门控、MCP 桥接、工具执行引擎。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无（mock 外部服务） | 每次提交 |
| L2 集成 | pytest + mongomock + tmp_path | MongoDB + 临时文件 | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | `ToolRegistry` 注册/启用/禁用/卸载 | L1 |
| COV-2 | `ToolRegistry.get_function_definitions()` OpenAI 格式 | L1 |
| COV-3 | `ToolRegistry.execute()` 执行引擎 | L2 |
| COV-4 | 12 个内置工具注册 | L1 |
| COV-5 | `_validate_arguments()` JSON Schema 参数校验 | L1 |
| COV-6 | `_is_path_safe()` 路径沙箱 | L1 |
| COV-7 | `requires_confirmation` 确认门控 | L1 |
| COV-8 | `ToolEvent` 可观测性事件发射 | L2 |
| COV-9 | 工具执行超时 + abort signal | L2 |
| COV-10 | MCP 桥接工具注册 | L1 |
| COV-11 | `_group_for()` 工具分组 | L1 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `registry` | 新的 `ToolRegistry` 实例 | 所有注册表测试 |
| `mock_web_search_tool` | `ToolDefinition(name="web_search", ..., execute=mock_coro)` | 搜索工具测试 |
| `mock_destructive_tool` | `ToolDefinition(name="bash", ..., requires_confirmation=True)` | 确认门控测试 |
| `valid_tool_call` | `ToolCall(id="call_1", name="web_search", arguments={query: "test"})` | 标准工具调用 |
| `invalid_tool_call` | `ToolCall(id="call_2", name="nonexistent", arguments={})` | 不存在工具 |
| `missing_arg_call` | `ToolCall(id="call_3", name="web_search", arguments={})` | 缺少必填参数 |
| `stub_execute` | `async def stub(*a, **kw): return {"result": "ok"}` | stub 执行函数 |

---

## 二、测试用例

### 2.1 ToolRegistry 注册表（COV-1 + COV-2 . L1）

> 自动化落点：`tests/unit/domain/test_tools.py`（已存在，需扩展）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-AGENT-001 | 注册工具成功 | 1. `registry.register(tool_def)` | `registry.get("web_search")` 返回该 tool_def | P0 | 待实现 |
| TC-AGENT-002 | 重复注册同名工具 → 覆盖 | 1. 注册 name="test" 的 tool A；2. 再注册 name="test" 的 tool B | `registry.get("test")` 返回 tool B（覆盖） | P0 | 待实现 |
| TC-AGENT-003 | 卸载工具 | 1. 注册 tool；2. `registry.unregister("test")`；3. `registry.get("test")` | 返回 None | P0 | 待实现 |
| TC-AGENT-004 | 禁用工具 | 1. 注册 tool；2. `registry.set_enabled("test", False)`；3. `registry.get_enabled()` | 禁用工具不在 `get_enabled()` 返回列表中 | P0 | 待实现 |
| TC-AGENT-005 | 启用工具 | 1. 禁用后重新启用；2. `registry.set_enabled("test", True)` | 工具回到 `get_enabled()` 列表 | P0 | 待实现 |
| TC-AGENT-006 | `get_function_definitions` 返回 OpenAI 格式 | 1. 注册 3 个工具；2. 调用 `get_function_definitions()` | 返回 `[{type: "function", function: {name, description, parameters}}]` | P0 | 待实现 |
| TC-AGENT-007 | `get_tool_catalog` 返回含 group 和 confirmation 的列表 | 1. 注册含 `requires_confirmation` 的工具；2. 调用 `get_tool_catalog()` | 每条包含 `{name, description, group, requires_confirmation}` | P1 | 待实现 |
| TC-AGENT-008 | 卸载不存在的工具 → 不抛异常 | 1. `registry.unregister("nonexistent")` | 不抛异常（静默忽略） | P1 | 待实现 |
| TC-AGENT-009 | `get("nonexistent")` 返回 None | 1. 查找不存在的工具 | 返回 None（不抛 KeyError） | P1 | 待实现 |

### 2.2 12 个内置工具注册（COV-4 + COV-11 . L1）

> 自动化落点：`tests/unit/domain/test_tools.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-AGENT-010 | 12 个内置工具全部注册 | 1. 调用 `_register_builtin_tools(registry)`；2. 调用 `get_enabled()` | 返回 12 个工具（web_search/web_fetch/rag_search/file_read/file_write/find/ls/bash/grep/edit/read/write） | P0 | 待实现 |
| TC-AGENT-011 | 工具分组正确 | 1. 注册内置工具；2. 检查 `_group_for("web_search")` 和 `_group_for("bash")` | `web_search` → `"knowledge"`, `bash` → `"coding"` | P0 | 待实现 |
| TC-AGENT-012 | 文件操作为 `requires_confirmation` | 1. 检查 `file_write`、`bash`、`edit` 的 `requires_confirmation` | 均为 `True` | P0 | 待实现 |
| TC-AGENT-013 | 只读工具不要求确认 | 1. 检查 `web_search`、`file_read`、`rag_search` 的 `requires_confirmation` | 均为 `False` | P0 | 待实现 |
| TC-AGENT-014 | MCP 桥接工具注册 | 1. 调用 `_register_mcp_tools(registry)` | MCP 工具注册到 registry（动态从 MCP server 获取） | P1 | 待实现 |
| TC-AGENT-015 | 每个内置工具含 JSON Schema parameters | 1. 检查每个工具的 `parameters` | 非空 dict，包含 `type: "object"` 和 `properties` | P1 | 待实现 |

### 2.3 参数校验（COV-5 . L1）

> 自动化落点：`tests/unit/domain/test_tools.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-AGENT-016 | 校验必填参数通过 | 1. tool 声明 `required: ["query"]`；2. `arguments = {query: "test"}`；3. 调用 `_validate_arguments(tool, arguments)` | 返回 `None`（无错误） | P0 | 待实现 |
| TC-AGENT-017 | 缺少必填参数 → 错误消息 | 1. tool 声明 `required: ["query"]`；2. `arguments = {}`；3. 校验 | 返回错误消息包含 `missing required argument 'query'` | P0 | 待实现 |
| TC-AGENT-018 | 参数类型不匹配 → 错误 | 1. tool 声明 `properties: {query: {type: "string"}}`；2. `arguments = {query: 123}` | 返回类型错误消息 | P1 | 待实现 |
| TC-AGENT-019 | 额外参数被忽略（不报错） | 1. `arguments = {query: "test", extra: "ignored"}`；2. 校验 | 仅校验 declared 参数，不因额外参数报错 | P1 | 待实现 |
| TC-AGENT-020 | 空必填列表 → 任何参数都通过 | 1. tool 没有 `required` 字段；2. 传入任意参数 | 校验通过 | P1 | 待实现 |

### 2.4 路径沙箱（COV-6 . L1）

> 自动化落点：`tests/unit/domain/test_tools.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-AGENT-021 | 白名单内路径 → 允许 | 1. `_is_path_safe("YiKnowledge/test.md", ["YiKnowledge"])` | 返回 True | P0 | 待实现 |
| TC-AGENT-022 | 白名单外路径 → 拒绝 | 1. `_is_path_safe("/etc/passwd", ["YiKnowledge"])` | 返回 False | P0 | 待实现 |
| TC-AGENT-023 | `../` 路径遍历 → 拒绝 | 1. `_is_path_safe("YiKnowledge/../../../etc/passwd", ["YiKnowledge"])` | 返回 False（`os.path.realpath` 解析后不在白名单） | P0 | 待实现 |
| TC-AGENT-024 | 绝对路径 → 拒绝 | 1. `_is_path_safe("/etc/hosts", ["YiKnowledge"])` | 返回 False | P0 | 待实现 |
| TC-AGENT-025 | 符号链接逃逸 → 拒绝 | 1. 创建符号链接指向白名单外路径；2. 校验 | `os.path.realpath` 解析到实际路径后拒绝 | P1 | 待实现 |
| TC-AGENT-026 | 多个白名单基目录 → OR 逻辑 | 1. `_is_path_safe("YiAi/src/main.py", ["YiKnowledge", "YiAi"])` | 返回 True（在 YiAi 白名单内） | P1 | 待实现 |

### 2.5 工具执行引擎（COV-3 + COV-8 + COV-9 . L2）

> 自动化落点：`tests/unit/domain/test_tools.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-AGENT-027 | 执行已注册工具 → 成功 | 1. 注册 `web_search`（stub 返回 `{results: [...]}`）；2. `registry.execute(valid_tool_call)` | 返回 `ToolResult(call_id="call_1", content=..., error=None, duration_ms>0)` | P0 | 待实现 |
| TC-AGENT-028 | 执行未注册工具 → 错误 | 1. `registry.execute(invalid_tool_call)` | 返回 `ToolResult(error="Tool 'nonexistent' not found")` | P0 | 待实现 |
| TC-AGENT-029 | 执行禁用工具 → 错误 | 1. 注册并禁用 tool；2. `registry.execute(call)` | 返回 `ToolResult(error="Tool 'xxx' is disabled")` | P1 | 待实现 |
| TC-AGENT-030 | 执行参数校验失败 → 错误 | 1. 注册 tool 声明 `required: ["query"]`；2. 传入空 `arguments` | 返回校验错误消息 | P0 | 待实现 |
| TC-AGENT-031 | 发射 ToolEvent（phase="start"/"end"） | 1. 注册 `on_event` callback；2. 执行工具 | `on_event` 被调用至少 2 次：`phase="start"` 和 `phase="end"` | P0 | 待实现 |
| TC-AGENT-032 | ToolEvent 记录 duration_ms | 1. 执行耗时 100ms 的工具；2. 检查 `end` 事件 | `duration_ms` 约 100（±20ms） | P1 | 待实现 |
| TC-AGENT-033 | 工具执行超时 → 取消 | 1. 注册耗时 5s 的工具；2. `execute(timeout=1.0)` | 返回 error（超时），工具被 `asyncio.wait_for` 取消 | P0 | 待实现 |
| TC-AGENT-034 | abort signal 中断执行 | 1. 注册耗时 10s 的工具；2. 在 0.5s 后触发 `abort_signal.set()` | 工具执行被中断，返回 error | P0 | 待实现 |
| TC-AGENT-035 | `on_progress` callback 被调用 | 1. 注册工具在执行中调用 `on_progress("working...")`；2. 注册 callback | `on_progress` callback 被调用 | P1 | 待实现 |

### 2.6 确认门控（COV-7 . L1）

> 自动化落点：`tests/unit/domain/test_tools.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-AGENT-036 | `requires_confirmation` 工具标记正确 | 1. 注册 `file_write`（requires_confirmation=True）；2. 检查 `tool.requires_confirmation` | `True` | P0 | 待实现 |
| TC-AGENT-037 | 只读工具 `requires_confirmation=False` | 1. 检查 `web_search`、`file_read` | `False` | P0 | 待实现 |
| TC-AGENT-038 | 确认门控不影响执行本身 | 1. 注册 `requires_confirmation=True` 的工具；2. 直接 `execute`（无确认等待） | 工具正常执行（确认门控由 Agent 循环在调用前检查） | P1 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-AGENT-EDGE-001 | 工具执行中抛出异常 → 包装为 ToolResult | 1. 注册工具 execute 抛出 `RuntimeError("boom")`；2. 执行 | 返回 `ToolResult(error="RuntimeError: boom")`，不抛异常 | P0 | 待实现 |
| TC-AGENT-EDGE-002 | 并发执行同一工具 | 1. 注册无副作用工具；2. 10 并发 `execute` | 全部成功，无竞态 | P1 | 待实现 |
| TC-AGENT-EDGE-003 | 空 `arguments: {}` → 满足无必填参数的工具 | 1. 注册 `list_collections`（required: []）；2. `arguments = {}` | 执行成功 | P1 | 待实现 |
| TC-AGENT-EDGE-004 | ToolCall 的 `id` 为 LLM 生成的随机字符串 | 1. 使用 `id: "call_abc123xyz"` | 正常处理，不因 id 格式问题失败 | P1 | 待实现 |
| TC-AGENT-EDGE-005 | 工具注册后立即执行（无预热） | 1. `register` → 立即 `execute` | 正常执行 | P1 | 待实现 |
| TC-AGENT-EDGE-006 | 递归 tool_call（工具调用自身） | 1. 工具 A 的 execute 函数调用 `registry.execute(A's call)` | 取决于实现：要么支持递归，要么检测并拒绝 | P2 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 当前预期 | 优先级 | 状态 |
|------|---------|------|---------|--------|------|
| TC-AGENT-REG-001 | 缺陷 1（YA-08-15）：工具分组中 db_create 被移除 | `_group_for("db_create")` | 返回 `"general"`（默认） | P1 | 待实现 |
| TC-AGENT-REG-002 | 缺陷 2（YA-08-15）：todo_write 分组变更 | `_group_for("todo_write")` | 返回 `"general"`（已从 planning 移除） | P1 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 ToolRegistry 注册表 | 注册/禁用/卸载/查询 | TC-AGENT-001 ~ 009 |
| FR-02 12 个内置工具 | 全部注册 + 分组正确 | TC-AGENT-010 ~ 015 |
| FR-03 JSON Schema 参数校验 | 必填/类型检查 | TC-AGENT-016 ~ 020 |
| FR-04 路径沙箱 | 白名单 + 遍历防护 | TC-AGENT-021 ~ 026 |
| FR-05 工具执行引擎 | 超时/中断/事件 | TC-AGENT-027 ~ 035 |
| FR-06 确认门控 | requires_confirmation 标志 | TC-AGENT-036 ~ 038 |
| FR-07 ToolEvent 可观测性 | phase/label/duration 记录 | TC-AGENT-031 ~ 032 |
| FR-08 MCP 桥接 | MCP 工具注册 | TC-AGENT-014 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | 真实 Agent 循环中工具调用流程 | 工具注册表只是组件，完整 Agent 循环验证未覆盖 | 补充 Agent 集成测试（stub LLM + registry） |
| G-2 | 工具执行的具体实现（web_search → DuckDuckGo 等） | 测试仅覆盖注册表层面，具体工具实现由其他模块测试覆盖 | 交叉引用 10-prd-test-Web搜索 和 05-prd-test-文件管理 |
| G-3 | 高并发下 `asyncio.wait_for` 的行为 | 大量工具并发调用时超时机制可能不同 | pytest-benchmark 压测 |
| G-4 | MCP 桥接工具的动态更新 | MCP server 的工具列表变化时 registry 同步 | 监听 MCP tool list change event |