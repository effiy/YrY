---

doc_type: module
prd_id: "YA-09-111"
title: "YA-09-111: 代码健康审计与Bug修复 — 错误码/运行时/性能/安全"
status: 已完成
priority: P0
owner: Claude
roles: [engineer, sre]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
related_tasks: ["111-prd-task-代码健康审计与Bug修复.md"]
related_tests: ["111-prd-test-代码健康审计与Bug修复.md"]

type: 需求
---

# YA-09-111: 代码健康审计与Bug修复

> **PRD 版本**：v1.0 · **状态**：已完成

## 1. 背景

YiAi 代码库自 2026-07 以来快速迭代（熔断器、Gzip 中间件、ModelRuntime、翻译分析等模块密集交付），部分历史代码和新增模块存在错误码冲突、运行时 ImportError、硬编码魔法数字、死代码分支等质量问题。本次全量代码审计旨在系统性地发现并修复这些问题，提升代码库整体健康度。

## 2. 用户问题

- **目标用户**：后端开发者 / SRE
- **问题陈述**：作为开发者，我需要代码库无运行时错误、错误码唯一可区分、无硬编码魔法数字，才能自信地迭代和部署
- **证据**：强 — 审计发现 19 个具体问题，涵盖关键/高/中/低 4 个严重度

## 3. 范围

**In scope**：错误码定义、中间件路由、领域执行器、AI 工具沙箱、RSS 分类、MCP 内容提取、缓存层 TTL、LLM 运行时客户端复用、过滤辅助函数、批量 RPC 处理

**Out of scope**：架构重构、性能基准测试、端到端集成测试

## 4. 发现清单

### 4.1 关键级（运行时崩溃）

| ID | 文件 | 问题 | 影响 | 修复 |
|----|------|------|------|------|
| B01 | `shared/error_codes.py` | `RATE_LIMITED`(1003) 与 `RESOURCE_ALREADY_EXISTS`(1003) 业务码冲突 | 客户端无法区分限流和资源已存在 | 恢复 `RATE_LIMITED` 为 1005 |
| B02 | `shared/error_codes.py` | `INTERNAL_ERROR`(5001) 与 `DATABASE_ERROR`(5001) 业务码冲突 | 客户端无法区分数据库错误和内部错误 | `INTERNAL_ERROR` 改为 5005 |
| B03 | `server/routes/notification.py` | `from domain.auth.core import verify_token` — 函数不存在，应为 `verify_jwt` | 开启认证时 SSE 通知连接直接崩溃 | 改为 `verify_jwt` |

### 4.2 高级（功能受损）

| ID | 文件 | 问题 | 影响 | 修复 |
|----|------|------|------|------|
| B04 | `domain/ai/tools/sandbox.py` | `_ALLOWED_ROOTS` 中 `YiPett` 为拼写错误，`YiWeb` 为幽灵项目 | Agent 沙箱访问范围不正确 | 修正拼写，移除幽灵条目 |

### 4.3 中级（行为异常/性能退化）

| ID | 文件 | 问题 | 影响 | 修复 |
|----|------|------|------|------|
| B05 | `domain/execution/executor.py` | `elif/else` 分支执行完全相同的代码（死代码） | 代码冗余，`BusinessException` 路径丢失错误消息 | 合并分支，捕获 `e.message` |
| B06 | `server/routes/execution.py` | 批量 RPC `_execute_single` 使用硬编码 `1001`/`9999` | 魔法数字不可维护 | 改用 `ErrorCode` 枚举 |
| B07 | `server/routes/execution.py` | `asyncio.gather(return_exceptions=False)` | `CancelledError` 会导致整批丢失 | 改为 `True` + 归一化 |
| B08 | `data/filter_helpers.py` | `if not value:` 静默丢弃 `0`/`False` 过滤值 | 按状态码 0 或布尔 False 过滤时返回全量 | 改为 `value is None or value == ""` |
| B09 | `services/ai/model_runtime/openai.py` | 每次请求创建新 `AsyncOpenAI` 客户端 | 连接池无法复用，与 CLAUDE.md 记载的性能优化矛盾 | 使用模块级共享客户端 |
| B10 | `services/ai/model_runtime/ollama.py` | `complete()` 对所有异常重试（含 4xx） | 客户端错误（400）时浪费重试预算 | 仅对 5xx/超时/连接错误重试 |
| B11 | `shared/cache.py` | 内存回退 `TTLCache` 使用固定全局 TTL(300s)，忽略 `set()` 的 `ttl` 参数 | Redis 不可用时 30s TTL 条目实际存活 300s | 改用按条目 `(value, expire_at)` 字典 |
| B17 | `services/notification/notification_service.py` | `mark_as_read`/`delete_notification` 使用裸 `ValueError` 替代 `BusinessException` | RPC 调用参数验证失败时返回 500 而非 400 | 改用 `BusinessException(INVALID_PARAMS)` |
| B18 | `services/export/export_service.py` | `_process_export_task` 异常处理硬编码错误消息，丢失异常详情 | 导出任务失败时无法诊断根因 | 错误消息包含 `{e!s}` |
| B19 | `shared/config.py` | `observer_enabled` 默认值为 `True`，但 `observer` 包未安装 | 新部署不显式设置 `observer.enabled: false` 时，启动即崩溃 | 默认改为 `False` |
| B20 | `app.py` | observer 导入未包裹 try/except | B19 修复后仍存在的防御性缺陷 | 添加 `ImportError` 捕获 + 警告日志 |

### 4.5 安全漏洞（本轮新增）

| ID | 文件 | 问题 | 影响 | 修复 |
|----|------|------|------|------|
| B21 | `server/routes/search.py` | `/web-fetch` 端点无 SSRF 防护，可请求内网地址 | 攻击者可探测内网服务（MongoDB:27017、Ollama:11434、AWS 元数据 169.254.169.254） | 添加 `_is_private_url()` 私有 IP/保留地址拦截 |

### 4.4 低级（代码质量/可维护性）

| ID | 文件 | 问题 | 影响 | 修复 |
|----|------|------|------|------|
| B12 | `server/routes/mcp.py` | `_extract_content` 在 `model_dump()` 返回空时静默丢弃内容 | MCP 工具结果可能为空 | 添加 `str(item)` 兜底 |
| B13 | `domain/rss/persistence.py` | 分类名 `srer/release`(应为 `sre/release`)，`executiver/industry`(应为 `executive/industry`) | RSS 内容分类到不存在的目录 | 修正拼写 |
| B14 | `shared/error_codes.py` | 文件末尾缺少换行符 | POSIX 兼容性 | 添加换行 |
| B15 | `data/database.py` | `_SlowQueryLogger.succeeded()` 中 `if hasattr(coll, "startswith"): pass` 死代码 | 无功能影响 | 移除 |
| B16 | `tests/unit/shared/test_error_codes.py` | 测试断言与修复后的错误码不一致 | 测试失败 | 同步更新 |

## 5. 优先级矩阵

| 优先级 | 数量 | IDs |
|--------|------|-----|
| P0（关键） | 3 | B01, B02, B03 |
| P1（高） | 2 | B04, B21 |
| P2（中） | 10 | B05-B11, B17-B19 |
| P3（低） | 6 | B12-B16, B20 |

## 6. 验收标准

- [x] 所有 ErrorCode 枚举业务码全局唯一（`test_all_business_codes_unique` 通过）
- [x] `notification.py` SSE 端点认证路径可正常导入
- [x] 沙箱允许列表包含所有 4 个真实项目（YiVad/YiAi/YiPet/YiKnowledge）
- [x] 批量 RPC 使用 `ErrorCode` 枚举替代魔法数字
- [x] `filter_helpers` 正确传递 `0`/`False` 过滤值
- [x] `OpenAIRuntime` 复用共享 HTTP 客户端
- [x] `OllamaRuntime.complete()` 仅对瞬态错误重试
- [x] 内存缓存按条目 TTL 正确过期
- [x] 457 个单元测试全部通过
- [x] `notification_service` 参数校验使用 `BusinessException` 替代 `ValueError`
- [x] `export_service` 异常处理保留根因详情
- [x] `observer_enabled` 默认 `False`，未安装 observer 时安全启动
- [x] `/web-fetch` SSRF 防护：拦截私有 IP/保留地址/localhost