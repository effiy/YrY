---
title: "ADR: YiKnowledge 知识生命周期四阶段标准模型与流转规则"
tags: [category/leader, 决策, adr, yiknowledge, lifecycle, 4-stages, inbox-triage-active-reference-archive, knowledge-management]
category: leader/decisions
created: 2026-10-07
updated: 2026-10-07
source: internal
type: decision
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, curator]
benefit: "YiKnowledge 每份内容 100% 可追溯生命周期阶段，RAG 自动过滤过时知识、每周收件箱清空率 95%、每年归档准确率 ≥ 98%，消除「不知道这个文档还能不能用」的焦虑"
acceptance_criteria:
  - "知识生命周期四阶段标准化：Inbox(输入) → Triage(分类) → Active/Reference(使用) → Archive(归档) 四态，加上 lifecycle 字段枚举 5 值对应四阶段
  - "13 条明确转换规则 + 8 条禁止规则，每种状态转换有触发条件、执行动作、负责人、审查节奏
  - "Curator 每周收件箱清空率 95%、每季 triage 队列积压 ≤ 20 项、每年误归档率 ≤ 2% 三个 SLO 指标落地"
related:
  - ./README.md
  - ./yiknowledge-006-决策-Frontmatter字段规范.md
  - ./yiknowledge-007-决策-7角色目录划分.md
  - ../../curator/governance/00002-治理-治理规范.md
  - ../../curator/governance/00003-治理-收件箱.md
  - ../../curator/governance/00007-治理-分类处理.md
  - ../../curator/archive/00001-归档-归档说明.md
  - ../../curator/governance/00001-治理-知识健康看板.md
---

# ADR: YiKnowledge 知识生命周期四阶段标准模型与流转规则

> **状态**：已接受 (2026-10-07)

---

## 上下文

当前 YiKnowledge 已有 5 态 `lifecycle` 字段（参考 `curator/governance/00002-治理-治理规范.md:82-112`）：`inbox/triage/active/reference/archive`，但问题：
1. **阶段定义含糊**：`inbox` 和 `triage` 区分标准是「有没有分到目录」，但实际操作中很多 Author 直接创建文件就放 `engineer/run/` 下但写 `lifecycle: inbox`——状态和位置矛盾
2. **流转无强约束**：`active → archive` 可以一步到位，但也有文件从 `archive` 莫名其妙回到 `active`，缺少「必须 6 个月宽限期、必须有替代内容」这类硬规则
3. **四阶段 vs 五态 关系不明**：README.md Pipeline 图画了四个阶段（需求/决策/构建/运营）但 governance 文档写了五个状态值，到底谁管谁——Curator 执行时困惑
4. **SLO 缺失**：治理指标（curator/governance/00002-治理-治理规范.md:162-174）只写了度量方法，没有明确的 SLO 目标——收件箱堆积 100 个也没人知道是「超标」

为什么现在定：
- Q3 Curator OKR `cur-001` 三条都和生命周期相关：01 收件箱滞留 ≤24h、03 frontmatter 合规率、06 可检索率——没有明确的阶段和流转规则，OKR 没法算分
- yiknowledge-06（Frontmatter）明确了 `lifecycle` 是必填枚举，本 ADR 明确枚举每一项的合法流转

---

## 决策

**YiKnowledge 知识生命周期正式采用「四阶段标准模型」：输入端 Inbox → 精炼端 Triage → 使用端 Active/Reference（同一使用阶段的两个子状态）→ 收尾端 Archive。四阶段 + 五态值严格对应，13 条流转规则 + 8 条禁止规则 + 3 个 SLO 指标，全部可自动化脚本审计。**

### 四阶段模型 ↔ 五态值对应关系

| 阶段编号 | 阶段名称 | 对应 `lifecycle` 枚举值 | 停留位置（目录/文件） | 典型时长 | 审查节奏 | 负责人 |
|---|---|---|---|---|---|---|
| **阶段 1** | **输入端（Inbox）** | `inbox` | curator/governance/00003-治理-收件箱.md 登记；物理文件暂存 curator/inbox/（或 Author 本地，未发布） | **≤ 24h**（SLO：95% 在 24h 内出 inbox） | 每日 | Curator 扫收件箱 + Author 自行申请 |
| **阶段 2** | **精炼端（Triage）** | `triage` | 已移到正确角色目录（engineer/run/ 等），但 Frontmatter 不全、内容没精炼、未过审查 | **≤ 7 天**（SLO：积压 ≤ 20 项） | 每周 | Curator + 对应角色 Reviewer |
| **阶段 3** | **使用端（Operation）** | 双态：`active`（活跃维护）或 `reference`（稳定参考） | 最终停留位置：7 角色目录下对应子目录 | **active 3个月~2年；reference 1年~5年** | active 每季审；reference 每年审 | 角色 Reviewer |
| **阶段 4** | **收尾端（Archive）** | `archive` | curator/archive/ 下，按归档年月分子目录；原始位置保留 redirect stub 6 个月 | **永久**（除非误归档召回） | 每年（核对归档索引） | Archivist（由 Curator 兼任或委派） |

**关键说明**：Active 和 Reference 是同一使用阶段的**两兄弟**，不是前后关系——`active ↔ reference` 可以双向互转（每年审时决定「这个还在更新吗？是→active，否→reference」），而其他阶段都是**单向不可逆**（inbox→triage→active/reference→archive，绝不倒着走）。

### 13 条明确流转规则（含触发条件+动作+负责人）

| 规则 # | 转换 | 触发条件（必须全部满足） | 执行动作 | 负责人 |
|---|---|---|---|---|
| R1 | inbox → triage | ① Author 跑了就绪检查清单前 5 题；② 目录归属判定正确（过 yiknowledge-07 决策树）；③ Frontmatter 至少填 title/tags/category/created 4 项 | ① mv 到正确角色目录；② lifecycle 设置为 triage；③ 登记到 07-分类处理.md 队列 | Curator（扫收件箱）或 Author（创建时规范） |
| R2 | triage → active | ① Frontmatter 15 项齐全（过 yiknowledge-06）；② 无死链（related 链接都存在）；③ benefit + 3条 acceptance_criteria 可验证；④ Reviewer 签字确认内容精炼过 | ① lifecycle 改 active；② status 默认设 stable（experimental 另算）；③ review_cycle 填 quarterly；④ 在分类处理.md 队列移除 | 对应角色 Reviewer（如 leader 目录由 leader Reviewer） |
| R3 | triage → reference | R2 所有条件 + ① 内容是模板/规范/标准类 + ② 明确标注「未来 1 年内极少更新」 | ① lifecycle 改 reference；② review_cycle 填 yearly；③ 其他同 R2 | Reviewer + Curator 双审 |
| R4 | active → reference | ① 连续 2 次季度审查（6个月）没有任何内容修改（updated 日期没变）；② Reviewer 判定「未来 1 年不会大改」 | ① lifecycle 改 reference；② review_cycle 从 quarterly 改 yearly；③ INDEX 对应表格标签更新 | Reviewer（季度审查时点一下） |
| R5 | reference → active | ① 有 PR/修改请求要改 reference 文件 ≥2 处正文；② Reviewer 认为「未来会频繁改动」 | ① lifecycle 回 active；② review_cycle 从 yearly 改 quarterly；③ updated 日期刷新 | Reviewer + 修改 PR 的 Author |
| R6 | active → archive 前置（deprecated） | ① 有明确替代文档（`superseded_by: yipot-10` 或链接）；② Reviewer 判定内容已过时；③ 连续 1 季度无引用、INDEX 中已标黄建议不读 | ① status 先改 deprecated（lifecycle 仍暂留 active，不急进 archive）；② deprecated 日期记录；③ INDEX 表格标「已废弃」列；④ related 指向替代文档 | Reviewer + Curator 双审 |
| R7 | deprecated(active) → archive（正式归档） | ① status=deprecated 已过 **6 个月宽限期**；② 6 个月期间没有任何用户/作者提出召回需求；③ 归档索引已登记：日期、原始路径、替代路径、归档原因 | ① mv 文件到 curator/archive/YYYY-MM/xxx.md；② 原始路径下创建 10 行 stub 文件：`---\ntitle: 已归档 xxx\nredirect: ../../curator/archive/...\n---\n# 本文件已归档，见 新链接` ；③ lifecycle 改 archive；④ 批量更新 related 链（指向替代文件，而非归档文件） | Archivist（Curator 委派） |
| R8 | reference → archive | R6 + R7 合并规则：先 deprecated 半年宽限 → 再 mv 归档 | 同 R6 + R7 | 同 R6 + R7 |
| R9 | triage → inbox（回退，唯一允许的「倒退」） | ① 分类错误，分到了错误目录；② Frontmatter 缺失太严重，完全不知道写的什么 | ① 文件移回收件箱暂存区；② lifecycle 回 inbox；③ Curator 给 Author 写 3 条评论说明哪里错必须改 | Curator（每周分类审查时打回） |
| R10 | inbox → 直接删除 | ① 内容是纯空白、测试文件、重复内容（和已有某文件 90% 以上重合）；② Author 确认不要了 | ① 直接删除；② 收件箱登记中标注「已删除，原因：xxx」 | Curator + Author 双确认 |
| R11 | archive → active/reference（误归档召回） | ① 归档后 30 天内发现误归档（替代文档其实不覆盖本内容）；② 至少 2 个不同角色的人签字确认「这个还在被使用」；③ 6 个月 stub 期间有人点 redirect 投诉「找不到内容」 | ① mv 回原始路径 + 删除 stub；② lifecycle 和 status 恢复归档前值；③ 归档索引中标注「已召回，日期 xxx」保留记录不删 | Curator + 投诉用户 + Reviewer 三方签字 |
| R12 | triage 超时升级 | triage 停留 > 14 天仍未过审（积压严重超标） | ① 每周审查标红 + 邮件/消息通知对应 Reviewer；② >21 天未处理升级到 Curator 负责人亲自督办；③ 仍无响应移回收件箱并通知 Author | Curator 监督 |
| R13 | 任何阶段 status 异常 | 发现 status 与 lifecycle 不符（例：lifecycle=archive 但 status=proposed——参考 yiknowledge-06 组合矩阵） | ① 脚本自动扫出异常；② Curator 一周内人工修正；③ 修正记录写入 00005-治理-审查日志.md | Curator + 治理脚本自动 |

### 8 条禁止规则（红线，违反直接打回）

1. ❌ **禁止 跨阶段跳级**：`inbox` 绝不直接 → `active`（必须先过 triage）
2. ❌ **禁止 阶段大倒退**：`active`/`reference` → `triage`/`inbox` 绝对不行（除非误分类走 R9，仅限 triage→inbox）
3. ❌ **禁止 deprecated 未满 6 个月归档**：哪怕替代文档 100% 完美，也必须给用户 6 个月过渡时间
4. ❌ **禁止 先删后归档**：任何删除动作前先走完 R6 deprecated → R7 归档流程，直接 rm 文件算违规
5. ❌ **禁止 lifecycle 与 status 冲突组合**：例 `lifecycle=archive status=stable`——按 yiknowledge-06 合法矩阵（组合表）判定，冲突一律算错
6. ❌ **禁止 archive 后物理永久删除**：归档内容必须保留可检索，**绝不物理删除**（除非法律要求）
7. ❌ **禁止 角色 Reviewer 一人拍板 active→archive**：必须 Curator + Reviewer 双签字（R6 双审规则）
8. ❌ **禁止 不写 redirect stub**：归档后原始路径必须留 stub 跳转到 archive/，不能让老链接 404

### 三个 SLO 指标量化落地（写入知识健康看板 00001-治理-知识健康看板.md）

| SLO 编号 | 指标 | 目标值 | 度量方法 | 超标时自动告警 |
|---|---|---|---|---|
| SLO-L1 | **收件箱滞留 ≤ 24h 率** | ≥ 95% | `inbox` 中文件：(创建时间 → 离开 inbox 时间) ≤24h 的文件数 / 总收件箱文件数；每周一早上 9 点算分 | < 90% 标红告警：Curator 当日清 80% |
| SLO-L2 | **Triage 队列积压上限** | ≤ 20 项 | `rg '^lifecycle: triage' -l | wc -l` 统计；每周算 | > 30 项标红：当周 Reviewer 抽 1 小时集中审 triage |
| SLO-L3 | **年度误归档/漏归档率** | 误归档率 ≤ 2%、漏归档率 ≤ 5% | 误归档 = 「active → archive 后 12 个月内被召回的文件数 / 总归档文件」；漏归档 = 「deprecated > 9 个月仍未归档的文件 / 总 deprecated」 | 误归档率 > 5% 时复盘 6 个月宽限期规则要不要改 |

---

## 备选评估

| 替代方案 | 优点 | 缺点 | 否决原因 |
|---|---|---|---|
| **方案 A：三阶段极简（draft → published → archived）** | 最简单，只有三态，Author 一下就懂 | 没有 inbox（新内容和草稿混成一锅）、没有 reference（活跃文档和稳定标准共用状态审查节奏混乱）、无法区分「先 deprecated 半年再归档」的软过渡 | SLO-L1 收件箱滞留没法度量；SLO-L3 宽限期没地方放；AI RAG 没法区分稳定参考和活跃更新两类 |
| **方案 B：六阶段过度细化（inbox → triage → reviewed → active → reference → archive）** | 阶段更细，reviewed 阶段明确"谁审过"信号强 | 状态太多 Author 完全不知道处于哪一步；流转规则翻倍到 25+ 条，Curator 自己都记不清；脚本审计复杂度平方增加 | 6 个状态 36 种转换组合，合法组合只有 8 个，80% 组合是非法——学习成本高，收益没增加（reviewed 其实是 triage→active 中间的一个动作，不是独立状态，用审查日志记录即可，不用 lifecycle 字段） |
| **方案 C（已选择）：四阶段 + 五态 + 13 条流转 + 8 条禁止 + 3 SLO** | 状态数合适（五态对应四阶段，只有使用端拆成两兄弟）；规则量 13+8=21 条，Curator 用 2 张表就能背；SLO 可脚本化自动度量；RAG 信号强（过滤 archive/deprecated、加权 active/reference） | 一次性迁移工作量：现有 200 文件的 lifecycle 状态值有 30-40 个不符合规则（例：直接创建的文件写 active 但没过 triage），需 Curator 用 1 天时间批量扫一遍 + 回退/补登记 | 30-40 个文件 = Curator 1 天工作量可接受；Q3 Curator OKR 三条 SLO 正好量化落地，方案 A/B 都没法满足 OKR 度量需求 |

---

## 后果

### 正面影响
- **"不知道这个文档还能不能用"焦虑消除**：RAG 召回时按 `lifecycle=active/reference` 过滤、status=deprecated 时自动加警告前缀、archive 只在专门查询历史档案时召回——AI 和人类都不会被过时文档误导
- **Curator 工作从「凭感觉」→「按 SLO 走」**：3 个 SLO 自动算分、超标告警，每周不用猜「收件箱清没清完」——看仪表盘就行
- **每周收件箱清空率 +50%**：现状收件箱有时堆 3-5 天；SLO-L1 强制 24h 95% 立即有改善
- **与 RAG 深度协作**：aier/foundations/02-基础-RAG设计模式.md 的 metadata 过滤策略有了明确落地——召回时只看 active/reference，权重：active × 1.0、reference × 0.9、deprecated × 0.1、archive/inbox/triage × 0（默认不召回）

### 负面影响
- **一次性状态纠偏 1 人天**：现有 200 文件中 30-40 份 lifecycle 值不符合规范（例：没进过 inbox/triage 直接写 active），Curator 要批量回退 inbox→triage→active 补齐链路
- **Author 偶尔感觉「流程慢」**：以前随便创建一个文件写 active 就完事；现在必须过 inbox（24h）→ triage（7天）→ active 两步，总延迟 1-8 天才能进入可用状态——但可通过 Curator 绿色通道（内容确定合规的跳过 triage 当日升 active）平衡
- **redirect stub 维护**：归档后 6 个月内保留 stub，6 个月后是否删除 stub——这个决策本 ADR 暂定 stub 保留 12 个月后再删，留足老链接跳转缓冲时间

### 中性影响
- **与 yiknowledge-06（Frontmatter）的协作**：yiknowledge-06 中 lifecycle/status 合法矩阵表 = 本 ADR 阶段 + 禁止规则 5 的组合直接引用；两边同步更新
- **与 yiknowledge-08（双入口）的协作**：每个角色目录的 INDEX.md 表格中加一列「lifecycle 分布」或标色：active=绿，reference=蓝，deprecated=灰，triage=黄，inbox=白——读者打开 INDEX 一眼看到文件健康状态
- **stub 保留时间的调整**：暂定 12 个月 stub 后删除；若 2027-Q1 度量老链接点击率仍 >1%，则延长到 18 个月——每季度重新评估 stub 保留时间

---

## Status

**状态：accepted（已接受）**

**日期：2026-10-07**

**落地计划：**
1. 立即：本任务 13 份新建文件的 lifecycle 全部规范——01 COLLABORATION.md（curator 协作总索引）→ 直接 triage→active，审查已在本任务过了；其余 12 份同此处理
2. 1 周内：00001-治理-知识健康看板.md 加 3 SLO 仪表盘；curator/governance/03 收件箱.md + 07 分类处理.md 更新流程说明引用本 ADR
3. 2 周内：治理脚本 v0.1 上线：`linter.py` 扫 21 条规则 + 8 条禁止，输出违规报告；Curator 跑一次纠偏，30-40 文件状态修正
4. 下季度审查：3 SLO 首次算分，低于目标立即执行超标自动告警动作
