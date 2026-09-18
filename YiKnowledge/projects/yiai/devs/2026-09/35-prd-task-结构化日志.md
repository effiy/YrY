---
doc_type: module
prd_task_id: "YA-09-16"
title: "YA-09-16: 结构化 JSON 日志 — 统一格式 + 级别规范 + 敏感数据脱敏 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "35-需求-结构化日志.md"
source_okr: [yiai-001]
---

# YA-09-16: 结构化 JSON 日志 — 统一格式 + 级别规范 + 敏感数据脱敏 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[35-需求-结构化日志.md](../../prds/2026-09/35-需求-结构化日志.md)
> 需求编号：YA-09-16 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

将 Python `logging` 输出从纯文本升级为结构化 JSON，便于日志聚合系统（ELK/Loki）解析和检索。

### JSON 格式

```json
{
  "timestamp": "2026-09-14T10:30:00.000Z",
  "level": "INFO",
  "logger": "domain.ai.chat",
  "message": "Chat request completed",
  "trace_id": "abc123",
  "duration_ms": 1234,
  "tokens_used": 500,
  "module": "chat_service"
}
```

### 级别规范

| 级别 | 使用场景 |
|------|---------|
| ERROR | 需人工介入：MongoDB 不可达、Ollama 崩溃 |
| WARN | 降级/重试：缓存未命中、降级到兜底 |
| INFO | 关键业务事件：请求完成、索引更新 |
| DEBUG | 开发调试：参数值、中间状态 |

### 脱敏规则

自动检测字段名中的 `password`/`token`/`secret`/`api_key`，替换为 `***`。

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | `python-json-logger` 集成 + 格式定义 | 日志输出为合法 JSON | 0.5 |
| 2 | 级别规范 + 敏感字段脱敏 + CI 检查 | 无敏感数据出现在日志 | 0.5 |

**合计：1.0d**。

---

<a id="sec-3"></a>
## 三、关联模块

- 集成：`src/shared/logging.py`
- 关联：[YA-09-15 全链路 TraceID](./33-prd-task-分布式链路追踪.md)