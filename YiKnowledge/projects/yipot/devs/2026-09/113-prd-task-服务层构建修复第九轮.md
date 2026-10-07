---
doc_type: dev
title: "YiPot 服务层与构建修复（第九轮）— 开发方案"
tags: [开发方案, 服务层, tts, collection, 构建修复]
category: 项目/桌面应用/开发
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: task
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
dev_id: YP-09-113
prd_ref: YP-09-72
estimate: 0.25
review_status: 已评审
roles: [engineer]
---

# YiPot 服务层与构建修复（第九轮）— 开发方案

> 开发编号：YP-09-113 · 关联 PRD：YP-09-72 · 预估人天：0.25d

---

## 一、变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/services/tts/lingva/index.jsx` | 修改 | config 默认值 + try/catch + HTTP error throw |
| `src/services/collection/eudic/index.jsx` | 修改 | config 默认值 `{}` |
| `src/services/collection/anki/index.jsx` | 修改 | config 默认值 `{}` |
| `src/window/Config/pages/History/index.jsx` | 修复 | 移除 3 处 `(p: any)` TypeScript 类型注解 |

---

## 二、实施步骤

### Step 1: History/index.jsx — 构建修复

```js
// Before (TS syntax in JSX):
provEntries.filter((p: any) => p.status === 'healthy')

// After:
provEntries.filter((p) => p.status === 'healthy')
```
3 处相同修复。

### Step 2: tts/lingva/index.jsx

```js
// config 默认值 + try/catch
const { config = {} } = options;
try { ... if (!res.ok) throw ... } catch (e) { throw `TTS failed: ...` }
```

### Step 3: collection/{eudic,anki}/index.jsx

```js
// Before: const { config } = options;
// After:  const { config = {} } = options;
```

---

## 三、验证

```bash
cd YiPot && pnpm build
```

## 四、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/72-prd-服务层构建修复第九轮.md` |
| 测试 | `../tests/2026-09/118-prd-test-服务层构建修复第九轮.md` |