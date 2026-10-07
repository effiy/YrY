---
doc_type: dev
title: "YiPot OCR 服务与 Config 审计（第十一轮）— 开发方案"
tags: [开发方案, OCR, config, null-safety]
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
dev_id: YP-09-115
prd_ref: YP-09-74
estimate: 0.25
review_status: 已评审
roles: [engineer]
---

# YiPot OCR 服务与 Config 审计（第十一轮）— 开发方案

> 开发编号：YP-09-115 · 关联 PRD：YP-09-74 · 预估人天：0.25d

---

## 一、变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/services/recognize/baidu/index.jsx` | 修改 | config 默认值 `{}` |
| `src/services/recognize/tencent/index.jsx` | 修改 | config 默认值 `{}` |

---

## 二、实施步骤

两处相同模式：

```js
// Before:
const { config } = options;
const { ... } = config;

// After:
const { config = {} } = options;
const { ... } = config;
```

### 额外审计（无代码修改）

| 文件 | 审计结论 |
|------|---------|
| `window/Config/pages/Service/index.jsx` | ✅ Listener 管理完善（cleanup + 防重复） |
| `window/Config/pages/Service/Translate/index.jsx` | ✅ 状态管理正确 |
| `window/Config/pages/Translate/index.jsx` | ✅ 配置项默认值完整 |

---

## 三、验证

```bash
cd YiPot && pnpm build
```

## 四、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/74-prd-OCR-Config审计第十一轮.md` |
| 测试 | `../tests/2026-09/120-prd-test-OCR-Config审计第十一轮.md` |