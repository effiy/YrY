---
title: "YiPot 前端健壮性修复（第四轮）— PRD"
tags: [PRD, YiPot, 前端, 错误处理, 状态管理, API超时]
category: projects/yipot/prds
created: 2026-09-23
updated: 2026-09-23
source: internal
type: 需求
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
prd_id: YP-09-67
doc_type: prd
roles: [engineer]
---

# YiPot 前端健壮性修复（第四轮）— PRD

> 编号：YP-09-67 · 优先级：P1 · 状态：已完成

---

## 一、需求背景

前三轮（PRD 60/65/66）完成了 Rust 后端 14 个源文件的 `unwrap`/`expect` 审计。本轮转向前端代码质量：语言检测异常处理、模块级状态管理、API 客户端超时控制。

## 二、问题清单

| 问题 | 文件 | 严重度 | 影响 |
|------|------|--------|------|
| 7 个 API 检测函数无 try/catch | `lang_detect.js` | **P1** | 断网时未处理 Promise 拒绝，UI 无反馈 |
| `new String()` 反模式 | `lang_detect.js` | P3 | 无功能影响，代码质量 |
| 变量名冲突 — 插件重载监听器未注册 | `Translate/index.jsx` | P2 | 安装插件后翻译窗口不刷新 |
| `get()`/`post()` 无超时控制 | `api/client.ts` | P2 | 网络异常时请求无限挂起 |
| `get()`/`post()` signal 未清理 | `api/client.ts` | P3 | 微小内存泄漏 |

## 三、验收标准

- [x] `lang_detect.js` 全部 7 个函数包裹 try/catch，异常时返回 `'en'`
- [x] `niutrans_detect` 中 `new String()` 替换为 `String()`
- [x] `Translate/index.jsx` 变量名冲突修复，插件重载监听器独立变量
- [x] `api/client.ts` `get()`/`post()` 补齐超时 + signal 清理
- [x] `pnpm build` 通过

## 四、关联文档

| 类型 | 文件 |
|------|------|
| 开发方案 | `../devs/2026-09/108-prd-task-前端健壮性修复第四轮.md` |
| 测试方案 | `../tests/2026-09/113-prd-test-前端健壮性修复第四轮.md` |
| Bug 017 | `../bugs/功能缺陷/017-lang-detect-未处理promise拒绝.md` |
| Bug 018 | `../bugs/功能缺陷/018-translate-变量名冲突-插件监听器未注册.md` |
| Bug 019 | `../bugs/功能缺陷/019-api-client-get-post-缺超时.md` |