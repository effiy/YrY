---
title: "路由守卫 toLocaleLowerCase 土耳其语区域问题"
tags: [bug, router, locale, toLocaleLowerCase, turkish]
category: projects/yivad/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: trivial
priority: p3
project: yivad
module: routers/index.ts
reporter: Claude
environment: all
affected_version: current
fixed_version: current
frequency: rare
roles: [engineer]
---

# 路由守卫 toLocaleLowerCase 土耳其语区域问题

---

## 一、现象

> **一句话描述**：`router.beforeEach` 中 `to.path.toLocaleLowerCase()` 在土耳其语区域下会将大写 `I` 转换为 `ı`（无点小写 i）而非 `i`，可能导致 `LOGIN_URL` 匹配失败。

---

## 二、复现步骤

1. 系统语言设为土耳其语（`tr-TR`）
2. 设置 `LOGIN_URL = "/login"`
3. 访问 `/Login`（大写 L 是故意测试）
4. `"LOGIN".toLocaleLowerCase("tr")` → `"logın"`（无点 ı）≠ `"login"`
5. 路由守卫未识别为登录页，执行错误的权限检查逻辑

---

## 三、根因分析

**问题代码**：`src/routers/index.ts:65`

```ts
if (to.path.toLocaleLowerCase() === LOGIN_URL) {
```

**根因**：`String.prototype.toLocaleLowerCase()` 对某些语言有特殊的大小写映射规则：

| 语言 | `"LOGIN".toLocaleLowerCase()` | 结果 |
|------|------|------|
| `tr` (土耳其语) | `"logın"` | 错误 |
| `az` (阿塞拜疆语) | `"logın"` | 错误 |
| `en` (英语) | `"login"` | 正确 |

应使用 `toLowerCase()`，它对所有区域返回一致的 ASCII 结果。

---

## 四、修复方案

**修复前**：
```ts
if (to.path.toLocaleLowerCase() === LOGIN_URL) {
```

**修复后**：
```ts
if (to.path.toLowerCase() === LOGIN_URL) {
```

---

## 五、验证方法

- [ ] `vue-tsc --noEmit` 通过
- [ ] `/Login` 和 `/login` 路径均正确识别为登录页

---

## 六、影响范围

| 维度 | 评估 |
|------|------|
| 影响模块 | `routers/index.ts` |
| 是否影响 API 契约 | 否 |
| 是否影响前端 | 仅土耳其语/阿塞拜疆语环境 |
| 用户感知 | 登录页路由判断错误 |
| 数据完整性 | 不涉及 |