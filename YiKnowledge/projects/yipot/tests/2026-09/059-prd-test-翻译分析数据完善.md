---

doc_type: module
prd_id: "PO-09-59"
title: "PO-09-59-test: 翻译分析数据完善 — 测试方案"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: test
---

# PO-09-59-test: 翻译分析数据完善 — 测试方案

## 测试范围

| 测试项 | 类型 | 验证内容 |
|--------|------|----------|
| RPC 连通性 | 集成 | `getHourlyTrend`/`getProviderBreakdown`/`getTopLanguagePairs` 可调用 |
| 空数据降级 | 单元 | 无翻译记录时返回空数组，不抛异常 |
| 类型一致性 | 类型 | 返回格式与 YiVad `translationService.ts` 类型定义一致 |

## 测试用例

### TC-01: getHourlyTrend 返回趋势数据

```
Given: MongoDB translation_records 有最近 7 天的翻译记录
When: 调用 getHourlyTrend(7)
Then: 返回 Array<{hour, count, chars}>，按 hour 升序排列
```

### TC-02: getProviderBreakdown 返回分布数据

```
Given: 有多个 provider 的翻译记录
When: 调用 getProviderBreakdown(30)
Then: 返回 Array<{provider, count, success}>，success ≤ count
```

### TC-03: getTopLanguagePairs 返回语种对排名

```
Given: 有多种语种对的翻译记录
When: 调用 getTopLanguagePairs(10)
Then: 返回 Array<{from, to, count, total_chars}>，按 count 降序，最多 10 条
```

### TC-04: 空数据降级

```
Given: translation_records 集合为空或不存在
When: 调用任意分析方法
Then: 返回空数组 []，不抛出异常
```

### TC-05: 错误处理

```
Given: YiAi 不可达
When: 调用任意分析方法
Then: 抛出 Error，消息包含描述性文本
```

## 测试环境

- YiAi 运行在 `localhost:10086`
- MongoDB 运行在 `localhost:27017`
- YiPot 开发模式（`pnpm tauri dev`）