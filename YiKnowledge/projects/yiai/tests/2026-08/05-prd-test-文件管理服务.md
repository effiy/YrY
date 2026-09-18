---
doc_type: test
title: "YA-08-05: 文件管理服务 — 测试规格"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-05"
source_prds: ["05-需求-文件管理服务"]
source_modules: ["05-prd-task-文件管理服务"]
source_okr: [yiai-003]
---

# YA-08-05: 文件管理服务 — 测试规格

> 来源 PRD：[05-需求-文件管理服务.md](../../prds/2026-08/05-需求-文件管理服务.md)
> 开发方案：[05-prd-task-文件管理服务.md](../../devs/2026-08/05-prd-task-文件管理服务.md)
> 需求编号：YA-08-05 · 优先级：P0

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖文件 CRUD、双写持久化、路径安全、OSS 上传。

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-FS-01 | `write_file` → 磁盘写入 + MDB upsert | 文件存在 + `static_files` 有记录 |
| UT-FS-02 | `read_file` | 返回文件内容 |
| UT-FS-03 | `read_file` 不存在 → DATA_NOT_FOUND | ErrorCode 3002 |
| UT-FS-04 | `delete_file` | 磁盘文件删除 + MDB 删除 |
| UT-FS-05 | `rename_file` | 旧路径→新路径，原路径 404 |
| UT-FS-06 | 双写：MDB 不可用 | 磁盘写入成功，MDB upsert 静默失败 |
| UT-FS-07 | 双写：磁盘满 | 返回错误，不写 MDB |
| UT-FS-08 | 路径遍历 `../etc/passwd` | PERMISSION_DENIED |
| UT-FS-09 | `target_file` 参数契约 | 使用 `target_file` 参数名 |
| UT-FS-10 | base64 解码失败 | INVALID_PARAMS |

---

## 二、集成测试

| 编号 | 场景 | 预期 |
|------|------|------|
| IT-FS-01 | POST `/write-file` + `/read-file` 往返 | 写入后读取内容一致 |
| IT-FS-02 | OSS 上传 → URL 可访问 | 上传后返回可访问 URL |

---

## 三、缺陷分级

| 级别 | 示例 |
|------|------|
| S0 — 阻断 | 路径遍历攻击未被拦截 |
| S1 — 严重 | 磁盘写入失败但 MDB 写入成功（数据不一致） |
| S2 — 一般 | MDB 备份静默失败无日志 |

---