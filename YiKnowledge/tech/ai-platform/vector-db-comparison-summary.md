---
title: 向量库对比（Qdrant / Milvus / pgvector / Weaviate）
tags: [AI 平台, 向量库, RAG, 对比]
category: tech/ai-platform
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# 向量库对比（Qdrant / Milvus / pgvector / Weaviate）

## 1. 解决的问题

RAG、语义搜索、推荐召回都需要「按向量近邻检索」。通用方案分两类：

- **专用向量库**：Qdrant、Milvus、Weaviate、Chroma
- **关系库 + 向量扩展**：pgvector（PostgreSQL）、Redis Vector

核心算法：HNSW（图结构，查询快、内存大）、IVF-PQ/SQ（聚类+压缩，内存省、查询略慢）、Flat（暴力精确，小数据集用）。

## 2. 维度对比

| 维度 | Qdrant | Milvus | pgvector | Weaviate |
|---|---|---|---|---|
| 实现语言 | Rust | Go | C (PG extension) | Go |
| 部署复杂度 | 低（单文件二进制） | 中（依赖 etcd、minio、pulsar/kafka） | 极低（PG 装扩展即用） | 中 |
| 索引算法 | HNSW + 量化 | HNSW、IVF、DiskANN、GPU 索引 | HNSW + IVF | HNSW |
| 元数据过滤 | 强（payload 过滤 + 字段索引） | 强（标量字段、分区） | SQL（原生优势） | 强（GraphQL 风格） |
| 混合检索 | 内置 sparse-dense 混合 + hybrid score fusion | 内置 BM25 + 稠密 | 用 ts_vector + ANN 配合 | 内置 hybrid |
| 分布式 | Rust + Raft，原生分布式 | 云原生分布式 | Citus / 读副本 | 原生分布式 |
| 规模上限 | 千万级单机，亿级集群 | 十亿级（设计目标） | 百万级（推荐上限） | 千万级 |
| 工程门槛 | 低 | 高 | 极低（已有 PG） | 中 |
| 生态 | OpenAI server 协议、SDK 全 | SDK 全 | SQL 生态 | GraphQL + REST |
| 事务/ACID | 否 | 否 | 是（PG 原生） | 否 |

## 3. 选型决策树

```
已有 PostgreSQL 且数据 < 100 万向量？
└─ 是 → pgvector（最快上手，与业务数据同库）

需要亿级以上规模？
└─ 是 → Milvus（云原生分布式设计目标）

要混合检索（dense + sparse/BM25）且不想要外部 ES？
└─ 是 → Qdrant 或 Weaviate（内置 hybrid）

要轻量单机部署 + 低运维成本？
└─ 是 → Qdrant（Rust 单二进制，资源占用小）
```

## 4. 性能参考

测试集：1M 1024 维向量，top-10 检索，recall@10 > 0.95

| 引擎 | 单查询 p99 延迟 | 内存占用 | 索引构建时长 |
|---|---|---|---|
| Qdrant HNSW | 2-5 ms | ~6 GB | ~10 分钟 |
| Milvus HNSW | 3-8 ms | ~7 GB | ~12 分钟 |
| pgvector HNSW | 5-15 ms | ~8 GB | ~15 分钟 |
| Weaviate HNSW | 3-8 ms | ~7 GB | ~12 分钟 |

> 数值依赖硬件与配置；pgvector 在小规模（<100k）几乎与专用库相当。

## 5. 部署与运维要点

1. **HNSW 参数**：`M`（图度，16-64）、`ef_construction`（建图深度，200-500）、`ef_search`（查询深度，50-200）；M 越大内存越多但召回越好
2. **量化降低内存**：Qdrant 的 scalar quantization 把 1024 float → 1 byte，内存降到 1/4，召回损失 < 2%
3. **元数据过滤先行**：先过滤再 ANN（pre-filter）适合高选择性；后过滤（post-filter）适合召回率敏感场景
4. **写入与查询分离**：高写入场景用集群把读写分开，Qdrant/Milvus 都支持水平分片
5. **embedding 升级**：换 embedding 模型要重建全量索引，规划好数据迁移流程
6. **监控指标**：recall@k、p99 查询延迟、写入速率、内存使用率、HNSW 层节点数

## 6. 本团队落地情况

- YiAi 知识检索用 Qdrant（单机部署，单文件好维护）
- pgvector 用于团队内部小规模 RAG 实验（PG 已有）
- 暂不采用：Milvus（运维重）、Weaviate（GraphQL 生态陌生）

## 7. 参考资料

- Qdrant: https://qdrant.tech/documentation
- Milvus: https://milvus.io/docs
- pgvector: https://github.com/pgvector/pgvector
- Weaviate: https://weaviate.io/developers/weaviate
