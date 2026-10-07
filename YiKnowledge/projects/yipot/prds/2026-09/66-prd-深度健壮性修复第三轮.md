---
title: "YiPot 深度健壮性修复（第三轮）— PRD"
tags: [PRD, YiPot, 健壮性, panic防护, 代码质量, cmd, tray, hotkey, config]
category: projects/yipot/prds
created: 2026-09-23
updated: 2026-09-23
source: internal
type: 需求
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
prd_id: YP-09-66
doc_type: prd
roles: [engineer, leader]
---

# YiPot 深度健壮性修复（第三轮）— PRD

> 编号：YP-09-66 · 优先级：P1 · 状态：已完成

---

## 一、需求背景

前两轮健壮性修复（PRD 60 + PRD 65）覆盖了 `main.rs`/`window.rs`/`server.rs`/`backup.rs`/`screenshot.rs`/`system_ocr.rs`/`lang_detect.rs`/`clipboard.rs`/`App.jsx` 共 9 个文件的 panic 防护。本轮对剩余 4 个 Rust 模块 `cmd.rs`/`config.rs`/`hotkey.rs`/`tray.rs` 进行全量审计，消灭 Rust 代码中**全部未受保护的 `unwrap()` 调用**。

## 二、症状与影响

| 位置 | 数量 | 典型触发场景 | 严重度 |
|------|------|------------|--------|
| `cmd.rs` 图像/代理/插件 | 12 处 | 无 `$HOME`、截图文件丢失、代理配置损坏、非 UTF-8 路径 | **P1** |
| `config.rs` 初始化 | 1 处 | 无 `$HOME` → 启动崩溃 | **P0** |
| `hotkey.rs` 注册 | 1 处 | 快捷键配置损坏 | P2 |
| `tray.rs` 托盘/日志/退出 | 9 处 | 配置损坏、日志目录不存在 | **P1** |

## 三、验收标准

- [x] `cmd.rs` 全部 `expect`/`unwrap` 替换为 `match`/`unwrap_or`
- [x] `config.rs` 启动 panic 给出明确错误信息
- [x] `hotkey.rs` 配置读取使用 `unwrap_or("")`
- [x] `tray.rs` 全部 `unwrap` 替换为安全 fallback
- [x] `cargo check` 编译通过
- [ ] `cargo clippy -- -W clippy::unwrap_used` 残余 warn 全部合理（仅保留 `setup()` 初始化阶段的不可恢复代码）

## 四、涉及模块

本次修复完成后，`src-tauri/src/` 下所有 14 个 Rust 源文件的 `unwrap`/`expect` 审计全部完成：

| 模块 | 本轮修复 | 状态 |
|------|---------|------|
| `cmd.rs` | 12 处 | ✅ |
| `config.rs` | 1 处 | ✅ |
| `hotkey.rs` | 1 处 | ✅ |
| `tray.rs` | 9 处 | ✅ |
| 前两轮已修复 | main/window/server/backup/screenshot/clipboard/lang_detect/system_ocr | ✅ |

## 五、非目标

- 不涉及 Windows COM `.unwrap()` 链修复（`system_ocr.rs` Windows 实现，需 Windows 测试环境）
- 不涉及 Tauri 框架 `build().unwrap()` 等应用初始化不可恢复代码
- 不涉及功能变更

## 六、关联文档

| 类型 | 文件 |
|------|------|
| 开发方案 | `../devs/2026-09/107-prd-task-深度健壮性修复第三轮.md` |
| 测试方案 | `../tests/2026-09/112-prd-test-深度健壮性修复第三轮.md` |
| Bug 014 | `../bugs/功能缺陷/014-cmd-图像代理插件-unwrap-panic.md` |
| Bug 015 | `../bugs/功能缺陷/015-config-hotkey-unwrap-panic.md` |
| Bug 016 | `../bugs/功能缺陷/016-tray-托盘日志退出-unwrap-panic.md` |
| 前序 PRD | `65-prd-深度健壮性修复第二轮.md` |