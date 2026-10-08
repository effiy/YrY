---

doc_type: test
title: "YA-09-70: 服务端数据清除策略 — GDPR 合规的用户数据删除与匿名化处理 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-70"
source_prds: ["74-需求-GDPR数据清除"]
source_modules: ["74-prd-task-GDPR数据清除"]
source_okr: [yiai-001]

type: test
---

# YA-09-70: GDPR 数据清除 — 测试规格

> 来源 PRD：[74-需求-GDPR数据清除.md](../../prds/2026-09/74-需求-GDPR数据清除.md)

本文档定义 GDPR 数据清除策略的**验证方式**——覆盖用户数据硬删除、匿名化保留、级联删除关联数据、审计日志保留、不可恢复性验证。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无 | 每次提交 |
| L2 集成 | pytest + MongoDB | MongoDB 运行中 | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | 用户数据硬删除（物理删除） | L2 |
| COV-2 | 匿名化保留（替换 PII 为 hash） | L2 |
| COV-3 | 级联删除（关联 sessions/bugs/permissions） | L2 |
| COV-4 | 审计日志保留（不可删除） | L2 |
| COV-5 | 删除后不可恢复验证 | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `user_with_data` | 用户 + sessions + bugs + permissions | 级联删除 |
| `pii_fields` | `["username", "email", "phone"]` | PII 字段列表 |

---

## 二、测试用例

### 2.1 硬删除与级联（COV-1,3 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-GDPR-001 | 删除用户——users 文档物理删除 | 1. `delete_user(user_id)` | users 集合中无该文档 | P0 | 待实现 |
| TC-GDPR-002 | 级联删除 sessions | 1. 删除用户后检查 sessions | 该用户的所有 sessions 已删除 | P0 | 待实现 |
| TC-GDPR-003 | 级联删除 bugs（reporter） | 1. 删除用户后检查 bugs | 该用户作为 reporter 的 bugs 匿名化（reporter: "deleted_user_xxx"） | P0 | 待实现 |
| TC-GDPR-004 | 级联删除 permissions | 1. 删除用户后检查 permissions | 该用户的权限记录已删除 | P0 | 待实现 |
| TC-GDPR-005 | 聊天消息匿名化 | 1. 删除用户后检查 sessions.messages | 消息内容保留（用于对话连续性），发送者标记为 "anonymous" | P1 | 待实现 |

### 2.2 不可恢复性（COV-5 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-GDPR-006 | 硬删除后无法查询到用户 | 1. 删除用户；2. `find_one({_id: user_id})` | 返回 None | P0 | 待实现 |
| TC-GDPR-007 | 匿名化后 PII 字段为 hash | 1. 匿名化保留的 bugs 记录；2. 检查 reporter 字段 | reporter 为 hash 值（非原始 username） | P0 | 待实现 |
| TC-GDPR-008 | 软删除标记 + 定时清理 | 1. 标记 user.deleted=true；2. 30 天后自动清理 | 30 天后物理删除 | P2 | 待实现 |

### 2.3 审计保留（COV-4 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-GDPR-009 | 审计日志不可删除 | 1. 尝试删除审计日志中的删除操作记录 | 拒绝操作，审计日志受保护 | P0 | 待实现 |
| TC-GDPR-010 | 删除操作自身记录到审计日志 | 1. 执行删除；2. 检查 audit_logs | 含 `{action: "gdpr_delete", user_id, timestamp, admin_user}` | P0 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-GDPR-EDGE-001 | 删除不存在的用户 | 1. 删除 nonexistent user | 返回 "用户不存在"，非 500 | P1 | 待实现 |
| TC-GDPR-EDGE-002 | 用户有多条关联（1000+ 文档） | 1. 用户有大量关联数据；2. 删除 | 级联删除完成，不超时 | P2 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-GDPR-REG-001 | 缺陷 1：删除用户后其他用户数据不受影响 | 删除用户 A 后查询用户 B | 用户 B 数据完整 | P0 | 待实现 |
| TC-GDPR-REG-002 | 缺陷 2：删除操作事务性——中途失败全部回滚 | 级联删除中途失败 | 所有数据保持原状（事务回滚） | P0 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 物理删除 | users 文档删除 | TC-GDPR-001 |
| FR-02 级联删除 | sessions/bugs/permissions | TC-GDPR-002 ~ 005 |
| FR-03 不可恢复 | 查询不到 + PII 匿名化 | TC-GDPR-006 ~ 008 |
| FR-04 审计保留 | audit_logs 不可删 | TC-GDPR-009 ~ 010 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/74-需求-GDPR数据清除.md`*
