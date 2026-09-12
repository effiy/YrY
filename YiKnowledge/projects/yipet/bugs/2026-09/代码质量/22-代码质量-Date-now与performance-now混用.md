---
title: Date.now() 用于业务时间戳而非性能测量
tags: [yipet, code-quality, timestamp]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# Date.now() 用于业务时间戳而非性能测量

## 现象

`Date.now()` 在 API 层和工具函数中用作业务时间戳，但 `Date.now()` 受系统时钟调整（NTP、用户手动修改）影响：

```typescript
// sessions.ts:74 — 用 Date.now() 记录更新时间
data: { key: id, ...data, updatedAt: Date.now() },

// bug.ts:207 — 用 Date.now() 生成唯一 key
return `bug_${slug}_${Date.now().toString(36)}`;

// chat/index.ts:31 — 用 Date.now() 判断事件新鲜度
if (Date.now() - detail.__timestamp > 5000) return false;
```

系统时钟回调时：
- `updatedAt` 可能出现"时间倒退"
- `Date.now().toString(36)` 可能在短时间内生成重复 key
- 事件新鲜度判断在时钟跳变时不可靠

## 根因分析

- `Date.now()` 是系统时钟的代理，不适合需要单调递增的场景
- `performance.now()` 是单调递增的（不受系统时钟影响），适合计算时间差
- 但 `performance.now()` 是相对时间，不适合跨会话持久化

## 涉及文件

- `src/api/services/sessions.ts:74`
- `src/api/services/bug.ts:121,207`
- `src/chat/index.ts:31`

## 修复方案

1. 时间差计算（`chat/index.ts:31`）→ 使用 `performance.now()`
2. 唯一 key 生成（`bug.ts:207`）→ 使用 `crypto.randomUUID()` 或 `uuid`
3. 业务时间戳（`sessions.ts:74`）→ 保持 `Date.now()`，但使用 UTC ISO 字符串增强可读性


## 影响范围

**影响模块**：混用 `Date.now()` 和 `performance.now()` 的计时代码。
**影响用户**：`Date.now()` 受系统时间调整影响，可能导致计时不准（如超时判断过早/过晚触发）。
**影响范围**：所有依赖时间差计算的逻辑（超时检测、动画帧计时、性能监控）。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 性能测量和短时间间隔使用 `performance.now()`，日期/时间戳使用 `Date.now()` | 开发者 |
| 代码 | 在需要单调递增时间的场景（超时、动画），始终使用 `performance.now()` | 开发者 |
| 工具 | ESLint 规则检测计时代码中的 `Date.now()` 使用 | DevOps |


## 经验教训

`Date.now()` 返回的是系统时钟时间，可能因 NTP 同步、用户手动调整而回退或跳跃。`performance.now()` 返回的是单调递增时间，不受系统时钟影响。对于超时判断和性能测量，使用错误的时钟源可能导致时间差为负数或异常大。
