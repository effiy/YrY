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
benefit: 首页「今日焦点」的数据来源目录，所有战略行动项、SRE 状态、OKR 锚点均在此目录内版本化管理
acceptance_criteria:
  - 001-今日焦点-焦点总控.md 作为每日首页 hero/SRE/OKR/actions 四区的单一事实来源 (SSOT)
  - 首页 home/index.vue 通过 YiAi 的 /knowledge-read 接口读取本目录文件并渲染
  - 任何内容变更都通过 git 记录，可审计、可回滚
related:
  - ./001-今日焦点-焦点总控.md
  - ../governance/001-治理-知识健康看板.md
---

# Daily 目录 — 每日焦点数据来源

> 首页 `#/home/index` 顶部「今日焦点」区的单一事实来源。

## 目录结构

```
daily/
├── README.md                                    # 本文件（索引与规则）
├── 001-今日焦点-焦点总控.md                    # 今日焦点主文件（YiVad 首页从此读取 8 个区段）
├── 002-今日焦点-决策简报-2026-10-10.md         # 3-2-1 每日决策简报（3 signals / 2 decisions / 1 redline）
├── 003-今日焦点-SRE详情-2026-10-10.md          # 每条 SRE 灯的 4 字段运行手册式详情
├── 004-今日焦点-OKR追蹤卡-2026-10-10.md       # 5 个活跃 OKR 的"今日推进/卡点/下一锚点/预期"卡片
├── 005-今日焦点-角色行动项详情-2026-10-10.md   # 6 大角色 × 5W1H 行动项展开
└── 006-今日焦点-学习与风险摘要-2026-10-10.md   # 3 条复盘收获 + 3 个持续观察风险
```

## 主文件契约（001-今日焦点-焦点总控.md）

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

## 维护规则

1. **每日 EOD 前** 更新一次主文件（hero/must_do_one/items 状态）。
2. 任何 anchor 必须是 `YiKnowledge/` 下的相对路径，或允许的外部锚点协议。
3. 级别字段只允许 `critical | major | warn | clear` 四种，不接受自定义值。
4. 若 `sre_status.level == critical`，首页 hero 区会显示红色呼吸动画并置顶；不允许滥用。
5. 删除/重命名本目录文件前，先在 YiVad `hooks/useDailyInsight.ts` & `views/home/index.vue` 中移除引用，否则首页会回退到纯 issue 模式。
