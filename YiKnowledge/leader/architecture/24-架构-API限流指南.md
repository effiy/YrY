---
title: "API Rate Limiting Guide — Protecting YiAi Endpoints from Abuse"
aliases: [rate-limiting, throttling, api-protection, dos-prevention]
tags: [architecture, api, rate-limiting, security, leader]
category: leader/architecture
created: 2026-09-15
updated: 2026-09-15
source: internal
type: methodology
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, engineer]
benefit: "技术负责人通过合理配置 API 限流保护服务免受滥用和意外流量冲击"
acceptance_criteria:
  - "覆盖固定窗口、滑动窗口、令牌桶三种算法及选择指南"
  - "包含 YiAi 各端点的推荐限流策略"
  - "代码示例可直接用于 FastAPI"
related:
  - ./14-架构-API设计指南.md
  - ../risk/06-风险-安全审查清单.md
---

# API 限流指南

> 限流的目的不是拒绝用户——是保护服务。没有限流，一个失控的循环就可能耗尽所有连接。

## 限流策略

| 策略 | 原理 | 优点 | 缺点 |
|---|---|---|---|
| **固定窗口** | 每分钟最多 N 次请求 | 简单 | 边界突发——第 59 秒和第 61 秒的请求都通过 |
| **滑动窗口** | 过去 N 秒内最多 M 次请求 | 平滑——无边界问题 | 需要存储时间戳，稍复杂 |
| **令牌桶** | 每秒放 N 个令牌，请求消耗令牌 | 允许短时突发 | 桶大小需要调参 |

**YrY 建议**：开发阶段用固定窗口（简单），生产环境用滑动窗口或令牌桶（更精确）。

## 按端点的限流策略

| 端点 | 限流策略 | 限制 | 理由 |
|---|---|---|---|
| 聊天 (`chat_service.chat`) | 令牌桶 | 30 req/min + 突发 5 | LLM 推理是瓶颈——每个请求消耗 GPU 2-10 秒 |
| RAG 查询 (`rag.*`) | 令牌桶 | 20 req/min | 检索 + LLM 双重消耗 |
| 文件读取 (`/read-file`) | 固定窗口 | 60 req/min | 轻量操作 |
| 数据 CRUD (`data_service.*`) | 固定窗口 | 120 req/min | 数据库操作——通常很快 |
| 健康检查 (`/health`) | 无限制 | — | 监控和负载均衡器需要频繁访问 |

## 简单实现（固定窗口——内存）

```python
# src/middleware/rate_limit.py
from collections import defaultdict
import time
from fastapi import Request, HTTPException

class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window = window_seconds
        self.requests: dict[str, list[float]] = defaultdict(list)

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        cutoff = now - self.window
        # 清除过期的请求记录
        self.requests[key] = [t for t in self.requests[key] if t > cutoff]
        if len(self.requests[key]) >= self.max_requests:
            return False
        self.requests[key].append(now)
        return True

# 按 IP 限流
limiters = {
    "chat": RateLimiter(max_requests=30, window_seconds=60),
    "default": RateLimiter(max_requests=120, window_seconds=60),
}

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"

    # 根据路径选择限流器
    body = await request.body()
    try:
        data = json.loads(body)
        module = data.get("module_name", "")
        if "chat" in module:
            limiter = limiters["chat"]
        else:
            limiter = limiters["default"]
    except Exception:
        limiter = limiters["default"]

    if not limiter.is_allowed(client_ip):
        return JSONResponse(
            status_code=200,
            content={"code": 429, "message": "请求过于频繁，请稍后重试", "data": None}
        )

    return await call_next(request)
```

## 进阶：基于用户/角色的限流

当认证启用后，基于用户而非 IP 限流：

```python
# 分级限流
LIMITS = {
    "admin": {"chat": 60, "default": 300},
    "user":  {"chat": 30, "default": 120},
    "anonymous": {"chat": 10, "default": 60},
}

def get_limit(role: str, endpoint_type: str) -> int:
    return LIMITS.get(role, LIMITS["anonymous"]).get(endpoint_type, 60)
```

## 限流响应

被限流的请求返回标准 RPC 格式：

```json
{
  "code": 429,
  "message": "请求过于频繁，请稍后重试",
  "data": {
    "retry_after_seconds": 30,
    "limit": "30 requests per minute"
  }
}
```

**前端处理**：
- 收到 429 → 显示"发送太快，请稍候"
- 读取 `retry_after_seconds` → 在 UI 中显示倒计时
- 不是在客户端无脑重试——等 retry_after 后再试

## LLM 调用专属限流考量

LLM 推理是 YrY 最昂贵的操作。额外保护：

| 保护措施 | 说明 |
|---|---|
| **并发 SSE 连接数上限** | 最大 5 个并发聊天连接——每个消耗大量 GPU |
| **单用户单会话限制** | 同一用户同一时间只能有 1 个活跃聊天流 |
| **Token 消耗限制** | 单次请求最大 token 数（输入 4K + 输出 2K） |
| **排队而非拒绝** | 超过并发上限时排队而非拒绝——"前面还有 N 个请求" |

```python
# 并发 SSE 连接数限制
import asyncio

active_sse_connections = 0
MAX_SSE_CONNECTIONS = 5

async def chat_stream(params: dict):
    global active_sse_connections
    if active_sse_connections >= MAX_SSE_CONNECTIONS:
        # 排队等待（而非直接拒绝）
        await asyncio.sleep(2)  # 简单实现；生产环境用队列
        if active_sse_connections >= MAX_SSE_CONNECTIONS:
            return {"code": 429, "message": "服务繁忙，请稍后重试"}

    active_sse_connections += 1
    try:
        # ... SSE 流逻辑 ...
        pass
    finally:
        active_sse_connections -= 1
```

## 反模式

| 反模式 | 失败原因 | 正确做法 |
|---|---|---|
| 无差别限流 | 健康检查和聊天请求用同样的限制 | 按端点类型区分限流策略 |
| 仅限 IP | 同一 NAT 后的多个用户共用一个 IP | 有认证时切换到用户级限流 |
| 硬拒绝无提示 | 用户不知道要等多久——反复尝试 | 返回 `retry_after_seconds` |
| 限流值拍脑袋 | "每分钟 100 次应该够了"——实际峰值可能是 200 | 基于实际使用数据设置；监控后调整 |