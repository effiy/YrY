---
title: OllamaService 手动 HTTP 调用而非使用 ollama Python 客户端
tags: [yiai, code-quality, dependency-usage]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# OllamaService 手动 HTTP 调用而非使用 ollama Python 客户端

## 现象

`domain/ai/chat.py` 中的 `OllamaService` 使用 `aiohttp` 手动构造 HTTP 请求调用 Ollama API，而非使用 `ollama` Python 客户端库：

```python
# chat.py — 手动 HTTP 调用
async with aiohttp.ClientSession() as session:
    async with session.post(f"{self.host}/api/chat", json=payload) as resp:
        ...
```

但 `requirements.txt`（已删除，见 bug #70）曾经包含 `ollama>=0.6.2`，说明 `ollama` 客户端库已安装但未被使用。

## 根因分析

- 早期开发时直接使用 HTTP 调用以获得更多控制
- `ollama` 客户端库被添加到依赖中但从未切换到它
- 手动 HTTP 调用需要自行处理错误、超时、重试——ollama 客户端已内置

## 涉及文件

- `src/domain/ai/chat.py` — OllamaService 类
- `src/services/ai/llm_provider.py` — 也有类似的手动 HTTP 调用

## 修复方案

评估切换到 `ollama` Python 客户端的收益（错误处理、流式支持、模型管理）

## 预防措施

- 如果安装了第三方库，应使用它而非手动重实现

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `src/services/ai/llm_provider.py`
- `src/domain/ai/chat.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
