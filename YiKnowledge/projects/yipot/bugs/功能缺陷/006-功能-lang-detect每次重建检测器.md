---
title: "lang_detect 每次调用重建 LanguageDetector 导致 ~200ms 额外延迟"
tags: [bug, performance, lingua, language-detector, cache, lazy-static]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: yipot
module: lang_detect.rs
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: always
roles: [engineer]
---

# lang_detect 每次调用重建 LanguageDetector

---

## 一、现象

> **一句话描述**：`lang_detect()` 每次调用都重新构建 `LanguageDetector`（加载 21 个语言模型），产生 ~200ms 额外延迟，用户划词翻译时延迟感知明显。

---

## 二、复现步骤

1. 连续划词翻译 5 次
2. 每次 `lang_detect` 都重建 lingua 检测器
3. 每次额外 ~200ms → 5 次累计 1s 额外延迟

---

## 三、根因分析

**问题代码**：`src-tauri/src/lang_detect.rs:32-57`

每次调用在栈上创建 `LanguageDetectorBuilder::from_languages(&languages).build()`，加载所有语言模型到内存后丢弃。

**根因**：`LanguageDetectorBuilder::build()` 是昂贵操作。应通过 `once_cell::sync::Lazy` 构建一次并复用。

---

## 四、修复方案

使用 `Lazy<LanguageDetector>` 全局单例：

```rust
static DETECTOR: Lazy<LanguageDetector> = Lazy::new(|| {
    LanguageDetectorBuilder::from_languages(&languages).build()
});
```

另外修复了 `lang_detect` 中只有 21 语言而 `init_lang_detect` 有 22 语言的不一致问题（缺少 Ukrainian）。

---

## 五、验证方法

- [ ] `cargo check` 通过
- [ ] 首次调用 ~200ms，后续调用 <1ms

---

## 六、影响范围

| 维度 | 评估 |
|------|------|
| 影响模块 | `lang_detect.rs` |
| 是否影响 API 契约 | 否 |
| 用户感知 | 划词翻译延迟降低 ~200ms/次 |
| 数据完整性 | 不涉及 |