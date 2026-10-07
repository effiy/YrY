---
title: "YiPot 前端体验修复（第五轮）— PRD"
tags: [PRD, YiPot, 前端, 音频, 截图, 生命周期, 错误处理]
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
prd_id: YP-09-68
doc_type: prd
roles: [engineer]
---

# YiPot 前端体验修复（第五轮）— PRD

> 编号：YP-09-68 · 优先级：P1 · 状态：已完成

---

## 一、需求背景

前四轮覆盖了 Rust 全量 unwrap 审计（R1-R3）和前端核心模块异常处理（R4）。本轮聚焦用户直接感知的功能缺陷：TTS 音频无法播放、截图失败静默卡死、模块级状态泄漏。

## 二、问题清单

| 问题 | 文件 | 严重度 | 用户感知 |
|------|------|--------|---------|
| AudioContext 模块级创建 + 无错误处理 | `useVoice.jsx` | **P0** | TTS 语音完全无法播放 |
| 截图失败静默卡死 | `Screenshot/index.jsx` | P2 | 截图空白不关闭 |
| 变量名冲突 | `Recognize/index.jsx` | P3 | 同 Translate 窗口模式 |
| 定时器生命周期 | `Backup/index.jsx` | P3 | 页面卸载后状态更新报错 |

## 三、验收标准

- [x] `useVoice.jsx` AudioContext 懒创建 + resume + 错误回调
- [x] `Screenshot/index.jsx` async/await + try/catch + null guard
- [x] `Recognize/index.jsx` 变量重命名
- [x] `Backup/index.jsx` refreshTimer → useRef
- [x] `pnpm build` 通过

## 四、关联文档

| 类型 | 文件 |
|------|------|
| 开发方案 | `../devs/2026-09/109-prd-task-前端体验修复第五轮.md` |
| 测试方案 | `../tests/2026-09/114-prd-test-前端体验修复第五轮.md` |
| Bug 020-023 | `../bugs/功能缺陷/020-023-*.md` |