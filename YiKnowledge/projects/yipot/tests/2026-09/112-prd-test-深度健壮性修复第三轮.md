---
doc_type: test
title: "YiPot 深度健壮性修复（第三轮）— 测试方案"
tags:
- 测试方案
- 健壮性
- panic防护
- cmd
- tray
- config
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
test_id: YP-09-112
prd_ref: YP-09-66
dev_ref: YP-09-107
roles:
- engineer
---

# YiPot 深度健壮性修复（第三轮）— 测试方案

> 测试编号：YP-09-112 · 关联 PRD：YP-09-66 · 关联开发：YP-09-107

---

## 一、测试范围

| 模块 | 测试类型 | 用例数 |
|------|---------|--------|
| `cmd.rs` — 图像操作 | 错误路径 | 5 |
| `cmd.rs` — set_proxy | 配置损坏 | 3 |
| `cmd.rs` — 插件 | 错误路径 | 3 |
| `config.rs` — 初始化 | 启动测试 | 1 |
| `hotkey.rs` — 注册 | 配置损坏 | 1 |
| `tray.rs` — 托盘/日志/退出 | 配置损坏 + 错误路径 | 5 |

---

## 二、测试用例

### TC-01~04: cmd.rs 图像操作 — 无 $HOME

| 项 | 内容 |
|-----|------|
| **前置条件** | 取消 `$HOME` 环境变量 |
| **步骤** | 分别调用 `cut_image`/`get_base64`/`copy_img` |
| **预期** | `cut_image`/`get_base64` early return（不崩溃），`copy_img` 返回 `Err("Get Cache Dir Failed")` |

### TC-05: cmd.rs get_base64 — 文件不存在

| 项 | 内容 |
|-----|------|
| **步骤** | 在截图之前调用 `get_base64`（无 `pot_screenshot_cut.png`） |
| **预期** | 返回 `""`，不 panic |

### TC-06~08: cmd.rs set_proxy — 配置类型错误

| 项 | 内容 |
|-----|------|
| **步骤** | 将 `store.json` 中 `proxy_host` 改为 `null`，`proxy_port` 改为 `"8080"` |
| **预期** | `set_proxy()` 使用默认值，不 panic |

### TC-09: cmd.rs install_plugin — 非 UTF-8 文件名

| 项 | 内容 |
|-----|------|
| **步骤** | 传入含无效 UTF-8 字节的路径 |
| **预期** | 返回 `Err("Invalid Plugin: invalid file name")` |

### TC-10~11: cmd.rs 插件 — 无 $HOME

| 项 | 内容 |
|-----|------|
| **步骤** | 取消 `$HOME`，调用 `install_plugin`/`run_binary` |
| **预期** | 返回 `Err("Get Config Dir Failed")` |

### TC-12: config.rs init_config — 无 $HOME

| 项 | 内容 |
|-----|------|
| **步骤** | 取消 `$HOME`，启动 YiPot |
| **预期** | `panic!("Cannot determine config directory — HOME may not be set")`，提供清晰诊断信息 |

### TC-13: hotkey.rs — 快捷键配置损坏

| 项 | 内容 |
|-----|------|
| **步骤** | 将 `store.json` 中 `hotkey_selection_translate` 改为 `123`（整数） |
| **预期** | 快捷键注册静默失败，不 panic |

### TC-14~15: tray.rs update_tray — 配置类型错误

| 项 | 内容 |
|-----|------|
| **步骤** | 将 `app_language` 改为 `null`，`translate_auto_copy` 改为 `123` |
| **预期** | 使用默认值 `"en"`/`"disable"`，不 panic |

### TC-16: tray.rs — 剪切板监听配置损坏

| 项 | 内容 |
|-----|------|
| **步骤** | 将 `clipboard_monitor` 改为 `"true"`（字符串） |
| **预期** | `unwrap_or(false)` → `false`，不 panic |

### TC-17: tray.rs — 查看日志目录不存在

| 项 | 内容 |
|-----|------|
| **步骤** | 删除日志目录，点击托盘"查看日志" |
| **预期** | `warn!("Failed to get log dir")`，不 panic |

### TC-18: tray.rs — 退出时快捷键注销失败

| 项 | 内容 |
|-----|------|
| **步骤** | 快捷键管理器处于异常状态，点击退出 |
| **预期** | `unwrap_or_default()` 静默处理，应用正常退出 |

---

## 三、回归测试

### 3.1 核心功能完整性

| 功能 | 步骤 | 预期 |
|------|------|------|
| 截图裁剪翻译 | `Ctrl+Shift+T` → 划词翻译 | 翻译窗口正常 |
| 截图 OCR | `Ctrl+Shift+Q` → 框选 → OCR | 识别正常 |
| 复制图片到剪切板 | 截图后复制图片 | 粘贴正常 |
| 代理设置 | 设置 HTTP 代理 | 环境变量正确设置 |
| 插件安装 | 安装 .potext 文件 | 插件目录创建正确 |
| 快捷键注册 | 修改快捷键 | 新快捷键生效 |
| 托盘菜单 | 右键托盘 → 所有菜单项 | 功能正常响应 |
| 查看日志 | 托盘 → 查看日志 | 文件管理器打开 |
| 退出应用 | 托盘 → 退出 | 快捷键注销 + 退出 |

### 3.2 前两轮修复回归

- 配置损坏不崩溃（main.rs config unwrap fix）
- 截图 Wayland 不崩溃（screenshot.rs fix）
- 备份无 $HOME 不崩溃（backup.rs fix）
- 系统 OCR 无缓存不崩溃（system_ocr.rs fix）

---

## 四、自动化检查

```bash
cargo check
cargo clippy -- -W clippy::unwrap_used 2>&1 | grep -c "unwrap"
```

---

## 五、关联文档

| 类型 | 文件 |
|------|------|
| PRD | `../prds/2026-09/66-prd-深度健壮性修复第三轮.md` |
| 开发方案 | `../devs/2026-09/107-prd-task-深度健壮性修复第三轮.md` |
| Bug 014 | `../bugs/功能缺陷/014-cmd-图像代理插件-unwrap-panic.md` |
| Bug 015 | `../bugs/功能缺陷/015-config-hotkey-unwrap-panic.md` |
| Bug 016 | `../bugs/功能缺陷/016-tray-托盘日志退出-unwrap-panic.md` |