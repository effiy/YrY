---
title: aiohttp resp.json() 未检查 Content-Type 和异常处理
tags: [yiai, code-quality, error-handling]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# aiohttp resp.json() 未检查 Content-Type 和异常处理

## 现象

多处 `aiohttp` 响应直接调用 `resp.json()` 未先检查 `Content-Type` 头：

```python
# llm_provider.py:178 — 未检查 Content-Type
return resp.json()["embedding"]

# llm_provider.py:159 — 同样问题
data = resp.json()

# wework/client.py:62 — 同样问题
response_data = await response.json()
```

如果外部服务（Ollama、WeWork API）返回非 JSON 响应（如 HTML 错误页、纯文本错误），`resp.json()` 会抛出 `aiohttp.ContentTypeError` 或 `json.JSONDecodeError`。

部分调用方有 `try/except` 包裹，但大部分依赖外层通用错误处理。

## 根因分析

- 外部 API 调用假设响应格式始终为 JSON
- 未考虑服务降级返回 HTML 或纯文本的场景
- `resp.text()` 在某些场景（如 search.py:231）使用了，但不一致

## 涉及文件

- `src/services/ai/llm_provider.py:159,178` — Ollama API
- `src/domain/ai/chat.py:382` — Ollama API
- `src/domain/wework/client.py:62` — WeWork API

## 修复方案

```python
async def _safe_json(resp) -> dict:
    if 'application/json' not in resp.headers.get('Content-Type', ''):
        text = await resp.text()
        raise BusinessException(ErrorCode.INTERNAL_ERROR, message=f"Unexpected response: {text[:200]}")
    return await resp.json()
```

## 预防措施

- 外部 API 响应的 JSON 解析统一通过 `_safe_json` 函数

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- 待补充
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
