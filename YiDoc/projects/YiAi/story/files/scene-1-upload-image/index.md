# Scene · 上传图片并在对话中引用

> Story: [files](../index.md) · US-FI-1

## 用户故事

作为用户，我能上传图片并在对话中引用。

## 验收

- multipart 上传走 `routes/files.py`，文件大小限制走 `config.yaml`。
- `domain/files.put()` 返回 `file_id`；前端立即在对话中引用。
- 上传失败返回 `OSS_UPLOAD_FAILED`，前端可重试。

## 使用场景 · 模块化

- 路由层只解析 multipart + 校验大小；`domain/files` 编排存储与元数据。
- `services/storage/` 封装 OSS SDK；异常翻译为 `BusinessException` → 路由不感知 OSS 错误码。
