---
doc_type: module
prd_task_id: "YA-09-79"
title: "YA-09-79: 限流令牌预热 — 历史流量模式预分配 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "86-需求-限流令牌预热.md"
source_okr: [yiai-002]
---

# YA-09-79: 限流令牌预热 — 历史流量模式预分配 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[86-需求-限流令牌预热.md](../../prds/2026-09/86-需求-限流令牌预热.md)
> 需求编号：YA-09-79 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

冷启动时令牌桶为空，首批请求可能被误限。根据历史同时段流量预填充令牌。

```python
class WarmupTokenBucket(TokenBucket):
    def __init__(self, *args, history_window: int = 3600):
        super().__init__(*args)
        self.history = self._load_history()  # 从 Redis 加载

    def warmup(self):
        """启动时根据历史流量预填充"""
        hour = datetime.now().hour
        avg_rate = self.history.get(hour, self.rate)
        self.tokens = min(self.burst, int(avg_rate * 0.3))  # 30% 预填充
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 历史流量采集 + 预填充 | 冷启动首批请求不限 | 0.25 |
| 2 | 自适应调整 + 测试 | 异常流量不预填充 | 0.25 |

**合计：0.5d**。