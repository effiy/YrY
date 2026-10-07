---

doc_type: module
prd_task_id: "YP-09-S28"
title: "WebDAV 阿里云备份 — 开发方案"
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

type: task
---

# WebDAV 阿里云备份 — 开发方案

## WebDAV

```rust
#[tauri::command]
fn webdav(action: String, url: String, username: String, password: String) -> Result<(), String> {
    let client = reqwest::blocking::Client::new();
    match action.as_str() {
        "upload" => client.put(&url).basic_auth(&username, Some(&password)).body(config_json).send(),
        "download" => { let resp = client.get(&url).basic_auth(&username, Some(&password)).send()?; ... }
        _ => Err("Unknown action".into())
    }
}
```

## 阿里云 OSS

```rust
#[tauri::command]
fn aliyun(action: String, bucket: String, region: String, ak: String, sk: String) -> Result<(), String> {
    // OSS SDK put_object / get_object
}
```

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| WebDAV 协议 | HTTP Basic Auth | 兼容 Nextcloud/OwnCloud |
| OSS | 阿里云 SDK | 原生支持，无需额外配置 |
| 增量备份 | 时间戳比较 + MD5 diff | 仅上传变更文件，节省带宽 |
| 加密传输 | HTTPS + WebDAV 可选 TLS | 避免明文传输 API Key |

## 性能优化

| 优化项 | 方案 | 效果 |
|--------|------|------|
| 增量同步 | 本地维护 `manifest.json` 记录文件 hash | 减少 90% 重复上传 |
| 并发上传 | `futures::join_all` 并发 3 个请求 | 多文件备份时间减半 |
| 大文件分块 | 5MB 分块上传 + 并行组装 | 避免单次超时 |
| WebDAV 连接复用 | `reqwest::Client` 实例化一次复用 | 免 TLS 握手重复开销 |

## 错误处理

| 错误场景 | 错误码 | 处理方式 | 用户提示 |
|----------|--------|----------|----------|
| WebDAV 401 认证失败 | `BAK-AUTH` | 提示检查用户名/密码 | "认证失败，请检查 WebDAV 账号密码" |
| WebDAV 404 路径不存在 | `BAK-PATH` | 自动 `MKCOL` 创建目录 | 静默创建 |
| WebDAV 507 空间不足 | `BAK-SPACE` | 停止上传，提示清理 | "云端空间不足，请清理后重试" |
| OSS AccessKey 无效 | `BAK-OSS-AK` | 检查 AK 格式 + 权限 | "AccessKey 无效或权限不足" |
| OSS Bucket 不存在 | `BAK-OSS-BKT` | 提示创建 Bucket | "Bucket「{name}」不存在" |
| 上传中断（网络波动） | `BAK-NET` | 分块上传支持断点续传 | "上传中断，自动续传中..." |
| 下载中断 | `BAK-DOWN` | HTTP Range 断点续传 | "下载中断，自动续传中..." |
| 数据校验失败 | `BAK-HASH` | MD5 比对，不一致则重新传输 | "数据校验失败，重新传输" |

## 交叉引用

| 关联文档 | 关系 | 说明 |
|----------|------|------|
| [39-prd-WebDAV阿里云备份](../prds/2026-09/39-prd-WebDAV阿里云备份.md) | 上游 PRD | 功能需求定义 |
| [37-prd-task-设置页面](./37-prd-task-设置页面.md) | 配置 | 备份服务配置（URL/账号/Bucket） |
| [27-prd-安全加密存储](../prds/2026-09/27-prd-安全加密存储.md) | 安全 | 备份不包含明文 API Key |
| `src-tauri/src/backup/` | 源码 | Rust 端备份实现 |