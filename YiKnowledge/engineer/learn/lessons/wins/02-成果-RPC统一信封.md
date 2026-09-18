---
title: "Win: RPC Unified Envelope — One Protocol, Three Projects"
tags: [win, rpc, architecture, cross-project, protocol]
category: engineer/learn/lessons/wins
created: 2026-09-15
updated: 2026-09-15
last_verified: 2026-09-15
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, leader]
benefit: "Understand why the unified RPC envelope was the single best architecture decision in YrY — and how to defend similar decisions in future projects"
acceptance_criteria:
  - "Problem before RPC envelope documented"
  - "Design decision and trade-offs explained"
  - "Quantified impact of the decision"
  - "Replicable pattern extracted"
related:
  - ../../build/cross-project-rpc-protocol.md
  - ../../build/implement-cross-project-rpc-call.md
  - ../gotchas/02-陷阱-RPC参数名不匹配.md
---

# 成功案例：RPC 统一信封 —— 一个协议，三个项目

> **决策时间：YiAi 项目初期。** RPC 统一信封（`{module_name, method_name, parameters}`）是 YrY 中回报率最高的架构决策——它让 YiVad 和 YiPet 以完全相同的方式与 YiAi 通信，避免了"每个前端各写一套 API 调用"的碎片化陷阱。

## 构建了什么

YiAi 只暴露一个核心端点——`POST /`——所有跨项目调用都通过同一个 JSON 信封路由：

```json
{
  "module_name": "services.database.data_service",
  "method_name": "query_documents",
  "parameters": { "cname": "projects", "filter": { "status": "active" }, "pageNum": 1, "pageSize": 20 }
}
```

YiAi 的根路由处理器通过 `importlib` 动态加载 `module_name` 指向的 Python 模块，调用 `method_name` 指向的方法，传入 `parameters`。

## 当时面临的问题

在 RPC 信封设计之前，YrY 面临三个典型的微服务通信挑战：

1. **端点爆炸**：每新增一个功能就要新增一个 HTTP 端点。YiVad 需要管理几十个不同的 URL、请求格式和错误处理逻辑。

2. **前后端参数名不一致**：前端开发者看到后端 Pydantic 模型定义，但字段名偶尔会不一致（如后端用 `target_file`，前端传 `path`）。没有集中的契约定义，不一致只能在运行时发现。

3. **YiPet 接入恐惧**：当 YiPet（Chrome 扩展）出现时，团队面临一个选择——是让 YiPet 复制 YiVad 的 API 调用逻辑，还是抽象出共享层？前者意味着维护两套 API 调用代码，后者意味着额外的抽象成本。

## 关键设计决策

### 决策 1：单一端点 vs 多端点

选择了 `POST /` + 动态路由，而非为每个服务创建独立端点。

**权衡**：
- ✓ 添加新功能不需要新端点——只需实现 Service 方法
- ✓ 前端调用模式统一——所有调用都是 `{module_name, method_name, parameters}`
- ✓ 错误处理、认证、日志集中在一个地方
- ✗ 牺牲了 RESTful 语义（GET/POST/PUT/DELETE + 资源路径）
- ✗ 所有请求都是 POST（不利于 HTTP 缓存）

**为什么选择是对的**：YrY 是内部管理工具而非公共 API，RESTful 语义的价值有限。统一性带来的维护成本降低远超过语义上的损失。

### 决策 2：动态 module_name vs 显式路由注册

选择了 `importlib` 动态导入，而非在 FastAPI 路由中逐一注册。

**权衡**：
- ✓ 添加新 Service 无需修改路由注册代码
- ✓ 前端和后端之间的耦合仅限于参数名，不涉及 URL 结构
- ✗ 模块路径字符串拼写错误在运行时才暴露（而非启动时）
- ✗ IDE 无法自动补全 `module_name`

### 决策 3：parameters 是自由字典 vs 强类型

选择了 `parameters: dict` 的自由字典。

**权衡**：
- ✓ 极致的灵活性——每个方法定义自己的参数形状
- ✗ 缺少编译期类型检查——参数名错误只能在运行时发现
- ✗ 这直接导致了"RPC 参数名不匹配"类 Bug

**事后评估**：这个设计是实用主义的选择——在项目早期，灵活性比类型安全更重要。但参数名不匹配的 Bug 确实成为了 YrY 最常见的 Bug 类型。如果重新设计，会考虑在 parameters 层面加入 JSON Schema 验证。

## 量化影响

| 维度 | 量化结果 |
|------|---------|
| 端点数量 | 1 个核心端点替代了 30+ 个 REST 端点 |
| 新功能接入成本 | 从前端各写一套 API 调用 + URL 约定，降为统一的 `{module_name, method_name, parameters}` 调用 |
| 代码复用 | YiPet 的 `ApiClient` 层几乎完全复用了 YiVad `RequestHttp` 的调用模式 |
| 常见 Bug 类型 | 参数名不匹配（`filter` vs `query`）占跨项目 Bug 的 80%+ |
| 维护成本 | 1 个路由处理器服务所有调用，中间件和认证集中在单一路径 |

## 可复用的模式——"动态模块路由"

当项目满足以下条件时，可以考虑类似的"单一端点 + 动态路由"模式：

| 条件 | YrY 的情况 |
|------|-----------|
| 多个前端消费同一后端 | YiVad + YiPet |
| 前端和后端由同一团队维护 | 是 |
| 不需要 HTTP 缓存（GET 语义） | 所有请求都是动态数据 |
| 功能迭代速度优先于 API 稳定性 | 项目早期阶段 |

**不适合的场景**：
- 公共 API（第三方开发者需要 RESTful 语义和文档）
- 需要 HTTP GET 缓存的只读查询
- 前后端由不同团队维护（需要更强的契约约束）

## 关键启示

1. **不要过早优化 API 设计**：在单体仓库、内部工具的场景下，"能用"优先于"规范"。RESTful 的正确性不值得用 30 个端点来交换。

2. **选择统一性而非灵活性**：1 种调用模式 > 2 种调用模式。YiVad 和 YiPet 使用完全相同的 RPC 信封格式，使 YiPet 的接入成本极低。

3. **参数名是分布式系统的隐性契约**：自由字典的灵活性带来了参数名不匹配的风险。这是 RPC 信封设计中最需要额外关注的弱点——通过文档（`cross-project-rpc-protocol.md`）和交叉验证来弥补。

4. **架构决策的价值随时间复利**：RPC 信封是 YiAi 项目初期的一个设计选择，但当 YiPet 出现时，它的价值翻倍了——因为无需在扩展中重新实现 API 调用逻辑。