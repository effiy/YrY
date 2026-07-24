# Scene · 文件 URL 具时效签名，过期失效

> Story: [files](../index.md) · US-FI-3

## 用户故事

作为用户，文件 URL 具时效签名，过期失效。

## 验收

- `domain/files.get_signed_url(file_id, ttl=900)` 返回 OSS 签名 URL。
- 默认 TTL 15min；超过 TTL 访问返回 403。
- 私有 bucket 直链不可访问；必须经签名 URL。

## 使用场景 · 模块化

- `domain/files.get_signed_url()` 委派 `services/storage.sign()`；路由层不接触签名实现。
- 模块边界：`services/storage` 封装 OSS 签名 SDK，`domain/files` 只持有 file_id 与 TTL → 解耦。
