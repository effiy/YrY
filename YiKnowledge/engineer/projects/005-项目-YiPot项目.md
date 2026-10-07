---
title: YiPot 项目知识库
aliases: [yipot-knowledge, yipot-project, tauri-desktop-translator]
tags: [yipot, tauri, rust, react, desktop, translation, ocr, tts]
category: engineer/projects
created: 2026-10-07
updated: 2026-10-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "YiPot 桌面翻译应用的完整开发参考：快速开始、架构、Tauri Commands、HTTP API、配置存储、构建打包、模块分析"
acceptance_criteria:
  - "新开发者可在 10 分钟内启动桌面开发环境"
  - "每个窗口模块的职责和边界清晰可查"
  - "Tauri invoke 命令和 HTTP Server 契约明确"
related:
  - ../../../../YiPot/README.md
  - ../../../../YiPot/package.json
  - ../../../../YiPot/src-tauri/Cargo.toml
  - ../../../../YiPot/src-tauri/tauri.conf.json
---

# YiPot — Tauri 跨平台桌面翻译应用

> **类型**: Desktop App | **框架**: Tauri 1.x + Rust (后端) + React 18/Jotai/NextUI (前端) | **前端 Dev 端口**: 1420 | **HTTP Server 端口**: 60828 | **本地存储**: serde_json 配置文件 + tauri-plugin-store + SQLite (tauri-plugin-sql)

YiPot 是一款开源跨平台桌面翻译应用，支持 Windows/macOS/Linux。核心功能覆盖划词翻译、输入翻译、剪切板翻译、OCR 图像识别翻译、TTS 语音朗读、生词本以及插件系统，集成 20+ 翻译服务（百度、DeepL、Google、OpenAI 等）。

---

## 快速开始

```bash
cd YiPot

# 安装前端依赖
pnpm install

# 首次编译 Rust 后端 (src-tauri)
cd src-tauri && cargo build && cd ..

# 启动 Tauri 开发模式
# 前端 Vite dev server 运行于 http://localhost:1420
# Tauri 窗口加载该地址并启用 devtools
pnpm tauri dev
```

**前置条件**:
- Node.js 18+ (推荐使用 `.node-version` 指定版本) + pnpm
- Rust 1.70+ (`rustup` 安装稳定版工具链)
- macOS: Xcode Command Line Tools + 辅助功能权限 (划词翻译需)
- Windows: Visual Studio Build Tools (C++ 桌面开发) + WebView2
- Linux: `libwebkit2gtk-4.1-dev`, `libxdo-dev`, `libxcb1`, `libxrandr2`, `build-essential`, `libgtk-3-dev`, `libsoup-3.0-dev`, `javascriptcoregtk-4.1-dev`, `librsvg2-dev`, `libayatana-appindicator3-dev` (部分发行版)

---

## 目录结构

```
YiPot/
├── package.json              # 前端依赖 + scripts (dev/build/tauri)
├── index.html                # Vite 入口 HTML
├── vite.config.js            # Vite 配置 (React 插件 + 端口 1420)
├── tailwind.config.cjs       # Tailwind CSS 配置
├── postcss.config.js         # PostCSS 配置
├── .prettierrc.json          # Prettier 代码格式化
├── .node-version             # Node 版本锁定
├── daemon.html               # 隐藏后台窗口 (Daemon Window) 页面
├── public/                   # 静态资源
│   ├── icon.png / icon.svg   # 应用图标
│   └── logo/                 # 各翻译服务 Logo (baidu/deepl/google/openai 等)
├── patches/                  # Linux WM 补丁 (hyprland.patch)
├── asset/                    # 演示截图与 GIF
├── .scripts/                 # 第三方扩展打包脚本
│   ├── popclip/              # macOS PopClip 扩展 (Config.plist + Pot.sh)
│   └── snipdo/               # Windows SnipDo 扩展 (pot.ps1 + yipot.json)
│
├── src-tauri/                # Rust 后端 (Tauri)
│   ├── Cargo.toml            # Rust 依赖 + 特性 (tauri 1.8 + 插件)
│   ├── build.rs              # tauri-build 构建脚本
│   ├── tauri.conf.json       # Tauri 主配置 (allowlist/bundle/windows/tray)
│   ├── tauri.macos.conf.json # macOS 专属打包配置
│   ├── tauri.windows.conf.json # Windows 专属打包配置
│   ├── tauri.linux.conf.json # Linux 专属打包配置
│   ├── icons/                # 应用图标 (各尺寸 .png/.icns/.ico)
│   ├── icons_mac/            # macOS tray 专用图标
│   ├── resources/            # 系统 OCR 预编译二进制 (darwin x64/arm64)
│   └── src/
│       ├── main.rs           # Tauri App 入口 + Builder 装配
│       ├── cmd.rs            # #[tauri::command] 前端可调用命令集
│       ├── config.rs         # serde_json 配置读写 (tauri-plugin-store)
│       ├── window.rs         # 窗口创建/定位/管理 (translate/config/recognize/screenshot)
│       ├── tray.rs           # 系统托盘菜单与事件
│       ├── hotkey.rs         # 全局快捷键注册 (global-shortcut)
│       ├── screenshot.rs     # 截图功能 (screenshots crate)
│       ├── clipboard.rs      # 剪切板监听与操作 (arboard + selection)
│       ├── server.rs         # 内置 HTTP Server (tiny_http, 端口 60828)
│       ├── backup.rs         # 备份恢复 (本地/Zip/WebDAV/阿里云 OSS)
│       ├── system_ocr.rs     # 系统级 OCR (Windows Media.Ocr / macOS Vision / Tesseract)
│       ├── lang_detect.rs    # 本地语言检测 (lingua crate, 20+ 语种)
│       ├── error.rs          # 统一错误类型 (thiserror)
│       └── updater.rs        # 自更新逻辑 (已注释待用)
│
└── src/                      # React 18 前端
    ├── main.jsx              # React DOM 挂载入口
    ├── App.jsx               # 顶层应用组件: 按窗口 label 分发页面 + 主题/字体/i18n
    ├── style.css             # 全局样式
    │
    ├── window/               # 多窗口页面 (每个 Tauri Window 加载对应组件)
    │   ├── Translate/        # 翻译主窗口 (划词/输入/剪切板触发)
    │   │   ├── index.jsx
    │   │   └── components/
    │   │       ├── LanguageArea/  # 源/目标语言切换
    │   │       ├── SourceArea/    # 原文输入区
    │   │       └── TargetArea/    # 译文展示区
    │   ├── Config/           # 设置窗口 (侧边栏 + 多页面)
    │   │   ├── index.jsx
    │   │   ├── style.css
    │   │   ├── routes/index.jsx
    │   │   ├── components/SideBar/
    │   │   └── pages/
    │   │       ├── General/       # 通用设置 (主题/字体/语言/窗口)
    │   │       ├── Translate/     # 翻译设置 (默认服务/窗口行为)
    │   │       ├── Recognize/     # 识别设置 (OCR 默认服务)
    │   │       ├── Hotkey/        # 快捷键配置
    │   │       ├── History/       # 历史记录管理
    │   │       ├── Backup/        # 备份/恢复 (本地/Zip/WebDAV/阿里云)
    │   │       │   ├── AliyunModal/
    │   │       │   ├── WebDavModal/
    │   │       │   └── utils/ (aliyun.jsx, webdav.jsx, local.jsx)
    │   │       ├── Service/       # 插件服务管理 (四类: 翻译/识别/TTS/收藏)
    │   │       │   ├── Translate/ (ServiceItem + SelectModal + ConfigModal)
    │   │       │   ├── Recognize/
    │   │       │   ├── Tts/
    │   │       │   ├── Collection/
    │   │       │   ├── PluginConfig/
    │   │       │   └── SelectPluginModal/
    │   │       └── About/         # 关于/版本
    │   ├── Recognize/        # OCR 识别窗口 (截图后展示)
    │   │   ├── ControlArea/  # 识别控制 (切换服务/操作按钮)
    │   │   ├── ImageArea/    # 截图预览区
    │   │   ├── TextArea/     # 识别文本区
    │   │   └── index.jsx
    │   ├── Screenshot/       # 全屏截图选区窗口 (非 macOS)
    │   │   └── index.jsx
    │   └── Updater/          # 自更新提示窗口 (已注释待用)
    │       └── index.jsx
    │
    ├── services/             # 四类插件化服务 (每类含 index + 多实现)
    │   ├── translate/        # 翻译服务 (25+ 实现)
    │   │   ├── index.jsx           # 服务注册中心 + 调用分派
    │   │   ├── baidu/               # 百度翻译 (Config.jsx, index.jsx, info.ts)
    │   │   ├── deepl/               # DeepL
    │   │   ├── google/              # Google 翻译
    │   │   ├── openai/              # OpenAI GPT
    │   │   ├── geminipro/           # Gemini Pro
    │   │   ├── chatglm/             # ChatGLM
    │   │   ├── ollama/              # 本地 Ollama
    │   │   ├── bing/                # Bing 翻译
    │   │   ├── youdao/              # 有道
    │   │   ├── tencent/             # 腾讯
    │   │   ├── alibaba/             # 阿里
    │   │   ├── volcengine/          # 火山
    │   │   ├── caiyun/              # 彩云
    │   │   ├── yandex/              # Yandex
    │   │   ├── niutrans/            # 小牛
    │   │   ├── lingva/              # Lingva (Google 镜像)
    │   │   ├── transmart/           # Transmart
    │   │   ├── bing_dict/           # Bing 词典
    │   │   ├── cambridge_dict/      # 剑桥词典
    │   │   ├── ecdict/              # ECDict 离线词典
    │   │   └── baidu_field/         # 百度垂直领域
    │   ├── recognize/        # OCR 识别服务 (15+ 实现)
    │   │   ├── index.jsx
    │   │   ├── tesseract/           # Tesseract.js 纯前端 OCR
    │   │   ├── system/              # 系统 OCR (调 Rust cmd)
    │   │   ├── baidu/               # 百度通用/高精度/图片翻译
    │   │   ├── baidu_accurate/
    │   │   ├── baidu_img/
    │   │   ├── tencent/             # 腾讯通用/高精度/图片翻译
    │   │   ├── tencent_accurate/
    │   │   ├── tencent_img/
    │   │   ├── iflytek/             # 讯飞
    │   │   ├── iflytek_intsig/
    │   │   ├── iflytek_latex/       # 讯飞公式
    │   │   ├── volcengine/          # 火山/多语种
    │   │   ├── volcengine_multi_lang/
    │   │   ├── simple_latex/        # SimpleLaTeX 公式
    │   │   └── qrcode/              # 二维码识别 (jsqr)
    │   ├── tts/              # 语音朗读服务
    │   │   ├── index.jsx
    │   │   └── lingva/              # Lingva TTS
    │   └── collection/       # 生词本/收藏服务
    │       ├── index.jsx
    │       ├── anki/                # Anki 对接
    │       └── eudic/               # 欧路词典对接
    │
    ├── stores/               # Jotai 原子化状态管理
    ├── hooks/                # 自定义 React Hooks
    │   ├── useConfig.jsx          # 配置读写 (封装 tauri-plugin-store)
    │   ├── useSyncAtom.jsx        # 原子同步
    │   ├── useVoice.jsx           # TTS 播放
    │   ├── useToastStyle.jsx      # Toast 样式
    │   └── useGetState.jsx
    ├── components/           # 公共 UI 组件
    │   └── WindowControl/        # 自定义窗口控制 (最大/最小/关闭)
    ├── utils/                # 工具函数
    │   ├── store.js               # store 加载封装
    │   ├── invoke_plugin.js       # 插件调用包装
    │   ├── service_instance.ts    # 服务实例工厂
    │   ├── language.ts            # 语种代码映射
    │   ├── lang_detect.js         # 前端语言检测
    │   ├── env.js                 # 环境变量
    │   └── index.js
    └── i18n/                 # 多语言国际化
        ├── index.jsx
        └── locales/               # 23 种语言 JSON (zh_CN, en_US, ja_JP, ko_KR 等)
```

---

## 路由与 API

YiPot 采用**双栈通信架构**：

1. **前端 ↔ Rust 后端**: 通过 `tauri::invoke` 异步调用 `#[tauri::command]`（IPC）
2. **外部程序 ↔ YiPot**: 通过内置 HTTP Server（端口 60828）接收 PopClip/SnipDo/浏览器扩展请求

### 窗口路由 (React 端)

`App.jsx` 根据当前 Tauri Window 的 `label` 直接渲染对应组件，无传统 URL 路由：

| Window Label | 组件 | 说明 |
|--------------|------|------|
| `translate` | `window/Translate/` | 翻译主窗口 (划词/输入/剪切板触发) |
| `config` | `window/Config/` | 设置窗口 (侧边栏子页面通过 `react-router-dom` 管理) |
| `recognize` | `window/Recognize/` | OCR 识别结果窗口 |
| `screenshot` | `window/Screenshot/` | 全屏截图选区 (非 macOS) |
| `updater` | `window/Updater/` | 自更新提示 (预留) |
| `daemon` | `daemon.html` | 隐藏后台窗口 (承载多显示器检测/常驻逻辑) |

Config 窗口内部路由 (`react-router-dom`):

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | General | 通用设置 |
| `/translate` | Translate | 翻译设置 |
| `/recognize` | Recognize | OCR 设置 |
| `/hotkey` | Hotkey | 快捷键配置 |
| `/history` | History | 历史记录 |
| `/backup` | Backup | 备份与恢复 |
| `/service` | Service | 插件服务总览 |
| `/service/translate` | Service → Translate | 翻译服务管理 |
| `/service/recognize` | Service → Recognize | OCR 服务管理 |
| `/service/tts` | Service → Tts | 语音服务管理 |
| `/service/collection` | Service → Collection | 收藏服务管理 |
| `/about` | About | 关于页 |

### Tauri Invoke Commands (IPC)

前端通过 `invoke('cmd_name', { args })` 调用 Rust 后端命令，已注册的 handler 列表：

| 命令 | 所在文件 | 说明 | 参数 |
|------|----------|------|------|
| `get_text` | `cmd.rs:12` | 读取当前待翻译文本 (划词/剪切板暂存) | — |
| `reload_store` | `cmd.rs:17` | 重新加载配置存储 (外部修改后刷新) | — |
| `cut_image` | `cmd.rs:24` | 从全屏截图中裁切子区域 | `left, top, width, height` |
| `get_base64` | `cmd.rs:53` | 读取 `yipot_screenshot_cut.png` 转 Base64 | — |
| `copy_img` | `cmd.rs:78` | 将裁切图片复制到系统剪切板 | `width, height` |
| `system_ocr` | `system_ocr.rs` | 调用系统 OCR (Win Media.Ocr / macOS Vision) | — |
| `set_proxy` | `cmd.rs:99` | 设置 HTTP/HTTPS 代理环境变量 | 从 store 读取 proxy_host/port/no_proxy |
| `unset_proxy` | `cmd.rs:122` | 清除代理环境变量 | — |
| `run_binary` | `cmd.rs:179` | 执行插件目录下的本地二进制文件 | `plugin_type, plugin_name, cmd_name, args[]` |
| `open_devtools` | `cmd.rs:219` | 切换当前窗口 DevTools (开发模式 F12) | — |
| `register_shortcut_by_frontend` | `hotkey.rs` | 前端触发重新注册全局快捷键 | — |
| `update_tray` | `tray.rs` | 更新托盘菜单 (当前翻译/识别状态) | `text, translate_text` |
| `screenshot` | `screenshot.rs` | 截取全屏并保存为 `pot_screenshot.png` | — |
| `lang_detect` | `lang_detect.rs` | 本地语种检测 (lingua 模型) | `text` |
| `webdav` | `backup.rs` | WebDAV 备份/恢复操作 | `{ action, config, ... }` |
| `local` | `backup.rs` | 本地 Zip 导入/导出 | `{ action, path, ... }` |
| `aliyun` | `backup.rs` | 阿里云 OSS 备份 | `{ action, config, ... }` |
| `install_plugin` | `cmd.rs:131` | 安装 `.potext` 插件包 (解压到 config/plugins/) | `path_list: Vec<String>` |
| `font_list` | `cmd.rs:211` | 枚举系统字体族列表 (供设置下拉框) | — |

**示例调用**：
```jsx
import { invoke } from '@tauri-apps/api/tauri';

const base64 = await invoke('get_base64');
await invoke('cut_image', { left: 100, top: 50, width: 800, height: 600 });
```

### 内置 HTTP Server (端口 60828)

`src/server.rs` 使用 `tiny_http` 启动本地 HTTP 服务（默认绑定 `127.0.0.1:60828`），供 PopClip/SnipDo/快捷指令等外部程序触发 YiPot 功能：

| 路径 | 方法 | 处理函数 | 说明 |
|------|------|----------|------|
| `/` / `/translate` | POST | `handle_translate` | Body 文本 → 直接翻译 |
| `/config` | GET/POST | `handle_config` | 打开设置窗口 |
| `/selection_translate` | GET/POST | `handle_selection_translate` | 读取鼠标选中文字 → 翻译 |
| `/input_translate` | GET/POST | `handle_input_translate` | 打开空白输入翻译窗口 |
| `/ocr_recognize?screenshot=true` | GET/POST | `handle_ocr_recognize` | 截图后打开识别窗口 (macOS screencapture / 非mac 全屏选区) |
| `/ocr_recognize?screenshot=false` | GET/POST | `handle_ocr_recognize` | 直接打开识别窗口 (粘贴已有图片) |
| `/ocr_translate?screenshot=true` | GET/POST | `handle_ocr_translate` | 截图 → 识别 → 翻译 |
| `/ocr_translate?screenshot=false` | GET/POST | `handle_ocr_translate` | 打开翻译窗口并进入图片模式 |

所有接口固定返回纯文本 `"ok"`（状态 200），副作用是创建/激活对应窗口并通过事件 (`emit`) 把数据推送到前端。

**PopClip 调用示例** (`.scripts/popclip/Pot.sh`):
```bash
curl -s -X POST --data "$POPCLIP_TEXT" http://127.0.0.1:60828/translate > /dev/null
```

---

## 权限管理

### Tauri Allowlist (能力白名单)

`tauri.conf.json → tauri.allowlist` 显式控制 WebView 可调用的原生 API 范围：

| 模块 | 权限 | 用途 |
|------|------|------|
| `shell` | `all: true`, `open: ".*"` | 打开外部链接 / 执行命令 (插件 run_binary) |
| `path` | `all: true` | 解析系统路径 ($APPCONFIG / $CACHE 等) |
| `window` | `all: true` | 创建/关闭/移动/聚焦窗口 |
| `clipboard` | `all: true` | 读写剪切板 (文本/图片) |
| `globalShortcut` | `all: true` | 注册全局热键 (划词翻译/OCR 快捷键) |
| `notification` | `all: true` | 系统通知 (单实例冲突提示/更新提示) |
| `http` | `all: true`, scope `http://**`, `https://**` | 前端直接请求翻译服务 API |
| `os` | `all: true` | 读取操作系统信息 |
| `protocol.asset` | true, scope `$CACHE/**`, `$CONFIG/**` | 通过 `asset://` 协议访问缓存/配置目录图片 (截图预览) |
| `fs` | `all: true`, scope `$APPCONFIG/**`, `$APPCACHE/**` | 文件读写 (配置/备份/插件安装) |
| `dialog` | `open: true`, `save: true` | 文件选择对话框 (备份导入/插件选择) |

### 跨域 / CSP (Content Security Policy)

```json
"security": {
  "csp": "default-src * data:; img-src * 'self' asset: https: data:; style-src * 'unsafe-inline'; worker-src 'self' blob:; script-src * 'unsafe-eval';"
}
```

开发/生产均采用宽松策略（`default-src *`），因为翻译插件需请求任意第三方 API 域名。若需加固可按 `scope` 具体域名收紧。

### macOS 辅助功能权限

`main.rs:70-75` 启动时检查并弹窗请求 `Accessibility` 权限（`macos-accessibility-client` crate），缺失该权限会导致 `selection::get_text()` 划词读取失败。

---

## 数据库架构

YiPot **没有中心化的数据库服务器**，全部本地持久化采用三层方案：

### 存储层次

```
┌─────────────────────────────────────────────────────────┐
│  配置层: tauri-plugin-store (KV Store)                  │
│  文件位置: $APPCONFIG/com.yipot.desktop/store.bin       │
│  格式: 加密二进制 (Tauri Store 默认实现)                │
│  读写: Rust config.rs 封装 get()/set() + get_bool()等   │
├─────────────────────────────────────────────────────────┤
│  结构化数据: tauri-plugin-sql (SQLite)                  │
│  文件位置: $APPDATA/com.yipot.desktop/yipot.db          │
│  特性: SQLite 3 + SQLx async                            │
│  用途: 历史记录 / 生词本 (需条件检索)                   │
├─────────────────────────────────────────────────────────┤
│  文件层: 直接读写 $APPCONFIG / $APPCACHE (serde_json)   │
│  - $APPCONFIG/plugins/{type}/{name}/                    │
│    info.json + main.js + 资源文件 (.potext 解压)        │
│  - $APPCACHE/pot_screenshot.png (全屏截图原始)          │
│  - $APPCACHE/yipot_screenshot_cut.png (裁切后 OCR 图)   │
│  - 备份 zip 包 (用户选择位置)                           │
└─────────────────────────────────────────────────────────┘
```

### 核心配置键 (tauri-plugin-store)

| Key | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| `server_port` | i64 | `60828` | HTTP Server 端口 |
| `clipboard_monitor` | bool | `false` | 是否监听剪切板变化自动翻译 |
| `proxy_enable` | bool | false | 是否启用代理 |
| `proxy_host` / `proxy_port` / `no_proxy` | string | — | 代理配置 |
| `translate_detect_engine` | string | `"api"` | 语言检测引擎 `"api"` 或 `"local"` (lingua) |
| `translate_window_width` / `_height` | i64 | `350 / 420` | 翻译窗口默认尺寸 (逻辑像素) |
| `translate_window_position` | string | `"mouse"` | 翻译窗口出现位置 `"mouse"` 或 `"fixed"` |
| `translate_window_position_x` / `_y` | i64 | `0` | fixed 模式坐标 |
| `recognize_window_width` / `_height` | i64 | `800 / 400` | OCR 窗口尺寸 |
| `app_theme` | string | `"system"` | `"light" / "dark" / "system"` |
| `app_language` | string | `"en"` | UI 语言 (23 种可选) |
| `app_font` / `app_fallback_font` | string | `"default"` | 主字体/后备字体族名 |
| `app_font_size` | i64 | `16` | 根字体像素大小 |
| `dev_mode` | bool | `false` | 启用 F12 打开 DevTools / 不过滤 Ctrl 快捷键 |

### 数据访问层

```
React 组件
    ↓ useConfig() / store.js
    ↓ tauri-plugin-store-api (JS)
    ↓ IPC invoke
    ↓ Rust tauri-plugin-store (StoreWrapper Mutex<Store>)
    ↓ config.rs: get() / set() 封装
    ↓ store.bin (磁盘)
```

`config.rs` 中 `StoreWrapper` 被注入为 Tauri Managed State，所有 `#[tauri::command]` 通过 `tauri::State<StoreWrapper>` 访问，保证线程安全。

---

## 构建部署

### 启动配置

| 层级 | 配置文件 | 关键项 |
|------|----------|--------|
| 前端 Vite | `vite.config.js` | `server.port: 1420` (tauri.conf `devPath` 指向) |
| Tauri Build | `tauri.conf.json → build` | `beforeDevCommand: pnpm dev`, `beforeBuildCommand: pnpm build`, `distDir: ../dist` |
| Tauri 打包标识 | `tauri.conf.json → package` | `productName: YiPot`, `version: 3.0.7` |
| Bundle ID | `tauri.conf.json → tauri.bundle` | `identifier: com.yipot.desktop`, `category: Utility` |
| 系统托盘 | `tauri.conf.json → tauri.systemTray` | `iconPath: icons/icon.png` |

### 启动流程

```
main.rs::main()
  → tauri::Builder::default()
      // 注册 Tauri 官方 / 社区插件
      → .plugin(tauri_plugin_single_instance)    // 单实例互斥，重复启动弹通知
      → .plugin(tauri_plugin_log)                // 日志输出到 LogDir + Stdout
      → .plugin(tauri_plugin_autostart)          // 开机自启
      → .plugin(tauri_plugin_sql)                // SQLite
      → .plugin(tauri_plugin_store)              // KV 配置存储
      → .plugin(tauri_plugin_fs_watch)           // 文件变更监听
      → .system_tray()                           // 创建托盘图标
      → .setup(|app| {
          // 1. macOS: Accessory 模式 (Dock 不显示图标) + 辅助功能信任检查
          // 2. APP.set(handle) 全局 OnceCell 保存
          // 3. init_config() 加载 store / 写入默认值
          // 4. 首次运行 is_first_run() → config_window()
          // 5. StringWrapper(Mutex<String>) 注入为 state (划词暂存)
          // 6. update_tray() 初始化托盘菜单
          // 7. start_server()  → 线程启动 tiny_http :60828
          // 8. register_shortcut("all") → 注册全部全局热键
          // 9. 若启用代理 → set_proxy() 写环境变量
          // 10. 本地语言检测模型预加载 (lingua)
          // 11. 初始化剪切板监听状态 ClipboardMonitorEnableWrapper
          // 12. start_clipboard_monitor() 后台线程轮询剪切板
        })
      → .invoke_handler(generate_handler![...])  // 注册所有 #[tauri::command]
      → .on_system_tray_event(tray_event_handler) // 托盘左/右键/菜单项
      → .build(generate_context!())
      → .run(|_app, event| {
          // ExitRequested → api.prevent_exit()
          // 窗口关闭不退出，保持托盘常驻
        })
```

### 构建打包命令

```bash
# 开发模式 (带 DevTools + HMR)
pnpm tauri dev

# 生产构建 (输出安装包)
pnpm tauri build
#   macOS → src-tauri/target/release/bundle/{macos/YiPot.app, dmg/*.dmg}
#   Windows → src-tauri/target/release/bundle/{msi/*.msi, nsis/*.exe}
#   Linux → src-tauri/target/release/bundle/{deb/*.deb, rpm/*.rpm, AppImage/*.AppImage}

# 仅前端构建
pnpm build
#   输出 dist/ (tauri build 时自动调用)
```

### GitHub Actions 自动打包 (CI)

`.github/workflows/package.yml` 触发多平台构建：
- `actions/build-for-linux/`: Dockerized Linux 构建 (Dockerfile + entrypoint.sh)
- macOS / Windows 使用官方 `tauri-apps/tauri-action@v1` runner
- 产物附加到 Release Assets (deb/rpm/AppImage/dmg/msi/exe)

---

## 项目规范

### 编码规范

| 领域 | 标准 |
|------|------|
| 前端语言 | React 18 JSX/TS 混合，函数组件 + Hooks |
| 后端语言 | Rust 2021 Edition，async 优先 (tokio 通过 tauri 运行时) |
| 文件命名 (前端) | 组件 `PascalCase` 目录，入口 `index.jsx`；工具 `camelCase.js(x)`；类型 `*.ts` |
| 文件命名 (Rust) | `snake_case.rs`，mod 声明在 `main.rs` 顶部 |
| 配置存储 | 统一 `config.rs::get()/set()`，禁止前端直接写 JSON 文件 |
| 服务插件 | 每插件三件套：`Config.jsx` + `index.jsx` + `info.ts` |
| 国际化 | `react-i18next`，新文案必须同时更新 `zh_CN.json` 与 `en_US.json` |
| IPC 调用 | 前端统一 `utils/invoke_plugin.js` 包装，捕获错误 showToast |
| 全局热键 | 禁止前端直接写死快捷键，通过 `useConfig('hotkey_xxx')` 读取 |
| 日志 | Rust `log::info!/warn!/error!`，前端 `tauri-plugin-log-api::info/warn` |

### 分层架构 (前端)

```
window/*              ← 页面层 (Translate/Config/Recognize 等窗口)
    ↓
services/*            ← 插件服务层 (translate/recognize/tts/collection)
    ↓  invoke_plugin / reqwest (HTTP 直接走前端 fetch)
utils/* + hooks/*     ← 共享逻辑 (store 封装 / invoke 包装 / 语言映射)
    ↓
stores/ (Jotai)       ← 原子化状态
    ↓
components/           ← 公共 UI (WindowControl 等)
```

### 服务插件规范

每个插件目录必须包含：
- **`info.ts`** — 静态元信息：`id`, `name`, `icon`, `supportedLanguage`, `type`
- **`index.jsx`** — 运行时实现：默认导出 `async function(config, params) → result`
- **`Config.jsx`** — React 组件：渲染该服务独有的 APIKey/接口地址表单

`services/{type}/index.jsx` 作为注册中心，通过 Vite `import.meta.glob` 自动扫描子目录，维护 `SERVICE_MAP`。调用端通过 `service_instance.ts::getService(type, id)` 懒加载并注入用户配置。

---

## 模块分析

### 翻译主窗口模块 (`window/Translate/`)

| 子模块 | 职责 |
|--------|------|
| `LanguageArea` | 源/目标语言对切换 + 交换按钮 + 常用语言快捷栏 |
| `SourceArea` | 原文输入框 + 清空/复制按钮，监听 `new_text` 事件注入划词 |
| `TargetArea` | 译文展示 (Markdown 渲染 / 多服务并列 / TTS 朗读按钮) |

**触发方式**：
1. 全局快捷键 → Rust `hotkey.rs` → `window::selection_translate()` → `emit("new_text", text)`
2. 剪切板监视器 → `clipboard.rs` → `text_translate(new_text)`
3. HTTP `/translate` POST → `server.rs` → `text_translate(body)`
4. OCR 结果 → 翻译联动

### 截图与 OCR 模块

```
用户触发 OCR
  → macOS: screencapture -i -r (交互式截图) 保存 yipot_screenshot_cut.png
  → 非mac: 打开 screenshot window (全屏置顶透明 Canvas 框选)
       → 前端 send "success" 事件
       → Rust 调用 screenshots crate 取全屏 → pot_screenshot.png
       → invoke('cut_image', left,top,width,height) 裁子图 → yipot_screenshot_cut.png
  → recognize_window() / image_translate() 创建窗口
  → 前端 invoke('get_base64') 读取截图
  → services/recognize/{id} 调用 OCR 服务 API
  → 识别文本自动进入 TargetArea 翻译流水线
```

缓存文件命名约定 (跨平台一致):
- `$CACHE/com.yipot.desktop/pot_screenshot.png` — 全屏原始截图
- `$CACHE/com.yipot.desktop/yipot_screenshot_cut.png` — 裁切后待 OCR 图 (**插件文档常量**)

### 系统托盘模块 (`tray.rs`)

- 启动时调用 `update_tray()` 构建菜单：
  - 输入翻译 / 划词翻译 / 截图识别 / 截图翻译 (对应 4 个主入口)
  - 打开设置 / 历史记录
  - 退出 (显式调用 `app.exit(0)`，绕过默认关闭不退出)
- 托盘菜单点击事件 `tray_event_handler` 分发到 `window::*` 同名函数
- 状态变化时前端可 `invoke('update_tray', { text, translate_text })` 实时刷新菜单项标题

### 全局快捷键模块 (`hotkey.rs`)

- `register_shortcut("all")` 读取 store 中所有 `hotkey_*` 键对应的组合键字符串 (如 `"Alt+A"`)
- 使用 Tauri `global_shortcut` API 注册，冲突时弹系统通知
- 前端设置页修改快捷键后 `invoke('register_shortcut_by_frontend')` 全量重注册
- 典型默认快捷键：
  - 输入翻译
  - 划词翻译
  - OCR 识别
  - OCR 翻译
  - 打开设置

### 备份模块 (`backup.rs`)

四种后端实现，前端 `Backup` 页统一 UI：

| 后端 | 实现细节 |
|------|----------|
| Local | `local()` — Zip crate 打包 `$APPCONFIG` 全目录到用户指定路径，反向解压恢复 |
| WebDAV | `webdav()` — `reqwest_dav` 对远程 WebDAV 服务器 PUT/GET zip 包 (NextCloud/群晖等) |
| 阿里云 OSS | `aliyun()` — reqwest 签名请求 OSS REST API |
| 插件包安装 | `install_plugin()` — 验证 `.potext` (zip)：含 `info.json` + `main.js`，解压至 `$CONFIG/plugins/{type}/plugin_xxx` |

### 插件系统

```
.potext (zip)
  ├── info.json      { "plugin_type": "translate"|"recognize"|"tts"|"collection", ... }
  └── main.js        CommonJS default export function(config, params)
                     或 + 二进制可执行文件 → run_binary() 调起
安装后位置:
  $APPCONFIG/com.yipot.desktop/plugins/{plugin_type}/plugin_{name}/
前端通过 services/{type}/index.jsx 自动扫描 plugins/ 目录并注入 SERVICE_MAP
```

---

## 架构设计

### 总体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                        用户 / 外部系统                               │
│  键盘热键 │ 鼠标划词 │ 剪切板 │ PopClip │ SnipDo │ HTTP 脚本调用    │
└────────────┬──────────┬──────────┬─────────┬──────────┬──────────────┘
             │          │          │         │          │
             ▼          ▼          ▼         ▼          ▼
┌──────────────────────────────────────────────────────────────────────┐
│               Tauri Rust 后端 (Native Process)                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐  │
│  │ GlobalHotkey │ │  Selection   │ │  Clipboard   │ │ tiny_http   │  │
│  │  (Hotkey)    │ │    (OS API)  │ │   Monitor    │ │ :60828      │  │
│  └───────┬──────┘ └───────┬──────┘ └──────┬───────┘ └──────┬──────┘  │
│          └────────────────┴─────────────────┴────────────────┘         │
│                              ▼                                         │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ window.rs (窗口管理器)                                        │    │
│  │ build_window() → 多显示器定位 / 去重 / DPI / shadow          │    │
│  │ selection_translate / input_translate / ocr_recognize / ...  │    │
│  └──────────────────────────┬───────────────────────────────────┘    │
│                             │ emit("new_text" | "new_image")         │
│  ┌──────────────────────────▼───────────────────────────────────┐    │
│  │       Tauri WebView (React 18 SPA, 多窗口多 label)            │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐   │    │
│  │  │Translate │ │  Config  │ │Recognize │ │ Screenshot Win │   │    │
│  │  └─────┬────┘ └─────┬────┘ └─────┬────┘ └───────┬────────┘   │    │
│  │        └──────────────┴────────────┴──────────────┘            │    │
│  │                       ▼                                        │    │
│  │  services/ (25 翻译 + 15 OCR + TTS + 收藏) 通过 fetch 直连 API │    │
│  └───────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ KV Store   │  │ SQLite DB  │  │ File System  │  │  System Tray │  │
│  │ (配置)     │  │ (历史/生词)│  │ (插件/缓存)  │  │   / Hotkey   │  │
│  └────────────┘  └────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### 前后端通信模式

```
React (WebView)               Rust (Native)
     │  invoke('cmd', args)        │
     │ ─────────────────────────▶  │  #[tauri::command]
     │   (Promise<JsonValue>)      │
     │  ◀───────────────────────── │  Result<T, E> → JSON
     │                             │
     │  listen('event_name')       │
     │  ◀────────────────────────  │  window.emit("event_name", data)
     │   (Callback<Payload>)       │  (窗口事件总线, 跨前端组件)
     │                             │
     │  fetch(https://api.deepl..) │
     │ ─────────────────────────▶  │  Tauri HTTP Scope 放行
     │  ◀────────────────────────  │  (不经过 Rust 业务逻辑)
```

### 多窗口管理策略

- **Label 唯一性**：每个功能窗口固定 label (`translate/config/recognize/screenshot`)，`build_window` 检测已存在时只 `set_focus()` 不重复创建
- **鼠标显示器定位**：通过 `mouse_position` crate 取物理坐标 → 遍历 `available_monitors()` 确定所在屏幕 → 窗口 `position()` 对齐该屏幕原点
- **透明度与无边框**：非 macOS 下 `decorations(false) + transparent(true)`，配合 `window-shadows` crate 绘制阴影；macOS 使用 `TitleBarStyle::Overlay`
- **关闭不退出**：`.run()` 中拦截 `ExitRequested → prevent_exit()`，用户关闭全部窗口后进程保留在托盘

### 降级策略

| 场景 | 行为 |
|------|------|
| HTTP Server 端口 60828 被占用 | 弹系统通知 "Server start failed"，忽略该模块继续启动主程序 |
| 全局快捷键注册冲突 | 弹系统通知列出失败项，其他快捷键正常工作 |
| macOS 辅助功能未授权 | `application_is_trusted_with_prompt()` 弹窗申请，失败后划词翻译降级为空 |
| 翻译服务请求失败 | 前端 TargetArea 显示具体错误信息 + 切换服务按钮，不崩溃 |
| lingua 本地语言检测加载失败 | 静默降级为 API 检测或前端轻量检测 |
| 系统 OCR 不可用 (Linux) | OCR 模块自动只提供 Tesseract 前端实现 |

---

## 开发依赖

### Rust (后端) — `src-tauri/Cargo.toml`

| 包名 | 版本 | 用途 |
|------|------|------|
| tauri | 1.8 | 主框架 (dialog/fs/shell/clipboard/http/notification/global-shortcut/window/system-tray/updater/devtools features) |
| tauri-build | 1.5 | 构建期脚本 (`build.rs`) |
| tauri-plugin-single-instance | v1 | 单实例互斥 (重复启动弹通知) |
| tauri-plugin-autostart | v1 | 开机自启 |
| tauri-plugin-fs-watch | v1 | 文件/目录变更监听 |
| tauri-plugin-store | v1 | KV 配置持久化 |
| tauri-plugin-log | v1 | 日志 (LogDir + Stdout) |
| tauri-plugin-sql | v1 (sqlite feature) | SQLite 数据库 |
| serde / serde_json | 1.0 | 序列化/反序列化 |
| thiserror | 1.0 | 自定义错误类型 |
| once_cell | 1.19 | 全局 AppHandle 单例 |
| tiny_http | 0.12 | 内置 HTTP Server (端口 60828) |
| tokio (隐式) | — | 通过 tauri 运行时 (reqwest async) |
| reqwest | 0.12 (json) | HTTP 客户端 (备份/检测) |
| reqwest_dav | 0.1.5 | WebDAV 协议客户端 |
| screenshots | 0.7.2 | 跨平台屏幕截图 (X11/Wayland/macOS/Windows) |
| image | 0.25 | 图片编解码 + 裁切 (`GenericImage::sub_image`) |
| base64 | 0.22 | 截图转 Base64 |
| arboard | 3.4 | 剪切板 (图像写入) |
| selection | 1.2 | 跨平台读取鼠标选中文本 (X11/macOS/Win) |
| lingua | 1.6 | 本地语言检测 (20+ 语种, 按需 feature 编译) |
| zip | 2.2 | 备份打包/插件安装 (.potext/.zip) |
| walkdir | 2.5 | 遍历插件/配置目录 |
| dirs | 5.0 | 解析系统标准路径 (cache/config/data) |
| font-kit | 0.14 | 枚举系统字体 (设置页下拉框) |
| log | 0.4 | 日志宏 (info!/warn!/error!) |
| mouse_position | 0.1 | 鼠标物理坐标 (窗口定位) |
| macos-accessibility-client | 0.0.1 (macOS only) | 辅助功能权限检查 |
| window-shadows | 0.2 (macOS + Windows) | 无边框窗口阴影 |
| windows | 0.58 (Windows only) | Win32 API (System Media.Ocr / Storage / Globalization) |

### JavaScript (前端) — `package.json`

| 包名 | 版本 | 用途 |
|------|------|------|
| react / react-dom | 18.3.1 | UI 框架 |
| @tauri-apps/api | 1.6.0 | Tauri JS 绑定 (invoke/window/event/http/...) |
| @tauri-apps/cli | 1.6.3 (dev) | Tauri CLI (dev/build) |
| jotai | 2.10.1 | 原子化状态管理 (替代 Redux) |
| @nextui-org/react + @nextui-org/theme | 2.4.8 / 2.2.11 | UI 组件库 (按钮/输入框/模态框/表格) |
| next-themes | 0.3.0 | 暗黑/浅色主题切换 (跟随 `useConfig('app_theme')`) |
| framer-motion | 11.11.10 | 组件动画 (窗口淡入/列表过渡) |
| @react-spring/web | 9.7.5 | 物理动画 (截图窗口拖拽) |
| react-router-dom | 6.27.0 | Config 窗口内部多页面路由 |
| i18next / react-i18next | 23.x / 15.x | 23 国语言国际化 |
| react-hot-toast | 2.4.1 | 顶部消息提示 (调用成功/失败 toast) |
| react-icons | 5.3.0 | 图标库 |
| react-markdown | 9.0.1 | 翻译结果 Markdown 渲染 |
| react-beautiful-dnd | 13.1.1 | 拖拽排序 (服务顺序调整) |
| tailwindcss / postcss / autoprefixer | 3.4 / 8.4 / 10.4 | 原子化 CSS |
| vite / @vitejs/plugin-react | 5.4 / 4.3 | 构建工具 (端口 1420, HMR) |
| tesseract.js | 5.1 | 纯前端 OCR (Tesseract.js 服务) |
| jsqr | 1.4 | 二维码识别 (recognize/qrcode 服务) |
| ollama | 0.5 | 本地 Ollama LLM 客户端 |
| tauri-plugin-store-api / tauri-plugin-sql-api / tauri-plugin-autostart-api / tauri-plugin-fs-watch-api / tauri-plugin-log-api | v1 (GitHub) | Tauri 插件 JS 端 |
| crypto-js / jose / md5 | — | 翻译服务 API 签名算法 (百度/腾讯/阿里 等) |
| nanoid / uuid | — | ID 生成 (历史记录/会话) |
| flag-icons | 7.2.3 | 语种国旗图标 |
| react-use-measure | 2.1 | 组件尺寸测量 (窗口自适应) |
| react-spinners | 0.14 | 加载动画 |
| typescript | 5.6 (dev) | 类型 (info.ts / service_instance.ts / language.ts) |
| prettier | 3.3 (dev) | 代码格式化 |

---

## 核心代码

### 入口文件

| 文件 | 说明 |
|------|------|
| `src-tauri/src/main.rs` | Tauri 应用入口：Builder 装配全部插件/命令/托盘/setup 生命周期 |
| `src/main.jsx` | React DOM 渲染入口 (`createRoot` → `<App />`) |
| `src/App.jsx` | 顶层调度：按 `appWindow.label` 选窗口组件 + 主题/字体/i18n/DevTools 监听 |
| `src-tauri/tauri.conf.json` | Tauri 构建/权限/Bundle ID/窗口/托盘总配置 |
| `package.json` | 前端依赖 + scripts + 版本号 (3.0.7) |

### 关键模块

| 模块 | 路径 | 核心逻辑 |
|------|------|----------|
| 应用装配与生命周期 | `src-tauri/src/main.rs` | Builder 链：9 个插件 + setup 初始化流程 + invoke handler 列表 + 关闭不退出 |
| Tauri Commands | `src-tauri/src/cmd.rs` | 12+ 命令：截图裁切/Base64/复制图片/代理设置/插件安装/字体枚举/DevTools/run_binary |
| 窗口管理器 | `src-tauri/src/window.rs` | `build_window()` 多显示器定位 + DPI 计算；`selection_translate/input_translate/ocr_recognize/...` 业务入口 |
| 配置存储封装 | `src-tauri/src/config.rs` | `StoreWrapper(Mutex<Store>)` Managed State；`get()/set()` 基于 `tauri-plugin-store`；`init_config/is_first_run` |
| 托盘菜单 | `src-tauri/src/tray.rs` | `update_tray()` 动态菜单构建 + `tray_event_handler` 点击分发 |
| 全局热键 | `src-tauri/src/hotkey.rs` | `register_shortcut` 批量注册 + 冲突通知 + 前端重注册接口 |
| 内置 HTTP Server | `src-tauri/src/server.rs` | `tiny_http` 端口 60828；8 条路由触发对应窗口动作 (PopClip/SnipDo 接入点) |
| 剪切板监视器 | `src-tauri/src/clipboard.rs` | 后台线程轮询 + `ClipboardMonitorEnableWrapper` 开关 |
| 备份恢复 | `src-tauri/src/backup.rs` | `local/webdav/aliyun` 三个命令后端 (Zip 打包 + reqwest/reqwest_dav) |
| 系统 OCR | `src-tauri/src/system_ocr.rs` | `#[cfg(windows)]` WinRT `Media.Ocr` / `#[cfg(target_os="macos")]` Vision 框架 |
| 本地语言检测 | `src-tauri/src/lang_detect.rs` | `lingua::LanguageDetectorBuilder` 预加载 20+ 语种模型 |
| 前端窗口路由分发 | `src/App.jsx` | `windowMap[appWindow.label]` 直接组件映射，无 URL 跳转 |
| 自定义 Hooks | `src/hooks/useConfig.jsx` | 封装 Jotai + tauri-plugin-store，读写配置自动双端同步 |
| 翻译/识别服务工厂 | `src/utils/service_instance.ts` | `getService(type, id)` 懒加载插件并合并用户配置 (25+ 翻译 / 15+ OCR) |
| 服务注册中心 (翻译) | `src/services/translate/index.jsx` | `import.meta.glob` 自动扫描子目录；统一 `translate(text, from, to, config)` 签名 |
| 服务注册中心 (识别) | `src/services/recognize/index.jsx` | 多服务实现，Tesseract.js 为前端默认兜底 |
| Config 窗口 (最大模块) | `src/window/Config/` | SideBar + 8 个页面 + 4 类服务管理子页 (SelectModal / ConfigModal / ServiceItem) |
| 翻译主窗口 | `src/window/Translate/index.jsx` | 监听 `new_text` 事件 → 取当前默认翻译服务 → 调用 → 展示 |
| OCR 识别窗口 | `src/window/Recognize/index.jsx` | 三段式 (ImageArea / ControlArea / TextArea)，支持一键翻译联动 |
| 国际化 | `src/i18n/index.jsx` | i18next 初始化 + 23 语种 JSON (zh_CN, en_US, ja_JP, ko_KR, ...) |
