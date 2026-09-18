---
doc_type: module
prd_task_id: "YK-09-04"
title: "YK-09-04: RAG 检索质量监控 — 开发方案"
status: 待开发
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
estimate_frontend: 3.0
source_prd: "07-监控-RAG检索质量.md"
source_okr: [yiknowledge-001]
related_tests: ["07-prd-test-RAG检索质量"]
---

# YK-09-04: RAG 检索质量监控 — 开发方案

> 来源 PRD：[07-监控-RAG检索质量.md](../../prds/2026-09/07-监控-RAG检索质量.md)
> 需求编号：YK-09-04 · 优先级：P1 · 人天：3.0d · 状态：待开发
> 测试方案：[07-prd-test-RAG检索质量.md](../../tests/2026-09/07-prd-test-RAG检索质量.md)

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 目录

- [一、架构总览](#sec-1)
- [二、关键技术决策](#sec-2)
- [三、实现规格](#sec-3)
- [四、实施路线图](#sec-4)
- [五、代码审查检查清单](#sec-5)
- [六、技术风险](#sec-6)
- [七、实现完成记录](#sec-7)
- [八、已知缺口与技术债](#sec-8)

---

<a id="sec-1"></a>
## 一、架构总览

### 1.1 监控体系

三道防线确保 RAG 检索质量可观测：

| 防线 | 时机 | 检测内容 | 响应 |
|------|------|---------|------|
| 索引构建时 | `indexer.build_index()` | Embedding 维度一致性校验 | 维度不匹配 → 阻止构建 + WARNING |
| 每次检索 | `rag_query` / `rag_chat_stream` | 空结果率、检索延迟 | 累计指标 + 阈值告警 |
| 定期巡检 | apscheduler 每 5 分钟 | 全库维度校验、空结果率统计 | 超过阈值 → 企微通知 |

### 1.2 根因分类

空结果时自动分类根因，避免"知识库无内容"和"系统故障"混淆：

| 根因 | 检测方式 | 标签 |
|------|---------|------|
| 知识库无相关内容 | BM25+向量均无结果 + 维度正常 + 知识库非空 | `no_content` |
| Embedding 维度不匹配 | 查询向量 dim ≠ 索引向量 dim | `dimension_mismatch` |
| 索引损坏/为空 | 索引文件缺失或 chunk 数 = 0 | `index_corrupt` |
| 标签过滤过度 | filter 条件过严导致 0 结果（但不过滤时有结果） | `filter_too_strict` |
| 系统错误 | 检索过程中抛异常 | `system_error` |

### 1.3 文件清单

```
YiAi/src/
├── domain/rag/
│   ├── monitor.py                 # 【新增】RAG 质量监控器
│   └── indexer.py                 # 【修改】维度校验
├── services/rag/
│   └── rag_service.py             # 【修改】空结果根因分类 + 指标采集
└── shared/
    └── rag_metrics.py             # 【新增】RAG 指标类型定义
```

---

<a id="sec-2"></a>
## 二、关键技术决策

### D-01：空结果率阈值 — 滑动窗口而非累计值

累计空结果率受历史数据稀释，无法反映最近的故障。使用 5 分钟滑动窗口统计：窗口内空结果数 / 总请求数 > 20% → 告警。窗口过期数据自动清理（内存环形缓冲区）。

### D-02：维度校验 — 索引构建时 + 每次查询双重检查

索引构建时校验维度（防患于未然），每次查询时也记录维度（检测运行时切换）。双重检查确保：构建时的维度错误被阻止，运行时非预期的维度变化被记录为 `dimension_mismatch` 根因。

### D-03：告警通道 — 企微 Markdown 消息

告警通过 YiAi 现有的企微消息推送通道发送。格式：Markdown 卡片，包含告警类型、当前指标值、阈值、建议排查步骤。告警去重：同一告警类型 10 分钟内不重复发送。

---

<a id="sec-3"></a>
## 三、实现规格

### 3.1 维度校验

```python
# domain/rag/indexer.py

async def build_file_index(self, file_paths: list[str]):
    embedding_dim = len(await self.embed_model.aembed_query("test"))
    existing_dim = self._get_existing_index_dim()

    if existing_dim and embedding_dim != existing_dim:
        logger.warning(
            f"[RAG Monitor] Embedding 维度不匹配: "
            f"新模型={embedding_dim}, 旧索引={existing_dim}。"
            f"将重建索引。"
        )
        self._clear_index()  # 清空旧索引

    # 继续构建索引，记录新维度
    self._save_index_dim(embedding_dim)
```

### 3.2 空结果根因分类

```python
# domain/rag/monitor.py

@dataclass
class EmptyResultCause:
    tag: str                # no_content | dimension_mismatch | index_corrupt | filter_too_strict | system_error
    details: str
    suggested_action: str

class RAGMonitor:
    def __init__(self, window_seconds: int = 300, alert_threshold: float = 0.2):
        self._ring_buffer = deque(maxlen=10000)  # (timestamp, had_results)
        self._alert_cooldown: dict[str, float] = {}  # tag → last_alert_time

    def record_query(self, result_count: int, query_dim: int | None,
                     index_dim: int | None, error: Exception | None = None):
        """每次查询后调用"""

    def classify_empty_result(self, result_count: int, query_dim: int | None,
                              index_dim: int | None, total_docs: int,
                              had_filter: bool, error: Exception | None) -> EmptyResultCause:
        """空结果根因分类"""

    def should_alert(self) -> list[EmptyResultCause]:
        """检查滑动窗口空结果率是否超阈值"""

    async def send_alert(self, cause: EmptyResultCause):
        """通过企微发送告警，含 10 分钟冷却"""
```

### 3.3 企微告警格式

```markdown
## RAG 检索质量告警
- **告警类型**: Embedding 维度不匹配
- **当前状态**: 查询维度=1024, 索引维度=768
- **影响**: 所有向量检索返回空结果
- **建议操作**: 
  1. 检查 Embedding 模型配置 `rag.embed_model`
  2. 触发索引重建: `POST /rag/rebuild-index`
- **时间**: 2026-09-15 14:30:00
```

### 3.4 指标采集

```python
# shared/rag_metrics.py

@dataclass
class RAGMetrics:
    total_queries: int
    empty_results: int
    empty_result_rate: float       # 5 分钟滑动窗口
    avg_latency_ms: float
    p95_latency_ms: float
    dimension_mismatch_count: int
    index_corrupt_count: int
    active_index_dim: int | None
    active_index_chunks: int
```

---

<a id="sec-4"></a>
## 四、实施路线图

| 步骤 | 任务 | 产出 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 实现维度校验（indexer 构建时） | `indexer.py` 修改 | 切换模型 → 索引重建 | 0.3 |
| 2 | 实现空结果根因分类 | `monitor.py` `classify_empty_result()` | 4 种根因场景测试 | 0.5 |
| 3 | 实现滑动窗口空结果率 | `monitor.py` 环形缓冲区 + 阈值检查 | 超阈值触发告警 | 0.5 |
| 4 | 实现企微告警推送 | `monitor.py` `send_alert()` | 告警消息格式正确 | 0.3 |
| 5 | 集成到 `rag_query` / `rag_chat_stream` | `rag_service.py` 修改 | 每次查询后 `record_query` | 0.4 |
| 6 | 实现定期巡检（apscheduler） | `monitor.py` 5 分钟巡检任务 | 自动检测维度/空结果率 | 0.3 |
| 7 | 实现 RAG 指标 API | `rag_service.get_metrics()` | 返回 RAGMetrics | 0.2 |
| 8 | 集成测试 + 告警端到端 | 模拟维度不匹配 → 告警 | 企微收到消息 | 0.5 |

**总计：3.0d**

---

<a id="sec-5"></a>
## 五、代码审查检查清单

- [ ] 维度校验在索引构建前执行（非构建后）
- [ ] 空结果根因分类覆盖全部 5 种标签
- [ ] 滑动窗口 5 分钟自动清理过期数据
- [ ] 告警冷却 10 分钟（同一类型不重复发送）
- [ ] `record_query` 非阻塞（不增加检索延迟）
- [ ] 企微 Markdown 消息格式正确（含建议操作）

---

<a id="sec-6"></a>
## 六、技术风险

| 风险 | 概率 | 影响 | 缓解措施 | 应急预案 |
|------|------|------|---------|---------|
| 滑动窗口内存泄漏 | 低 | 中 | `deque(maxlen=10000)` 自动淘汰 | 监控 `len(ring_buffer)` |
| 企微推送失败 | 中 | 低 | 日志 WARNING + 无重试 | 告警丢失（可接受） |
| 维度切换后首次检索全空 | 中 | 高 | 索引构建时即发现维度变化 → 自动重建 | 维度校验兜底 |

---

<a id="sec-7"></a>
## 七、实现完成记录

> **状态**：待开发。

### 7.1 产出清单（待填充）

| 分类 | 文件 | 说明 |
|------|------|------|
| 监控器 | `domain/rag/monitor.py` | — |
| 索引器修改 | `domain/rag/indexer.py` | 维度校验 |
| Service 修改 | `services/rag/rag_service.py` | 根因分类 + 指标采集 |
| 类型定义 | `shared/rag_metrics.py` | — |
| **合计** | **4 个文件** | — |

---

<a id="sec-8"></a>
## 八、已知缺口与技术债

### 8.1 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| 1 | 检索结果质量评分（MRR/NDCG） | 当前仅监控"有无结果"，不监控"结果好不好" | 依赖 YA-09-02 质量报告就绪后集成 |
| 2 | Grafana 仪表盘 | 指标仅 API 可查，无可视化面板 | Grafana 数据源对接（Prometheus exporter） |

### 8.2 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | 滑动窗口仅内存存储 | P2 | 0.2 | 进程重启后窗口数据丢失，告警阈值需要重新积累 | 待实施（Redis 持久化） |
| 2 | 告警规则硬编码 | P3 | 0.2 | 阈值（20%）和窗口（5min）不可动态调整 | 待实施（config.yaml 配置化） |

---