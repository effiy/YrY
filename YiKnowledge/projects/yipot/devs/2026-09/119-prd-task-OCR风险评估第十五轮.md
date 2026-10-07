---
doc_type: dev
title: "YiPot OCR 服务与风险评估（第十五轮）— 开发方案"
tags: [开发方案, OCR, 风险评估, info.ts]
category: 项目/桌面应用/开发
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: task
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
dev_id: YP-09-119
prd_ref: YP-09-78
estimate: 0.25
review_status: 已评审
roles: [engineer]
---

# YiPot OCR 服务与风险评估（第十五轮）— 开发方案

> 开发编号：YP-09-119 · 关联 PRD：YP-09-78 · 预估人天：0.25d

---

## 一、变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/services/recognize/tencent_accurate/index.jsx` | 修改 | config 默认值 `{}` |
| `src/services/recognize/iflytek/index.jsx` | 修改 | config 默认值 `{}` |
| `src/services/recognize/system/info.ts` | 修复 | `` `system` `` → `'system'` |

---

## 二、实施步骤

### Step 1: OCR config 默认值

两处相同模式：`const { config = {} } = options;`

### Step 2: system info.ts icon 修复

```ts
// Before — 模板字符串无插值，TypeScript 将 system 视为标识符
icon: `system`,  // runtime: undefined

// After
icon: 'system',
```

### Step 3: 风险评估矩阵

产出 `architecture/risk-assessment-matrix.md` — 38 个 Bug 风险分级、热力图、残余风险摘要。

---

## 三、验证

```bash
cd YiPot && pnpm build
```

## 四、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/78-prd-OCR风险评估第十五轮.md` |
| 测试 | `../tests/2026-09/125-prd-test-OCR风险评估第十五轮.md` |
| 风险评估矩阵 | `../architecture/risk-assessment-matrix.md` |