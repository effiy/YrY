> | v1.0.0 | 2026-05-22 | deepseek-v4-pro | ⏱️ — | 📎 [CLAUDE.md](../../../CLAUDE.md) |

> **导航**: [← YrY-技术评审](./YrY-技术评审.md)

[§0 基线溯源](#sec0-baseline) · [§2 测试用例](#sec2-cases) · [§3 Gate A 交接信号](#sec3-gatea)

# YrY-测试设计 · rui-branch-check

<a id="sec0-baseline"></a>
## §0 基线溯源

| AC# | 测试覆盖 |
|-----|---------|
| AC1 | §2.1 自动创建 |
| AC2 | §2.2 嵌套阻断 |
| AC3 | §2.3 匹配通过 |

### 主要价值

- 🎯 验证三种模式正确性
- 🔒 验证阻断逻辑严格

---

<a id="sec2-cases"></a>
## §2 测试用例

| UC# | Given | When | Then | 类型 | 关联 AC |
|-----|-------|------|------|------|---------|
| UC-W01 | 当前在 main，story=test | write 模式 | 创建 feat/test 并切换，exit 0 | 正常 | AC1 |
| UC-W02 | 当前在 feat/test | write 模式 story=test | 通过验证，exit 0 | 正常 | AC3 |
| UC-W03 | 当前在 feat/other | write 模式 story=test | 阻断 no-nested-branch，exit 1 | 异常 | AC2 |
| UC-W04 | 当前在 feat/other（非 main 创建） | write 模式 story=other | 阻断 bad-branch | 异常 | — |
| UC-R01 | 当前在 main | read 模式 | 报告状态，exit 0 | 正常 | — |
| UC-I01 | 当前在 main | init 模式 | 允许通过，exit 0 | 正常 | — |

---

<a id="sec3-gatea"></a>
## §3 Gate A 交接信号

| 信号 | 值 |
|------|-----|
| P0 用例 | UC-W01, UC-W03, UC-W04 |
| 验证命令 | `node skills/rui/branch-check.mjs --story=test --mode=write` |
| 阻塞条件 | 非 feat/<name> 分支上执行写操作 |

---

> | 日期 | 变更 | 触发 | 证据 |
> |------|------|------|------|
> | 2026-05-22 | 初始生成 | /rui doc --from-code | skills/rui/branch-check.mjs |
