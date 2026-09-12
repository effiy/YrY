---
title: "ADR: YiPet React 18 + Ant Design 5 Migration"
tags: [adr, yipet, react, ant-design, migration, stack]
category: leader/decisions/yipet
created: 2026-08-24
updated: 2026-09-10
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "理解 React 15→18 + Bootstrap→Ant Design 5 迁移决策——为什么在技术栈升级中还要同时替换 UI 框架"
related:
  - ../../../engineer/learn/projects/yipet/README.md
  - ../../../engineer/learn/projects/yipet/01-项目-架构设计.md
  - ./biome-lint-format.md
---

# ADR: YiPet React 18 + Ant Design 5 迁移

> **状态**：已接受 (2026-07-28) — 已实施

## 上下文

YiPet 此前基于 React 15 和 Bootstrap CSS 构建弹出控制面板和聊天窗口。这个技术组合存在多个问题：

- React 15 已停止维护——缺乏 Hooks 支持（所有组件是类组件），无法使用 React 18 的并发特性
- Bootstrap 的 jQuery 依赖与 Chrome MV3 的内容安全策略冲突——MV3 禁止内联脚本和外部脚本的 `eval`
- 类组件模式积累了显著的技术债务——状态逻辑分散在生命周期方法中，难以复用

**改造时机**：YiPet 正在进行功能扩展（聊天、跨项目桥接、缺陷报告），代码库增长迅速。如果现在不升级，未来的迁移成本将更高。这是一个"现在做或者将来付出更多"的决策。

## 决策

**从 React 15 + Bootstrap 迁移到 React 18.3 + Ant Design 5.21，同一次迁移中也用 Biome 2.5 替换 ESLint + Prettier。**

### 变更详情

- **React 15 → React 18.3**：所有类组件重写为函数组件 + Hooks。使用 `createRoot` API 替换 `ReactDOM.render`。并发特性可用但尚未使用（为将来预留能力）。
  
  关键迁移点：
  - `class ChatPanel extends Component` → `function ChatPanel()`
  - `this.state` / `this.setState` → `useState`
  - `componentDidMount` / `componentDidUpdate` → `useEffect`
  - `this.props` → 函数参数解构

- **Bootstrap → Ant Design 5.21**：弹出面板和聊天界面使用 Ant Design 组件重建。`ConfigProvider` 实现主题切换，`Tree` 组件用于知识浏览器，`Modal`/`Button`/`Input` 等组件替换 Bootstrap 对应物。Ant Design 5 的 CSS-in-JS token 系统替代 Bootstrap 的全局 CSS，解决了 MV3 CSP 下的样式注入问题。

- **ESLint + Prettier → Biome 2.5**：基于 Rust 的代码检查器/格式化器加速 CI 运行。配置集中在 `biome.json` 中。

- **CDN 目录更新**：`public/cdn/vendor/` 下 80+ 厂商库更新——React 18.3.1、ReactDOM 18.3.1、dayjs 1.11.21、antd 5.21.x 打包为本地文件以满足 MV3 CSP 合规要求。

## 后果

### 正面影响
- Hooks 使代码复用成为可能（自定义 hooks 如 `useChat`、`useSessions`）
- Ant Design 提供一致的组件 API——Bootstrap 的自由度现在被可控的组件规范替代
- Biome 比 ESLint 快得多——CI 检查时间显著缩短

### 负面影响
- chat 打包必须使用 `--mode production` 以避免 `jsxDEV is not a function` 错误（开发模式下的 jsxDEV 引用在 CDN 加载中不兼容）
- CDN 目录必须与 npm 版本同步——React 和 ReactDOM 版本不匹配会导致整个扩展崩溃
- 技术栈迁移是一次性的大变更——如果有遗漏，影响范围是全局的

### 风险
- 80+ 厂商库的版本对齐是手动的——React 和 ReactDOM 之间的单次不匹配就会破坏整个扩展
- CDN 加载顺序至关重要——React 必须在 ReactDOM 之前加载，Ant Design 必须在两者之后加载

## 替代方案

1. **React 18 + 保留 Bootstrap** — 拒绝。理由：Bootstrap 的 jQuery 依赖违反 MV3 CSP 且类组件模式缺乏 Hooks 优势
2. **Preact + Ant Design** — 拒绝。理由：Preact 的 React 兼容层为 CDN 注入架构增加风险；原生 React 18 更可靠
3. **保留 ESLint** — 拒绝。理由：Biome 的 Rust 解析器快 10-20 倍，对多入口 Rsbuild 构建至关重要

## 适用场景

- 老旧前端项目的技术栈升级决策参考
- MV3 Chrome 扩展的 UI 框架选择约束考量
- 理解团队如何在技术债积累到临界点前主动升级

## 常见问题

**Q: 为什么不在同一次迁移中切换到 Vue（与 YiVad 统一技术栈）？**
A: YiPet 的代码库已用 React 构建——迁移到 Vue 需要完全重写所有 UI 组件，而非升级。React 15 → 18 是升级，React → Vue 是重写。后者的成本远高于前者，且不增加用户可见的价值。

## 反模式

- **等待"完美时机"升级。** "下个季度再升级"最容易拖延。React 15 → 18 的迁移成本随着代码增长而线性增加——越早做越便宜。在 YiPet 功能扩展之前完成升级，比在 2 倍代码量的基础上再升级节省了大量时间
- **升级后立即引入所有新特性。** React 18 的并发特性虽然可用但未启用。先确保基础迁移稳定（Hooks、新 API），再逐步引入高级特性