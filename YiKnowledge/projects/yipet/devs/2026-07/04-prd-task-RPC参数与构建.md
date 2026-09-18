---
doc_type: module
prd_task_id: "YP-07-04"
title: "YP-07-04: RPC 参数名契约修复 + 构建兼容性 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiPet
project_id: yipet
prd_month: "202607"
estimate_frontend: 1.0
source_prd: "04-缺陷修复-RPC参数与构建.md"
source_okr: [yipet-001]
---

# YP-07-04: RPC 参数名契约修复 + 构建兼容性 — 开发方案

> 需求编号：YP-07-04 · 优先级：P2 · 人天：1.0d

---

## 一、方案概述

修复 YiPet 中与 YiAi RPC 契约不一致的参数名问题，以及 Rsbuild 构建配置的兼容性问题。

### 参数名契约修复

| 文件 | 错误用法 | 正确用法 | 影响 |
|------|---------|---------|------|
| API 调用 | `{ query: {...} }` | `{ filter: {...} }` | 后端静默忽略 → 返回空列表 |
| 文件读写 | `{ path: "/x.md" }` | `{ target_file: "/x.md" }` | 后端返回 422 |
| 集合名 | `{ collection_name: "x" }` | `{ cname: "x" }` | 后端参数校验失败 |

### 构建兼容性修复

| 问题 | 修复 |
|------|------|
| Chat Window 构建文件名含哈希 | `filenameHash: false` |
| Service Worker 代码分割 | 禁用 splitChunks |
| CDN 资源未声明可访问 | `web_accessible_resources` 添加 cdn/* |

---

## 二、文件清单

| 文件 | 类型 | 职责 |
|------|------|------|
| `src/api/services/*.ts` | 修改 | 参数名 query→filter, path→target_file |
| `rsbuild.config.chat.ts` | 修改 | filenameHash: false |
| `rsbuild.config.ts` | 修改 | web_accessible_resources |
| `manifest.json` | 修改 | web_accessible_resources 声明 |

---

## 三、实施步骤

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | 全局搜索替换参数名 | `rg "query:" src/api` 零结果 | 0.25 |
| 2 | 构建配置修复 | `npm run build` 成功，CDN 资源 200 | 0.25 |
| 3 | 端到端验证 | API 调用正常，数据正确返回 | 0.5 |

**合计：1.0d**

---

## 四、完成定义（DoD）

- [ ] `rg "query:" src/api` 零结果
- [ ] `rg "path:" src/api/services` 零结果
- [ ] `npm run build` 成功，扩展加载正常
- [ ] Chat Window CDN 资源 200