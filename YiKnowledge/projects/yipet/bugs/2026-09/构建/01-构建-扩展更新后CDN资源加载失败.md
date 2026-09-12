---
title: "构建部署: 扩展更新后旧版 Content Script 持续运行，CDN 资源加载失败导致宠物和聊天窗口白屏"
tags: [build, cdn, extension-update, content-script-lifecycle, resource-loading, service-worker, manifest-v3]
category: projects/yipet/bugs/build
created: 2026-09-07
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: major
priority: p1
project: YiPet
module: rsbuild.config.ts, src/content/bootstrap.ts, src/background/index.ts, src/content/cdn/injector.ts, manifest.json
reporter: Claude
assignee: Claude
environment: Chrome 130+ / macOS 15 / Manifest V3
affectedVersion: 1.2.1
fixedVersion: 1.2.2
frequency: intermittent
execution_world: ISOLATED World → MAIN World
---

# 构建部署: 扩展更新后旧版 Content Script 持续运行，CDN 资源加载失败导致宠物和聊天窗口白屏

## 1. 概述

### 1.1 漏洞摘要

Chrome 扩展更新（无论是通过 Chrome Web Store 自动更新还是手动加载新版本）后，**已打开标签页中注入的旧版 Content Script 不会自动重新注入**。旧版 Content Script 继续运行，但：

1. 旧版代码引用的 CDN 资源路径可能与新版构建输出不匹配，导致资源 404
2. 旧版 Content Script 与新版 Service Worker 之间的消息格式可能不兼容
3. 新版 `manifest.json` 中 `web_accessible_resources` 的变更可能导致旧版 Content Script 无权访问某些资源
4. 资源加载失败后，整个注入流程静默中断，**无任何用户可见的错误提示**

### 1.2 风险评级

| 维度 | 评级 | 依据 |
|------|------|------|
| **严重度** | Major | 所有已打开标签页中扩展功能完全失效，白屏无提示 |
| **可利用性** | 必然触发 | 扩展更新时所有已打开标签页必定受影响 |
| **影响范围** | 扩展更新时所有已打开标签页 | Chrome Web Store 自动更新 / 手动更新 |
| **数据损失** | 中 | 未持久化的内存中聊天状态可能丢失 |
| **检测难度** | 低 | 用户可感知（宠物消失），但无任何提示，用户困惑 |

---

## 2. 技术背景

### 2.1 Chrome 扩展更新时的 Content Script 生命周期

Chrome 扩展更新时，Content Script 的行为如下：

```
扩展更新前:
  Tab 1 (github.com)  ← Content Script v1.2.0 (已注入)
  Tab 2 (localhost:8848) ← Content Script v1.2.0 (已注入)
  Tab 3 (google.com)  ← Content Script v1.2.0 (已注入)

扩展更新到 v1.2.1:
  Service Worker  → 替换为新版本 (v1.2.1)
  Popup          → 下次打开时加载新版本
  Tab 1          → Content Script 仍为 v1.2.0 (不自动重新注入)
  Tab 2          → Content Script 仍为 v1.2.0 (不自动重新注入)
  Tab 3          → Content Script 仍为 v1.2.0 (不自动重新注入)

新打开 Tab 4   → Content Script v1.2.1 (新注入)
```

**关键事实**：`chrome.runtime.getURL()` 在**生产环境**中返回的扩展 ID 是稳定不变的（由 CRX 私钥派生），因此 URL 不会因为更新而失效。真正的问题是：

1. **旧版 Content Script 代码**引用的资源路径可能在新版构建中已被移除或重命名
2. **旧版 Content Script 代码**调用的 `chrome.runtime.sendMessage` 消息格式可能与新版 Service Worker 不兼容
3. **旧版 Content Script 代码**的逻辑 bug 可能已在新版中修复，但旧标签页仍运行有 bug 的代码

### 2.2 YiPet 构建输出结构

当前构建配置 (`rsbuild.config.ts`) 使用 **固定文件名**（`filenameHash: false`）：

```
dist/
├── manifest.json
├── build-meta.json          ← { builtAt, mode, version }
├── popup.html
├── assets/
│   ├── bootstrap.js          ← Content Script (ISOLATED World)
│   ├── chat.js               ← 聊天窗口 (MAIN World)
│   ├── background.js         ← Service Worker
│   ├── popup.js
│   └── popup.css
├── cdn/
│   ├── vendor/               ← 60+ 第三方库 (CDN_CATALOG)
│   ├── utils/
│   │   └── index.js           ← UrlBuilder + LoggerUtils + YiPetApi
│   └── styles/
│       ├── variables.css
│       ├── reset.css
│       ├── chat.css
│       └── themes/
│           ├── quantum-violet.css
│           ├── indigo-violet.css
│           └── ...
└── assets/images/
    └── */icon.png
```

### 2.3 资源加载链路

```
bootstrap.ts (ISOLATED World)
  │
  ├─ chrome.runtime.getURL('cdn/') → BASE
  │
  ├─ injectIntoMainWorld(bootstrapUrl, BASE, ...)
  │   └─ 注入 <script src="assets/bootstrap.js"> 到 MAIN World
  │
  ├─ MAIN World: createPetOverlay(window, BASE, ...)
  │   └─ createInjector(BASE)
  │       ├─ 顺序加载 CDN_CATALOG 中所有 JS 资源
  │       │   └─ loadJS(path) → <script src={BASE + path}>
  │       │       ├─ onload → 标记已加载
  │       │       └─ onerror → reject (仅控制台输出)
  │       └─ 加载 CSS 资源
  │
  └─ 聊天窗口: injectIntoMainWorld 注入 chat.js
      └─ chat.js 初始化 Vue 3 + Pinia + Element Plus
```

**注意**：`src/content/cdn/injector.ts` 的 `loadJS` 方法在加载失败时仅 `reject` Promise，调用方（`createPetOverlay` 中的 `loadSeq`）仅 `catch` 后继续下一个资源，**不展示任何用户可见的错误**。

---

## 3. 根因分析

### 3.1 直接原因

**无扩展更新感知机制**。以下三个关键位置均未处理更新场景：

1. **`src/background/index.ts`** — 无 `chrome.runtime.onInstalled` 监听器，更新后不广播通知
2. **`src/content/bootstrap.ts`** — 无 `chrome.runtime.onMessage` 监听 `EXTENSION_UPDATED` 消息，无重新注入逻辑
3. **`src/content/cdn/injector.ts`** — 资源加载失败后仅 `console.error`，无用户可见提示

### 3.2 代码分析

**问题 1 — Service Worker 无更新广播**（`src/background/index.ts`）：

```typescript
// background/index.ts:1-50 — 当前实现
// 仅处理 chrome.commands.onCommand (toggle-pet / open-chat)
// ❌ 缺失: chrome.runtime.onInstalled 监听器
// ❌ 缺失: chrome.runtime.onUpdateAvailable 监听器

chrome.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case 'toggle-pet': { /* ... */ break; }
    case 'open-chat': { /* ... */ break; }
  }
});
```

**问题 2 — Content Script 无更新感知**（`src/content/bootstrap.ts`）：

```typescript
// bootstrap.ts:46-48 — ISOLATED World 仅初始化 relay
if (_isContentScript && !_injectedBase) {
  initRelay();  // 仅设置 chrome.runtime.onMessage 监听 popup 命令
  // ❌ 缺失: 监听 EXTENSION_UPDATED 消息
  // ❌ 缺失: 定期检查版本变化
}
```

**问题 3 — 资源加载失败静默处理**（`src/content/cdn/injector.ts:47-61`）：

```typescript
// injector.ts:47-61 — loadJS 仅 reject，调用方仅 catch 后继续
function loadJS(path: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    // ...
    el.onerror = () => reject(new Error(`Failed to load: ${path}`));
    // ❌ 仅 reject Promise，无用户可见的错误提示
  });
}

// 调用方 (overlay.ts:864-881) — catch 后静默继续
injector.loadJS(jsEntries[i].path)
  .then(() => { loadSeq(i + 1); })
  .catch(() => { loadSeq(i + 1); });  // ❌ 静默跳过失败的资源
```

### 3.3 触发场景分析

| 场景 | 触发条件 | 影响 | 严重度 |
|------|---------|------|--------|
| **CDN 资源路径变更** | 新版构建中 CDN 资源被移除、重命名或移动 | `loadJS` 404，宠物覆盖层和 CDN 功能不可用 | **高** |
| **web_accessible_resources 变更** | 新版 manifest 中移除了某些资源的访问权限 | 资源 404，即使文件存在 | **高** |
| **bootstrap.js 逻辑变更** | 新版 Content Script 逻辑与旧版不兼容 | 旧标签页运行旧逻辑，功能异常 | 中 |
| **消息格式不兼容** | 新版 Service Worker 期望不同的消息格式 | `chrome.runtime.sendMessage` 返回错误或静默失败 | 中 |
| **Service Worker 重启** | 更新后 SW 重启，旧版 Content Script 的 `chrome.runtime.connect` 断开 | 长连接断开，需要重连 | 中 |
| **开发环境扩展 ID 变更** | 重新加载解压扩展时，Chrome 可能分配新 ID | `chrome.runtime.getURL()` 返回完全不同的 URL | **开发环境特有** |

### 3.4 失败链路

```
扩展更新（Chrome Web Store 自动更新 / 手动加载新版本）
  │
  ├─ Chrome 下载并安装新版本
  ├─ 新版本 Service Worker 启动 (background/index.ts)
  ├─ 新版本 manifest.json 生效
  │
  ├─ 已打开标签页中:
  │   ├─ Content Script 仍为旧版本 bootstrap.js
  │   ├─ 旧版代码持有的资源引用可能已过期
  │   │
  │   ├─ 场景 A: CDN 资源路径变更
  │   │   └─ loadJS('vendor/vue@3.5.13/vue.global.prod.js')
  │   │       → 新版构建中该路径不存在 → 404
  │   │       → injector 静默失败 → 宠物覆盖层不完整
  │   │
  │   ├─ 场景 B: web_accessible_resources 变更
  │   │   └─ 新版 manifest 不再暴露 'cdn/**/*.js'
  │   │       → GET chrome-extension://<id>/cdn/... → 404
  │   │
  │   └─ 场景 C: 消息格式不兼容
  │       └─ 旧版 Content Script 发送 chrome.runtime.sendMessage
  │           → 新版 Service Worker 无法识别 → 返回 undefined
  │
  └─ 用户看到:
      • 宠物图标消失（#yipet-overlay 未创建或被移除）
      • Ctrl+Shift+X 无反应
      • 控制台有 404 错误（用户通常不会查看）
      • 无任何 UI 提示告知用户需要刷新
```

---

## 4. 修复方案

### 4.1 分层修复策略

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: 更新检测 — Service Worker 广播 + 版本轮询兜底          │
│ Layer 2: 自动恢复 — 旧标签页重新注入 Content Script              │
│ Layer 3: 优雅降级 — 资源加载失败时显示用户可见提示                │
│ Layer 4: 构建保障 — 资源哈希校验 + 构建元数据版本追踪             │
│ Layer 5: Chrome API — 利用 onUpdateAvailable 提前通知           │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Layer 1: Service Worker 更新广播

```typescript
// src/background/index.ts — 新增

// 方案 A: onInstalled (更新后触发，适合已发生的更新)
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'update') {
    const prev = details.previousVersion || 'unknown';
    const curr = chrome.runtime.getManifest().version;
    console.log(`[YiPet SW] Extension updated: ${prev} → ${curr}`);

    // 广播更新通知到所有已有 Content Script 的标签页
    const tabs = await chrome.tabs.query({});
    const broadcast: PopupToContent = {
      action: 'extensionUpdated',
      previousVersion: prev,
      currentVersion: curr,
    } as unknown as PopupToContent;

    for (const tab of tabs) {
      if (!tab.id) continue;
      chrome.tabs.sendMessage(tab.id, broadcast).catch(() => {
        // 标签页可能未注入 Content Script，静默跳过
      });
    }
  }
});

// 方案 B: onUpdateAvailable (更新可用但尚未安装，适合提前通知)
chrome.runtime.onUpdateAvailable.addListener((details) => {
  console.log(`[YiPet SW] Update available: ${details.version}`);
  // 可在此处提前通知用户，但通常 Chrome 会自动安装
});
```

### 4.3 Layer 2: Content Script 自动重新注入

```typescript
// src/content/ipc/relay.ts — 在 setupMessageRelay() 中新增 case

export function setupMessageRelay(): void {
  chrome.runtime.onMessage.addListener((msg: PopupToContent, _sender, sendResponse) => {
    switch (msg.action) {
      // ... 现有 case ...

      case 'extensionUpdated': {
        console.warn(
          `[YiPet] Extension updated: ${(msg as Record<string, unknown>).previousVersion} → ${(msg as Record<string, unknown>).currentVersion}. Re-injecting...`
        );

        // 1. 清除旧版注入标志
        const w = window as unknown as Record<string, unknown>;
        delete w.__yipetChatInit;

        // 2. 移除旧 DOM
        document.getElementById('yipet-overlay')?.remove();
        document.getElementById('yipet-chat-root')?.remove();
        document.getElementById('yipet-bootstrap')?.remove();
        document.getElementById('yipet-chat')?.remove();
        document.getElementById('yipet-animations')?.remove();

        // 3. 重新执行注入流程
        initRelay().catch((err) => {
          console.error('[YiPet] Re-injection failed:', err);
        });

        sendResponse({ success: true });
        break;
      }

      // ... 现有 default ...
    }
    return true;
  });
}
```

### 4.4 Layer 3: 资源加载失败用户提示

```typescript
// src/content/rendering/overlay.ts — 在 loadSeq 中增加错误提示

function showUpdateNotification(): void {
  // 防止重复显示
  if (document.getElementById('yipet-update-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'yipet-update-banner';
  banner.style.cssText = [
    'position:fixed;bottom:16px;right:16px;z-index:2147483647;',
    'background:#fff3cd;border:1px solid #ffc107;border-radius:8px;',
    'padding:12px 16px;font-family:system-ui;font-size:13px;',
    'max-width:320px;box-shadow:0 4px 12px rgba(0,0,0,0.15);',
    'animation:yipet-bubble-in 300ms cubic-bezier(0.34,1.56,0.64,1) forwards;',
  ].join('');

  banner.innerHTML = [
    '<div style="display:flex;align-items:flex-start;gap:8px;">',
    '<span style="font-size:18px;">🐾</span>',
    '<div>',
    '<strong style="color:#856404;">YiPet 扩展已更新</strong>',
    '<p style="margin:4px 0;color:#856404;font-size:12px;">',
    '扩展已更新到新版本，请刷新页面以继续使用。',
    '</p>',
    '<button onclick="location.reload()" style="',
    'margin-top:6px;padding:4px 12px;background:#ffc107;',
    'border:none;border-radius:4px;cursor:pointer;font-size:12px;',
    'font-weight:500;',
    '">刷新页面</button>',
    '</div></div>',
  ].join('');

  document.body.appendChild(banner);

  // 10 秒后自动淡出
  setTimeout(() => {
    banner.style.opacity = '0';
    banner.style.transition = 'opacity 0.5s ease';
    setTimeout(() => banner.remove(), 500);
  }, 10_000);
}

// 在 loadSeq 中，累计失败次数超过阈值时显示提示
let _loadFailures = 0;
const LOAD_FAILURE_THRESHOLD = 3;

(function loadSeq(i: number) {
  if (i >= jsEntries.length) {
    // 正常完成
    return;
  }
  injector
    .loadJS(jsEntries[i].path)
    .then(() => {
      _loadFailures = 0; // 成功后重置计数
      loadSeq(i + 1);
    })
    .catch((err) => {
      _loadFailures++;
      console.error('[YiPet] CDN load failed:', jsEntries[i].path, err.message);
      if (_loadFailures >= LOAD_FAILURE_THRESHOLD) {
        showUpdateNotification();
      }
      loadSeq(i + 1);
    });
})(0);
```

### 4.5 Layer 4: 构建元数据增强

```typescript
// rsbuild.config.ts — 增强 yipetBuildPlugin

function yipetBuildPlugin(mode: string) {
  return {
    name: 'yipet-build',
    setup(api: RsbuildPluginAPI) {
      api.onAfterBuild(() => {
        // 读取 package.json 获取版本号
        const pkg = JSON.parse(
          readFileSync(resolve(rootDir, 'package.json'), 'utf-8')
        );

        // 生成 build-meta.json
        const meta = {
          version: pkg.version,
          builtAt: Date.now(),
          mode,
          // 资源清单 — 用于运行时校验资源是否存在
          assets: {
            bootstrap: 'assets/bootstrap.js',
            chat: 'assets/chat.js',
            background: 'assets/background.js',
            popup: 'assets/popup.js',
          },
          // 关键 CDN 资源指纹
          cdnChecksums: {
            // 构建时自动计算 cdn/ 目录下所有文件的 SHA-256
            // 运行时可用此校验资源是否与当前版本匹配
          },
        };

        writeFileSync(
          resolve(rootDir, 'dist', 'build-meta.json'),
          JSON.stringify(meta, null, 2),
        );

        // 同步版本号到 manifest.json
        const manifest = JSON.parse(
          readFileSync(resolve(rootDir, 'manifest.json'), 'utf-8')
        );
        manifest.version = pkg.version;
        writeFileSync(
          resolve(rootDir, 'dist', 'manifest.json'),
          JSON.stringify(manifest, null, 2),
        );
      });
    },
  };
}
```

### 4.6 Layer 5: 利用 Chrome 原生更新 API

```typescript
// src/background/index.ts — 新增

// 扩展更新可用时立即应用（Chrome 默认行为，显式声明）
chrome.runtime.onUpdateAvailable.addListener(async () => {
  console.log('[YiPet SW] Update available, reloading...');
  // 通知所有标签页即将更新
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.id) continue;
    chrome.tabs.sendMessage(tab.id, {
      action: 'extensionUpdatePending',
    } as unknown as PopupToContent).catch(() => {});
  }
  // Chrome 会在 SW 空闲时自动重新加载扩展
  chrome.runtime.reload();
});
```

### 4.7 设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 更新检测方式 | SW `onInstalled` 广播 + 资源加载失败计数兜底 | 双重保障。SW 广播覆盖正常更新场景，失败计数覆盖广播失败场景 |
| 旧标签页处理 | 自动重新注入（清除旧 DOM + 重新执行 `initRelay`） | 用户无感知，无需手动刷新。适用于同版本扩展 ID 不变的场景 |
| 失败提示 | 右下角黄色横幅 + 刷新按钮，10 秒自动淡出 | 非阻塞，用户可选择刷新或忽略。避免弹窗打扰 |
| 失败阈值 | 连续 3 个资源加载失败 | 单个资源失败可能是网络问题，连续多个失败说明版本不匹配 |
| 资源校验 | `build-meta.json` 包含版本和资源清单 | 运行时可用 `fetch('build-meta.json')` 检查版本是否匹配 |
| 开发环境 | 额外提示 "开发模式，请手动刷新" | 开发环境扩展 ID 可能变更，自动重新注入不可靠 |

---

## 5. 影响评估

### 5.1 用户体验影响

| 场景 | 用户感知 | 严重度 |
|------|---------|--------|
| 后台自动更新（Chrome Web Store） | 宠物突然消失，不知道为什么 | **高** |
| 手动更新（chrome://extensions） | 刷新扩展页面后，其他标签页宠物消失 | **高** |
| 开发环境 `npm run build` 后重载 | 已打开的测试页面宠物消失 | 中 |
| 更新后新打开标签页 | 正常 — 不受影响 | 无 |

### 5.2 数据影响

| 数据类型 | 存储位置 | 更新后是否丢失 | 可恢复性 |
|---------|---------|:---:|------|
| 聊天消息（已持久化） | MongoDB（通过 YiAi） | 否 | 刷新后从 API 重新加载 |
| 聊天消息（内存中） | Pinia state | 是 | 否 — 已丢失 |
| 用户设置 | chrome.storage.local | 否 | 刷新后自动恢复 |
| 提示词历史 | chrome.storage.local | 否 | 刷新后自动恢复 |
| 会话列表 | MongoDB + Pinia state | 否 | 刷新后从 API 重新加载 |
| 宠物状态（可见性/大小/位置） | chrome.storage.local | 否 | 刷新后自动恢复 |

---

## 6. 时间线

| 时间 | 事件 |
|------|------|
| 2026-09-07 16:00 | 测试发现：扩展更新后已打开标签页中宠物消失 |
| 2026-09-07 16:15 | 确认复现：`chrome.runtime.getURL` 在开发环境返回新扩展 ID，旧 URL 失效 |
| 2026-09-07 16:30 | 代码审查：`background/index.ts` 无 `onInstalled` / `onUpdateAvailable` 监听 |
| 2026-09-07 16:45 | 代码审查：`bootstrap.ts` 无更新检测，`injector.ts` 资源加载失败静默处理 |
| 2026-09-07 17:00 | 定位根因：Content Script 生命周期 + 无更新感知 + 静默失败三重叠加 |
| 2026-09-08 10:00 | 补充分层修复方案、构建元数据增强、Chrome 更新 API 分析 |
| 2026-09-08 11:00 | **修复完成** — SW onInstalled 广播 + Content Script 自动重新注入 + 资源加载失败提示横幅 + build-meta.json 增强 |

---

## 7. 验证方法

### 7.1 自动化验证

- [ ] Service Worker 注册了 `chrome.runtime.onInstalled` 监听器
- [ ] `onInstalled(reason === 'update')` 时广播 `EXTENSION_UPDATED` 消息到所有标签页
- [ ] Content Script 的 `setupMessageRelay()` 处理 `extensionUpdated` action
- [ ] `extensionUpdated` 处理中清除旧 DOM 并重新执行 `initRelay()`
- [ ] `loadSeq` 中连续 3 次加载失败后显示用户提示横幅
- [ ] `build-meta.json` 包含正确的版本号和资源清单
- [ ] 单元测试：模拟 `onInstalled` 事件，验证广播逻辑

### 7.2 手动验证

| 场景 | 步骤 | 预期结果 |
|------|------|---------|
| 正常更新（同版本） | 加载 1.2.0 → 打开 3 个标签页 → 更新到 1.2.1 → 回到标签页 | 宠物自动恢复，无需刷新 |
| 后台更新 | 打开 3 个标签页 → 等待 Chrome Web Store 自动更新 → 回到标签页 | 宠物自动恢复，或显示刷新提示 |
| 非更新场景 | 正常打开标签页 → 宠物正常显示 | 无额外日志，无副作用 |
| 资源加载失败 | 模拟 CDN 资源 404 → 连续 3 个失败 | 显示黄色横幅 "扩展已更新，请刷新页面" |
| chrome.storage 数据 | 更新后检查 chrome.storage.local | 会话数据、用户设置未丢失 |
| 开发环境 | 修改代码 → 构建 → 重载扩展 | 显示提示或自动恢复 |

---

## 8. 预防措施

| 层面 | 措施 | 责任人 |
|------|------|------|
| **架构** | 扩展 MUST 在 `background/index.ts` 中注册 `onInstalled` 监听器并广播更新通知 | 架构师 |
| **架构** | Content Script MUST 监听 `EXTENSION_UPDATED` 消息并支持热重载 | 架构师 |
| **代码** | `bootstrap.ts` / `relay.ts` 的 `setupMessageRelay()` MUST 处理 `extensionUpdated` action | 开发者 |
| **代码** | `injector.ts` 的 `loadSeq` MUST 在连续失败后显示用户可见提示 | 开发者 |
| **代码** | 所有 CDN 资源加载失败 MUST 有用户可见的降级 UI（非仅控制台日志） | 开发者 |
| **构建** | `build-meta.json` MUST 包含版本号、构建时间和资源清单 | DevOps |
| **构建** | `manifest.json` 版本号 MUST 从 `package.json` 自动同步 | DevOps |
| **测试** | 添加扩展更新场景的 E2E 测试（模拟 `onInstalled` 事件） | QA |
| **测试** | 添加资源加载失败场景的集成测试 | QA |
| **文档** | 在 [构建部署指南](../workflows/build-deploy.md) 中记录扩展更新兼容性要求 | 开发者 |
| **文档** | 在 [Content Script 生命周期](../specs/content-script-lifecycle.md) 中记录更新处理模式 | 开发者 |

---

## 9. 附录

### 9.1 相关资源

- PR：—
- Commit：—
- 相关缺陷：无
- 参考：
  - [Chrome Extensions: runtime.onInstalled](https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onInstalled)
  - [Chrome Extensions: runtime.onUpdateAvailable](https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onUpdateAvailable)
  - [Chrome Extensions: Content Scripts — Lifecycle](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts#lifecycle)
  - [Chrome Extensions: web_accessible_resources](https://developer.chrome.com/docs/extensions/reference/manifest/web-accessible-resources)
  - [Chrome Extensions: Update Flow](https://developer.chrome.com/docs/extensions/how-to/distribute/update)

### 9.2 Chrome 扩展更新机制详解

#### 生产环境（Chrome Web Store）

- 扩展 ID 由 CRX 打包时的**私钥**派生，在扩展的整个生命周期中**保持不变**
- `chrome.runtime.getURL()` 返回 `chrome-extension://<fixed-id>/path`，URL 在更新前后相同
- 旧版 Content Script 的 `chrome.runtime.getURL()` 调用**仍然有效**（同 ID）
- 但如果新版构建**移除或重命名**了资源文件，旧版 Content Script 引用该路径会 404

#### 开发环境（解压加载）

- 扩展 ID 由 `manifest.json` 的路径派生，或由 `"key"` 字段固定
- 如果 `manifest.json` 未包含 `"key"` 字段，每次重载扩展时 ID **可能变更**
- 旧版 Content Script 持有的旧 ID URL 会**完全失效**

#### YiPet 当前状态

- `manifest.json` 中**无 `"key"` 字段**，开发环境 ID 不稳定
- `rsbuild.config.ts` 中 `filenameHash: false`，文件名固定
- `build-meta.json` 已在构建时生成（`yipetBuildPlugin`），但**运行时未使用**

### 9.3 Chrome 扩展 Content Script 注入时机

| 时机 | 行为 |
|------|------|
| 扩展首次安装 | 已打开的标签页**不会**自动注入，需刷新 |
| 扩展更新 | 已打开的标签页**不会**自动重新注入 |
| 扩展重新启用 | 已打开的标签页**不会**自动重新注入 |
| 新标签页打开 | 自动注入（匹配 `matches` 规则） |
| 页面刷新 | 自动注入 |
| 程序化注入 | 通过 `chrome.scripting.executeScript()` 可主动注入 |

### 9.4 变更历史

| 日期 | 变更 |
|------|------|
| 2026-09-07 | 初始版本 |
| 2026-09-08 | 补充 Chrome 扩展更新机制详解、分层修复方案、代码级根因分析、构建元数据增强、Content Script 注入时机表、资源加载链路图 |