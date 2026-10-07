---

doc_type: test
title: "YA-09-04: 检索数据管理 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-04"
source_prds: ["04-需求-检索数据管理"]
source_modules: ["04-prd-task-检索数据管理"]
source_okr: [yiai-002]

type: test
---

# YA-09-04: 检索数据管理 — 测试规格

> 来源 PRD：[04-需求-检索数据管理.md](../../prds/2026-09/04-需求-检索数据管理.md)
> 开发方案：[04-prd-task-检索数据管理.md](../../devs/2026-09/04-prd-task-检索数据管理.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖多轮检索迭代、可解释性、多语言、时间感知与结果聚类。

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 算法纯函数 | pytest + numpy | 多轮上下文融合、时效性加权计算、相关性因子分解、聚类 Silhouette Score |
| L2 集成测试 | 真实 RAG 管道 + MongoDB | pytest-asyncio + motor + httpx | 多轮检索迭代端到端、跨语言检索召回、时间感知排序、聚类前端输出 |
| L4 性能基准 | 延迟/精度测量 | pytest + time.perf_counter | 多轮迭代收敛轮次、聚类超时、翻译延迟 |

### 1.2 覆盖模块

PRD 五大模块：多轮检索迭代优化（查询改写/收敛检测/多样性强制）、检索结果可解释性（因子分解/缺失分析）、多语言检索（BGE-M3/翻译/语言路由）、时间感知检索（新鲜度加权/时间查询理解/领域衰减）、检索结果聚类（层次聚类/关键词标签/降维可视化）。

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import numpy as np
from datetime import datetime, timedelta

@pytest.fixture
def multi_turn_conversation():
    """多轮对话 fixture——模拟 5 轮连续查询。"""
    return [
        {"role": "user", "content": "RAG 检索的流程是怎样的？"},
        {"role": "assistant", "content": "RAG 分为检索和生成两个阶段..."},
        {"role": "user", "content": "它的性能瓶颈在哪？"},
        {"role": "assistant", "content": "主要是 embedding 计算和向量检索..."},
        {"role": "user", "content": "怎么优化？"},
    ]

@pytest.fixture
def relevance_factors():
    """相关性因子分解 fixture。"""
    return {
        "bm25_score": 0.72,
        "vector_score": 0.85,
        "freshness_score": 0.90,
        "field_boost": 1.5,
        "combined": 0.81,
    }

@pytest.fixture
def multilingual_queries():
    """多语言查询 fixture。"""
    return {
        "zh": "Docker 部署",
        "en": "Docker deployment",
        "mixed": "Kubernetes 集群 部署",
    }

@pytest.fixture
def time_sensitive_docs():
    """时间感知测试文档 fixture。"""
    now = datetime.now()
    return [
        {"title": "React 最新特性", "created_at": now - timedelta(days=1), "category": "前端框架"},
        {"title": "React 入门教程", "created_at": now - timedelta(days=180), "category": "前端框架"},
        {"title": "Python 基础", "created_at": now - timedelta(days=365), "category": "编程基础"},
        {"title": "MySQL 原理", "created_at": now - timedelta(days=700), "category": "数据库原理"},
    ]

@pytest.fixture
def cluster_documents():
    """聚类测试文档 fixture——3 个语义主题。"""
    rng = np.random.RandomState(42)
    # 主题 1: RAG (10 docs)
    rag_embeddings = rng.randn(10, 768) + np.array([1.0] * 768)
    # 主题 2: Docker (8 docs)
    docker_embeddings = rng.randn(8, 768) + np.array([-1.0] * 768)
    # 主题 3: Agent (7 docs)
    agent_embeddings = rng.randn(7, 768)
    all_embeddings = np.vstack([rag_embeddings, docker_embeddings, agent_embeddings])
    labels = [0]*10 + [1]*8 + [2]*7
    return {"embeddings": all_embeddings, "labels": labels, "n_clusters": 3}

@pytest.fixture
def query_rewrite_examples():
    """查询改写测试用例集。"""
    return [
        ("RAG", "RAG 检索 增强 生成 技术 详解", "维度补充"),
        ("Python数据分析工具库", "Python 数据分析", "泛化"),
        ("如何搭建深度学习训练环境GPU", "深度学习 GPU 训练 环境 搭建 教程", "同义改写"),
    ]
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 多轮检索迭代

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-MT-01 | 多轮上下文融合衰减 | 3 轮对话历史 | 1. 第 3 轮查询输入<br>2. 融合前 2 轮 embedding，衰减系数 0.7^2=0.49 | 历史轮次权重指数衰减，当前查询权重最高 | P1 |
| TC-MT-02 | 历史轮次上限 5 | 7 轮对话 | 1. 第 7 轮查询<br>2. 检查融合的轮次数 | 仅融合最近 5 轮，第 1 轮被丢弃 | P1 |
| TC-MT-03 | 查询改写维度补充 | 原始查询信息不完整 | 1. LLM 分析信息缺口<br>2. 生成改写查询<br>3. 新检索结果补全信息 | 改写查询包含缺失维度关键词 | P1 |
| TC-MT-04 | 收敛检测——新增文档不足 | 第 4 轮迭代 | 1. 本轮新增文档数 < 3<br>2. 检查迭代是否终止 | 迭代终止，返回已有结果 | P1 |
| TC-MT-05 | 收敛检测——达到最大轮次 | 第 5 轮迭代 | 1. 达到 max_iterations=5<br>2. 检查是否强制终止 | 强制终止，返回已有结果 + WARNING | P1 |
| TC-MT-06 | 跨迭代去重 | 第 2 轮结果与第 1 轮有重复 | 1. 维护已有文档签名集合<br>2. 新结果去重后再加入 | 不存在重复文档 | P2 |

### 3.2 可解释性与多语言

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-EX-01 | 相关性因子分解完整性 | 检索返回 Top-5 结果 | 1. 检查每个结果是否含 bm25/vec/freshness/field 子分<br>2. 验证综合分数 = 各因子加权和 | 四个因子全部存在，综合分数计算正确 | P1 |
| TC-EX-02 | "为什么没检索到"分析 | 指定缺失文档 | 1. 输入期望但缺失的文档描述<br>2. 系统执行反向分析 | 返回缺失原因报告，包含各因子得分 | P2 |
| TC-ML-01 | 中英文跨语言检索 | 中文查询 + 英文文档 | 1. 中文查询 "Docker 部署"<br>2. 检查是否召回英文文档 "Docker deployment" | 英文文档出现在 Top-10 结果中 | P1 |
| TC-ML-02 | 语言检测 CJK > 50% | 中文查询 | 1. 查询 "怎样配置 Nginx"<br>2. 检查语言路由 | 路由到中文检索 + 英文扩展 | P2 |
| TC-ML-03 | BGE-M3 多语言 embedding | 中文+英文查询对 | 1. 分别对中英文同义查询编码<br>2. 计算余弦相似度 | 相似度 > 0.7（跨语言语义保持） | P1 |

### 3.3 时间感知与聚类

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-TA-01 | 新鲜度加权——前端框架 | 1 天前 vs 180 天前文档 | 1. 查询 "React"<br>2. 检查排序 | 1 天前文档排名高于 180 天前文档 | P1 |
| TC-TA-02 | 领域差异化衰减 | 前端框架 vs 编程基础 | 1. 对比两个 365 天前文档的 recency_score<br>2. 前端 λ=0.02，基础 λ=0.0005 | 前端框架衰减远快于编程基础 | P2 |
| TC-TA-03 | 时间查询理解——"最近一周" | 当前时间 2026-09-23 | 1. 查询 "最近一周的部署教程"<br>2. 检查过滤范围 | 仅返回 2026-09-16 ~ 2026-09-23 的文档 | P1 |
| TC-TA-04 | 版本词 vs 时间词区分 | 查询 "React 18 最新特性" | 1. 先按版本 React 18 过滤<br>2. 再按时间新鲜度排序 | 不将所有 React 文档去时间排序 | P2 |
| TC-CL-01 | 结果聚类数自适应 | 25 个检索结果 | 1. 触发层次聚类<br>2. 检查聚类数（Silhouette 最优） | 聚类数在 2-5 之间，Silhouette > 0.3 | P2 |
| TC-CL-02 | 聚类关键词标签 | 3 个聚类 | 1. TF-IDF 提取每簇 Top-3 关键词<br>2. 检查标签可读性 | 标签为有意义术语，非 "Cluster 1" | P2 |
| TC-CL-03 | 聚类超时保护 | 100 个结果聚类 | 1. 设置聚类超时 500ms<br>2. 超时后检查行为 | 返回扁平列表，不抛异常 | P2 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-MT-01 | 单轮对话（无历史） | 首次查询，无对话历史 | 不融合上下文，直接检索 | P1 |
| EG-MT-02 | 迭代超时总上限 5s | 模拟慢检索 > 1s/轮 | 达到 5s 总超时后强制返回已有结果 | P1 |
| EG-EX-01 | 所有因子得分为 0 的文档 | 完全不匹配的文档 | 综合分为 0，不隐藏而是正常展示 | P2 |
| EG-ML-01 | 纯数字/符号查询 | "404" 或 "###" | 语言检测为 ASCII，正常处理 | P2 |
| EG-TA-01 | 所有时间元数据缺失 | created_at/updated_at/mtime 全 None | 使用知识库导入时间 + 标记"时间不精确" | P1 |
| EG-CL-01 | 仅 3 个结果时触发聚类 | 结果数 < 10 | 不触发聚类，返回扁平列表 | P1 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-MT-01 | 多轮检索不影响单轮性能 | 启用多轮迭代后 | 单轮查询延迟增加 < 50ms | P1 |
| RG-ML-01 | 多语言不影响中文检索精度 | 启用 BGE-M3 后 | 纯中文查询 Top-5 结果不变 | P1 |
| RG-TA-01 | 时间感知不影响无时间查询 | 不包含时间词的查询 | 排序结果与未启用时间感知时一致 | P1 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能模块 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| 1. 多轮检索迭代 | TC-MT-01 ~ TC-MT-06, EG-MT-01 ~ EG-MT-02 | 上下文融合 + 收敛 + 去重 |
| 2. 检索结果解释 | TC-EX-01 ~ TC-EX-02, EG-EX-01 | 因子分解 + 缺失分析 |
| 3. 多语言检索 | TC-ML-01 ~ TC-ML-03, EG-ML-01 | 跨语言 + 检测 + embedding |
| 4. 时间感知检索 | TC-TA-01 ~ TC-TA-04, EG-TA-01 | 新鲜度 + 领域 + 时间理解 |
| 5. 检索结果聚类 | TC-CL-01 ~ TC-CL-03, EG-CL-01 | 自适应 K + 标签 + 超时 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| UMAP 可视化验证 | 降维图仅视觉验证，无自动断言 | 添加 cluster separation 量化指标（Silhouette on 2D） |
| 翻译准确率评估 | 翻译质量依赖 Ollama 模型，无量化评估 | 添加 BLEU/COMET 翻译质量自动评分 |
| 多语言查询扩展 | 同义词扩展跨语言效果未覆盖 | 添加中英同义词联合扩展测试 |
| 用户行为分析管道 | 反馈采集到模型更新全链路未测 | 添加端到端反馈学习管道测试 |
| 文档时间元数据回退链 | created_at→updated_at→mtime→导入时间 全回退未覆盖 | 添加四种回退场景的独立测试 |