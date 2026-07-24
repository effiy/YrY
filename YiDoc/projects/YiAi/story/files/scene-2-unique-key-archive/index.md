# Scene · 系统为文件生成唯一 key、按 bucket 归档

> Story: [files](../index.md) · US-FI-2

## 用户故事

作为系统，我能为文件生成唯一 key、按 bucket 归档。

## 验收

- key = `<sha1(content)>.<ext>`；按日期分桶（`YYYY/MM/DD/`）。
- 元数据（key / bucket / size / mime / owner）入 MongoDB。
- 重复内容同 key 去重；引用计数维护。

## 使用场景 · 模块化

- `domain/files.put()` 计算 key 与分桶；`services/storage.upload()` 执行 OSS put。
- 元数据持久化在 `data/repository.py`；domain 不直接触碰 MongoDB client → 持久化下沉。
