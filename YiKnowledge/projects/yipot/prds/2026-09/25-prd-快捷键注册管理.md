---
doc_type: prd
title: "YP-09-S14: 全局快捷键注册与管理"
status: 已完成
priority: P0
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S14
estimate_frontend: 1.0
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, 快捷键, 热键, 全局]
category: 项目/桌面应用/需求
---

# YP-09-S14: 全局快捷键注册与管理

> 需求编号：YP-09-S14 · 优先级：P0 · 人天：1.0d · 状态：已完成

## 背景

划词翻译的核心体验依赖全局快捷键——用户在任何应用中选中文本，按下快捷键即可翻译。这要求快捷键在系统级别注册，即使 Pot 窗口不在前台也能响应。

## 需求

### 四大快捷键

| 功能 | 配置键 | Rust 回调 |
|------|--------|----------|
| 划词翻译 | `hotkey_selection_translate` | `selection_translate()` |
| 输入翻译 | `hotkey_input_translate` | `input_translate()` |
| 截图 OCR | `hotkey_ocr_recognize` | `ocr_recognize()` |
| 截图翻译 | `hotkey_ocr_translate` | `ocr_translate()` |

### 注册机制 (Rust)

```rust
// hotkey.rs
fn register(app_handle, name, handler, key) -> Result<(), String> {
    let hotkey = key.is_empty() ? get(name) : key;
    app_handle.global_shortcut_manager().register(hotkey, handler)
}
```

### 前端自定义

```javascript
// React → invoke Rust 命令
invoke("register_shortcut_by_frontend", {
  name: "hotkey_selection_translate",
  shortcut: "Ctrl+Alt+T"
});
```

### 快捷键录制器

`Config/pages/Hotkey/index.jsx`:
- 点击录制 → 按下组合键 → 显示当前快捷键
- 冲突检测：同快捷键绑定多个功能时警告
- 一键恢复默认

## 验收标准

- [ ] 4 个快捷键启动时自动注册
- [ ] 自定义快捷键立即生效
- [ ] 冲突检测提示
- [ ] 空快捷键 = 不注册

---

## 边界条件与异常处理

| 输入条件 | 分类 | 预期行为 | 降级策略 |
|---------|------|---------|---------|
| 单键无修饰键 | 边界 | 拒绝注册，提示需要修饰键 | — |
| 两个功能设置相同快捷键 | 异常 | 自动释放旧绑定，注册新绑定 | "已替换「功能名」的快捷键" |
| 快捷键超过 4 个修饰键 | 边界 | 允许注册（系统支持即可） | — |
| 重置默认快捷键时部分被占用 | 边界 | 能注册多少注册多少 | 冲突的跳过并提示 |
| 快捷键录制器输入非法键 | 边界 | 过滤，仅接受合法组合 | — |

---

## 非功能需求

| 类别 | 指标 | 目标值 | 验证方法 |
|------|------|--------|---------|
| 性能 | 快捷键注册耗时 | ≤ 50ms/个 | Rust 注册计时 |
| 性能 | 快捷键修改生效 | ≤ 500ms | 修改后立即测试 |
| 可靠性 | 注册失败恢复 | 重试 2 次 | 失败注入测试 |

---

## 模块交互依赖

| 依赖方向 | 模块 | 交互方式 | 数据格式 |
|---------|------|---------|---------|
| 依赖 | Tauri GlobalShortcutManager | Rust API | `register(hotkey, handler)` |
| 依赖 | Rust config store | Tauri invoke | `hotkey_*` 配置项 |
| 依赖 | React Hotkey 设置页 | UI 录制器 | 快捷键录制 + 冲突检测 |
| 被依赖 | 划词/OCR/截图翻译逻辑 | Tauri event | 快捷键触发 → 功能回调 |

---

## 相关文档

- 开发方案: [25-prd-task-快捷键注册管理](../../devs/2026-09/25-prd-task-快捷键注册管理.md)
- 测试方案: [25-prd-test-快捷键注册管理](../../tests/2026-09/25-prd-test-快捷键注册管理.md)
- 桌面集成与快捷键: [07-prd-桌面集成与快捷键](./07-prd-桌面集成与快捷键.md)