---
title: 每日焦点目录说明
aliases: [daily-folder, 每日焦点]
tags: [curator, daily, focus]
category: curator
created: 2026-10-10
updated: 2026-10-10
last_verified: 2026-10-10
source: internal
type: summary
status: active
lifecycle: active
review_cycle: weekly
roles: [curator]
benefit: 首页「今日焦点」的数据来源目录，所有战略行动项、SRE 状态、OKR 锚点均在此目录内版本化管理。README 是「目录治理规则 + 文件格式契约」的唯一权威来源，任何文件格式变更必先修改本文件再落地。
acceptance_criteria:
  - focus-board.md 作为每日首页 hero/SRE/OKR/actions 四区的单一事实来源 (SSOT)，路径永久稳定不变
  - 首页 home/index.vue 通过 YiAi 的 /knowledge-read 接口读取本目录文件并渲染，路径解析按 archive/<当日日期>/ → archive/<昨日日期>/ → legacy 三级回退
  - 任何内容变更都通过 git 记录，可审计、可回滚
  - 本文件的「区段契约」表与 useDailyFocusBoard.ts 的区段解析器 1:1 同步
related:
  - ./INDEX.md
  - ./focus-board.md
  - ../governance/001-治理-知识健康看板.md
---

# Daily 目录 — 每日焦点数据来源

> 首页 `#/home/index` 顶部「今日焦点」区的单一事实来源。

## 目录分层结构（2026-10-10 起生效）

```
curator/daily/
├── README.md                          ← 本文件（维护规则 + 文件格式契约 + 区段解析表）
├── INDEX.md                           ← 目录入口（两栏导航：SSOT 主文件 / 历史归档）
├── focus-board.md                     ← ★ SSOT 主文件（首页 8 区段数据来源，路径永久不变）
│
└── archive/                           ← 统一归档（今日活跃 + 历史快照，日期目录即版本）
    ├── 2026-10-10/                    ← 当日活跃内容（每日 09:00 前在此更新）
    │   ├── INDEX.md                   ← 当日完成度索引（6 文档 × 6 字段）
    │   ├── decision-brief.md          ← 3-2-1 决策简报（3 signals / 2 decisions / 1 redline）
    │   ├── sre-runbook.md             ← SRE 红黄灯运行手册（4 字段 Impact/Root/Mitigation/ETA）
    │   ├── okr-tracker.md             ← OKR 今日追踪卡（4 字段 Today/Blockers/Next/Expected）
    │   ├── role-actions.md            ← 角色行动项 5W1H（6 角色 × 6 字段）
    │   └── learning-risk.md           ← 学习复盘 × 持续风险观察（3 learnings / 3 risks）
    └── 2026-10-09/                    ← 历史快照（EOD 自动冻结，只读）
        └── ...
```

> **版本化策略**：`archive/<当日日期>/` 目录既是今日活跃编辑区，也是永久版本快照。每日 00:00 后新建当日日期目录，从前一日目录复制模板。EOD 后当日目录即冻结为只读历史镜像，无需额外复制操作。日期目录名携带版本语义，消除 today/ 中间层冗余。

## 6 文件格式契约

| 文件 | slug | 结构字段数 | 严格数量约束 | 首页 UI 对应 |
|------|------|----------|-------------|-------------|
| focus-board.md | `_` (SSOT) | 8 区段 | 区段数 = 8 | 今日焦点 8 个板块 |
| decision-brief.md | `decision-brief` | signals(3) + decisions(2) + redlines(1) + gates(4) | S/D/R 严格 3/2/1 | 3-2-1 决策摘要条 |
| sre-runbook.md | `sre-runbook` | id × 4 字段 | 条数 = focus-board.sre_status.items.length | SRE 状态灯卡片 |
| okr-tracker.md | `okr-tracker` | id × 4 字段 | 条数 = focus-board.okr_trackers.length | OKR 追踪 ActivityRow |
| role-actions.md | `role-actions` | role × 6 字段 (5W1H) | 条数 = focus-board.actions.length（通常 6） | 角色行动 ActivityRow |
| learning-risk.md | `learning-risk` | 3 learnings × 3 字段 + 3 risks × 4 字段 | 严格 3/3 | 延伸链接深入阅读 |

## 主文件契约（focus-board.md）

首页解析器按以下区段读取；若缺失对应区段则 UI 降级显示：

| 区段 | 解析方式 | UI 对应 |
|---|---|---|
| `## 一、今日 Hero` | 正则取 `- **hero**`:、`- **must_do_one**`:、`- **narrative**`: | 顶部 hero 横幅 + 叙事 |
| `## 二、SRE 运行红黄灯` | 抓取 ` ```yaml ` 内 `sre_status` 对象（level、items[]） | SRE 状态灯矩阵 |
| `## 三、OKR 锚点追踪` | 抓取 yaml `okr_trackers[]`（id/title/progress/status/anchor 等） | OKR 追踪卡片 |
| `## 四、角色化今日行动项` | 抓取 yaml `actions[]`（role/title/why/anchor/status/priority） | 角色行动卡片 |
| `## 五、快速锚点` | 抓取 yaml `quick_anchors[]`（label/anchor/role） | 顶部快捷锚点胶囊 |
| `## 六、每日决策 3-2-1 摘要` | 抓取 yaml `daily_digest`（signals[3]/decisions[2]/redlines[1] + summary_file） | 3-2-1 决策胶囊条 |
| `## 七、焦点延伸链接` | 抓取 yaml `focus_links[]`（group/title/anchor/role） | 底部「深入阅读 / 推进锚点」两栏 |
| `## 八、可证伪性基线` | 表格非结构化展示，用于 hover tooltip 与异常提示 | hover 说明 + hero 侧告警 |

## 路径解析策略（三级回退）

首页 `resolveFocus(slug)` 按以下优先级定位 daily 子内容：

```
优先级 1 → curator/daily/archive/<当日日期>/<slug>.md     # 当日活跃（99% 命中）
优先级 2 → curator/daily/archive/<昨日日期>/<slug>.md     # 前一日归档（首小时空档期回退）
优先级 3 → curator/daily/<legacy-filename>.md             # 兼容旧文件（过渡期 30 天，2026-11-10 前）
fallback → curator/daily/focus-board.md                   # 终极兜底，不应该走到
```

slug 字典（唯一 → 稳定，不可重命名）：

| slug | 用途 |
|------|------|
| `sreDetail` | SRE 运行手册 · 对应 archive/<当日>/sre-runbook.md |
| `okrTracker` | OKR 追踪卡 · 对应 archive/<当日>/okr-tracker.md |
| `roleActions` | 角色行动项 · 对应 archive/<当日>/role-actions.md |
| `digest` | 决策简报 · 对应 archive/<当日>/decision-brief.md |
| `learnRisk` | 学习风险摘要 · 对应 archive/<当日>/learning-risk.md |

## 维护规则

### 每日启动 5 步流程
1. 新建 `archive/<当日日期>/` 目录，从 `archive/<昨日日期>/` 复制 6 个文件作为模板。
2. 清空模板残留内容，填写 `focus-board.md` 8 区段 YAML。
3. 展开 6 子文件 ≥ 4 字段详细内容。
4. 锚点自检：focus-board 全部 anchor 在 `archive/<当日日期>/` 对应子文件章节存在。
5. 更新 `archive/<当日日期>/INDEX.md` 6 条完成标志为 `[x]`，刷新首页 F5。

### 命名 & 内容规则
1. **日期后缀零出现**：`archive/<date>/` 内的文件名 **不再带日期后缀**（旧命名 `002-今日焦点-决策简报-2026-10-10.md` 模式全面废弃）；日期由父目录名携带。
2. **slugs 唯一不变**：decision-brief / sre-runbook / okr-tracker / role-actions / learning-risk 五个 slug 永久保留，不做语义重命名。
3. **anchor 章节 id 稳定**：`exec-001`、`SRE-001`、`#executive-ceo--p0--todo` 等锚点 id 跨日沿用，便于首页点击预览后的 deep-link 持续可达。
4. 任何 anchor 必须是 YiKnowledge 下的相对路径，或允许的外部锚点协议。
5. SRE 级别字段只允许 `critical | major | warn | clear` 四种，不接受自定义值。
6. 若 `sre_status.level == critical`，首页 hero 区会显示红色呼吸动画并置顶；不允许滥用。

### 删除 / 重命名 护栏
- 删除或重命名本目录文件前，先在 YiVad **三处**同步修改：
  1. `hooks/useDailyFocusBoard.ts`（FOCUS_FILE_PATH 常量 & YAML 区段解析器）
  2. `views/home/index.vue`（FOCUS_RESOLVERS fallback 字典 & slug→路径解析）
  3. `tests/e2e/home-today-focus.spec.ts`（若已存在首页断言）
- 三处未同步 → 首页会回退到纯 issue 模式，并在 hero 位置输出红色 `降级` 提示。
