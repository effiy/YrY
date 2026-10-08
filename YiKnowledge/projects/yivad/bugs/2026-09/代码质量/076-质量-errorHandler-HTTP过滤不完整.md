---
title: "Vue 全局错误处理器 HTTP 错误过滤逻辑不完整"
tags: [bug, error-handler, vue, http-errors, filter]
category: projects/yivad/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: yivad
module: utils/errorHandler.ts
reporter: Claude
environment: all
affected_version: current
fixed_version: current
frequency: always
roles: [engineer]
---

# Vue 全局错误处理器 HTTP 错误过滤逻辑不完整

---

## 一、现象

> **一句话描述**：`setupGlobalErrorHandler` 中过滤 HTTP 错误的逻辑仅检查 `error.status`，未检查 `error.response?.status`（Axios HTTP 响应的标准位置），导致 4xx/5xx HTTP 错误可能被重复报告。

---

## 二、复现步骤

1. 发起一个返回 500 的 API 请求
2. Axios 抛出错误 → 拦截器处理并弹 toast
3. 若该错误触发了 Vue 的 `errorHandler`
4. 原逻辑 `(error as any).status !== undefined` 检查 `error.status`（Axios 把状态码放在 `error.response.status`）
5. 条件为 false → 错误被**重复**处理（弹两次 toast）

---

## 三、根因分析

**问题代码**：`src/utils/errorHandler.ts:63`

```ts
// 原代码
if ((error as any).status !== undefined || (error as any).status === 0) return;
```

两个问题：
1. Axios 错误的状态码在 `error.response.status`（HTTP 4xx/5xx），不在 `error.status`。后者仅对网络错误为 `0`
2. `||` 右侧的 `status === 0` 对左侧 `status !== undefined` 是**恒真冗余**——`0 !== undefined` 已是 `true`

**根因**：开发者混淆了 Axios 错误对象的结构。Axios 网络错误设置 `error.status = 0`；Axios HTTP 错误设置 `error.response.status = 4xx/5xx` 且 `error.status` 为 `undefined`

---

## 四、修复方案

同时检查 `error.status` 和 `error.response.status`：

**修复后**：

```ts
const httpStatus = (error as any).status ?? (error as any).response?.status;
if (httpStatus !== undefined) return;
```

---

## 五、验证方法

- [ ] 模拟 500 错误 → 仅弹一次 toast
- [ ] 模拟网络断开 → 仅弹一次 toast
- [ ] Vue 渲染错误仍正常捕获并报告

---

## 六、影响范围

| 维度 | 评估 |
|------|------|
| 影响模块 | `errorHandler.ts` |
| 是否影响 API 契约 | 否 |
| 是否影响前端 | 用户体验（重复错误提示） |
| 用户感知 | HTTP 错误可能弹两次 toast |
| 数据完整性 | 不涉及 |