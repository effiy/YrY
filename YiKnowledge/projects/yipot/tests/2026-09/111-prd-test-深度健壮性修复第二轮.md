---
doc_type: test
title: "YiPot 深度健壮性修复（第二轮）— 测试方案"
tags:
- 测试方案
- 健壮性
- panic防护
- 回归测试
- Rust
category: 项目/桌面应用/测试
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: test
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
test_id: YP-09-111
prd_ref: YP-09-65
dev_ref: YP-09-106
roles:
- engineer
---

# YiPot 深度健壮性修复（第二轮）— 测试方案

> 测试编号：YP-09-111 · 关联 PRD：YP-09-65 · 关联开发：YP-09-106

---

## 一、测试范围

| 模块 | 文件 | 测试类型 |
|------|------|----------|
| 前端入口 | `src/App.jsx` | 构建验证 + 功能回归 |
| Rust 备份 | `src-tauri/src/backup.rs` | 错误路径测试 |
| Rust 窗口 | `src-tauri/src/window.rs` | 错误路径测试 |
| Rust OCR | `src-tauri/src/system_ocr.rs` | 错误路径测试 |

---

## 二、测试用例

### TC-01: App.jsx warn 导入恢复

| 项 | 内容 |
|-----|------|
| **前置条件** | `app_theme` 设为 `system` |
| **步骤** | 1. 在 `matchMedia` 不支持的环境中运行（或 mock 抛异常） 2. 观察控制台 |
| **预期** | `warn("Can't detect system theme.")` 正常执行，不抛出 `ReferenceError` |
| **验证** | `pnpm build` 通过；ESLint `no-undef` 无报错 |

### TC-02: backup.rs — webdav get 无 $HOME

| 项 | 内容 |
|-----|------|
| **前置条件** | 取消 `$HOME` 环境变量 |
| **步骤** | 调用 `invoke('webdav', { operate: 'get', url: '...', username: '', password: '', name: 'backup.zip' })` |
| **预期** | 返回 `Error("Get Config Dir Error")`，不 panic |
| **验证** | 应用进程存活，返回结构化错误 |

### TC-03: backup.rs — local get 无 $HOME

| 项 | 内容 |
|-----|------|
| **前置条件** | 取消 `$HOME` |
| **步骤** | 调用 `invoke('local', { operate: 'get', path: '/tmp/backup.zip' })` |
| **预期** | 返回 `Error("Get Config Dir Error")`，不 panic |

### TC-04: backup.rs — aliyun get 无 $HOME

| 项 | 内容 |
|-----|------|
| **前置条件** | 取消 `$HOME` |
| **步骤** | 调用 `invoke('aliyun', { operate: 'get', path: '', url: 'https://...' })` |
| **预期** | 返回 `Error("Get Config Dir Error")`，不 panic |

### TC-05: window.rs — available_monitors 失败 (Wayland)

| 项 | 内容 |
|-----|------|
| **前置条件** | Wayland 环境（或 mock `available_monitors` 返回 Err） |
| **步骤** | 1. 选中文本 2. 触发翻译 (`text_translate`) |
| **预期** | `warn!("Failed to enumerate monitors: ...")` 记录日志，fallback 到 `primary_monitor()` |
| **验证** | 翻译窗口正常弹出 |

### TC-06: window.rs — ocr_recognize macOS 无缓存目录

| 项 | 内容 |
|-----|------|
| **前置条件** | macOS，模拟 `cache_dir()` 返回 `None` |
| **步骤** | 触发截图 OCR (`ocr_recognize`) |
| **预期** | `warn!("Get Cache Dir Failed")` 记录日志，函数 early return，不 panic |
| **验证** | 应用进程存活 |

### TC-07: window.rs — create_dir_all 失败

| 项 | 内容 |
|-----|------|
| **前置条件** | macOS，缓存父目录权限设为只读 |
| **步骤** | 触发截图 OCR |
| **预期** | `warn!("Create Cache Dir Failed: ...")` 记录日志，early return |
| **验证** | 应用不崩溃 |

### TC-08: system_ocr.rs — Windows 无 $HOME

| 项 | 内容 |
|-----|------|
| **前置条件** | Windows，取消 `$HOME` / `%USERPROFILE%` |
| **步骤** | 调用系统 OCR |
| **预期** | 返回 `Err("Get Cache Dir Failed")` |
| **验证** | 不 panic，结构化错误返回 |

### TC-09: system_ocr.rs — macOS 无缓存目录

| 项 | 内容 |
|-----|------|
| **前置条件** | macOS，模拟 `cache_dir()` 返回 `None` |
| **步骤** | 调用 `invoke('system_ocr', { lang: 'auto' })` |
| **预期** | 返回 `Err("Get Cache Dir Failed")` |
| **验证** | 不 panic |

### TC-10: system_ocr.rs — Linux 无 $HOME

| 项 | 内容 |
|-----|------|
| **前置条件** | Linux，取消 `$HOME` |
| **步骤** | 调用 `invoke('system_ocr', { lang: 'auto' })` |
| **预期** | 返回 `Err("Get Cache Dir Failed")` |
| **验证** | 不 panic |

---

## 三、回归测试

### 3.1 核心功能冒烟

| 功能 | 步骤 | 预期 |
|------|------|------|
| 划词翻译 | 选中文本 → `Ctrl+Shift+T` | 翻译窗口弹出，结果显示 |
| 截图 OCR | `Ctrl+Shift+Q` → 框选区域 | OCR 窗口弹出，识别文本正确 |
| 剪切板监听 | 复制文本 | 翻译窗口自动弹出 |
| 备份恢复 | 设置 → 备份 → 本地备份 → 恢复 | 配置恢复正确 |
| 系统 OCR | 截图 OCR 中使用系统 OCR 引擎 | 识别结果正确 |

### 3.2 第一轮修复回归

| 修复项 | 验证方法 |
|--------|---------|
| 配置损坏不崩溃 | 篡改 `store.json` 中 `proxy_enable` 为字符串 → 启动不 panic |
| HTTP 路由正确匹配 | `curl "http://127.0.0.1:60828/ocr_recognize?screenshot=true&lang=en"` → 正常触发 |
| 剪切板监听切换 | 设置中开关剪切板监听 → 正常工作 |
| 语言检测性能 | 连续 5 次划词翻译 → 每次检测延迟 < 1ms |
| 截图失败不崩溃 | Wayland 或无权限环境截图 → warn 日志，不 panic |
| 前端代码整洁 | `pnpm build` 无 dead code 警告 |

---

## 四、自动化检查

```bash
# Rust 编译（所有平台）
cargo check

# Rust lint — 检查残余 unwrap
cargo clippy -- -W clippy::unwrap_used 2>&1 | grep -c "unwrap"

# 前端构建
pnpm build
```

---

## 五、测试环境

| 环境 | 说明 |
|------|------|
| macOS 14+ | Apple Silicon + Intel，辅助功能权限已授权 |
| Windows 11 | WebView2 运行时，Windows.Media.OCR 语言包 |
| Linux (X11) | Tesseract 已安装 |
| Linux (Wayland) | GNOME/KDE，截图权限已配置 |

---

## 六、关联文档

| 类型 | 文件 |
|------|------|
| PRD | `../prds/2026-09/65-prd-深度健壮性修复第二轮.md` |
| 开发方案 | `../devs/2026-09/106-prd-task-深度健壮性修复第二轮.md` |
| Bug 011 | `../bugs/功能缺陷/011-Appjsx-warn未导入运行时错误.md` |
| Bug 012 | `../bugs/功能缺陷/012-backup-config-dir-unwrap残留.md` |
| Bug 013 | `../bugs/功能缺陷/013-window-systemocr-cache-expect-monitor-unwrap.md` |