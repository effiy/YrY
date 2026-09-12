---
title: PRD 到 Proposal 流程
tags: [yiai, workflow, prd, proposal, openspec]
category: projects/yiai/workflows
created: 2026-09-07
updated: 2026-09-10
source: YiAi
type: workflow
status: active
---

# PRD 到 Proposal 流程

> 从需求到 Proposal 的结构化提炼流程，减少理解偏差，加速代码库碰撞。
>
> 本流程定义如何将产品需求（PRD、Jira、口述）转化为可执行的开发提案（Proposal）。

## 流程

```
需求输入（PRD/Jira/口述）
  │
  ▼  第一层：结构化提取 → 用户确认
提炼后的需求摘要
  │
  ▼  第二层：代码库碰撞（并行子代理）
影响分析 + 现有能力匹配
  │
  ▼  第三层：组装 Proposal
proposal.md
```

## 第一层：需求结构化提取

不管需求来源，先提炼为以下统一格式：

```markdown
## 需求摘要

### 业务背景
[一段话：为什么做这件事，解决了什么问题]

### 核心功能点
1. [功能1]: [简要描述 + 模块类型标注（API/Service/RAG/Agent/数据）]
2. [功能2]: [简要描述]
...

### 约束条件
- [约束1: 如"复用现有 RPC 信封协议"]
- [约束2: 如"需兼容现有 MongoDB 数据模型"]
- [约束3: 如"遵守跨项目 RPC 契约（filter 而非 query）"]
...

### 待确认项
- [ ] [待确认1: 如"接口字段兼容需后端确认"]
- [ ] [待确认2: 如"性能指标待确认"]
...
```

**确认卡点**：提炼完成后暂停，让用户确认/补充后再进入第二层。
**待确认项未全部解决前，不进入 design 阶段。**

## 第二层：代码库碰撞

并行启动子代理搜索四个维度：

| 子代理 | 搜索目标 | 输出到 Proposal 的哪部分 |
|--------|----------|--------------------------|
| 搜现有模块 | `services/` 中是否已有类似功能/模块 | 影响范围 |
| 搜 API | 是否已有可复用 RPC 方法/端点 | 依赖 + API 变更 |
| 搜数据模型 | 已有 MongoDB 集合/字段/Repository | 依赖 + 数据变更 |
| 搜 spec | `YiKnowledge/projects/yiai/specs/` 中的已有规范 | 规范引用 |

### 搜索清单

- **Service 模块**：`services/` 中是否有类似领域服务
- **Domain 层**：`domain/` 中是否有相关业务逻辑
- **Repository**：`data/repositories/` 中是否有可复用查询
- **数据模型**：`data/models/` 中是否有相关集合定义
- **RAG 引擎**：`rag/` 中是否有可复用的检索/索引逻辑
- **Agent 循环**：`agent/` 中是否有可复用的工具/循环模式
- **规范**：`YiKnowledge/projects/yiai/specs/` 中相关规范

## 第三层：组装 Proposal

将前两层输出组装为标准 Proposal 格式：

```markdown
# Proposal: [需求名称]

## Why
[业务背景：为什么做这件事]

## What Changes
[核心变更列表]

### API 变更
- [RPC 方法]: [新增/修改/复用]（module_name.method_name）

### Service 变更
- [Service]: [新增/修改/复用]

### 数据模型变更
- [MongoDB 集合/字段]: [新增/修改]

### Agent/Tool 变更
- [Tool]: [新增/修改]

## Capabilities
[新增或修改的能力]

## Dependencies
[依赖的现有模块、API、数据模型]

## Impact
[影响范围：哪些文件需要修改，是否影响前端调用方]
```

## 使用方式

在 Claude Code 中：

```
你: 从这份需求生成 Proposal [粘贴/描述需求]
我:
  1. 做需求结构化提取，输出给你确认
  2. 你确认后，并行搜索代码库
  3. 组装 proposal.md
  4. 你审阅
```

## YiAi 特定注意事项

### 模块类型与规范映射

| 模块类型 | 遵循规范 | 核心模式 |
|----------|----------|----------|
| API 端点 | `specs/api-conventions.md` | RPC 信封 + APIRouter |
| 认证授权 | `specs/auth-conventions.md` | JWT + bcrypt + 中间件 |
| 数据持久化 | `specs/database-conventions.md` | Repository + Motor |
| 业务逻辑 | `specs/domain-service.md` | Domain Service 分层 |
| RAG 检索 | `specs/module-structure.md` | 混合检索 + llama_index |

### 强制约束检查

- API 调用必须通过 RPC 信封（`{module_name, method_name, parameters}`）
- Service 层通过依赖注入获取 Repository
- MongoDB 操作通过 Motor 异步驱动
- 参数名遵守跨项目 RPC 契约（`filter` 而非 `query`，`target_file` 而非 `path`）
- 响应格式保持 `{code, message, data}` 结构
- JWT 认证中间件覆盖所有需认证的端点

### 跨项目影响评估

当变更涉及 API 契约修改时，Proposal 必须评估：

- [ ] YiVad 前端是否需要同步更新（`src/api/modules/`）
- [ ] YiPet 扩展是否需要同步更新（`src/api/`）
- [ ] 参数名变更是否影响现有调用方（向后兼容性）

## 与需求状态的关系

- 需求提取完成后，状态设为 `proposed`
- 待确认项全部解决后才推进到 `designing`
- Proposal 完成后进入 `implementing`
- 实现完成并验证后进入 `done`