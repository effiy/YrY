---
doc_type: test
title: "YiPet/YiPot 跨项目翻译分析数据桥接 — 测试方案"
status: 已完成
priority: P2
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
prd_month: "202609"
source_prds: ["238-prd-跨项目翻译分析数据桥接"]
source_modules: ["238-prd-task-跨项目翻译分析数据桥接"]
tags: [测试方案, 跨项目, 翻译分析, Provider健康, YiPet]
category: projects/yipet/tests
source: 内部
type: test
---

# YiPet/YiPot 跨项目翻译分析数据桥接 — 测试方案

> 测试编号：YP-09-238 · 优先级：P2

---

## 测试目标

验证 YiPet 新增的 6 个 RPC 方法和 ProviderHealth 组件功能正确性，确认三项目 RPC 契约一致。

---

## 测试环境

| 条件 | 值 |
|------|-----|
| 后端 | YiAi `:10086` 运行中，Ollama 可用 |
| 浏览器 | Chrome 120+，加载 YiPet 扩展 |
| 构建 | `npm run build` 通过 |

---

## 测试用例

### TC-1: getAnalytics 数据返回

| 维度 | 内容 |
|------|------|
| **操作** | 调用 `translationService.getAnalytics(30)` |
| **预期** | 返回 `{ total_translations, period_days, by_target_language[] }` |
| **验证** | `total_translations >= 0`，`by_target_language` 数组元素含 `language`/`count`/`total_chars` |

### TC-2: getProviderHealth 数据返回

| 维度 | 内容 |
|------|------|
| **操作** | 调用 `translationService.getProviderHealth(24)` |
| **预期** | 返回 `{ providers: Record<string, {...}>, memory_entries, feedback }` |
| **验证** | Provider 状态为 `healthy \| degraded \| down` 之一 |

### TC-3: getHourlyTrend 数据返回

| 维度 | 内容 |
|------|------|
| **操作** | 调用 `translationService.getHourlyTrend(7)` |
| **预期** | 返回 `Array<{ hour, count, chars }>` |
| **验证** | 数组长度 > 0，`hour` 为 ISO 8601 格式 |

### TC-4: getProviderBreakdown 数据返回

| 维度 | 内容 |
|------|------|
| **操作** | 调用 `translationService.getProviderBreakdown(30)` |
| **预期** | 返回 `Array<{ provider, count, success }>` |
| **验证** | `success <= count` |

### TC-5: getMemoryStats 数据返回

| 维度 | 内容 |
|------|------|
| **操作** | 调用 `translationService.getMemoryStats()` |
| **预期** | 返回 `{ total, languages, providers }` |
| **验证** | `total >= 0` |

### TC-6: translateStream SSE 流式

| 维度 | 内容 |
|------|------|
| **操作** | 调用 `for await (const chunk of translateStream({ text: 'hello', to_lang: 'zh' })) { ... }` |
| **预期** | 逐 chunk 返回翻译文本，最后 `{ done: true }` |
| **验证** | 累计 chunk 拼接为完整翻译 |

### TC-7: ProviderHealth 组件渲染

| 维度 | 内容 |
|------|------|
| **前置条件** | YiAi 运行中，有翻译记录 |
| **操作** | 打开 YiPet Popup |
| **预期** | ProviderHealth 卡片显示：健康数、缓存数、Top 5 Provider 列表 |
| **验证** | 各 Provider 行显示名称、成功率百分比、调用次数 |

### TC-8: 三项目 RPC 契约一致性

| 维度 | 内容 |
|------|------|
| **操作** | 对比 YiVad `translationService.ts`、YiPot `translation.ts`、YiPet `translation.ts` |
| **预期** | 相同的 RPC 方法使用相同的 `module_name.method_name` 和参数名 |
| **验证** | `provider_recommend` 参数均为 `{ from_lang, to_lang }`，返回类型一致 |

### TC-9: 类型检查

| 维度 | 内容 |
|------|------|
| **操作** | `cd YiPet && npm run typecheck` |
| **预期** | 零错误 |

### TC-10: 构建验证

| 维度 | 内容 |
|------|------|
| **操作** | `cd YiPet && npm run build` |
| **预期** | 构建成功 |