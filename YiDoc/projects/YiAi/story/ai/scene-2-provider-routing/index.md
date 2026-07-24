# Scene · 按 key 路由不同 provider

> Story: [ai](../index.md) · US-AI-2

## 用户故事

作为调用方，我能为 AI 配置不同 provider（OpenAI / 自建），按 key 路由。

## 验收

- `config.yaml` 维护 provider 注册表（id / endpoint / model）。
- 请求 header `X-Provider-Id` 选择 provider；缺省走 `default_provider`。
- 未知 provider 返回 `PROVIDER_NOT_FOUND`，不暴露其他 provider 配置。

## 使用场景 · 模块化

- `domain/ai.chat()` 路由由 provider_id；`services/ai/<provider>/` 实现 SDK 适配。
- `domain/ai` 不 import 任何 provider SDK → 新增 provider 只动 services 与配置。
