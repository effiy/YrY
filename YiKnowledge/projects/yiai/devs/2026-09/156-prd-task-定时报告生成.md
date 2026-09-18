---
doc_type: module
prd_task_id: "YA-09-123"
title: "YA-09-123: 定时报告生成 — Jinja2 渲染 + 企微/邮件投递 — 开发方案"
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
source_prd: "156-需求-定时报告生成.md"
source_okr: [yiai-001]
---

# YA-09-123: 定时报告生成 — Jinja2 渲染 + 企微/邮件投递 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[156-需求-定时报告生成.md](../../prds/2026-09/156-需求-定时报告生成.md)
> 需求编号：YA-09-123 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

```python
async def generate_weekly_report():
    data = await aggregate_weekly_stats()  # 从 Dashboard 快照读取
    html = env.get_template("weekly_report.html").render(**data)
    await asyncio.gather(
        send_email("team@yiai.dev", "周报", html),
        send_wework(f"## 本周摘要\n{data['summary']}"),
    )

scheduler.add_job(generate_weekly_report, "cron", day_of_week="mon", hour=9)
```

报告类型: 周报（会话量/Token 消耗/活跃用户）、月报（成本趋势/模型对比）、Bug 汇总

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | Jinja2 模板 + 数据聚合 | HTML/Markdown 报告生成 | 0.25 |
| 2 | 定时调度 + 双通道投递 + 测试 | 周一 9 点收到报告 | 0.25 |

**合计：0.5d**。