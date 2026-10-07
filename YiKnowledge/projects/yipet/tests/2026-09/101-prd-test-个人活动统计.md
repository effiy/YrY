---

doc_type: module
prd_id: "PE-09-101"
title: "PE-09-101-test: 个人活动统计条 — 测试方案"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"

type: test
---

# PE-09-101-test: 个人活动统计条 — 测试方案

## 测试范围

| 测试项 | 类型 | 验证内容 |
|--------|------|----------|
| 组件渲染 | 单元 | StatsBar 正确显示统计数量 |
| 空状态 | 单元 | 无数据时 stats 为空数组，组件不渲染 |
| 今日统计 | 单元 | todaySessions 正确过滤今日创建的会话 |
| 主题适配 | 视觉 | 颜色方案与 YiPet 主题变量一致 |

## 测试用例

### TC-01: 有数据时显示统计条

```
Given: store.state.sessions 有 5 条会话
       store.state.knowledgeTree 有 3 个 category 共 20 个文件
       store.state.recentBugs 有 2 条 bug
When: 渲染 StatsBar 组件
Then: 显示 4 个统计格（Sessions:5, Knowledge:20, Bugs:2, Today:N）
```

### TC-02: 无数据时隐藏

```
Given: store.state.sessions 为空
       store.state.knowledgeTree 为空
       store.state.recentBugs 为空
When: 渲染 StatsBar 组件
Then: stats computed 返回空数组，组件根元素不渲染
```

### TC-03: 今日统计准确性

```
Given: sessions 中有 2 条 created_at 为今天，3 条为昨天
When: 计算 todaySessions
Then: todaySessions = 2
```

### TC-04: 知识文件计数

```
Given: knowledgeTree = [{category: "aier", files: [f1,f2]}, {category: "engineer", files: [f3]}]
When: 计算 knowledgeCount
Then: knowledgeCount = 3
```

## 测试环境

- Vitest 2 + jsdom 29
- 模拟 Pinia store 状态
- `npm test` 验证