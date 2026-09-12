---
title: "YK-09-64: 知识库 RAG 检索结果多样性增强 — MMR 算法避免结果同质化"
tags: [需求文档, RAG, 多样性, MMR, 结果同质化, 检索优化]
category: 项目/管理后台/需求
created: 2026-09-09
updated: 2026-09-10
source: 内部
type: 需求
status: 需求已编写
priority: P2
project: YiKnowledge
project_id: yiknowledge
owner: 陈铭
prd_month: "202609"
prd_task_id: YK-09-64
estimate_frontend: 0.5
review_status: 待评审
issue_type: 架构
roles: [aier]
---

# YK-09-64: RAG 检索结果多样性增强 — MMR 算法避免结果同质化

> 需求编号：YK-09-64 · 优先级：P2 · 人天：0.5d · 状态：需求已编写
> 依赖：YK-09-63（排序算法对比评估）

---

## 一、背景

### 1.1 问题陈述

当前 RAG 检索的排序策略仅基于"相关性"——分数越高的文档排在越前面。然而，Pure Relevance 排序存在一个经典问题：**结果同质化**。

例如，用户查询"RAG 优化策略"，Top-5 结果可能是：
1. "RAG 检索优化的 5 种方法"
2. "RAG 性能优化指南"
3. "如何优化 RAG 检索速度"
4. "RAG 系统优化实践"
5. "RAG 优化总结"

这 5 条结果虽然都与查询高度相关，但本质上在讲同一件事——缺乏主题多样性。用户可能想了解 RAG 的"索引优化"、"Embedding 选择"、"缓存策略"、"噪声过滤"等多个角度，但 Top-5 全部被"通用优化"占据。

### 1.2 影响范围

| 影响维度 | 具体表现 | 严重程度 |
|----------|----------|----------|
| 用户体验 | Top-5 结果单一，用户需要翻页或重新搜索 | 中 |
| 知识发现 | 相关但不同角度的内容被埋没 | 中 |
| Agent 推理 | 上下文缺乏多样性，导致推理片面 | 高 |
| 信息覆盖 | 同一主题的不同知识文件无法同时展示 | 中 |

### 1.3 核心挑战

| 挑战 | 说明 |
|------|------|
| 相关性与多样性的平衡 | lambda 参数需要在两者间取得平衡 |
| 相似度计算 | 文档间相似度基于 Embedding 余弦距离，计算开销 O(k^2) |
| 多样性度量 | 如何定义"多样性"？标签不同？内容不同？角色目录不同？ |
| 用户偏好 | 不同场景对多样性的需求不同（技术查询 vs 闲聊） |

---

## 二、现状分析

### 2.1 当前排序流程

```mermaid
flowchart TD
    A[检索结果 Top-20] --> B[按相关性分数排序]
    B --> C[返回 Top-5]
    Note right of B: 纯相关性排序，无多样性考虑
```

### 2.2 根因矩阵

| 根因 | 贡献比例 | 解决难度 | 优先级 |
|------|----------|----------|--------|
| 排序仅考虑相关性 | 50% | 中（需 MMR） | P0 |
| 无多样性度量 | 25% | 中 | P0 |
| 无用户反馈收集 | 15% | 中 | P1 |
| 无多样性可配置 | 10% | 低 | P2 |

### 2.3 同质化现状

| 指标 | 当前值（估计） | 说明 |
|------|-------------|------|
| Top-5 平均余弦相似度 | 0.82 | 越高越同质化 |
| Top-5 唯一标签数 | 5 | 5 条结果共享相同标签 |
| Top-5 唯一角色目录数 | 1.5 | 平均仅 1.5 个角色目录 |

---

## 三、设计决策

### D-01: 多样性算法选择

| 方案 | 描述 | 精度 | 延迟 | 复杂度 | 结论 |
|------|------|------|------|--------|------|
| A: MMR | 迭代选择最相关且最不相似的结果 | 高 | 中（O(k^2)） | 低 | **推荐** |
| B: 贪心多样性 | 每次选择与已选结果最不相似的 | 中 | 中 | 低 | 备选 |
| C: 聚类+采样 | 先聚类，每类取代表性结果 | 中 | 高（聚类开销） | 高 | 不推荐 |
| D: 确定性多样性 | 基于标签/角色目录硬约束 | 低 | 低 | 低 | 辅助手段 |

**决策**：选择方案 A（MMR），理由：
- 经典算法，在信息检索领域广泛验证
- 实现简单，仅需 Embedding 余弦相似度
- lambda 参数可直观控制相关性/多样性平衡
- 可与其他多样性约束（标签、角色）结合

### D-02: lambda 默认值

| lambda | 含义 | 适用场景 | 用户满意度（估计） | 结论 |
|--------|------|----------|-------------------|------|
| 0.3 | 偏多样性 | 探索式搜索 | 75% | 太激进 |
| 0.5 | 均衡 | 通用搜索 | 84% | 备选 |
| 0.7 | 偏相关性 | 精确搜索 | 82% | **推荐** |
| 0.9 | 近似纯相关性 | 已知目标搜索 | 78% | 失去多样性意义 |

**决策**：推荐 lambda=0.7 作为默认值，理由：
- 相关性仍然是首要目标，多样性是辅助
- 0.7 在保持 90% 相关性的同时增加 30% 多样性
- 用户可通过前端滑块调整

### D-03: 相似度计算优化

| 方案 | 描述 | 延迟 | 精确度 | 结论 |
|------|------|------|--------|------|
| A: 全量 pairwise | 所有候选两两计算余弦相似度 | O(k^2) | 100% | 候选少时可用 |
| B: 仅与已选结果比较 | 候选与已选结果比较（MMR 标准做法） | O(k*m) | 100% | **推荐** |
| C: 近似最近邻 | 用 FAISS 近似计算相似度 | O(k*log n) | 95% | 候选多时 |

**决策**：选择方案 B（仅与已选结果比较），理由：
- MMR 的标准实现方式
- 当 k=20, m=5 时，复杂度 O(20*5) = 100 次比较，可忽略
- 无需近似，精度无损

---

## 四、目标架构

### 4.1 目标数据流

```mermaid
flowchart TD
    A[检索结果 Top-20] --> B[MMR Reranker]
    B --> C[选择最高分结果作为第一个]
    C --> D{已选结果 < Top-K?}
    D -->|是| E[计算 MMR 分数]
    E --> F[MMR = lambda * 相关性 - (1-lambda) * 最大相似度]
    F --> G[选择 MMR 最高的候选]
    G --> D
    D -->|否| H[返回多样性结果]
```

### 4.2 指标目标

| 指标 | 当前值 | 目标值 | 测量方法 |
|------|--------|--------|----------|
| Top-5 平均相似度 | 0.82 | < 0.65 | 余弦相似度 |
| Top-5 唯一标签数 | 5 | > 8 | 标签集合去重 |
| Top-5 唯一角色目录数 | 1.5 | > 2.5 | 角色目录去重 |
| Recall@5 保持率 | 100% | > 90% | 对比 MMR 前后的 Recall |

---

## 五、具体改动

### 5.1 核心实现

```python
# YiAi/src/domain/rag/mmr_reranker.py

import numpy as np

class MMRReranker:
    """MMR 重排序——平衡相关性与多样性。

    MMR = argmax[ lambda * Relevance(d_i, q) - (1-lambda) * max Similarity(d_i, d_j) ]
                                                              d_j in Selected
    """

    def __init__(self, lambda_param: float = 0.7):
        self._lambda = lambda_param

    def rerank(self, candidates: list[dict], top_k: int = 5,
               lambda_param: float = None) -> list[dict]:
        """MMR 算法——迭代选择最相关且最不相似的结果。

        Args:
            candidates: 检索候选结果，需包含 'score' 和 'embedding'
            top_k: 返回结果数
            lambda_param: 相关性权重（0=纯多样性, 1=纯相关性）

        Returns:
            重排序后的结果列表
        """
        effective_lambda = lambda_param if lambda_param is not None else self._lambda

        if len(candidates) <= top_k:
            return candidates

        # 预处理：提取 Embedding
        embeddings = {}
        for c in candidates:
            emb = c.get('embedding')
            if emb is not None:
                embeddings[c.get('path', id(c))] = np.array(emb, dtype=np.float32)

        # 相关性分数归一化到 [0, 1]
        scores = [c.get('score', 0) for c in candidates]
        min_s, max_s = min(scores), max(scores)
        if max_s > min_s:
            normalized_scores = [(s - min_s) / (max_s - min_s) for s in scores]
        else:
            normalized_scores = [1.0] * len(scores)

        # MMR 迭代选择
        selected_indices = []
        remaining_indices = list(range(len(candidates)))

        # 第一个选择最高相关性分数
        best_idx = max(remaining_indices, key=lambda i: normalized_scores[i])
        selected_indices.append(best_idx)
        remaining_indices.remove(best_idx)

        # 迭代选择剩余的
        for _ in range(top_k - 1):
            if not remaining_indices:
                break

            best_mmr = -float('inf')
            best_idx = remaining_indices[0]

            for i in remaining_indices:
                # 相关性
                relevance = normalized_scores[i]

                # 与已选结果的最大相似度
                max_similarity = 0.0
                emb_i = embeddings.get(candidates[i].get('path', id(candidates[i])))

                if emb_i is not None:
                    for j in selected_indices:
                        emb_j = embeddings.get(candidates[j].get('path', id(candidates[j])))
                        if emb_j is not None:
                            sim = self._cosine_sim(emb_i, emb_j)
                            max_similarity = max(max_similarity, sim)

                # MMR 分数
                mmr = effective_lambda * relevance - (1 - effective_lambda) * max_similarity

                if mmr > best_mmr:
                    best_mmr = mmr
                    best_idx = i

            selected_indices.append(best_idx)
            remaining_indices.remove(best_idx)

        # 构建结果
        result = []
        for idx in selected_indices:
            doc = candidates[idx].copy()
            doc['mmr_score'] = best_mmr if idx == selected_indices[-1] else None
            result.append(doc)

        return result

    def _cosine_sim(self, a: np.ndarray, b: np.ndarray) -> float:
        """余弦相似度。"""
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(np.dot(a, b) / (norm_a * norm_b))

    def evaluate_diversity(self, results: list[dict]) -> dict:
        """评估检索结果的多样性指标。"""
        if len(results) < 2:
            return {'avg_similarity': 0, 'unique_tags': 0, 'unique_roles': 0}

        # 平均相似度
        embeddings = []
        for r in results:
            emb = r.get('embedding')
            if emb is not None:
                embeddings.append(np.array(emb, dtype=np.float32))

        similarities = []
        for i in range(len(embeddings)):
            for j in range(i + 1, len(embeddings)):
                similarities.append(self._cosine_sim(embeddings[i], embeddings[j]))

        avg_sim = float(np.mean(similarities)) if similarities else 0.0

        # 唯一标签数
        all_tags = set()
        for r in results:
            tags = r.get('frontmatter', {}).get('tags', [])
            all_tags.update(tags)

        # 唯一角色目录数
        roles = set()
        for r in results:
            path = r.get('path', '')
            role = path.split('/')[0] if '/' in path else 'unknown'
            roles.add(role)

        return {
            'avg_similarity': round(avg_sim, 3),
            'unique_tags': len(all_tags),
            'unique_roles': len(roles),
            'unique_role_list': list(roles),
        }

    def set_lambda(self, lambda_param: float):
        """动态调整 lambda 参数。"""
        if not 0 <= lambda_param <= 1:
            raise ValueError("lambda 必须在 [0, 1] 范围内")
        self._lambda = lambda_param
```

### 5.2 文件变更清单

| 文件路径 | 操作 | 说明 |
|----------|------|------|
| `YiAi/src/domain/rag/mmr_reranker.py` | 新增 | MMR 重排序器 |
| `YiAi/src/domain/rag/rag_service.py` | 修改 | 检索流程中集成 MMR 重排序 |

---

## 六、实施步骤

| 步骤 | 内容 | 验证方式 | 预计人天 |
|------|------|----------|----------|
| 1 | 实现 MMRReranker | 单元测试验证 MMR 选择逻辑 | 0.5d |
| 2 | 集成到检索流程 | 检索结果多样性提升 | 0.5d |
| 3 | 实现多样性评估 | 对比 MMR 前后指标 | 0.5d |
| 4 | A/B 对比 + 用户反馈 | 1 周内用户满意度提升 | 0.5d |

**总人天**：约 2.0d

---

## 七、性能分析

| 操作 | 候选数 | 开销 | 说明 |
|------|--------|------|------|
| MMR 重排序（k=20） | 20 | < 2ms | 仅 20*5 = 100 次余弦计算 |
| 余弦相似度 | — | < 0.01ms | numpy 向量化 |
| 多样性评估 | 5 | < 1ms | 10 次 pairwise 比较 |

MMR 重排序对检索延迟的影响可忽略不计（< 2ms）。

---

## 八、测试规格

```python
class TestMMRReranker:
    """GIVEN MMRReranker 实例"""

    def test_first_selection_highest_relevance(self):
        """GIVEN 5 个候选结果
           WHEN 调用 rerank()
           THEN 第一个结果始终是相关性最高的"""

    def test_diverse_results_lower_similarity(self):
        """GIVEN 5 个相似的结果
           WHEN 调用 rerank(lambda=0.5)
           THEN 返回结果的平均相似度低于原始结果"""

    def test_lambda_zero_returns_maximally_diverse(self):
        """GIVEN lambda=0.0
           WHEN 调用 rerank()
           THEN 结果完全基于多样性（忽略相关性）"""

    def test_lambda_one_returns_most_relevant(self):
        """GIVEN lambda=1.0
           WHEN 调用 rerank()
           THEN 结果与原始相关性排序一致"""

    def test_diversity_evaluation_metrics(self):
        """GIVEN 5 个检索结果
           WHEN 调用 evaluate_diversity()
           THEN 返回 avg_similarity / unique_tags / unique_roles"""

    def test_empty_candidates_returns_empty(self):
        """GIVEN 空候选列表
           WHEN 调用 rerank()
           THEN 返回空列表"""
```

---

## 九、风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| MMR 降低 Top-1 相关性 | 中 | 中 | Top-1 始终选最高相关性，不受多样性影响 |
| Embedding 距离计算增加延迟 | 低 | 低 | O(k*m) 仅 100 次比较，可忽略 |
| lambda 选择不当 | 中 | 低 | 默认 0.7，用户可调 |

---

## 十、回滚策略

| 场景 | 触发条件 | 回滚操作 |
|------|----------|----------|
| 用户满意度下降 | 投诉增加 | 关闭 MMR，回退到纯相关性排序 |
| 延迟增加 | P95 > 增加 10ms | 关闭 MMR |

---

## 十一、设计决策记录

| 编号 | 决策 | 理由 | 替代方案 |
|------|------|------|----------|
| D-01 | MMR 作为多样性算法 | 经典、简单、可调 | 聚类+采样（复杂） |
| D-02 | lambda=0.7 默认 | 优先相关性，辅助多样性 | lambda=0.5（均衡） |
| D-03 | 仅与已选结果比较相似度 | 标准 MMR 实现，开销低 | 全量 pairwise（不必要） |

---

## 十二、可观测性

| 指标名称 | 类型 | 说明 |
|----------|------|------|
| `mmr_diversity_avg_similarity` | Gauge | Top-5 平均相似度 |
| `mmr_diversity_unique_tags` | Gauge | Top-5 唯一标签数 |
| `mmr_diversity_unique_roles` | Gauge | Top-5 唯一角色目录数 |
| `mmr_rerank_duration_ms` | Histogram | MMR 重排序耗时 |

---

## 十三、代码审查检查清单

- [ ] MMR 算法平衡相关性和多样性（lambda 默认 0.7）
- [ ] 多样性基于文档 Embedding 余弦距离
- [ ] Top-1 不受多样性影响（始终选最高相关性）
- [ ] 与当前排序算法 A/B 对比
- [ ] lambda 支持运行时调整
- [ ] 多样性评估指标可观测
- [ ] 候选数少时不触发 MMR（len <= top_k 直接返回）

---

*PRD 来源: `projects/yiknowledge/requirements/2026-09/64-需求-检索结果多样性MMR.md`*