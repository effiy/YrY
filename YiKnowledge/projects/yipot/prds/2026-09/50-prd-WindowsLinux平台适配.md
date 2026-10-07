---
doc_type: prd
title: "YP-09-P03: Windows/Linux 平台适配策略"
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-P03
estimate_frontend: 0.5
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 平台
roles: [engineer]
tags: [平台, Windows, Linux, 适配]
category: 项目/桌面应用/需求
---

# YP-09-P03: Windows/Linux 平台适配策略

## Windows 平台

| 特性 | 实现 |
|------|------|
| 窗口样式 | transparent + decorations(false) |
| 截图 | 自绘全屏截图窗口 |
| OCR | Windows.Media.OCR.OcrEngine |
| 构建 | MSVC toolchain + .msi 打包 |

### 特殊处理

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
// 发布版本不显示控制台窗口
```

### 运行时依赖

- Microsoft Visual C++ Redistributable
- WebView2 Runtime (Windows 10)

## Linux 平台

| 特性 | 实现 |
|------|------|
| 显示协议 | X11 + Wayland 双支持 |
| 系统托盘 | libayatana-appindicator |
| 截图 | xdg-screenshot / grim |
| OCR | Tesseract.js (无系统 OCR) |
| 构建 | .deb + .AppImage + .rpm |

### Wayland 兼容

```bash
# 测试环境
KDE Plasma (Wayland) ✓
GNOME (Wayland) ✓
Hyprland ✓
```

### 窗口阴影

Linux 不设置窗口阴影（`set_shadow` 仅在非 Linux 平台调用）。

## 验收标准

- [ ] Windows 10/11 正常运行
- [ ] Linux X11 + Wayland 正常
- [ ] 系统托盘三平台均正常

## 平台差异矩阵

### Windows vs Linux 详细对比

| 特性 | Windows 10 | Windows 11 | Linux (X11) | Linux (Wayland) |
|------|-----------|-----------|-------------|-----------------|
| **窗口装饰** | `decorations(false)` + 自绘 | 同 Win10 | SSD (server-side decoration) | CSD (client-side decoration) |
| **窗口阴影** | DWM (Desktop Window Manager) 自动 | 同 Win10 | 不支持 | 不支持 |
| **截图** | 自绘透明全屏窗口 → BitBlt | 同 Win10 | `xdg-screenshot` 或 X11 SHM | `grim` via pipewire |
| **系统 OCR** | Windows.Media.OCR.OcrEngine (WinRT) | 同 Win10 | 不支持 | 不支持 |
| **剪贴板** | `keybd_event` Ctrl+C 模拟 + Clipboard API | 同 Win10 | `xdotool key ctrl+c` + `xclip` | `wtype -M ctrl c` + `wl-paste` |
| **全局快捷键** | `RegisterHotKey` API + `SetWindowsHookEx` | 同 Win10 | `XGrabKey` | 部分 (KDE 可用，GNOME 受限) |
| **系统托盘** | `Shell_NotifyIcon` + 彩色 ICO | 同 Win10 | `libayatana-appindicator` | `libayatana` + `StatusNotifier` (via dbus) |
| **控制台窗口** | `#![windows_subsystem = "windows"]` 隐藏 | 同 Win10 | 无控制台干扰 | 无控制台干扰 |
| **运行时依赖** | VC++ Redist + WebView2 Runtime (Win10) | WebView2 内置 | `libwebkit2gtk` `libayatana-appindicator3` | 同 X11 + `xdg-desktop-portal` |
| **自启动** | 注册表 `HKCU\...\Run` | 同 Win10 | `~/.config/autostart/` .desktop文件 | 同 X11 |
| **安装包** | .msi (WiX Toolset) | 同 Win10 | .deb (Debian/Ubuntu) + .rpm (Fedora) + .AppImage (通用) | 同 X11 |
| **DPI 缩放** | GDI DPI awareness manifest | 同 Win10 | Xft.dpi / GDK_SCALE | 原生支持 |
| **WebView 引擎** | WebView2 (Edge Chromium) | 内置 | WebKitGTK | WebKitGTK |
| **WebView 高 DPI** | WebView2 原生支持 | 原生 | WebKitGTK 支持 | 支持 |

### Linux 发行版兼容矩阵

| 发行版 | 桌面环境 | 托盘 | 截图 | OCR | 窗口阴影 | 全局快捷键 |
|--------|----------|------|------|-----|----------|------------|
| Ubuntu 22.04+ | GNOME (X11) | libayatana ✓ | xdg-screenshot ✓ | Tesseract | 不支持 | XGrabKey ✓ |
| Ubuntu 22.04+ | GNOME (Wayland) | 需扩展 | grim ✓ | Tesseract | 不支持 | 部分支持 |
| Fedora 38+ | GNOME (Wayland) | 需扩展 | grim ✓ | Tesseract | 不支持 | 部分支持 |
| KDE Neon | KDE Plasma (Wayland) | 内置支持 ✓ | grim ✓ | Tesseract | 不支持 | 部分支持 |
| Debian 12 | GNOME (X11) | libayatana ✓ | xdg-screenshot ✓ | Tesseract | 不支持 | XGrabKey ✓ |
| Arch Linux | 自定义 WM (X11) | 需手动配置 | xdg-screenshot ✓ | Tesseract | 不支持 | XGrabKey ✓ |
| Arch Linux | Hyprland (Wayland) | 部分支持 | grim ✓ | Tesseract | 不支持 | 不支持 |

## 已知限制

### Windows 特定限制

| 限制 | 详情 | 影响 | 缓解措施 |
|------|------|------|----------|
| **WebView2 Runtime 依赖** | Windows 10 不自带 WebView2，需用户安装 (~100MB) | 用户首次启动可能失败 | 安装包内嵌 WebView2 bootstrapper 或检测 + 提示安装 |
| **杀毒软件误报** | 新签名/无签名的 .exe 可能被 Windows Defender 隔离 | 用户无法启动 | 获取 EV Code Signing 证书 + SmartScreen 信誉积累 |
| **高 DPI 模糊** | Tauri v1 的 `dpi_awareness` 配置不当会导致模糊 | 界面模糊 | 设置 `"dpi_awareness": "PerMonitorV2"` |
| **截图自绘窗口闪白** | `transparent + decorations(false)` 窗口创建时有短暂白屏 | 截图体验不佳 | 窗口创建后延迟 50ms 再显示，或先 render 到 offscreen buffer |
| **MSVC 工具链体积** | Visual Studio Build Tools ~2GB | CI 环境配置慢 | 使用 rustup 的 msvc target + 预装环境 |
| **32-bit 不支持** | Tauri 仅支持 64-bit Windows | 老旧设备不可用 | 明确标注系统要求 |
| **Win7 不支持** | Tauri WebView2 要求 Win10+ | 仍在使用 Win7 的用户 | 明确标注系统要求 |
| **防火墙弹窗** | 翻译 API 网络请求可能触发防火墙提示 | 用户困惑 | 添加 Windows 防火墙规则 (安装时) |

### Linux 特定限制

| 限制 | 详情 | 影响 | 缓解措施 |
|------|------|------|----------|
| **Wayland 全局快捷键受限** | Wayland 协议不允许应用监听全局按键 | GNOME Wayland 下快捷键不工作 | 提示用户切换到 X11 或使用 KDE |
| **无系统 OCR** | Linux 无内置 OCR 引擎 | OCR 仅在线 API 可用 | 提供 Tesseract 可选安装指引 |
| **Wayland 截屏权限** | 需要 xdg-desktop-portal 授权，弹出系统对话框 | 自动化截图不流畅 | 使用 grim + slurp 命令行工具 |
| **托盘图标在 GNOME 不可见** | GNOME 默认隐藏系统托盘 | 用户找不到应用入口 | 安装 AppIndicator 扩展 + 额外提供 CLI 入口 |
| **依赖安装碎片化** | 不同发行版包名不同 | 用户安装困难 | .deb/.rpm/.AppImage 包含所有依赖；AppImage 自包含 |
| **剪贴板竞争 (X11)** | X11 多剪贴板 (PRIMARY/CLIPBOARD/SECONDARY) | 选文可能获取到错误内容 | 固定使用 CLIPBOARD selection |
| **wl-clipboard 不存在** | Wayland 默认不安装 wl-clipboard | 剪贴板功能不工作 | 首次运行检测 + 提示安装 |
| **窗口无阴影** | Linux 没有统一的窗口阴影机制 | 窗口视觉不如 macOS | 使用 CSS box-shadow 模拟 (仅在非透明时有效) |

## 性能对比数据

### 同操作在不同平台的耗时对比 (16GB RAM)

| 操作 | Windows 11 (i7-13700) | Linux Ubuntu 22 (i7) | macOS M1 (参考) |
|------|----------------------|---------------------|-----------------|
| 冷启动 | 1500ms | 1800ms | 800ms |
| 划词翻译 (3 服务) | 750ms | 800ms | 600ms |
| 截图 (全屏 1080p) | 90ms | 120ms (X11) / 250ms (Wayland) | 40ms |
| 系统 OCR (1080p) | 180ms | N/A (Tesseract 可选) | 80ms |
| 内存 (空闲) | 60MB | 50MB | 45MB |
| 内存 (翻译窗口) | 95MB | 85MB | 75MB |
| CPU (空闲) | 2-4% | 2-3% | 1-2% |
| 安装包大小 | ~4MB (.msi) | ~5MB (.deb) / ~6MB (.AppImage) | ~4MB (.dmg) |

### Windows 签名 vs 无签名体验

| 方面 | 已签名 (EV Code Signing) | 无签名 |
|------|------------------------|--------|
| 下载后 SmartScreen | 无警告 | "Windows 已保护你的电脑" |
| 首次启动 | 正常 | 需点击 "更多信息" → "仍要运行" |
| 杀毒软件误报率 | < 1% | 5-15% |
| 用户信任度 | 高 | 低 (很多人会放弃安装) |
| 年度成本 | $200-400 | $0 |

### Linux 安装包大小对比 (以相同应用计)

| 格式 | 大小 | 依赖 | 启动速度 | 适用发行版 |
|------|------|------|----------|------------|
| .deb | ~5MB | 需系统安装依赖 | 快 | Debian/Ubuntu |
| .rpm | ~5MB | 需系统安装依赖 | 快 | Fedora/RHEL |
| .AppImage | ~6MB | 自包含 | 慢 10-20% | 所有发行版 |

## 参考

- [44-prd-ADR-Tauri选择](./44-prd-ADR-Tauri选择.md) — 为什么选择 Tauri (跨平台基础)
- [49-prd-macOS平台适配](./49-prd-macOS平台适配.md) — macOS 适配策略 (对比参考)
- [40-prd-Rust剪贴板模块](./40-prd-Rust剪贴板模块.md) — Windows/Linux 剪贴板实现差异
- [41-prd-Rust托盘模块](./41-prd-Rust托盘模块.md) — 三平台托盘实现差异
- [42-prd-Rust截图OCR语言检测](./42-prd-Rust截图OCR语言检测.md) — 各平台截图和 OCR 差异