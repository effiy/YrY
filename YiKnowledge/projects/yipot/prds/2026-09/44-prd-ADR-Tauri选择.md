---
doc_type: prd
title: "YP-09-A01: ADR-001 选择 Tauri 而非 Electron"
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-A01
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 架构
roles: [engineer, leader]
tags: [ADR, 架构决策, Tauri, Electron]
category: 项目/桌面应用/需求
---

# ADR-001: 选择 Tauri 而非 Electron

> 状态：已采纳 · 日期：2023 年

## 背景

桌面翻译工具需要跨平台支持（Windows/macOS/Linux），且需要深度系统集成能力（全局快捷键、剪贴板读写、系统托盘、截图）。需要在 Electron 和 Tauri 之间做出选择。

## 决策

选择 **Tauri** 作为桌面框架。

## 理由

| 维度 | Tauri | Electron | 选择 |
|------|-------|----------|------|
| 包体积 | ~5MB | ~120MB | Tauri |
| 内存占用 | ~50MB | ~200MB | Tauri |
| 系统集成 | Rust 原生调用 | Node.js 桥接 | Tauri |
| 前端灵活性 | 任意框架 | 任意框架 | 持平 |
| 生态成熟度 | 较新 | 成熟 | Electron |
| Linux 兼容性 | 较好 | 一般 | Tauri |

**决定因素**：翻译工具需要常驻后台，内存占用是关键指标。Tauri 的 Rust 后端可以直接调用系统 API（剪贴板、快捷键、OCR），无需额外的 Node.js 桥接层。

## 后果

- 使用 Rust 编写系统层代码（学习成本）
- 更小的安装包和内存占用
- macOS 签名和公证流程简化
- 部分 Tauri 插件需要从 GitHub 直接引用

## 备选方案详细对比

### Electron vs Tauri vs NW.js vs Neutralinojs

| 维度 | Tauri (v1) | Electron (28.x) | NW.js (0.80) | Neutralinojs (5.x) |
|------|-----------|-----------------|--------------|-------------------|
| 包体积 (空项目) | ~5MB | ~120MB | ~100MB | ~5MB |
| 内存占用 (空项目) | ~50MB | ~200MB | ~180MB | ~30MB |
| 运行时 | 系统 WebView | Chromium 内嵌 | Chromium 内嵌 | 系统 WebView |
| 前端框架 | 任意 | 任意 | 任意 | 任意 |
| 后端语言 | Rust | Node.js | Node.js | Node.js / Native |
| 系统 API 访问 | Rust FFI 原生 | Node.js addon | Node.js addon | 有限 |
| macOS 公证复杂度 | 低 (标准) | 高 (Chromium 签名) | 高 | 极低 |
| 自动更新 | tauri-plugin-updater | electron-updater | 手动 | 手动 |
| 剪贴板访问 | Rust crate 原生 | electron.clipboard | nw.Clipboard | 有限 |
| 全局快捷键 | tauri-plugin-global-shortcut | electron.globalShortcut | nw.Shortcut | 不支持 |
| 社区/插件生态 | 500+ 插件 | 10,000+ 包 | 800+ 包 | 100+ |
| 学习曲线 | 中等 (Rust + JS) | 低 (JS only) | 低 (JS only) | 极低 |
| TypeScript 支持 | 良好 | 优秀 | 一般 | 有限 |
| Windows WebView2 依赖 | 需要 (Win10) | 不需要 | 不需要 | 需要 |
| Linux 兼容性 | 良好 | 一般 | 一般 | 有限 |

### 淘汰方案分析

- **NW.js**：与 Electron 类似的体积和内存问题，但生态更小，不选。
- **Neutralinojs**：体积优秀但系统 API 访问能力弱，无法满足剪贴板监听/全局快捷键/截图 OCR 等需求。
- **Flutter Desktop**：Dart 生态与前端团队技能栈不匹配，且对系统托盘/剪贴板等桌面特性支持不成熟。
- **.NET MAUI**：仅 Windows/macOS 支持好，Linux 支持弱，不适合三平台需求。

### 最终候选: Electron vs Tauri

两个方案在**前端灵活性**上持平（都支持 React/Vue/任意框架），差异集中在：

| 关键差异 | Tauri 优势 | Electron 优势 |
|----------|-----------|---------------|
| 内存 (翻译工具需常驻) | ~50MB | ~200MB → Tauri 4x 优势 |
| 安装包大小 | ~5MB | ~120MB → Tauri 24x 优势 |
| 系统 API 调用 | Rust FFI 直接调用 | Node.js C++ addon 桥接 |
| macOS 剪贴板读取 | Rust crate 直接访问 NSPasteboard | 需辅助功能权限 |
| 开发体验 | Rust 编译慢，debug 不方便 | Node.js HMR 快 |
| 插件生态 | 够用但不如 Electron 丰富 | 极其丰富 |
| 自动更新 | 需要自己签名/公证 | electron-updater 成熟 |
| 安全模型 | CSP + Rust 隔离 | Node 集成 (有风险) |

## 决策后果与迁移路径

### 正向后果

1. **内存优势**：常驻后台 50MB vs 200MB，对翻译工具极其重要
2. **安装体验**：5MB 下载 vs 120MB，用户更可能尝试
3. **系统集成深度**：Rust 原生访问 macOS NSStatusBar/Windows Shell API，无桥接损耗
4. **安全基线更高**：Rust 的类型安全 + Tauri CSP 策略

### 负向后果

1. **开发效率**：Rust 编译时间 (首次 ~30s，增量 ~5s) 影响迭代速度
2. **Rust 学习成本**：前端团队需学习 Rust 基础和 Tauri 命令系统
3. **插件生态不成熟**：部分 Tauri 插件需要从 GitHub 分支引用（如 `tauri-plugin-global-shortcut`）
4. **WebView2 依赖**：Windows 10 用户需要额外安装 WebView2 Runtime (~100MB)

### 如果将来需要迁移

迁移到 Electron 的触发条件：
- Rust 招聘困难，团队无法维护 Rust 模块
- Tauri 插件无法满足关键功能（如更好的自动更新）
- WebView 兼容性问题频发（Windows/Linux）

迁移成本评估：
- 前端代码 (React + Jotai) 100% 复用
- Rust Tauri Command 需重写为 Node.js IPC handlers
- 剪贴板/快捷键/截图模块需用 Electron API 或 Node.js addon 替代
- 估计迁移工时：3-4 周

## 后续决策依赖

本 ADR 做出的决策直接影响了以下后续决策：

| 后续决策 | 影响方式 | ADR 引用 |
|----------|----------|----------|
| 状态管理选型 | 无直接影响 (前端框架不受限) | [ADR-002: Jotai](./45-prd-ADR-Jotai选择.md) |
| 插件架构 | 无直接影响 (前端架构独立) | [ADR-003: 插件架构](./46-prd-ADR-插件架构.md) |
| 多窗口架构 | 受益于 Tauri 的多窗口 API | [ADR-004: 多窗口](./47-prd-ADR-多窗口架构.md) |
| Rust 模块拆分 | Tauri 决定的 Rust 后端，后续需拆分各模块 | [R01-R04 各 Rust 模块](./40-prd-Rust剪贴板模块.md) |
| 平台适配策略 | Tauri 的三平台支持决定了平台适配的基线 | [P02-P03 平台适配](./49-prd-macOS平台适配.md) |
| CLI 命令行 | Tauri 的 Rust 后端让 CLI 天然可行 | [S27: CLI](./38-prd-CLI命令行.md) |
| 更新策略 | Tauri updater 功能受限于签名证书 | 需要分别获取 Apple Developer ID + Windows 代码签名证书 |

**不可逆的影响**：
- 选择 Tauri 后，所有系统级功能必须用 Rust 实现，无法回退到 Node.js
- macOS 公证流程受限于 Apple Developer Program ($99/年) 是否有账号
- Windows WebView2 依赖是硬性要求，无法绕过

## 参考

- [46-prd-ADR-插件架构](./46-prd-ADR-插件架构.md) — 插件化架构
- [47-prd-ADR-多窗口架构](./47-prd-ADR-多窗口架构.md) — 多窗口架构
- [49-prd-macOS平台适配](./49-prd-macOS平台适配.md) — macOS 适配细节
- [50-prd-WindowsLinux平台适配](./50-prd-WindowsLinux平台适配.md) — Windows/Linux 适配