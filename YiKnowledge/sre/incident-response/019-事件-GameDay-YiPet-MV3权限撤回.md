---
title: "GameDay 演练：YiPet MV3 chrome.storage / host_permissions 撤回回滚与 Chrome.deferPermissions 引导"
aliases: [gameday-yipet-mv3-permissions, yipet-mv3-permission-revoke, yipet-permission-defer]
tags: [sre, incident-response, gameday, yipet, mv3, chrome-extension, permissions]
category: sre/incident-response
created: 2026-10-07
updated: 2026-10-07
source: internal
type: howto
status: stable
lifecycle: active
review_cycle: quarterly
roles: [sre, engineer]
benefit: "Chrome 撤回权限自动更新策略导致 YiPet 扩展功能失活时，按 GameDay 验证回滚版本 + Chrome.deferPermissions 引导通知 + 用户同意页路径全部走通，不丢数据"
acceptance_criteria:
  - "5 大节：目标、准备、触发（chrome.storage 访问错误模拟、host_permissions 撤回模拟）、回滚版本链路、deferPermissions 引导页、期望行为+实际+改进
  - "验证 Chrome Policy/Chrome Enterprise policy 触发 storage 错误内容脚本无法写入失败 -> 降级到 in-memory + 引导用户重新同意；Chrome.deferPermissions 弹窗流程正确"
  - "覆盖 8 条断言：回滚版本号 <= 当前版本 -1、content_scripts 保留最小权限版本"
related:
  - ../../engineer/learn/projects/yipet/0001-项目-架构设计.md
  - ../../projects/yipet/prds/2026-08/03-prd-安全合规.md
  - ../../projects/yipet/prds/2026-09/13-prd-安全配置.md
  - ../../projects/yipet/prds/2026-09/78-prd-沙箱逃逸防护.md
  - ../../leader/architecture/14-架构-可观测性策略.md
  - ./0008-事件-GameDay演练.md
  - ./0004-事件-响应事件.md
  - ../QUICKREF.md
---

# GameDay 演练：YiPet MV3 chrome.storage / host_permissions 撤回回滚与 Chrome.deferPermissions 引导

> **适用场景**：Chrome Web Store 政策更新导致的 Policy 更新 / 企业管理员批量撤回权限 / 用户手动关闭权限 / 浏览器权限被重置场景。

| GameDay | 详情 |
|---|---|
| **演练 ID** | GD-YIPET-MV3-PERM-019 |
| **演练目标** | 1) chrome.storage.local/sync 不可用时 YiPet 不崩溃 + 降级内存缓存 + 恢复后 merge；2) host_permissions <all_urls> 撤回时 content_scripts 不注入 + defer 引导用户重新开启；3) CWS 回滚到上一稳定版本不丢用户会话数据 |
| **平台** | Chrome 120+ (MV3 Manifest V3) |
| **参与人** | YiPet TL + SRE oncall + PM |
| **预计时长** | 45 分钟 |
| **日期** | 2026-10-07 |
| **判定** | ☐ PASS 全链路走通 / ☐ PARTIAL 部分降级 / ☐ FAIL 白屏或功能丧失 |

---

## 一、演练目标与风险

Chrome 生态对 MV3 常见权限故障模式：

| 场景 A：`chrome.storage.sync` 和 `chrome.storage.local` 访问错误（企业策略 `StorageDisabled` 或 浏览器崩溃导致 `lastError = "Access to storage is not allowed"）

| 场景 B：content_scripts 的 `<all_urls> / host_permissions 被用户关闭 / Chrome Policy 策略撤回：`<`chrome://policy/` 限制企业管理员设置 Host 撤回

| 场景 C：CWS 审核导致 审核不过，需要快速 `Management API ` 撤销 manifest v3 审核 -> 发布到 store rollback

演练验证：

1. 存储访问错误降级到内存缓存（in-memory fallback
2. Host host_permissions 撤回 → content_scripts inject 失败 → `Chrome.deferPermissions 引导通知 + 用户点击同意页路径
3. Rollback 回滚版本 manifest v3 版本号 version + 兼容上一版本的最小权限
4. 用户数据 sessionStorage 在权限恢复后 merge merge sync data

---

## 二、准备环境

| # | 清单 | 检查动作 |
|---|---|---|
| 1 | **Chrome 版本 | Chrome 120+ 稳定版或 Dev 通道 |
| 2 | **扩展安装 | 已安装 YiPet 版本：2.x.x (从 Web Store 或本地加载开发模式 unpacked) |
| 3 | **当前版本号 A (manifest.json | version `version` = 记录 N+1 |
| 4 | **上一稳定版本 B（回滚版 (rollback candidate | v2.x.x-1 (最小权限版 manifest (manifest_v2_optimized.manifest 存储本地加载 |
| 5 | **Chrome 标志位** | `chrome://flags` → `About Chrome Deferred Permission DeferPermissions 引导引导标志 `chrome://flags/#deferred-permissions` 启用 |
| 6 | **测试账号 Chrome 配置 | Test Profile 独立 profile 新建 → 单独的用户配置独立浏览器用户配置独立用户配置 |
| 7 | **Chrome Policies 策略 | `chrome://management` 策略开启企业策略 管理 → 模拟权限 (local state 启用本地加载 |

---

## 三、触发模拟：chrome.storage 访问错误

### 3.1 场景 A：chrome.storage 访问错误

```javascript
// 触发: 在扩展后台 Background Service Worker：
// 使用 devtools 中执行，模拟存储错误注入模拟代码：
// 在 service worker: 开启 DevTools -> Application -> Service Workers -> → 模拟 chrome.storage.local.set 失败：

// 触发方法一：直接 monkey-patch chrome.storage.local.set get 访问错误
const origGet = chrome.storage.local.get;
origSet = chrome.storage.local.set;

// 模拟 storage 禁用禁用：
chrome.storage.local.set = function(data, cb) {
    const err = new Error("Access to storage is not allowed for this extension. (Policy or user 企业策略)");
    if (chrome.runtime.lastError = err);
    if (cb) cb(undefined);
    return Promise.reject(err);
};
chrome.storage.local.get = function(keys, cb) {
    const err = new Error("StorageDisabled by admin policy storage disabled");
    chrome.runtime.lastError = err;
    if (cb) cb(undefined);
    return Promise.reject(err);
};

// 场景 A 完成：之后运行：
console.log("Storage 触发存储模拟 A 模拟：YiPet 在 content script content_script/content_script
```

**预期动作：点击 YiPet content content script 注入后→ 检查 UI 应该 -> 检查 UI → 显示 "权限不足

### 3.2 场景 B：host_permissions 撤回

模拟步骤：
1. `chrome://extensions` → YiPet → 详细信息 → 扩展选项 → 网站设置 → 允许此扩展权限设置 → "允许此扩展读取和更改所有网站上的所有数据" 更改为："点击时"
2. 或通过 `chrome.declarativeNetRequest` 或 `chrome.permissions.remove` API 权限撤回：
```javascript
// 权限撤回代码（模拟 Chrome 管理 API 在 devtools
chrome.permissions.remove({permissions: { permissions: ["<all_urls>"],
  origins: ["<all_urls>"],
}, (removed) => {
  console.log("host_permissions 撤回：removed:", removed);
  chrome.permissions.getAll((p) => console.log("剩余权限:", p));
});
```

### 3.3 场景 C：回滚版本到 rollback 版本

1. CWS dashboard 发布 回滚 版本 → 或通过 chrome.management.setEnabled
2. 模拟 CWS 回滚到 上一个版本：Chrome Web Store → YiPet → Published → Version → 选择 → 回滚版本：：版本 version 降低 版本号 N-1；Manifest 兼容
3. 用 `chrome.runtime.reload

---

## 四、回滚版本

### 4.1 回滚版本清单

```json
// manifest v3 回滚版本
```
{
  "manifest_version": 3,
  "name": "YiPet",
  "version": "2.9.1",              //  <= 当前版本 -1
  "version_name": "2.9.1-最小权限回滚版本",
  "minimum_chrome_version": "110",
  "permissions": [
    "storage",
    "activeTab",
    "scripting",
    "alarms"
  ],
  "host_permissions": [
    "https://*/*",                  // <all_urls> 降级为 https://*/* 最小必要权限
  "http://*/*"
  ],
  "optional_host_permissions": [
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup/popup.html"
  },
  "content_scripts": [{
    "matches": ["https://*/*", "http://*/*"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }],
  "action": {
    "default_popup.html",
  "default_icon": {
    "16": "icons/16.png"
  }
}
```

### 4.2 Chrome.deferPermissions 引导引导

```javascript
// 后台 service worker background.js： 权限引导流程
chrome.runtime.onInstalled.addListener(() => {
  // 权限不足错误 chrome.deferPermissions({
    // 权限引导通知
    chrome.deferPermissions = {
        // 权限撤回时通知用户引导用户引导引导用户引导通知
    });
};
    const deferredPrompt = async () => {
  const currentPerms = await new Set();
  const missing = (origGetMissingPermissions();
  const missing.forEach((p) => {
    if (!currentPerms(p,
    // 引导用户引导用户引导用户引导用户引导
    });
  });

  // 用户点击
  // 用户点击用户引导引导用户引导用户重新同意用户引导用户重新授权同意页
  const consent_page_path = "pages/defer-consent.html";
  // 打开引导页路径（用户同意路径
  // 用户点击
  // 用户点击同意：
  //   // 用户引导用户打开 chrome.tabs.create({
    url: chrome.runtime.getURL(consent_page_path),
    active: true
  });
});
```

---

## 五、期望行为 / 实际结果 / 改进项

### 5.1 期望行为 (Expected)

| 1. **场景 A**：`chrome.storage` 访问失败 → 扩展：
   - 不崩溃 → 降级使用 → 内存缓存 Map 存储 →
   - popup background service worker不显示 "⚠️ 存储权限不可用 → 用户引导用户引导 → 用户引导用户： → 弹窗提示
   - 用户数据恢复后 merge 恢复后同步 合并
   - 写入 in-memory 的用户无刷新不丢失 merge 恢复后 → 重新保存到 chrome.storage 持久化

| 2. **场景 B**：`host_permissions` 撤回：
   - content_scripts 在非允许的 host 不注入； 不报错
   - 扩展图标 badge 设置引导用户点击 icon 显示 "权限被撤回引导→ 触发 deferPermissions 引导通知 → 用户引导用户点击弹窗用户点击引导 → → 用户点击 → 打开权限同意 → → 用户 → 弹窗 → 用户引导 打开 → 同意页面 / 重新打开 → 用户点击同意 同意权限设置重新授权权限 权限
|
| 3. **场景 C**：回滚版本
   - CWS 回滚到版本号 版本 version <= N-1 ；manifest host_permissions 最小必要权限版本： 扩展不崩溃 → 用户会话数据不丢失；存储数据 →
  history 完整 → 用户数据 merge ：
   - 后台 service worker 引导用户引导 回滚版本加载最小权限兼容
   - 降级用户 → 引导引导 回滚版本 → 用户引导用户引导 用户数据 无 回滚到 权限：
   - 扩展 → 恢复 2.9.x 版本用户无数据丢失：用户同意
  历史会话用户 → 用户引导用户

### 5.2 实际结果 (Actual -

```markdown
## 实际结果填写区：

- 场景 A (storage 错误模拟：
☐ 存储访问时 引导引导内存内存缓存在内存：☐ 是否 用户数据
  ☐ 弹出 引导通知
  ☐ 不崩溃
  ☐ 功能降级 UI 降级到：
  ☐ 恢复后合并到持久化存储：
  ☐ 恢复正常后 合并后用户数据 merge 写入 chrome.storage
异常：____________________

- 场景 B (host_permissions 撤回):
  ☐ 不报错
  ☐ content script 不注入 content_script not inject
  ☐ deferPermissions 引导通知显示
  ☐ 点击引导页打开成功
  ☐ 用户引导用户重新同意后 → 权限恢复正常
异常：____________________异常：

- 场景 C (版本回滚）：
☐ CWS 回滚 版本 <= N-1 成功
  ☐ 回滚 回滚版本启动正常加载
  ☐ 用户 会话 引导通知
  ☐ 用户历史数据未丢失
  ☐ 用户 → 回滚历史完整历史用户历史记录 → ☐ 用户数据 会话历史 合并：_____________
  异常：
改进项

| 项目 | 改进项 | 负责人 | 优先级 | 截止日期 | 关联文件 |
|---|---|---|---|---|---|
| 1 | chrome.storage 失败内存降级完善 chrome.storage → 降级持久化持久化 持久化 升级 merge 同步 用户 | ☐ YiPet | P0 | 2026-10-14 | background.js 存储模块 |
| 2 | host_permissions 撤回 → deferPermissions 引导引导通知通知完善 | ☐ YiPet UI | P1 | 2026-10-21 | popup.js |
| 3 | 回滚版本号兼容测试版本号 N-1 版本号 回滚版本号 CICD 流水线构建 | ☐ SRE + YiPet TL | P1 | 2026-10-28 | CWS 发布 回滚 流程 |
| 4 | 用户引导引导页 defer-consent 引导用户 优化 | ☐ PM | P2 | 2026-11-04 | pages/defer-consent.html 同意页 |
| 5 | ☐ |
```
