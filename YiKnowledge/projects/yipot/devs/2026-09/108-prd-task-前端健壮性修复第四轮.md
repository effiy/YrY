---
doc_type: dev
title: "YiPot 前端健壮性修复（第四轮）— 开发方案"
tags: [开发方案, 前端, 错误处理, 状态管理, API]
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
dev_id: YP-09-108
prd_ref: YP-09-67
estimate: 0.5
review_status: 已评审
roles: [engineer]
---

# YiPot 前端健壮性修复（第四轮）— 开发方案

> 开发编号：YP-09-108 · 关联 PRD：YP-09-67 · 预估人天：0.5d

---

## 一、变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/utils/lang_detect.js` | 修改 | 7 函数添加 try/catch + `new String()` 修复 + 可选链 + 代码压缩 |
| `src/window/Translate/index.jsx` | 修改 | 变量名冲突修复（`unlisten` → `blurUnlisten` + `pluginReloadUnlisten`） |
| `src/api/client.ts` | 修改 | `get()`/`post()` 补充超时 + signal 清理 + 非 JSON 响应处理 |

---

## 二、实施步骤

### Step 1: lang_detect.js — 异常处理（7 函数）

每个函数统一模式：
```js
async function xxx_detect(text) {
    const lang_map = { ... };  // 紧凑单行格式
    try {
        let res = await fetch(...);
        if (res.ok && res.data?.key && ...) return lang_map[...];
    } catch { /* fall through to default */ }
    return 'en';
}
```

同时修复：
- `niutrans_detect`: `new String(new Date().getTime())` → `String(new Date().getTime())`
- 全部函数: `res.data.xxx` → `res.data?.xxx` (可选链)

### Step 2: Translate/index.jsx — 变量名冲突

```js
// Before:
let unlisten = listenBlur();          // 变量冲突
// ...
if (!unlisten) {
    unlisten = listen('reload_plugin_list', ...);  // 永远不执行
}

// After:
let blurUnlisten = listenBlur();
let pluginReloadUnlisten = null;      // 独立变量
// ...
if (!pluginReloadUnlisten) {
    pluginReloadUnlisten = listen('reload_plugin_list', ...);
}
```

### Step 3: api/client.ts — 超时 + signal 清理

为 `get()`/`post()` 补充与 `rpc()` 一致的 `AbortController` + timeout + finally 清理模式。同时补充非 JSON 响应处理。

---

## 三、验证

```bash
cd YiPot && pnpm build
```

## 四、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/67-prd-前端健壮性修复第四轮.md` |
| 测试 | `../tests/2026-09/113-prd-test-前端健壮性修复第四轮.md` |
| Bug 017 | `../bugs/功能缺陷/017-lang-detect-未处理promise拒绝.md` |
| Bug 018 | `../bugs/功能缺陷/018-translate-变量名冲突-插件监听器未注册.md` |
| Bug 019 | `../bugs/功能缺陷/019-api-client-get-post-缺超时.md` |