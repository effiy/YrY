---
doc_type: dev
title: "YiPot 服务层修复（第七轮）— 开发方案"
tags: [开发方案, 服务层, null-safety, google, baidu, updater]
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
dev_id: YP-09-111
prd_ref: YP-09-70
estimate: 0.25
review_status: 已评审
roles: [engineer]
---

# YiPot 服务层修复（第七轮）— 开发方案

> 开发编号：YP-09-111 · 关联 PRD：YP-09-70 · 预估人天：0.25d

---

## 一、变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/services/translate/google/index.jsx` | 修改 | 4 处嵌套数组 → 可选链 + 类型守卫 |
| `src/services/translate/baidu/index.jsx` | 修改 | config 解构默认值 + 空值校验 |
| `src/window/Updater/index.jsx` | 修改 | useEffect cleanup 清理下载进度 listener |

---

## 二、实施步骤

### Step 1: google/index.jsx — null safety

4 处修改：`result[0][1][3]` → `result[0]?.[1]?.[3]`、`i[2].map(...)` → `i?.[2]` guard、`result[13][0]` → `result[13]?.[0]`、`r[0]` → `r?.[0]`。顶层添加 `!result || !Array.isArray(result)` 格式验证。

### Step 2: baidu/index.jsx — config default

```js
// Before:
const { config } = options;
const { appid, secret } = config;
if (appid === '' || secret === '') { throw ... }

// After:
const { config = {} } = options;
const { appid, secret } = config;
if (!appid || !secret) { throw ... }
```

### Step 3: Updater/index.jsx — cleanup

useEffect return 中清理 `tauri://update-download-progress` listener。

---

## 三、验证

```bash
cd YiPot && pnpm build
```

## 四、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/70-prd-服务层修复第七轮.md` |
| 测试 | `../tests/2026-09/116-prd-test-服务层修复第七轮.md` |
| 错误处理指南 | `../workflows/开发规范/08-规范-翻译服务错误处理.md` |