---
doc_type: dev
title: "YiPot AI 引擎审计与测试策略（第十三轮）— 开发方案"
tags: [开发方案, AI引擎, chatglm, gemini, volcengine, 测试策略]
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
dev_id: YP-09-117
prd_ref: YP-09-76
estimate: 0.25
review_status: 已评审
roles: [engineer]
---

# YiPot AI 引擎审计与测试策略（第十三轮）— 开发方案

> 开发编号：YP-09-117 · 关联 PRD：YP-09-76 · 预估人天：0.25d

---

## 一、变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/services/translate/chatglm/index.jsx` | 修改 | config 默认值 + apiKey 前置检查 + promptList guard |
| `src/services/translate/geminipro/index.jsx` | 修改 | config 默认值 + promptList guard |
| `src/services/translate/volcengine/index.jsx` | 修改 | config 默认值 |

---

## 二、实施步骤

### Step 1: chatglm/index.jsx

```js
// config default + apiKey guard
const { config = {}, setResult, detect } = options;
if (!apiKey) return Promise.reject('invalid apikey');
// promptList guard
promptList = (promptList || []).map(...)
```

### Step 2: geminipro/index.jsx

```js
const { config = {}, setResult, detect } = options;
promptList = (promptList || []).map(...)
```

### Step 3: volcengine/index.jsx

```js
const { config = {} } = options;
```

### Step 4: 测试策略文档

产出 `tests/master-test-strategy.md`：
- 测试金字塔（L1 编译时 / L2 手动 / L3 回归冒烟）
- 11 个测试方案覆盖矩阵（87 个用例）
- 回归冒烟套件（15 项，< 8 分钟）

---

## 三、验证

```bash
cd YiPot && pnpm build
```

## 四、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/76-prd-AI引擎测试策略第十三轮.md` |
| 测试 | `../tests/2026-09/122-prd-test-AI引擎测试策略第十三轮.md` |
| 主测试策略 | `../tests/master-test-strategy.md` |