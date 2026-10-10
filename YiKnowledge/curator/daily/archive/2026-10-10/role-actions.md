---
title: 角色行动项详情
aliases: [role-action-detail, 角色行动项, actions-brief, role-actions, 005-今日焦点-角色行动项详情]
tags: [actions, role, daily, focus]
category: curator
date: 2026-10-10
created: 2026-10-10
updated: 2026-10-10
last_verified: 2026-10-10
source: internal
type: action
status: active
lifecycle: active
review_cycle: daily
roles: [executive, leader, engineer, sre, curator, aier]
benefit: 6 大核心角色 × 今日行动项的「5W1H」展开，首页行动列表点击 → 预览弹框 → 跳转本文件对应章节，让行动项具备可执行的上下文。
acceptance_criteria:
  - 与 focus-board.md 的 actions 数组严格 6:6 对齐
  - 每条行动项含 what / why / how / who / when / where 六个字段结构化展开
related:
  - ../focus-board.md
  - ./INDEX.md
  - ../../executive/strategy/020-战略-委托授权框架.md
---

# 角色行动项详情（Role Action Detail · 2026-10-10）

> 六大核心角色 × 今日 1 件最优先事的 5W1H 展开。优先级：`p0` 必须在 EOD 前关闭，`p1` 必须在 EOD 前进入 in_review，`p2` 允许跨日但需在今日下午 15:00 前产出可复核的快照。

---

## Executive (CEO) · P0 · TODO

| 字段 | 内容 |
|------|------|
| **What（做什么）** | 对 exec-002「经营战略与组织路线」的 at_risk 判定 → 输出一页决策三角（原则 / 方法 / 反模式），并决定 exec-002 在今日 18:00 时点的最终处置：保持 at_risk 或升级为 off_track 或降级为 active |
| **Why（为什么重要）** | 组织规划完备度（KR4）是 Q3→Q4 衔接窗口的先决条件：① 预算计划依赖 Head-of-People 编制模型 ② 招聘节奏依赖职级矩阵 ③ 下一财年 OKR 设计依赖组织结构。若拖到 10-15 之后，三条链都会同步漂移 |
| **How（怎么做）** | 1. 读取 [高管决策框架](../../executive/strategy/018-战略-高管决策框架.md) 的决策三角模板 2. 对照 exec-002 的 KR2（战略框架落地数）与 KR4（组织规划完备度）现状 3. 输出 3 条 So-What：对 budget / hiring / roadmap 各自的具体决策 |
| **Who（谁）** | 主导：CEO · 协同：Tech Lead（提供 KB 正则修复进展快照）、Curator（产出 exec-002 KR4 对比页） |
| **When（截止）** | 方案草稿 **12:00 前**、最终拍板 **18:00 前**、落地写入 goal.md **20:00 前** |
| **Where（产出锚点）** | [018-战略-高管决策框架](../../executive/strategy/018-战略-高管决策框架.md) + [exec-002 goal](../../executive/okr/2026-Q3/exec-002-经营战略与组织路线/goal.md) |

---

## Tech Lead · P0 · IN_PROGRESS

| 字段 | 内容 |
|------|------|
| **What（做什么）** | `kbExtractOkrRef` 正则对 `exec-NNN-NN` 三段式的覆盖率修复：① 正例 12 条 ② 反例 4 条 ③ 边界 2 条 → 合入 main 前匹配率 ≥ 96% |
| **Why（为什么重要）** | 阅读清单仪表盘 okr=0 统计异常若不根治，OKR 追踪全链路会系统性失真：exec-002、exec-003、lead-002 三个 at_risk / active 的 OKR 会被持续显示为 0 覆盖，导致决策面板误导 |
| **How（怎么做）** | 1. 在 `readingList.vue` 相关的正则提取逻辑上新增对 `exec-NNN-NN`、`lead-NNN-NN`、`cur-NNN-NN` 三种三段式的一致匹配 2. 单测文件 `utils/kbExtractOkrRef.spec.ts` 编写 18 条用例 3. PR 关联 loop-001 的 code-review 阶段并走 5 步验证法 |
| **Who（谁）** | 主导：Tech Lead · 协同：Engineer（review 单测可读性）、Curator（提供 12 条真实 goal 路径） |
| **When（截止）** | 单测初稿 **11:00 前**、实现补丁 **14:00 前**、PR 合入 main **18:00 前** |
| **Where（产出锚点）** | [012-架构-数据模型设计原则](../../leader/architecture/012-架构-数据模型设计原则.md) + [阅读清单 SSOT](../../executive/reading-list/001-阅读-阅读清单.md) |

---

## Engineer · P1 · IN_PROGRESS

| 字段 | 内容 |
|------|------|
| **What（做什么）** | YiVad 首页 Today's Focus 从 YiKnowledge/curator/daily/focus-board.md 读取并渲染 hero/SRE/OKR/action 四区；新增 digest（3-2-1 决策简报）与 focus-links（今日补充锚点）两个新区块；所有锚点必须走 KnowledgePreviewDialog |
| **Why（为什么重要）** | 纯 issue 列表只能给「现象快照」，战略面板才能让全团队每天对齐同一套优先级；加上 digest 3-2-1 摘要后，首页今日 ≤ 30 秒扫完即可知道今天做什么 |
| **How（怎么做）** | 1. 升级 `useDailyFocusBoard.ts` 新增 2 个区块解析：`daily_digest`（signals/decisions/redlines）与 `focus_links`（label/anchor/role） 2. 升级 `views/home/index.vue` 模板 + 样式 + 事件 3. 所有锚点点击 → 统一 `openFocusAnchor` → `previewDlg.open` 或 `previewDlg.openRaw` → 走 linkFactory 三关 |
| **Who（谁）** | 主导：Engineer · 协同：Tech Lead（review 可证伪性基线 4 条）、SRE（review LCP 指标未超红线） |
| **When（截止）** | 代码完成 **15:00 前**、本地 LCP p95 测量（10 次） **16:00 前**、E2E 冒烟自测 **17:00 前** |
| **Where（产出锚点）** | [home/index.vue](../../YiVad/src/views/home/index.vue) · [useDailyFocusBoard.ts](../../YiVad/src/hooks/useDailyFocusBoard.ts) |

---

## SRE · P1 · TODO

| 字段 | 内容 |
|------|------|
| **What（做什么）** | YiPot 体积切片 + YiVad LCP p95 采集脚本，输出到 sre/QUICKREF 的「性能」段，附两组 p95 数据（至少 10 次测量均值，不以主观感受作为基准） |
| **Why（为什么重要）** | 18MB / 2.0s 两条红线若无持续基线就无法触发 L1-L5 回滚；一旦 release 体积超限或首页回归性变慢，只能"靠感受"判断，无法做可证伪的拦截 |
| **How（怎么做）** | 1. YiPot：写 `scripts/size-baseline.sh` 做 3 次 release 切片对照 2. YiVad：写 `scripts/lcp-baseline.mjs` 用 Playwright 测 `/home/index` + `/knowledge/executive/okr` + `/knowledge/executive/readingList` 三个页 3. 结果写入 [sre QUICKREF](../../sre/QUICKREF.md)「性能」段并附测量方法、样本数、日期 |
| **Who（谁）** | 主导：SRE · 协同：Platform Owner（YiPot 体积验证）、Tech Lead（YiVad LCP 阈值确认） |
| **When（截止）** | 脚本草稿 **14:00 前**、首版基线数据 **20:00 前**、写入 QUICKREF **10-11 10:00 前** |
| **Where（产出锚点）** | [sre QUICKREF](../../sre/QUICKREF.md) · [Runbook模板](../../leader/risk/007-风险-Runbook模板.md) |

---

## Curator · P1 · TODO

| 字段 | 内容 |
|------|------|
| **What（做什么）** | 把 curator/daily 加入 governance 审查清单，每日 EOD 22:00 前由 Curator 更新一次 focus-board.md 的 hero/must_do_one/SRE 级别/action 状态 4 个字段，并走治理审查 |
| **Why（为什么重要）** | 今日焦点文件若过期 48h，首页 hero 与 SRE 状态就会误导决策 → 高管基于过时信号拍板 → 执行层漂移 → 3 天后才被发现；这是「战略面板」模式最大的系统性风险 |
| **How（怎么做）** | 1. 在 [就绪检查清单](../../curator/governance/004-治理-就绪检查清单.md) 新增 checklist：「Curator Daily EOD 四字段更新 + 锚点可点击率抽查 5 条」 2. 在 [治理审查日志](../../curator/governance/005-治理-审查日志.md) 加一个日常条目 3. 首班由 Curator 本人做并附 EOD 截图 |
| **Who（谁）** | 主导：Curator · 协同：Executive（抽查结果）、SRE（提供 429 数据同步） |
| **When（截止）** | 清单项写入 **12:00 前**、首次 EOD 更新 **今日 22:00 前** |
| **Where（产出锚点）** | [治理-就绪检查清单](../../curator/governance/004-治理-就绪检查清单.md) · [治理-审查日志](../../curator/governance/005-治理-审查日志.md) |

---

## AI Eng (aier) · P2 · TODO

| 字段 | 内容 |
|------|------|
| **What（做什么）** | 嵌入节流 3000ms 后 RAG Recall@5 回归测试：用 yiAi smoke runbook 在 20 条已知 query 上跑节流前/节流后两组数据，附 p95 latency |
| **Why（为什么重要）** | 节流过猛会牺牲召回；必须每日用 smoke 数据对召回率打一次勾，否则 SRE-003「CLEAR」的判断会成为假阳性 |
| **How（怎么做）** | 1. 在 [yiAi smoke runbook](../../aier/INDEX.md) 找到「Recall 基线」段 2. 用 `--throttle=3000` 和 `--throttle=1000` 各跑一次 3. 输出 Recall@1/@5/@10 + p50/p95 latency 对比表 4. 若 Recall@5 下降 > 5%，通知 SRE 做 L2 回滚（throttle → 2000ms + batch_size 128） |
| **Who（谁）** | 主导：AI Eng · 协同：SRE（审查是否触发回滚阈值）、Curator（结果写入阅读清单 §5 蒸馏追踪） |
| **When（截止）** | 两组数据 **15:00 前**、结论写入 INDEX **17:00 前**、必要回滚执行 **18:00 前** |
| **Where（产出锚点）** | [aier INDEX](../../aier/INDEX.md) · [知识健康看板](../../curator/governance/001-治理-知识健康看板.md) |
