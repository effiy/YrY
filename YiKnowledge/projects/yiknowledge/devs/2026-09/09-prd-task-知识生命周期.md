---
doc_type: module
prd_task_id: "YK-09-06"
title: "YK-09-06: 知识生命周期自动化 — 开发方案"
status: 待排期
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
estimate_frontend: 3.0
source_prd: "09-自动化-知识生命周期.md"
source_okr: [yiknowledge-001]
related_tests: ["09-prd-test-知识生命周期"]
---

# YK-09-06: 知识生命周期自动化 — 开发方案

> 来源 PRD：[09-自动化-知识生命周期.md](../../prds/2026-09/09-自动化-知识生命周期.md)
> 需求编号：YK-09-06 · 优先级：P2 · 人天：3.0d · 状态：待排期
> 测试方案：[09-prd-test-知识生命周期.md](../../tests/2026-09/09-prd-test-知识生命周期.md)

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 目录

- [一、架构总览](#sec-1)
- [二、关键技术决策](#sec-2)
- [三、实现规格](#sec-3)
- [四、实施路线图](#sec-4)
- [五、技术风险](#sec-5)
- [六、实现完成记录](#sec-6)
- [七、已知缺口与技术债](#sec-7)

---

<a id="sec-1"></a>
## 一、架构总览

### 1.1 生命周期管道

```
apscheduler 每日触发
  → 扫描 knowledge_files 集合（MongoDB）
  → 检查 updated 距今天数 vs review_cycle
  → 分级处理:
      - 超过 review_cycle 1× → 降低 RAG 检索权重 0.8×
      - 超过 review_cycle 2× → 降低权重 0.5× + 策展人通知
      - 超过 review_cycle 3× → 自动标记 deprecated + 权重 0.2×
  → 更新 MongoDB knowledge_files 的 weight 字段
  → 通知策展人（企微消息）
```

### 1.2 文件清单

```
YiAi/src/
├── domain/knowledge/
│   └── lifecycle.py              # 【新增】生命周期引擎
├── services/knowledge/
│   └── lifecycle_service.py      # 【新增】生命周期 API + 定时任务
├── data/
│   └── collections/
│       └── knowledge_files       # 【修改】新增 weight 字段
```

---

<a id="sec-2"></a>
## 二、关键技术决策

### D-01：RAG 权重降级 — time-decay 函数而非硬删除

过期内容不直接从索引中移除——可能仍有历史参考价值。使用指数衰减函数 `weight = base_weight × exp(-λ × days_overdue / halflife)` 降低检索权重，而非直接剔除。用户仍可通过标签/分类过滤找到过期内容。

### D-02：review_cycle → overdue 映射

| review_cycle | 1× overdue (权重 0.8) | 2× overdue (权重 0.5) | 3× overdue (deprecated) |
|-------------|----------------------|----------------------|------------------------|
| weekly (7d) | 7 天 | 14 天 | 21 天 |
| monthly (30d) | 30 天 | 60 天 | 90 天 |
| quarterly (90d) | 90 天 | 180 天 | 270 天 |
| annual (365d) | 365 天 | 730 天 | 1095 天 |

### D-03：审核周期而非固定阈值

不同文档有不同的审核周期（`review_cycle` frontmatter 字段），过期判定应基于该文档自身周期而非全局固定天数。战略文档（annual）的过期时间远长于周报（weekly）。

---

<a id="sec-3"></a>
## 三、实现规格

### 3.1 生命周期引擎

```python
# domain/knowledge/lifecycle.py

WEIGHT_DECAY = {
    1.0: 0.8,   # 1× overdue: 轻微降权
    2.0: 0.5,   # 2× overdue: 明显降权
    3.0: 0.2,   # 3× overdue: 严重降权 + 标记 deprecated
}

CYCLE_DAYS = {
    "weekly": 7, "monthly": 30,
    "quarterly": 90, "annual": 365,
}

class LifecycleEngine:
    def get_overdue_ratio(self, doc: dict) -> float:
        """返回 overdue 倍数：days_since_update / review_cycle_days"""
        days = (datetime.now() - doc["updated"]).days
        cycle_days = CYCLE_DAYS.get(doc.get("review_cycle", "quarterly"), 90)
        return days / cycle_days if cycle_days > 0 else 0

    def get_decayed_weight(self, doc: dict) -> float:
        ratio = self.get_overdue_ratio(doc)
        base = doc.get("weight", 1.0)
        if ratio < 1.0:
            return base
        for threshold, decay in sorted(WEIGHT_DECAY.items(), reverse=True):
            if ratio >= threshold:
                return base * decay
        return base

    def get_recommended_action(self, doc: dict) -> str:
        ratio = self.get_overdue_ratio(doc)
        if ratio >= 3.0: return "deprecate"
        if ratio >= 2.0: return "notify_curator"
        if ratio >= 1.0: return "degrade_weight"
        return "none"
```

### 3.2 定时任务

```python
# services/knowledge/lifecycle_service.py

async def daily_lifecycle_scan():
    """每日凌晨执行：扫描 knowledge_files，更新权重和状态"""
    engine = LifecycleEngine()
    docs = await knowledge_files.find({}).to_list(None)
    alerts = []

    for doc in docs:
        action = engine.get_recommended_action(doc)
        new_weight = engine.get_decayed_weight(doc)

        if action == "deprecate":
            await knowledge_files.update_one(
                {"_id": doc["_id"]},
                {"$set": {"weight": new_weight, "lifecycle": "deprecated"}}
            )
            alerts.append(f"📦 {doc['path']} 已自动标记为 deprecated（{engine.get_overdue_ratio(doc):.1f}× overdue）")
        elif action == "notify_curator":
            await knowledge_files.update_one(
                {"_id": doc["_id"]},
                {"$set": {"weight": new_weight}}
            )
            alerts.append(f"⚠️ {doc['path']} 已过期 {engine.get_overdue_ratio(doc):.1f}× review_cycle")
        elif action == "degrade_weight":
            await knowledge_files.update_one(
                {"_id": doc["_id"]},
                {"$set": {"weight": new_weight}}
            )

    if alerts:
        await send_wework_notification("知识生命周期日报", alerts[:20])  # 最多 20 条
```

---

<a id="sec-4"></a>
## 四、实施路线图

| 步骤 | 任务 | 产出 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 实现 LifecycleEngine | `lifecycle.py`（overdue_ratio + decay + action） | 单元测试：各周期/天数组合 | 0.5 |
| 2 | 实现定时扫描任务 | `lifecycle_service.py`（apscheduler 每日） | 模拟过期数据 → 权重降级 | 0.5 |
| 3 | MongoDB weight 字段 + 索引 | `knowledge_files` schema 更新 | weight 字段默认 1.0 | 0.3 |
| 4 | RAG 检索集成 weight | `engine.py` 检索时应用 weight 排序 | 过期文档排名下降 | 0.5 |
| 5 | 企微通知 | 策展人收到过期文档列表 | 通知格式正确 | 0.3 |
| 6 | 策展人面板 | 前端过期文档列表 + 手动操作 | 归档/延期/更新 | 0.5 |
| 7 | 集成测试 | 全链路过期→降权→通知 | 端到端 | 0.4 |

**总计：3.0d**

---

<a id="sec-5"></a>
## 五、技术风险

| 风险 | 概率 | 影响 | 缓解措施 | 应急预案 |
|------|------|------|---------|---------|
| 权重降级过度导致检索质量下降 | 中 | 中 | 仅降至最低 0.2（不降至 0） | 策展人可手动恢复权重 |
| 缺少 review_cycle 的文档被误处理 | 中 | 低 | 默认 quarterly（90 天） | 首次扫描仅报告不降权 |

---

<a id="sec-6"></a>
## 六、实现完成记录

> **状态**：待排期。

### 6.1 产出清单（待填充）

| 分类 | 文件 | 说明 |
|------|------|------|
| 生命周期引擎 | `domain/knowledge/lifecycle.py` | — |
| Service | `services/knowledge/lifecycle_service.py` | — |
| MDB 更新 | `knowledge_files` +weight 字段 | — |
| RAG 集成 | `engine.py` 修改 | — |
| **合计** | **4 个文件** | — |

---

<a id="sec-7"></a>
## 七、已知缺口与技术债

### 7.1 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| 1 | 策展人面板未开发 | 策展人无法手动干预自动化决策（恢复权重/延期审核/强制归档） | 阶段二前端开发 |
| 2 | superseded 检测 | 仅处理过期，不检测"被新文档替代"（superseded） | 需要人工标记 `superseded` + `related` 指向新文档 |

### 7.2 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | 权重降级函数未 AB 测试 | P2 | 0.3 | decay 参数（0.8/0.5/0.2）基于经验设定 | 待实施 |
| 2 | 每日扫描全量 knowledge_files 可能耗时 | P3 | 0.2 | 800 文档全量扫描 < 1s | 待实施（仅扫描 overdue 文档：`updated < cutoff` 查询） |

---