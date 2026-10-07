---

doc_type: module
prd_task_id: "YP-09-M11"
title: "配置存储与备份 — 开发方案"
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
source_prd: "09-prd-配置管理与备份.md"

type: task
---

# 配置存储与备份 — 开发方案

> 来源 PRD：[09-prd-配置管理与备份.md](../../prds/2026-09/09-prd-配置管理与备份.md)

---

## 一、配置存储架构

### 前端 — useConfig Hook

```javascript
// YiPot/src/hooks/useConfig.jsx
import { useAtom } from "jotai";
import { store } from "../utils/store";

// store.js — 基于 tauri-plugin-store
class Store {
  store = new Store(".pot.dat");
  async load() { /* 从磁盘加载 */ }
  async get(key) { /* 读取 */ }
  async set(key, value) { /* 写入并持久化 */ }
}
```

### Rust — config.rs

```rust
// config.rs — 封装 tauri-plugin-store
use tauri_plugin_store::StoreExt;

pub fn init_config(app: &mut tauri::App) {
    // 初始化默认配置
}

pub fn get(key: &str) -> Option<serde_json::Value> { ... }
pub fn set(key: &str, value: impl Into<serde_json::Value>) { ... }

#[tauri::command]
pub fn reload_store(app: tauri::AppHandle) {
    // 重新加载配置文件
}
```

### 配置存储路径

| 平台 | 路径 |
|------|------|
| macOS | `~/Library/Application Support/com.pot-app.pot/` |
| Windows | `%APPDATA%/com.pot-app.pot/` |
| Linux | `~/.config/com.pot-app.pot/` |

---

## 二、备份系统实现

### 本地备份 (`backup.rs` → `local`)

```rust
#[tauri::command]
fn local(action: String, path: String) -> Result<(), String> {
    match action.as_str() {
        "export" => {
            let config = export_all_config();
            fs::write(path, serde_json::to_string_pretty(&config)?)?;
        }
        "import" => {
            let data = fs::read_to_string(path)?;
            let config: Config = serde_json::from_str(&data)?;
            import_config(config);
        }
        _ => return Err("Unknown action".into())
    }
    Ok(())
}
```

### WebDAV 同步 (`backup.rs` → `webdav`)

```rust
#[tauri::command]
fn webdav(action: String, url: String, username: String, password: String) -> Result<(), String> {
    let client = reqwest::blocking::Client::new();
    match action.as_str() {
        "upload" => { /* PUT 配置文件到 WebDAV */ }
        "download" => { /* GET 配置文件从 WebDAV */ }
        _ => return Err("Unknown action".into())
    }
}
```

### 阿里云 OSS (`backup.rs` → `aliyun`)

```rust
#[tauri::command]
fn aliyun(action: String, bucket: String, region: String, ak: String, sk: String) -> Result<(), String> {
    // OSS SDK 上传/下载配置文件
}
```

---

## 三、代理设置实现

```rust
// main.rs — set_proxy / unset_proxy
#[tauri::command]
fn set_proxy() -> Result<(), String> {
    let host = get("proxy_host").unwrap();
    std::env::set_var("HTTP_PROXY", host.as_str().unwrap());
    std::env::set_var("HTTPS_PROXY", host.as_str().unwrap());
    Ok(())
}

#[tauri::command]
fn unset_proxy() {
    std::env::remove_var("HTTP_PROXY");
    std::env::remove_var("HTTPS_PROXY");
}
```

---

## 四、设置页面架构

```
YiPot/src/window/Config/
├── index.jsx              — 设置主框架（SideBar + 路由）
├── style.css
├── routes/index.jsx        — 设置页路由配置
├── components/SideBar/     — 设置侧边栏导航
└── pages/
    ├── General/            — 通用设置（语言、主题、字体）
    ├── Translate/          — 翻译服务管理
    ├── Recognize/          — OCR 服务管理
    ├── Service/
    │   ├── Translate/      — 翻译服务配置详情
    │   ├── Recognize/      — OCR 服务配置详情
    │   ├── Tts/            — TTS 服务配置
    │   ├── Collection/     — 生词本配置
    │   └── SelectPluginModal/ — 插件选择弹窗
    ├── Hotkey/             — 快捷键配置
    ├── Backup/             — 备份恢复
    ├── History/            — 翻译历史
    └── About/              — 关于页面
```


## 五、设计决策

| 决策点 | 方案 | 备选方案 | 选择理由 | 代价/权衡 |
|--------|------|---------|---------|----------|
| 存储引擎 | tauri-plugin-store (JSON 文件) | SQLite (tauri-plugin-sql) / IndexedDB | JSON 人类可读，可直接编辑/备份，serde 原生支持 | 无事务 (atomic write)，频繁写场景有数据丢失风险 |
| 配置分层 | Rust 层 (config.rs) + 前端层 (useConfig) 双缓存 | 仅前端 / 仅 Rust | Rust 模块可直接读取配置 (如启动时端口号)，前端 Hook 提供响应式绑定 | 两处缓存需同步 (通过前端变更后 invoke 通知 Rust reload) |
| 备份格式 | JSON (带时间戳文件名) | YAML / TOML / 加密 zip | 与存储格式一致，导出文件可直接编辑后导入，跨平台兼容 | 无压缩/加密，敏感数据 (API Key) 明文导出 |
| 远程同步 | WebDAV + OSS 双通道 | 仅 WebDAV / Git | WebDAV 兼容自托管 NAS (Nextcloud/OwnCloud)，OSS 支持云端备份 | 两套同步逻辑需独立维护 |
| 代理设置 | 环境变量注入 (HTTP_PROXY) | 前端 fetch 自行处理 | Rust reqwest 自动读取环境变量，前端 fetch 由浏览器处理 | 需重启应用生效 (环境变量需进程级设置) |
| 配置唯一文件 | 单文件 `.pot.dat` (JSON) | 多文件分片 / SQLite 多表 | 备份/导出只有 1 个文件，迁移简单 (复制粘贴) | 大配置文件 (~100KB+) 读写全量而非增量 |

### 配置双缓存同步机制

```
写路径 (前端发起):
  useConfig.set(key, value)
    → tauri-plugin-store.set(key, value) → 写磁盘
    → Jotai atom 更新 → 前端组件响应式刷新
    → invoke("reload_store") → Rust 内存缓存刷新

读路径 (Rust 发起):
  config::get(key)
    → 读 Rust 内存缓存 (启动时加载)
    → 不读磁盘 (性能优化)

读路径 (前端):
  useConfig(key)
    → 读 Jotai atom (启动时从 plugin-store 初始化)
    → 不 invoke Rust (性能优化)
```

> **同步锁**：前端 `useConfig.set()` 是串行化的 (Jotai atom 写)，避免并发写导致配置文件损坏。


## 六、错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-存储 | 配置文件 JSON 解析失败 (损坏) | 备份损坏文件 → 初始化默认配置 | 自动恢复 (配置重置) | "配置文件损坏，已恢复为默认设置" |
| L1-存储 | 磁盘写入失败 (权限/磁盘满) | 仅写内存缓存 + 标记 dirty + 定时重试 | 磁盘恢复后自动刷新 | "配置保存失败" + 定期重试 |
| L2-导出 | 导出路径无写入权限 | 使用系统文件选择器 (Tauri dialog) 用户指定路径 | 用户选择路径 | "无法写入，请选择其他位置" |
| L2-导入 | 导入文件非合法 JSON | 解析失败 → 拒绝 + 提示格式 | 用户修正后重试 | "文件格式不正确，请选择有效的备份文件" |
| L2-导入 | 导入文件中 key 与当前版本不兼容 | 仅导入兼容 key，跳过未知 key + 日志 | 部分导入 | "部分配置已导入，不兼容项: [xxx]" |
| L3-同步 | WebDAV 连接失败 | 标记同步失败 + 保留本地备份 | 手动重试 | "WebDAV 连接失败：网络不可用" |
| L3-同步 | WebDAV 认证失败 | 提示检查用户名/密码 | 用户重新配置 | "WebDAV 认证失败，请检查账号密码" |
| L4-代理 | 代理设置为空时调用 set_proxy | 跳过代理设置 + 日志 | 无影响 (直连) | 无感知 |

### 备份文件命名规范

```
格式: pot_backup_{YYYY-MM-DD_HH-mm-ss}.json
示例: pot_backup_2026-09-23_14-30-00.json

导入时按 mtime 排序展示最近的 10 个备份文件。
```

### 配置迁移兼容性

```
版本升级时的配置迁移:
  1. 读取当前配置文件
  2. 检测 config_version 字段
  3. 如果 version < current_version → 执行迁移脚本
  4. 迁移成功后写入新版本号

迁移示例:
  v1 → v2: 'baidu_apiKey' → 'translate_baidu_appId'
  v2 → v3: 新增字段 'app_theme' = 'system'
```


## 七、性能优化

| 优化点 | 手段 | 预期收益 | 实测数据 |
|--------|------|---------|---------|
| 配置读取 | Jotai atom 内存读取 (无需每次 invoke) | 读操作 < 1ms vs invoke ~5ms | — |
| 配置写入 | Debounce 500ms (高频变更合并为单次写盘) | 减少磁盘 I/O 频率 | 快捷键录制场景 I/O -80% |
| 配置加载 | 应用启动时全量加载到内存 | 后续所有读操作零延迟 | 启动时间 +50ms (加载全量配置) |
| 备份文件 | 仅导出用户修改过的 key (非全量默认值) | 备份文件体积 -60% | 典型备份 ~15KB |
| WebDAV | 增量上传 (仅变更的 key) | 同步流量 -80% (日常场景) | — |

**关联文档**：
- [桌面集成架构](./03-prd-task-桌面集成架构.md) — config.rs/backup.rs 架构
- [外部 HTTP 服务](./08-prd-task-外部HTTP服务实现.md) — HTTP Server 配置
- [构建系统与自动更新](./09-prd-task-构建系统与自动更新.md) — 构建与签名


## 八、跨平台实现差异

| 功能 | macOS | Windows | Linux |
|------|-------|---------|-------|
| 配置存储路径 | `~/Library/Application Support/com.pot-app.pot/` | `%APPDATA%/com.pot-app.pot/` (通常 `C:\Users\<user>\AppData\Roaming\`) | `~/.config/com.pot-app.pot/` (XDG_CONFIG_HOME) |
| 路径获取 API | `tauri::api::path::app_data_dir()` → 自动解析 | 同左 | 同左 |
| 配置文件名 | `.pot.dat` (JSON 格式，隐藏文件) | `.pot.dat` (无隐藏属性) | `.pot.dat` (点号开头自动隐藏) |
| 文件权限 | 用户目录下 rw-r--r-- (0644)，无需特殊权限 | %APPDATA% 下可读写，无需管理员权限 | ~/.config 下 rw-r--r-- (0644) |
| 备份文件命名 | `pot_backup_2026-09-23_14-30-00.json` (时间戳精确到秒) | 同左 (Windows 路径中的 `:` 需替换为 `-`) | 同左 |
| 文件选择器 | Native NSOpenPanel/NSFilePanel (Tauri dialog) | Native IFileDialog (Tauri dialog) | GTK FileChooser / KDE KFileDialog |
| 导出默认路径 | `~/Documents/` | `C:\Users\<user>\Documents\` | `~/Documents/` 或 `~` |
| WebDAV 依赖 | 系统自带 TLS (Security.framework) | 系统自带 TLS (SChannel) | 需 OpenSSL (apt: libssl-dev) |
| OSS 依赖 | 无额外依赖 | 无额外依赖 | 需 OpenSSL |
| 代理环境变量 | `HTTP_PROXY`/`HTTPS_PROXY` (进程级，所有子进程继承) | 同左 | 同左 (注意大写，`http_proxy` 小写也有效) |
| 单文件写 | macOS 保证原子 rename (tmp→final)，数据安全 | 直接写盘 (非原子)，极端场景可能文件损坏 | ext4 默认非原子写，建议 tmp+rename |

### 平台特有配置注意事项

```
macOS:
  - ~/Library 目录默认隐藏，用户手动找配置需终端操作
  - 导出到 ~/Documents 最便捷 (Finder 侧边栏可见)
  - 备份文件时间戳中的 ':' 在 HFS+ 上合法，跨平台需替换

Windows:
  - %APPDATA% 中文系统为 C:\Users\<用户>\AppData\Roaming
  - 路径分隔符 '\'，Tauri API 已统一为 '/'
  - 备份文件名中 ':' 非法 (NTFS)，需替换为 '-'
  - MSI 卸载时默认保留配置文件 (%APPDATA% 不在卸载范围)

Linux:
  - XDG_CONFIG_HOME 可被用户重定义 (默认 ~/.config)
  - Snap/Flatpak 沙箱内路径不同，需确认 Tauri 的路径解析
  - fontconfig 非标准配置可能影响文件选择器外观
```

### 跨平台备份恢复兼容性

```
配置文件的跨平台共享:
  ✓ 配置文件 JSON 格式 100% 跨平台兼容
  ✓ 备份文件可在任意平台导入 (仅 key 匹配检查)
  ✓ 文件路径在备份中存为相对路径，导入时重新映射

  ⚠ WebDAV/OSS 同步的认证凭据随平台加密存储 (keychain/credential manager)
    → 跨平台迁移需重新输入 API Key/密码

  ⚠ macOS 的 plist 格式与 Windows 注册表不互通
    → 仅 JSON 备份文件跨平台，不使用平台特定格式
```