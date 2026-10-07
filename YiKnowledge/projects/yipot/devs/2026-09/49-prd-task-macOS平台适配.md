---

doc_type: module
prd_task_id: "YP-09-P02"
title: "macOS 平台适配 — 开发方案"
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
source_prd: "49-prd-macOS平台适配.md"

type: task
---

# macOS 平台适配 — 开发方案

## 关键实现

```rust
// 隐藏 Dock 图标
app.set_activation_policy(tauri::ActivationPolicy::Accessory);

// 窗口样式
builder = builder.title_bar_style(tauri::TitleBarStyle::Overlay).hidden_title(true);

// 截图
std::process::Command::new("/usr/sbin/screencapture").arg("-i").arg("-r").arg(path)

// 权限检测
let trusted = macos_accessibility_client::accessibility::application_is_trusted_with_prompt();

// 窗口阴影
#[cfg(not(target_os = "linux"))]
set_shadow(&window, true).unwrap_or_default();

// 签名
// codesign --deep --force --verify --sign "Developer ID Application: ..."
// xcrun notarytool submit --wait
```

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 截图 | screencapture -i | 系统原生，体验最佳 |
| OCR | Vision Framework | 离线可用，<200ms |
| 窗口 | TitleBarStyle::Overlay | 原生 macOS 外观 |
| 权限检测 | `macos_accessibility_client` crate | 运行时检测 + 引导授权 |
| 公证 | `codesign` + `xcrun notarytool submit` | macOS 15+ Gatekeeper 要求 |
| 通用二进制 | `universal-apple-darwin` target | x86_64 + arm64 双架构 |

## 性能优化

| 优化项 | 方案 | 效果 |
|--------|------|------|
| Vision OCR | `VNRecognizeTextRequest` 原生 API | 离线识别 < 200ms |
| Metal 加速 | Tauri 启用 `metal` feature | 窗口渲染性能提升 |
| 低电量感知 | `NSProcessInfo.lowPowerMode` 检测 | 低电量禁用非必要轮询 |
| App Nap 豁免 | `beginActivity` 声明 `NSActivityUserInitiated` | 翻译时不被系统挂起 |

## 错误处理

| 错误场景 | 错误码 | 处理方式 | 用户提示 |
|----------|--------|----------|----------|
| 辅助功能权限未授予 | `MAC-AXS` | 调用 `application_is_trusted_with_prompt()` | 引导到系统设置授权 |
| screencapture 失败 | `MAC-SCR` | 回退到 Tauri 截图 API | "截图失败，请检查权限" |
| Vision OCR 无可用语言 | `MAC-VIS` | 回退到 Tesseract.js | 日志记录，翻译继续 |
| 公证失败 | `MAC-NOT` | 构建脚本中断，输出错误日志 | CI 中阻断发布 |
| App Translocation (dmg 下载) | `MAC-TRS` | 构建脚本自动移除 `com.apple.quarantine` 属性 | 无（构建时处理） |
| Metal 不可用（虚拟机） | `MAC-MTL` | 降级为软件渲染 | 性能降低但功能正常 |

## 交叉引用

| 关联文档 | 关系 | 说明 |
|----------|------|------|
| [49-prd-macOS平台适配](../prds/2026-09/49-prd-macOS平台适配.md) | 上游 PRD | 平台需求定义 |
| [49-prd-test-macOS平台](../tests/2026-09/49-prd-test-macOS平台.md) | 下游测试 | 测试用例与验证方案 |
| [35-prd-task-Tesseract离线OCR](./35-prd-task-Tesseract离线OCR.md) | 回退 | Vision 不可用时回退 |
| [50-prd-task-WindowsLinux平台适配](./50-prd-task-WindowsLinux平台适配.md) | 兄弟 | 跨平台差异对照 |
| `src-tauri/src/platform/macos/` | 源码 | macOS 平台代码 |