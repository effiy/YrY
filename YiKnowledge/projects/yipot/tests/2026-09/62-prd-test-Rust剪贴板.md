---

doc_type: test
title: "Rust 剪贴板模块 — 测试方案"
status: 已完成
priority: P0
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["40-prd-Rust剪贴板模块"]
source_modules: ["40-prd-Rust剪贴板模块"]

type: test
---

# Rust 剪贴板模块 — 测试方案

> 覆盖 YP-09-R01：`clipboard.rs` 选中文本读取、剪贴板监听、图片读写操作

---

## 一、核心功能测试

### 1.1 读取选中文本

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-CLIP-001 | macOS 获取选中文本 | 选中文本 → Cmd+C 模拟 → 读取 | 返回选中文本 |
| TC-CLIP-002 | Windows 获取选中文本 | 选中文本 → Ctrl+C 模拟 → 读取 | 返回选中文本 |
| TC-CLIP-003 | Linux xclip 获取 | 选中文本 → 调用 xclip | 返回选中文本 |
| TC-CLIP-004 | Linux wl-clipboard | Wayland 环境选中文本 | 返回选中文本 |
| TC-CLIP-005 | 剪贴板恢复 | 原剪贴板含"A" → 选"B"触发翻译 → 检查 | 剪贴板恢复为"A" |
| TC-CLIP-006 | 无选中文本 | 无任何选中 → 调用 get_selected_text | 返回空字符串 |

### 1.2 剪贴板监听

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-CLIP-010 | 监听启动 | 调用 start_clipboard_monitor | 后台线程 500ms 轮询 |
| TC-CLIP-011 | 内容变化事件 | 复制新内容 → 等待 | emit "clipboard-changed" 事件 |
| TC-CLIP-012 | 去重检测 | 连续两次复制相同内容 | 仅触发一次 "clipboard-changed" |
| TC-CLIP-013 | 监听停止 | 应用退出 | 后台线程正常停止 |

### 1.3 图片操作

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-CLIP-020 | 裁剪图片 | 调用 cut_image(img, rect) | 返回裁剪后的图片 |
| TC-CLIP-021 | 图片转 Base64 | 调用 get_base64(img) | 返回合法 Base64 字符串 |
| TC-CLIP-022 | 复制图片到剪贴板 | 调用 copy_img(img) | 图片出现在系统剪贴板，可粘贴 |
| TC-CLIP-023 | 矩形超边界裁剪 | rect 超出图片边界 | 裁剪到图片边界内 |

---

## 二、边界与异常测试

| 编号 | 场景 | 触发条件 | 预期行为 | 恢复策略 |
|------|------|----------|----------|----------|
| TC-CLIP-EDGE-01 | 模拟 Cmd/Ctrl+C 超时 | 系统卡顿 5s+ | 超时返回空字符串 | 不阻塞应用 |
| TC-CLIP-EDGE-02 | 剪贴板权限被拒绝 | macOS 隐私设置禁止 | 返回空或错误 | 提示用户授权 |
| TC-CLIP-EDGE-03 | Linux xclip 未安装 | 调用 get_selected_text | 返回错误提示安装 xclip | — |
| TC-CLIP-EDGE-04 | 剪贴板内容过大 | 复制 100MB 文本 | 截断或限制读取大小 | — |
| TC-CLIP-EDGE-05 | 图片格式不支持 | 复制 TIFF 图片 | copy_img 返回适配错误 | 提示支持的格式 |
| TC-CLIP-EDGE-06 | 剪贴板含富文本 | HTML/RTF 剪贴板内容 | 读取纯文本版本 | 降级到 plain text |
| TC-CLIP-EDGE-07 | 剪贴板为空 | 系统剪贴板空 | 返回空字符串 | — |

---

## 三、性能基准测试

| 编号 | 测试场景 | 测量指标 | 基准值 | 劣化阈值 | 测试方法 |
|------|---------|---------|--------|---------|---------|
| TC-CLIP-PERF-01 | get_selected_text 延迟 | 读取延迟 | < 200ms | > 500ms | 含 Cmd/Ctrl+C 模拟 |
| TC-CLIP-PERF-02 | 剪贴板恢复延迟 | 恢复延迟 | < 100ms | > 300ms | 恢复原剪贴板内容 |
| TC-CLIP-PERF-03 | 监听轮询 CPU | 空闲 CPU 占用 | < 1% | > 5% | top/Activity Monitor |
| TC-CLIP-PERF-04 | cut_image 延迟 | 300x300 裁剪 | < 50ms | > 150ms | 纯 Rust 操作 |
| TC-CLIP-PERF-05 | get_base64 延迟 | 1920x1080 截图 | < 200ms | > 500ms | 含编码成本 |
| TC-CLIP-PERF-06 | 监听去重比较 | 相同内容比较 | < 1ms | > 5ms | 字符串/哈希比较 |

---

## 四、平台兼容测试

| 编号 | 测试项 | 测试平台 | 预期结果 | 优先级 |
|------|--------|---------|---------|--------|
| TC-CLIP-PLT-01 | macOS Cmd+C 模拟 | macOS 13+ | 正确获取选中文本 | P0 |
| TC-CLIP-PLT-02 | Windows Ctrl+C 模拟 | Windows 10/11 | 正确获取选中文本 | P0 |
| TC-CLIP-PLT-03 | Linux xclip | Ubuntu/Debian | 正确获取选中文本 | P1 |
| TC-CLIP-PLT-04 | Linux wl-clipboard | Wayland (Fedora) | 正确获取选中文本 | P1 |
| TC-CLIP-PLT-05 | 剪贴板恢复 macOS | macOS | 剪贴板内容正确恢复 | P0 |
| TC-CLIP-PLT-06 | 剪贴板恢复 Windows | Windows | 剪贴板内容正确恢复 | P0 |
| TC-CLIP-PLT-07 | 图片复制 macOS | macOS | copy_img 到 Preview 可粘贴 | P1 |
| TC-CLIP-PLT-08 | 图片复制 Windows | Windows | copy_img 到 Paint 可粘贴 | P1 |

---

## 五、回归测试清单

| 编号 | 回归用例 | 覆盖功能 | 自动化 | 优先级 |
|------|---------|---------|--------|--------|
| REG-CLIP-01 | macOS 选中文本读取 | get_selected_text | 否 | P0 |
| REG-CLIP-02 | Windows 选中文本读取 | get_selected_text | 否 | P0 |
| REG-CLIP-03 | 剪贴板恢复 | 恢复原内容 | 否 | P0 |
| REG-CLIP-04 | 监听去重 | 相同内容不重复触发 | 否 | P1 |
| REG-CLIP-05 | 图片裁剪+Base64 | cut_image/get_base64 | 否 | P1 |
| REG-CLIP-06 | 图片复制到剪贴板 | copy_img | 否 | P1 |
| REG-CLIP-07 | Linux xclip/wl-paste | Linux 选中文本 | 否 | P1 |
| REG-CLIP-08 | 无选中返回空 | 空选中 | 否 | P2 |

---

## 六、参考文档

- [40-prd-Rust剪贴板模块](../prds/2026-09/40-prd-Rust剪贴板模块.md) — 源 PRD
- [35-prd-翻译窗口交互](../prds/2026-09/35-prd-翻译窗口交互.md) — 剪贴板监听驱动翻译窗口
- [42-prd-Rust截图OCR语言检测](../prds/2026-09/42-prd-Rust截图OCR语言检测.md) — 截图模块依赖剪贴板