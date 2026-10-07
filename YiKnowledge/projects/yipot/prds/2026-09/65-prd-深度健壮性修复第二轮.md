---
title: "YiPot 深度健壮性修复（第二轮）— PRD"
tags: [PRD, YiPot, 健壮性, panic防护, 运行时错误, 代码质量]
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
prd_id: YP-09-65
doc_type: prd
roles: [engineer, leader]
---

# YiPot 深度健壮性修复（第二轮）— PRD

> 编号：YP-09-65 · 优先级：P1 · 状态：已完成

---

## 一、需求背景

第一轮健壮性修复（PRD 60）解决了 Rust 配置读取 `unwrap()`、HTTP 路由 URL 解析缺陷、剪切板布尔反模式、前端死代码等 7 个问题。但审计发现仍有遗漏：

1. **App.jsx 运行时错误** — `warn()` 调用未导入（第一轮修复引入的回归）
2. **backup.rs 残留 panic** — `local()`/`aliyun()`/`webdav()` get 分支中 3 处 `config_dir().unwrap()`
3. **window.rs 崩溃风险** — `available_monitors()`/`cache_dir()`/`create_dir_all()` 的 `unwrap`/`expect`
4. **system_ocr.rs 崩溃风险** — 三个平台 3 处 `cache_dir().expect()`

## 二、症状与影响

| 问题 | 触发条件 | 用户体验 | 严重度 |
|------|---------|---------|--------|
| `warn()` 未导入 | 系统主题检测 `matchMedia` 抛异常 | 旧版 WebView2 中应用崩溃 | **P0 阻断** |
| `config_dir().unwrap()` | 无 `$HOME` 环境变量 | 备份恢复功能崩溃 | P2 一般 |
| `available_monitors().unwrap()` | Wayland 权限拒绝 | 窗口定位崩溃 | P1 严重 |
| `cache_dir().expect()` ocr | 无 `$HOME` | 截图 OCR 崩溃 | P1 严重 |
| `cache_dir().expect()` system_ocr | 无 `$HOME` | 系统 OCR 崩溃 | P1 严重 |

## 三、验收标准

- [x] `warn` 导入恢复，`pnpm build` 通过
- [x] `backup.rs` 全部 3 处 `config_dir()` 调用使用 `match` + 错误返回
- [x] `window.rs` 全部 4 处 `expect`/`unwrap` 替换为安全 fallback
- [x] `system_ocr.rs` 全部 3 平台 `cache_dir().expect()` 替换为 `match` + `Err`
- [x] `cargo check` 编译通过
- [x] `pnpm build` 构建通过

## 四、涉及模块

| 模块 | 文件 | 变更类型 |
|------|------|----------|
| 前端入口 | `src/App.jsx` | 修复 — 恢复 `warn` 导入 |
| Rust 备份 | `src-tauri/src/backup.rs` | 修复 — 3 处 `unwrap` → `match` |
| Rust 窗口 | `src-tauri/src/window.rs` | 修复 — 4 处 `expect`/`unwrap` → `match` |
| Rust OCR | `src-tauri/src/system_ocr.rs` | 修复 — 3 处 `expect` → `match` |

## 五、非目标

- 不涉及 Windows COM `.unwrap()` 链修复（需要 Windows 测试环境验证）
- 不涉及 `window.rs` 窗口初始化时的 `.unwrap()`（`APP.get()`、`build()` 等在 setup 后保证可用）
- 不涉及功能变更或 API 契约修改

## 六、风险与缓解

| 风险 | 缓解 |
|------|------|
| Wayland 环境 `available_monitors()` 失败后 `primary_monitor()` 也可能失败 | 增加 `unwrap_or(None)` 链 + panic 作为最终 fallback（无显示器应用无法运行） |
| macOS OCR 的 `screencapture` 进程调用依赖缓存路径 | `cache_dir()` 失败时 early return + `warn!` 日志，不阻塞应用 |
| 修改涉及多个文件可能引入新问题 | `cargo check` + `pnpm build` 验证，修改均为局部替换 |

## 七、关联文档

| 类型 | 文件 |
|------|------|
| 开发方案 | `../devs/2026-09/106-prd-task-深度健壮性修复第二轮.md` |
| 测试方案 | `../tests/2026-09/111-prd-test-深度健壮性修复第二轮.md` |
| Bug | `../bugs/功能缺陷/011-Appjsx-warn未导入运行时错误.md` |
| Bug | `../bugs/功能缺陷/012-backup-config-dir-unwrap残留.md` |
| Bug | `../bugs/功能缺陷/013-window-systemocr-cache-expect-monitor-unwrap.md` |
| 前序 PRD | `60-prd-代码质量与健壮性修复.md` |
| 前序开发 | `../devs/2026-09/100-prd-task-代码质量与健壮性修复.md` |