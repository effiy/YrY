---
prd_task_id: "YP-09-100"
title: "YP-09-100: API 架构修复与实时数据轮询 — YiPet 开发方案"
status: 已完成
priority: P0
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "YA-09-122"
tags: [开发方案, 跨项目, API架构, 实时轮询, 数据一致性]
type: task
category: 项目/Chrome扩展/开发
source: YiPet
benefit: "修复 YiPet popup 架构违规（raw fetch → ApiClient），统一 60s 轮询节奏，数据年龄可视化"
lifecycle: active
---

# YP-09-100: API 架构修复与实时数据轮询 — YiPet 开发方案

> 关联 PRD: [YA-09-122: 跨项目数据一致性](../../../yiai/prds/2026-09/122-需求-跨项目数据一致性.md)

## 问题诊断

YiPet 已完整构建四层 API 架构（`src/api/` → client/endpoints/types/services），包括 `DashboardService` 和 `TranslationService`。但 popup 组件完全绕过此架构：

| 组件 | 当前实现 | 问题 |
|------|----------|------|
| `DashboardSummary.vue` | `fetch('${YIAI_URL}/dashboard/summary')` | 无认证、无错误处理、无类型 |
| `ProviderHealth.vue` | `fetch(YIAI_URL, { body: JSON.stringify({ module_name: ... }) })` | 手动构造 RPC 信封，与已有 `TranslationService.getProviderHealth()` 重复 |
| `popup/main.ts` | 无 API 初始化 | `createApiServices()` 从未被调用 |

## 修改清单

| # | 文件 | 变更 |
|---|------|------|
| 1 | `popup/main.ts` | `createApiServices({ baseUrl })` 初始化，存储到 `window.__yipet_services` |
| 2 | `popup/services/api.ts` | **新建** — `getApiServices()` 类型安全访问桥 |
| 3 | `popup/components/ProviderHealth.vue` | ApiClient 迁移 + data-age 显示（60s 轮询保留） |
| 4 | `popup/components/DashboardSummary.vue` | ApiClient 迁移 + 60s 轮询 + 统计扩展（4→6）+ 跨项目链接 |
| 5 | `chat/components/ProjectHealthCard.vue` | 60s 轮询 + data-age + 离开页面清理 |

## 实现要点

### 1. API 客户端初始化

```ts
// popup/main.ts — bootstrap() 中
import { createApiServices } from '@/api';
const api = createApiServices({ baseUrl: 'http://localhost:10086' });
(window as any).__yipet_services = api;
```

### 2. 类型安全访问桥

```ts
// popup/services/api.ts（新建）
import type { ApiServices } from '@/api';
export function getApiServices(): ApiServices | null {
  if (typeof window === 'undefined') return null;
  return (window as any).__yipet_services as ApiServices | null;
}
```

### 3. ProviderHealth 迁移

```ts
// 之前：raw fetch() + 手动 RPC 信封
const r = await fetch(YIAI_URL, {
  body: JSON.stringify({ module_name: 'services.translation.translate_service', ... })
});

// 之后：ApiClient
const svc = getApiServices();
health.value = await svc?.translation.getProviderHealth(24);
```

### 4. DashboardSummary 增强

- 统计网格：`open_issues`/`open_bugs`/`today_done`/`overdue` → 新增 `chat_sessions`/`knowledge_files`（2×2 → 3×2）
- 项目列表：每行变为可点击 → `window.open('http://localhost:8848/#/project/<key>')`
- 底部："Open YiVad Dashboard →" 全局链接
- 新增 `dataAge` ref + 1s ticker + 绿色新鲜/灰色过期样式

### 5. 数据年龄显示模式

```ts
const dataAge = ref(0);
let ageTimer = setInterval(() => { dataAge.value++; }, 1000);
// 模板中：dataAge < 60 ? `${dataAge}s` : `${Math.floor(dataAge/60)}m`
```

所有 3 个组件使用相同模式，CSS 类 `--stale` 在 >60s 时切换颜色。

## 验证

- `npm run typecheck` ✅ 通过
- `npm run build` ✅ 4 入口构建通过（popup/chat/cdn/bootstrap）
- 加载扩展 → 打开 popup → 验证 DashboardSummary 显示 6 项 KPI + 数据年龄计时器
- 验证 ProviderHealth 显示供应商列表 + 数据年龄计时器
- 打开 `http://localhost:8848/#/project/yipot` → 验证 ProjectHealthCard 出现并自动刷新