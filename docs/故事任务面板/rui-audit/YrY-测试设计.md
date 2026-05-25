> | v1.0.0 | 2026-05-22 | deepseek-v4-pro | node skills/rui/audit.mjs | 🌿 feat/rui-audit-doc | 📎 [CLAUDE.md](../../../CLAUDE.md) |

> **导航**: [← YrY-技术评审](./YrY-技术评审.md) · [YrY-实施报告 →](./YrY-实施报告.md)

> **来源引用**: `/rui doc --from-code rui-audit-doc`，基于 `YrY-故事任务.md` §5 AC 和 `YrY-使用场景.md` §2 场景

[§0 基线溯源](#sec0-baseline) · [§1 测试范围](#sec1-scope) · [§2 测试用例](#sec2-cases) · [§3 环境专项](#sec3-env) · [§4 测试环境](#sec4-setup) · [§5 评审清单](#sec5-checklist) · [§6 Gate A 交接](#sec6-gatea)

<a id="sec0-baseline"></a>
## §0 基线溯源

| TC# | 覆盖 AC#(01 §5) | 覆盖场景(02 §2) | 覆盖类型 | 状态 |
|-----|-----------------|----------------|:--:|:--:|
| TC-N1 | AC1 记录调用 | 场景 1 记录工具调用 | 正常 | 待生成 |
| TC-N2 | AC3 查看汇总 | 场景 2 查看汇总 | 正常 | 待生成 |
| TC-N3 | AC2 越权检测 | 场景 3 合规检查 | 正常 | 待生成 |
| TC-N4 | AC4 未知 agent | 场景 3 合规检查 | 正常 | 待生成 |
| TC-B1 | AC3 空审计文件 | 场景 2 空状态 | 边界 | 待生成 |
| TC-E1 | AC1 缺少必填参数 | 场景 1 异常分支 | 异常 | 待生成 |
| TC-E2 | 未知命令 | — | 异常 | 待生成 |
| TC-R1 | 全部合规记录 | 场景 3 | 回归 | 待生成 |

### 主要价值

- 🎯 四类用例全覆盖，含权限合规专项测试
- 🔒 越权检测必测：确保 AGENT_TOOLS 声明有效
- ⚡ 每条用例可独立执行，无外部依赖
- 📊 覆盖矩阵对齐全部 AC#

---

<a id="sec1-scope"></a>
## §1 测试范围

### 1.1 覆盖矩阵

| FP# | 功能点 | 正常 | 边界 | 异常 | 回归 | 覆盖率 |
|-----|--------|:--:|:--:|:--:|:--:|:--:|
| FP1 | 记录工具调用 | TC-N1 | — | TC-E1 | TC-R1 | 100% |
| FP2 | 工具调用汇总 | TC-N2 | TC-B1 | — | TC-R1 | 100% |
| FP3 | 权限合规检查 | TC-N3, TC-N4 | — | — | TC-R1 | 100% |

### 1.2 Gate 映射

| Gate | 用例范围 | 通过标准 | 交接下游 |
|------|---------|---------|---------|
| Gate A | TC-N1–N4, TC-B1, TC-E1–E2 | 全部 P0 通过 | 实现阶段 |
| Gate B | TC-R1 + 全部 Gate A 用例 | P0 100% 通过 | 交付 |

---

<a id="sec2-cases"></a>
## §2 测试用例

### 2.1 正常用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|:--:|
| TC-N1 | 目标故事目录存在，无审计文件 | 执行 `node skills/rui/audit.mjs record --story=test --agent=coder --tool=Edit --target=src/a.ts --duration_ms=150` | ① 目录和文件自动创建；② JSONL 追加一行含 agent=coder/tool=Edit/target=src/a.ts/duration_ms=150；③ stdout 输出 "已记录" | FP1 | P0 |
| TC-N2 | 已有 3 条审计记录（agent=pm tool=Read ×2, agent=coder tool=Edit ×1） | 执行 `summary --story=test` | ① 显示 pm 组 Read: 2 次；② 显示 coder 组 Edit: 1 次；③ 显示总计 3 条 | FP2 | P0 |
| TC-N3 | 已有 1 条 pm 调用 Edit 的记录（pm 的 AGENT_TOOLS 无 Edit） | 执行 `check --story=test` | ① 输出红色越权记录；② 越权计数 ≥ 1 | FP3 | P0 |
| TC-N4 | 已有 1 条 agent=unknown 的记录 | 执行 `check --story=test` | ① 输出黄色警告 "未知 agent: unknown"；② violations 不计入未知 agent | FP3 | P1 |

### 2.2 边界用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|:--:|
| TC-B1 | 审计文件不存在 | 执行 `summary --story=test` | ① 显示 "无审计记录"；② 不报错 | FP2 | P1 |
| TC-B2 | 审计文件含 1 行无效 JSON 和 2 行有效 JSON | 执行 `summary --story=test` | ① 无效行静默跳过；② 总计 2 条记录 | FP2 | P2 |

### 2.3 异常用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|:--:|
| TC-E1 | — | 执行 `record --story=test --agent=coder`（缺少 --tool） | ① 输出 "audit: record 需要 --story=<name> --agent=<name> --tool=<name>"；② 不写入文件 | FP1 | P0 |
| TC-E2 | — | 执行 `node skills/rui/audit.mjs unknown_cmd` | ① 输出 "未知命令。可用: record \| summary \| check" | — | P1 |

### 2.4 回归用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|:--:|
| TC-R1 | 已建立 6 条合规记录（每种 agent 各 1 条合规调用） | 执行 `check --story=test` | ① 输出绿色 ✅ 全部合规；② violations = 0 | FP3 | P0 |

---

<a id="sec3-env"></a>
## §3 环境专项

| ID | Given | When | Then | 优先级 |
|----|-------|------|------|:--:|
| TC-X1 | story 目录不存在 | 执行 record 命令 | 自动递归创建目录和 `.memory/tool-audit.jsonl` | P1 |
| TC-X2 | 审计文件为只读 | 执行 record 命令 | 文件系统错误被异常抛出 | P2 |

---

<a id="sec4-setup"></a>
## §4 测试环境

| 维度 | 配置 |
|------|------|
| 运行环境 | Node.js ≥ 18（`node:path`, `node:fs` 原生模块） |
| 部署方式 | 本地文件系统，项目根目录下执行 |
| 测试目标 | `skills/rui/audit.mjs` 三命令行为 |
| 数据准备 | 使用临时故事目录，每次测试前清理 |

---

<a id="sec5-checklist"></a>
## §5 评审清单

| # | 检查项 | 状态 |
|---|--------|:--:|
| 1 | 每 FP# 有多类用例覆盖 | ✅ |
| 2 | Gate A 覆盖全部 P0 用例 | ✅ TC-N1, TC-N2, TC-N3, TC-E1 |
| 3 | 回归用例与影响链一致 | ✅ TC-R1 |
| 4 | 异常用例含恢复行为描述 | ✅ |
| 5 | 环境专项覆盖文件生命周期 | ✅ TC-X1, TC-X2 |
| 6 | 无外部依赖 | ✅ |
| 7 | 基线溯源闭合 | ✅ |

---

<a id="sec6-gatea"></a>
## §6 Gate A 交接

| 信号 | 内容 |
|------|------|
| 通过状态 | ✅ 待执行 |
| P0 用例 ID | TC-N1, TC-N2, TC-N3, TC-E1, TC-R1 |
| 实现约束 | 纯 Node.js 标准库；AGENT_TOOLS 表不可破环 |
| 验证命令 | 逐用例手动执行 + `jq` 验证 JSONL 内容 |

---

> | 日期 | 变更 | 触发 | 证据 |
> |------|------|------|------|
> | 2026-05-22 | 初始生成 | `/rui doc --from-code rui-audit-doc` | `YrY-故事任务.md` §5, `YrY-使用场景.md` §2 |
