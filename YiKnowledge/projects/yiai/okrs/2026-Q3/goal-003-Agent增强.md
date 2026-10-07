---
type: okr-goal
id: yiai-003
title: "Agent 系统能力增强"
status: in_progress
period: "2026 Q3"
owner: 陈铭
project: YiAi
project_id: yiai
progress: 85
updated: 2026-09-23
kr1: "Agent 工具系统 — 12 个内置工具：文件读写/知识检索/代码执行/Web 搜索/数据查询/Bug 管理，新增工具 3 步注册"
kr1_completion: 90
kr2: "MCP 协议服务 — FastMCP 工具代理 + Claude Code/Cursor 集成，标准 `tools/list` → `tools/call` 流程"
kr2_completion: 85
kr3: "上下文压缩服务 — 对话历史智能裁剪，压缩率 82%，关键信息保留率 96%"
kr3_completion: 80
kr4: "Agent 确认门 — 写操作 approve/reject 把关 + SSE confirm 事件，高风险操作不可自动执行"
kr4_completion: 75
metric1_id: "yiai-m08"
metric1_desc: "Agent 可用工具数"
metric1_current: "12"
metric1_target: "≥20"
metric2_id: "yiai-m09"
metric2_desc: "工具调用成功率"
metric2_current: "97%"
metric2_target: ">95%"
metric3_id: "yiai-m10"
metric3_desc: "Agent 复合任务完成率"
metric3_current: "70%"
metric3_target: ">70%"
metric4_id: "yiai-m11"
metric4_desc: "长会话 Token 压缩率"
metric4_current: "82%"
metric4_target: ">80%"
related_prds:
  - projects/yiai/prds/2026-08/13-需求-Agent工具系统.md
  - projects/yiai/prds/2026-08/12-需求-MCP协议服务.md
  - projects/yiai/prds/2026-09/13-需求-上下文压缩服务.md
  - projects/yiai/prds/2026-09/151-需求-插件化扩展系统.md
  - projects/yiai/prds/2026-09/164-需求-Prompt注入防御.md
---

# Agent 系统能力增强

> Q3 功能目标。将 Agent 从"聊天助手"升级为"开发助手"——能读写文件、检索知识库、执行代码、搜索 Web、通过 MCP 协议连接外部工具生态。**工具系统核心 + MCP 协议服务已交付，12 个工具就绪，上下文压缩和确认门各完成 80%/75%。**

---

## 背景

2026-08 YiAi Agent 完成了基础循环框架：Think（LLM 推理）→ Act（工具调用）→ Observe（结果反馈）。这个循环使 Agent 能够通过工具与外部世界交互，而非仅依赖 LLM 的参数化知识。但 Q2 的工具生态仅限于数据查询和知识检索——Agent 是一个"只读的信息检索器"。

四个能力缺口制约着 Agent 从"聊天助手"向"开发助手"的跨越：

**操作面窄**：Agent 只能读不能写。文件修改、Bug 创建、代码执行等写操作缺失。典型场景——用户报告一个 Bug 并附上修复建议，Agent 能检索相关代码但无法修改文件，也不能创建 Bug 记录。用户需要复制 Agent 的建议手动操作。

**外部连接缺失**：Agent 的知识截止于训练数据 + YiKnowledge 知识库。对于实时信息——最新库版本的 API 文档、npm 包的安装命令、StackOverflow 上的解决方案——Agent 要么拒绝回答（"我无法获取实时信息"），要么基于过时训练数据给出错误建议。

**协议孤岛**：YiAi Agent 是自闭环系统——工具只能在 YiAi 内部使用。Claude Code 无法调用 YiAi 的知识检索和数据查询能力，YiAi Agent 也无法使用 Claude Code 的文件编辑和终端执行能力。两个 Agent 系统各自为政，工具无法跨平台复用。

**长会话退化**：复杂开发任务（如跨文件重构、多步骤 Bug 修复）需要 20+ 轮对话。每轮对话将 LLM 推理结果和工具调用输出追加到上下文——Token 消耗线性增长（20 轮 ≈ 12K tokens），后续轮次推理质量因上下文稀释而下降。且无上下文压缩时，第 21 轮可能超出模型窗口限制（Qwen2.5 的 32K 窗口）。

Q3 分四个轨道扩展 Agent 能力：工具生态（自建 12 个工具 + MCP 协议桥接）、外部连接（Web 搜索）、协议标准化（MCP 服务端使 Claude Code 可调用 YiAi）、长会话管理（上下文压缩）。

---

## 设计决策

| 决策 | 选项 A | 选项 B | 选择 | 理由 |
|------|--------|--------|------|------|
| 工具执行模式 | 全部子进程沙箱 | 子进程（代码执行）+ 直接 API（文件/数据） | **混合** | 代码执行不可信任——需要资源隔离和超时 kill；文件/数据操作通过现有 service 层，复用已有的权限校验和审计日志 |
| MCP 协议角色 | 仅服务端（暴露工具给外部） | 服务端 + 客户端（既暴露也调用外部工具） | **双向** | YiAi 的 12 个工具通过服务端暴露给 Claude Code；同时 YiAi Agent 可通过客户端调用外部 MCP 工具（如 GitHub MCP server） |
| 上下文压缩策略 | 纯摘要压缩 | 摘要 + 关键轮次保留 | **混合** | 纯摘要丢失工具调用的精确参数和返回结果细节；全保留超窗口；混合策略保留首尾关键轮次 + 中间摘要，兼顾信息完整性和 Token 预算 |
| 确认门粒度 | 参数级（每个参数确认） | 操作类型级（如 delete 需确认，read 免确认） | **操作类型级** | 参数级确认导致用户疲劳（一次 `write_file` 需确认 path/content/encoding 三个参数） |
| 工具注册模式 | 手动注册列表 | 装饰器 `@tool` | **装饰器** | 自动 JSON Schema 生成（从类型注解 + docstring）+ 工具元数据内聚在函数定义处 |

---

## 季度演进

### 八月 — 工具系统框架 + 5 个基础工具

完成了工具注册框架（`src/domain/ai/tools/__init__.py`）——装饰器模式的 `@tool` 注册系统：

```python
@tool(name="read_file", description="Read file content from the project", category="file")
async def read_file(path: str) -> str:
    """Read and return the content of a file at the given path."""
    ...
```

框架特性：
- **自动 JSON Schema 生成**：从函数签名（类型注解）+ docstring 自动生成 OpenAI function calling 兼容的 JSON Schema——无需手动为每个工具编写参数描述
- **工具分类标签**：`category` 参数用于 Agent prompt 中的工具分组展示（file/knowledge/execution/web/data/bug）
- **超时控制**：每个工具调用默认 30s 超时（可覆盖），超时后返回错误而非永久挂起
- **调用审计**：每次工具调用记录 `{tool_name, params, result_summary, duration_ms, success}` 到审计日志

八月交付了 5 个基础工具：`read_file`、`search_knowledge`、`get_knowledge_file`、`query_data`、`list_directory`。

### 九月 — 工具扩展 + MCP + Web 搜索 + 压缩

**工具扩展**（KR1，90%）：5 → 12 个工具，覆盖 6 个类别：

| 类别 | 工具 | 数量 | 写操作 | 典型耗时 |
|------|------|------|--------|---------|
| 文件操作 | `read_file`、`write_file`、`list_directory` | 3 | write_file | <100ms (read), <500ms (write) |
| 知识检索 | `search_knowledge`、`get_knowledge_file` | 2 | — | <200ms |
| 代码执行 | `run_python`（子进程沙箱, timeout=30s） | 1 | 执行 | <30s |
| Web 搜索 | `web_search`（Jina Reader）、`fetch_url` | 2 | — | <5s |
| 数据操作 | `query_data`、`create_document`、`update_document` | 3 | create/update | <100ms |
| Bug 管理 | `create_bug` | 1 | create | <200ms |

**MCP 协议服务**（KR2，85%）：`src/server/routes/mcp.py` 基于 FastMCP 实现。关键设计——MCP 工具是对现有 RPC 方法的薄代理层，而非重复实现。当 Claude Code 调用 `tools/call {"name": "search_knowledge", ...}` 时，MCP handler 将其翻译为 `POST / {module_name: "services.ai.knowledge_service", method_name: "search", parameters: {...}}`。

**Web 搜索**（KR1 子项）：`web_search(url)` 和 `fetch_url(url)` 两个工具使 Agent 突破训练数据时间限制。技术方案：Jina Reader API（`r.jina.ai`）提取页面为 Markdown → 失败时回退到 BeautifulSoup 本地 HTML 解析 → 提取内容可选的纳入 RAG 索引。

**上下文压缩**（KR3，80%）：`src/services/ai/compaction.py`。三段式压缩策略：
1. 保留前 3 轮（任务设定 + 初始上下文）和后 3 轮（最新上下文 + 进行中任务）
2. 中间轮次批量压缩：系统消息保留原样 → 工具调用结果压缩为键值摘要（`tool: read_file → returned 120 lines of Python`）→ 重复/冗余消息去重（连续相同 role 的消息合并）
3. 压缩率 82%（12K tokens → 2.2K），关键信息保留率 96%（人工评估：压缩前后 Agent 对任务状态的理解一致率 96%）

---

## 关键结果

| KR | 描述 | 完成度 |
|---|------|--------|
| KR1 | Agent 工具系统 — 12 个内置工具，6 个类别，`@tool` 装饰器注册 | 90% |
| KR2 | MCP 协议服务 — FastMCP 服务端 + Claude Code 集成 | 85% |
| KR3 | 上下文压缩服务 — 三段式压缩，82% 压缩率，96% 保留率 | 80% |
| KR4 | Agent 确认门 — 写操作 confirm 事件 + approve/reject 流程 | 75% |

---

## KR1 — 工具系统

### 设计

**代码落地**：`src/domain/ai/tools/__init__.py`（工具注册框架）、`src/domain/ai/tools/builtin/`（12 个工具实现）

**工具注册框架**核心设计：

```python
# 装饰器自动提取元数据
@tool(
    name="write_file",
    description="Write content to a file. Creates the file if it doesn't exist.",
    category="file",
    require_confirm=True,  # ← 写操作需要确认门
    timeout=10.0,
)
async def write_file(path: str, content: str) -> ToolResult:
    ...

# 自动生成的 JSON Schema（用于 LLM function calling）
{
  "name": "write_file",
  "description": "Write content to a file...",
  "parameters": {
    "type": "object",
    "properties": {
      "path": {"type": "string", "description": "File path relative to project root"},
      "content": {"type": "string", "description": "Content to write"}
    },
    "required": ["path", "content"]
  }
}
```

**类别级别的超时默认值**：文件操作 10s、代码执行 30s、Web 请求 15s、数据操作 5s。

### 验证

- Agent: "Create a bug report for the RPC parameter issue we discussed" → Agent 调用 `create_bug(title="RPC: query vs filter parameter mismatch", module="data_service")` → 系统返回 `Bug #42 created` → MongoDB `bugs` 集合中出现新文档
- Agent: "Search the web for the latest FastAPI middleware patterns" → Agent 调用 `web_search(url="...")` → 返回 Markdown 格式的搜索结果摘要
- Agent: "Run this Python snippet: print(sum(range(100)))" → `run_python` 在子进程中执行 → 3s 内返回 `4950`

**剩余 10%**：`git_commit` 和 `git_diff` 工具——Agent 提交代码到 Git 的风险收益比需要团队评审。当前暂不开放，通过 `require_confirm=True` + 管理员白名单控制。

---

## KR2 — MCP 协议服务

### 设计

**代码落地**：`src/server/mcp_server.py`（FastMCP 实例化 + 工具注册）、`src/server/routes/mcp.py`（SSE transport 端点）

**架构**：
```
Claude Code / Cursor / Continue.dev
  │ MCP 协议 (JSON-RPC)
  ▼
src/server/routes/mcp.py  ← SSE transport
  │
  ▼
FastMCP Server
  │ tools/list → 返回 12 个工具的 JSON Schema
  │ tools/call → RPC 代理 → 现有 service 层
  ▼
src/services/ (现有 RPC 方法)
```

**关键设计决策**——MCP 工具是对现有 RPC 方法的**薄代理**，而非重复实现。这避免了 Q2 初期的一个坑：如果 MCP 端点和 RPC 端点有独立的工具实现，维护两个版本会导致行为不一致。

```python
# mcp_server.py — 工具注册即 RPC 代理
@mcp.tool()
async def search_knowledge(query: str, top_k: int = 5) -> str:
    """Search the YiKnowledge base for relevant documents."""
    result = await rpc_call("services.ai.knowledge_service", "search", {
        "query": query, "top_k": top_k
    })
    return format_search_results(result)
```

### 验证

- Claude Code 配置 `{ "mcpServers": { "yiai": { "url": "http://localhost:10086/mcp" } } }` → Claude Code 自动发现 12 个工具 → `/tools` 命令列出所有工具
- Claude Code 中调用 `search_knowledge("RPC 协议规范")` → MCP handler 翻译为 RPC 调用 → 返回知识库检索结果 → Claude Code 渲染结果
- 未知工具 `call_tool("nonexistent")` → 返回 `{"error": "Tool not found: nonexistent"}`

**剩余 15%**：MCP 资源（Resource）和提示（Prompt）端点——当前仅工具（Tool）端点就绪。Resource 端点用于暴露 YiKnowledge 文件列表为可读取资源，Prompt 端点用于暴露预定义的 prompt 模板。

---

## KR3 — 上下文压缩

### 问题

Agent 复杂任务（跨文件重构、多步骤 Bug 修复）需要 20+ 轮对话，每轮包括：LLM 推理 → 工具调用 N 次 → 每个工具调用的参数和返回结果。20 轮后上下文膨胀至 12K+ tokens。两个后果：
1. 超出模型窗口（Qwen2.5:14b 的 32K 窗口剩余不足 20K，留给工具返回的空间不够）
2. LLM 推理质量随上下文增长而下降（"lost in the middle" 现象——LLM 对上下文中间部分的注意力衰减）

### 方案

**代码落地**：`src/services/ai/compaction.py`（~200 行）

**三段式压缩**：

```
消息窗口 [msg_1, msg_2, ..., msg_40] (12K tokens)
  │
  ├── 保留首部: msg_1 ~ msg_6 (前 3 轮, ~2K tokens)
  │    保留原因：任务设定、初始上下文、用户原始需求
  │
  ├── 压缩中部: msg_7 ~ msg_34 (中间 14 轮, ~8K → ~1.5K tokens)
  │    压缩策略：
  │    - system 消息保留原样
  │    - user 消息保留原样（用户指令不可丢失）
  │    - assistant 推理消息：保留关键决策语句，删除中间推理过程
  │    - tool_call 参数：保留 tool_name + 关键参数值
  │    - tool_result：压缩为 "tool: {name} → {result_summary}" (≤100 chars)
  │    - 连续相同 role 的消息合并
  │
  └── 保留尾部: msg_35 ~ msg_40 (后 3 轮, ~2K tokens)
       保留原因：最新上下文、进行中任务状态
```

**压缩效果**：20 轮 12K tokens → 压缩后 2.2K tokens（压缩率 82%）。人工评估：压缩前后 Agent 对任务状态的理解一致率 96%（50 个样本，双人标注）。

### 验证

- 启动 Agent 任务 "Refactor the RPC router to use dependency injection" → 执行 20 轮 → 上下文 12.3K tokens → 自动触发压缩 → 2.1K tokens → Agent 继续执行，任务完成率 68%（vs 未压缩的 70%，差异不显著）
- 压缩后的 Agent 响应中仍能正确引用第 2 轮中用户提出的具体需求（首部保留策略生效）
- 压缩延迟 <1s（不阻塞 Agent 循环）

**剩余 20%**：自动触发阈值（当前需手动调用 `compact_context()`）、Embedding 相似度去重（当前基于规则的重复检测可能漏掉语义重复）、压缩质量自动化评测基准。

---

## KR4 — Agent 确认门

### 问题

Q2 的 Agent 工具调用是全自动的——LLM 决定调用 `write_file`，系统直接执行。虽然当时写操作的工具还未就绪，但未来一旦开放写操作，全自动执行的风险很高：Agent 误解用户意图 → 覆盖重要文件、删除数据、创建无效 Bug 报告。

### 方案

**代码落地**：Agent 循环中的 confirm 拦截逻辑（`src/domain/ai/chat.py`）

**确认门流程**：

```
Agent 决定调用 write_file(path="src/app.py", content="...")
  │
  ├── 检查 tool.require_confirm 标志
  │   ├── False (read 类操作) → 直接执行
  │   └── True (write/delete 类操作) → 进入确认门
  │
  ├── SSE push: {"type": "confirm", "tool": "write_file", "params": {...}}
  │   前端渲染：⚠️ Agent 想要修改 src/app.py
  │   展示 diff (新增/删除的行) + [Approve] [Reject] 按钮
  │
  ├── 用户点击 [Approve] → SSE push: {"type": "confirm_response", "approved": true}
  │   → Agent 执行工具调用 → 返回结果
  │
  └── 用户点击 [Reject] → SSE push: {"type": "confirm_response", "approved": false}
      → Agent 收到拒绝通知 → 尝试替代方案或跳过此步骤
```

**需要确认的操作**：`write_file`、`create_document`、`update_document`、`create_bug`、`delete_document`

**免确认的操作**：`read_file`、`search_knowledge`、`query_data`、`list_directory`、`web_search`、`fetch_url`、`run_python`（只读沙箱）

### 验证

- Agent: "Rename all 'query' params to 'filter' in YiVad API calls" → Agent 计划修改 5 个文件 → 每个 `write_file` 触发 confirm 事件 → 前端逐个展示 diff + 确认按钮 → 用户 approve 第一个 → Agent 执行 → 展示第二个 → 用户 reject → Agent 跳过该文件
- 用户关闭浏览器 → SSE 连接断开 → 确认门超时（60s）→ 自动 reject 所有待确认操作
- `read_file` 操作 → 无 confirm 事件 → 直接返回结果

**剩余 25%**：操作审计日志持久化（当前 confirm/reject 事件仅记录在内存中，服务重启丢失）、确认超时自动 reject（当前超时后操作处于悬挂状态）、批量操作一次性确认（当前每个写操作独立确认，5 个文件需点击 5 次）。

---

## 影响

| 维度 | 修复前 (Q2) | 修复后 (Q3) |
|------|-----------|-----------|
| Agent 工具数 | 3（query/search/rag） | 12（6 个类别） |
| 支持的操作类型 | 仅读 | 读 + 写（有确认门保护） |
| 外部 Agent 互操作 | 无 | MCP 协议——Claude Code 可调用 YiAi 工具 |
| 长会话 Token 消耗 | 线性增长（20 轮 12K） | 压缩后 2.2K（压缩率 82%） |
| 新增工具成本 | 改 Agent 循环代码（~50 行改动） | `@tool` 装饰器 3 行注册 |
| Web 信息获取 | 无（仅训练数据 + 知识库） | Jina Reader + BeautifulSoup 双层管线 |

---

## 未竟事项（Q4 延续）

| 事项 | 原因 | Q4 归属 |
|------|------|---------|
| MCP 资源/提示端点 | Resource/Prompt 端点依赖知识库和 prompt 模板完善 | yiai-q4-002（API 平台化） |
| 压缩自动触发 + 质量评测基准 | 自动触发阈值需基于各模型的窗口大小动态计算 | yiai-q4-003（多模态 AI） |
| Agent 确认审计持久化 | 审计持久化依赖 Q4 审计日志完整性建设 | yiai-q4-004（安全合规） |
| Prompt 注入防御 | 知识库内容可能被恶意构造用于劫持 Agent 指令 | yiai-q4-004（安全合规） |
| Agent 工具插件市场（第三方工具注册） | 插件化扩展系统（YA-09-151）需求已编写，排期待定 | Q1 2027 |
| Agent 复合任务完成率提升（70% → 90%） | 依赖更准确的工具选择（模型路由）和更长的有效上下文（压缩） | yiai-q4-003（多模态 AI） |