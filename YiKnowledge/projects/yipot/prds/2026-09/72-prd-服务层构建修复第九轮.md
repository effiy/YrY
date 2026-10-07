---
title: "YiPot 服务层与构建修复（第九轮）— PRD"
tags: [PRD, YiPot, 服务层, tts, collection, 构建修复]
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
prd_id: YP-09-72
doc_type: prd
roles: [engineer]
---

# YiPot 服务层与构建修复（第九轮）— PRD

> 编号：YP-09-72 · 优先级：P1 · 状态：已完成

---

## 一、需求背景

第八轮安全审计完成后，继续深入未覆盖的服务模块（TTS/生词本），发现 config 解构和错误处理缺陷。同时发现 History 页面的 TypeScript 语法导致构建失败。

## 二、问题清单

| 问题 | 文件 | 严重度 | 影响 |
|------|------|--------|------|
| History.tsx 语法导致构建失败 | `History/index.jsx` | **P0** | 项目无法构建 |
| TTS config 解构 + HTTP 错误静默 | `tts/lingva/index.jsx` | P2 | TTS 配置缺失时崩溃 |
| Eudic/Anki config 解构无默认值 | `collection/{eudic,anki}/index.jsx` | P3 | 生词本配置缺失时崩溃 |

## 三、验收标准

- [x] `pnpm build` 通过
- [x] History 页面 TypeScript 类型注解移除
- [x] TTS lingva config 默认值 + try/catch
- [x] Eudic/Anki config 默认值

## 四、关联文档

| 类型 | 文件 |
|------|------|
| 开发方案 | `../devs/2026-09/113-prd-task-服务层构建修复第九轮.md` |
| 测试方案 | `../tests/2026-09/118-prd-test-服务层构建修复第九轮.md` |
| Bug 029-031 | `../bugs/功能缺陷/029-031-*.md` |