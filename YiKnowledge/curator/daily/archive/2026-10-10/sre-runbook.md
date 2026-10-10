---
title: SRE 红黄灯运行手册
aliases: [sre-status-detail, SRE详情, sre-brief, sre-runbook, 003-今日焦点-SRE详情]
tags: [sre, daily, focus, runbook]
category: sre
date: 2026-10-10
created: 2026-10-10
updated: 2026-10-10
last_verified: 2026-10-10
source: internal
type: operational
status: active
lifecycle: active
review_cycle: daily
roles: [sre, leader, engineer]
benefit: 将首页 SRE 状态灯的每一条告警延伸为 4 字段的运行手册式详情（Impact / Root Hypothesis / Mitigation / ETA），让点击 SRE 灯的人直接获得"下一步做什么"，而不是只看到一行标题。
acceptance_criteria:
  - 与 focus-board.md 中 sre_status.items 的 id 严格 1:1
  - 每条详情必须包含 impact / root_hypothesis / mitigation / eta 四个字段
  - level 字段取值限定于 critical/major/warn/clear
related:
  - ../focus-board.md
  - ./INDEX.md
  - ../../sre/QUICKREF.md
  - ../../leader/risk/007-风险-Runbook模板.md
---

# SRE 红黄灯运行手册（SRE Status Detail · 2026-10-10）

> 首页 3 条 SRE 灯的运行手册式详情。点击首页 Today's Focus 的任意一条 SRE 条目 → 预览弹框 → 点击锚点跳转本文件对应章节。

---

## SRE-001 · warn · YiVad 前端 e2e 覆盖率基线尚未建立

**Owner**：Tech Lead · **L1 回滚触发**：LCP p95 ≥ 2.5s 连续 3 次

| 字段 | 内容 |
|------|------|
| **Impact（影响）** | 无持续 e2e 基线 → 首页今日焦点的 SSR/LCP 回归无法量化；LCP p95=2.0s 红线形同虚设；未来合并「阅读清单 v3.2」后性能回退无法在 PR 阶段拦截 |
| **Root Hypothesis（根因假设）** | playwrigth.config.ts 存在但 smoke.spec.ts 仅覆盖登录页 2 个断言，未覆盖 `/home/index`、`/knowledge/executive/okr`、`/knowledge/executive/readingList` 三个高频页 |
| **Mitigation（处置步骤）** | ① 新增 `e2e/specs/home-today-focus.spec.ts` 3 个断言（Hero 可见 + OKR Grid ≥ 3 张卡 + SRE Matrix 非空）② CI 接入 p95 LCP 采集到 sre/QUICKREF ③ EOD 输出首版覆盖率基线报告 |
| **ETA（预计恢复）** | **2026-10-11 18:00** 前完成首版 smoke 脚手架 · 2026-10-14 前合并到 main |

锚点：[决策-Vitest引入](../../leader/decisions/yivad-003-决策-Vitest引入.md) · [Runbook模板](../../leader/risk/007-风险-Runbook模板.md)

---

## SRE-002 · warn · YiPot 二进制体积接近红线（目标 < 18MB）

**Owner**：Platform Owner · **L1 回滚触发**：release 切片 ≥ 18.0MB

| 字段 | 内容 |
|------|------|
| **Impact（影响）** | 体积超标 → macOS 公证 Gatekeeper 提示时间延长 200%~400%；用户下载转化率下降；更新包体积超限后需切换 CDN 分块，引入新的失败面 |
| **Root Hypothesis（根因假设）** | ① `tauri-plugin-*` 系列 5 个插件静态链入，但 2 个未启用（fs-watch、global-shortcut，已在 main.rs 被注释） ② `Cargo.toml` 未启用 `opt-level = "z"` + `lto = true` 的 release 优化组合 ③ `target/` 残留 debug 符号未 strip |
| **Mitigation（处置步骤）** | ① 在 yipot-011-体积红线 ADR 记录三条处置项 ② `cargo build --release` 启用 opt=z+lto+strip ③ 移除 2 个未启用的 tauri plugin ④ 切片后对照到 sre/QUICKREF 体积段 |
| **ETA（预计恢复）** | **2026-10-13 12:00** 前 release 切片 ≤ 16.9MB（裕量 ≥ 1.1MB） · 否则触发 L2 回滚：禁用自动公证 + 发版公告 |

锚点：[治理-分类处理](../../curator/governance/007-治理-分类处理.md) · [sre QUICKREF](../../sre/QUICKREF.md)

---

## SRE-003 · clear · YiAi RAG 嵌入节流 3000ms 已生效，API 429 清零

**Owner**：AI Eng · **状态**：CLEAR（持续观察中）

| 字段 | 内容 |
|------|------|
| **Impact（影响）** | ✅ 正向：API 429 清零 → 跨书整合（阅读清单 §6）的嵌入请求不再因重试被放大，YiAi 后端 CPU 低峰下降 28%； ⚠️ 风险：Recall@5 对照数据尚未产出，存在"节流过猛"的隐患 |
| **Root Hypothesis（根因假设）** | 节流从 1000ms → 3000ms 直接生效，但未做"节流前后 Recall@5 对照"，需要在 24h 内补齐 smoke 回归 |
| **Mitigation（处置步骤）** | ① 在 20 条已知召回 query 上跑节流前/节流后 Recall@1、@5、@10 三组数据 ② 若 Recall@5 下降 > 5%，节流回退至 2000ms 并 + batch_size 128 ③ 结果写入 aier/INDEX 并附 p95 latency 快照 |
| **ETA（预计恢复）** | **2026-10-10 15:00** 前出首版 smoke 对照 · 2026-10-11 09:00 前发布结论 |

锚点：[aier INDEX](../../aier/INDEX.md) · [RAG 引擎](../../YiAi/src/domain/rag/engine.py)
