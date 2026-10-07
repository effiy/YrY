---

doc_type: module
prd_task_id: "YP-08-03"
title: "YP-08-03: 安全合规 — CSP/MV3 合规 + Token 加密存储 + XSS 防护 + IPC 安全 + 最小权限 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202608"
estimate_frontend: 2.0
source_prd: "03-合规-安全合规.md"
source_okr: [yipet-001]

type: task
---

# YP-08-03: 安全合规 — 开发方案

> 来源 PRD：[03-合规-安全合规.md](../../prds/2026-08/03-合规-安全合规.md)
> 需求编号：YP-08-03 · 优先级：P0 · 人天：2.0d

---

## 一、方案概述

Chrome MV3 扩展面临 5 个安全威胁面。本方案针对每个威胁面进行加固，确保扩展通过 Chrome Web Store 审核并保护用户数据安全。

### 1.1 威胁模型

```
威胁面 1: 恶意网页 → window.postMessage 伪造 → Content Script
威胁面 2: AI 生成 Markdown → innerHTML → XSS 脚本执行
威胁面 3: Token 明文 → localStorage → 其他扩展/页面窃取
威胁面 4: eval() / 远程脚本 → CSP 违规 → 代码注入
威胁面 5: manifest 过度声明权限 → 用户隐私暴露
```

### 1.2 加固概览

| # | 加固项 | 措施 | 威胁面 |
|---|--------|------|--------|
| 1 | CSP 合规 | `script-src 'self'`，零 eval/inline/remote | 4 |
| 2 | Token 安全 | `chrome.storage.local` + `X-Token` 头 | 3 |
| 3 | IPC 安全 | IPC_SECRET + 时间戳 5s 窗口 | 1 |
| 4 | XSS 防护 | DOMPurify 清洗所有 Markdown → HTML | 2 |
| 5 | 最小权限 | manifest 仅声明 storage/activeTab/scripting | 5 |
| 6 | 生产构建 | 禁止 console.log 敏感数据 + sourcemap 外部化 | 3,4 |

---

## 二、核心模块设计

### 2.1 CSP 合规 (`manifest.json` + `rsbuild.config.ts`)

```json
// manifest.json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; base-uri 'self'; form-action 'self'"
  }
}
```

**合规动作**：
- 所有 vendor 库本地打包（vue、marked、echarts → `lib/` 目录）
- `eval()` → 重构为数据驱动逻辑
- 内联 `<script>` → 提取为独立 `.js` 文件
- 远程 CDN → 下载到本地 `cdn/` 目录，`web_accessible_resources` 声明

```typescript
// rsbuild.config.ts — CSP 合规构建
export default defineConfig({
  output: {
    filenameHash: false,         // MV3 引用固定文件名
  },
  tools: {
    rspack: {
      optimization: {
        splitChunks: false,      // SW 需单文件
      },
    },
  },
  // 禁止 sourcemap 内联到产物
  source: { sourceMap: false },
});
```

### 2.2 Token 安全 (`src/api/client.ts`)

```typescript
class ApiClient {
  private token: string | null = null;

  constructor(private baseUrl: string) {
    this.loadToken();
  }

  // Token 存储：chrome.storage.local（非 localStorage）
  private async loadToken(): Promise<void> {
    const result = await chrome.storage.local.get("token");
    this.token = result.token || null;
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
    await chrome.storage.local.set({ token });
  }

  async clearToken(): Promise<void> {
    this.token = null;
    await chrome.storage.local.remove("token");
  }

  // Token 传输：仅通过 X-Token 请求头
  async call(moduleName: string, methodName: string, parameters: Record<string, any>) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.token) {
      headers["X-Token"] = this.token;
    }
    // Token 不出现在 URL 参数中
    const response = await fetch(`${this.baseUrl}/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ module_name: moduleName, method_name: methodName, parameters }),
    });
    const json = await response.json();
    // 401 → 自动清除 token + 通知
    if (json.code === 4001) {
      await this.clearToken();
      // emit('auth-expired')
    }
    return json;
  }
}
```

### 2.3 IPC 安全 (`src/shared/ipc/secure-message.ts`)

```typescript
// 安装时生成唯一 secret
const IPC_SECRET = crypto.randomUUID();
const IPC_WINDOW_MS = 5_000; // 5s 防重放窗口

interface SecureMessage<T = unknown> {
  type: string;
  payload: T;
  meta: {
    timestamp: number;
    secret: string;
  };
}

// MAIN World → ISOLATED World（通过 window.postMessage）
function dispatchSecureEvent<T>(type: string, payload: T): void {
  const message: SecureMessage<T> = {
    type,
    payload,
    meta: {
      timestamp: Date.now(),
      secret: IPC_SECRET,
    },
  };
  window.postMessage(message, "*");
}

// 接收方验证
function isValidMessage(msg: SecureMessage): boolean {
  // 1. Secret 匹配
  if (msg.meta?.secret !== IPC_SECRET) return false;
  // 2. 时间戳在窗口内
  if (Date.now() - msg.meta.timestamp > IPC_WINDOW_MS) return false;
  return true;
}

// Content Script — ISOLATED World 监听
window.addEventListener("message", (event) => {
  const msg = event.data as SecureMessage;
  if (!isValidMessage(msg)) return; // 静默丢弃
  // 处理合法消息
  handleSecureMessage(msg.type, msg.payload);
});
```

### 2.4 XSS 防护 (`src/chat/components/MarkdownRenderer.vue`)

```typescript
import { marked } from "marked";
import DOMPurify from "dompurify";

// DOMPurify 配置：仅允许安全的 HTML 标签和属性
const PURIFY_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    "p", "br", "strong", "em", "u", "s", "del",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "a", "img",
    "code", "pre",
    "blockquote",
    "table", "thead", "tbody", "tr", "th", "td",
    "hr", "sup", "sub",
    "details", "summary",
  ],
  ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "id", "target"],
  ALLOW_DATA_ATTR: false,
};

function renderMarkdown(raw: string): string {
  const html = marked.parse(raw, { async: false }) as string;
  return DOMPurify.sanitize(html, PURIFY_CONFIG);
}
```

**防护层级**：
1. marked 转义 HTML 实体
2. DOMPurify 清洗所有标签和属性
3. `<script>`、`onerror`、`javascript:` URL 全部移除
4. `<iframe>`、`<object>`、`<embed>` 禁止

### 2.5 最小权限 (`manifest.json`)

```json
{
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": [],
  "optional_permissions": [],
  "web_accessible_resources": [{
    "resources": ["assets/*", "cdn/*"],
    "matches": ["<all_urls>"]
  }]
}
```

**设计原则**：
- `activeTab` 而非 `<all_urls>` — 仅在用户点击扩展时获得当前标签页权限
- `scripting` 而非 `tabs` — 仅注入脚本，不读取标签页列表
- `storage` — 持久化用户偏好和会话数据
- 不声明 `cookies`、`webRequest`、`webRequestBlocking`

---

## 三、实施步骤

| 步骤 | 内容 | 关键文件 | 验证 | 人天 |
|------|------|---------|------|------|
| 1 | CSP 合规：manifest + vendor 本地化 + eval 消除 | `manifest.json`, `rsbuild.config.ts` | `grep -r 'eval(' src/` 零匹配 | 0.5 |
| 2 | Token 安全：chrome.storage + X-Token 头 + 401 处理 | `client.ts` | localStorage 无 token，请求头含 X-Token | 0.25 |
| 3 | IPC 安全：IPC_SECRET + 时间戳 5s 窗口 | `secure-message.ts` | 无 secret 消息被静默丢弃 | 0.5 |
| 4 | XSS 防护：DOMPurify + marked 管道 | `MarkdownRenderer.vue` | `<script>alert(1)</script>` 被清洗 | 0.25 |
| 5 | 最小权限：manifest 审计 + permissions 精简 | `manifest.json` | 权限仅 3 项 | 0.25 |
| 6 | 安全审查 + 渗透测试 | — | 10 项渗透测试全通过 | 0.25 |

**合计：2.0d**

---

## 四、安全审查清单

### 代码层面
- [ ] `grep -r 'eval(' src/` 零匹配（含 `Function()` 动态执行）
- [ ] `grep -r 'innerHTML\s*=' src/content/` 零匹配
- [ ] `grep -r 'localStorage' src/` 仅允许在明确标注的非敏感场景
- [ ] `grep -r 'console.log.*token\|console.log.*secret\|console.log.*password' src/` 零匹配
- [ ] 所有 `fetch()` 调用经 ApiClient（`grep -r 'fetch(' src/ --include="*.vue"` 零匹配）
- [ ] `manifest.json` permissions 仅含 storage/activeTab/scripting

### 架构层面
- [ ] MAIN World 不使用 `chrome.*` API（仅通过 IPC 桥接）
- [ ] Content Script ISOLATED World 不信任 MAIN World 消息（secret 验证）
- [ ] Token 永不出现在 URL 参数或 console.log
- [ ] Markdown 渲染管道：marked → DOMPurify → DOM（不跳过任一环节）

---

## 五、完成定义

- [ ] CSP 合规：manifest CSP 不含 `unsafe-eval`/`unsafe-inline`，构建产物零 `eval()`
- [ ] Token 安全：chrome.storage.local 存储，X-Token 头传输，401 自动清除
- [ ] IPC 安全：每条消息含 IPC_SECRET + 时间戳，5s 窗口防重放
- [ ] XSS 防护：所有 Markdown 经 DOMPurify 清洗
- [ ] 最小权限：manifest.json 仅声明 3 项必需权限
- [ ] `tsc --noEmit` 零错误
- [ ] `npm run build` CSP 零违规
- [ ] 10 项渗透测试全部通过