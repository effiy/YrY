---
doc_type: module
prd_task_id: "YA-09-91"
title: "YA-09-91: RSS 调度优化 — 自适应轮询 + 内容去重 + 健康监控 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "23-需求-RSS抓取调度优化.md"
source_okr: [yiai-001]
---

# YA-09-91: RSS 调度优化 — 自适应轮询 + 内容去重 + 健康监控 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[23-需求-RSS抓取调度优化.md](../../prds/2026-09/23-需求-RSS抓取调度优化.md)
> 需求编号：YA-09-91 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

固定间隔抓取 RSS 对更新频繁和低频源都不合理。自适应轮询：高频源缩短间隔，低频源延长，失效源暂停。

```python
class AdaptiveRSSScheduler:
    def adjust_interval(self, feed: dict):
        if feed["consecutive_failures"] >= 5:
            return 86400  # 失效源: 24h
        avg_posts_per_day = feed.get("avg_posts_per_day", 1)
        if avg_posts_per_day > 10: return 300   # 高频: 5min
        if avg_posts_per_day > 1:  return 1800  # 中频: 30min
        return 7200  # 低频: 2h

    async def deduplicate(self, entries: list[dict]) -> list[dict]:
        """基于 guid + content hash 去重"""
        seen = set()
        new_entries = []
        for entry in entries:
            key = entry.get("guid") or hashlib.md5(entry.get("content", "").encode()).hexdigest()
            if key not in seen:
                seen.add(key)
                new_entries.append(entry)
        return new_entries
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 自适应间隔 + 去重 | 高频源 5min，低频源 2h | 0.5 |
| 2 | 健康监控 + Dead feed 检测 + 测试 | 失效源自动暂停 | 0.5 |

**合计：1.0d**。