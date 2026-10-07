---
doc_type: module
prd_task_id: "YP-09-238"
title: "YiPet/YiPot 跨项目翻译分析数据桥接 — 开发方案"
status: 已完成
priority: P2
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 0.4
source_prd: "238-prd-跨项目翻译分析数据桥接.md"
related_tests: ["238-prd-test-跨项目翻译分析数据桥接"]
tags: [开发方案, 跨项目, 翻译分析, Provider健康, YiPet]
category: projects/yipet/devs
source: 内部
type: task
---

# YiPet/YiPot 跨项目翻译分析数据桥接 — 开发方案

> 来源 PRD：[238-prd-跨项目翻译分析数据桥接](../../prds/2026-09/238-prd-跨项目翻译分析数据桥接.md)

---

## 源码索引

| 文件 | 说明 | 变化 |
|------|------|------|
| `YiPet/src/api/services/translation.ts` | 新增 6 个分析方法 | +80 行 |
| `YiPet/src/popup/components/ProviderHealth.vue` | 新增 Provider 健康卡片 | 新增 |
| `YiPet/src/popup/components/index.ts` | 组件 barrel export | +1 行 |
| `YiPet/src/popup/App.vue` | 集成 ProviderHealth | +2 行 |

---

## 实现

### 1. Translation Service 方法增强

**文件**：`YiPet/src/api/services/translation.ts`

在 `getProviderRecommend` 方法之后新增 6 个方法，与 YiPot 保持 RPC 契约一致：

```typescript
// getAnalytics — 翻译量 + 语言分布
async getAnalytics(days?: number) {
  const res = await client.rpc<{
    total_translations: number; period_days: number;
    by_target_language: Array<{ language: string; count: number; total_chars: number }>;
  }>(`${MODULE}.translate_service`, 'translation_analytics', { days: days ?? 30 });
  // ...
}

// getProviderHealth — Provider 健康 + 记忆缓存 + 反馈
async getProviderHealth(hours?: number) {
  const res = await client.rpc<{ period_hours: number; providers: Record<string, {...}>; ... }>(
    `${MODULE}.translate_service`, 'provider_health', { hours: hours ?? 24 },
  );
  // ...
}

// getHourlyTrend — 小时级趋势
async getHourlyTrend(days?: number) { ... }

// getProviderBreakdown — Provider 用量细分
async getProviderBreakdown(days?: number) { ... }

// getMemoryStats — 缓存统计
async getMemoryStats() { ... }

// translateStream — SSE 流式翻译
async *translateStream(params) { ... }
```

**RPC 契约对齐**：所有方法名、参数名、返回类型与 YiVad `translationService.ts` 和 YiPot `translation.ts` 完全一致。

### 2. Provider Health Widget

**文件**：`YiPet/src/popup/components/ProviderHealth.vue`（新增）

组件特性：
- `onMounted` 时调用 `provider_health` RPC
- `setInterval` 60s 自动轮询
- `onUnmounted` 清除定时器
- 展示健康摘要 + Top 5 Provider 列表
- 响应式适配 popup 窄宽度（350px）
- 使用 YiPet 主题 CSS 变量（`--yp-*`）

**数据流**：
```
ProviderHealth.vue
  → fetch POST / { module_name, method_name: 'provider_health', parameters: { hours: 24 } }
    → YiAi translate_service.provider_health
      ← { providers: {...}, memory_entries, feedback }
        → 渲染 Provider 列表 + 统计
```

### 3. Popup 集成

**文件**：`YiPet/src/popup/components/index.ts` — 新增 barrel export

**文件**：`YiPet/src/popup/App.vue` — 导入并在 DashboardSummary 后添加 `<ProviderHealth />`

---

## 实施进度

| 任务 | 状态 |
|------|------|
| `translation.ts` 新增 6 个方法 | ✅ |
| `ProviderHealth.vue` 组件 | ✅ |
| Popup 集成 | ✅ |
| `npm run typecheck` 通过 | ✅ |
| 文档：PRD + Dev + Test | ✅ |