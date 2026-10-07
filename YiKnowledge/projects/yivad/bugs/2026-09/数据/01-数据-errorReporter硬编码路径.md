---
title: "errorReporter sendBeacon 硬编码 API 路径"
tags: [bug, error-reporter, api-path, hardcoded, sendBeacon]
category: projects/yivad/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: yivad
module: utils/errorReporter.ts
reporter: Claude
environment: all
affected_version: current
fixed_version: current
frequency: always
roles: [engineer]
---

# errorReporter sendBeacon 硬编码 API 路径

---

## 一、现象

> **一句话描述**：`flushErrors()` 中 `sendBeacon` 和 `fetch` 使用硬编码的 `/api/error-report` 路径，未使用 `RSBUILD_ENV_API_URL` 环境变量。当后端部署在子路径时（如 `/yiai/api`），错误报告会发送到错误地址。

---

## 二、复现步骤

1. 配置 `RSBUILD_ENV_API_URL = "https://api.example.com/yiai"`
2. 触发一个未被捕获的 Promise rejection
3. 错误报告发送到 `/api/error-report`（相对于当前页面域名）
4. 实际应发送到 `https://api.example.com/yiai/api/error-report`

---

## 三、根因分析

**问题代码**：`src/utils/errorReporter.ts:101,104`

```ts
navigator.sendBeacon("/api/error-report", payload);
fetch("/api/error-report", { ... });
```

**根因**：开发时 API 和前端在同一域名下，硬编码路径无关紧要。但部署时 API 可能在不同域名或子路径下，此时需要完整的基础 URL。

项目中有 `RSBUILD_ENV_API_URL` 环境变量，但 `errorReporter.ts` 未使用。

---

## 四、修复方案

使用 `RSBUILD_ENV_API_URL` 构造完整路径：

**修复后**：

```ts
const apiBase = import.meta.env.RSBUILD_ENV_API_URL as string || "";
const reportUrl = apiBase ? `${apiBase.replace(/\/+$/, "")}/api/error-report` : "/api/error-report";

navigator.sendBeacon(reportUrl, payload);
```

---

## 五、验证方法

- [ ] `pnpm build` 构建成功
- [ ] 设置 `RSBUILD_ENV_API_URL=https://api.example.com` 后，错误报告发送到正确地址
- [ ] 不设置该变量时，回退到 `/api/error-report`

---

## 六、影响范围

| 维度 | 评估 |
|------|------|
| 影响模块 | `errorReporter.ts` |
| 是否影响 API 契约 | 否 |
| 是否影响前端 | 非标准部署环境 |
| 用户感知 | 错误报告丢失（运维团队收不到告警） |
| 数据完整性 | 不涉及 |