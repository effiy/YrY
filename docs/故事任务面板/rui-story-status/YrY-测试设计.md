> | v1.0.0 | 2026-05-22 | deepseek-v4-pro | node skills/rui-story/status.mjs | 🌿 feat/rui-story-status-doc | 📎 [CLAUDE.md](../../../CLAUDE.md) |

> **导航**: [← YrY-技术评审](./YrY-技术评审.md) · [YrY-实施报告 →](./YrY-实施报告.md)

> **来源引用**: `/rui doc --from-code rui-story-status-doc`，基于 `YrY-故事任务.md` §5 AC

[§0 基线溯源](#sec0-baseline) · [§1 测试范围](#sec1-scope) · [§2 测试用例](#sec2-cases) · [§3 Gate A 交接](#sec3-gatea)

<a id="sec0-baseline"></a>
## §0 基线溯源

| TC# | 覆盖 AC# | 覆盖场景 | 覆盖类型 | 状态 |
|-----|---------|---------|:--:|:--:|
| TC-N1 | AC1 合法转移 | 场景 1 | 正常 | 待生成 |
| TC-N2 | AC2 非法转移 | 场景 1 | 正常 | 待生成 |
| TC-N3 | AC3 执行转移 | 场景 2 | 正常 | 待生成 |
| TC-N4 | AC4 仪表板 | 场景 3 | 正常 | 待生成 |
| TC-N5 | AC5 dry-run | 场景 2 | 正常 | 待生成 |
| TC-B1 | AC3 空 rui-state | 场景 2 空状态 | 边界 | 待生成 |
| TC-B2 | AC4 无故事目录 | 场景 3 空状态 | 边界 | 待生成 |
| TC-E1 | — 非法转移执行 | 场景 2 | 异常 | 待生成 |

### 主要价值

- 🎯 六阶段 7 条转移全路径覆盖
- 🔀 check/transition/dashboard 三命令四类用例齐全
- 🛡️ 非法转移拒绝 + 合法目标提示验证
- ⚡ 每用例可独立执行，用临时故事目录隔离

---

<a id="sec1-scope"></a>
## §1 测试范围

### 1.1 覆盖矩阵

| FP# | 功能点 | 正常 | 边界 | 异常 | 覆盖率 |
|-----|--------|:--:|:--:|:--:|:--:|
| FP1 | 转移验证 | TC-N1, TC-N2 | — | — | 100% |
| FP2 | 转移执行 | TC-N3 | TC-B1 | TC-E1 | 100% |
| FP3 | 仪表板 | TC-N4 | TC-B2 | — | 100% |
| FP4 | dry-run | TC-N5 | — | — | 100% |

---

<a id="sec2-cases"></a>
## §2 测试用例

### 2.1 正常用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|:--:|
| TC-N1 | — | 执行 `status check --from=设计 --to=实施` | ① 绿色 ✓ 合法转移；② exit(0) | FP1 | P0 |
| TC-N2 | — | 执行 `status check --from=设计 --to=改进` | ① 红色 ✗ 非法转移；② 列出合法目标 "任务, 实施"；③ exit(1) | FP1 | P0 |
| TC-N3 | 故事 test 当前状态=设计，rui-state.json 存在 | 执行 `status transition --story=test --to=实施 --reason=code完成` | ① status 更新为实施；② history 追加 1 行含 reason；③ exit(0) | FP2 | P0 |
| TC-N4 | 项目有 2 个故事（状态分别为 设计/测试） | 执行 `status dashboard` | ① 状态分布含 设计=1, 测试=1；② 故事列表 2 行 | FP3 | P0 |
| TC-N5 | 故事 test 当前=设计 | 执行 `status transition --story=test --to=实施 --dry-run` | ① 预览 "将执行: 设计 → 实施"；② 文件未修改 | FP4 | P1 |

### 2.2 边界用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|:--:|
| TC-B1 | 故事 test 目录无 rui-state.json | 执行 `status transition --story=test --to=设计` | ① 自动初始化为"任务"→"设计"；② 新建 rui-state.json | FP2 | P0 |
| TC-B2 | 项目无故事目录 | 执行 `status dashboard` | ① "docs/故事任务面板/ 下无故事目录" | FP3 | P1 |

### 2.3 异常用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|:--:|
| TC-E1 | 故事 test 当前=实施 | 执行 `status transition --story=test --to=任务` | ① 红色 "非法转移"；② 列出合法目标 "设计, 测试"；③ exit(0) | FP2 | P1 |

---

<a id="sec3-gatea"></a>
## §3 Gate A 交接

| 信号 | 内容 |
|------|------|
| 通过状态 | ✅ 待执行 |
| P0 用例 ID | TC-N1, TC-N2, TC-N3, TC-N4, TC-B1 |
| 实现约束 | 纯 Node.js 标准库；状态机不可破环；TDD 先写测试 |
| 验证命令 | 逐用例手动执行 + 验证 rui-state.json 内容变更 |

---

> | 日期 | 变更 | 触发 | 证据 |
> |------|------|------|------|
> | 2026-05-22 | 初始生成 | `/rui doc --from-code rui-story-status-doc` | `YrY-故事任务.md` §5 |
