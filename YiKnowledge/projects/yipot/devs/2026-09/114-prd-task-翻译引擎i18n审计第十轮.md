---
doc_type: dev
title: "YiPot 翻译引擎与 i18n 审计（第十轮）— 开发方案"
tags: [开发方案, 翻译引擎, null-safety, deepl, openai, youdao, i18n]
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
dev_id: YP-09-114
prd_ref: YP-09-73
estimate: 0.25
review_status: 已评审
roles: [engineer]
---

# YiPot 翻译引擎与 i18n 审计（第十轮）— 开发方案

> 开发编号：YP-09-114 · 关联 PRD：YP-09-73 · 预估人天：0.25d

---

## 一、变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/services/translate/deepl/index.jsx` | 修改 | config 默认值 + 逗号运算符修复 |
| `src/services/translate/openai/index.jsx` | 修改 | options/config 默认值 |
| `src/services/translate/youdao/index.jsx` | 修改 | config 默认值 |

---

## 二、实施步骤

### Step 1: deepl/index.jsx

```js
// config
const { config = {} } = options;

// 逗号运算符 → 逻辑与
// Before: if ((result.translations, result.translations[0]))
// After:  if (result.translations && result.translations[0])
```

### Step 2: openai/index.jsx

```js
// options 默认值
export async function translate(text, from, to, options = {}) {
    const { config = {}, setResult, detect } = options;
    let { service, ... } = config || {};
```

### Step 3: youdao/index.jsx

```js
const { config = {} } = options;
```

### Step 4: i18n 审计（分析产出，不修改代码）

13/20 locale 文件有缺失键 → 产出 `architecture/i18n-audit.md`

---

## 三、验证

```bash
cd YiPot && pnpm build
```

## 四、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/73-prd-翻译引擎i18n审计第十轮.md` |
| 测试 | `../tests/2026-09/119-prd-test-翻译引擎i18n审计第十轮.md` |
| i18n 审计 | `../architecture/i18n-audit.md` |