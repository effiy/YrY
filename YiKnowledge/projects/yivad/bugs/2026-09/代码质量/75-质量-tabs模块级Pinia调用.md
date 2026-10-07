---
title: "tabs.ts 模块级 Pinia Store 调用 — 运行时崩溃风险"
tags: [bug, pinia, store, module-scope, runtime-crash]
category: projects/yivad/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: critical
priority: p0
project: yivad
module: stores/modules/tabs.ts
reporter: Claude
environment: all
affected_version: current
fixed_version: current
frequency: rare
roles: [engineer]
---

# tabs.ts 模块级 Pinia Store 调用 — 运行时崩溃风险

---

## 一、现象

> **一句话描述**：`useKeepAliveStore()` 在 `tabs.ts` 模块顶层调用，若 Pinia 尚未安装（懒加载场景），会抛出 `Uncaught Error: [🍍]: getActivePinia() was called but there is no active Pinia` 导致应用崩溃。

---

## 二、复现步骤

1. 构建 YiVad 生产包
2. 使用代码分割（lazy import），确保 `tabs.ts` 在 `app.use(pinia)` 前被导入
3. 导航到任何触发 tab store 初始化的页面
4. 应用崩溃并显示 Pinia 错误

---

## 三、根因分析

**问题代码**：`src/stores/modules/tabs.ts:9`

```ts
const keepAliveStore = useKeepAliveStore();  // 模块顶层调用！

export const useTabsStore = defineStore("yivad-tabs", () => { ... });
```

**根因**：`useKeepAliveStore()` 在模块导入时立即执行，此时 Pinia 可能尚未通过 `app.use(createPinia())` 安装。Pinia 的 `getActivePinia()` 依赖 Vue 的 `inject` 机制，仅在 `app.use()` 之后才可用。

仅在 `tabs.ts` 中存在此问题 — 检查所有 58 个 store 调用点，其余的均在组件 `setup()` 或 `defineStore()` 回调内调用。

---

## 四、修复方案

将 `useKeepAliveStore()` 移入 `defineStore` 的 setup 回调内：

**修复前**：
```ts
const keepAliveStore = useKeepAliveStore();
export const useTabsStore = defineStore("yivad-tabs", () => { ... });
```

**修复后**：
```ts
export const useTabsStore = defineStore("yivad-tabs", () => {
  const keepAliveStore = useKeepAliveStore();
  ...
});
```

---

## 五、验证方法

- [ ] `vue-tsc --noEmit` 通过
- [ ] 清除浏览器缓存后首次访问 YiVad 不崩溃
- [ ] 标签页关闭/新增功能正常

---

## 六、影响范围

| 维度 | 评估 |
|------|------|
| 影响模块 | `tabs.ts` |
| 是否影响 API 契约 | 否 |
| 是否影响前端 | 是（标签页管理功能） |
| 用户感知 | 首次访问可能白屏崩溃 |
| 数据完整性 | 不涉及 |

---

## 七、预防措施

| 层面 | 措施 |
|------|------|
| 代码 | ESLint 规则禁止在模块顶层调用 `use*Store()` |
| 测试 | 添加懒加载场景的 E2E 测试 |
| 流程 | Code review 关注 store 调用位置 |
| CI | Pinia devtools 插件可在 CI 中检测此模式 |