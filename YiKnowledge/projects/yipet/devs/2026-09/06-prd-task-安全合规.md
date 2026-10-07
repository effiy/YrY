---

doc_type: module
prd_task_id: "YP-09-06"
title: "YP-09-06: 安全合规 — CSP 加固 + Privacy Manifest + 权限最小化 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 3.0
source_prd: "13-合规-安全配置.md"
source_okr: [yipet-001]

type: task
---

# YP-09-06: 安全合规 — 开发方案

> 来源 PRD：[13-合规-安全配置.md](../../prds/2026-09/13-合规-安全配置.md)
> 需求编号：YP-09-06 · 优先级：P1 · 人天：3.0d

---

## 一、方案概述

为通过 Chrome Web Store 审核，需完成三项安全加固：CSP 配置（`script-src 'self'` + `object-src 'none'` + `connect-src` 白名单）、Privacy Manifest 数据用途声明、权限最小化（移除未使用的 `tabs`/`webRequest`）。

### 威胁模型

```
威胁 1: 恶意页面 postMessage 伪造 → IPC_SECRET 拦截
威胁 2: AI Markdown → innerHTML → DOMPurify 清洗
威胁 3: Token 明文 localStorage → chrome.storage.local
威胁 4: eval()/远程脚本 → CSP script-src 'self'
威胁 5: 权限过度声明 → 最小权限原则
```

---

## 二、核心改动

### 2.1 CSP 配置 (`manifest.json`)

```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'none'; connect-src http://localhost:10086 ws://localhost:10086"
}
```

| 指令 | 值 | 说明 |
|------|-----|------|
| `script-src` | `'self'` | 仅扩展自身脚本，禁止 eval/inline/remote |
| `object-src` | `'none'` | 禁止 Flash/Java 插件 |
| `connect-src` | `localhost:10086` | 仅 YiAi 后端 + WebSocket (HMR 开发) |

### 2.2 权限最小化

```diff
"permissions": [
  "storage",
  "scripting"
- "tabs",
- "webRequest"
],
- "host_permissions": ["<all_urls>"],
+ "host_permissions": ["http://localhost:10086/*"],
```

### 2.3 Privacy Manifest (`privacy-manifest.json`)

```json
{
  "data_collection": {
    "chrome_storage": {
      "purpose": "存储用户偏好设置和会话缓存",
      "data_type": "用户配置、会话元数据、提示词历史",
      "retention": "本地存储，卸载扩展时自动清除"
    },
    "network": {
      "purpose": "与 YiAi 后端通信提供 AI 聊天和知识库检索",
      "endpoints": ["localhost:10086"],
      "encryption": "开发环境 HTTP，生产环境 HTTPS"
    }
  }
}
```

---

## 三、实施步骤

| 步骤 | 内容 | 关键文件 | 验证 | 人天 |
|------|------|---------|------|------|
| 1 | CSP 配置 + vendor 本地化确认 | `manifest.json` | 零 eval/inline/remote | 0.5 |
| 2 | 权限最小化 (移除 tabs/webRequest) | `manifest.json` | permissions 仅 2 项 | 0.5 |
| 3 | Privacy Manifest 编写 | `privacy-manifest.json` | 数据用途完整声明 | 0.5 |
| 4 | XSS 防护验证 (DOMPurify + marked) | `MarkdownRenderer.vue` | `<script>` 标签被清洗 | 0.5 |
| 5 | Token 安全验证 | `client.ts` | chrome.storage + X-Token | 0.25 |
| 6 | CWS 审核自查 10 项 | — | 10/10 通过 | 0.5 |
| 7 | 构建 + 回归验证 | — | build CSP 零违规 | 0.25 |

**合计：3.0d**

## 四、CWS 审核自查清单

- [ ] CSP `script-src 'self'` 无 unsafe-eval/unsafe-inline
- [ ] CSP `object-src 'none'`
- [ ] CSP `connect-src` 白名单仅 YiAi 端点
- [ ] permissions 仅 storage/scripting
- [ ] host_permissions 仅 localhost:10086 (fetch 用)
- [ ] Privacy Manifest 数据用途完整
- [ ] 无远程代码执行 (所有 vendor 本地打包)
- [ ] `content_scripts.matches` 保留 `<all_urls>` (宠物注入需要，Privacy Manifest 中解释)
- [ ] 生产 HTTPS (待生产环境)
- [ ] 无第三方数据共享

## 五、完成定义

- [ ] CSP 零 unsafe-eval/unsafe-inline
- [ ] permissions 仅 storage + scripting
- [ ] Privacy Manifest 完整
- [ ] CWS 审核自查 10/10 通过
- [ ] `npm run build` CSP 零违规
- [ ] `tsc --noEmit` 零错误