---
title: Daily 每日焦点总索引
aliases: [daily-index, 每日焦点入口]
tags: [curator, daily, focus, executive]
category: curator
created: 2026-10-10
updated: 2026-10-10
last_verified: 2026-10-10
source: internal
type: index
status: active
lifecycle: active
review_cycle: daily
roles: [executive, leader, curator, sre, engineer]
benefit: 作为 curator/daily 目录的单一入口，把「焦点总控 / 今日内容 / 历史归档」三条导航路径聚合为一页，任何角色从 YiKnowledge 顶部 Nav 进入 Daily 后 ≤ 2 跳即达目标内容。
acceptance_criteria:
  - 本文件显式链接 focus-board.md（SSOT 主文件）、archive/<当日>/INDEX.md（今日内容索引）、archive/（历史归档入口）三条子路径
  - 与 README.md 的维护规则、文件格式契约保持 1:1 一致
  - 在首页点击「今日焦点」Hero Banner 时，通过 linkFactory 解析可直达本文件或 focus-board.md（按路由优先级）
related:
  - ./README.md
  - ./focus-board.md
  - ./archive/2026-10-10/INDEX.md
  - ../governance/001-治理-知识健康看板.md
  - ../../executive/roadmap/003-路线图-组织OKR追踪.md
---

# Daily 每日焦点 · 总索引

> **角色导航**：Executive → [焦点总控](./focus-board.md) · Leader → [今日追踪卡](./archive/2026-10-10/okr-tracker.md) · Engineer/SRE → [SRE 运行手册](./archive/2026-10-10/sre-runbook.md) · Curator → [维护规则](./README.md)

---

## 一、目录分层（新结构 · 生效日期 2026-10-10）

```
curator/daily/
├── INDEX.md                          ← 本文件（总入口 · 三栏导航）
├── README.md                         ← 维护规则 + 文件格式契约 + 解析区段说明
├── focus-board.md                    ← SSOT 主文件（首页 8 区段数据的唯一来源，路径稳定不变）
│
└── archive/                          ← 统一归档（当日活跃 + 历史快照，日期目录即版本）
    └── 2026-10-10/                   ← 当日活跃内容（每日 09:00 前在此目录更新）
        ├── INDEX.md                  ← 当日完成度索引（6 文档 × 6 字段）
        ├── decision-brief.md         ← 3-2-1 决策简报（3 signals / 2 decisions / 1 redline）
        ├── sre-runbook.md            ← SRE 红黄灯运行手册（每条 4 字段 Impact/Root/Mitigation/ETA）
        ├── okr-tracker.md            ← OKR 今日追踪卡（Today / Blockers / Next / Expected 四字段）
        ├── role-actions.md           ← 角色行动项 5W1H（6 角色 × 6 字段）
        └── learning-risk.md          ← 学习复盘 × 持续风险观察（3 learnings / 3 risks）
```

> **版本化策略**：`archive/<当日日期>/` 目录既是今日活跃编辑区，也是永久版本快照。每日 00:00 后新建当日日期目录，从前一日目录复制模板。EOD 后当日目录即冻结为只读历史镜像，无需额外复制操作。日期目录名携带版本语义，消除中间层冗余。

## 二、快速跳转

| 入口 | 点击直达 | 适用角色 | 最后更新 |
|------|---------|---------|---------|
| **焦点总控 SSOT** | [focus-board.md](./focus-board.md) | Executive + Leader | 2026-10-10 |
| **今日决策简报** | [archive/2026-10-10/decision-brief.md](./archive/2026-10-10/decision-brief.md) | Executive | 2026-10-10 |
| **SRE 运行手册** | [archive/2026-10-10/sre-runbook.md](./archive/2026-10-10/sre-runbook.md) | SRE + Tech Lead | 2026-10-10 |
| **OKR 追踪卡** | [archive/2026-10-10/okr-tracker.md](./archive/2026-10-10/okr-tracker.md) | All | 2026-10-10 |
| **角色行动项 5W1H** | [archive/2026-10-10/role-actions.md](./archive/2026-10-10/role-actions.md) | All 6 角色 | 2026-10-10 |
| **学习 & 风险摘要** | [archive/2026-10-10/learning-risk.md](./archive/2026-10-10/learning-risk.md) | Curator + SRE | 2026-10-10 |
| **历史归档** | [archive/2026-10-10/INDEX.md](./archive/2026-10-10/INDEX.md) | All | 2026-10-10 |

## 三、首页 YiVad 今日焦点的数据链路

```
YiVad #/home/index
   │  useDailyFocusBoard
   ▼
curator/daily/focus-board.md   ← 8 区段 YAML / Markdown 混合内容
   │
   ├─ § 今日 Hero (一)
   ├─ § SRE 运行红黄灯 (二)      →   click → archive/2026-10-10/sre-runbook.md#anchor
   ├─ § OKR 锚点追踪 (三)        →   click → archive/2026-10-10/okr-tracker.md#anchor
   ├─ § 角色化今日行动项 (四)    →   click → archive/2026-10-10/role-actions.md#anchor
   ├─ § 快速锚点 (五)
   ├─ § 3-2-1 决策摘要 (六)      →   click → archive/2026-10-10/decision-brief.md
   ├─ § 焦点延伸链接 (七)
   └─ § 可证伪性基线 (八)
```

> **路径解析策略**：首页 `resolveFocus(slug)` 按以下优先级寻找子文件：① `archive/<当日日期>/<slug>.md`（99% 命中）② `archive/<昨日日期>/<slug>.md`（首小时空档期回退）③ `curator/daily/<legacy-filename>`（过渡期 2026-11-10 前）④ fallback `curator/daily/focus-board.md`。

## 四、Curator 的 5 步每日维护流程

每日本地时间 09:00 前完成：

| # | 步骤 | 产物 | 完成标志 |
|---|-----|------|---------|
| 1 | 新建 `archive/<当日日期>/` 目录，从 `archive/<昨日日期>/` 复制 6 个文件作为模板 | `archive/YYYY-MM-DD/` 子目录 | ✅ INDEX.md 复制成功 |
| 2 | 清空模板残留内容，填写 `focus-board.md` 8 区段 YAML | 主文件更新 | ✅ updated 字段 = 今日 |
| 3 | 展开 6 子文件 ≥ 4 字段详细内容 | 6 子文件 | ✅ last_verified = 今日 |
| 4 | 锚点自检：focus-board 全部 anchor 在 `archive/<当日日期>/` 对应子文件章节存在 | 无死链 | ✅ 锚点覆盖率 100% |
| 5 | 更新 `archive/<当日日期>/INDEX.md` 6 条完成标志为 `[x]`，刷新首页 F5 | 今日完成 | ✅ 首页 8 区段内容正常渲染 |

## 五、可证伪性护栏（Falsifiability Gates）

| 护栏编号 | 主张 | 观察方式 | 回滚触发器 |
|---------|------|---------|-----------|
| DG-1 | 首页 `openAnchor(focus-board.md)` 三闸门通过率 100% | 每小时一次 linkFactory 巡检 | 1 次失败 → Curator 30 分钟内修复或回退到旧文件 |
| DG-2 | `archive/<当日>/` 下 6 个文件 + focus-board.md 共 7 个文件的 `last_verified` 字段 = 今日日期 | 首页加载时比对 | ≥ 2 个过期 → hero banner 变 warn 色 + 提示 |
| DG-3 | focus-board.md 的 8 个区段（Hero / SRE / OKR / Action / QuickAnchor / Digest / Links / Baseline）齐全 | YAML 解析器统计段数 | 缺 ≥ 1 段 → 对应区段降级为纯 issue 模式 |
| DG-4 | `archive/YYYY-MM-DD/` 目录的日期连续性（不超过 48h 无归档） | Curator 审查清单 | 连续 2 日缺失 → 触发 governance 审查 |
