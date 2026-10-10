---
title: 今日焦点总控
aliases: [daily-focus, 今日焦点, 焦点看板, focus-board, 001-今日焦点-焦点总控, daily/001-今日焦点-焦点总控]
tags: [focus, daily, executive, dashboard, okr, sre]
category: curator
created: 2026-10-10
updated: 2026-10-10
last_verified: 2026-10-10
source: internal
type: summary
status: active
lifecycle: active
review_cycle: daily
roles: [executive, leader, curator, sre]
benefit: 将战略优先级、SRE 状态、OKR 锚点、角色化行动项、3-2-1 决策摘要、学习与风险摘要统一渲染到首页「今日焦点」顶部，保证每天打开第一眼 ≤ 30 秒即看到「最该做的 1 件事 + 红线告警 + 可点击锚点 + 昨天踩过的坑」。
acceptance_criteria:
  - home/index.vue 渲染时从本文件读取 hero/banner/sre/okr/actions/anchors/digest/focus_links 八个区段
  - 每条行动项包含 owner、due、status、anchor 四个字段，且 anchor 指向知识库可点击路径
  - SRE 红线级别字段（critical/major/warn/clear）被正确翻译为 UI 颜色信号
  - OKR 锚点在首页打开预览对话框，路径以 knowledge: 协议可被 linkFactory 解析
  - daily_digest 区段（signals=3 / decisions=2 / redlines=1）数量合规，缺一则降级
  - focus_links 区段至少 4 条，每条可通过 KnowledgePreviewDialog 打开正文
related:
  - ./archive/2026-10-10/decision-brief.md
  - ./archive/2026-10-10/sre-runbook.md
  - ./archive/2026-10-10/okr-tracker.md
  - ./archive/2026-10-10/role-actions.md
  - ./archive/2026-10-10/learning-risk.md
  - ../governance/001-治理-知识健康看板.md
  - ../../executive/okr/2026-Q3/exec-001-市场情报与竞争洞察/goal.md
  - ../../executive/okr/2026-Q3/exec-002-经营战略与组织路线/goal.md
  - ../../executive/okr/2026-Q3/exec-003-经营学习与阅读/goal.md
  - ../../leader/okr/2026-Q3/lead-001-technical-review-loop/goal.md
  - ../../leader/okr/2026-Q4/lead-002-testing-safety-net/goal.md
  - ../../sre/INDEX.md
  - ./archive/2026-10-10/INDEX.md
---

# 今日焦点总控 (Daily Focus Board)

> **每日第一眼决策面板**：把「战略目标 × 3-2-1 决策摘要 × SRE 红线 × OKR 追踪 × 角色行动项 × 学习与风险」聚合为 8 段可点击内容，任何角色打开首页后 ≤ 30 秒即可知道今天要做什么、哪些红线在燃、昨天踩过什么坑、去哪个锚点推进。

---

## 一、今日 Hero（一句话焦点）

- **date**: `2026-10-10`
- **hero**: 「阅读清单 SSOT 闭环 + YiVad 今日焦点专业化落地，完成『审计 → 报告 → 执行 → 四关验证』第 3 关」
- **must_do_one**: `leader/decisions/yivad-003-决策-Vitest引入.md` + 补全 e2e 冒烟用例（5 条断言覆盖首页 3 大高频页）
- **narrative**: 昨日完成 OKR 文件正则识别排查 & `/reading-list/{id}` 异常处理重构（字符串匹配 → 枚举比较）。今日把首页 Today's Focus 从「纯 issue 动态」升级为「8 段式战略行动面板」，与 YiKnowledge/curator/daily 目录下的 6 个内容文件打通，确保首页信息既是结构化的又是可追溯的。

## 二、SRE 运行红黄灯

> 级别: `critical` 红 / `major` 橙 / `warn` 黄 / `clear` 绿
> 每条详情的 4 字段（Impact / Root Hypothesis / Mitigation / ETA）见：`./archive/2026-10-10/sre-runbook.md`

```yaml
sre_status:
  level: warn
  items:
    - id: SRE-001
      level: warn
      title: YiVad 前端 e2e 覆盖率基线尚未建立（LCP p95 ≤ 2.0s 红线无持续监控）
      owner: Tech Lead
      anchor: curator/daily/archive/2026-10-10/sre-runbook.md#sre-001
      detail: p95 性能红线 (LCP ≤ 2.0s, HMR ≤ 650ms) 无持续监控看板；今日补齐 smoke 脚手架
    - id: SRE-002
      level: warn
      title: YiPot 二进制体积接近红线（当前 17.8MB，目标 < 18MB，裕量仅 200KB）
      owner: Platform Owner
      anchor: curator/daily/archive/2026-10-10/sre-runbook.md#sre-002
      detail: 下一步：dead_code lint + strip + LLTO 后再做一次 release 切片验证
    - id: SRE-003
      level: clear
      title: YiAi RAG 嵌入节流 3000ms 已生效，API 429 清零（Recall@5 对照今日下午产出）
      owner: AI Eng
      anchor: curator/daily/archive/2026-10-10/sre-runbook.md#sre-003
```

## 三、OKR 锚点追踪

> 与 5 个活跃 goal 文件 1:1 对应；每条均含 `coverage` = 已完成 KR 数 / 总 KR 数。
> 每条「今天推进 / 卡点 / 下一锚点 / 预期产出」4 字段详情见：`./archive/2026-10-10/okr-tracker.md`

```yaml
okr_trackers:
  - id: exec-001
    title: 市场情报与竞争洞察
    period: 2026 Q3
    owner: CEO
    progress: 74
    coverage: 3
    total: 4
    status: active
    anchor: curator/daily/archive/2026-10-10/okr-tracker.md#exec-001
    today_focus: KR2+KR3 追赶：把 aier/industry 下 Gartner/信通院研报落笔记（2 篇叶子）
  - id: exec-002
    title: 经营战略与组织路线
    period: 2026 Q3
    owner: CEO
    progress: 62
    coverage: 2
    total: 4
    status: at_risk
    anchor: curator/daily/archive/2026-10-10/okr-tracker.md#exec-002
    today_focus: OKR-004 组织规划完备度 + 决策三角（原则/方法/反模式）输出
  - id: exec-003
    title: 经营学习与阅读
    period: 2026 Q3
    owner: CEO
    progress: 68
    coverage: 2
    total: 3
    status: active
    anchor: curator/daily/archive/2026-10-10/okr-tracker.md#exec-003
    today_focus: 阅读清单 v3.2 与首页今日焦点 6 文件打通（即本目录）
  - id: lead-001
    title: 技术评审闭环
    period: 2026 Q3
    owner: Tech Lead
    progress: 55
    coverage: 1
    total: 2
    status: active
    anchor: curator/daily/archive/2026-10-10/okr-tracker.md#lead-001
    today_focus: kbExtractOkrRef 对 exec-NNN-NN 三段式 18 条用例 + 实现补丁
  - id: lead-002
    title: 测试安全网
    period: 2026 Q4
    owner: Tech Lead
    progress: 20
    coverage: 0
    total: 2
    status: at_risk
    anchor: curator/daily/archive/2026-10-10/okr-tracker.md#lead-002
    today_focus: Vitest + Playwright e2e 冒烟脚手架搭建（5 条断言）
```

## 四、角色化今日行动项

> 六大核心角色 × 今日 1 件最优先事。每条 5W1H 详情见：`./archive/2026-10-10/role-actions.md`。
> 优先级规则：p0 必须 EOD 关闭；p1 必须 EOD 进入 in_review；p2 允许跨日但需 15:00 前产快照。

```yaml
actions:
  - role: Executive (CEO)
    priority: p0
    title: OKR exec-002 at_risk 判定 → 输出决策三角（原则/方法/反模式）+ 最终处置
    why: 组织规划完备度是 Q3 进入 Q4 衔接窗口的先决条件，拖后则预算与招聘都漂移
    anchor: curator/daily/archive/2026-10-10/role-actions.md#executive-ceo--p0--todo
    status: todo
  - role: Tech Lead
    priority: p0
    title: kbExtractOkrRef 对 exec-NNN-NN 模式补 18 条测试用例 & 提交修复（≥ 96% 通过率）
    why: 阅读清单仪表盘 okr=0 统计异常若不根治，OKR 追踪全链路会系统性失真
    anchor: curator/daily/archive/2026-10-10/role-actions.md#tech-lead--p0--in_progress
    status: in_progress
  - role: Engineer
    priority: p1
    title: YiVad 首页 Today's Focus 8 段式改造：+ digest（3-2-1）+ focus_links，全部锚点走预览弹框
    why: 纯 issue 列表只能给「现象快照」，战略面板才能让全团队每天对齐同一套优先级
    anchor: curator/daily/archive/2026-10-10/role-actions.md#engineer--p1--in_progress
    status: in_progress
  - role: SRE
    priority: p1
    title: YiPot 体积切片 + YiVad LCP p95 采集脚本，输出到 sre/QUICKREF 性能段（≥ 10 次测量）
    why: 18MB / 2.0s 两条红线若无持续基线就无法触发 L1-L5 回滚
    anchor: curator/daily/archive/2026-10-10/role-actions.md#sre--p1--todo
    status: todo
  - role: Curator
    priority: p1
    title: 把 curator/daily 加入 governance 审查清单，EOD 22:00 前四字段强制更新
    why: 今日焦点文件若过期 48h，首页 hero 与 SRE 状态就会误导决策
    anchor: curator/daily/archive/2026-10-10/role-actions.md#curator--p1--todo
    status: todo
  - role: AI Eng (aier)
    priority: p2
    title: 嵌入节流 3000ms 后 RAG Recall@5 回归测试 — 用 yiAi smoke runbook 跑 20 条 query
    why: 节流过猛会牺牲召回，必须每日用 smoke 数据对召回率打一次勾
    anchor: curator/daily/archive/2026-10-10/role-actions.md#ai-eng-aier--p2--todo
    status: todo
```

## 五、快速锚点（首页「今日焦点」副导航）

```yaml
quick_anchors:
  - label: 阅读清单 SSOT
    anchor: executive/reading-list/001-阅读-阅读清单.md
    role: Executive
  - label: 知识健康看板
    anchor: curator/governance/001-治理-知识健康看板.md
    role: Curator
  - label: Q3 经营 OKR 总览
    anchor: executive/roadmap/003-路线图-组织OKR追踪.md
    role: Executive
  - label: 工程效能度量
    anchor: leader/architecture/051-架构-工程效能度量.md
    role: Tech Lead
  - label: 运行状态 Runbook
    anchor: leader/risk/007-风险-Runbook模板.md
    role: SRE
  - label: 项目质量门禁
    anchor: projects/INDEX.md
    role: All
```

## 六、每日决策 3-2-1 摘要（新增）

> 3 signals / 2 decisions / 1 redline 的压缩简报；完整 60 秒版本见：`./archive/2026-10-10/decision-brief.md`

```yaml
daily_digest:
  summary_file: curator/daily/archive/2026-10-10/decision-brief.md
  signals:
    - id: S1
      level: warn
      title: kbExtractOkrRef exec-NNN-NN 三段式识别失败，OKR 仪表盘系统性低估
      confidence: 95
      ref: leader/okr/2026-Q3/lead-001-technical-review-loop/goal.md
    - id: S2
      level: warn
      title: 嵌入节流 3000ms 生效（API 429 清零）但 Recall@5 对照数据缺失
      confidence: 75
      ref: aier/INDEX.md
    - id: S3
      level: major
      title: YiPot release 切片 17.8MB → 红线 18MB 裕量仅 200KB
      confidence: 88
      ref: curator/governance/007-治理-分类处理.md
  decisions:
    - id: D1
      title: "/reading-list/{id} DATA_NOT_FOUND 全量迁移到枚举值比较"
      recommend: A
      deadline: "2026-10-10 18:00"
      ref: leader/architecture/012-架构-数据模型设计原则.md
    - id: D2
      title: 首页今日焦点默认展示战略面板 + 提供 ?focus=issue 一键回退
      recommend: A
      deadline: "2026-10-10 12:00"
      ref: projects/yivad/prds/2026-08/07-prd-首页仪表盘.md
  redlines:
    - id: R1
      title: YiVad LCP p95 ≤ 2.0s · Rsbuild HMR ≤ 650ms
      detail: 今日 8 段式改造须满足：解析非阻塞、新增 DOM < 240、依赖增量 < 5KB
      ref: sre/QUICKREF.md
```

## 七、焦点延伸链接（新增 · 用于首页底部「深入阅读 / 推进锚点」栏）

> 至少 4 条，均要求 KnowledgePreviewDialog 可直接打开正文并做相对链接跳转。

```yaml
focus_links:
  - group: 深入阅读
    title: 每日决策简报（3 信号 / 2 决策 / 1 红线）
    anchor: curator/daily/archive/2026-10-10/decision-brief.md
    role: Executive
  - group: 深入阅读
    title: 学习与风险摘要（3 复盘收获 / 3 持续风险）
    anchor: curator/daily/archive/2026-10-10/learning-risk.md
    role: All
  - group: 推进锚点
    title: 技术选型 - Vitest 引入决策记录
    anchor: leader/decisions/yivad-003-决策-Vitest引入.md
    role: Tech Lead
  - group: 推进锚点
    title: SRE QUICKREF - 性能 & 体积红线段
    anchor: sre/QUICKREF.md
    role: SRE
  - group: 推进锚点
    title: 高管决策框架 - 决策三角（原则/方法/反模式）
    anchor: executive/strategy/018-战略-高管决策框架.md
    role: Executive
  - group: 推进锚点
    title: 治理-就绪检查清单（Curator EOD 四字段更新项）
    anchor: curator/governance/004-治理-就绪检查清单.md
    role: Curator
```

## 八、可证伪性基线（Falsifiability Baseline）

| 编号 | 基线主张 | 数据锚点 | 观察窗口 | 回滚触发器 |
|---|---|---|---|---|
| B1 | 首页今日焦点打开 ≤5s 看到 hero/SRE/OKR/actions/digest/focus_links 六区 | YiVad LCP p95 ≤ 2.0s | 每小时采样 | 连续 3 次 > 2.0s → 回退到纯 issue 模式 |
| B2 | action + focus_link 锚点点击可达率 ≥ 90%（三关：linkFactory→HEAD→看门狗2s） | linkFactory + KnowledgePreviewDialog | 每日 EOD | 低于 90% → Curator 24h 内修复死链 |
| B3 | SRE 级别字段与真实告警一致（由 sre/QUICKREF 对照） | YiAi /health 路由 | 每 30min 轮询 | 偏差 ≥ 1 级 → 触发 SRE Runbook L2 |
| B4 | OKR coverage 字段与 goal.md 中 KR 完成数一致 | 5 个 goal 文件正则解析 | 每 6h | ≥ 2 个 coverage 不符 → 锁定首页看板 |
| B5 | daily_digest 严格 3 signals / 2 decisions / 1 redline（缺一则降级） | archive/2026-10-10/decision-brief.md | 每次读取 | 数量不符 → 首页 digest 段灰显 + 提示 |
| B6 | focus_links ≥ 4 条，且每条 KnowledgePreviewDialog 可打开正文 | YiAi knowledge-read 接口 | 每次读取 | 打开失败 ≥ 1 条 → 在对应条目加红色角标 |

> 以上 6 条基线是本文件的「可证伪性护栏」。任何一条被触发，首页会自动降级相关区段，并在 hero 位置用红色提示「焦点数据未通过 B# 校验，未通过段已自动回退」。
