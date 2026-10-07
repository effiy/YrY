---
doc_type: prd
title: "YP-09-P02: macOS 平台适配策略"
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-P02
estimate_frontend: 0.5
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 平台
roles: [engineer]
tags: [平台, macOS, 适配]
category: 项目/桌面应用/需求
---

# YP-09-P02: macOS 平台适配策略

## 平台特性

| 特性 | 实现 |
|------|------|
| 窗口样式 | TitleBarStyle::Overlay + hidden_title |
| 窗口阴影 | `window_shadows::set_shadow` |
| 系统托盘 | NSStatusBar + template icon |
| Dock 图标 | ActivationPolicy::Accessory 隐藏 |
| 截图 | `screencapture -i -r` 系统命令 |
| OCR | Vision Framework (VNRecognizeTextRequest) |
| 开机启动 | LaunchAgent (tauri-plugin-autostart) |
| 权限 | 辅助功能 (Accessibility) + 屏幕录制 |
| 签名 | Apple Developer ID + notarization |

## 权限流程

```rust
let trusted = macos_accessibility_client::accessibility
    ::application_is_trusted_with_prompt();
```

首次启动时引导用户到系统偏好设置开启权限。

## Wayland 兼容

macOS 无需 Wayland 支持。

## 验收标准

- [ ] Apple 公证通过
- [ ] Dock 不显示图标
- [ ] 辅助功能权限提示友好
- [ ] 截图使用系统 screencapture

## 平台差异矩阵

### macOS vs Windows vs Linux 详细对比

| 特性 | macOS | Windows | Linux (X11) | Linux (Wayland) |
|------|-------|---------|-------------|-----------------|
| **窗口装饰** | `TitleBarStyle::Overlay` + `hidden_title` | `transparent` + `decorations(false)` 自绘标题栏 | server-side decoration (SSD) | client-side decoration (CSD) |
| **窗口阴影** | `window_shadows::set_shadow()` 原生 | DWM 自动处理 | 不支持 (DWM 无对应) | 不支持 |
| **系统托盘** | NSStatusBar + template icon | Shell_NotifyIcon + 彩色图标 | libayatana-appindicator | libayatana + StatusNotifier |
| **Dock/任务栏** | `ActivationPolicy::Accessory` 隐藏 Dock | 托盘不显示任务栏图标 | 同 Windows | 同 Windows |
| **截图** | `screencapture -i -r` 系统命令 | 自绘全屏截图窗口 | `xdg-screenshot` | `grim` via pipewire |
| **系统 OCR** | Vision Framework (VNRecognizeTextRequest) | Windows.Media.OCR.OcrEngine | Tesseract.js (无原生) | Tesseract.js |
| **剪贴板读取** | NSPasteboard + CGEvent Cmd+C 模拟 | Clipboard API + keybd_event Ctrl+C | xclip (X11) | wl-paste (Wayland) |
| **全局快捷键** | CGEvent + Accessibility API | RegisterHotKey / SetWindowsHookEx | XGrabKey (X11) | 部分支持 (KDE) |
| **开机启动** | LaunchAgent plist | 注册表 Run key | `~/.config/autostart/` .desktop | 同 X11 |
| **权限模型** | 辅助功能 (Accessibility) + 屏幕录制 | 无额外权限需求 | 无额外权限需求 | 无额外权限需求 |
| **应用签名** | Apple Developer ID + notarization | 可选 (SmartScreen 信任) | 不需要 | 不需要 |
| **安装包** | .dmg | .msi (WiX Toolset) | .deb + .AppImage + .rpm | 同 X11 |
| **WebView 引擎** | WKWebView (WebKit) | WebView2 (Edge Chromium) | WebKitGTK | WebKitGTK |
| **WebView 安装** | 内置 | Win10 需安装 WebView2 Runtime | 内置或需安装 | 内置或需安装 |

### macOS 特有特性

| 特性 | 说明 |
|------|------|
| **Template Icon** | 单色 PDF/PNG，系统根据深色/浅色菜单栏自动调整颜色 |
| **ActivationPolicy::Accessory** | 隐藏 Dock 图标，仅托盘存在。LSUIElement = YES |
| **统一菜单栏** | 应用菜单显示在顶部系统菜单栏（非窗口内） |
| **辅助功能权限** | 必需的权限，用于 Cmd+C 模拟和全局快捷键 |
| **屏幕录制权限** | 仅截图功能需要，每次 macOS 大版本更新可能需要重新授权 |
| **Hardened Runtime** | notarization 要求，禁用了某些 JIT/动态加载能力 |

## 已知限制

### macOS 特定限制

| 限制 | 详情 | 影响 | 缓解措施 |
|------|------|------|----------|
| 辅助功能权限引导路径深 | 系统偏好设置 → 安全性与隐私 → 隐私 → 辅助功能 | 用户可能找不到 | 提供截图引导 + 直接跳转 `x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility` |
| 屏幕录制权限每次重启可能丢失 | macOS 在系统更新后可能重置权限 | OCR/截图功能失效 | 检测权限状态 + 弹窗引导 |
| 剪贴板 Cmd+C 模拟延迟 | CGEvent 发送到接收，100-200ms 延迟 | 划词翻译有感知延迟 | 优化等待时间（动态调整 sleep 时长） |
| Template Icon 设计约束 | 仅单色，16×16 或 32×32 @2x | 图标设计受限 | 提供 PNG + PDF 双格式 |
| notarization 耗时 | Apple 公证审核需要 5-30 分钟 | 发布流程延长 | 自动化脚本 + CI 集成 |
| WebView 旧版本兼容 | macOS 10.x 的 WebKit 版本不支持部分 CSS | 部分样式异常 | Polyfill / 降级样式 |
| 系统 OCR 语言切换慢 | Vision 切换语言时重新加载模型，1-2s | 用户等待 | 预加载常用语言 |
| 用户手动禁用辅助功能 | 应用运行时手动关闭权限 | 功能静默失效 | 定时检测权限状态 + 提示 |

### 屏幕录制权限的最佳实践

```rust
// 检测权限状态
let has_permission = CGPreflightScreenCaptureAccess();

// 引导用户开启
if !has_permission {
    CGRequestScreenCaptureAccess(); // 弹出系统权限弹窗
}
```

## 性能对比数据

### 同操作在不同平台的耗时对比 (MacBook Pro M1, 16GB)

| 操作 | macOS (M1) | macOS (Intel) | Windows 11 (i7) | Linux (X11, i7) |
|------|-----------|---------------|-----------------|-----------------|
| 冷启动 | 800ms | 1200ms | 1500ms | 1800ms |
| 划词翻译 (3 服务) | 600ms | 900ms | 750ms | 800ms |
| 截图 (全屏 1080p) | 40ms | 80ms | 90ms | 120ms |
| 系统 OCR (1080p) | 80ms | 150ms | 180ms | N/A |
| 内存 (空闲) | 45MB | 55MB | 60MB | 50MB |
| 内存 (翻译窗口) | 75MB | 90MB | 95MB | 85MB |
| CPU (空闲) | 1-2% | 2-3% | 2-4% | 2-3% |

### macOS 与 Windows 的签名/发布流程对比

| 步骤 | macOS | Windows |
|------|-------|---------|
| 证书费用 | $99/年 (Apple Developer) | ~$200/年 (EV Code Signing) |
| 获取证书 | Apple Developer Portal | CA 机构验证 |
| 签名工具 | `codesign` + `xcrun notarytool` | `signtool.exe` |
| 公证/信任建立 | 自动扫描 (5-30min) | SmartScreen 信誉积累 (数周) |
| 首次安装警告 | 无 | "Windows 已保护你的电脑" (无签名时) |
| DMG 制作 | `hdiutil` + `create-dmg` | N/A |
| 自动更新 | Sparkle 2 (独立) | tauri-plugin-updater |

## 参考

- [44-prd-ADR-Tauri选择](./44-prd-ADR-Tauri选择.md) — 为什么选择 Tauri (跨平台基础)
- [50-prd-WindowsLinux平台适配](./50-prd-WindowsLinux平台适配.md) — Windows/Linux 适配策略
- [40-prd-Rust剪贴板模块](./40-prd-Rust剪贴板模块.md) — macOS 剪贴板实现 (NSPasteboard)
- [41-prd-Rust托盘模块](./41-prd-Rust托盘模块.md) — macOS 托盘实现 (NSStatusBar)
- [42-prd-Rust截图OCR语言检测](./42-prd-Rust截图OCR语言检测.md) — macOS 截图 (CGWindowList) 和 OCR (Vision)