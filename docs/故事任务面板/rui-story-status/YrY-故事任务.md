> | v1.0.0 | 2026-05-22 | deepseek-v4-pro | node skills/rui-story/status.mjs | 🌿 feat/rui-story-status-doc | 📎 [CLAUDE.md](../../../CLAUDE.md) |

> **导航**: [YrY-使用场景 →](./YrY-使用场景.md)

> **来源引用**: `/rui doc --from-code rui-story-status-doc`，源码 `skills/rui-story/status.mjs:1-371`

[§0 基线声明](#sec0-baseline) · [§1 Story](#sec1-story) · [§2 Requirements](#sec2-requirements) · [§3 成功标准](#sec3-success) · [§4 范围边界](#sec4-scope) · [§5 AC](#sec5-ac) · [§6 风险与假设](#sec6-risks)

<a id="sec0-baseline"></a>
## §0 基线声明

> **问题空间基线 (Problem Space Baseline)**: 本文档定义"做什么(WHAT)"和"验收标准(AC)"。

### 主要价值

- 🎯 六阶段状态机：任务→设计→实施→测试→报告→改进，每阶段合法转移精确约束
- 🔀 三命令闭环：check(验证)→transition(执行)→dashboard(聚合)
- 🛡️ 非法转移自动拒绝并提示合法目标，防止状态混乱
- 📊 dashboard 本地聚合全部故事状态，含阻断标记
- 📝 每次转移追加 status-history.jsonl，完整审计追踪

---

<a id="sec1-story"></a>
## §1 Story

### Story 1: 故事状态机

| 字段 | 内容 |
|------|------|
| 作为 | 管线脚本 |
| 我想要 | 执行故事状态转移并验证合法性 |
| 以便 | 管线各阶段自动推进故事状态，防止非法跳跃 |
| 优先级 | P0 |
| 范围边界 | transition 命令写入 rui-state.json 和 status-history.jsonl |
| 依赖 | 故事目录存在，六阶段状态定义 |

#### §1.1 User Operations

| # | 操作 | 触发条件 | 操作步骤 | 预期结果 |
|---|------|---------|---------|---------|
| 1 | 验证转移 | 执行 `status check --from=设计 --to=实施` | 查 VALID_TRANSITIONS 表 | 合法 → 绿色 ✓ / 非法 → 红色 ✗ + 合法目标列表 |
| 2 | 执行转移 | 管线阶段完成后自动触发 | 读取当前状态 → 验证转移 → 更新 rui-state.json → 追加 history | 终端确认 + 文件已写入 |
| 3 | 查看仪表板 | 执行 `status dashboard` | 扫描全部故事 → 读取 rui-state.json → 聚合输出 | 状态分布 + 故事列表含阻断标记 |

---

<a id="sec2-requirements"></a>
## §2 Requirements

### 功能点

| FP# | 描述 | 输入 | 输出 | 错误行为 | 优先级 |
|-----|------|------|------|---------|:--:|
| FP1 | 转移验证 — 检查状态转移合法性 | from + to | 合法/非法 + 合法目标列表 | 缺少参数 → 提示 | P0 |
| FP2 | 转移执行 — 更新 rui-state.json + 追加 history | story + to + reason | 更新后的状态文件 + 历史记录 | 非法转移 → 拒绝；目录不存在 → 提示 | P0 |
| FP3 | 仪表板 — 本地聚合全部故事状态 | 项目根目录 | 状态分布 + 故事列表（含阻断） | 无故事目录 → 空状态提示 | P0 |
| FP4 | dry-run — 预览转移但不写入 | story + to + --dry-run | 预览信息 | — | P1 |

### 业务规则

| R# | 描述 | 校验方式 | 证据级别 |
|----|------|---------|:--:|
| R1 | 六阶段转移规则严格约束，仅 7 条合法路径 | VALID_TRANSITIONS 硬编码表 | A |
| R2 | 非法转移拒绝 + 提示合法目标 | checkTransition() → process.exit(0) | A |
| R3 | 转移时故事目录不存在则初始化 rui-state | applyTransition() 自动创建 | A |
| R4 | 每次转移追加 status-history.jsonl | appendStatusHistory() | A |

### 数据约束

| 约束 | 类型 | 范围/格式 | 来源 |
|------|------|----------|------|
| 故事状态 | enum | 任务/设计/实施/测试/报告/改进 | VALID_TRANSITIONS keys |
| 转移触发 | enum | manual/pipeline | history entry trigger 字段 |

---

<a id="sec3-success"></a>
## §3 成功标准

| SC# | 描述 | 度量方式 | 目标值 | 优先级 | 关联 FP# |
|-----|------|---------|--------|:--:|---------|
| SC1 | 合法转移通过，非法转移拒绝 | check 命令 exit code | 合法=0, 非法=1 | P0 | FP1 |
| SC2 | 转移后 rui-state.json 状态更新 + history 追加 | 文件内容验证 | status 更新 + 新增 1 行 history | P0 | FP2 |
| SC3 | dashboard 显示全部故事状态 | 故事数 = 实际目录数 | 100% 覆盖 | P0 | FP3 |
| SC4 | dry-run 不修改任何文件 | 文件时间戳不变 | 0 写入 | P1 | FP4 |

---

<a id="sec4-scope"></a>
## §4 范围边界

### 范围内

| # | 条目 | 关联 FP# |
|---|------|---------|
| 1 | 状态转移合法性验证 | FP1 |
| 2 | 状态转移执行（写入 rui-state.json + status-history.jsonl） | FP2 |
| 3 | 本地仪表板聚合 | FP3 |

### 范围外

| # | 条目 | 排除原因 |
|---|------|---------|
| 1 | 远端状态同步 | 由 rui-import 负责 |
| 2 | 自动状态推进 | 由管线脚本触发，status 只执行不决策 |

---

<a id="sec5-ac"></a>
## §5 AC

| AC# | Given | When | Then | 门禁 |
|-----|-------|------|------|:--:|
| AC1 | from=设计, to=实施 | 执行 `status check --from=设计 --to=实施` | 绿色 ✓ 合法转移，exit(0) | Gate A |
| AC2 | from=设计, to=改进 | 执行 `status check --from=设计 --to=改进` | 红色 ✗ 非法转移 + 允许目标列表，exit(1) | Gate A |
| AC3 | 故事 test 当前状态=设计 | 执行 `status transition --story=test --to=实施` | 状态更新为实施 + history 追加 1 行 | Gate A |
| AC4 | 项目有 3 个故事目录 | 执行 `status dashboard` | 状态分布 + 3 个故事列表 | Gate A |
| AC5 | --dry-run 模式 | 执行 `status transition --story=test --to=实施 --dry-run` | 预览输出，不写文件 | Gate A |

---

<a id="sec6-risks"></a>
## §6 风险与假设

| # | 风险/假设 | 类型 | 可能性 | 影响 | 缓解策略 |
|---|----------|------|:--:|:--:|---------|
| 1 | 状态机规则变更需同步多处 | 风险 | M | M | VALID_TRANSITIONS 单一定义点 |
| 2 | 并发转移导致状态不一致 | 风险 | L | L | 单进程模型，管线串行保证 |
| 3 | 六阶段状态定义稳定 | 假设 | — | — | VALID_TRANSITIONS 硬编码 |

**约束**: transition 命令写入文件系统 · check/dashboard 只读 · 状态机严格约束

**产出**: {project}-故事任务.md · {project}-使用场景.md · {project}-技术评审.md · {project}-测试设计.md · {project}-安全审计.md
