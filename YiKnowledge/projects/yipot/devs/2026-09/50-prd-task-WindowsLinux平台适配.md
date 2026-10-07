---

doc_type: module
prd_task_id: "YP-09-P03"
title: "Windows/Linux 平台适配 — 开发方案"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "50-prd-WindowsLinux平台适配.md"

type: task
---

# Windows/Linux 平台适配 — 开发方案

## Windows

```rust
// 隐藏控制台窗口
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// 窗口样式
builder = builder.transparent(true).decorations(false);
```

## Linux

```rust
// Wayland 支持
// tauri.conf.json 中启用 Wayland

// 系统托盘: libayatana-appindicator
// 截图: xdg-screenshot / grim
// OCR 回退: Tesseract.js

// 无窗口阴影
#[cfg(not(target_os = "linux"))]
set_shadow(&window, true).unwrap_or_default();
```

## 平台差异

| 特性 | Windows | Linux |
|------|---------|-------|
| 窗口 | transparent + decorations(false) | 同 Left |
| 截图 | 自绘全屏窗口 | xdg/grim |
| OCR | Windows.Media.OCR | Tesseract.js |
| 托盘 | Shell_NotifyIcon | libayatana |
| 构建 | .msi | .deb/.AppImage |

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| Windows 截图 | 自绘全屏透明窗口 | 比 `Graphics.Capture` 兼容性更好 |
| Windows OCR | `Windows.Media.OCR` | 系统内置，离线可用 |
| Linux 截图 | `xdg-screenshot` (X11) / `grim` (Wayland) | 按显示协议自动选择 |
| Linux OCR | Tesseract.js | 无系统级 OCR API 的兜底方案 |
| Windows 无控制台 | `#![windows_subsystem = "windows"]` | GUI 应用不弹 CMD 窗口 |
| Linux 托盘 | `libayatana-appindicator` | 跨发行版兼容 (Ubuntu/Debian/Fedora) |

## 性能优化

| 优化项 | 方案 | 效果 |
|--------|------|------|
| Windows OCR 缓存 | `OcrEngine` 实例复用 | 首次 800ms → 后续 100ms |
| Windows 截图 | DirectX `IDXGIOutputDuplication` | 比 GDI 快 3x |
| Linux 截图检测 | 环境变量 `$XDG_SESSION_TYPE` 缓存 | 免重复检测 X11/Wayland |
| Linux 字体回退 | `fontconfig` 查询 + 缓存 | 首次 200ms → 后续 < 10ms |

## 错误处理

| 错误场景 | 错误码 | 处理方式 | 用户提示 |
|----------|--------|----------|----------|
| Windows OCR 语言包未安装 | `WIN-OCR-LANG` | 引导到系统设置安装 | "请在 Windows 设置中安装 OCR 语言包" |
| Windows 截图权限拒绝 | `WIN-SCR` | 提示以管理员运行 | "需要管理员权限才能截图" |
| Linux Wayland 截图不支持 | `LIN-WAY` | PipeWire 或 grim 备选 | 静默切换工具 |
| Linux Tesseract 语言数据未安装 | `LIN-TES` | 自动下载至 `~/.local/share/pot/` | "正在下载离线 OCR 数据..." |
| Windows 注册表写入失败 | `WIN-REG` | 尝试 `HKCU`，失败则跳过 | 日志警告 |
| AppImage 启动权限 | `LIN-APPM` | 提示 `chmod +x` | "请赋予 AppImage 执行权限" |

## 交叉引用

| 关联文档 | 关系 | 说明 |
|----------|------|------|
| [50-prd-WindowsLinux平台适配](../prds/2026-09/50-prd-WindowsLinux平台适配.md) | 上游 PRD | 平台需求定义 |
| [35-prd-task-Tesseract离线OCR](./35-prd-task-Tesseract离线OCR.md) | 依赖 | Linux 离线 OCR 引擎 |
| [49-prd-task-macOS平台适配](./49-prd-task-macOS平台适配.md) | 兄弟 | 跨平台差异对照 |
| `src-tauri/src/platform/windows/` | 源码 | Windows 平台代码 |
| `src-tauri/src/platform/linux/` | 源码 | Linux 平台代码 |