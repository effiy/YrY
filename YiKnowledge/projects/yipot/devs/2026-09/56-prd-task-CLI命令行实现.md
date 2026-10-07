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
tags: [开发方案, CLI, 命令行, Rust]

type: task
---

# CLI 命令行 — 开发方案

## 架构与数据流

```
Terminal                          Rust CLI 层                       Tauri 功能
────────                          ───────────                       ──────────
$ pot translate "hello"     →    cmd.rs 解析 clap 参数
       │                              │
       ▼                              ├── "translate" → 调用 translate 服务插件
$ pot ocr --screenshot       →        │                  → 输出翻译结果到 stdout
       │                              │
       ▼                              ├── "ocr"       → 触发截图流程
$ pot config                 →        │                  → OCR 识别 → stdout
       │                              │
       ▼                              ├── "config"    → 打开设置窗口 (GUI)
$ pot --version              →        │
       │                              ├── "--version" → 输出 Cargo.toml version
       ▼                              │
$ pot --help                 →        └── "--help"    → 打印使用说明
```

**上游依赖**: `clap` crate (命令行参数解析) / `services/translate/` (翻译服务) / `screenshot.rs` (截图)
**下游消费者**: 终端用户、脚本自动化工作流

## 关键实现

### cmd.rs — 命令行参数解析

```rust
// src-tauri/src/cmd.rs
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "pot", about = "Pot - 桌面翻译与 OCR 工具", version)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Option<Commands>,
}

#[derive(Subcommand)]
pub enum Commands {
    /// 翻译文本
    Translate {
        /// 待翻译文本
        text: String,

        /// 源语言 (auto/zh/en/ja/ko/...)
        #[arg(short = 'f', long, default_value = "auto")]
        from: String,

        /// 目标语言
        #[arg(short = 't', long, default_value = "zh")]
        to: String,
    },

    /// 截图 OCR
    Ocr {
        /// 截图模式
        #[arg(long)]
        screenshot: bool,
    },

    /// 打开设置窗口
    Config,

    /// 显示版本
    Version,
}
```

### main.rs 集成

```rust
// src-tauri/src/main.rs
use clap::Parser;
use crate::cmd::{Cli, Commands};

fn main() {
    let cli = Cli::parse();

    match cli.command {
        Some(Commands::Translate { text, from, to }) => {
            // 无 GUI 模式: 直接调用翻译服务并输出结果
            tauri::async_runtime::block_on(async {
                match translate_cli(&text, &from, &to).await {
                    Ok(result) => println!("{result}"),
                    Err(e) => {
                        eprintln!("翻译失败: {e}");
                        std::process::exit(1);
                    }
                }
            });
        }

        Some(Commands::Ocr { screenshot: true }) => {
            // 触发截图 OCR 流程 (需要 GUI)
            tauri::Builder::default()
                .setup(|app| {
                    // 截图 → OCR → 输出结果
                    let image = screenshot::screenshot()?;
                    let result = ocr::recognize_cli(&image)?;
                    println!("{result}");
                    app.exit(0);
                    Ok(())
                })
                .run(tauri::generate_context!())
                .expect("error running tauri application");
        }

        Some(Commands::Config) => {
            // 打开 GUI 设置窗口
            tauri::Builder::default()
                .setup(|app| {
                    config::open_config_window(app.handle());
                    Ok(())
                })
                .run(tauri::generate_context!())
                .expect("error running tauri application");
        }

        Some(Commands::Version) => {
            println!("pot {}", env!("CARGO_PKG_VERSION"));
        }

        None => {
            // 无命令行参数 → 常规托盘模式
            run_tray_app();
        }
    }
}
```

### 无 GUI 翻译 (headless mode)

```rust
// src-tauri/src/cli_translate.rs
pub async fn translate_cli(text: &str, from: &str, to: &str) -> Result<String, String> {
    // 读取配置中的启用的第一个翻译服务
    let config = config::get_config()?;
    let default_service = config.services.translate
        .iter()
        .find(|s| s.enabled)
        .ok_or("没有启用的翻译服务")?;

    // 使用 reqwest 直接调用翻译 API (不依赖 Tauri WebView)
    match default_service.id.as_str() {
        "google" => google_translate::translate_cli(text, from, to).await,
        "baidu" => baidu_translate::translate_cli(text, from, to).await,
        _ => Err(format!("CLI 暂不支持该服务: {}", default_service.id)),
    }
}
```

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| CLI 框架 | `clap` derive 模式 | Rust 生态标准, 编译时参数验证, 自动生成 --help |
| 无参数启动 | 默认进入托盘模式 (GUI) | 保持现有行为, CLI 为 opt-in |
| 无 GUI 翻译 | `reqwest` 直接调用 API (headless) | 不依赖 WebView, SSH 环境可用 |
| OCR CLI | 启动 Tauri 窗口取截图后退出 | OCR 需要截图交互, 无法纯 headless |
| `--version` | `env!("CARGO_PKG_VERSION")` | 编译时嵌入, 零运行时开销 |

## 性能优化

| 优化项 | 措施 | 效果 |
|--------|------|------|
| 版本输出 | 编译期常量 `CARGO_PKG_VERSION` | 零运行时开销 |
| Headless 翻译 | 跳过 WebView 初始化, 直接 reqwest | SSH 环境可用, 启动 < 200ms |
| 参数解析 | `clap` 编译时验证 | 无效参数在解析阶段即报错 |

## 错误处理

| 场景 | 输出 | 退出码 | 恢复策略 |
|------|------|--------|----------|
| 无效命令 | "错误: 无效命令 'xxx'\n使用 --help 查看帮助" | 1 | stderr 输出 |
| 翻译服务未配置 | "没有启用的翻译服务, 请使用 pot config 配置" | 1 | 引导打开设置 |
| 翻译 API 失败 | "翻译失败: {error message}" | 1 | stderr 输出具体错误 |
| OCR 截图取消 | "截图已取消" | 0 | 正常退出 |
| `--help` | 自动生成的使用说明 | 0 | clap 自动生成 |

## 交叉引用

- [37-prd-设置页面架构](../prds/2026-09/37-prd-设置页面架构.md) — config 命令打开的设置页面
- [35-prd-翻译窗口交互](../prds/2026-09/35-prd-翻译窗口交互.md) — 翻译窗口 GUI 模式
- [42-prd-Rust截图OCR语言检测](../prds/2026-09/42-prd-Rust截图OCR语言检测.md) — OCR CLI 依赖的截图模块
- [55-prd-task-设置页面实现](./55-prd-task-设置页面实现.md) — 设置页面开发方案