---

doc_type: module
prd_task_id: "YP-09-M11"
title: "配置管理与备份 — 开发方案"
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

# 配置管理与备份 — 开发方案

> 来源 PRD：[09-prd-配置管理与备份.md](../../prds/2026-09/09-prd-配置管理与备份.md)
> 需求编号：YP-09-M11 · 优先级：P2 · 人天：3d

> **文档职责**：本文档定义配置存储系统、备份/恢复（本地+WebDAV+OSS）、API Key 加密、代理设置的**实现方案与架构决策**（HOW/WHY），不含产品目标。

---

## 一、配置存储架构

### 1.1 存储层次

```
前端 React (useConfig hook)
    │
    ▼
tauri-plugin-store (Rust → JSON 文件)
    │
    ▼
系统应用数据目录
  macOS: ~/Library/Application Support/<app>/
  Windows: C:\Users\<user>\AppData\Roaming\<app>\
  Linux: ~/.local/share/<app>/
```

### 1.2 useConfig Hook

```typescript
// useConfig.ts — 统一配置读写
import { Store } from 'tauri-plugin-store-api';

const store = new Store('.settings.dat');

function useConfig<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  
  // 初始化: 从 store 读取
  useEffect(() => {
    store.get<T>(key).then(v => {
      if (v !== null) setValue(v);
    });
  }, [key]);
  
  // 写入: 即时持久化
  const update = async (newValue: T) => {
    setValue(newValue);
    await store.set(key, newValue);
    await store.save(); // 显式写盘
  };
  
  return [value, update] as const;
}
```

### 1.3 配置分类与自描述

```typescript
// configSchema.ts — 所有配置项的 schema 定义
interface ConfigSchema {
  key: string;
  type: 'string' | 'number' | 'boolean';
  default: any;
  category: 'general' | 'translate' | 'ocr' | 'network' | 'hotkey' | 'service';
  sensitive: boolean; // 是否需加密
}
```

---

## 二、API Key 加密

### 2.1 加密方案

```typescript
// crypto.ts — AES-256-CBC 加密
import CryptoJS from 'crypto-js';

// 派生密钥 (与机器绑定)
function deriveEncryptionKey(): string {
  const machineId = `${hostname()}:${platform()}:${username()}`;
  return CryptoJS.PBKDF2(machineId, FIXED_SALT, {
    keySize: 256 / 32,
    iterations: 100000,
  }).toString();
}

function encryptApiKey(plainText: string): string {
  const key = deriveEncryptionKey();
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(plainText, key, { iv });
  return iv.toString() + ':' + encrypted.toString();
}

function decryptApiKey(cipherText: string): string {
  const key = deriveEncryptionKey();
  const [ivHex, encryptedHex] = cipherText.split(':');
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  const decrypted = CryptoJS.AES.decrypt(encryptedHex, key, { iv });
  return decrypted.toString(CryptoJS.enc.Utf8);
}
```

**决策理由**：密钥从 hostname + OS + username 派生，使得同一配置文件在不同机器上无法解密 API Key。这是防御性的——防止备份文件泄露时 API Key 被直接读取。

### 2.2 安全分级

| 分级 | 配置项 | 存储 | 导出 |
|------|--------|------|------|
| L0 公开 | 语言/主题/字体 | 明文 | 始终 |
| L1 内部 | 窗口尺寸/端口/快捷键 | 明文 | 始终 |
| L2 敏感 | 代理地址/WebDAV URL | 明文 | 选择性 |
| L3 机密 | 所有 API Key/密码/OSS Key | AES 加密 | 仅密码确认后 |

---

## 三、备份与恢复

### 3.1 本地备份

```rust
// backup.rs → local module
#[tauri::command]
fn export_config(scope: String) -> Result<String, String> {
    // scope: "full" | "shortcuts" | "services"
    let config = read_all_config();
    let filtered = match scope.as_str() {
        "full" => config,
        "shortcuts" => filter_hotkeys(&config),
        "services" => filter_services(&config),
        _ => return Err("无效的导出范围".into()),
    };
    
    let json = serde_json::to_string_pretty(&ExportPayload {
        version: APP_VERSION,
        exported_at: chrono::Utc::now(),
        config: filtered,
    }).unwrap();
    
    // 弹出保存文件对话框
    save_file_dialog(json, "yipot-config.json")
}

#[tauri::command]
fn import_config(json_path: String) -> Result<ImportResult, String> {
    let content = std::fs::read_to_string(json_path)?;
    let payload: ExportPayload = serde_json::from_str(&content)
        .map_err(|e| format!("JSON 格式错误: {e}"))?;
    
    // 版本兼容检查
    if !is_compatible(&payload.version) {
        return Err(format!("配置来自 v{}, 当前 v{}", payload.version, APP_VERSION));
    }
    
    // 合并配置
    merge_config(payload.config);
    Ok(ImportResult { imported: payload.config.keys().len() })
}
```

### 3.2 WebDAV 同步

```rust
// backup.rs → webdav module
use reqwest_dav::Client as DavClient;

#[tauri::command]
async fn webdav_upload(url: String, user: String, pass: String) -> Result<(), String> {
    let config_json = export_config("full")?;
    let client = DavClient::new(&url, (user, pass))
        .map_err(|_| "WebDAV 连接失败")?;
    
    client.put("yipot-config.json", config_json.as_bytes())
        .await
        .map_err(|e| format!("上传失败: {e}"))?;
    
    Ok(())
}

#[tauri::command]
async fn webdav_download(url: String, user: String, pass: String) -> Result<(), String> {
    let client = DavClient::new(&url, (user, pass))
        .map_err(|_| "WebDAV 连接失败")?;
    
    let bytes = client.get("yipot-config.json")
        .await
        .map_err(|e| format!("下载失败: {e}"))?;
    
    let json = String::from_utf8_lossy(&bytes);
    import_config_from_string(&json)
}
```

### 3.3 阿里云 OSS 同步

```rust
// 使用 aliyun-oss-rust-sdk
#[tauri::command]
async fn oss_upload(
    bucket: String, region: String,
    access_key: String, secret_key: String
) -> Result<(), String> {
    let client = OSSClient::new(bucket, region, access_key, secret_key);
    let config_json = export_config("full")?;
    client.put_object("yipot-config.json", config_json.as_bytes())
        .await
        .map_err(|e| format!("OSS 上传失败: {e}"))?;
    Ok(())
}
```

---

## 四、代理设置

```typescript
// proxy.ts — 全局代理代理
async function applyProxy(): Promise<void> {
  const enabled = await store.get<boolean>('proxy_enable');
  const host = await store.get<string>('proxy_host');
  
  if (enabled && host) {
    await invoke('set_proxy', { proxyUrl: host });
  } else {
    await invoke('unset_proxy');
  }
}

// Rust 侧: 设置环境变量应用于所有 HTTP 请求
#[tauri::command]
fn set_proxy(proxy_url: String) {
    std::env::set_var("HTTP_PROXY", &proxy_url);
    std::env::set_var("HTTPS_PROXY", &proxy_url);
}
```

---

## 五、设计决策

| 决策 | 理由 |
|------|------|
| PBKDF2 密钥派生 (100,000 次迭代) | 安全性与性能平衡; 同一机器可解密, 跨机不可解密 |
| AES-256-CBC (非 GCM) | crypto-js 内置支持, 无需额外依赖; Tauri 环境下无 GCM 性能需求 |
| 备份 JSON 含 version 字段 | 支持跨版本配置迁移, 避免字段重命名导致的配置丢失 |
| 敏感配置选择性导出 | 默认 L3 项不导出, 需要用户密码确认——防止误分享配置文件 |
| 代理设置作用于全局请求 | 翻译/OCR/TTS 服务均通过同一 HTTP 层, 统一走代理 |

---

## 六、配置版本迁移

```typescript
// configMigration.ts
const MIGRATIONS: Record<string, Migration> = {
  '2.x→3.0': (config) => {
    // proxy_host 拆分为 proxy_host + proxy_port
    const [host, port] = config.proxy_host?.split(':') || [];
    config.proxy_host = host;
    config.proxy_port = parseInt(port) || 8080;
    delete config.proxy_host_old;
    return config;
  },
  '3.0→3.1': (config) => {
    // 新增 app_fallback_font 字段
    config.app_fallback_font = config.app_fallback_font || 'default';
    return config;
  },
};

function migrateConfig(config: any, fromVersion: string): any {
  let current = config;
  let version = fromVersion;
  
  while (version !== APP_VERSION) {
    const path = `${version}→${nextVersion(version)}`;
    if (!MIGRATIONS[path]) throw new Error(`无迁移路径: ${path}`);
    current = MIGRATIONS[path](current);
    version = nextVersion(version);
  }
  
  return current;
}
```

---

## 七、错误处理

| 错误 | 处理 |
|------|------|
| 配置文件 JSON 格式错误 | 拒绝导入, 提示具体行号和列号 |
| 配置缺少必要字段 | 使用默认值填充, 列出缺失项供确认 |
| WebDAV 连接失败 | 重试 3 次 (间隔 2s/5s/10s), 提示"无法连接到服务器" |
| OSS AccessKey 无效 | 提示"OSS 认证失败, 请检查 AccessKey" |
| 配置文件过大 (> 10MB) | 警告"配置文件过大", 建议清理 |
| 导入版本不兼容 | 提示"请先升级到 vX.Y", 或允许强制导入(标注风险) |

---

## 八、交叉引用

- 开发方案: [26-prd-task-Rust配置备份](./26-prd-task-Rust配置备份.md)
- PRD: [27-prd-安全加密存储](../../prds/2026-09/27-prd-安全加密存储.md)
- PRD: [19-prd-代理与网络](../../prds/2026-09/19-prd-代理与网络.md)
- PRD: [39-prd-WebDAV阿里云备份](../../prds/2026-09/39-prd-WebDAV阿里云备份.md)