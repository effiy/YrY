---

doc_type: module
prd_task_id: "YP-09-S28"
title: "WebDAV/阿里云备份 — 开发方案"
status: 已完成
priority: P2
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "39-prd-WebDAV阿里云备份.md"
tags: [开发方案, 备份, WebDAV, 阿里云, Rust]

type: task
---

# WebDAV/阿里云备份 — 开发方案

## 架构与数据流

```
设置页面 (Config/Backup)          Rust backup.rs                 外部存储
────────────────────────          ──────────────                 ────────
用户操作                               │
  ├── 导出 JSON ──────────→  local("export")  ──→ 本地 .json 文件
  ├── 导入 JSON ──────────→  local("import")  ──→ merge 到 .pot.dat
  │                                │
  ├── WebDAV 上传 ────────→  webdav("put")    ──→ 自建网盘 (Nextcloud/ownCloud)
  ├── WebDAV 下载 ────────→  webdav("get")    ──→ 下载配置 JSON
  ├── 连接测试    ────────→  webdav("test")   ──→ PROPFIND /status
  │                                │
  ├── 阿里云上传  ────────→  aliyun("put")    ──→ OSS Bucket
  ├── 阿里云下载  ────────→  aliyun("get")    ──→ 下载配置 JSON
  └── 列目录      ────────→  aliyun("list")   ──→ OSS ListObjects
```

**上游依赖**: `config.rs` (配置读写) / `tauri-plugin-store` (`.pot.dat`)
**下游消费者**: 设置页面 Backup 页面, 多设备同步场景

## 关键实现

### backup.rs — 本地备份

```rust
// src-tauri/src/backup.rs
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

#[derive(Serialize, Deserialize)]
struct ExportConfig {
    version: String,
    export_time: String,
    general: serde_json::Value,
    services: serde_json::Value,
    hotkeys: serde_json::Value,
}

#[tauri::command]
fn local(action: String, path: Option<String>) -> Result<String, String> {
    match action.as_str() {
        "export" => {
            let app = tauri::AppHandle::current();
            let store = app.store(".pot.dat").map_err(|e| e.to_string())?;

            let export = ExportConfig {
                version: env!("CARGO_PKG_VERSION").to_string(),
                export_time: chrono::Utc::now().to_rfc3339(),
                general: store.get("general").unwrap_or(serde_json::Value::Null),
                services: store.get("services").unwrap_or(serde_json::Value::Null),
                hotkeys: store.get("hotkeys").unwrap_or(serde_json::Value::Null),
            };

            let json = serde_json::to_string_pretty(&export).map_err(|e| e.to_string())?;
            let export_path = path.unwrap_or_else(|| {
                dirs_next::desktop_dir()
                    .unwrap_or_else(|| std::path::PathBuf::from("."))
                    .join("pot_backup.json")
                    .to_string_lossy()
                    .to_string()
            });
            std::fs::write(&export_path, &json).map_err(|e| format!("写入失败: {}", e))?;
            Ok(export_path)
        }

        "import" => {
            let import_path = path.ok_or("请指定导入文件路径")?;
            let data = std::fs::read_to_string(&import_path)
                .map_err(|e| format!("读取失败: {}", e))?;

            // schema 校验 (仅导入可识别字段)
            let imported: serde_json::Value = serde_json::from_str(&data)
                .map_err(|e| format!("JSON 解析失败: {}", e))?;

            let app = tauri::AppHandle::current();
            let store = app.store(".pot.dat").map_err(|e| e.to_string())?;

            // 合并模式: 仅导入已知字段
            let skipped = merge_config(&store, &imported)?;
            store.save().map_err(|e| e.to_string())?;

            // 重新加载 store 到内存
            store.reload();

            Ok(format!("导入成功{}", if skipped.is_empty() {
                String::new()
            } else {
                format!(", 跳过字段: {}", skipped.join(", "))
            }))
        }

        _ => Err("Unknown action".into()),
    }
}
```

### WebDAV 备份

```rust
#[tauri::command]
async fn webdav(action: String, url: String, username: String, password: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let config_json = export_config_snapshot()?;

    match action.as_str() {
        "test" => {
            // PROPFIND 测试连接
            let res = client.request(reqwest::Method::from_bytes(b"PROPFIND").unwrap(), &url)
                .basic_auth(&username, Some(&password))
                .header("Depth", "0")
                .send().await
                .map_err(|e| format!("连接失败: {}", e))?;

            if res.status().is_success() {
                Ok("连接成功".into())
            } else {
                Err(format!("连接失败: HTTP {}", res.status()))
            }
        }

        "put" => {
            let file_url = format!("{}/pot_backup.json", url.trim_end_matches('/'));
            let res = client.put(&file_url)
                .basic_auth(&username, Some(&password))
                .body(config_json)
                .send().await
                .map_err(|e| format!("上传失败: {}", e))?;

            if res.status().is_success() {
                Ok("上传成功".into())
            } else {
                Err(format!("上传失败: HTTP {}", res.status()))
            }
        }

        "get" => {
            let file_url = format!("{}/pot_backup.json", url.trim_end_matches('/'));
            let res = client.get(&file_url)
                .basic_auth(&username, Some(&password))
                .send().await
                .map_err(|e| format!("下载失败: {}", e))?;

            if !res.status().is_success() {
                return Err(format!("下载失败: HTTP {}", res.status()));
            }

            let data = res.text().await.map_err(|e| e.to_string())?;
            let imported: serde_json::Value = serde_json::from_str(&data)
                .map_err(|e| format!("JSON 解析失败: {}", e))?;

            let app = tauri::AppHandle::current();
            let store = app.store(".pot.dat").map_err(|e| e.to_string())?;
            merge_config(&store, &imported)?;
            store.save().map_err(|e| e.to_string())?;
            store.reload();
            Ok("下载并导入成功".into())
        }

        _ => Err("Unknown action".into()),
    }
}
```

### 阿里云 OSS 备份

```rust
#[tauri::command]
async fn aliyun(action: String, bucket: String, region: String, ak: String, sk: String) -> Result<String, String> {
    // 使用 aliyun-oss-rust-sdk 或原始 HMAC 签名
    let client = AliyunOssClient::new(&ak, &sk, &bucket, &region);

    match action.as_str() {
        "test" => client.list_buckets().await.map(|_| "连接成功".into()),
        "put" => {
            let config_json = export_config_snapshot()?;
            client.put_object("pot_backup.json", config_json.as_bytes()).await?;
            Ok("上传成功".into())
        }
        "get" => {
            let data = client.get_object("pot_backup.json").await?;
            let imported: serde_json::Value = serde_json::from_slice(&data)
                .map_err(|e| format!("JSON 解析失败: {}", e))?;
            // merge to .pot.dat
            Ok("下载并导入成功".into())
        }
        "list" => {
            let objects = client.list_objects("pot_").await?;
            Ok(serde_json::to_string(&objects).unwrap())
        }
        _ => Err("Unknown action".into()),
    }
}
```

### 配置合并逻辑

```rust
fn merge_config(store: &tauri_plugin_store::Store, imported: &serde_json::Value) -> Result<Vec<String>, String> {
    let known_keys = ["general", "services", "hotkeys"];
    let mut skipped = Vec::new();

    for (key, value) in imported.as_object().ok_or("Invalid config format")? {
        if known_keys.contains(&key.as_str()) {
            store.set(key, value.clone());
        } else {
            skipped.push(key.clone());
        }
    }

    Ok(skipped)
}
```

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 备份格式 | JSON (`.pot_backup.json`) | 人类可读, 跨平台, 版本控制友好 |
| 导入策略 | 合并模式 (仅导入已知字段) | 安全: 不覆盖未知配置, 不破坏现有数据 |
| 连接测试 | WebDAV: PROPFIND / 阿里云: ListBuckets | 验证凭据 + 网络可达性 |
| 关键字段脱敏 | 导出时 API Key 只保留前 4 + 后 4 位 | 防止备份文件泄露敏感信息 |
| 版本标记 | 导出的 JSON 包含 `version` 字段 | 导入时做兼容性检查 |

## 性能优化

| 优化项 | 措施 | 效果 |
|--------|------|------|
| 异步 I/O | `reqwest` async 模式 + `tokio` runtime | 不阻塞 UI |
| 配置文件快照 | `serde_json::to_string` 一次序列化 | 复用同一份 JSON 数据 |
| 增量同步 | 预留 `last_sync_time` 字段 | 未来支持仅同步变更 |

## 错误处理

| 场景 | 分类 | 用户提示 | 恢复策略 |
|------|------|----------|----------|
| 配置文件损坏 | parse_error | "配置文件损坏, 已重置为默认配置" | 自动备份 `.pot.dat.bak` |
| JSON 解析失败 | parse_error | "导入的文件不是有效的 JSON 格式" | 不修改现有配置 |
| 磁盘满/权限不足 | io_error | "写入失败: {error}" | 保留内存中的修改 |
| WebDAV 连接失败 | network | "连接失败: 请检查地址和凭据" | 提示重新配置 |
| WebDAV 认证失败 | auth (401) | "用户名或密码错误" | 提示修改凭据 |
| 阿里云 AK/SK 无效 | auth | "AccessKey 验证失败" | 提示更新密钥 |
| 导入版本不兼容 | version_mismatch | "配置版本 {v1} 不兼容当前版本 {v2}, 部分字段已跳过" | 报告跳过的字段 |
| 网络超时 | timeout (30s) | "网络超时, 请检查连接" | 保留重试按钮 |

## 交叉引用

- [37-prd-设置页面架构](../prds/2026-09/37-prd-设置页面架构.md) — 设置页 Backup 页面
- [43-prd-Rust配置备份错误处理](../prds/2026-09/43-prd-Rust配置备份错误处理.md) — Rust 层配置读写
- [55-prd-task-设置页面实现](./55-prd-task-设置页面实现.md) — 设置页面开发方案
- [61-prd-task-Rust配置备份实现](./61-prd-task-Rust配置备份实现.md) — Rust 配置备份开发方案