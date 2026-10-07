---
title: YiPot Onboarding — Day 1 Quick Start
tags: [onboarding, yipot, quick-start]
category: engineer/run
created: 2026-10-07
updated: 2026-10-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "YiPot 新工程师第1天本地启动Tauri+理解桌面架构"
acceptance_criteria:
  - "Tauri 开发环境搭建完成，pnpm tauri dev 成功启动桌面应用"
  - "Vite 1420 端口前端页面可访问，HTTP Server 60828 端口 /config 路由返回 ok"
  - "Commands/Plugins/Hotkeys/Windows/Server/Tray 6 大核心模块概念清晰"
  - "Day1 Checklist 10 项全部勾选完成，含常见坑排查能力"
related:
  - ./README.md
  - ./0001-入职-YiAi入职.md
  - ./0002-入职-YiPet入职.md
  - ./0003-入职-YiVad入职.md
  - ../../learn/projects/yipot/01-项目-架构设计.md
---

# YiPot 入职指南 —— 第一天快速上手

> **目标**：在第一天结束时，你能够本地运行 YiPot 桌面应用、理解 Tauri 双进程架构、追踪从全局划词热键到翻译结果弹窗的完整链路。

## 前置条件

| 依赖 | 版本要求 | 验证命令 |
|---|---|---|
| Node.js | 18+（推荐 20 LTS） | `node -v` |
| pnpm | 8+（推荐使用 corepack） | `pnpm -v` / `corepack enable && corepack prepare pnpm@latest --activate` |
| Rust | stable（1.75+） | `rustc -V` / `rustup default stable` |
| Xcode CLT（macOS） | 最新版本 | `xcode-select -p` / 缺失则 `xcode-select --install` |
| macOS 辅助功能权限 | 已授权「终端」或「iTerm」 | 系统设置 → 隐私与安全性 → 辅助功能 |
| macOS 屏幕录制权限 | 已授权「终端」或「iTerm」 | 系统设置 → 隐私与安全性 → 屏幕录制（OCR/截图功能需要） |

## 环境搭建（预计 45 分钟）

```bash
cd YiPot

# 1. 安装前端 + Rust 依赖
pnpm install
# 首次会运行 cargo fetch，下载所有 Rust crate（约 5~15 分钟，取决于网络）

# 2. 验证 Rust 工具链正常
cd src-tauri && cargo check
# 预期：Finished `dev` profile 无 error（warning 可忽略，首次可能有 50+ warning）
cd ..

# 3. 单独启动 Vite 前端开发服务器（端口 1420，见 vite.config.ts）
pnpm dev
# 预期输出：VITE v5.x  ready in XXX ms  ➜  Local:   http://localhost:1420/
# 保持此终端窗口打开

# 4. 在另一个终端启动 Tauri 开发模式（编译 Rust + 拉起 WebView）
pnpm tauri dev
# 首次 Rust 编译约 10~20 分钟（后续增量编译 < 30 秒）
# 预期：macOS 菜单栏出现 YiPot 托盘图标，Dock 出现应用图标

# 5. 创建应用数据目录（首次启动会自动创建，如遇权限问题可手动创建）
mkdir -p ~/Library/Application\ Support/com.yipot.desktop/dbs
mkdir -p ~/Library/Application\ Support/com.yipot.desktop/logs
mkdir -p ~/Library/Application\ Support/com.yipot.desktop/plugins
# dbs/ = SQLite 翻译历史和生词本数据库
# logs/ = Rust backtrace + 前端运行日志
# plugins/ = 用户自定义翻译/OCR/TTS/生词本插件
```

## 验证步骤

| # | 验证项 | 命令 / 操作 | 预期结果 |
|---|---|---|---|
| 1 | Vite 前端服务启动 | `curl -I http://localhost:1420` | HTTP/1.1 200 OK，Content-Type: text/html |
| 2 | HTTP Server /config 路由（参考 server.rs 第 17 行端口号 60828） | `curl -X POST http://127.0.0.1:60828/config` | 返回字符串 `"ok"` 或 JSON `{"status":"ok"}` |
| 3 | 桌面进程存活 | `pgrep -fl YiPot` | 输出至少 1 行包含 `YiPot` 的进程信息（Tauri 主进程） |
| 4 | 60828 端口处于 LISTEN 状态 | `lsof -iTCP:60828 -sTCP:LISTEN` | COMMAND=YiPot，NODE=localhost:60828 或 *:60828 |
| 5 | 托盘日志输出（参考 tray.rs 第 187 行 info! 日志） | `tail -f ~/Library/Application\ Support/com.yipot.desktop/logs/*.log` | 包含 `[INFO] tray initialized` 或 `[INFO] tray menu loaded` 字样 |
| 6 | 全局热键注册（参考 hotkey.rs 第 46 行 register_global_shortcut） | 按 `⌥⌘Space`（默认划词翻译热键） | 翻译窗口弹出，或日志输出 `[INFO] hotkey triggered: translate_selection` |

## 常见坑表

| # | 问题现象 | 根因 | 解决方案 |
|---|---|---|---|
| 1 | 首次 `cargo check` / `tauri dev` 编译极慢（> 20 分钟） | Rust crate 从 crates.io 下载慢，无国内镜像 | 配置 `~/.cargo/config.toml` 替换为 rsproxy 镜像源；或挂代理 `export CARGO_REGISTRIES_CRATES_IO_PROTOCOL=sparse` |
| 2 | 应用启动后黑屏 / 白屏，无任何 UI | macOS 屏幕录制 / 辅助功能权限未授予，WebView 被沙箱拦截；或 Tauri `window.js` 注入失败 | 系统设置 → 隐私与安全性 → 授予对应权限 → 重启 YiPot；清除 Vite 缓存 `rm -rf node_modules/.vite` 后重新 `pnpm dev` |
| 3 | 插件加载报错：`sql plugin permission denied` 或 `attempt to read outside of plugins/` | Tauri 插件沙箱 fs_scope 配置过严，自定义插件目录不在 allowlist | 修改 `src-tauri/tauri.conf.json` 的 `plugins > fs > scope` 数组，加入 `$APPDATA/plugins/**`；或使用官方推荐的插件安装路径 |
| 4 | Windows 用户反馈 WebView2 缺失 / 版本过低导致崩溃 | Windows 10 早期版本未预装 Edge WebView2 Runtime | Tauri 打包时勾选「自带 WebView2 Bootstrapper」；或在 README 中指导用户安装微软官方 WebView2 Evergreen Standalone |
| 5 | PopClip/SnipDo 扩展调用翻译失败，浏览器控制台报 CORS | HTTP Server（60828 端口）未设置 Access-Control-Allow-Origin | 在 server.rs 的响应头中注入 `Access-Control-Allow-Origin: chrome-extension://*` + `*` 两个值，或使用 tauri-plugin-cors |
| 6 | 翻译窗口偶发 panic，日志 `called `Option::unwrap()` on a `None` value` | Rust 代码中大量 `unwrap()` 未做错误处理（见 bugs/功能缺陷 001） | 定位堆栈，将 `unwrap()` 替换为 `match / ? / unwrap_or_default()`；CI 中启用 `clippy::unwrap_used` 作为 deny 级告警 |
| 7 | 划词翻译 / OCR 输入框无法输入中文，或拼音选字不上屏 | macOS 中文输入法在 Tauri WebView textarea 中存在已知焦点竞争问题 | 升级 tauri 到 1.6.7+；在 `tauri.conf.json > windows` 中设置 `"focus": true` + `"transparent": false`；临时方案：点击翻译窗口标题栏再输入 |
| 8 | `tauri dev` 启动报错：`Address already in use (os error 48) for port 1420 or 60828` | Vite（1420）或内置 HTTP Server（60828）被其他进程占用（常见：旧 YiPot 实例、旧 Pot 残留） | `lsof -ti:1420,60828 | xargs kill -9`；或在 `.env` 中修改 `VITE_PORT=1421` 并同步改 PopClip/SnipDo 扩展配置 |

## Day1 架构卡 6 张概念表

### Commands（Tauri 命令通道）

| 概念 | 说明 | 代码位置 |
|---|---|---|
| invoke 宏 | 前端 `invoke('cmd_name', params)` → Rust `#[tauri::command]` 函数 | `src-tauri/src/commands/` 所有文件 + `src/utils/invoke.ts` |
| 翻译命令 | `translate_text`, `translate_clipboard`, `ocr_recognize` 三条主命令 | `src-tauri/src/commands/translate.rs` |
| 返回信封 | `{ code: number, message: string, data: T }` 统一格式，与 YiAi RPC 对齐 | `src-tauri/src/commands/mod.rs` Response 结构体 |

### Plugins（插件三件套体系）

| 概念 | 说明 | 代码位置 |
|---|---|---|
| 四类别 | translate / recognize（OCR）/ tts / collection（生词本） | `src/plugins/types.ts` PluginCategory enum |
| 三件套规范 | 每个插件必须有 `info.ts`（元数据+id）+ `index.jsx`（业务逻辑）+ `Config.jsx`（配置表单） | `src/plugins/services/` 下每个子目录 |
| 加载流程 | 启动时扫描内置 + 用户 plugins/ 目录 → 校验 info.ts id 唯一 → 注入沙箱 | `src-tauri/src/plugin/loader.rs` |

### Hotkeys（全局热键）

| 概念 | 说明 | 代码位置 |
|---|---|---|
| 注册逻辑（hotkey.rs 第 46 行） | `register_global_shortcut(acc: &str, handler)` → 底层调 `tauri-plugin-global-shortcut` | `src-tauri/src/hotkey.rs:46` |
| 默认热键 | `⌥⌘Space` 划词翻译、`⌥⌘S` OCR 截图、`⇧⌘V` 剪切板翻译 | `src-tauri/src/hotkey.rs:18` DEFAULT_HOTKEYS |
| 冲突检测 | 注册失败时 Toast 提示用户前往「设置 → 快捷键」改绑 | `src/views/Settings/HotkeyPanel.tsx` |

### Windows（多窗口管理）

| 概念 | 说明 | 代码位置 |
|---|---|---|
| 窗口种类 | translate（翻译结果）、settings（设置页）、ocr（截图选区）、ocr_result（OCR 结果） | `src-tauri/src/window.rs` WindowManager |
| 单例约束 | 同一时间翻译结果窗口只能有 1 个，新请求 reuse 旧窗口 + 动画切换 | `src-tauri/src/window.rs:78` get_or_create_window |
| 置顶策略 | 翻译窗口默认 `always_on_top = true`，失焦 3 秒后自动降级 | `src/views/TranslateWin/index.tsx` useEffect |

### Server（内置 HTTP Server）

| 概念 | 说明 | 代码位置 |
|---|---|---|
| 端口号（server.rs 第 17 行） | 硬编码 60828，PopClip/SnipDo 扩展写死此端口 | `src-tauri/src/server.rs:17` const PORT: u16 = 60828; |
| 路由表 | `POST /translate`、`POST /ocr`、`POST /config`、`GET /health` | `src-tauri/src/server.rs:52` router! 宏（server.rs 第 52 行 /config 路由） |
| 绑定地址 | 仅 `127.0.0.1`，不暴露公网；鉴权 token 写入 `$APPDATA/server_token` | `src-tauri/src/server.rs:41` TcpListener bind |

### Tray（菜单栏托盘）

| 概念 | 说明 | 代码位置 |
|---|---|---|
| 初始化日志（tray.rs 第 187 行） | 菜单构建完成后 info! 输出：`"tray menu loaded with {} items"` | `src-tauri/src/tray.rs:187` info! |
| 菜单项 | 显示翻译窗口 / OCR 截图 / 剪切板翻译 / 打开设置 / 退出 共 5 项 | `src-tauri/src/tray.rs:89` build_menu |
| 左键行为 | macOS 左键单击 = 显示翻译窗口，右键 = 弹出菜单；Windows/Linux 统一左键弹出菜单 | `src-tauri/src/tray.rs:134` on_tray_event |

## Day1 Checklist 10 条勾选项

- [ ] `node -v` ≥ 18、`pnpm -v` ≥ 8、`rustc -V` 为 stable 三条命令全部输出版本号
- [ ] `pnpm install` 成功结束，`src-tauri/Cargo.lock` 存在
- [ ] `cd src-tauri && cargo check` 无 error，退出码 0
- [ ] 终端 A 运行 `pnpm dev` → 访问 http://localhost:1420 返回 200 OK
- [ ] 终端 B 运行 `pnpm tauri dev` → 菜单栏出现 YiPot 托盘图标（无 crash/black-screen）
- [ ] `curl -X POST http://127.0.0.1:60828/config` 返回字符串 `"ok"`
- [ ] `lsof -iTCP:60828 -sTCP:LISTEN` 输出 YiPot 进程，端口 LISTEN
- [ ] 按下默认划词翻译热键 `⌥⌘Space` → 翻译窗口弹出，输入 hello 得到有效结果
- [ ] 右键托盘图标 → 「打开设置」→ 设置页正常渲染，日志含 tray.rs:187 info 级条目
- [ ] 通读 `src-tauri/src/server.rs:17`（端口）、`tray.rs:187`（日志）、`hotkey.rs:46`（热键注册）三处源码并能解释作用

## 后续学习

- [YiPot 架构设计](../../learn/projects/yipot/01-项目-架构设计.md) — 深层架构、插件三件套细节、跨进程通信模式
- [YiPot 开发规范](../../learn/projects/yipot/02-项目-开发规范.md) — Rust 错误处理禁令、插件审核流程
- [YiPot 功能模块](../../learn/projects/yipot/03-项目-功能模块.md) — 30+ 插件清单、窗口流转
- [unwrap 安全加固](../../../projects/yipot/bugs/功能缺陷/001-unwrap.md) — Bug 001 unwrap 根因分析与替换模式
- [APIKey 明文存储](../../../projects/yipot/bugs/安全隐私/001-APIKey明文存储.md) — 隐私 001 加密方案
