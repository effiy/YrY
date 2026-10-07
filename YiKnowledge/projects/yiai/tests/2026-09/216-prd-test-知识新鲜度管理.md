---

doc_type: test
title: "YA-09-216: 知识新鲜度管理 — 文档过时评分、自动重索引更新内容、新鲜度感知检索增强、新鲜度仪表盘、过时内容告警 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-216"
source_prds: ["216-需求-知识新鲜度管理"]
source_modules: ["216-prd-task-知识新鲜度管理"]
source_okr: [yiai-001]

type: test
---

# YA-09-216: 知识新鲜度管理 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY），覆盖多因子过时评分（时间/稳定性/引用/审查）、内容哈希重索引、新鲜度增强检索重排序、级联引用更新、分类阈值、仪表盘。

> 来源 PRD：[216-需求-知识新鲜度管理.md](../../prds/2026-09/216-需求-知识新鲜度管理.md)
> 需求编号：YA-09-216 · 优先级：P2 · 人天：0.3d

---

<a id="sec-1"></a>
## 一、测试范围与策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | StalenessCalculator 四因子加权、FreshnessLevel 分类、CATEGORY_THRESHOLDS 配置 | 45% |
| 集成测试 | pytest + httpx | FreshnessBooster 检索重排序、FreshnessDashboard API、FreshnessAwareReindexer 级联更新 | 35% |
| 数据验证 | pytest + motor | knowledge_files 新鲜度字段索引、freshness_history 日快照 | 20% |

**测试目标**：四因子加权聚合正确、boost 因子范围 [0.5, 1.2]、级联深度限制 3 层、仪表盘聚合 < 100ms。

---

<a id="sec-2"></a>
## 二、测试数据与前置条件

**测试数据**：`tests/fixtures/freshness/` 下 20 个模拟文档（不同 category、不同 updated 日期、含交叉引用关系）。

**前置条件**：MongoDB `knowledge_files` 集合含 `staleness_score`/`freshness_level` 字段索引，`freshness_history` 集合已创建。

---

<a id="sec-3"></a>
## 三、测试用例

| # | 场景 | 输入 | 步骤 | 预期结果 | 优先级 |
|---|------|------|------|----------|--------|
| 1 | 新鲜文档评分 | arch doc, updated=3天前, verified | 计算过时评分 | staleness_score < 10, freshness_level=FRESH | P0 |
| 2 | 严重过时文档评分 | doc updated=200天前, content 未变化, 引用 stale 文档 | 计算过时评分 | staleness_score > 80, freshness_level=VERY_STALE | P0 |
| 3 | 四因子加权验证 | 修改权重时间=0.4/稳定性=0.3/引用=0.2/审查=0.1 | 加权聚合 | freshness = 0.4*t + 0.3*s + 0.2*r + 0.1*v | P1 |
| 4 | 内容哈希避免无效重索引 | mtime 变化但 SHA-256 相同 | 监视器轮询检测 | 跳过重索引，仅更新 mtime | P0 |
| 5 | 新鲜度 boost 重排序 | 文档A similarity=0.85 VERY_STALE, 文档B similarity=0.80 FRESH | FreshnessBooster | B 排第一（0.96 > 0.425），A 标注 🔴 严重过时 | P0 |
| 6 | 文档更新后级联重算 | 文档A 被 B/C/D 引用，A 内容更新 | 触发 on_content_updated | B/C/D 的引用新鲜度自动重新计算，级联深度 ≤ 3 | P1 |
| 7 | 循环引用保护 | A 引用 B，B 引用 A（双向引用） | 触发更新 | _cascade_visited set 阻止无限循环 | P0 |
| 8 | 仪表盘概览 API | 500 个文档含各类新鲜度 | GET /api/freshness/overview | 返回按 level 分布、avg_staleness、stale_pct | P1 |
| 9 | Top-N 过时文档 | limit=10 | GET /api/freshness/top-stale | 返回 staleness_score 降序 Top-10，含 path/title/staleness | P1 |
| 10 | 分类阈值自定义 | category="项目/前端/需求" fresh_days=15 | 使用自定义阈值 | 15 天后开始视为 stale（而非默认 60 天） | P1 |
| 11 | 过时告警触发 | 某 category stale_pct > 30% | 检查告警规则 | 触发 INFO 告警，含分类名、过时比例、Top-3 过时文档 | P2 |
| 12 | frontmatter 日期解析兼容 | updated = "2026-01-15"（字符串） | 解析 updated | 正确识别为 Unix 时间戳，非数字格式时回退到 mtime | P1 |

---

<a id="sec-4"></a>
## 四、边界与异常测试

| # | 场景 | 输入 | 预期结果 |
|---|------|------|----------|
| E1 | 文档无 frontmatter.updated | doc 无 updated 字段 | 回退到文件 mtime，不抛异常 |
| E2 | 批量 SHA-256 不阻塞事件循环 | 100 个文件同时变更 | 计算放入 run_in_executor 线程池，每轮最多 50 个 |
| E3 | default 阈值文档比例 > 20% | 大量 unknown category 文档 | 触发提示告警建议添加新分类阈值 |
| E4 | RAG 检索结果均无新鲜度字段 | freshness_map 全部缺失 | boost = 1.0（不增强也不削弱），不抛异常 |

---

<a id="sec-5"></a>
## 五、回归测试

| # | 场景 | 验证方法 |
|---|------|----------|
| R1 | FreshnessBoost 不影响 MRR | 在 RAG 基准评估中对比有无 boost 的结果，验证 MRR 不显著下降 |
| R2 | MongoDB 批量查询性能 | 50 个检索结果用单次 `$in` 查询获取新鲜度（非逐个查询），验证延迟 < 10ms |

---

<a id="sec-6"></a>
## 六、可追溯性矩阵

| 测试用例 | 覆盖 PRD 场景 | 覆盖模块 |
|----------|-------------|----------|
| TC-1, TC-2, TC-3 | 场景 1: 过时评分计算 | calculator.py |
| TC-4 | 场景 3: 内容哈希避免无效重索引 | reindexer.py |
| TC-5 | 场景 2: 新鲜度增强检索重排序 | booster.py |
| TC-6, TC-7 | 场景 6: 文档更新后级联重算 | reindexer.py |
| TC-8, TC-9 | 场景 4: 新鲜度仪表盘概览 | dashboard.py |
| TC-10 | N/A: 分类阈值可配置 | models.py, config |
| TC-11 | 场景 5: 过时内容告警 | alerter.py |
| TC-12 | 回归预测 #3: frontmatter 日期解析 | calculator.py |

---

<a id="sec-7"></a>
## 七、覆盖率缺口

| 缺口 | 原因 | 优先级 |
|------|------|--------|
| 自适应阈值（90 天运行后自动调整） | 需长时间运行数据 | P3 |
| 大规模级联引用更新性能（1000+ 引用） | 需构造复杂引用图数据 | P2 |
| 用户反馈"仍相关"对新鲜度的影响 | 需 YiVad 前端 UI 配合 | P3 |