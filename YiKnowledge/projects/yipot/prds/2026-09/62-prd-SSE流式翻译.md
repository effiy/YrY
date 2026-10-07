---

doc_type: module
prd_id: "PO-09-62"
title: "PO-09-62: SSE 流式翻译 — LLM 引擎翻译结果实时流式显示"
status: 已完成
priority: P1
owner: Claude
roles: [product, engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: 需求
---

# PO-09-62: SSE 流式翻译

> 跨项目能力对齐：YiAi `translate_stream` RPC 已实现（SSE 流式返回翻译文本块），YiVad AI Chat 已使用 SSE 流式对话，YiPot 翻译仅使用同步 `translate` RPC。LLM 引擎翻译应流式显示以提升感知性能。

## 背景

YiAi `services/translation/translate_service.py` 提供两个翻译 RPC：
- `translate` — 同步多引擎并行翻译，等待全部完成后返回
- `translate_stream` — SSE 流式翻译，逐 token 推送结果（仅 LLM 引擎支持：openai/ollama/chatglm/gemini）

YiPot TargetArea 当前仅使用 `translate` RPC，LLM 引擎翻译需等待完整结果才显示，用户感知延迟高（3-10s）。

YiPot API client（`src/api/client.ts`）已有完整 SSE 流式支持（`stream()` 方法），`translate_stream` RPC 可直接使用。

## 范围

**In scope**：
- YiPot API 层新增 `translateStream` 异步生成器方法
- `yiaiAdapter.ts` 新增 `translateStreamViaYiAi` + `supportsStreaming` 函数
- TargetArea 翻译逻辑分流：LLM 引擎使用流式，传统引擎使用同步
- 流式失败自动降级到直接 API 调用

**Out of scope**：
- 传统引擎流式翻译（Google/Baidu/DeepL 等不支持）
- 多引擎并行流式（仅单引擎流式）

| 优先级 | 故事 | 验收标准 |
|--------|------|----------|
| P1 | API 流式方法 | `translateStream()` 异步生成器逐块返回翻译文本 |
| P1 | 适配器层 | `translateStreamViaYiAi` 逐块调用 `setResult` 更新 UI |
| P1 | TargetArea 分流 | LLM 引擎使用流式，传统引擎保持同步 |
| P2 | 降级保障 | 流式失败自动降级到直接 API |

## 验收标准

- [ ] 使用 openai/ollama/chatglm/gemini 引擎时翻译结果实时逐字显示
- [ ] 使用 google/baidu/deepl 引擎时保持原有同步行为
- [ ] 流式失败自动降级到直接 API 调用
- [ ] 翻译过程中切换引擎正确处理旧请求（translateID 检查）

## 关联

- YiAi：[translate_stream RPC](../yiai/devs/2026-09/)
- YiVad 参考：SSE 流式对话在 AI Chat 中使用
- YiPot API：[client.ts stream() 方法](../yipot/architecture/yiai-integration.md)