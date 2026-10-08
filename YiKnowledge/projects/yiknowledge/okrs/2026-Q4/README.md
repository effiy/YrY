---
type: okr-summary
title: "YiKnowledge 2026-Q4 OKR → PRD 可追溯矩阵"
status: active
period: "2026 Q4"
project: YiKnowledge
project_id: yiknowledge
updated: 2026-10-07
benefit: "YiKnowledge 知识管理中台 Q4 升级：文档新鲜度、RAG 检索质量、治理流程四阶段跑通、47 份专业文档落地，驱动知识复用率 +50%"
acceptance_criteria:
  - "全库文档新鲜度 ≥ 95%（近 30 天更新/创建），过期文档自动进入治理收件箱"
  - "RAG 基线 MRR@5 从 当前 0.58 → +10% 达到 ≥ 0.64，Recall@10 ≥ 0.82"
  - "治理流程四阶段（收件箱→分类处理→就绪检查→归档）100% 跑通，47 份专业文档落地率 ≥ 90%"
related:
  - ../../../curator/governance/001-治理-知识健康看板.md
  - ../../../curator/governance/002-治理-治理规范.md
  - ../../../curator/governance/004-治理-就绪检查清单.md
  - ../../../curator/INDEX.md
  - ../../../aier/foundations/002-基础-RAG设计模式.md
  - ../../../product/projects/yiknowledge/002-项目-指标与度量.md
---

# YiKnowledge 2026-Q4 OKR 总览

> Q4 四大目标 → Curator 治理全链路追溯。YiKnowledge 作为 5 项目统一知识底座，聚焦新鲜度、RAG 质量、治理流程、专业文档四大落地抓手。

## 目标总览

| # | 目标 | 状态 | KR 达成 | 进度 |
|---|------|------|---------|------|
| yiknowledge-001 | 新鲜度 95% < 30 天 | ○ | 0/3 | 0% |
| yiknowledge-002 | RAG MRR@5 +10% | ○ | 0/3 | 0% |
| yiknowledge-003 | 治理流程跑通四阶段 | ○ | 0/3 | 0% |
| yiknowledge-004 | 本轮 47 份专业文档落地率 | ○ | 0/3 | 0% |

| OKR | KR-1 | KR-2 | KR-3 |
|-----|------|------|------|
| yiknowledge-001 新鲜度 95% <30天 | 全库文档（含 5 项目子库）近 30 天更新占比 ≥ 95% | 过期文档（>90 天未触碰）自动入收件箱，人工认领率 ≥ 99% | 每文档强制 updated Frontmatter，缺失即阻塞入库，扫描通过率 100% |
| yiknowledge-002 RAG MRR@5 +10% | 标准知识问答集（500 条黄金集）MRR@5 从 0.58 → ≥ 0.64，提升 +10% | Recall@10 ≥ 0.82，Top-1 准确率 ≥ 55%，冷启动场景无显著下降 | YiAi 消费方 RAG 答案引用命中率 ≥ 88%，引用页码/段落可跳 |
| yiknowledge-003 治理流程四阶段 | 收件箱→分类处理→就绪检查→归档，四阶段状态机 100% 上线 | 每阶段 SLA：收件箱 ≤ 24h、分类 ≤ 48h、就绪 ≤ 72h、归档 ≤ 7d | 治理看板（curator governance 01）实时 8 项指标，周例会 Review |
| yiknowledge-004 47 份专业文档落地 | 本轮计划 47 份：engineer(15) + product(12) + leader(10) + curator(6) + aier(4)，落地率 ≥ 90% | 每份文档 Frontmatter 15 强制字段（type/benefit/acceptance_criteria/related 等）合规率 100% | 文档引用闭环：入 RAG 索引、被 YiAi/YiVad/YiPet 实际消费占比 ≥ 70% |

## 关键指标

| 指标 | 当前值 | 目标值 | 状态 |
|------|--------|--------|------|
| 文档新鲜度（近 30 天占比） | 72% | ≥ 95% | ○ |
| 过期文档入箱认领率 | 65% | ≥ 99% | ○ |
| Frontmatter updated 扫描通过率 | 78% | 100% | ○ |
| RAG MRR@5（黄金集） | 0.58 | ≥ 0.64（+10%） | ○ |
| RAG Recall@10 | 0.70 | ≥ 0.82 | ○ |
| RAG 引用命中率（YiAi 侧） | 71% | ≥ 88% | ○ |
| 治理四阶段上线完成度 | 25% | 100% | ○ |
| 治理 SLA 达标率（四阶段） | 58% | ≥ 95% | ○ |
| 健康看板 8 项指标接入率 | 3/8 | 8/8 | ○ |
| 47 份文档落地完成数 | 0/47 | ≥ 42/47（90%） | ○ |
| Frontmatter 15 字段合规率 | 61% | 100% | ○ |
| 文档被消费（YiAi/Vad/Pet）占比 | 38% | ≥ 70% | ○ |

## OKR → PRD / Curator 追溯

| OKR | KR-1 关联文件 | KR-2 关联文件 | KR-3 关联文件 | KR-4 关联文件 | KR-5 关联文件 |
|-----|---------------|---------------|---------------|---------------|---------------|
| yiknowledge-001 新鲜度 | [01-治理-知识健康看板](../../../../curator/governance/001-治理-知识健康看板.md) | [02-治理-治理规范](../../../../curator/governance/002-治理-治理规范.md) | [03-治理-收件箱](../../../../curator/governance/003-治理-收件箱.md) | [07-治理-分类处理](../../../../curator/governance/007-治理-分类处理.md) | [08-治理-操作速查卡](../../../../curator/governance/008-治理-操作速查卡.md) |
| yiknowledge-002 RAG 质量 | [02-基础-RAG设计模式](../../../../aier/foundations/002-基础-RAG设计模式.md) | [03-平台-向量数据库选型](../../../../aier/platform/003-平台-向量数据库选型.md) | [01-检索基础体系](../../yiai/prds/2026-09/01-prd-检索基础体系.md) | [05-prd-RAG引擎](../../yiai/prds/2026-09/05-prd-RAG引擎.md) | [213-prd-RAG评估基准](../../yiai/prds/2026-09/213-prd-RAG评估基准.md) |
| yiknowledge-003 治理四阶段 | [02-治理-治理规范](../../../../curator/governance/002-治理-治理规范.md) | [03-治理-收件箱](../../../../curator/governance/003-治理-收件箱.md) | [04-治理-就绪检查清单](../../../../curator/governance/004-治理-就绪检查清单.md) | [07-治理-分类处理](../../../../curator/governance/007-治理-分类处理.md) | [01-归档-归档说明](../../../../curator/archive/001-归档-归档说明.md) |
| yiknowledge-004 47 份文档 | [01-项目-管理](../../../../product/projects/yiknowledge/001-项目-管理.md) | [02-项目-指标与度量](../../../../product/projects/yiknowledge/002-项目-指标与度量.md) | [01-模板-知识叶子模板](../../../../curator/templates/002-模板-知识叶子模板.md) | [01-治理-知识健康看板](../../../../curator/governance/001-治理-知识健康看板.md) | [04-治理-就绪检查清单](../../../../curator/governance/004-治理-就绪检查清单.md) |

## 风险矩阵

| 风险 | 影响目标 | 概率 | 综合等级 | 负责人 |
|------|---------|------|---------|--------|
| 过期文档补写无人认领，新鲜度达标压力下移至季末集中冲刺 | yiknowledge-001 | 高 | 高 | Curator Owner |
| RAG 评估黄金集覆盖窄（仅 YiAi 域），跨 5 项目泛化能力弱 | yiknowledge-002 | 中 | 高 | RAG 架构组 |
| 治理流程四阶段 SLA 执行流于形式，各项目 Owner 投入不足 | yiknowledge-003 | 高 | 高 | 治理委员会 |
| 47 份文档 Frontmatter 15 字段落地质量参差不齐，返工率 >30% | yiknowledge-004 | 中 | 中 | 文档 Review 组 |
| 索引增量更新（YiAi Watcher）延迟，新文档 24h 未入 RAG | yiknowledge-001 / 002 | 中 | 中 | 索引平台 |
| 47 份文档落地后无实际消费，沦为"库存文档" | yiknowledge-004 | 中 | 低 | 跨项目 PM |

## 目标依赖关系图

```
yiknowledge-001 (新鲜度 95% <30天) ──── 文档资产底座 ─────────────┐
  ├── Frontmatter updated 强制扫描 100%                              │
  ├── 过期文档入收件箱 + 99% 认领                                    │
  └── 全库 95% 文档 30 天内触碰 ───────────────────────────────────┤
                                                                   │
yiknowledge-002 (RAG MRR@5 +10%) ──── 检索消费质量 ───────────────┤
  ├── 黄金集 MRR@5 0.58 → 0.64 (+10%)                              │
  ├── Recall@10 ≥ 0.82 + Top-1 ≥ 55%                               ├──────┐
  └── YiAi 引用命中率 ≥ 88%                                        │      │
                                                                        │ 驱动
yiknowledge-003 (治理流程四阶段) ───── 治理流水线 ─────────────────┤      │
  ├── 收件箱→分类→就绪→归档 四阶段状态机                            │      │
  ├── 四阶段 SLA 95% 达标（24h/48h/72h/7d）                         │      │
  └── 健康看板 8 项指标 + 周 Review ──────────────────────────────┤      │
                                                                   │      │
yiknowledge-004 (47 份文档落地) ───── 专业内容资产化 ──────────────┘      │
  ├── engineer(15) + product(12) + leader(10) + curator(6) + aier(4)            │
  ├── Frontmatter 15 强制字段 100% 合规                                        ▼
  └── 70%+ 文档被 YiAi/YiVad/YiPet 消费                               统一知识复用率 +50%
```

## Owner 表

| 目标 | Owner | 备份 | 参与方 | 检查节奏 |
|------|-------|------|--------|----------|
| yiknowledge-001 新鲜度 | Curator-Lead | 5 项目 Docs Owner | 各项目 TL | 每周一 09:00 |
| yiknowledge-002 RAG 质量 | RAG-Arch-Lead | YiAi-Lead | 索引平台、QA | 每周二 14:00 |
| yiknowledge-003 治理流程 | Governance-Chair | Curator-Lead | 治理委员会 | 每周三 10:00 |
| yiknowledge-004 47 份文档 | Docs-Review-Lead | Curator-Lead | 各领域 Author | 每周四 16:00 |

## 季末复盘模板

| 维度 | 评估 | 证据 | 行动项 |
|------|------|------|--------|
| 目标达成率（%） | — | KR 实际值 / 目标值 | — |
| 新鲜度趋势（90 天） | — | 健康看板 8 项指标曲线 | — |
| RAG 质量评估报告 | — | 黄金集 MRR/Recall 前后对比 + Badcase 分析 | — |
| 治理流程 SLA 燃尽 | — | 四阶段积压 / 达标记录 | — |
| 47 份文档落地清单 | — | 完成 / 延期 / 取消 + Frontmatter 合规抽检 | — |
| 知识复用率变化 | — | YiAi/Vad/Pet 引用日志 + 消费占比 | — |
| Q1 2027 前置输入 | — | 本季经验 → 2027-Q1 100 份扩库计划初稿 | — |
