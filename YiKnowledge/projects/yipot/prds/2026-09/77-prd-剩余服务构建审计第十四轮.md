---
title: "YiPot 剩余服务审计与构建审计（第十四轮）— PRD"
tags: [PRD, YiPot, 翻译引擎, 构建, null-safety]
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
prd_id: YP-09-77
doc_type: prd
roles: [engineer]
---

# YiPot 剩余服务审计与构建审计（第十四轮）— PRD

> 编号：YP-09-77 · 优先级：P2 · 状态：已完成

---

## 一、需求背景

完成最后一批翻译引擎审计（Caiyun/Niutrans），翻译引擎 config safety 审计覆盖达到 15/21。同步审计 patches/updater/build 基础设施。

## 二、修复项

| 问题 | 文件 | 严重度 |
|------|------|--------|
| config 无默认值 | `caiyun/index.jsx` | P3 |
| config 无默认值 | `niutrans/index.jsx` | P3 |
| Linux ARM URL 错误 | `updater/updater.mjs` | P3 (构建) |

## 三、基础设施审计

| 检查项 | 结论 |
|--------|------|
| `patches/hyprland.patch` | ✅ 已知 Hyprland 修复，已应用 |
| `updater/updater.mjs` | ⚠️ L37-39 Linux ARM 指向 Darwin URL |
| `.github/workflows/package.yml` | ✅ 标准 CI 构建 |

## 四、验收标准

- [x] Caiyun/Niutrans config 默认值
- [x] `pnpm build` 通过
- [x] 基础设施审计报告

## 五、关联文档

| 类型 | 文件 |
|------|------|
| 开发方案 | `../devs/2026-09/118-prd-task-剩余服务构建审计第十四轮.md` |
| 测试方案 | `../tests/2026-09/124-prd-test-剩余服务构建审计第十四轮.md` |
| Bug 038 | `../bugs/功能缺陷/038-caiyun-niutrans-updater-构建.md` |