---
title: Embedding 模型选型
tags: [AI 平台, Embedding, 选型]
category: tech/ai-platform
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# Embedding 模型选型

## 1. Embedding 的角色

RAG / 语义检索 / 聚类 / 去重 / 异常检测的第一步都是把文本压成稠密向量。Embedding 模型质量直接决定召回上限；后续 reranker 与 hybrid 检索只能在召回池内做精排。

## 2. 主流模型对比（2026 视角）

| 模型 | 出品方 | 维度 | 开源 | 中文 | 长文本 | MTEB avg |
|---|---|---|---|---|---|---|
| OpenAI text-embedding-3-large | OpenAI | 3072（可降维） | 否 | 一般 | 8k | 64.6 |
| OpenAI text-embedding-3-small | OpenAI | 1536 | 否 | 一般 | 8k | 62.3 |
| Cohere embed-v3 | Cohere | 1024 | 否 | 一般 | 512 | 64.5 |
| BAAI bge-m3 | 智源 | 1024 | 是 | 强 | 8k（多语言） | 65.0 |
| BAAI bge-large-zh-v1.5 | 智源 | 1024 | 是 | 强 | 512 | 中文 64+ |
| Alibaba GTE-large | 阿里 | 1024 | 是 | 强 | 512 | 63.1 |
| nomic-embed-text | Nomic | 768 | 是 | 弱 | 8k | 62.3 |
| Voyage AI voyage-3 | Voyage | 1024 | 否 | 强 | 32k | 66+ |
| jina-embeddings-v3 | Jina | 1024 | 是 | 强 | 8k | 65.4 |

> MTEB 分数仅作参考，与业务数据的相关性强相关；上线前必须用业务评测集跑召回率。

## 3. 选型决策维度

| 维度 | 关键考量 |
|---|---|
| 中英文比例 | 中文为主 → bge-m3 / GTE / jina；英文为主 → OpenAI / Voyage |
| 上下文长度 | 长文档 RAG 选 8k+（bge-m3、jina-v3、voyage-3） |
| 维度大小 | 维度高召回好但内存与检索慢；1024 是综合甜点 |
| 部署方式 | 自部署选开源；SaaS 调用选 OpenAI / Cohere / Voyage |
| 成本 | SaaS 按 token 计费；自部署按显存与吞吐 |
| 多语言 | bge-m3 支持 100+ 语言，跨语言 RAG 首选 |
| 指令适配 | 部分模型支持 task instruction prefix（如 jina-v3、bge-instruct） |

## 4. 选型决策树

```
中文 + 跨语言？
├─ 是 → bge-m3（开源 + 多语言 + 长文本）
└─ 否 → 是否能上 SaaS / 成本敏感？
        ├─ SaaS OK，质量优先 → voyage-3 或 OpenAI 3-large
        └─ 自部署优先
           ├─ 中文为主 → bge-large-zh-v1.5
           └─ 英文为主 → nomic-embed-text / bge-m3-en
```

## 5. 评测方法（必做）

不要只看 MTEB。搭一个业务评测集：

1. **构造 query-doc 正例对**：50-200 条人工标注的「应该召回这个 doc」的样本
2. **构造干扰项**：在语料中放易混的相似但非目标 doc
3. **跑 recall@k**（k=1/5/10）和 MRR
4. **横向对比**：3-5 个候选 embedding 在同一评测集上的指标
5. **A/B 上线**：选 top-2 模型，线上看真实查询的点击率 / 用户反馈

## 6. 部署与运维要点

1. **批量推理**：embedding 模型 batch size 可设大（128-512），吞吐比 LLM 高一个数量级
2. **缓存**：同 text 多次 embedding 浪费，用 Redis / 本地缓存 hash(text)→vector
3. **归一化**：存库前 L2 归一化，dot product 等价 cosine，检索快
4. **量化**：1024 float → 1 byte 量化，内存 1/4，召回损失 < 2%（Qdrant / Milvus 内置支持）
5. **版本管理**：embedding 模型换版本要重建全库；规划好数据迁移与双轨运行期
6. **监控**：embedding 时长 p99、空召回率（query 出来的向量最近邻 score 异常低 → 模型未覆盖此领域）

## 7. 本团队落地情况

- YiAi 知识检索用 bge-m3（中文 + 多语言，开源自部署）
- SaaS 备选：voyage-3（评估中，对长文档 BRD 召回更稳）
- 评测集：100 条业务 query-doc 对，月度回归

## 8. 参考资料

- MTEB Leaderboard: https://huggingface.co/spaces/mteb/leaderboard
- BGE-m3: https://huggingface.co/BAAI/bge-m3
- Voyage AI: https://docs.voyageai.com
