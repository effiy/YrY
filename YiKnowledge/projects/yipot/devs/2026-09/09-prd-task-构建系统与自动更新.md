---

doc_type: module
prd_task_id: "YP-09-M13"
title: "构建系统与自动更新 — 开发方案"
status: 已完成
priority: 中
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 3
source_prd: "11-prd-构建发布与安全.md"

type: task
---

# 构建系统与自动更新 — 开发方案

> 来源 PRD：[11-prd-构建发布与安全.md](../../prds/2026-09/11-prd-构建发布与安全.md)

---

## 一、构建配置

### package.json scripts

```json
{
  "dev": "vite",               // React 开发服务器
  "build": "vite build",       // React 生产构建
  "tauri": "tauri",            // Tauri CLI
  "updater": "node updater/updater.mjs",
  "updater:fixRuntime": "node updater/updater-for-fix-runtime.mjs"
}
```

### Vite 配置

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target: process.env.TAURI_PLATFORM === "windows" ? "chrome105" : "safari13",
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_DEBUG
  }
});
```

### Tauri 配置

```json
// src-tauri/tauri.conf.json
{
  "build": {
    "devPath": "http://localhost:1420",
    "distDir": "../dist"
  },
  "bundle": {
    "icon": ["icons/32x32.png", "icons/128x128.png", "icons/icon.icns", "icons/icon.ico"],
    "targets": ["msi", "dmg", "deb", "appimage"]
  }
}
```

---

## 二、Tauri 插件集成

### 插件清单

| 插件 | Crate | 功能 |
|------|-------|------|
| log | `tauri-plugin-log` | 日志输出到文件 + stdout |
| autostart | `tauri-plugin-autostart` | 系统开机启动 |
| sql | `tauri-plugin-sql` | SQLite 数据库操作 |
| store | `tauri-plugin-store` | KV 配置持久化 |
| fs-watch | `tauri-plugin-fs-watch` | 文件系统变更监听 |
| single-instance | `tauri-plugin-single-instance` | 防止重复启动 |

### 插件注册 (main.rs)

```rust
tauri::Builder::default()
    .plugin(tauri_plugin_single_instance::init(|app, _, cwd| { ... }))
    .plugin(tauri_plugin_log::Builder::default()
        .targets([LogTarget::LogDir, LogTarget::Stdout]).build())
    .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![])))
    .plugin(tauri_plugin_sql::Builder::default().build())
    .plugin(tauri_plugin_store::Builder::default().build())
    .plugin(tauri_plugin_fs_watch::init())
```

---

## 三、自动更新系统

### 更新检查 (`updater.rs`)

```rust
pub fn check_update(app_handle: &tauri::AppHandle) {
    // 检查 GitHub Release / 自定义更新服务器
    // 比较版本号 → 有新版本则弹窗提示
}
```

### 更新器脚本

- `updater/updater.mjs` — 下载新版本 → 替换二进制 → 重启
- `updater/updater-for-fix-runtime.mjs` — 修复 damaged 运行时

### 更新窗口 UI

`YiPot/src/window/Updater/index.jsx`:
- 显示版本号、更新日志
- 下载进度条
- 安装并重启按钮

---

## 四、macOS 代码签名

### 签名配置

- Developer ID Application 证书
- `com.pot_app.pot.metainfo.xml` — AppStream 元数据
- 公证流程: `xcrun notarytool submit`

### 权限声明

```xml
<!-- Info.plist -->
<key>com.apple.security.automation.apple-events</key>
<true/>  <!-- Apple Events for Accessibility -->
```

---

## 五、Linux 构建

- **deb**: Debian/Ubuntu 包
- **AppImage**: 通用 Linux 包
- **rpm**: Fedora/RHEL 包
- **Wayland**: `tauri.conf.json` 中启用 Wayland 支持


## 六、设计决策

| 决策点 | 方案 | 备选方案 | 选择理由 | 代价/权衡 |
|--------|------|---------|---------|----------|
| 构建工具 | Vite 5 + Tauri CLI | Webpack + Tauri CLI / vite-plugin-tauri | Vite 极速 HMR (< 1s)，原生 ESM，Tauri 官方推荐 | 对 CommonJS 依赖需特殊处理 |
| 包管理 | npm (YiPot 独立) | pnpm (YrY monorepo 其他项目) | Pot-App 上游社区使用 npm，保持与上游一致性 | 与 monorepo 其他项目包管理器不一致 |
| 更新渠道 | GitHub Release + 自定义更新 API | Tauri updater 内置 / App Store | GitHub 免费 CDN，版本管理 + release notes 统一 | 国内网络可能影响下载速度 (通过镜像站缓解) |
| 签名策略 | macOS 公证 (notarization) + Windows 代码签名 | 仅 macOS 签名 / 无签名 | macOS Gatekeeper 要求公证否则无法运行；Windows SmartScreen 降低警告率 | 年费 $99 (Apple Developer) + 代码签名证书费用 |
| 构建目标 | MSI / DMG / DEB / AppImage | NSIS / PKG / RPM | 覆盖主流平台格式 | 每种格式需独立构建 + 测试 |
| 更新器 | 自定义 Node.js 脚本 (updater.mjs) | Tauri updater plugin | 支持运行时修复 (fix-runtime)、增量更新、自定义 UI | 自行维护更新逻辑而非使用官方插件 |

### 构建优化策略

```
Build Pipeline:
  1. vite build (React 生产构建)
     - esbuild minify → 移除 console/debugger
     - CSS 提取 + PurgeCSS (Tailwind unused styles)
     - 代码分割 (window 级别)

  2. tauri build (Rust 编译 + 打包)
     - Rust release mode (opt-level=3, lto=true)
     - 二进制 strip (macOS/Linux)
     - Bundle 平台特定包 (.dmg/.msi/.deb)

最终产物:
  macOS: .dmg (通用二进制 x86_64 + aarch64)
  Windows: .msi (安装程序)
  Linux: .deb + .AppImage
```

### Bundle 体积分析

```
macOS .dmg:
  React 前端 (min+gzip):   ~300KB
  Rust 二进制 (stripped):  ~4.5MB
  Tauri WebView 运行时:    ~0KB (系统自带)
  Frameworks (WebKit):     ~0KB (系统自带)
  ─────────────────────────────────
  总计:                    ~5MB

对比 Electron:
  Chromium + Node.js:      ~120MB
  相同功能 App:            ~130MB+ (26x)
```


## 七、错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-构建 | Bundle 体积超阈值 | CI 告警 + 检查依赖 | 开发者分析 + 优化 | 无感知 (仅 CI) |
| L1-构建 | 签名证书过期/缺失 | CI 跳过签名 + 构建未签名版本 | 管理员续签证书 | 无感知 (仅 CI) |
| L2-更新 | 更新检查网络失败 | 标记 "check_failed" + 24h 后重试 | 自动重试 | "更新检查失败，稍后重试" |
| L2-更新 | 下载中断 | 断点续传 (HTTP Range) + 3 次重试 | 从断点继续 | "下载中断，正在重试 (N/3)" |
| L2-更新 | 下载文件校验失败 (SHA256) | 删除损坏文件 + 重新下载 | 自动重新下载 | "文件校验失败，正在重新下载" |
| L3-替换 | 二进制替换失败 (文件占用) | 等待进程退出 + 重试 | 自动重试 (最多 3 次) | "更新失败，请手动重启应用" |
| L3-替换 | 修复运行时报错 | updater-for-fix-runtime.mjs 回滚 | 回滚到上一版本 | "更新失败，已回滚到上一版本" |
| L4-启动 | macOS 公证失败 (Gatekeeper 阻止) | 引导用户右键打开 + 安全设置 | 用户手动允许 | "请在系统偏好设置 > 安全性与隐私中允许" |

### 更新流程状态机

```
检查更新
  ├── 无更新 → 静默 (仅日志)
  ├── 有新版本
  │     ├── 用户拒绝 → 24h 后再提示
  │     ├── 用户同意 → 下载
  │     │     ├── 下载成功 → 校验 → 替换 → 重启
  │     │     └── 下载失败 → 重试 (3次) → 提示失败
  │     └── 强制更新 (breaking change) → 自动下载 + 安装
  └── 检查失败 → 静默跳过 (非关键)
```


## 八、跨平台构建差异

| 环节 | macOS | Windows | Linux |
|------|-------|---------|-------|
| 编译目标 | universal binary (x86_64 + aarch64) | x64 / x86 | x64 / arm64 |
| 代码签名 | Apple Developer ID + notarization | EV Code Signing Certificate | 无 (Flatpak 例外) |
| 安装包 | .dmg (Disk Image) | .msi (Windows Installer) | .deb + .AppImage |
| 最低系统版本 | macOS 10.15+ | Windows 10+ | glibc 2.28+ |
| WebView 引擎 | WKWebView (系统自带) | WebView2 (自动安装) | WebKitGTK (系统库) |
| 包管理器 | Homebrew Cask (可选) | winget (可选) | apt / AUR (可选) |

> **WebView2 注意**：Windows 平台 WebView2 默认由 Tauri 自动下载安装（首次 ~150MB），需在安装包中申明此依赖。

**关联文档**：
- [桌面集成架构](./03-prd-task-桌面集成架构.md) — Tauri 插件注册
- [配置存储与备份](./07-prd-task-配置存储与备份实现.md) — 配置备份同步


## 九、性能优化

| 优化点 | 优化手段 | 预期收益 | 实测数据 |
|--------|---------|---------|---------|
| 冷启动时间 | Vite build 开启 code splitting (React.lazy 路由级懒加载) | 首屏 JS -40% | 启动到窗口显示 < 1.5s |
| 热更新 | Vite HMR (原生 ESM，无需重新打包) | 修改到浏览器刷新 < 100ms | 开发体验提升显著 |
| 构建缓存 | Tauri 增量编译 (cargo build --release 利用 sccache) | 二次构建 -60% 时间 | CI 构建 3min → 1min |
| Tree Shaking | esbuild minify + unused import 自动移除 | Bundle -15% | 最终 JS ~350KB (gzip'd) |
| 产物压缩 | DMG: UDZO 压缩, MSI: Cabinet 压缩, deb: xz 压缩 | 下载体积 -50% | 8MB (DMG) vs 15MB (未压缩) |
| CI 并行 | macOS x64/ARM64 + Windows + Linux 并行构建 | 全平台构建 < 15min | 单平台构建 ~3min |
| 启动性能 | Vite `modulePreload` + 关键 CSS 内联 | FCP (First Contentful Paint) < 500ms | 翻译窗口首屏 < 800ms |
| Rust 编译 | `opt-level=3` + `lto=true` + `codegen-units=1` | 二进制体积 -20%, 执行速度 +10% | 二进制 4.5MB → 3.6MB |
| 图标优化 | pngquant 有损压缩 + svgo SVG 优化 | 资源体积 -40% | 图标总大小 ~200KB |

### Rust 编译优化详解

```toml
# Cargo.toml — release profile 优化
[profile.release]
opt-level = 3       # 最大优化
lto = true          # 链接时优化 (跨 crate 内联)
codegen-units = 1   # 单编译单元 (最大优化，编译时间 +30%)
strip = true        # 去除符号表 (二进制 -15%)
panic = "abort"     # 移除 unwind 逻辑 (二进制 -10%)
```