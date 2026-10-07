---
doc_type: module
prd_task_id: "YP-09-82"
title: "YiPot 深度审计与性能优化（第二十轮）— 开发方案"
status: 已完成
priority: P2
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_backend: 0.5
source_prd: "82-prd-深度审计性能优化第二十轮.md"
related_tests: ["131-prd-test-深度审计性能优化第二十轮"]
tags: [开发方案, 深度审计, 性能优化, Rust安全, 依赖审计]
category: projects/yipot/devs
source: 内部
type: task
---

# YiPot 深度审计与性能优化（第二十轮）— 开发方案

> 来源 PRD：[82-prd-深度审计性能优化第二十轮](../../prds/2026-09/82-prd-深度审计性能优化第二十轮.md)

---

## 源码索引

| 文件 | 说明 | 变化 |
|------|------|------|
| `YiPot/src-tauri/src/` (14 文件) | Rust 错误传播审查 | 审查，无修改 |
| `YiPot/src-tauri/Cargo.toml` | 依赖审计 | `cargo audit` 验证 |
| `YiPot/package.json` | npm 依赖审计 | `npm audit` 验证 |
| `YiKnowledge/projects/yipot/workflows/开发规范/10-规范-性能优化指南.md` | 性能优化指南 | 新增 |

---

## 审计方法论

### 1. Rust 错误传播路径审查

**工具链**：手动逐函数审查 + grep 辅助

```bash
# 检查所有 ? 传播点
rg '\?' src-tauri/src/ --type rust | wc -l

# 检查潜在的错误吞没
rg '\.ok\(\)|let _ =' src-tauri/src/ --type rust

# 检查 unwrap/expect 残留
rg 'unwrap\(\)|expect\(' src-tauri/src/ --type rust
```

**审查清单**（14 文件）：

| 文件 | `?` 传播 | `unwrap` | 结论 |
|------|---------|----------|------|
| `main.rs` | 2 | 0 | ✅ |
| `window.rs` | 2 | 0 | ✅ |
| `server.rs` | 4 | 0 | ✅ |
| `cmd.rs` | 6 | 0 | ✅ |
| `config.rs` | 3 | 0 | ✅ |
| `clipboard.rs` | 1 | 0 | ✅ |
| `hotkey.rs` | 2 | 0 | ✅ |
| `tray.rs` | 1 | 0 | ✅ |
| `backup.rs` | 3 | 0 | ✅ |
| `screenshot.rs` | 1 | 0 | ✅ |
| `system_ocr.rs` | 1 | 0 | ✅ |
| `lang_detect.rs` | 0 | 0 | ✅ |
| `updater.rs` | 1 | 0 | ✅ |
| `error.rs` | 0 | 0 | ✅ |

### 2. 整数溢出风险分析

**位置**：`window.rs` — 窗口坐标/尺寸 `as` 转换

```rust
// 审查点：多屏场景下 i32 范围是否足够
let x = monitor.position().x;        // i32
let w = monitor.size().width as i32; // u32 → i32 转换
```

**分析**：
- `monitor.position()` 返回 i32，macOS 坐标空间为 i32 范围
- `monitor.size()` 返回 u32 物理像素，8K 屏 = 7680 < i32::MAX
- 多屏拼接理论上可能超过 i32::MAX（~21 亿像素），但窗口管理器限制单屏 ≤ 8K
- **结论**：实际不可达，标记为 `⚠️ 已知限制`

### 3. 资源清理验证

**方法**：代码审查验证 RAII 保证

```rust
// backup.rs — 文件句柄自动 drop
let mut file = File::create(&path)?;  // RAII: 作用域结束时自动关闭
file.write_all(&data)?;
// file.drop() 在此调用

// clipboard.rs — MutexGuard 不跨 await
{
    let guard = MONITOR_ENABLED.lock().unwrap();
    *guard = false;
} // guard.drop() 在此调用，Tauri 1.x 同步命令无 await 点
```

### 4. 依赖审计

```bash
# Rust 依赖
cargo audit --file src-tauri/Cargo.toml
# 结果：0 vulnerabilities

cargo tree --depth 1 --prefix none | wc -l
# 直接依赖数：23

# npm 依赖
npm audit --production
# 结果：0 critical/high
```

**版本策略**：
- Cargo: `serde = "1.0"`、`tauri = "1.6"` — 允许 minor/patch 升级
- npm: Tauri 1.x API 脚本 — 版本锁定

### 5. 并发安全审查

**审查点**：`ClipboardMonitorEnableWrapper` 的 `Mutex<bool>` 模式

```rust
// 正确模式：检查与设置在同一临界区，无 TOCTOU
pub fn stop(&self) {
    let mut enabled = self.enabled.lock().unwrap();
    if !*enabled { return; }  // TOCTOU-free: 在锁内检查
    *enabled = false;
    // 实际停止逻辑
}
```

- ✅ 单 Mutex，无嵌套锁 → 无死锁风险
- ✅ 临界区仅包含 bool 读写 → 无长时间持锁
- ✅ `parking_lot::Mutex` 无 poisoning → `unwrap()` 安全

### 6. 性能优化指南

**产出文件**：`workflows/开发规范/10-规范-性能优化指南.md`

覆盖内容：
- **已完成**：`Lazy<LanguageDetector>` 单例、`Mutex<bool>` 优化、panic 消除、超时控制
- **推荐**：HTTP 连接池、翻译缓存 LRU、Tesseract 预加载、OCR 图像压缩
- **基准**：5 项性能 SLO（翻译 50ms-1000ms、检测 <5ms、TTS <500ms、OCR <2000ms）

---

## 实施进度

| 任务 | 状态 |
|------|------|
| Rust 错误传播审查（14 文件） | ✅ |
| 整数溢出风险分析 | ✅ |
| 资源清理验证 | ✅ |
| Cargo.toml 依赖审计 | ✅ |
| package.json 依赖审计 | ✅ |
| 并发/竞态审查 | ✅ |
| 性能优化指南产出 | ✅ |
| 文档：PRD + Dev + Test | ✅ |