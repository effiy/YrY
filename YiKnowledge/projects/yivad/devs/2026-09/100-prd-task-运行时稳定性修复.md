---
doc_type: dev
title: "YiVad 运行时稳定性修复 — 开发方案"
tags:
- 开发方案
- Pinia
- 错误处理
- 路由
category: 项目/管理后台/开发
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: task
status: 已完成
priority: P0
project: YiVad
project_id: yivad
owner: Chengliang.Yi
prd_month: '202609'
dev_id: YV-09-100
prd_ref: YV-09-100
estimate: 0.5
review_status: 已评审
roles:
- engineer
---

# YiVad 运行时稳定性修复 — 开发方案

> 开发编号：YV-09-100 · 关联 PRD：YV-09-100 · 预估人天：0.5d

---

## 一、变更清单

| 文件 | 变更类型 | 行 | 说明 |
|------|----------|-----|------|
| `stores/modules/tabs.ts` | 重构 | 9 | `useKeepAliveStore()` 从模块级移入 `defineStore` 回调 |
| `utils/errorHandler.ts` | 修复 | 63 | HTTP 错误过滤同时检查 `error.status` 和 `error.response?.status` |
| `routers/index.ts` | 修复 | 65 | `toLocaleLowerCase()` → `toLowerCase()` |
| `utils/errorReporter.ts` | 修复 | 101-103 | 硬编码路径 → 使用 `RSBUILD_ENV_API_URL` |

---

## 二、实施步骤

### Step 1: tabs.ts Pinia 调用修复

将 `const keepAliveStore = useKeepAliveStore()` 从模块顶层移入 `defineStore` 回调：

```ts
// 删除第 9 行的模块级调用
- const keepAliveStore = useKeepAliveStore();

// 在 defineStore 回调开头添加
export const useTabsStore = defineStore("yivad-tabs", () => {
+   const keepAliveStore = useKeepAliveStore();
    const tabsMenuList = ref<TabsMenuProps[]>([]);
```

`keepAliveStore` 在 `addTabs`、`removeTabs`、`closeTabsOnSide`、`closeMultipleTab` 中通过闭包访问，无需修改。

### Step 2: errorHandler HTTP 过滤修复

```ts
// Before
if ((error as any).status !== undefined || (error as any).status === 0) return;

// After
const httpStatus = (error as any).status ?? (error as any).response?.status;
if (httpStatus !== undefined) return;
```

Axios 错误结构：网络错误 `{ status: 0 }`，HTTP 错误 `{ response: { status: 4xx/5xx } }`。

### Step 3: 路由 toLowerCase 修复

```ts
// Before
if (to.path.toLocaleLowerCase() === LOGIN_URL) {

// After
if (to.path.toLowerCase() === LOGIN_URL) {
```

### Step 4: errorReporter API 路径修复

```ts
const apiBase = import.meta.env.RSBUILD_ENV_API_URL as string || "";
const reportUrl = apiBase ? `${apiBase.replace(/\/+$/, "")}/api/error-report` : "/api/error-report";
```

---

## 三、验证命令

```bash
cd YiVad
npx vue-tsc --noEmit       # TypeScript 类型检查
pnpm build                   # 生产构建
pnpm test                    # 单元测试
```

---

## 四、回滚方案

所有变更为单文件局部修改，`git revert` 对应 commit 即可。无数据结构变更。

---

## 五、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/100-prd-运行时稳定性修复.md` |
| 测试 | `../tests/2026-09/100-prd-test-运行时稳定性修复.md` |
| Bug 75 | `../bugs/2026-09/代码质量/75-质量-tabs模块级Pinia调用.md` |
| Bug 76 | `../bugs/2026-09/代码质量/76-质量-errorHandler-HTTP过滤不完整.md` |
| Bug 路由 | `../bugs/2026-09/路由权限/02-路由-toLocaleLowerCase土耳其语.md` |
| Bug 数据 | `../bugs/2026-09/数据/01-数据-errorReporter硬编码路径.md` |