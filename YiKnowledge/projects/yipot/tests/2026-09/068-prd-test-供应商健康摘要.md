---

doc_type: module
prd_id: "PO-09-68"
title: "PO-09-68-test: 供应商健康摘要 — 测试方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: test
---

# PO-09-68-test: 供应商健康摘要 — 测试方案

## 测试用例

### TC-01: 全部健康显示绿色

```
Given: 5 个引擎全部 status = 'healthy'
When: 渲染 stats bar
Then: 显示 "5/5 healthy"（绿色 text-green-500）
```

### TC-02: 部分健康显示黄色

```
Given: 3 个 healthy + 1 degraded + 1 down
When: 渲染 stats bar
Then: 显示 "3/5 healthy"（黄色 text-yellow-500）
```

### TC-03: 无健康数据不显示

```
Given: health?.providers 为空
When: 渲染 stats bar
Then: totalProviders = 0，不显示健康指示器
```

## 测试环境

- YiAi 运行，MongoDB 有数据
- YiPot `pnpm tauri dev`