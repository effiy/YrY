---
doc_type: prd
title: "YP-09-S28: WebDAV 与阿里云备份同步"
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S28
estimate_frontend: 1.0
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, 备份, WebDAV, 阿里云]
category: 项目/桌面应用/需求
---

# YP-09-S28: WebDAV 与阿里云备份同步

> 需求编号：YP-09-S28 · 优先级：P2 · 人天：1.0d · 状态：已完成

## 背景

配置备份是用户多设备同步的核心需求。支持本地 JSON、WebDAV（自建网盘）、阿里云 OSS 三种方式。

## 需求

### 本地备份

- 导出全部配置为 JSON
- 导入 JSON 合并到当前配置
- 可选择导出范围（全部/仅服务/仅快捷键）

### WebDAV 同步

```rust
// backup.rs → webdav command
#[tauri::command]
fn webdav(action: String, url: String, username: String, password: String)
```

- PUT 上传配置
- GET 下载配置

### 阿里云 OSS

```rust
#[tauri::command]
fn aliyun(action: String, bucket: String, region: String, ak: String, sk: String)
```

- OSS SDK 上传/下载

## 验收标准

- [ ] 本地导出 JSON 完整
- [ ] WebDAV 上传下载正常
- [ ] 阿里云 OSS 同步正常
- [ ] 导入失败不损坏现有配置

## 量化验收标准

| 操作 | 目标 | 测量方法 |
|------|------|----------|
| 本地导出 JSON | < 500ms (配置 < 1MB) | 含序列化 + 文件写入 |
| 本地导入 JSON | < 500ms | 含文件读取 + 反序列化 + 合并 |
| WebDAV 上传 | < 3s (1MB 配置) | PUT 请求到完成 |
| WebDAV 下载 | < 3s (1MB 配置) | GET 请求到完成 |
| 阿里云 OSS 上传 | < 3s (1MB 配置) | OSS SDK PutObject |
| 阿里云 OSS 下载 | < 3s (1MB 配置) | OSS SDK GetObject |
| 连接测试 (WebDAV) | < 5s | 超时前 PROPFIND 响应 |
| 连接测试 (OSS) | < 5s | 超时前 HeadBucket 响应 |

## 边界条件与异常处理

| 场景 | 触发条件 | 预期行为 | 恢复策略 |
|------|----------|----------|----------|
| WebDAV 网络超时 | 15s 无响应 | 提示 "连接超时，请检查服务器地址" | 保留本地"待同步"标记 |
| WebDAV 认证失败 | 401 响应 | 提示 "用户名或密码错误" | 不清除已保存的凭据 |
| 阿里云 AK/SK 无效 | 403 响应 | 提示 "AccessKey 无效或已过期" | 引导更新 AK/SK |
| 阿里云 Bucket 不存在 | 404 响应 | 提示 "Bucket 不存在或区域错误" | 验证 region 配置 |
| WebDAV 路径无写入权限 | 403 响应 | 提示 "无写入权限" | — |
| 导入 JSON 格式错误 | 非 JSON 内容 | 弹窗提示 "格式错误" | 拒绝导入，当前配置不变 |
| 导入 JSON schema 不匹配 | 缺少必填字段 | 合并模式：仅导入匹配的字段 | 报告跳过的字段 |
| 同时触发多次同步 | 用户快速点击 | 上一次操作未完成时按钮 disabled | 防止竞态条件 |
| OSS 下载超大文件 | > 5MB | 拒绝下载，提示 "配置文件异常" | 手动检查 OSS 文件 |
| 磁盘空间不足 | 写入时 ENOSPC | 提示 "磁盘空间不足" | 保留当前配置不丢失 |

## 非功能需求

### 安全
- WebDAV 密码和阿里云 AK/SK 加密存储在 `tauri-plugin-store`，不在日志中明文输出
- WebDAV 支持 HTTPS only（HTTP 连接警告但允许）
- 阿里云使用 STS 临时凭证模式时，自动处理过期刷新（预留接口）
- 导入的配置文件在 Rust 层做 JSON schema 校验

### 可靠性
- 每次同步前自动创建本地备份（`.pot.dat.{timestamp}.bak`）
- 导入操作先写入临时文件，校验成功后再替换正式配置
- WebDAV/OSS 操作支持 3 次重试（间隔 2s/4s/8s 指数退避）

### 可观测性
- 记录每次同步：来源/目标、耗时、文件大小、成功/失败
- 同步失败时保存详细错误信息到日志

## 模块交互

```
Config/Backup Page (设置页面 > 备份)
     │
     ├── 本地备份
     │   ├── 导出: config.rs::get_all() → JSON string → 文件保存对话框
     │   └── 导入: 文件打开对话框 → JSON parse → Schema 验证 → config.rs::set_all()
     │
     ├── WebDAV
     │   ├── 连接测试: PROPFIND → 验证能访问
     │   ├── 上传: config.rs::get_all() → webdav::put(url, username, password, data)
     │   └── 下载: webdav::get(url, username, password) → Schema 验证 → config.rs::set_all()
     │
     └── 阿里云 OSS
         ├── 连接测试: HeadBucket → 验证能访问
         ├── 上传: config.rs::get_all() → oss::put_object(bucket, region, ak, sk, data)
         └── 下载: oss::get_object(bucket, region, ak, sk) → Schema 验证 → config.rs::set_all()

backend (backup.rs)
     │
     ├── webdav() fn → reqwest HTTP client (PUT/GET/PROPFIND)
     │   └── 依赖: reqwest crate (HTTPS, basic auth)
     │
     ├── aliyun() fn → aliyun-oss-rust-sdk
     │   └── 依赖: aliyun-oss-rust-sdk crate
     │
     └── local_backup() / local_restore() → std::fs read/write
```

**上游依赖**：
- `config.rs`：提供 `get_all()` / `set_all()` 读写完整配置
- `tauri::api::dialog`：文件保存/打开对话框
- `reqwest` crate：HTTP 客户端（WebDAV）
- `aliyun-oss-rust-sdk`：OSS SDK

**下游消费者**：
- 设置页面 > Backup 页面：提供 UI 操作入口
- `config.rs::reload_store()`：导入后重新加载配置到内存

**配置依赖**：
- WebDAV 凭据、阿里云 AK/SK 存储在 `tauri-plugin-store`
- 加密存储使用 `keyring-rs`（macOS Keychain / Windows Credential Manager）（预留接口）

## 参考

- [37-prd-设置页面架构](./37-prd-设置页面架构.md) — 设置页面中 Backup 子页面的位置
- [43-prd-Rust配置备份错误处理](./43-prd-Rust配置备份错误处理.md) — Rust 层 backup.rs 实现细节