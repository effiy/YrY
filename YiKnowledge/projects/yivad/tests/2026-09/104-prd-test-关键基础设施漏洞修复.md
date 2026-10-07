---
title: "YV-09-104-TEST: 关键基础设施漏洞修复 — 测试"
tags: [测试方案, 内存泄漏, 认证安全, 跨项目]
category: 项目/管理后台/测试
created: "2026-09-23"
updated: "2026-09-23"
source: 内部
type: test
status: 已完成
priority: P1
project: YiVad
project_id: yivad
owner: Chengliang.Yi
prd_month: "202609"
prd_task_id: YV-09-104-TEST
prd_ref: YV-09-104
dev_ref: YV-09-104-TASK
estimate: 0.35
review_status: 已评审
roles: [engineer]
lifecycle: active
---

# YV-09-104-TEST: 关键基础设施漏洞修复 — 测试

---

## TC-1: Grid 监听器不泄漏

| 项 | 内容 |
|----|------|
| **工具** | Chrome DevTools → Performance Monitor → JS Event Listeners |
| **步骤** | 1. 打开任意使用 SearchForm 的页面<br>2. 记录 `resize` 监听器数 = N<br>3. 导航到其他页面 → 返回 → 重复 10 次 |
| **期望** | 每次返回后监听器数 = N（不增长） |

## TC-2: SSE Token 传递

| 项 | 内容 |
|----|------|
| **前置** | YiAi auth enabled |
| **步骤** | 1. DevTools → Network → 过滤 `/notification/stream`<br>2. 检查请求 URL |
| **期望** | URL 包含 `?token=eyJ...`（有效 JWT） |

## TC-3: 反馈持久化

| 项 | 内容 |
|----|------|
| **前置** | MongoDB 可访问 |
| **步骤** | 1. AI Chat 发送消息 → 点击 👍<br>2. 查询 MongoDB `feedback` 集合 |
| **期望** | 存在文档 `{ sessionKey, rating: "up", createdAt }` |

## TC-4: 反馈查询

| 项 | 内容 |
|----|------|
| **步骤** | 1. 同一 session 提交 3 次反馈<br>2. 调用 `getSessionFeedback(sessionKey)` |
| **期望** | 返回 3 条记录，按 `createdAt` 降序 |

## TC-5: vue-tsc 不回归

| 步骤 | `npx vue-tsc --noEmit` |
|------|------------------------|
| **期望** | 0 errors |

---

## 度量

| 指标 | 修复前 | 修复后 |
|------|--------|--------|
| Grid resize 监听器 >1 | ✓ (泄漏) | **0** (无泄漏) |
| SSE URL 无 token | ✓ | **0** |
| 反馈数据未持久化 | ✓ | **0** |
| tsc errors | 0 | **0** |