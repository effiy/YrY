> | v1.0.0 | 2026-05-23 | deepseek-v4-pro | 🌿 feat/rui-claude-help-doc | 📎 [CLAUDE.md](../../../CLAUDE.md) |

> **导航**: [← YrY-技术评审](./YrY-技术评审.md) · [YrY-实施报告 →](./YrY-实施报告.md)

> **来源引用**: 基于故事任务 §5 AC + 使用场景 §2 + 技术评审 §1 生成。证据 Level B。

[§0 基线溯源](#sec0-baseline) · [§2 测试用例](#sec2-cases) · [§4 测试环境](#sec4-setup) · [§6 Gate A 交接](#sec6-gatea)

### 主要价值

- 🧪 覆盖正常/边界/异常/回归四类用例
- 🎯 对齐故事任务 AC# 和使用场景，基线溯源闭合
- 🚦 Gate A 交接：输出结构完整性 + TTY 降级正确性
- 🔍 覆盖所有格式化函数和输出路径

---

<a id="sec0-baseline"></a>
## §0 基线溯源

| TC# | 覆盖 AC# | 覆盖场景 | 覆盖类型 | 状态 |
|-----|---------|---------|---------|------|
| TC-N1 | AC1 | 场景 1 | 正常 | 待执行 |
| TC-N2 | AC1 | 场景 2 | 正常 | 待执行 |
| TC-E1 | AC2 | 场景 3 | 异常 | 待执行 |

---

<a id="sec2-cases"></a>
## §2 测试用例

### 2.1 正常路径

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|--------|
| TC-N1 | help.mjs 可执行 | `node skills/rui-claude/help.mjs` | exit 0，含"快速入门""子命令""使用场景" | FP1, FP2 | P0 |
| TC-N2 | 终端 TTY | 执行帮助 | 含 ANSI 转义序列 | FP4 | P1 |

### 2.3 异常用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|--------|
| TC-E1 | 管道到 cat | `node help.mjs \| cat` | 无 ANSI 转义序列 | FP4, AC2 | P0 |

---

<a id="sec4-setup"></a>
## §4 测试环境

| 维度 | 配置 |
|------|------|
| 运行环境 | Node.js ≥ 18 |
| 测试目标 | skills/rui-claude/help.mjs |

---

<a id="sec6-gatea"></a>
## §6 Gate A 交接

| 信号 | 内容 |
|------|------|
| 通过状态 | TC-N1, TC-E1 全部通过 |
| P0 用例 ID | TC-N1, TC-E1 |
| 验证命令 | `node skills/rui-claude/help.mjs` |

---

> **变更记录**
> | 日期 | 变更 | 触发 | 证据 |
> |------|------|------|------|
> | 2026-05-23 | 初始生成 | /rui doc --from-code rui-claude-help-doc | 故事任务 §5 + 源码 |
