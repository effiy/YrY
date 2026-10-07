---
title: "BUG-004: API Key 明文存储于配置文件"
tags: [yipot, bug, security, api-key]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: YiPot
type: bug
status: 已修复
severity: P0
platform: 全平台
version: v3.0.0
fixed_in: v3.0.3
---

# BUG-004: API Key 明文存储于配置文件

## 基本信息

- **严重程度**: P0-阻断
- **分类**: 安全隐私
- **频率**: 每次必现

## 复现

1. 配置百度翻译 AppID + Secret
2. 打开 `.pot.dat` 配置文件
3. Secret 以明文 JSON 存储

## 影响

任何能读取配置文件的程序/用户可获取 API Key。

## 修复

使用 AES-256-CBC 加密敏感字段，密钥基于机器指纹 (hostname + OS + username hash)。

## 影响分析

| 维度 | 详情 |
|------|------|
| 用户体验 | 用户 API Key 可被任意本地应用/脚本读取 |
| 安全等级 | **严重** — 明文凭据泄露可导致 API 配额盗用、账单损失 |
| 合规影响 | 违反 API 服务商 (百度/Google/DeepL) 的 Key 保护条款 |
| 影响范围 | 所有配置了 API Key 的用户 (100%) |

## 技术细节

加密方案设计:

```
加密: AES-256-CBC
密钥派生: PBKDF2(hostname + machine_id, salt=random_16bytes, iterations=100000)
IV: 每条记录独立随机生成
存储格式: Base64(IV || ciphertext || HMAC-SHA256)
```

实现 (`config.rs`):

```rust
use aes::Aes256;
use cbc::Encryptor;
use pbkdf2::pbkdf2_hmac;
use sha2::Sha256;

fn encrypt_sensitive(value: &str, key: &[u8; 32]) -> String {
    let iv = rand::random::<[u8; 16]>();
    let cipher = Encryptor::<Aes256>::new(key.into(), &iv.into());
    // ... encrypt & encode
}

fn derive_key() -> [u8; 32] {
    let machine_fingerprint = format!(
        "{}{}{}",
        hostname::get()?.to_str(),
        std::env::consts::OS,
        whoami::username()
    );
    pbkdf2_hmac::<Sha256>(machine_fingerprint.as_bytes(), &salt, 100000, &mut key);
    key
}
```

## 验证

| 测试项 | 方法 | 结果 |
|--------|------|------|
| 磁盘无明文 Key | `grep -r "sk-" .pot.dat` | ✓ 无匹配 |
| 跨机器不可解密 | 复制 `.pot.dat` 到另一台 Mac | ✓ 解密失败，提示"配置已损坏" |
| 备份文件加密 | 导出 JSON → 检查敏感字段 | ✓ base64 密文 |
| 正向解密可用 | 正常启动 → 翻译百度/Google | ✓ 翻译正常 |
| 旧配置迁移 | v3.0.2 升级到 v3.0.3 | ✓ 首次启动自动加密 |
| 暴力破解抵抗 | PBKDF2 100k 迭代 | ✓ ~200ms/attempt |

## 经验教训

- 安全功能应在 v1.0 即实现，事后补救需要处理旧用户数据迁移
- 密钥派生需绑定机器指纹，防止配置文件复制攻击
- 备份功能需感知加密状态: 导出时保持加密，导入时验证指纹
- 所有需要持久化 API Key 的功能（翻译/OCR/TTS/生词本）共享同一加密层

## 关联

- 实现: [安全加密](../../devs/2026-09/48-prd-task-安全加密实现.md)
- PRD: [安全加密存储](../../prds/2026-09/27-prd-安全加密存储.md)
- 测试: [安全加密](../../tests/2026-09/30-prd-test-安全加密存储.md)