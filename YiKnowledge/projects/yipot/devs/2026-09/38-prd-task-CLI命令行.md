---

doc_type: module
prd_task_id: "YP-09-S27"
title: "CLI 命令行 — 开发方案"
status: 已完成
priority: P2
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "38-prd-CLI命令行.md"

type: task
---

# CLI 命令行 — 开发方案

## 源码

`YiPot/src-tauri/src/cmd.rs`

## 参数解析

```rust
pub fn parse_args() -> Option<CmdAction> {
    let args: Vec<String> = std::env::args().collect();
    match args.get(1).map(|s| s.as_str()) {
        Some("translate") => {
            let text = args.get(2)?;
            let from = parse_flag(&args, "--from").unwrap_or("auto");
            let to = parse_flag(&args, "--to").unwrap_or("zh");
            Some(CmdAction::Translate { text: text.clone(), from, to })
        }
        Some("--version") => {
            println!("Pot v{}", env!("CARGO_PKG_VERSION"));
            None
        }
        _ => None
    }
}
```

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 参数解析 | 自定义 match | 参数 < 10 个，无需 clap |
| 输出 | stdout (结果) / stderr (错误) | UNIX 惯例，可管道 |
| 单实例 | CLI 调用复用已有进程 | `translate` 通过 IPC 发送至主进程 |

## 性能优化

| 优化项 | 方案 | 效果 |
|--------|------|------|
| IPC 通信 | Tauri `shell` 插件 `sidecar` 模式 | 避免启动新进程开销 |
| 复用主进程 | CLI 检测已有实例后发送 IPC 命令 | 翻译结果直接在已有窗口显示 |
| 语言检测 | 复用主进程已加载的检测模型 | 免重新加载，响应 < 50ms |

## 错误处理

| 错误场景 | 错误码 | 处理方式 | 用户提示（stderr） |
|----------|--------|----------|----------|
| 缺少必选参数（缺少文本） | `CLI-ARG` | 返回 usage 帮助信息 | "用法: pot translate <text> [--from auto] [--to zh]" |
| 不支持的语言代码 | `CLI-LANG` | 返回支持的语言列表 | "不支持的语言代码: xx" |
| 主进程未运行 | `CLI-PROC` | 自动启动主进程（后台） | "正在启动 Pot..." |
| IPC 通信超时 (> 10s) | `CLI-TO` | 返回错误退出码 1 | "翻译超时，请重试" |
| 翻译服务配置缺失 | `CLI-SVC` | 提示配置默认翻译服务 | "请先在设置中配置翻译服务" |
| stdout 管道断开 | `CLI-PIPE` | 静默退出，不抛错 | 无（管道下游已关闭） |

## 交叉引用

| 关联文档 | 关系 | 说明 |
|----------|------|------|
| [38-prd-CLI命令行](../prds/2026-09/38-prd-CLI命令行.md) | 上游 PRD | 功能需求定义 |
| [42-prd-task-GoogleDeepL翻译](./42-prd-task-GoogleDeepL翻译.md) | 依赖 | CLI 翻译调用 Google/DeepL 服务 |
| [15-prd-task-系统托盘](./15-prd-task-系统托盘.md) | 关联 | CLI 需检测主进程运行状态 |
| `src-tauri/src/cmd.rs` | 源码 | Rust 端 CLI 参数解析 |
| `src-tauri/src/main.rs` | 源码 | 主进程 IPC 监听 |