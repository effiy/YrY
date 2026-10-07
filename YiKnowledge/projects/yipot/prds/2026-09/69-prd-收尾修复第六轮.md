---
title: "YiPot 收尾修复（第六轮）— PRD"
tags: [PRD, YiPot, 前端, 生命周期, 代码质量]
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
prd_id: YP-09-69
doc_type: prd
roles: [engineer]
---

# YiPot 收尾修复（第六轮）— PRD

> 编号：YP-09-69 · 优先级：P2 · 状态：已完成

---

## 一、需求背景

完成最后一批模块级状态泄漏修复 + 代码质量审计。本轮同时产出代码质量审计报告，为后续主版本重构提供参考。

## 二、修复项

| 问题 | 文件 | 严重度 |
|------|------|--------|
| 模块级 `timer` 生命周期 | `General/index.jsx` | P3 |
| resize listener 未清理 | `WindowControl/index.jsx` | P3 |

## 三、验收标准

- [x] `General/index.jsx` timer → useRef
- [x] `WindowControl/index.jsx` listener cleanup
- [x] `pnpm build` 通过
- [x] 代码质量审计报告产出

## 四、关联文档

| 类型 | 文件 |
|------|------|
| 代码质量审计 | `../architecture/code-quality-audit.md` |
| Bug 024 | `../bugs/功能缺陷/024-general-timer-windowcontrol-listener.md` |