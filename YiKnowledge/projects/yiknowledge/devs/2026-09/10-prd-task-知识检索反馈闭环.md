---
doc_type: module
prd_task_id: "YK-09-07"
title: "YK-09-07: 知识检索反馈闭环 — 开发方案"
status: 需求已编写
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
estimate_frontend: 2.0
source_prd: "10-架构设计-知识检索反馈闭环.md"
source_okr: [yiknowledge-001]
related_tests: ["10-prd-test-知识检索反馈闭环"]
---

# YK-09-07: 知识检索反馈闭环 — 开发方案

> 来源 PRD：[10-架构设计-知识检索反馈闭环.md](../../prds/2026-09/10-架构设计-知识检索反馈闭环.md)
> 需求编号：YK-09-07 · 优先级：P1 · 人天：2.0d · 状态：需求已编写
> 测试方案：[10-prd-test-知识检索反馈闭环.md](../../tests/2026-09/10-prd-test-知识检索反馈闭环.md)

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 目录

- [一、架构总览](#sec-1)
- [二、关键技术决策](#sec-2)
- [三、实现规格](#sec-3)
- [四、实施路线图](#sec-4)
- [五、代码审查检查清单](#sec-5)
- [六、实现完成记录](#sec-6)
- [七、已知缺口与技术债](#sec-7)

---

<a id="sec-1"></a>
## 一、架构总览

### 1.1 反馈闭环

```
用户检索 → RAG 返回结果 → 用户对每条结果 👍/👎
  → 反馈收集 API → MongoDB feedback 集合
  → 定期分析（每日）→ 调整文档权重:
      👍 多的文档 → weight += 0.05
      👎 多的文档 → weight -= 0.05
      👎 集中 → 策展人通知（可能需要更新/归档）
  → RAG 检索 weight 排序 → 反馈生效
```

### 1.2 文件清单

```
YiAi/src/
├── services/knowledge/
│   └── feedback_service.py      # 【新增】反馈收集 + 分析 API
├── domain/knowledge/
│   └── feedback.py              # 【新增】反馈权重调整引擎
├── data/
│   └── collections/
│       └── search_feedback      # 【新增】{query, doc_path, rating(+1/-1), user, timestamp}
```

前端：
```
YiVad/src/components/
└── SearchFeedback.vue           # 【新增】👍👎 反馈按钮组件
```

---

<a id="sec-2"></a>
## 二、关键技术决策

### D-01：简单 👍/👎 二值反馈而非 5 星评分

二元反馈用户操作成本低（点击即完成），完成率远高于多级评分。5 星评分在检索场景中粒度过度——用户只需表达"有用/无用"，不需要区分 3 星和 4 星。

### D-02：每日批量更新权重而非实时

单次反馈直接修改 weight 存在刷票风险（同一用户多次点击 👎）。每日批量聚合：同一 (query, doc) 对的多条反馈去重到同一用户 → 统计净评分 → 批量更新 weight。权重调整幅度受限（±0.05/天，累积上限 ±0.3）。

### D-03：匿名反馈（不强制登录）

YiVad 已有可选认证，反馈不需要强制登录（降低参与门槛）。未登录用户反馈记录 `user="anonymous"`，去重基于 IP + User-Agent 哈希。

---

<a id="sec-3"></a>
## 三、实现规格

```python
# domain/knowledge/feedback.py

class FeedbackEngine:
    async def record(self, query: str, doc_path: str, rating: int,
                     user: str | None = None) -> None:
        """记录 👍 (+1) 或 👎 (-1)"""

    async def aggregate_daily(self) -> list[WeightAdjustment]:
        """每日聚合：去重 → 统计净评分 → 生成 weight 调整建议"""
        pipeline = [
            {"$match": {"timestamp": {"$gte": midnight}}},
            {"$group": {
                "_id": {"query": "$query", "doc_path": "$doc_path", "user": "$user"},
                "rating": {"$first": "$rating"}  # 同一用户去重
            }},
            {"$group": {
                "_id": "$_id.doc_path",
                "net_score": {"$sum": "$rating"},  # 👍之和 - 👎之和
                "total_votes": {"$sum": 1}
            }},
            {"$match": {"total_votes": {"$gte": 3}}}  # 至少 3 人投票才调整
        ]
        # 净分 > 0 → weight +0.05, 净分 < 0 → weight -0.05
        # 累积调整上限 ±0.3

    async def get_documents_needing_review(self, threshold: int = -5) -> list[str]:
        """净评分 < -5 的文档 → 建议策展人审查"""
```

---

<a id="sec-4"></a>
## 四、实施路线图

| 步骤 | 任务 | 产出 | 人天 |
|------|------|------|------|
| 1 | 实现反馈收集 API | `feedback_service.py` record | 0.3 |
| 2 | 实现每日聚合引擎 | `feedback.py` aggregate_daily + weight 调整 | 0.5 |
| 3 | MongoDB `search_feedback` 集合 + TTL | 90 天自动清理原始反馈 | 0.2 |
| 4 | 前端 👍👎 组件 | `SearchFeedback.vue` | 0.3 |
| 5 | RAG 检索集成 weight | 与 YK-09-06 weight 字段复用 | 0.2 |
| 6 | 策展人审查通知 | net_score < -5 → 企微通知 | 0.2 |
| 7 | 集成测试 | 反馈→聚合→权重→检索闭环 | 0.3 |

**总计：2.0d**

---

<a id="sec-5"></a>
## 五、代码审查检查清单

- [ ] 同一用户对同一 (query, doc) 的重复反馈被去重（仅保留最新）
- [ ] 每日聚合至少 3 人投票才触发权重调整
- [ ] 权重调整幅度 ±0.05/天，累积上限 ±0.3
- [ ] 反馈匿名模式不强制登录
- [ ] `search_feedback` TTL 90 天自动清理
- [ ] weight 不低于 0.1（与 YK-09-06 最低 0.2 取更低值）

---

<a id="sec-6"></a>
## 六、实现完成记录

> **状态**：需求已编写，尚未开始实施。

### 6.1 产出清单（待填充）

| 分类 | 文件 | 说明 |
|------|------|------|
| Service | `services/knowledge/feedback_service.py` | — |
| Domain | `domain/knowledge/feedback.py` | — |
| MDB 集合 | `search_feedback` | — |
| 前端 | `SearchFeedback.vue` | — |
| **合计** | **4 个文件** | — |

---

<a id="sec-7"></a>
## 七、已知缺口与技术债

### 7.1 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| 1 | 无"为什么给 👎"的原因收集 | 无法区分"文档过期"和"不相关"的 👎 | 远期：👎 后弹出可选原因选择 |
| 2 | 冷启动：新文档无反馈 | 新发布文档无反馈信号，排序依赖初始 weight | 新文档初始 weight=1.0 + 内容质量评分加成 |

### 7.2 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | IP+UA 哈希去重不精确 | P3 | 0.2 | 同一用户换网络/设备被当作不同用户 | 待实施（长期：注册用户 ID 去重） |
| 2 | 每日聚合为全量扫描 feedback 集合 | P3 | 0.1 | feedback > 10K 时可能耗时 | 待评估 |

---