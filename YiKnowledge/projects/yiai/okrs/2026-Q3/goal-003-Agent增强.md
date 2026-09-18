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
updated: 2026-09-14
kr1: "Agent 工具系统 — 12 个内置工具：文件读写/知识检索/代码执行/Web 搜索/数据查询/Bug 管理"
kr1_completion: 90
kr2: "MCP 协议服务 — FastMCP 工具代理 + Claude Code/Cursor 集成，标准工具发现与调用"
kr2_completion: 85
kr3: "上下文压缩服务 — 对话历史智能裁剪，压缩率 >80%，关键信息保留率 >95%"
kr3_completion: 80
kr4: "Agent 确认门 — 写操作 approve/reject 把关 + 操作审计，高风险操作不可自动执行"
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

> Q3 功能目标。将 Agent 从"聊天助手"升级为"开发助手"——能读写文件、检索知识库、执行代码、搜索 Web、通过 MCP 协议连接外部工具生态。**工具系统核心 + MCP 协议服务已交付，上下文压缩和确认门完善中。**

---

## 背景

2026-08 YiAi Agent 完成了基础循环框架：Think（LLM 推理）→ Act（工具调用）→ Observe（结果反馈）。但工具生态仅限于数据查询和知识检索——Agent 无法修改文件、无法运行代码、无法获取外部信息、无法与 Claude Code 等外部 Agent 互操作。

四个能力缺口：

**操作面窄**：Agent 只能读不能写。文件修改、Bug 创建、代码执行等写操作缺失——Agent 被限制为"信息检索器"。

**外部连接缺失**：Agent 的知识截止于训练数据 + YiKnowledge 知识库。对于实时信息（如最新库版本、API 文档）无能为力。

**协议孤岛**：YiAi Agent 是自闭环系统——Claude Code 无法调用 YiAi 的工具，YiAi Agent 也无法使用 Claude Code 的能力。工具无法跨 Agent 复用。

**长会话退化**：Agent 复杂任务（如跨文件重构）需要 20+ 轮对话，累积的上下文超出 LLM 窗口，Token 消耗线性增长，后续轮次推理质量下降。

Q3 分四个轨道扩展 Agent 能力：工具生态（自建 + MCP）、外部连接（Web 搜索）、协议标准化（MCP 服务端）、长会话管理（上下文压缩）。

---

## 设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 工具执行模式 | **子进程沙箱**（代码执行）+ 直接 API（文件/数据） | 代码执行需要隔离，其余操作通过现有 service 层 |
| MCP 协议角色 | **服务端**（提供工具）+ **客户端**（调用外部工具） | 双向——YiAi 既是工具提供者也是消费者 |
| 上下文压缩策略 | **摘要 + 关键轮次保留** | 纯摘要丢失细节，全保留超窗口，混合策略兼顾 |
| 确认门粒度 | **操作类型级**（delete 需确认，read 自动） | 不在每个参数上确认，避免用户疲劳 |

---

## 季度演进

### 八月 — 工具系统框架

完成了工具注册框架（`src/domain/ai/tools/__init__.py`）和 5 个基础工具。工具注册采用装饰器模式：

```python
@tool(name="read_file", description="Read file content", category="file")
async def read_file(path: str) -> str:
    ...
```

框架特性：自动 JSON Schema 生成（从函数签名 + docstring）、工具分类标签、超时控制、调用审计日志。

### 九月 — 工具扩展 + MCP + 压缩

**工具扩展**（KR1，90%）：5 → 12 个工具，覆盖 5 个类别：

| 类别 | 工具 | 数量 |
|------|------|------|
| 文件操作 | `read_file`、`write_file`、`list_directory` | 3 |
| 知识检索 | `search_knowledge`、`get_knowledge_file` | 2 |
| 代码执行 | `run_python`（子进程沙箱，timeout=30s） | 1 |
| Web 搜索 | `web_search`、`fetch_url` | 2 |
| 数据操作 | `query_data`、`create_document`、`update_document` | 3 |
| Bug 管理 | `create_bug` | 1 |

**MCP 协议服务**（KR2，85%）：`src/server/routes/mcp.py` 基于 FastMCP 实现。YiAi 的 12 个工具通过 MCP 协议暴露，Claude Code 和其他 MCP 客户端可通过标准 `tools/list` → `tools/call` 流程调用。

**上下文压缩**（KR3，80%）：`src/services/ai/compaction.py`。策略：
- 保留前 3 轮（任务设定）和后 3 轮（上下文延续）
- 中间轮次按 token 预算裁剪：系统消息保留 → 工具调用结果压缩为摘要 → 重复/冗余消息去重
- 压缩率 82%（12K tokens → 2.2K），关键信息保留率 96%

---

## 关键结果

| KR | 描述 | 完成度 |
|---|------|--------|
| KR1 | Agent 工具系统 — 12 个内置工具 | 90% |
| KR2 | MCP 协议服务 | 85% |
| KR3 | 上下文压缩服务 | 80% |
| KR4 | Agent 确认门 | 75% |

---

## KR1 — 工具系统

12 个工具，5 个类别。每个工具自描述（JSON Schema）、支持超时控制、调用记录审计日志。扩展新工具需 3 步：定义函数 → 加 `@tool` 装饰器 → 注册到类别。

剩余 10%（1 个工具）：`git_commit` 和 `git_diff` 的权限模型待确认——Agent 提交代码的风险收益比需评审。

---

## KR2 — MCP 协议服务

YiAi 通过 `src/server/routes/mcp.py` 暴露为标准 MCP 服务端。验证场景：Claude Code 通过配置 `{ "mcpServers": { "yiai": { "url": "http://localhost:10086/mcp" } } }` 直接调用 YiAi 的文件读写和知识检索工具。

剩余 15%：MCP 资源（Resource）和提示（Prompt）端点——当前仅工具（Tool）端点就绪。

---

## KR3 — 上下文压缩

`compaction.py` 实现双策略压缩。验证：20 轮 Agent 循环（~12K tokens）→ 压缩后 2.2K → LLM 调用减少 82% Token 消耗，任务完成率无显著下降（70% → 68%，在可接受范围）。

剩余 20%：自动触发阈值（当前手动调用）、Embedding 相似度去重（当前基于规则）、压缩质量评测基准。

---

## KR4 — Agent 确认门

写操作（`write_file`、`create_document`、`update_document`、`create_bug`）在执行前需用户 approve。实现为 SSE 事件 `{"type": "confirm", "tool": "write_file", "params": {...}}` → 前端渲染确认按钮 → 用户点击 approve/reject → Agent 继续/跳过。

剩余 25%：操作审计日志持久化（当前仅内存）、确认超时自动 reject（当前无限等待）。

---

## 影响

| 维度 | 修复前 | 修复后 |
|------|--------|--------|
| Agent 工具数 | 3（query/search/rag） | 12 |
| 支持的操作类型 | 仅读 | 读 + 写（有确认门） |
| 外部 Agent 互操作 | 无 | 通过 MCP 协议 |
| 长会话 Token 消耗 | 线性增长 | 压缩率 >80% |
| 新增工具成本 | 改 Agent 循环代码 | `@tool` 装饰器注册即可 |

---

## 未竟事项（Q4 延续）

| 事项 | Q4 归属 |
|------|---------|
| MCP 资源/提示端点 | yiai-q4-002（API 平台化） |
| 压缩自动触发 + 质量基准 | yiai-q4-003（多模态 AI） |
| Agent 确认审计持久化 | yiai-q4-004（安全合规） |
| Prompt 注入防御 | yiai-q4-004（安全合规） |