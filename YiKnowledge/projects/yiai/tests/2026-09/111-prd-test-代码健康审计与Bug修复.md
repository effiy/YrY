---

doc_type: test
prd_test_id: "YA-09-111"
title: "YA-09-111: 代码健康审计与Bug修复 — 测试方案"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"

type: test
---

# YA-09-111: 代码健康审计与Bug修复 — 测试方案

> **测试结果**：457 passed, 0 failed, 1 warning (预存在)

## 1. 测试矩阵

### 1.1 错误码唯一性 (B01, B02, B14)

| 场景 | 预期 | 测试 |
|------|------|------|
| 所有非别名 ErrorCode 业务码唯一 | 无重复 | `test_all_business_codes_unique` ✓ |
| `RATE_LIMITED.business == 1005` | 1005 | `test_client_errors` ✓ |
| `INTERNAL_ERROR.business == 5005` | 5005 | `test_server_errors` ✓ |
| `RESOURCE_ALREADY_EXISTS.business == 1003` | 1003 | `test_resource_already_exists` ✓ |
| `DATABASE_ERROR.business == 5001` | 5001 | `test_database_error` ✓ |
| `map_http_to_error_code(429) == RATE_LIMITED` | RATE_LIMITED | `test_known_mappings` ✓ |
| `map_http_to_error_code(503) == AI_UNAVAILABLE` | AI_UNAVAILABLE | `test_known_mappings` ✓ |
| `map_http_to_error_code(504) == AI_TIMEOUT` | AI_TIMEOUT | `test_known_mappings` ✓ |

### 1.2 运行时正确性 (B03)

| 场景 | 预期 | 验证方式 |
|------|------|---------|
| `from domain.auth.core import verify_jwt` | 成功导入 | 静态验证：函数存在于 `core.py:68` |
| 通知 SSE `/notification/stream?token=` 认证路径 | 正常返回 UNAUTHORIZED | 手动验证 |

### 1.3 AI 工具沙箱 (B04)

| 场景 | 预期 | 验证方式 |
|------|------|---------|
| `_ALLOWED_ROOTS` 不包含 `../YiPett` | False | 静态验证 |
| `_ALLOWED_ROOTS` 不包含 `../YiWeb` | False | 静态验证 |
| `_ALLOWED_ROOTS` 包含所有 4 个真实项目 | 4 entries | 静态验证 |

### 1.4 执行器 (B05)

| 场景 | 预期 | 测试 |
|------|------|------|
| 同步函数执行 | `_run_function` 被调用 | `test_execution` 系列 ✓ |
| 异步函数执行 | `_run_function` 被调用 | `test_execution` 系列 ✓ |
| `BusinessException` 携带 `error_message` | `error_message == e.message` | 静态验证 |

### 1.5 批量 RPC (B06, B07)

| 场景 | 预期 | 验证方式 |
|------|------|------|
| 流式端点在批处理中返回 BUSINESS_ERROR | `code: 1001` | `_execute_single` 静态验证 |
| 异常在批处理中返回 UNKNOWN_INTERNAL_ERROR | `code: 9999` | `_execute_single` 静态验证 |
| `CancelledError` 不丢弃其他已完成结果 | `return_exceptions=True` | 静态验证 |

### 1.6 过滤器 (B08)

| 场景 | 预期 | 验证方式 |
|------|------|------|
| `build_filter({"status": 0})` | `{"status": 0}` | 静态验证 |
| `build_filter({"active": False})` | `{"active": False}` | 静态验证 |
| `build_filter({"name": None})` | `{}` (跳过) | 静态验证 |
| `build_filter({"name": ""})` | `{}` (跳过) | 静态验证 |

### 1.7 OpenAI 客户端复用 (B09)

| 场景 | 预期 | 验证方式 |
|------|------|------|
| 连续 2 次 `stream_chat()` | 使用同一个 `_openai_client` 实例 | 静态验证（模块级单例） |
| 连续 2 次 `complete()` | 使用同一个 `_openai_client` 实例 | 静态验证 |

### 1.8 Ollama 重试策略 (B10)

| 场景 | 预期 | 验证方式 |
|------|------|------|
| HTTP 500 响应 | 重试 | 静态验证 |
| HTTP 400 响应 | 立即返回失败 | 静态验证 |
| `TimeoutException` | 重试 | 静态验证 |
| `ConnectError` | 重试 | 静态验证 |
| 非 HTTP 异常 | 立即返回失败 | 静态验证 |

### 1.9 缓存 TTL (B11)

| 场景 | 预期 | 验证方式 |
|------|------|------|
| `set("k", "v", ttl=30)` + 25s 后 `get("k")` | 返回 `"v"` | 静态验证（`time.monotonic()` 逻辑） |
| `set("k", "v", ttl=1)` + 2s 后 `get("k")` | 返回 `None` | 静态验证 |
| 超过 `_max_memory_entries` 条目 | 最旧条目被淘汰 | 静态验证 |

### 1.10 MCP 内容提取 (B12)

| 场景 | 预期 | 验证方式 |
|------|------|------|
| `model_dump()` 抛出异常 | `str(item)` 兜底输出 | 静态验证 |
| `model_dump()` 返回空字典 | `str(item)` 兜底输出 | 静态验证 |

### 1.11 RSS 分类 (B13)

| 场景 | 预期 | 测试 |
|------|------|------|
| 云原生关键词匹配 | 分类为 `sre/release` | `test_cloud_keyword_maps_to_release` ✓ |
| 未知分类回退 | 分类为 `executive/industry` | `test_fallback_category` ✓ |
| 全部 26 个 RSS 测试 | 通过 | `test_rss_feed.py` 26/26 ✓ |

### 1.12 其他修复 (B15, B16)

| 场景 | 预期 | 验证方式 |
|------|------|------|
| `_SlowQueryLogger` 无死代码 | `if hasattr(coll, "startswith"): pass` 已移除 | 静态验证 |
| 测试断言与修复后的 ErrorCode 一致 | 全部通过 | `test_error_codes.py` 13/13 ✓ |

### 1.13 通知服务异常类型 (B17)

| 场景 | 预期 | 验证方式 |
|------|------|------|
| `mark_as_read({"notification_id": ""})` | 返回 `code: 1002` (INVALID_PARAMS) | 静态验证：`BusinessException` 替代 `ValueError` |
| `delete_notification({"notification_id": ""})` | 返回 `code: 1002` (INVALID_PARAMS) | 静态验证 |

### 1.14 导出服务错误消息 (B18)

| 场景 | 预期 | 验证方式 |
|------|------|------|
| 导出任务处理异常 | `export_tasks` 集合中 `error` 字段包含异常详情 | 静态验证：`f"Export processing failed: {e!s}"` |
| 异常日志 | `logger.exception` 携带异常信息 | 静态验证 |

### 1.15 Observer 安全降级 (B19, B20)

| 场景 | 预期 | 验证方式 |
|------|------|------|
| `observer_enabled` 默认值 | `False` | 静态验证：`python -c "from shared.config import settings; assert not settings.observer_enabled"` |
| `observer_enabled=True` 但包未安装 | 启动时不崩溃，输出 warning 日志 | 静态验证：`try/except ImportError` |
| `observer_enabled=False` | 跳过 observer 中间件注册 | 静态验证 |

### 1.16 Web-Fetch SSRF 防护 (B21)

| 场景 | 预期 | 验证方式 |
|------|------|------|
| `_is_private_url("http://localhost:10086")` | `True` (拦截) | 运行时验证 ✓ |
| `_is_private_url("http://169.254.169.254/latest")` | `True` (拦截) | 运行时验证 ✓ |
| `_is_private_url("http://10.0.0.1:27017")` | `True` (拦截) | 运行时验证 ✓ |
| `_is_private_url("http://127.0.0.1")` | `True` (拦截) | 运行时验证 ✓ |
| `_is_private_url("https://google.com")` | `False` (放行) | 运行时验证 ✓ |
| `_is_private_url("http://[::1]:10086")` | `True` (拦截) | 静态验证 |
| DNS 解析到私有 IP（如 `internal.corp.local` → 10.0.1.5） | `True` (拦截) | 静态验证 |

## 2. 回归测试

```bash
# 全量单元测试
python -m pytest tests/unit/ -q
# 结果：457 passed, 0 failed

# 错误码专项测试
python -m pytest tests/unit/shared/test_error_codes.py -v
# 结果：13 passed

# RSS 专项测试
python -m pytest tests/unit/domain/test_rss_feed.py -v
# 结果：26 passed

# 执行器测试
python -m pytest tests/unit/domain/test_execution.py -v
# 结果：全部通过
```

## 3. 已知未修复项

| 项 | 原因 |
|----|------|
| `KNOWLEDGE_FILE_NOT_FOUND` 与 `FILE_NOT_FOUND` 共享 3002 | 有意为之，语义别名 |
| `auth_token` 属性环境变量优先级 | 向后兼容设计 |
| knowledge-search 全盘扫描性能 | 已有 60s 缓存缓解 |
| `OpenAIRuntime.complete()` 未处理 images 参数 | 与 `stream_chat()` 不一致，但当前调用方不传 images 给 complete |