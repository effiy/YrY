---
title: 今日学习与风险摘要
aliases: [daily-learning-risk, 学习风险摘要, learnings-brief, learning-risk, 006-今日焦点-学习与风险摘要]
tags: [focus, learning, risk, daily, retrospective]
category: curator
date: 2026-10-10
created: 2026-10-10
updated: 2026-10-10
last_verified: 2026-10-10
source: internal
type: retrospective
status: active
lifecycle: active
review_cycle: daily
roles: [curator, leader, sre]
benefit: 把每日的 3 条关键收获（复盘级经验）与 3 个需持续观察的风险点压缩成一页摘要，挂在首页今日焦点底部，让执行层把"昨天踩的坑"变成"今天少走的弯路"。
acceptance_criteria:
  - learnings / risks 各严格 3 条
  - 每条 learning 含 trigger / insight / reuse_scene 三字段
  - 每条 risk 含 scenario / probability / impact / mitigator 四字段
related:
  - ../focus-board.md
  - ./INDEX.md
  - ../../leader/risk/002-风险-事后复盘.md
  - ../../curator/governance/006-治理-隐性知识待办.md
---

# 今日学习与风险摘要（Learning & Risk Brief · 2026-10-10）

---

## 3 条关键收获（Learnings · 3/3）

### L1 · 正则提取的 3 段式边界

**Trigger（触发场景）**：`kbExtractOkrRef` 对 `exec-001` 两段式可正确识别，但对 `exec-001-市场情报…` 三段式（第三段中文 title 会被解析器截掉）返回 `okr=0`。

**Insight（核心洞察）**：当 `id` 字段需要被正则同时用于"提取"和"回写统计"时，必须把 id 的规则提升为项目级契约——**OKR id 一律是 `{prefix}-{NNN}` 两段，第三段中文 title 仅用于目录名，不得进入 id 字符串**。

**Reuse Scene（可复用场景）**：① readingList 的 kbExtractOkrRef ② 首页 useDailyFocusBoard 的 okr_trackers.id ③ OKR 仪表盘 okr.vue 的 id-to-anchor 映射。下次改正则必须同步三处。

### L2 · 接口异常识别：字符串匹配 ≠ 鲁棒识别

**Trigger（触发场景）**：YiVad `/reading-list/{id}` 当 `DATA_NOT_FOUND` 由字符串匹配处理时，后端错误枚举一旦更名（从 `DATA_NOT_FOUND` → `NOT_FOUND`）前端 404 降级失效。

**Insight（核心洞察）**：错误识别一律走"双方共享枚举 + SDK 自动生成"链路；前端 **严禁** 以 `err.message.includes('DATA_NOT_FOUND')` 这样的字符串比较作为分支条件。本项目 `error_codes.py` + `httpEnum.ts` 是权威双端契约。

**Reuse Scene（可复用场景）**：① 所有 errorHandler ② readingList、okr 等详情页的 fallback ③ useHomeData 中对 issueService 返回异常的分支。

### L3 · 二进制红线的 2 段式切片

**Trigger（触发场景）**：YiPot release 一次 build 只能看到最终体积，无法知道"新增 1 个 plugin 涨了多少 KB"，导致超限时难以精确裁剪。

**Insight（核心洞察）**：体积红线的监控必须做 **两次切片**：① 单模块切片（每个 tauri-plugin、每个静态资源的体积）② 全量 release 切片。缺任何一次切片都会在接近红线时变成"瞎猜优化"。

**Reuse Scene（可复用场景）**：① YiPot 体积治理 ② YiAi Docker 镜像层治理 ③ YiPet MV3 扩展的 16MB 单文件限制。

---

## 3 个需持续观察的风险（Risks · 3/3）

### R1 · 今日焦点数据过期 > 48h 的"静默误导"风险

| 字段 | 内容 |
|------|------|
| **Scenario（情景）**：Curator 连续两天未更新 curator/daily/focus-board.md → 首页 hero / SRE / OKR / action 展示的内容完全过时，但用户无法一眼判断 → CEO 基于过时 at_risk 判定拍板 |
| **Probability（概率）**：Medium · 历史数据：上月一次 36h 过期事件 |
| **Impact（影响）**：高 · 错误决策 → OKR 偏差 → 下游执行漂移 3~5 天 |
| **Mitigator（缓解）**：① Curator EOD 审查清单四字段强制更新 ② `useDailyFocusBoard` 读取 `updated` 字段，若 lastUpdated 超过 48h 自动在 hero 区显示红色告警 ③ `?focus=issue` query 一键回退到纯 issue 面板 |

参考：[治理-就绪检查清单](../../curator/governance/004-治理-就绪检查清单.md)

### R2 · 正则修复补丁引入新的边界回归

| 字段 | 内容 |
|------|------|
| **Scenario（情景）**：`kbExtractOkrRef` 在修复 exec-NNN-NN 三段式的同时，破坏了 lead-NNN 和 cur-NNN 两种短 id 的识别 → readingList 的 okr 字段从 0 → 正确，但出现了非预期的 0 回退 |
| **Probability（概率）**：Medium-High · 复杂正则的边界回归在过往 3 次修改中出现过 1 次 |
| **Impact（影响）**：中 · 阅读清单仪表盘的 OKR 追踪列再次被系统性误导 |
| **Mitigator（缓解）**：① 单测 18 条（12 正 + 4 反 + 2 边界）必须 100% 通过 ② PR 走 loop-001 的 code-review 模板 ③ 合入后首小时人工抽查阅读清单页面 20 行数据 |

参考：[loop-001 code review](../../executive/okr/2026-Q3/loop/loop-001-okr-self-closed-loop/003-闭环-code-review.md)

### R3 · 节流 3000ms 导致 Recall 骤降的假 CLEAR

| 字段 | 内容 |
|------|------|
| **Scenario（情景）**：SRE-003 的 CLEAR 判定只看 API 429 清零，未看 Recall@5 → AI Eng 下午的 smoke 回归发现 Recall@5 实际下降了 8% → 阅读清单的跨书整合（§6 整合/阅读）出现"看起来更稳但更差"的错觉 |
| **Probability（概率）**：Medium · 过往一次 throttle ×2 的调整中实际 Recall@5 下降 4.2% |
| **Impact（影响）**：中-高 · 阅读清单 §6 的跨书整合质量下降 → 专业阅读笔记的"决策价值"降低 → CEO 依赖阅读清单做决策的信心降低 |
| **Mitigator（缓解）**：① AI Eng 15:00 前输出两组对照数据 ② SRE 设定阈值：Recall@5 下降 > 5% → 自动触发 L2 回滚（throttle → 2000ms + batch_size 128）③ 结论写入 aier/INDEX 的 Recap 段 |

参考：[aier INDEX](../../aier/INDEX.md) · [SRE 详情 003](./sre-runbook.md)

---

## 一页结论（一页纸 · ≥ 3 条）

1. **今天的结构性风险**：`kbExtractOkrRef` 边界回归（R2）；优先级最高，Tech Lead 需 14:00 前把实现补丁与单测对齐。
2. **今天的结构性机会**：首页今日焦点从 issue 面板 → 战略面板的模式切换（Engineer P1），成功后可把 6 角色的每日 EOD 对齐时间从 20 分钟压缩到 5 分钟。
3. **明天的早会主题**：Recall@5 对照结果 + 体积切片数据，两组合并过一次 SRE QUICKREF 写入审查。
