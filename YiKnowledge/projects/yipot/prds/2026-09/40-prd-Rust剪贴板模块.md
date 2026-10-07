---
doc_type: prd
title: "YP-09-R01: Rust 剪贴板模块 (clipboard.rs)"
status: 已完成
priority: P0
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-R01
estimate_frontend: 1.0
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, Rust, 剪贴板]
category: 项目/桌面应用/需求
---

# YP-09-R01: Rust 剪贴板模块 (clipboard.rs)

> 需求编号：YP-09-R01 · 优先级：P0 · 人天：1.0d · 状态：已完成

## 背景

划词翻译的核心依赖系统剪贴板——读取用户选中的文本。跨平台剪贴板 API 差异大，需要 Rust 统一封装。

## 功能

### 读取选中文本

```rust
pub fn get_selected_text() -> String {
    // macOS: Cmd+C 模拟 + 读取剪贴板
    // Windows: Ctrl+C 模拟 + 读取剪贴板
    // Linux: xclip / wl-clipboard
}
```

### 剪贴板监听

```rust
pub fn start_clipboard_monitor(app_handle: &AppHandle) {
    // 后台线程 500ms 轮询
    // 内容变化 → emit "clipboard-changed" 事件
}
```

### 图片操作

- `cut_image` — 裁剪图片
- `get_base64` — 图片转 base64
- `copy_img` — 复制图片到剪贴板

## 验收标准

- [ ] 三平台读取选中文本正确
- [ ] 剪贴板监听去重
- [ ] 图片读写正常

## 量化验收标准

| 操作 | 目标延迟 | 测量方法 | 备注 |
|------|----------|----------|------|
| `get_selected_text()` 读取选中文本 | < 150ms | 从模拟按键到文本返回 | macOS: Cmd+C 模拟延迟最大 |
| 剪贴板监听轮询间隔 | 500ms | 线程 sleep 间隔 | 500ms 在实时性和 CPU 占用间平衡 |
| 剪贴板内容变化检测 | < 10ms | 两次内容 hash 比较 | 纯内存操作 |
| 图片转 Base64 | < 200ms (1080p) | 从剪贴板读取到 encode | 含图片解码 |
| `copy_img` 复制图片到剪贴板 | < 100ms | PNG 编码 + 剪贴板写入 | — |
| `cut_image` 裁剪图片 | < 500ms (1080p) | 含区域计算 + 裁剪 + 编码 | — |

## 边界条件与异常处理

| 场景 | 触发条件 | 预期行为 | 恢复策略 |
|------|----------|----------|----------|
| 剪贴板为空 | 无任何内容 | 返回空字符串 `""` | 不 emit 事件 |
| 剪贴板内容与上次相同 | hash 值相同 | 不 emit 事件 | 避免重复触发翻译 |
| 剪贴板有图片无文字 | 用户复制了截图 | 返回空文字，不触发翻译 | 保留图片数据用于 OCR |
| 剪贴板权限被拒绝 | macOS 辅助功能未开启 | 返回错误字符串，弹窗引导开启权限 | 缓存权限状态，避免重复提示 |
| Cmd+C 模拟发送到错误应用 | 当前焦点在系统对话框 | 尝试获取焦点窗口标题，过滤系统窗口 | 静默失败，不弹窗打扰 |
| 剪贴板大小超过限制 | > 50MB 内容 | 截断，仅处理前 100KB 文本 | 图片需走截图路径 |
| Linux Wayland 无剪贴板 | wl-clipboard 未安装 | 日志警告，提示 "请安装 wl-clipboard" | 首次运行时检测并提示 |
| Linux 多剪贴板 (X11) | PRIMARY vs CLIPBOARD | 使用 CLIPBOARD selection | 文档说明 |
| Windows 剪贴板被其他程序占用 | 剪贴板 API 返回错误 | 重试 3 次，间隔 100ms | 最后一次失败后才报错 |

## 非功能需求

### 性能
- 剪贴板轮询在独立线程运行，不阻塞主线程
- 监听线程使用 `Arc<Mutex<lastContent>>` 做内容去重
- 图片处理使用 Rust 的 `image` crate，避免 JS 层大图片内存压力

### 安全
- 剪贴板内容不做网络传输（仅在被用户触发翻译/OCR 时发送）
- 剪贴板监听可被用户暂停（托盘菜单 "划词翻译 禁用"）

### 平台差异
- macOS: 3 种 Cmd+C 发送方式备选 → `CGEventPost` → `NSAppleScript` → `cliclick`
- Windows: `keybd_event` API + `SendInput` fallback
- Linux: `xdotool key ctrl+c` (X11) + `wtype -M ctrl c` (Wayland)

## 模块交互

```
clipboard.rs (Rust 层)
     │
     ├── get_selected_text()
     │   ├── 调用者: tray.rs (托盘菜单触发)
     │   ├── 调用者: hotkey.rs (快捷键触发)
     │   └── 处理流程:
     │       1. 保存当前剪贴板内容 (snapshot)
     │       2. 发送 Cmd+C / Ctrl+C (平台模拟)
     │       3. sleep 100ms (等待系统处理)
     │       4. 读取剪贴板新内容
     │       5. 恢复原剪贴板内容 (如果需要)
     │       6. 返回差异部分 (新内容 - snapshot)
     │
     ├── start_clipboard_monitor()
     │   ├── 启动: app_setup() 时 spawn 后台线程
     │   ├── 轮询: 500ms 间隔, hash 比对
     │   ├── emit: "clipboard-changed" → JS 层监听
     │   └── 消费者: Translate/index.jsx (弹出翻译窗口)
     │
     ├── cut_image(rect)
     │   ├── 依赖: screenshot.rs (全屏截图)
     │   ├── 处理: image crate crop + resize
     │   └── 消费者: Screenshot 窗口 (选区确认后)
     │
     └── copy_img / get_base64
         ├── copy_img: image → PNG bytes → clipboard
         └── get_base64: clipboard → image → base64 string
```

**上游依赖**：
- `tray.rs`：托盘开关控制监听启用/禁用
- `hotkey.rs`：快捷键触发 `get_selected_text()`
- `screenshot.rs`：`cut_image` 依赖全屏截图

**下游消费者**：
- `Translate/index.jsx`：监听 `clipboard-changed` 事件弹出翻译
- `OCR/index.jsx`：接受图片路径或 Base64
- `Screenshot/index.jsx`：选区确认后调用 `cut_image`

**平台适配**：
- macOS: 3 种 Cmd+C 方式备选，`CGEventPost` 优先
- Windows: `keybd_event` API 优先，`SendInput` 备选
- Linux (X11): `xdotool` 优先；Linux (Wayland): `wtype` + `wl-paste`

## 参考

- [35-prd-翻译窗口交互](./35-prd-翻译窗口交互.md) — 剪贴板变化触发翻译窗口
- [42-prd-Rust截图OCR语言检测](./42-prd-Rust截图OCR语言检测.md) — 截图模块（供 cut_image 调用）
- [41-prd-Rust托盘模块](./41-prd-Rust托盘模块.md) — 托盘控制剪贴板监听开关
- [49-prd-macOS平台适配](./49-prd-macOS平台适配.md) — macOS 辅助功能权限
- [50-prd-WindowsLinux平台适配](./50-prd-WindowsLinux平台适配.md) — X11/Wayland 剪贴板差异