---
doc_type: test
title: "YA-09-02: 检索排序与优化 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-02"
source_prds: ["02-需求-检索排序与优化"]
source_modules: ["02-prd-task-检索排序与优化"]
source_okr: [yiai-001]
---

# YA-09-02: 检索排序与优化 — 测试规格

> 来源 PRD：[02-需求-检索排序与优化.md](../../prds/2026-09/02-需求-检索排序与优化.md)
> 开发方案：[02-prd-task-检索排序与优化.md](../../devs/2026-09/02-prd-task-检索排序与优化.md)
> 需求编号：YA-09-02 · 19 个子需求 · 优先级：P2

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。覆盖重排序、缓存策略、性能管理、实验体系 4 个功能域。

---

## 目录

- [一、测试范围](#sec-1)
- [二、单元测试 — 重排序](#sec-2)
- [三、单元测试 — 排序优化](#sec-3)
- [四、单元测试 — 缓存](#sec-4)
- [五、集成测试 — RPC 契约](#sec-5)
- [六、性能测试](#sec-6)
- [七、缺陷分级](#sec-7)

---

<a id="sec-1"></a>
## 一、测试范围

| 体系 | 关键测试点 |
|------|----------|
| 重排序 | 4 种重排器接口一致性、CrossEncoder 批量推理、Ensemble 加权融合 |
| 排序优化 | MMR 多样性 λ 控制、时效性衰减函数、字段加权、LTR 特征提取 |
| 缓存 | LRU 淘汰、TTL 过期、语义缓存相似度命中、文件变更失效 |
| 性能 | 分段计时准确性、降级链回退、MRR/NDCG 指标计算 |
| 实验 | AB 分流一致性、指标采集、显著性检验 |

---

<a id="sec-2"></a>
## 二、单元测试 — 重排序

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-RR-01 | CrossEncoder 排序提升 MRR | Top-50 候选 → CrossEncoder Top-5 | MRR > RRF 原始 MRR |
| UT-RR-02 | CrossEncoder batch_size=10 | 50 候选 | 5 次批量推理（非 50 次） |
| UT-RR-03 | LLM Reranker 打分 0-10 | 相关文档 + 不相关文档 | 相关文档得分 > 不相关文档 |
| UT-RR-04 | RuleBased: 新鲜度衰减 | 文档 A（1天前）vs 文档 B（365天前） | A 的规则得分 > B |
| UT-RR-05 | Ensemble 权重融合 | weights=[(A,0.7),(B,0.3)]，A 和 B 排序不同 | 最终排序 = A×0.7 + B×0.3 |
| UT-RR-06 | BaseReranker 接口一致性 | 4 种重排器 | 输入输出类型一致（`rerank(str,list,int)→list`） |
| UT-RR-07 | CrossEncoder 不可用 → 降级 | Ollama 抛异常 | 降级到规则重排（不崩溃） |

---

<a id="sec-3"></a>
## 三、单元测试 — 排序优化

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-LTR-01 | LTR 46 维特征提取 | 查询 "RAG" + 文档 | 返回 46 维 numpy array |
| UT-LTR-02 | LTR 排序 vs 规则排序 | 50 候选 | MRR 差异可度量（不要求一定优于规则） |
| UT-MMR-01 | λ=1 纯相关性 | λ=1 | 排序 = 原始相关性降序 |
| UT-MMR-02 | λ=0 纯多样性 | λ=0 | 每次选与已选中集合最不相似的文档 |
| UT-MMR-03 | λ=0.7 自适应 | 事实查询 vs 探索查询 | 事实查询 λ 更高（接近 1） |
| UT-TD-01 | 指数衰减半衰期 30 天 | 文档年龄 30 天 | 权重 = 0.5 |
| UT-TD-02 | 线性衰减 max_t=365 | 文档年龄 365 天 | 权重 = 0 |
| UT-FW-01 | title 字段权重 ×3 | title 匹配 + body 匹配 | title 匹配的得分 ×3 |
| UT-PS-01 | 个性化排序（有历史） | 用户历史含 "RAG" 相关文档 | "RAG" 相关文档排名提升 |
| UT-PS-02 | 个性化排序（无历史） | 新用户 | 降级为全局排序（不影响结果） |

---

<a id="sec-4"></a>
## 四、单元测试 — 缓存

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-CA-01 | LRU 命中 | get("RAG 检索") → 命中 | 返回缓存结果，延迟 < 1ms |
| UT-CA-02 | TTL 过期 | 缓存项 TTL=1s，等待 1.1s 后请求 | 未命中（过期） |
| UT-CA-03 | LRU 淘汰 | max_size=100，插入第 101 项 | 最久未使用的条目被淘汰 |
| UT-CA-04 | 文件变更失效 | 文件 `doc.md` 更新 → invalidate | 含该文件的缓存全部失效 |
| UT-SC-01 | 语义缓存命中 | 新查询 "RAG 系统" vs 已缓存 "检索增强生成"（余弦 > 0.95） | 命中 |
| UT-SC-02 | 语义缓存未命中 | 新查询 "RAG" vs 已缓存 "Python 教程"（余弦 < 0.5） | 未命中 |
| UT-SC-03 | 语义缓存延迟 | 单次相似度匹配 | < 5ms |

---

<a id="sec-5"></a>
## 五、集成测试 — RPC 契约

| 编号 | RPC 方法 | 场景 | 预期 |
|------|---------|------|------|
| IT-RK-01 | `ranking.rerank` | 指定 reranker="cross_encoder" | 返回 Top-5 重排结果，含 score |
| IT-RK-02 | `ranking.rerank` | 指定 reranker="ensemble" + weights | 融合排序结果 |
| IT-RK-03 | `ranking.rerank` | 指定 diversity=true, lambda=0.7 | 结果多样性 > 纯相关性 |
| IT-CA-01 | `ranking.cache_stats` | 查询缓存统计 | 返回 hit_rate/miss_count/eviction_count |
| IT-CA-02 | `ranking.clear_cache` | 清空缓存 | 后续查询全部 miss |
| IT-PF-01 | `ranking.profile` | 查询性能剖析 | 分段耗时：embedding/BM25/RRF/rerank/format/total |
| IT-DG-01 | `ranking.degradation_status` | 查询当前降级级别 | 返回 active_reranker + degradation_reason |
| IT-AB-01 | `ranking.ab_assign` | 用户分配到 variant | 相同 user_id → 相同 variant |
| IT-AB-02 | `ranking.ab_record` | 记录指标 | 指标写入成功 |

---

<a id="sec-6"></a>
## 六、性能测试

| 编号 | 场景 | 目标 | 采集方式 |
|------|------|------|------|
| PT-01 | CrossEncoder 批量推理（50 候选） | < 500ms | `pytest-benchmark` |
| PT-02 | 结果缓存命中延迟 | < 1ms | `pytest-benchmark` |
| PT-03 | 语义缓存相似度匹配 | < 5ms | `pytest-benchmark` |
| PT-04 | MMR 多样性重排（100 候选→10） | < 50ms | `pytest-benchmark` |
| PT-05 | LTR 特征提取（50 候选 × 46 维） | < 100ms | `pytest-benchmark` |
| PT-06 | 降级链回退延迟 | 每级 < +10% 原始延迟 | 计时对比 |

---

<a id="sec-7"></a>
## 七、缺陷分级

| 级别 | 定义 | 示例 |
|------|------|------|
| S0 — 阻断 | 排序管道崩溃 | 任何重排器抛未捕获异常导致检索 500 |
| S1 — 严重 | 排序质量严重下降 | CrossEncoder 打分全部相同、缓存返回过期/错误数据 |
| S2 — 一般 | 单个模块异常 | MMR 多样性对空文档集异常、语义缓存全部 miss |
| S3 — 轻微 | 性能退化 | 结果缓存命中延迟 > 10ms |

---

## 自动化现状

| 模块 | 状态 | 说明 |
|------|------|------|
| 重排器 | 待实施 | CrossEncoder/LLM 需 mock |
| MMR/时效性/字段加权 | 待实施 | 纯函数 |
| LTR | 待实施 | 需 LightGBM 模型文件 |
| 缓存（LRU/TTL/语义） | 待实施 | 纯函数 + mock embedding |
| 降级策略 | 待实施 | mock 依赖不可用 |
| AB 测试 | 待实施 | MongoDB 持久化 |
| RPC 契约 | 待实施 | httpx + MDB |

---