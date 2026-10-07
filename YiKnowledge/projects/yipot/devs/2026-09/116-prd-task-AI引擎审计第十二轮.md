---
doc_type: dev
title: "YiPot AI 引擎与 Rust 审计（第十二轮）— 开发方案"
tags: [开发方案, AI引擎, ollama, bing, null-safety]
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
dev_id: YP-09-116
prd_ref: YP-09-75
estimate: 0.25
review_status: 已评审
roles: [engineer]
---

# YiPot AI 引擎与 Rust 审计（第十二轮）— 开发方案

> 开发编号：YP-09-116 · 关联 PRD：YP-09-75 · 预估人天：0.25d

---

## 一、变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/services/translate/ollama/index.jsx` | 修改 | `config` 默认值 `{}` |
| `src/services/translate/bing/index.jsx` | 修改 | `result[0]` → `result?.[0]?.translations` |

---

## 二、实施步骤

### Step 1: ollama/index.jsx

```js
// Before:
const { config, setResult, detect } = options;
let { stream, promptList, requestPath, model } = config;

// After:
const { config = {}, setResult, detect } = options;
let { stream, promptList, requestPath, model } = config;
```

### Step 2: bing/index.jsx

```js
// Before:
if (result[0].translations) {

// After:
if (result?.[0]?.translations) {
```

### Step 3: Rust 复核（无代码修改）

- `clipboard.rs` — polling loop + `break`/restart 模式正确
- `backup.rs` — 文件操作均已使用 `?` 传播错误
- `cmd.rs` — 图像操作资源管理正确

---

## 三、验证

```bash
cd YiPot && pnpm build
```

## 四、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/75-prd-AI引擎审计第十二轮.md` |
| 测试 | `../tests/2026-09/121-prd-test-AI引擎审计第十二轮.md` |