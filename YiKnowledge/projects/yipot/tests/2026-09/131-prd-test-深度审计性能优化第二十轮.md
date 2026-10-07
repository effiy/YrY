---
doc_type: test
title: "YiPot 深度审计与性能优化（第二十轮）— 测试方案"
status: 已完成
priority: P2
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["82-prd-深度审计性能优化第二十轮"]
source_modules: ["124-prd-task-深度审计性能优化第二十轮"]
tags: [测试方案, 深度审计, 性能优化, 安全验证]
category: projects/yipot/tests
source: 内部
type: test
---

# YiPot 深度审计与性能优化（第二十轮）— 测试方案

> 测试编号：YP-09-82 · 优先级：P2

---

## 测试目标

验证第二十轮深度审计的 6 个维度：Rust 错误传播、整数溢出、资源清理、依赖安全、并发安全、性能基准。

---

## 测试环境

| 条件 | 值 |
|------|-----|
| 仓库 | `YrY/YiPot` (main) |
| Rust | 1.75+ stable |
| Node | 18+ |
| 平台 | macOS 14+ / Windows 11 / Linux (Ubuntu 22.04) |
| 工具 | `cargo audit`, `npm audit`, `cargo clippy` |

---

## 测试用例

### TC-1: Rust 错误传播路径

| 维度 | 内容 |
|------|------|
| **操作** | `rg 'unwrap\(\)\|expect\(' src-tauri/src/ --type rust` |
| **预期** | 仅 `Mutex::lock().unwrap()` 出现（parking_lot 无 poisoning，安全） |
| **操作** | `rg '\.ok()\|let _ =' src-tauri/src/ --type rust` |
| **预期** | 无错误吞没（`ok()` 仅用于可选操作如 `env::var`） |

### TC-2: 整数溢出防护

| 维度 | 内容 |
|------|------|
| **操作** | 审查 `window.rs` 中所有 `as` 类型转换 |
| **预期** | 转换路径有隐式范围约束（窗口管理器保证），无未检查的 `as` |
| **操作** | `cargo clippy -- -W clippy::cast_possible_truncation` |
| **预期** | 无新增 warning（已知 window.rs 的 `u32 as i32` 允许） |

### TC-3: 资源清理

| 维度 | 内容 |
|------|------|
| **操作** | 审查 `backup.rs` 中 `File::create` 的作用域 |
| **预期** | 文件句柄在函数返回前正确 drop（RAII） |
| **操作** | 审查 `clipboard.rs` 中 `MutexGuard` 生命周期 |
| **预期** | 锁在 `{}` 块结束时释放，不跨函数边界持有 |
| **操作** | 审查 `cmd.rs` 中 `Command::spawn` 的 `wait()` |
| **预期** | 子进程有明确的等待或清理逻辑 |

### TC-4: 依赖安全

| 维度 | 内容 |
|------|------|
| **操作** | `cd src-tauri && cargo audit` |
| **预期** | 0 vulnerabilities |
| **操作** | `npm audit --production` |
| **预期** | 0 critical, 0 high |
| **操作** | `cargo tree --depth 1 \| wc -l` |
| **预期** | 直接依赖 ≤ 25（避免依赖膨胀） |

### TC-5: 并发安全

| 维度 | 内容 |
|------|------|
| **操作** | 审查 `ClipboardMonitorEnableWrapper::start()` / `stop()` |
| **预期** | `lock()` → 检查 → 修改 在同一临界区，无 TOCTOU |
| **操作** | `rg 'Mutex\|RwLock\|RefCell' src-tauri/src/ --type rust` |
| **预期** | 仅 `ClipboardMonitorEnableWrapper` 一处 Mutex 使用，无嵌套锁 |

### TC-6: 性能基准

| 维度 | 内容 |
|------|------|
| **操作** | `Lazy<LanguageDetector>` 首次调用 vs 后续调用计时 |
| **预期** | 首次 ~200ms（加载模型），后续 <1ms（单例缓存） |
| **操作** | `ApiClient.get/post` 超时测试 |
| **预期** | 30s 超时触发，不无限挂起 |
| **操作** | 翻译服务 config null 场景 |
| **预期** | 所有 21 个翻译引擎 config null 时不 panic |

### TC-7: Clippy 零警告

| 维度 | 内容 |
|------|------|
| **操作** | `cargo clippy --all-targets -- -D warnings` |
| **预期** | 编译通过，零 warning/error |

### TC-8: 构建验证

| 维度 | 内容 |
|------|------|
| **操作** | `cargo build --release` |
| **预期** | 编译通过 |
| **操作** | `npm run build` |
| **预期** | 前端构建通过 |

---

## 回归检查

| 检查项 | 方法 |
|--------|------|
| 前 19 轮修复项无回归 | 运行现有测试套件 |
| 翻译引擎全量可用 | 遍历 21 个 Provider，确认 config 读取正常 |
| OCR 引擎可用 | 测试 baidu/tencent/iflytek/volcengine 4 个 OCR Provider |
| 剪贴板监听正常 | 启动应用 → 复制文本 → 确认弹窗 |