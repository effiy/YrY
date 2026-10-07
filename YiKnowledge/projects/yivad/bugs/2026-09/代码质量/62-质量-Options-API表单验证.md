---
title: 表单校验规则文件 eleValidate.ts 使用 Options API 风格
tags: [yivad, code-quality, consistency]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
benefit: "缺陷记录：质量-Options-API表单验证"
lifecycle: active
---

# 表单校验规则文件 eleValidate.ts 使用 Options API 风格

## 现象

`utils/eleValidate.ts` 中的表单校验函数使用 Element Plus 的 Options API 风格（`rule: any, value: any, callback: any`），而项目主体使用 Composition API：

```typescript
export function checkPhoneNumber(rule: any, value: any, callback: any) { ... }
```

## 涉及文件

- `src/utils/eleValidate.ts`

## 修复方案

升级为 Promise 风格的异步校验函数，与 Composition API 一致。

## 预防措施

新代码不使用 Options API 风格的回调模式。

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- **一个 Options API 文件在 Composition API 项目中是模式污染的入口**：`eleValidate.ts` 使用 `(rule: any, value: any, callback: any)` 的回调模式，调用方需要理解 Element Plus 的 legacy 校验 API。Promise 风格的异步校验（`async (rule, value) => {...}`）与 Composition API 一致且类型更安全

