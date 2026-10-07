---
prd_task_id: "YV-09-204"
title: "YV-09-204: 用户账号删除 — 开发方案"
status: 已完成
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 0.25
source_prd: "78-prd-用户账号删除.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 用户账号删除]
roles: [engineer]
benefit: "开发方案：task-用户账号删除"
lifecycle: active
---

# YV-09-204: 用户账号删除 — 开发方案

> 需求编号：YV-09-204 · 人天：0.25d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 说明 | 路径 |
|------|------|------|
| `AccountDeletion.vue` | 账号删除页面（确认+状态） | `src/views/settings/` |
| `DeletionStatusCard.vue` | 删除状态卡片（冷静期倒计时） | `src/components/user/` |
| `authStore.ts` | 账号删除相关操作 | `src/stores/modules/` |

---

<a id="sec-1"></a>
## 一、方案概述

用户可申请删除账号（GDPR 合规）：确认→冷静期→执行删除。

### 架构方案

**技术路线**：安全设置页面中的「删除账号」入口 → 独立确认页面 `/settings/delete-account`。四阶段流程：身份确认 → 阅读后果 → 冷静期等待 → 自动执行。冷静期（7 天）内可取消，到期后 YiAi 定时任务自动执行匿名化+清除。

**状态机**：
```
[正常] → 用户申请删除 → [pending_deletion]
  → 7 天冷静期
    ├─ 用户取消 → [正常] (恢复)
    └─ 7 天到期 → [deleting] → [deleted] (不可逆)
```

**删除流程**：
```
1. 用户点击「删除账号」
   → el-dialog: 警告文字 + 后果说明（数据不可恢复、内容将被匿名化）
   → 输入密码确认身份
   → POST YiAi auth_service.request_account_deletion
   → 返回 deletion_date (7 天后)

2. 冷静期页面（/settings/delete-account）
   → DeletionStatusCard: 倒计时（"账号将在 6 天 23 小时后删除"）
   → 「取消删除」按钮: ElMessageBox.confirm → auth_service.cancel_deletion
   → 取消后账号恢复正常

3. 冷静期到期 → YiAi 定时任务执行:
   → 匿名化: 替换 display_name 为 "deleted_user_xxx"
   → 清除 PII: email/phone/avatar 清空
   → 保留内容: Issue/Bug 标记为 "已删除用户"
   → 清除 sessions: 删除所有会话记录
   → 标记 status: 'deleted'

4. 前端轮询
   → 每 1h 检查 deletion_date
   → 到期后自动登出 + 重定向到登录页 + 提示 "账号已删除"
```

**组件树**：
```
AccountDeletion.vue (页面容器)
├── DeletionWarning.vue (警告卡片: 删除后果列表 + 数据不可恢复声明)
├── PasswordConfirm.vue (el-input password + 确认按钮)
├── DeletionStatusCard.vue (冷静期状态)
│   ├── CountdownTimer.vue (倒计时: X天X时X分X秒)
│   ├── CancelDeletionButton.vue (取消删除 + 二次确认)
│   └── WhatHappensNext.vue (说明: 到期后自动执行的操作)
└── DeletionHistoryCard.vue (已提交的删除请求记录，如有)
```

**关键决策**：
- 冷静期时长：7 天（GDPR 建议的最小值，给用户反悔时间）
- 内容处理策略：匿名化而非物理删除（保留 Issue/Bug 历史记录的完整性）
- PII 清除范围：display_name → "deleted_user_xxx"、email/phone/avatar → null
- 取消机制：冷静期内随时可取消（需输入密码确认），取消后账号立即恢复正常
- 不可逆性：冷静期到期后删除不可取消——前端明确提示「此操作不可逆」
- 关联数据处理：用户创建的 Issue/Bug 保留但标记为匿名，评论/content 保留但作者显示为 "deleted_user"

### 流程

```
1. 用户在安全设置中点击「删除账号」
2. 输入密码确认 + 阅读删除后果
3. 进入 7 天冷静期（可取消）
4. 7 天后自动执行：匿名化内容 → 清除个人信息 → 不可恢复
```

### 实施步骤：0.25d

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | DeletionWarning + PasswordConfirm 页面 | 警告渲染+密码验证 | 0.08 |
| 2 | DeletionStatusCard + 倒计时 | 提交后查看状态+计时器 | 0.08 |
| 3 | 取消删除流程 + 密码确认 | 取消→恢复正常 | 0.05 |
| 4 | 冷静期到期自动登出 | 轮询到期→登出→提示 | 0.04 |

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] 删除确认：警告文字 + 后果说明 + 密码验证
- [ ] 冷静期倒计时正确显示（X天X时X分X秒）
- [ ] 冷静期内「取消删除」按钮 + 密码确认 → 账号恢复正常
- [ ] 冷静期到期 → 自动登出 + 重定向登录页 + 提示
- [ ] 不可逆性明确提示（多处: 申请时 + 冷静期页面 + 取消确认）
- [ ] 已删除状态下的 UI：登录页提示 + 不可重新登录
- [ ] `vue-tsc --noEmit` 通过

---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：已完成

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| — | 无 | — | — | — | — |

---

## 实现完成记录

> **状态**：已完成（0.25d）· **复核日期**：2026-09-15

### 产出

| 分类 | 文件数 | 说明 |
|------|--------|------|
| 页面 | 1 | AccountDeletion.vue |
| 组件 | 2 | DeletionWarning + DeletionStatusCard |
| Store | 1 | authStore (账号删除操作) |
| 测试 | 1 | 见测试方案 |

---

## 代码审查检查清单

- [x] 4 阶段流程完整（确认→冷静期→执行→不可恢复）
- [x] 删除后果明确告知（数据不可恢复、内容匿名化）
- [x] 冷静期倒计时实时更新
- [x] 取消删除需密码验证
- [x] 冷静期到期自动登出
- [x] 不可逆性多处提示
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过