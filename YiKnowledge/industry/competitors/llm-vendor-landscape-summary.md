---
title: 大模型厂商竞争格局（Anthropic / OpenAI / Google / Meta / DeepSeek）
tags: [竞品, 大模型, 厂商格局]
category: industry/competitors
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# 大模型厂商竞争格局

## 1. 厂商分层（2026 视角）

| 阵营 | 代表 | 商业模式 | 差异化 |
|---|---|---|---|
| 闭源旗舰 | OpenAI、Anthropic、Google | API + 订阅 | 前沿能力、安全、生态 |
| 开源生态 | Meta（Llama）、Mistral、Qwen、DeepSeek | 开源权重 + 企业服务 | 可自部署、可微调 |
| 中文开源 | Qwen、DeepSeek、GLM、智谱 | 开源 + API | 中文优化、价格低 |
| 区域厂商 | Cohere、AI21、Stability | 垂类 API | 垂直领域 |
| 云厂商自有 | AWS Nova、Google Gemini、阿里通义 | 与云绑定 | 与云服务整合 |

## 2. 各厂商档案

### OpenAI

- 旗舰：GPT-5（多模态 + 增强推理）
- 商业：API + ChatGPT 订阅 + 企业版
- 优势：用户认知、生态最广、function calling 工程化
- 风险：商业化与安全争议、关键人员流失
- 我方使用：BRD 生成主力之一

### Anthropic

- 旗舰：Claude 4.7（Opus / Sonnet / Haiku）
- 商业：API + Claude.ai 订阅
- 优势：长上下文（200k+）、安全对齐、代码与文档能力
- 我方使用：BRD 长上下文场景偏好 Claude Opus
- 关注点：Constitutional AI 对幻觉率的影响

### Google

- 旗舰：Gemini 2.5 Pro / Flash / Nano
- 商业：Vertex AI + Google Workspace 整合
- 优势：多模态、TPU 自研、Bard / Search 流量
- 关注点：Bard 在欧美用户触达

### Meta

- 旗舰：Llama 4（开源权重）
- 商业：开源 + Meta AI 助手
- 优势：开源、可微调、社区生态
- 关注点：开源模型在我方自部署场景的成本/质量权衡

### DeepSeek

- 旗舰：DeepSeek-V3 / R1
- 商业：开源权重 + API
- 优势：稀疏 MoE + MLA 把推理算力压低、中文友好、价格极低
- 我方使用：评估中，作为自部署主选

### Qwen（阿里）

- 旗舰：Qwen 3 系列（含 MoE）
- 优势：中文优化、多模态、开源
- 关注点：在 YiVad 中文场景评估

### GLM（智谱）

- 旗舰：GLM-4.5
- 优势：稀疏 MoE、中文优化、国产合规

## 3. 对比维度

| 维度 | OpenAI | Anthropic | Google | Meta | DeepSeek | Qwen | GLM |
|---|---|---|---|---|---|---|---|
| 前沿能力 | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★ | ★★★★ | ★★★★ | ★★★★ |
| 中文能力 | ★★★ | ★★★ | ★★★ | ★★★ | ★★★★★ | ★★★★★ | ★★★★★ |
| 长上下文 | 256k | 200k-1M | 2M | 128k | 128k | 256k | 128k |
| 开源 | 否 | 否 | 否 | 是 | 是 | 部分 | 部分 |
| 价格（API） | 中高 | 中高 | 中 | 自部署 | 极低 | 低 | 低 |
| 自部署可行性 | 否 | 否 | 否 | 是 | 是 | 是 | 是 |
| Function calling | 极成熟 | 成熟 | 成熟 | 成熟 | 较成熟 | 成熟 | 一般 |
| 多模态 | 是 | 是 | 是 | 部分 | 是 | 是 | 是 |

## 4. 我方应对策略

1. **多供应商策略**：不绑单一厂商，通过 LiteLLM 统一协议路由
2. **能力分层**：
   - 前沿 + 长上下文 → Claude Opus / GPT-5
   - 中文 + 高频 → DeepSeek-V3 / Qwen3
   - 自部署优先场景 → DeepSeek-V3 + vLLM
3. **评估机制**：每月跑业务评测集，监控能力变化
4. **成本控制**：用便宜模型做首轮，必要时升级到旗舰
5. **风险监控**：API 政策变化（限流、价格、数据政策），备用厂商预案

## 5. 关注信号

- 模型版本发布节奏（半年一次大版本）
- API 定价调整
- 安全与合规政策（中国、欧盟）
- 开源许可证变更
- 厂商间合作（如 Anthropic + AWS / Google）

## 6. 落地建议

- 建立"模型选型决策树"（按任务类型 × 上下文长度 × 语言 × 成本）
- 维护评测集与基线，每次新版本上线对比
- LiteLLM / Portkey 统一接入，方便切换
- 监控实际业务质量，不只看 benchmark

## 7. 参考资料

- 各厂商官网与 release notes
- LMSYS Chatbot Arena: https://chat.lmsys.org
- HuggingFace Open LLM Leaderboard
- Artificial Analysis: https://artificialanalysis.ai
