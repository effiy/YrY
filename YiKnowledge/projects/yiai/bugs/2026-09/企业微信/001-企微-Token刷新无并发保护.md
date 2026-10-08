---
title: "WeWork: Token 刷新无并发保护，高并发下可能重复刷新导致旧 Token 失效"
tags:
- wework
- token-refresh
- race-condition
- api-integration
- concurrency
category: projects/yiai/bugs/wework
created: 2026-09-07
updated: 2026-09-10
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: YiAi
module: src/domain/wework/client.py
reporter: Claude
environment: all
affected_version: main (pre-fix)
fixed_version: main (post-fix 2026-09-07)
frequency: intermittent
---

## Description

企业微信（WeWork）API 的 access_token 有过期时间（默认 7200s）。当多个并发请求同时发现 token 过期时，可能触发多次 token 刷新——企业微信 API 在获取新 token 后会使旧 token 失效。如果刷新请求 A 获取了 token-A，刷新请求 B 获取了 token-B（使 token-A 失效），而请求 C 使用的是 token-A——请求 C 会收到 40001 错误（不合法的 token）。

**典型场景：**
1. 多个 YiVad 用户同时触发企业微信消息推送
2. Token 恰好在此时过期
3. 3 个并发请求各自检测到 token 过期，各自发起刷新
4. 最后一个刷新请求获得的 token 生效，前两个刷新获得的 token 失效
5. 使用已失效 token 的请求返回错误

**当前代码风险点：** 如果 `client.py` 中的 token 刷新逻辑没有加锁保护，并发刷新就会发生。

## Steps to Reproduce

1. 配置企业微信集成（`wework` 配置段）
2. 等待 token 接近过期时间
3. 同时从多个客户端发送企业微信消息推送请求
4. 部分请求可能因 token 失效而失败
5. 检查日志——可能有多个 token 刷新请求

## Expected Result

Token 刷新应有互斥锁保护——同一时间只有一个刷新请求执行，其他请求等待刷新完成后使用新 token。

## Actual Result

取决于 `client.py` 的实现——如果 token 刷新没有加锁，并发刷新可能导致 token 失效。

## Root Cause

Token 刷新是典型的**缓存失效并发问题**（Cache Stampede）。多个请求同时发现缓存过期，各自触发刷新，导致重复工作。

**根本原因：** 缺乏 token 刷新的互斥锁机制。

## Fix

### 使用 asyncio.Lock 保护 token 刷新

```python
# src/domain/wework/client.py
import asyncio
import time
from typing import Optional

class WeWorkClient:
    def __init__(self):
        self._access_token: Optional[str] = None
        self._token_expires_at: float = 0
        self._token_lock = asyncio.Lock()
        self._token_refresh_margin = 300  # 提前 5 分钟刷新

    async def _get_access_token(self) -> str:
        """Get valid access token with refresh protection."""
        # 快速路径：token 有效
        if self._access_token and time.time() < self._token_expires_at - self._token_refresh_margin:
            return self._access_token

        async with self._token_lock:
            # 双重检查：获取锁后再次验证（可能已被其他协程刷新）
            if self._access_token and time.time() < self._token_expires_at - self._token_refresh_margin:
                return self._access_token

            # 执行刷新
            new_token, expires_in = await self._refresh_token()
            self._access_token = new_token
            self._token_expires_at = time.time() + expires_in
            logger.info(f"WeWork token refreshed, expires in {expires_in}s")
            return new_token

    async def _refresh_token(self) -> tuple[str, int]:
        """Call WeWork API to get new token."""
        # ...
        pass
```

## Verification

- 单个请求触发 token 刷新 → 正常刷新，后续请求使用新 token
- 10 个并发请求同时触发 token 过期 → 只有 1 次 API 调用，其他 9 个等待后使用新 token
- Token 未过期 → 快速路径返回，不获取锁

## Prevention

- **代码层面：** 所有外部 API token 刷新 MUST 使用互斥锁保护
- **模式层面：** 提取通用的 `RefreshableToken` 类，供 WeWork、OSS 等模块复用
- **测试层面：** 添加并发 token 刷新测试（`asyncio.gather` 10 个并发请求）
- **监控层面：** 记录 token 刷新频率，异常频繁刷新时告警

## 影响范围

- **影响模块**：src/domain/wework/client.py
- **涉及文件**：
- `client.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
