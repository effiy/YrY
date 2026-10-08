---

doc_type: test
title: "Rust 系统托盘模块 — 测试方案"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["41-prd-Rust托盘模块"]
source_modules: ["41-prd-Rust托盘模块"]

type: test
---

# Rust 系统托盘模块 — 测试方案

> 覆盖 YP-09-R02：`tray.rs` 托盘菜单构建、事件处理、三平台差异

---

## 一、核心功能测试

### 1.1 托盘菜单构建

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-TRAY-001 | 默认菜单项 | 首次启动 → 查看托盘菜单 | 含：划词翻译、输入翻译、截图OCR、截图翻译、设置、关于、退出 |
| TC-TRAY-002 | 划词翻译开关 | 点击"划词翻译"菜单项 | 切换启用/禁用状态，标签动态更新 |
| TC-TRAY-003 | 菜单动态标签 | 划词翻译启用时菜单项文字 | "划词翻译 [禁用]"；禁用时 "划词翻译 [启用]" |
| TC-TRAY-004 | 托盘图标显示 | 启动应用 | 系统托盘区显示 Pot 图标 |

### 1.2 菜单事件处理

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-TRAY-010 | 输入翻译 | 点击"输入翻译"菜单项 | 打开空白翻译窗口（输入模式） |
| TC-TRAY-011 | 截图 OCR | 点击"截图OCR"菜单项 | 触发截图模式 |
| TC-TRAY-012 | 截图翻译 | 点击"截图翻译"菜单项 | 触发截图 → 翻译流程 |
| TC-TRAY-013 | 打开设置 | 点击"设置"菜单项 | 打开设置窗口 |
| TC-TRAY-014 | 显示关于 | 点击"关于"菜单项 | 显示应用信息 |
| TC-TRAY-015 | 退出应用 | 点击"退出"菜单项 | 应用退出，托盘图标消失 |

### 1.3 平台差异

| 编号 | 用例 | 平台 | 预期 |
|------|------|------|------|
| TC-TRAY-020 | macOS NSStatusBar | macOS | 使用 template icon + ActivationPolicy::Accessory |
| TC-TRAY-021 | Windows Shell_NotifyIcon | Windows 10/11 | 彩色图标正常显示 |
| TC-TRAY-022 | Linux AppIndicator | Ubuntu/Debian | libayatana-appindicator 正常 |

---

## 二、边界与异常测试

| 编号 | 场景 | 触发条件 | 预期行为 | 恢复策略 |
|------|------|----------|----------|----------|
| TC-TRAY-EDGE-01 | 托盘图标文件缺失 | 图标文件被删除 | 使用默认 fallback 图标 | — |
| TC-TRAY-EDGE-02 | 托盘区空间不足 | Windows 隐藏托盘图标区 | 图标进入溢出区 | 用户可手动拖出 |
| TC-TRAY-EDGE-03 | Linux indicator 未安装 | 未装 libayatana | 降级使用 GtkStatusIcon 或提示安装 | — |
| TC-TRAY-EDGE-04 | macOS 深色/浅色切换 | 系统外观切换 | template icon 自动适配 | — |
| TC-TRAY-EDGE-05 | 菜单项重复点击 | 快速连点"输入翻译" | 仅打开一个翻译窗口 | 窗口去重 |
| TC-TRAY-EDGE-06 | 托盘创建失败 | D-Bus 不可用 (Linux) | 应用正常运行但无托盘 | 日志记录错误 |
| TC-TRAY-EDGE-07 | 退出时清理 | 点击退出 | 移除托盘图标 + 清理资源 | 无残留图标 |

---

## 三、性能基准测试

| 编号 | 测试场景 | 测量指标 | 基准值 | 劣化阈值 | 测试方法 |
|------|---------|---------|--------|---------|---------|
| TC-TRAY-PERF-01 | 托盘创建 | 启动到图标出现 | < 500ms | > 1s | 含系统 IPC |
| TC-TRAY-PERF-02 | 菜单弹出 | 点击到菜单显示 | < 200ms | > 500ms | 含菜单项构建 |
| TC-TRAY-PERF-03 | 菜单项响应 | 点击到操作执行 | < 100ms | > 300ms | match 事件分发 |
| TC-TRAY-PERF-04 | 菜单标签更新 | update_tray 调用到 UI 更新 | < 100ms | > 300ms | 切换启用/禁用 |
| TC-TRAY-PERF-05 | 空闲内存 | 托盘运行 1 小时 | 内存无增长 | 无泄漏 | Activity Monitor |

---

## 四、平台兼容测试

| 编号 | 测试项 | 测试平台 | 预期结果 | 优先级 |
|------|--------|---------|---------|--------|
| TC-TRAY-PLT-01 | macOS template icon 适配 | macOS 13+ | 深色/浅色模式自动适配 | P0 |
| TC-TRAY-PLT-02 | macOS Dock 不显示 | macOS (Accessory) | 仅托盘图标，Dock 无图标 | P0 |
| TC-TRAY-PLT-03 | Windows 托盘溢出区 | Windows 10/11 | 图标可在托盘区/溢出区间移动 | P1 |
| TC-TRAY-PLT-04 | Windows 右键菜单 | Windows | 右键托盘图标显示菜单 | P1 |
| TC-TRAY-PLT-05 | Linux Wayland 兼容 | Ubuntu 22.04+ (Wayland) | 托盘正常显示 | P1 |
| TC-TRAY-PLT-06 | Linux 无 D-Bus 环境 | 最小化安装 | 降级处理，不影响核心功能 | P2 |

---

## 五、回归测试清单

| 编号 | 回归用例 | 覆盖功能 | 自动化 | 优先级 |
|------|---------|---------|--------|--------|
| REG-TRAY-01 | 托盘菜单完整显示 | 菜单构建 | 否 | P0 |
| REG-TRAY-02 | 划词翻译开关切换 | 菜单交互 | 否 | P0 |
| REG-TRAY-03 | 输入翻译打开空白窗口 | 菜单交互 | 否 | P0 |
| REG-TRAY-04 | 截图 OCR 触发截图模式 | 菜单交互 | 否 | P0 |
| REG-TRAY-05 | 设置窗口打开 | 菜单交互 | 否 | P1 |
| REG-TRAY-06 | 退出应用清理 | 菜单交互 | 否 | P0 |
| REG-TRAY-07 | macOS/Windows/Linux 托盘 | 平台兼容 | 否 | P0 |
| REG-TRAY-08 | 菜单标签动态更新 | 动态 UI | 否 | P1 |

---

## 六、参考文档

- [41-prd-Rust托盘模块](../prds/2026-09/41-prd-Rust托盘模块.md) — 源 PRD
- [35-prd-翻译窗口交互](../prds/2026-09/35-prd-翻译窗口交互.md) — 托盘触发翻译窗口
- [36-prd-OCR窗口交互](../prds/2026-09/36-prd-OCR窗口交互.md) — 托盘触发 OCR 窗口
- [37-prd-设置页面架构](../prds/2026-09/37-prd-设置页面架构.md) — 托盘打开设置页