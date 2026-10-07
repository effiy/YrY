---
title: "YiPot 服务层修复（第七轮）— PRD"
tags: [PRD, YiPot, 服务层, null-safety, 错误处理, 翻译引擎]
category: projects/yipot/prds
created: 2026-09-23
updated: 2026-09-23
source: internal
type: 需求
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
prd_id: YP-09-70
doc_type: prd
roles: [engineer]
---

# YiPot 服务层修复（第七轮）— PRD

> 编号：YP-09-70 · 优先级：P2 · 状态：已完成

---

## 一、需求背景

前六轮完成了 Rust unwrap 全量审计（R1-R3）和前端核心模块修复（R4-R6）。本轮深入翻译服务层，修复 Google/Baidu 两个高频引擎的 null safety 缺陷，并产出服务层错误处理规范指南。

## 二、修复项

| 问题 | 文件 | 严重度 |
|------|------|--------|
| 4 处深层嵌套数组访问无保护 | `google/index.jsx` | P2 |
| config 解构无 null 检查 | `baidu/index.jsx` | P2 |
| listener 未清理 | `Updater/index.jsx` | P3 |

## 三、验收标准

- [x] `pnpm build` 通过
- [x] Google 翻译响应解析全量 null safety
- [x] Baidu config 解构默认值
- [x] Updater useEffect cleanup
- [x] 服务层错误处理规范指南产出

## 四、关联文档

| 类型 | 文件 |
|------|------|
| 错误处理指南 | `../workflows/开发规范/08-规范-翻译服务错误处理.md` |
| Bug 025-027 | `../bugs/功能缺陷/025-027-*.md` |