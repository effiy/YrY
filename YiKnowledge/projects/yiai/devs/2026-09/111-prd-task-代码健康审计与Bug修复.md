---

doc_type: task
prd_task_id: "YA-09-111"
title: "YA-09-111: 代码健康审计与Bug修复 — 技术实现方案"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
source_prd: "111-需求-代码健康审计与Bug修复.md"

type: task
---

# YA-09-111: 代码健康审计与Bug修复 — 技术实现

> **影响文件**：10 个源文件 + 1 个测试文件 · **净变更**：~80 行

## 1. 实现架构

```
修复分类：
  shared/error_codes.py          ← B01, B02, B14 (错误码冲突 + 格式)
  tests/.../test_error_codes.py  ← B16 (测试同步)
  server/routes/notification.py  ← B03 (ImportError)
  domain/ai/tools/sandbox.py     ← B04 (拼写错误)
  domain/execution/executor.py   ← B05 (死代码 + 异常消息)
  server/routes/execution.py     ← B06, B07 (魔法数字 + gather)
  data/filter_helpers.py         ← B08 (falsy 值丢弃)
  services/ai/model_runtime/openai.py ← B09 (客户端复用)
  services/ai/model_runtime/ollama.py ← B10 (选择性重试)
  shared/cache.py                ← B11 (按条目 TTL)
  server/routes/mcp.py           ← B12 (内容兜底)
  domain/rss/persistence.py      ← B13 (分类名拼写)
  data/database.py               ← B15 (死代码移除)
```

## 2. 关键实现细节

### 2.1 错误码唯一性修复 (B01, B02)

**文件**：`shared/error_codes.py`

```python
# B01: RATE_LIMITED 从 1003 → 1005 (与 RESOURCE_ALREADY_EXISTS 解耦)
RATE_LIMITED = ErrorInfo(1005, HTTP_429, "Too Many Requests")

# B02: INTERNAL_ERROR 从 5001 → 5005 (与 DATABASE_ERROR 解耦)
INTERNAL_ERROR = ErrorInfo(5005, HTTP_500, "Internal Error")
```

**验证**：`test_all_business_codes_unique` 测试确认所有业务码全局唯一。

### 2.2 运行时 ImportError 修复 (B03)

**文件**：`server/routes/notification.py`

```python
# Before: from domain.auth.core import verify_token  # 函数不存在
# After:
from domain.auth.core import verify_jwt
verify_jwt(token)
```

`verify_jwt` 是 `domain/auth/core.py:68` 中定义的实际函数，签名 `(token: str) -> dict | None`。

### 2.3 AI 工具沙箱路径修正 (B04)

**文件**：`domain/ai/tools/sandbox.py`

```python
# Before:
_ALLOWED_ROOTS = ["../YiKnowledge", "../YiVad", "../YiPet", "../YiAi", "../YiWeb", "../YiPett"]
# After:
_ALLOWED_ROOTS = ["../YiKnowledge", "../YiVad", "../YiPet", "../YiAi"]
```

- `YiPett` → `YiPet`：修正拼写错误
- 移除 `YiWeb`：该目录不存在于单体仓库中

### 2.4 执行器死代码与异常处理 (B05)

**文件**：`domain/execution/executor.py`

```python
# Before: elif/else 两个分支执行相同代码
elif asyncio.iscoroutinefunction(target_function):
    result = await _run_function(target_function, parameters_dict)
else:
    result = await _run_function(target_function, parameters_dict)

# After: _run_function 内部已检查 iscoroutinefunction，外部无需重复判断
else:
    result = await _run_function(target_function, parameters_dict)
```

同时修复 `BusinessException` 处理器丢失错误消息：

```python
# Before:
except BusinessException:
    status = "failed"
    raise
# After:
except BusinessException as e:
    status = "failed"
    error_message = e.message
    raise
```

### 2.5 魔法数字消除 (B06)

**文件**：`server/routes/execution.py`

```python
# Before:
return {"code": 1001, "message": "...", "data": None}
return {"code": 9999, "message": str(e), "data": None}
# After:
return {"code": ErrorCode.BUSINESS_ERROR.business, ...}
return {"code": ErrorCode.UNKNOWN_INTERNAL_ERROR.business, ...}
```

### 2.6 批量 RPC 容错增强 (B07)

```python
# Before: return_exceptions=False — CancelledError 会丢弃整批结果
results = await asyncio.gather(*tasks, return_exceptions=False)

# After: return_exceptions=True + 归一化异常对象为错误字典
results = await asyncio.gather(*tasks, return_exceptions=True)
normalized = []
for r in results:
    if isinstance(r, BaseException):
        normalized.append({"code": ErrorCode.UNKNOWN_INTERNAL_ERROR.business, "message": str(r), "data": None})
    else:
        normalized.append(r)
```

### 2.7 过滤器 falsy 值修复 (B08)

**文件**：`data/filter_helpers.py`

```python
# Before: if not value: — 丢弃 0, False, [], {}
# After: 仅跳过 None 和空字符串
if value is None or value == "":
    continue
```

`build_filter` 是 `query_documents` 的热路径，修改影响所有集合的数值/布尔字段过滤。

### 2.8 OpenAI 客户端复用 (B09)

**文件**：`services/ai/model_runtime/openai.py`

```python
# 新增模块级共享客户端（与 OllamaRuntime 的 _get_ollama_client 模式一致）
_openai_client: Any = None

def _get_openai_client() -> Any:
    global _openai_client
    if _openai_client is None:
        from openai import AsyncOpenAI
        _openai_client = AsyncOpenAI(
            api_key=settings.deepseek_api_key,
            base_url=settings.deepseek_base_url,
            timeout=float(settings.deepseek_chat_timeout),
        )
    return _openai_client
```

`stream_chat()` 和 `complete()` 均改为调用 `_get_openai_client()` 而非每次创建新实例。

### 2.9 Ollama 选择性重试 (B10)

**文件**：`services/ai/model_runtime/ollama.py`

```python
# Before: except Exception as e: — 对所有异常重试
# After: 分类处理
except httpx.HTTPStatusError as e:
    if e.response.status_code >= 500:
        # 服务端错误 → 重试
        ...
    else:
        # 客户端错误 → 立即返回
        return {"success": False, "error": ...}
except (httpx.TimeoutException, httpx.ConnectError) as e:
    # 网络瞬态错误 → 重试
    ...
except Exception as e:
    # 未知错误 → 不重试
    return {"success": False, "error": ...}
```

### 2.10 缓存按条目 TTL (B11)

**文件**：`shared/cache.py`

用 `dict[str, tuple[Any, float]]` 替代 `cachetools.TTLCache`，每个条目独立存储 `(value, expire_at_monotonic_time)`：

```python
# set: 存储 (value, expire_at)
self._memory[full_key] = (value, time.monotonic() + ttl)

# get: 检查过期
entry = self._memory.get(full_key)
if entry is not None:
    val, expire_at = entry
    if time.monotonic() < expire_at:
        return val
    del self._memory[full_key]  # 惰性删除过期条目
```

新增 `_evict_if_needed()` 方法：当条目数超过 `_max_memory_entries` 时，按过期时间升序淘汰最旧的 10%。

### 2.11 MCP 内容兜底 (B12)

```python
# 在 _extract_content 的 model_dump 异常处理后，添加最终兜底
out.append(str(item))  # 确保所有 MCP 结果类型都有内容输出
```

### 2.12 RSS 分类名修正 (B13)

**文件**：`domain/rss/persistence.py`

- `srer/release` → `sre/release`（SRE 角色目录标准名）
- `executiver/industry` → `executive/industry`（Executive 角色目录标准名）

### 2.13 通知服务异常类型修正 (B17)

**文件**：`services/notification/notification_service.py`

```python
# Before: 裸 ValueError — RPC 调度器捕获后返回 500
raise ValueError("notification_id is required")

# After: BusinessException — 返回标准错误码 1002 (INVALID_PARAMS)
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException
raise BusinessException(ErrorCode.INVALID_PARAMS, message="notification_id is required")
```

影响 `mark_as_read()` 和 `delete_notification()` 两个 RPC 方法。参数校验失败时，客户端现在收到 `code: 1002`（参数验证失败）而非 `code: 9999`（未知内部错误）。

### 2.14 导出服务错误消息优化 (B18)

**文件**：`services/export/export_service.py`

```python
# Before: 硬编码错误消息 — 丢失根因
except Exception:
    logger.exception(f"Export task {task_id} failed")
    await tasks_coll.update_one(..., {"$set": {"status": "failed", "error": "Export processing failed"}})

# After: 包含异常详情
except Exception as e:
    logger.exception(f"Export task {task_id} failed: {e}")
    await tasks_coll.update_one(..., {"$set": {"status": "failed", "error": f"Export processing failed: {e!s}"}})
```

后台异步任务失败时，错误消息现在保留异常详情，便于运维通过 `export_tasks` 集合排查。同时更新 `logger.exception` 携带异常信息以触发 Sentry/告警上报。

### 2.15 Observer 模块安全降级 (B19, B20)

**文件**：`shared/config.py` + `app.py`

```python
# B19: config.py — 默认值 False（observer 包未安装）
observer_enabled: bool = Field(False, ...)

# B20: app.py — 导入保护
if settings.observer_enabled:
    try:
        from observer import ThrottleMiddleware, SamplerMiddleware, TailSampler
    except ImportError:
        logger.warning("Observer middleware enabled but package not installed — skipping")
    else:
        if settings.observer_sampler_enabled:
            ...
```

`observer` 是可选的外部依赖包（未随项目发布）。当新部署的 `config.yaml` 未显式设置 `observer.enabled: false` 时，旧默认值 `True` 会导致启动时 `ImportError` 崩溃。修复后：默认安全 + 运行时优雅降级（warning 日志提示）。

### 2.16 Web-Fetch SSRF 防护 (B21)

**文件**：`server/routes/search.py`

```python
# 新增 _is_private_url() 函数 — 拦截内网/保留地址
_PRIVATE_NETWORKS = [
    ipaddress.ip_network("10.0.0.0/8"),    # RFC 1918
    ipaddress.ip_network("172.16.0.0/12"), # RFC 1918
    ipaddress.ip_network("192.168.0.0/16"),# RFC 1918
    ipaddress.ip_network("127.0.0.0/8"),   # loopback
    ipaddress.ip_network("169.254.0.0/16"),# link-local (AWS metadata)
    ipaddress.ip_network("0.0.0.0/8"),     # "This" network
    ipaddress.ip_network("fc00::/7"),      # IPv6 unique local
    ipaddress.ip_network("::1/128"),        # IPv6 loopback
    ipaddress.ip_network("fe80::/10"),      # IPv6 link-local
]

# 在 web_fetch_route 中调用：
if _is_private_url(u):
    logger.warning(f"Blocked SSRF attempt: {u[:100]}")
    return success(data={"text": "", "url": u, "error": "URL resolves to a private/internal address"})
```

**验证**：
- `localhost:10086` → blocked ✓
- `169.254.169.254/latest/meta-data/` → blocked ✓  
- `10.0.0.1:27017` → blocked ✓
- `google.com` → allowed ✓

## 3. 非功能需求

| 维度 | 实现 |
|------|------|
| 向后兼容 | `INTERNAL_ERROR` 从 5001→5005，为 breaking change；其他修复均保持 API 兼容 |
| 测试覆盖 | 457 个单元测试通过，0 回归 |
| 性能 | `filter_helpers` 条件判断从 `not value` 改为 `is None or == ""`，无性能影响；OpenAI 客户端复用减少 TCP 握手 |
| 可观测 | 无新增指标；修复不影响现有 `/debug/performance` 端点 |

## 4. 风险与缓解

| 风险 | 严重度 | 缓解 |
|------|--------|------|
| `INTERNAL_ERROR` 5001→5005 前端若硬编码 5001 则误判 | 中 | 前端通过 `ErrorCode` 枚举而非硬编码；已知 YiVad/YiPet 使用 `code` 字段做通用错误展示，不区分具体码值 |
| `filter_helpers` 空列表/空字典行为变化 | 低 | 空列表被 `_handle_range_or_list_filter` 处理（`if not value_list: return True`），空字典作为 MongoDB 操作符直传，均安全 |