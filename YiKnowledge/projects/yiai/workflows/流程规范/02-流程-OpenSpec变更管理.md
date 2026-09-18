---
title: OpenSpec 变更管理流程
tags: [yiai, workflow, openspec, change, proposal, prd, verify, land]
category: projects/yiai/workflows
created: 2026-09-07
updated: 2026-09-15
source: internal
type: workflow
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer]
benefit: "YiAi 项目从需求到代码落地的完整 OpenSpec 变更管理流程"
---

# OpenSpec 变更管理流程

> **读完你将能够**：YiAi 项目从需求到代码落地的完整 OpenSpec 变更管理流程

> 从需求到代码落地的完整流程：PRD 提炼 → Proposal → 设计 → 实现 → 验证 → 落地。

## 一、变更生命周期

```
proposed → designing → applying → verifying → landed → archived
```

| 状态 | 含义 | 触发条件 | 产出物 |
|------|------|----------|--------|
| `proposed` | 提案已创建 | 执行 `/opsx:propose` | proposal.md |
| `designing` | 设计方案编写中 | 开始 design.md | proposal.md + design.md |
| `applying` | 按任务清单实现 | 执行 `/opsx:apply` | + tasks.md + 代码 |
| `verifying` | 验证一致性 | 执行 `/opsx:verify` | + 测试报告 |
| `landed` | 已落地 | 执行 `/opsx:land` | spec/tasks 已同步 |
| `archived` | 已归档 | 执行 `/opsx:archive` | 移至 archive/ |

**规则**：
- 状态单向推进，不可跳过
- `depends_on` 中的变更未达到期望状态时，当前变更不可推进
- 配置文件 `.openspec.yaml` 记录当前状态

## 二、PRD → Proposal（需求提炼）

### 第一层：结构化提取

将需求（PRD/Jira/口述）提炼为统一格式：

```markdown
## 需求摘要
### 业务背景
[一段话：为什么做，解决什么问题]

### 核心功能点
1. [功能]: [描述 + 模块类型（API/Service/RAG/Agent/数据）]

### 约束条件
- 复用现有 RPC 信封协议
- 兼容现有 MongoDB 数据模型
- 遵守跨项目 RPC 契约（filter 而非 query）

### 待确认项
- [ ] [待确认项] — 未解决前不进入 design 阶段
```

### 第二层：代码库碰撞

并行搜索四个维度：

| 搜索目标 | 关注点 | 输出 |
|---------|--------|------|
| 现有模块 | `services/`、`domain/` 中类似功能 | 影响范围 |
| API | 已有 RPC 方法/端点 | 依赖 + API 变更 |
| 数据模型 | MongoDB 集合/字段/Repository | 数据变更 |
| 规范 | `YiKnowledge/projects/yiai/` 已有规范 | 规范引用 |

### 第三层：组装 Proposal

```markdown
# Proposal: [需求名称]
## Why — [业务背景]
## What Changes
### API 变更 — [新增/修改/复用] module_name.method_name
### Service 变更 — [新增/修改/复用]
### 数据模型变更 — [MongoDB 集合/字段]
### Agent/Tool 变更 — [新增/修改]
## Dependencies — [依赖的模块/API/数据]
## Impact — [影响文件列表，是否影响前端]
```

### YiAi 特定约束

- API 调用必须通过 RPC 信封 `{module_name, method_name, parameters}`
- Service 层通过依赖注入获取 Repository
- 参数名遵守跨项目契约（`filter` 而非 `query`，`target_file` 而非 `path`）
- 跨项目影响评估：YiVad（`src/api/modules/`）、YiPet（`src/api/`）是否需同步

## 三、实现与验证

### 实现阶段（applying）

执行 `/opsx:apply`，按 tasks.md 顺序实现：
- 遵循 [领域服务模式](../设计模式/01-模式-领域服务模式.md)
- 遵循 [API 规范](../开发规范/02-规范-API规范.md)
- 遵循 [数据库规范](../开发规范/04-规范-数据库规范.md)

### 验证阶段（verifying）

执行 `/opsx:verify`，三类检查：

**完整性检查**：
- spec.md 所有场景有代码实现
- 代码所有新增功能在 spec 中有描述
- tasks.md 任务状态正确

**正确性检查**：
- 字段名 spec/代码一致
- API 参数名遵守 RPC 契约（`filter`/`target_file`/`cname`）
- RPC 信封格式正确
- Service 层方法签名与 Domain 层一致

**一致性检查**（YiAi 特定）：
- 新增 API 端点在 `services/` 中正确注册
- 响应格式 `{code, message, data}`
- MongoDB 操作通过 Repository
- ObjectId 已序列化
- JWT 中间件覆盖需认证端点
- 数据库查询有分页限制
- 新增外部调用有超时控制

## 四、落地（Land）

代码变更完成后执行 `/opsx:land`：

```
代码修改完成
  → 1. 回写 spec.md（新增行为→ADDED，删除行为→移除场景）
  → 2. 回写 tasks.md（标记 [x]，修正描述）
  → 3. 验证（完整性/正确性/一致性）
  → 4. ⏸️ 用户确认
  → 5. 提交推送
```

### 回写原则

| 变更类型 | 回写操作 |
|----------|----------|
| 移除字段/参数 | 从场景中删除 |
| 新增功能 | 添加 ADDED Requirements |
| 修改行为 | 更新 WHEN/THEN |
| 修改 API 契约 | 更新 RPC 方法签名和参数 |
| 修改数据模型 | 更新 MongoDB 集合/字段描述 |

**不回写的情况**：纯 Bug 修复（不改变行为定义）→ 只改代码。

## 五、异常处理

| 场景 | 处理 |
|------|------|
| 待确认项长时间未解决 | 标记为 blocked，提醒用户 |
| 实现超出 proposal 范围 | 回退到 `designing`，更新 design.md |
| 验证发现关键问题 | 回退到 `applying`，修复后重新验证 |
| 依赖变更失败 | 当前变更进入 blocked，等待或寻找替代 |
| 两个变更修改同一文件 | 提前协调顺序，后提交的解决冲突 |

## 六、配置格式

```yaml
# .openspec.yaml
schema: spec-driven
created: YYYY-MM-DD
status: <当前状态>
depends_on:
  - change: <change-name>
    status: landed
```

## 七、状态查询

```bash
# 单个变更状态
cat openspec/changes/<name>/.openspec.yaml

# 所有变更状态
for d in openspec/changes/*/; do
  echo "$(basename $d): $(grep 'status:' $d/.openspec.yaml)"
done
```