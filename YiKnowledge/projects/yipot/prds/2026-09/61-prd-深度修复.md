---
doc_type: prd
title: "YiPot 深度修复 — 备份安全 + 语言检测性能 + 配置防护"
tags:
- 需求文档
- 备份安全
- 性能优化
- 配置防护
category: 项目/桌面应用/需求
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: '202609'
prd_task_id: YP-09-61
estimate_backend: 0.5
review_status: 已评审
issue_type: 深度修复
roles:
- engineer
---

# YiPot 深度修复 — 备份安全 + 语言检测性能 + 配置防护

> 需求编号：YP-09-61 · 优先级：P1 · 总人天：~0.5d

---

## 一、需求背景

第二轮深度审查 YiPot Rust 后端模块（backup / lang_detect / updater），发现 3 处问题：

| 严重度 | 问题 | 文件 |
|--------|------|------|
| P1-major | WebDAV `name.unwrap()` panic | backup.rs |
| P2-minor | 每次 `lang_detect` 重建检测器 | lang_detect.rs |
| P2-minor | `check_update` 配置 unwrap | updater.rs |

---

## 二、技术方案

### 2.1 backup.rs: name.unwrap() → ok_or_else

```rust
let name = name.ok_or_else(|| Error::Error("WebDav Get: name is required".into()))?;
```

### 2.2 lang_detect.rs: Lazy 全局单例

```rust
static DETECTOR: Lazy<LanguageDetector> = Lazy::new(|| {
    LanguageDetectorBuilder::from_languages(&languages).build()
});
```

### 2.3 updater.rs: unwrap → unwrap_or

```rust
v.as_bool().unwrap_or(true)
```

---

## 三、验收标准

1. `cargo check` 通过
2. WebDAV name=null 返回错误而非 panic
3. 连续语言检测无额外延迟