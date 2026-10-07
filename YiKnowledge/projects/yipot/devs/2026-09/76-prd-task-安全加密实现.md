---

doc_type: module
prd_task_id: "YP-09-S16"
title: "API Key 加密与安全存储 — 开发方案"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "27-prd-安全加密存储.md"

type: task
---

# API Key 加密与安全存储 — 开发方案

> 来源 PRD：[27-prd-安全加密存储.md](../../prds/2026-09/27-prd-安全加密存储.md)

## 架构概览

```
用户配置翻译/OCR API Key
      │
      │  { appId: "202301...", secret: "abcdef..." }
      ▼
┌───────────────────────────────────────────────────────┐
│           加密层 (Rust / Node.js)                      │
│                                                        │
│  encrypt_api_key(plaintext) → ciphertext               │
│    │                                                    │
│    │  1. 生成机器指纹                                  │
│    │     hostname + OS + username → SHA256 → 32 bytes  │
│    │                                                    │
│    │  2. AES-256-CBC 加密                              │
│    │     key = machine_fingerprint (32 bytes)           │
│    │     iv = 随机 16 bytes (prepended to ciphertext)   │
│    │     plaintext → PKCS7 padding → AES encrypt        │
│    │                                                    │
│    │  3. Base64 编码 (可安全存储到 JSON)               │
│    │     ciphertext = iv + encrypted + Base64           │
│    │                                                    │
│    ▼  "U2FsdGVkX1..."                                 │
│                                                        │
│  decrypt_api_key(ciphertext) → plaintext               │
│    │  Base64 decode → extract iv → AES decrypt → text  │
│    ▼                                                   │
└───────────────────────┬───────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────┐
│            存储层 (JSON 配置文件)                       │
│                                                        │
│  {                                                     │
│    "translate_baidu_appId": "20230101000000001",       │
│    "translate_baidu_secret": "U2FsdGVkX1...",          │  ← 加密后
│    "translate_baidu_enable": true,                     │  ← 非敏感，明文
│    "translate_google_enable": true,                    │  ← 非敏感
│    "translate_deepl_apiKey": "U2FsdGVkX1...",          │  ← 加密后
│    ...                                                 │
│  }                                                     │
│                                                        │
│  仅加密 apiKey/secret/token 等敏感字段                │
│  enable/host/region 等非敏感配置保持明文              │
└───────────────────────────────────────────────────────┘
                        │
                        ▲
┌───────────────────────────────────────────────────────┐
│            安全边界                                     │
│                                                        │
│  ✓ 磁盘存储：加密后的密文                              │
│  ✓ 日志输出：API Key 明文脱敏 (仅显示前4后4)           │
│  ✓ HTTP 绑定：仅 127.0.0.1 (不暴露到局域网)            │
│  ✓ 网络传输：仅当用户主动使用 WebDAV 同步配置时       │
│  ✗ 内存中：API Key 明文存在 (运行时需要)              │
│  ✗ 跨机器：复制配置文件到其他机器无法解密             │
└───────────────────────────────────────────────────────┘
```

## 核心实现

### 源码位置

`YiPot/src-tauri/src/crypto.rs` 或 `YiPot/src/utils/crypto.js` (Node.js helper)

### 机器指纹生成

```rust
// crypto.rs
use sha2::{Sha256, Digest};
use std::env;

fn machine_fingerprint() -> [u8; 32] {
    let hostname = hostname::get()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    let os = env::consts::OS;
    let username = env::var("USER")
        .or_else(|_| env::var("USERNAME"))
        .unwrap_or_default();

    // SHA256(hostname + OS + username)
    let input = format!("{}-{}-{}", hostname, os, username);
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();
    
    let mut key = [0u8; 32];
    key.copy_from_slice(&result[..32]);
    key
}
```

### AES-256-CBC 加密/解密

```rust
use aes::Aes256;
use cbc::{Encryptor, Decryptor};
use cbc::cipher::{BlockEncryptMut, BlockDecryptMut, KeyIvInit};
use rand::Rng;

type Aes256CbcEnc = Encryptor<Aes256>;
type Aes256CbcDec = Decryptor<Aes256>;

fn encrypt(plaintext: &str) -> Result<String, String> {
    let key = machine_fingerprint();
    
    // 随机 IV (16 bytes)
    let mut iv = [0u8; 16];
    rand::thread_rng().fill(&mut iv);

    // PKCS7 padding
    let padded = pkcs7_pad(plaintext.as_bytes(), 16);
    
    // AES-256-CBC 加密
    let cipher = Aes256CbcEnc::new(&key.into(), &iv.into());
    let mut buffer = padded.clone();
    cipher.encrypt_blocks_mut(&mut buffer);

    // IV + ciphertext → Base64
    let mut combined = iv.to_vec();
    combined.extend_from_slice(&buffer);
    Ok(base64_encode(&combined))
}

fn decrypt(ciphertext_b64: &str) -> Result<String, String> {
    let key = machine_fingerprint();
    
    // Base64 解码
    let combined = base64_decode(ciphertext_b64)
        .map_err(|_| "Base64 decode failed")?;
    
    // 提取 IV (前 16 bytes)
    let iv: [u8; 16] = combined[..16].try_into()
        .map_err(|_| "Invalid IV")?;
    let encrypted = &combined[16..];

    // AES-256-CBC 解密
    let cipher = Aes256CbcDec::new(&key.into(), &iv.into());
    let mut buffer = encrypted.to_vec();
    cipher.decrypt_blocks_mut(&mut buffer);

    // 去除 PKCS7 padding
    let unpadded = pkcs7_unpad(&buffer)?;
    String::from_utf8(unpadded).map_err(|_| "UTF-8 decode failed".into())
}

fn pkcs7_pad(data: &[u8], block_size: usize) -> Vec<u8> {
    let pad_len = block_size - (data.len() % block_size);
    let mut padded = data.to_vec();
    padded.extend(std::iter::repeat(pad_len as u8).take(pad_len));
    padded
}
```

### 选择性加密

```rust
// 敏感字段列表
const SENSITIVE_FIELDS: &[&str] = &[
    "secret", "api_key", "apiKey", "token", "password",
];

fn encrypt_sensitive_fields(config: &mut serde_json::Value) {
    for (key, value) in config.as_object_mut().unwrap() {
        let is_sensitive = SENSITIVE_FIELDS.iter()
            .any(|field| key.to_lowercase().contains(field));
            
        if is_sensitive && value.is_string() {
            let encrypted = encrypt(value.as_str().unwrap())
                .unwrap_or_else(|_| value.as_str().unwrap().to_string());
            *value = serde_json::Value::String(encrypted);
        }
    }
}
```

### 日志脱敏

```rust
fn mask_secret(value: &str) -> String {
    if value.len() <= 8 {
        return "****".to_string();
    }
    format!("{}****{}", &value[..4], &value[value.len()-4..])
}
// "sk-abcdefghijklmnop" → "sk-a****mnop"
```

---

## 设计决策

| 决策点 | 方案 | 备选 | 理由 | 代价 |
|--------|------|------|------|------|
| 加密算法 | AES-256-CBC | AES-256-GCM / ChaCha20-Poly1305 | AES-CBC 被 crypto-js 和 Rust 广泛支持，实现简单 | 无认证加密 (Authenticated Encryption)，不防篡改 |
| 密钥派生 | SHA256(hostname + OS + username) | PBKDF2 / Argon2 | 机器指纹无需防暴力破解（攻击者无配置文件也无法解密） | 换用户名/重装系统后密钥变化，配置不可迁移 |
| IV 生成 | 随机 16 bytes (每次加密不同) | 固定 IV | 相同明文每次加密产生不同密文，防模式分析 | IV 需随密文存储 (16 bytes overhead) |
| 加密粒度 | 仅敏感字段 (secret/apiKey/token) | 整个配置文件 | 细粒度加密 → 非敏感配置可读 (方便调试/手动修改) | 需维护敏感字段列表 |
| 密钥存储 | 不存储，运行时从机器信息派生 | 存储到系统 keychain | 零密钥文件，攻击者无法直接窃取密钥 | 每次加密/解密都需计算 SHA256 |
| 跨机器 | 配置复制到其他机器无法解密 | 允许跨机器 | 安全边界：防止配置文件泄露后凭据批量被盗 | 用户换机器需重新配置 API Key |
| 网络绑定 | HTTP 服务仅绑定 127.0.0.1 | 0.0.0.0 (局域网可访问) | 安全边界：不暴露到局域网，仅本机访问 | 无法通过局域网其他设备调用 API |

---

## 性能优化

| 优化点 | 目标 | 方案 | 效果 |
|--------|------|------|------|
| 指纹计算 | <1ms | SHA256 单次计算，首次后缓存在内存 | 启动时计算一次，后续 O(1) |
| 批量加解密 | <100ms for 20 fields | AES-CBC streams，内存操作无 I/O | 配置加载时一次遍历 |
| 密钥缓存 | 避免重复 SHA256 | 全局 `Lazy<[u8; 32]>` 延迟初始化 | 仅计算一次，跨会话复用 |

---

## 错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-密钥 | 机器指纹变化 (重装系统/换用户) | 解密失败 → 提示重新配置 API Key | 用户重新输入 | Toast "加密密钥已变化，请重新配置 API Key" |
| L1-加密 | 配置文件损坏 (密文不完整) | 跳过该字段 + 记录错误日志 | 用户重新配置该 API | Toast "部分配置加载失败" |
| L2-格式 | Base64 解码失败 | 视为明文 (兼容旧版配置) | 自动降级 | 无感知 |
| L2-编码 | 解密后 UTF-8 解析失败 | 记录错误 → 提示重新输入 | 用户重新配置 | Toast |
| L3-输入 | 加密时传入空字符串 | 跳过加密，存储空字符串 | — | 无感知 |
| L3-日志 | 日志误输出 API Key 明文 | 所有日志宏强制脱敏 (mask_secret wrapper) | 编译期/运行时检查 | — |

---

**关联文档**：
- 配置存储与备份：[07-prd-task-配置存储与备份实现.md](./07-prd-task-配置存储与备份实现.md)
- 测试方案：[27-prd-test-安全加密存储](../../tests/2026-09/27-prd-test-安全加密存储.md)