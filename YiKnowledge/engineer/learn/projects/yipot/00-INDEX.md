---
title: YiPot Engineering — INDEX
tags: [index, yipot, navigation]
category: engineer/learn/projects/yipot
created: 2026-10-07
updated: 2026-10-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Navigate YiPot project documentation"
related:
  - ../../../engineer/projects/0005-项目-YiPot项目.md
  - ../../INDEX.md
---

# YiPot — 项目索引

> Tauri 1.6 + Rust 后端 + React 18 前端。跨平台桌面翻译应用，支持划词翻译、OCR 截图识别、TTS 朗读、生词本、20+ 翻译服务接入。

## 核心文档

| 文档 | 用途 | 适合人群 |
|---|---|---|
| [01-架构设计](./01-项目-架构设计.md) | 技术栈全景、分层架构、关键数据流、三端降级策略 | 所有开发者 |
| [02-开发规范](./02-项目-开发规范.md) | 命名约定、分层纪律、插件三件套规范、错误处理、配置管理 | 开发者 |
| [03-功能模块](./03-项目-功能模块.md) | 8 大前端窗口 + 11 个 Rust 模块 + 4 类 30+ 服务插件完整清单 | 开发者 |
| [04-新人入职指南](./04-新人入职指南-5天上手路线图.md) | **5 天上手路线图**（Day1 启动 → Day5 提 PR） | 新人 / Mentor |

## 用户故事

| 故事 | 领域 | 状态 |
|---|---|---|
| （待补充） | — | — |

## 架构决策记录（ADR）

| ADR | 状态 | 说明 |
|---|---|---|
| （待补充） | — | — |

## 跨项目链接

- [YiPot CLAUDE.md](../../../../../YiPot/CLAUDE.md) — 实时项目档案（模块边界、约束、近期变更）
- [插件协议](../../build/006-构建-跨项目RPC协议设计.md) — 插件 info.ts 规范、参数名契约
- [产品管理](../../../product/projects/yipot/01-项目-管理.md) — 迭代节奏、交付物、里程碑
- [品牌替换指南](../../run/01-入职-YiPot入职.md) — 新人第一天快速上手

## 快速导航

### 我是 YiPot 新人开发者

1. 先读 [5 天上手路线图](./04-新人入职指南-5天上手路线图.md) 完成 Rust + Node 环境搭建（最详细）
2. 再读 [架构设计](./01-项目-架构设计.md) 理解 Tauri 前后端分离架构
3. 然后读 [开发规范](./02-项目-开发规范.md) 了解关键约束（unwrap 禁令、分层纪律、插件三件套）
4. 最后查 [功能模块](./03-项目-功能模块.md) 定位你要修改的窗口或 Rust 模块
