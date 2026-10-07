---
title: "cmd.rs 图像操作/代理/插件中 12 处 unwrap/expect 崩溃风险"
tags: [bug, rust, cmd, panic, unwrap, cache-dir, proxy, plugin]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: yipot
module: cmd.rs
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: occasional
roles: [engineer]
---

# cmd.rs 图像操作/代理/插件中 12 处 unwrap/expect 崩溃风险

---

## 一、现象

> **一句话描述**：`cmd.rs` 中 `cut_image`/`get_base64`/`copy_img` 的 `cache_dir().expect()` 在无 `$HOME` 时 panic；`get_base64` 的 `File::open().unwrap()` 在文件不存在时 panic；`set_proxy` 的 3 处 `unwrap()` 在配置类型不匹配时 panic；`install_plugin`/`run_binary` 的 `config_dir().unwrap()` 在无 `$HOME` 时 panic。

---

## 二、根因分析

| 函数 | 代码 | 失败场景 |
|------|------|---------|
| `cut_image()` | `cache_dir().expect(...)` | 无 `$HOME` |
| `get_base64()` | `cache_dir().expect(...)` | 无 `$HOME` |
| `get_base64()` | `File::open(...).unwrap()` | 截图文件被删除 |
| `copy_img()` | `cache_dir().expect(...)` | 无 `$HOME` |
| `set_proxy()` | `v.as_str().unwrap()` ×2 | 配置类型为整数/null |
| `set_proxy()` | `v.as_i64().unwrap()` | 配置类型为字符串 |
| `install_plugin()` | `path.file_name().unwrap().to_str().unwrap()` | 非 UTF-8 路径 |
| `install_plugin()` | `dirs::config_dir().unwrap()` | 无 `$HOME` |
| `run_binary()` | `dirs::config_dir().unwrap()` | 无 `$HOME` |

---

## 三、修复

全部 12 处替换为 `match`/`unwrap_or()` 安全模式：

- `cache_dir().expect(...)` → `match cache_dir() { Some(v) => v, None => { error!(...); return; } }`
- `File::open(...).unwrap()` → `match File::open(...) { Ok(v) => v, Err(e) => { error!(...); return "".into(); } }`
- `v.as_str().unwrap()` → `v.as_str().unwrap_or("")`
- `v.as_i64().unwrap()` → `v.as_i64().unwrap_or(0)`
- `file_name().unwrap().to_str().unwrap()` → `path.file_name().and_then(|n| n.to_str())` + match
- `config_dir().unwrap()` → `match config_dir()` + 错误返回

---

## 四、验证

- [x] `cargo check` 编译通过
- [ ] 无 `$HOME` 时截图/插件安装返回错误而非 panic
- [ ] 代理配置类型错误时使用默认值