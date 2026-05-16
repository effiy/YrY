---
name: diagnose
description: Disciplined diagnosis loop for hard bugs and performance regressions. Reproduce → minimise → hypothesise → instrument → fix → regression-test. Use when user says "diagnose this" / "debug this", reports a bug, or describes a performance regression.
---

# Diagnose

> 结构化调试纪律。难 bug 不靠猜——靠反馈回路。

当探索代码库时，使用项目的 [CONTEXT.md](../../../CONTEXT.md) 领域语言建立清晰的心智模型，检查涉及的 [ADR](../../../docs/adr/)。

## Phase 1 — 构建反馈回路

**这就是技能本身。** 其余是机械步骤。如果你有一个快速、确定、agent 可自运行的通过/失败信号，你就会找到根因——二分、假设测试、instrumentation 都只是消费这个信号。没有它，盯多久代码都没用。

Disproportionate effort here. **激进。创意。不放弃。**

### 构建方式 — 大致按此顺序尝试

1. **失败测试** — 在达到 bug 的任何接缝处写：单元、集成、e2e。
2. **curl / HTTP 脚本** — 对运行中的 dev server 发请求。
3. **CLI 调用** — 用 fixture 输入，diff stdout 与已知正确快照。
4. **Headless 浏览器脚本** — (Playwright / Puppeteer) 驱动 UI，assert DOM/console/network。
5. **回放捕获的 trace** — 保存真实网络请求/payload/事件日志到磁盘；隔离重放到代码路径。
6. **One-off harness** — 启动系统最小子集（一个服务、mock 依赖），用一个函数调用触发 bug 路径。
7. **Property / fuzz 循环** — 如果 bug 是「有时输出错」，跑 1000 次随机输入找失败模式。
8. **二分 harness** — 如果 bug 在两个已知状态（commit、dataset、version）间出现，自动化「在状态 X 启动、检查、重复」让 `git bisect run` 可用。
9. **差分循环** — 用同一输入跑 old-version vs new-version（或两组配置），diff 输出。
10. **HITL bash 脚本** — 最后手段。如果必须人类点击，用脚本驱动 *他们*，保持结构化。

做好了反馈回路，bug 90% 已修复。

### 迭代回路本身

把回路当产品。一旦有 *一个* 回路，问：
- 能更快吗？（缓存 setup、跳过无关 init、缩小测试范围）
- 信号能更锐利吗？（assert 具体症状，非「没 crash」）
- 能更确定吗？（固定时间、seed RNG、隔离文件系统、冻结网络）

2 秒确定回路是调试超能力。30 秒抖动回路比没有略好。

### 非确定 bug

目标不是干净的复现，而是 **更高的复现率**。循环触发 100 次、并行化、加压力、缩小时间窗口、注入 sleep。50% flake bug 可调试；1% 不可——一直提升比例直到可调试。

### 当真正无法构建回路时

停，明确说出来。列出你试了什么。问用户要：(a) 能复现的环境访问权 (b) 捕获件（HAR、log dump、core dump、带时间戳的录屏）(c) 许可添加临时生产 instrumentation。**不要没有回路就进入假设阶段。**

在没有信得过的回路前，不进入 Phase 2。

## Phase 2 — 复现

跑回路。看到 bug 出现。

确认：
- [ ] 回路产生的失败模式是 **用户描述的**——不是恰好相近的不同失败。错误 bug = 错误修复。
- [ ] 失败可多轮复现（或非确定 bug 复现率足以调试）。
- [ ] 你捕获了精确症状（错误消息、错误输出、慢的 timing）以便后续阶段验证修复确实解决的是它。

不复现不进入。

## Phase 3 — 假设

在测试任何一个假设前，**生成 3–5 个排好序的假设**。单假设生成会锚定在第一个看似合理的想法上。

每个假设必须 **可证伪**：写出它的预测。

> 格式：「如果 <X> 是原因，那么 <改变 Y> 会让 bug 消失 / <改变 Z> 会让它恶化。」

如果写不出预测，假设就是直觉——丢弃或锐化它。

**在测试前把排序列表给用户看。** 他们往往有领域知识让你瞬间重排（"我们刚部署了对 #3 的改动"）或知道已排除的假设。低成本 checkpoint，大幅省时间。如果用户 AFK 则不阻塞——按你的排序继续。

## Phase 4 — Instrument

每次探测必须对应 Phase 3 的某个特定预测。**一次改一个变量。**

工具优先级：
1. **Debugger / REPL 检查** — 如果环境支持。一个断点胜过十行日志。
2. **目标日志** — 在能区分假设的边界打。绝不「打全量日志再 grep」。
3. **标签日志** — 每个 debug log 用唯一前缀，如 `[DEBUG-a4f2]`。清理时一个 grep 完事。无标签的日志保留；有标签的日志死。
4. **性能分支** — 性能回归用日志通常不行。替代：建立基线测量（timing harness、`performance.now()`、profiler、query plan），然后二分。先测量，再修复。

## Phase 5 — 修复 + 回归测试

**修复前先写回归测试**——但仅当存在 **正确的接缝** 时才写。

正确的接缝是测试能锻炼 **真实 bug 模式** 发生于调用点的那种。如果唯一可用的接缝太浅（单调用方测试但 bug 需要多调用方才能触发、单元测试无法复现触发链条），在那里写回归测试是假安全感。

**如果不存在正确接缝，这本身就是发现。** 记录它。代码库架构阻止了锁定这个 bug。将此标记给下一篇复盘。

如果存在正确接缝：
1. 把最小复现转为该接缝的失败测试。
2. 看它失败。
3. 应用修复。
4. 看它通过。
5. 对原始（未最小化）场景重跑 Phase 1 反馈回路。

## Phase 6 — 清理 + 复盘

声明完成前必做：
- [ ] 原始复现不再复现（重跑 Phase 1 回路）
- [ ] 回归测试通过（或接缝缺失已记录）
- [ ] 所有 `[DEBUG-...]` instrumentation 已删除（grep 前缀）
- [ ] One-off 原型已删除（或移到明确标记的 debug 位置）
- [ ] 被证明正确的假设写在 commit / PR 消息里——让下一个 debugger 学到

**然后问：什么能预防这个 bug？** 如果答案涉及架构变更（没有好的测试接缝、调用方纠缠、隐含耦合），把详细信息交接给 `/improve-codebase-architecture`。在修复后做推荐，而非之前——你现在比开始时掌握了更多信息。

## Red Flags — 暂停回到 Iron Law

- "这个 bug 很简单，直接修就行"
- "修复超过 3 次了但这次肯定对"
- "多个修复一起上省时间"
- "不需要最小复现，我理解根源了"
- "先修 bug 再写测试"
- "我凭直觉修就行，不需要反馈回路"

**以上任何一个 = 停止。** 回到 [CLAUDE.md 铁律](../../CLAUDE.md#基础信念)。
