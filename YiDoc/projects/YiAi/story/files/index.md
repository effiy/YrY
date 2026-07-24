# Story · 文件 / OSS 存储（files）

> 模块：[YiAi Story](../index.md) · `src/domain/files/`

## 场景

- [US-FI-1 · 上传图片并在对话中引用](scene-1-upload-image/index.md)
- [US-FI-2 · 系统为文件生成唯一 key、按 bucket 归档](scene-2-unique-key-archive/index.md)
- [US-FI-3 · 文件 URL 具时效签名，过期失效](scene-3-signed-url/index.md)

## 使用场景 · 模块化

- `domain/files/` 暴露 `put()` / `get_signed_url()`，内部委派 `services/storage/`。
- 路由层不直接接触 OSS SDK；OSS 凭证失效或限流等异常由 `services/storage` 翻译为 `BusinessException`。
