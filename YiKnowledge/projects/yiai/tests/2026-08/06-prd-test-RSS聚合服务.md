---
doc_type: test
title: "YA-08-06: RSS 聚合服务 — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-06"
source_prds: ["06-需求-RSS聚合服务"]
source_modules: ["06-prd-task-RSS聚合服务"]
source_okr: [yiai-001]
---

# YA-08-06: RSS 聚合服务 — 测试规格

> 来源 PRD：[06-需求-RSS聚合服务.md](../../prds/2026-08/06-需求-RSS聚合服务.md)
> 开发方案：[06-prd-task-RSS聚合服务.md](../../devs/2026-08/06-prd-task-RSS聚合服务.md)
> 需求编号：YA-08-06 · 优先级：P1

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 RSS/Atom 解析、定时调度、去重、Dashboard API。

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-RS-01 | RSS 2.0 解析 | 提取 title/link/description/pubDate |
| UT-RS-02 | Atom 解析 | 提取 entry 列表 |
| UT-RS-03 | 相同 GUID 去重 | 第 2 次入库被跳过 |
| UT-RS-04 | Feed 源不可达 | WARN 日志 + 不中断其他源 |
| UT-RS-05 | XML 格式错误 | feedparser 容错 / 跳过 |
| UT-RS-06 | apscheduler 定时触发 | 按配置间隔自动执行 |

---

## 二、集成测试

| 编号 | 场景 | 预期 |
|------|------|------|
| IT-RS-01 | 抓取→存储→Dashboard API | Dashboard 返回抓取到的条目 |
| IT-RS-02 | 并发抓取多源 | asyncio.gather 并行，单源串行 |

---

## 三、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | Feed 解析异常导致调度器任务终止 |
| S2 — 一般 | 去重失效 → 重复条目入库 |

---