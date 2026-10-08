---

doc_type: test
title: "YA-09-03: 检索高级技术 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-03"
source_prds: ["03-需求-检索高级技术"]
source_modules: ["03-prd-task-检索高级技术"]
source_okr: [yiai-002]

type: test
---

# YA-09-03: 检索高级技术 — 测试规格

> 来源 PRD：[03-需求-检索高级技术.md](../../prds/2026-09/03-需求-检索高级技术.md)
> 开发方案：[03-prd-task-检索高级技术.md](../../devs/2026-09/03-prd-task-检索高级技术.md)
> 需求编号：YA-09-03 · 优先级：P2

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖语义哈希、对比学习、蒸馏、多模态、索引管理。

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 算法纯函数，无外部依赖 | pytest + numpy | LSH 哈希一致性、对比学习损失函数、蒸馏损失计算、CLIP 向量化、索引热插拔 |
| L2 集成测试 | 真实向量索引 + MongoDB test db | pytest-asyncio + motor + llama_index | 语义哈希两阶段检索、多模态混合查询、跨集合搜索、词典热更新 |
| L4 性能基准 | 索引构建/检索性能测量 | pytest + time.perf_counter | 哈希检索 vs 暴力检索速度对比、索引压缩比、蒸馏模型推理速度 |

### 1.2 模块覆盖范围

本测试覆盖 PRD 中五大体系：高级检索算法（语义哈希/对比学习/蒸馏/零样本/在线学习/对抗训练/知识增强）、多模态检索（图片向量化/批量查询/跨集合搜索）、对话上下文检索（历史利用/会话感知/知识点图谱）、用户反馈分析（反馈学习/行为分析）、索引管理（压缩/健康监控/备份恢复/迁移/热备份/词典热更新）。

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import numpy as np

@pytest.fixture
def sample_768d_vectors():
    """生成 100 个 768 维测试向量——模拟知识库 embedding。"""
    rng = np.random.RandomState(42)
    return rng.randn(100, 768).astype(np.float32)

@pytest.fixture
def sample_query_vector():
    """单个 768 维查询向量。"""
    rng = np.random.RandomState(99)
    return rng.randn(768).astype(np.float32)

@pytest.fixture
def lsh_projections():
    """LSH 随机投影矩阵——768 维到 64-bit。"""
    rng = np.random.RandomState(7)
    return rng.randn(64, 768).astype(np.float32)

@pytest.fixture
def sample_image_bytes():
    """模拟图片二进制数据——224x224 RGB JPEG。"""
    import io
    from PIL import Image
    img = Image.new('RGB', (224, 224), color='blue')
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    return buf.getvalue()

@pytest.fixture
def sample_clip_image_embedding():
    """预设的 CLIP 512 维图片嵌入。"""
    rng = np.random.RandomState(123)
    vec = rng.randn(512).astype(np.float32)
    return vec / np.linalg.norm(vec)  # 归一化

@pytest.fixture
def multipage_documents():
    """多页文档 fixture——模拟跨集合检索的数据。"""
    return {
        "knowledge_files": [
            {"_id": "k1", "title": "RAG 检索流程", "content": "RAG 分为检索和生成..."},
            {"_id": "k2", "title": "Docker 部署指南", "content": "Docker compose up..."},
        ],
        "sessions": [
            {"_id": "s1", "title": "用户对话：RAG 问题", "messages": [{"role": "user", "content": "RAG 怎么优化？"}]},
        ],
        "bugs": [
            {"_id": "b1", "title": "RAG 空结果 Bug", "description": "embedding 维度不匹配导致..."},
        ],
    }

@pytest.fixture
def synonym_dict():
    """同义词词典 fixture。"""
    return {
        "embedding": ["向量", "嵌入", "向量表示"],
        "Docker": ["容器", "Container"],
        "检索": ["搜索", "查询", "Retrieval"],
    }

@pytest.fixture
def stopwords_list():
    """停用词列表 fixture。"""
    return ["的", "了", "是", "在", "和", "the", "a", "an", "is", "are"]
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 语义哈希检索

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-SH-01 | LSH 哈希码确定性 | 同一向量 + 同一投影矩阵 | 1. 对同一向量执行两次 `lsh_hash(vec, projections)`<br>2. 比较两次输出的 64-bit 哈希码 | 两次哈希码完全相同 | P1 |
| TC-SH-02 | LSH 语义保持性 | 语义相近的两向量 | 1. 计算原始向量对的余弦相似度<br>2. 计算哈希码的 Hamming 距离<br>3. 验证高相似度对应低 Hamming 距离 | Pearson 相关系数 > 0.7 | P1 |
| TC-SH-03 | 两阶段检索召回率 | 10000 文档向量索引 | 1. 粗筛：Hamming 距离 < 12 过滤<br>2. 精排：余弦相似度 Top-20<br>3. 对比暴力 Top-20 | 召回率 > 90%（精排结果与暴力结果重叠） | P0 |
| TC-SH-04 | 哈希碰撞处理 | 多个文档产生相同哈希码 | 1. 构造产生哈希碰撞的文档组<br>2. 精排阶段所有碰撞文档参与余弦排序 | 碰撞文档不丢失，精排正确消歧 | P2 |
| TC-SH-05 | 内存占用验证 | 10000 文档索引 | 1. 比较哈希码内存 vs 全向量内存 | 64-bit × 10000 = 80KB vs 768×4×10000 = 30.7MB | P2 |
| TC-SH-06 | 增量哈希更新 | 已有 1000 文档索引，新增 10 文档 | 1. 用已有投影矩阵映射新文档<br>2. 新哈希码加入索引 | 新文档可检索，无需重训练 | P1 |

### 3.2 对比学习与蒸馏

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-CL-01 | InfoNCE 损失正样本区分 | 正样本对 + 负样本对 | 1. 计算正样本对相似度<br>2. 计算负样本对相似度<br>3. 验证 `Sim(pos) > Sim(neg)` | 正样本相似度均值 > 负样本相似度均值 + 0.3 | P1 |
| TC-KD-01 | Student 推理速度提升 | Teacher (BERT-large) + Student (DistilBERT) 模型 | 1. 100 次推理计时对比<br>2. 计算速度比 | Student 推理 >= 5x Teacher 速度 | P1 |
| TC-KD-02 | Student 精度保持 | 标准检索测试集 | 1. Teacher NDCG@5 vs Student NDCG@5<br>2. 计算精度保留率 | 精度保留 >= 90%（NDCG@5 下降 < 10%） | P1 |
| TC-ZS-01 | 零样本 CrossEncoder 可用性 | 新领域无标注数据 | 1. 零样本 prompt 评估查询-文档对<br>2. 检查"是"的 logit 概率 | 概率值可区分相关/不相关文档 | P2 |

### 3.3 多模态与索引管理

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-MM-01 | CLIP 图片向量维度 | 224x224 RGB 图片 | 1. 通过 CLIP ViT-B/32 编码<br>2. 检查输出向量形状 | 512 维向量 | P1 |
| TC-MM-02 | 图文混合查询融合 | 文本 + 图片输入 | 1. 文本嵌入 + 图片嵌入加权融合（0.5/0.5）<br>2. 检查融合后向量维度 | 融合向量维度一致，权重正确 | P2 |
| TC-IX-01 | 索引热插拔不中断检索 | 新旧两个索引 | 1. 在检索进行中切换索引<br>2. 检查 `rag_query` 响应 | 切换期间无 500 错误，检索正常返回 | P0 |
| TC-IX-02 | 向量索引压缩 SQ | 768 维 Float32 向量 | 1. 标量量化 Float32→Int8<br>2. 比较压缩前后检索 Top-10 | 检索重叠率 > 97%，内存减少 75% | P2 |
| TC-IX-03 | 索引健康监控完整性 | 100 文档索引 | 1. 删除源文档 5 个<br>2. 健康检查发现孤立文档 | 孤立文档检测正确，差异数 = 5 | P1 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-SH-01 | 单文档向量索引 | 仅 1 个文档 | LSH 粗筛正常，精排返回唯一结果 | P2 |
| EG-SH-02 | 空索引检索 | 0 文档索引 | 返回空列表，不抛异常 | P1 |
| EG-SH-03 | 哈希码全碰撞 | 所有文档映射到同一哈希码 | 精排阶段全部参与排序，不丢失文档 | P2 |
| EG-MM-01 | 非图片文件传入 CLIP | 传入纯文本文件而非图片 | 返回错误信息"不支持的文件类型" | P1 |
| EG-MM-02 | 超大图片处理 | 8000x6000 像素图片 | 自动缩放至 224x224，正常编码 | P2 |
| EG-IX-01 | 索引导入损坏文件 | 损坏的 faiss 索引文件 | 明确报错 + 提示重建索引 | P1 |
| EG-IX-02 | 并发索引更新 | 两个 Watcher 同时触发增量索引 | 索引一致性保证，无数据竞争 | P1 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-SH-01 | 语义哈希不影响 BM25 检索 | 启用语义哈希后 | BM25 关键词检索结果不变 | P1 |
| RG-MM-01 | 多模态不影响纯文本检索 | 启用 CLIP 编码后 | 纯文本查询结果不变 | P1 |
| RG-IX-01 | 索引压缩不降检索质量 | 压缩后检索 | NDCG@5 与压缩前一致（差异 < 2%） | P1 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能模块 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| 1.1 语义哈希 | TC-SH-01 ~ TC-SH-06, EG-SH-01 ~ EG-SH-03 | 哈希一致性 + 召回率 + 边界 |
| 1.2 对比学习 | TC-CL-01 | InfoNCE 损失 |
| 1.3 模型蒸馏 | TC-KD-01, TC-KD-02 | 速度 + 精度 |
| 1.4 零样本学习 | TC-ZS-01 | CrossEncoder 可用性 |
| 2.1 多模态查询 | TC-MM-01, TC-MM-02 | CLIP 编码 + 融合 |
| 5.1 索引压缩 | TC-IX-02 | SQ 量化 |
| 5.2 索引健康 | TC-IX-03 | 完整性检查 |
| 5.3 索引备份 | RG-IX-01 | 压缩后检索一致性 |
| 5.6 词典热更新 | (fixtures: synonym_dict, stopwords_list) | 词典版本管理 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| 对比学习在线训练 | InfoNCE 损失单元测试覆盖，但在线增量更新未测 | 添加在线对比学习增量更新集成测试 |
| 对抗训练效果 | 对抗样本生成已设计，但未验证鲁棒性提升 | 添加对抗攻击测试（Normalized Kendall Tau < 0.1） |
| 知识点图谱检索 | KG 嵌入模型（TransE/RotatE）未测试 | 添加 KG 查询集成测试 |
| 反馈学习闭环 | 反馈信号采集到模型更新全链路未测 | 添加端到端反馈学习管道测试 |
| 索引迁移零停机 | 双写模式未验证 | 添加迁移期间检索可用性测试 |