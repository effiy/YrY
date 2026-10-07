---
title: useHandleData 和 useDownload 使用 `any` 类型且非真正 composable
tags: [yivad, code-quality, type-safety, code-smell]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: minor
priority: p3
benefit: "缺陷记录：质量-useHandleData-any类型"
lifecycle: active
---

# useHandleData 和 useDownload 使用 `any` 类型且非真正 composable

## 现象

`YiVad/src/hooks/` 目录下的 `useHandleData.ts` 和 `useDownload.ts` 存在以下问题：

1. **命名为 `use*` 但并非 Vue composable**：它们不包含任何响应式状态（ref、computed、watch），也不使用 Vue 生命周期钩子，而是普通的异步函数。按照 Vue 约定，`use*` 前缀应保留给真正的 composable。
2. **参数类型全部使用 `any`**：
   - `useHandleData(api: (params: any) => Promise<any>, params: any = {}, ...)`
   - `useDownload(api: (param: any) => Promise<any>, ...params: any = {}, ...)`
3. **硬编码英文 UI 文本**：未使用 i18n

## 根因分析

这些函数是早期代码，可能从 JavaScript 迁移到 TypeScript 时未做类型细化。它们被 `useHandleData` 的调用方（如 `TopicListPage`、`issue/index.vue`）使用，但类型安全性完全依赖调用方。

## 涉及文件

- `YiVad/src/hooks/useHandleData.ts` — 所有参数使用 `any`，硬编码英文 UI 文本
- `YiVad/src/hooks/useDownload.ts` — 所有参数使用 `any`，硬编码英文 UI 文本

## 修复方案

1. 使用泛型使类型安全：
```typescript
export const useHandleData = <TParams, TResult>(
  api: (params: TParams) => Promise<TResult>,
  params: TParams,
  message: string,
  confirmType: HandleData.MessageType = "warning"
) => { ... }
```

2. 考虑重命名为 `handleData` 和 `downloadFile`（去掉 `use` 前缀），因为它们不是 composable
3. 引入 i18n 处理 UI 文本

## 预防措施

- 新增 hooks 时要求使用泛型替代 `any`
- 非 composable 的工具函数放入 `utils/` 目录，不使用 `use*` 前缀

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- **`use*` 前缀的语义约定**：Vue 社区约定 `use*` 前缀表示 composable（包含响应式状态或生命周期钩子）。`useHandleData` 和 `useDownload` 只是普通异步函数，不符合 composable 定义，应命名为 `handleData` / `downloadFile` 或放入 `utils/`
- **泛型是 `any` 的解药**：`(params: any) => Promise<any>` 可以轻松改为 `<TParams, TResult>(api: (params: TParams) => Promise<TResult>, ...)`，不影响调用方代码，但能提供完整的类型推断

