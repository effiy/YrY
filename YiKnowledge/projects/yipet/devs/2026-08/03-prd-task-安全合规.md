---
doc_type: module
prd_task_id: "YP-08-05"
title: "YP-08-05: 安全合规 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiPet
prd_month: "202608"
source_prd: "03-合规-安全合规.md"
---

# YP-08-05: 安全合规 — 开发方案

> 需求编号：YP-08-05 · 优先级：P0

---

## 一、方案概述

安全合规加固：CSP 完善、数据加密存储、最小权限原则、XSS 防护。

### 加固项

| 项目 | 措施 |
|------|------|
| CSP | `script-src 'self'` ，禁止 eval/inline/remote |
| Token 存储 | `chrome.storage.local` 隔离，敏感数据加密 |
| IPC 安全 | IPC_SECRET + 时间戳 5s 过期 |
| XSS 防护 | DOMPurify 清洗用户输入/Markdown |
| 权限最小化 | manifest.json 仅声明必需权限 |
| MV3 合规 | 无远程代码、Service Worker 非持久化 |

### 安全审查清单

- [ ] CSP 无 `unsafe-eval` / `unsafe-inline`
- [ ] Token 存储在 chrome.storage（非 localStorage）
- [ ] IPC 消息签名 + 时间戳验证
- [ ] Markdown 渲染前 DOMPurify 清洗
- [ ] manifest 权限仅 activeTab/storage/scripting