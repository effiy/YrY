---
title: 多提供商大语言模型支持
tags: [功能, 后端, 大语言模型, 提供商, 抽象]
category: 问题/功能
created: 2026-08-03
updated: 2026-08-03
source: 内部
type: 问题
status: 待开始
priority: 中
issue_type: 功能
project: YiAi
project_id: yiai
owner: 陈铭
estimate_points: 8
review_status: 待评审
prd_month: "202608"
prd_task_id: "2"
roles: [engineer]
---

# 多提供商 LLM 支持

## 基本信息

| 字段 | 值 |
|------|-----|
| 需求编号 | 2 |
| 项目 | YiAi (FastAPI Backend) |
| 代码仓库 | `YrY/YiAi` |
| 功能模块 | AI → LLM Provider |
| 优先级 | 中 |
| 人天 | 8.0d |
| 状态 | 待开始 |

### 功能概述

抽象 LLM 模型运行时，从当前仅支持 Ollama 扩展为支持多种 LLM Provider（OpenAI API / Anthropic API / 本地 Ollama），通过统一的 Provider 接口实现模型切换，前端无需感知底层 Provider 差异。

### 技术实现

#### Provider 抽象层

```python
class BaseLLMProvider(ABC):
    """LLM Provider 抽象基类"""

    @abstractmethod
    async def chat(self, messages: list[dict], **kwargs) -> AsyncIterator[str]:
        """流式聊天接口"""
        ...

    @abstractmethod
    async def chat_sync(self, messages: list[dict], **kwargs) -> str:
        """非流式聊天接口"""
        ...

    @abstractmethod
    def list_models(self) -> list[ModelInfo]:
        """列出可用模型"""
        ...

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Provider 名称"""
        ...
```

#### 支持的 Provider

| Provider | 模型示例 | 配置方式 |
|----------|----------|----------|
| **Ollama** (现有) | qwen3.5:4b, llama3.2, nomic-embed-text | 本地部署，`config.yaml` |
| **OpenAI** | gpt-4o, gpt-4o-mini | API Key + Base URL |
| **Anthropic** | claude-opus-4-7, claude-sonnet-4-6 | API Key |
| **Custom** | 自定义兼容 OpenAI API 的服务 | API Key + Base URL |

#### 配置管理

```yaml
llm:
  default_provider: "ollama"        # 默认 Provider
  providers:
    ollama:
      base_url: "http://localhost:11434"
      chat_model: "qwen3.5:4b"
      embed_model: "nomic-embed-text"
    openai:
      api_key: "${OPENAI_API_KEY}"
      base_url: "https://api.openai.com/v1"
      chat_model: "gpt-4o"
    anthropic:
      api_key: "${ANTHROPIC_API_KEY}"
      chat_model: "claude-sonnet-4-6"
```

#### 模型切换

- 前端通过 Chat API 参数 `model` 指定模型
- 后端根据模型名称自动路由到对应 Provider
- 模型命名规范：`provider:model_name`（如 `openai:gpt-4o`、`ollama:qwen3.5:4b`）
- 默认 Provider 无需前缀

#### 兼容性

- 现有 Chat Service 接口不变，仅底层 Provider 可切换
- SSE 流式响应格式一致
- RAG Embedding 模型可独立配置 Provider

### 关联模块

- 后端服务：`services/ai/llm_provider.py`
- 领域模块：`domain/ai/providers/`
- 配置：`config.yaml` (llm 配置段)
- Chat Service：`services/ai/chat_service.py`

### 验收标准

1. Ollama Provider 正常工作（现有功能无回归）
2. OpenAI API Provider 可正常调用
3. Anthropic API Provider 可正常调用
4. 前端通过 `model` 参数切换 Provider 和模型
5. SSE 流式响应在切换 Provider 后一致
6. RAG Embedding 模型可独立配置

---

*来源: `projects/yiai/requires/2026-08/multi-provider-llm-support.md`*