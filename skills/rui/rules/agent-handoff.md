# agent-handoff — Agent 交接规范

> 每个 Agent 的输出必须是下游 Agent 可直接验证的输入。模糊交接 = 管线断裂。

[交接信号格式](#交接信号格式) · [Agent 间契约](#agent-间契约) · [验证标准](#验证标准) · [阻断条件](#阻断条件)

---

## 交接信号格式

每对 Agent 交接时，产出方必须提供以下结构化信号：

| 字段 | 必选 | 说明 | 示例 |
|------|:---:|------|------|
| `from` | ✓ | 产出 Agent 名 | `pm` |
| `to` | ✓ | 消费 Agent 名 | `coder` |
| `stage` | ✓ | 当前管线阶段 | `doc → code` |
| `deliverable` | ✓ | 交付物路径 | `docs/故事任务面板/user-login/故事任务.md` |
| `acceptance` | ✓ | 下游验证方式 | `grep "FP#" 故事任务.md \| wc -l ≥ 3` |
| `p0_count` | ✓ | 已知 P0 数量 | `0`（必须为 0 方可交接） |
| `evidence_level` | ✓ | 结论证据等级 | `A` / `B` / `C` |
| `blockers` | — | 阻断项（如有） | `no-parse` / `doc-p0` |

---

## Agent 间契约

### pm → planner

| 产出 | 验证 |
|------|------|
| 故事任务.md（含 FP# / AC / SC / 风险） | 每个 FP# 对应至少 1 条 AC |
| 场景拆分清单（≥1 场景） | 场景-1~N-&lt;slug&gt;.md 均存在 §0 + §1 |
| 知识图谱基线（story + scene 节点） | `nodes[type=story]` ≥ 1 |

**阻断**：FP# 无 AC → `no-ac`；场景数 = 0 → `no-scene`

### planner → coder

| 产出 | 验证 |
|------|------|
| plan.html + 计划清单.html | 计划清单每项含具体文件路径 |
| 逐模块任务分解（每项 2-5 分钟） | 无 placeholder / TBD |
| P0 预估清单 | P0 项 ≤ 模块数 × 2 |

**阻断**：计划含 TBD → `plan-placeholder`；计划项无文件路径 → `no-file-map`

### coder → tester

| 产出 | 验证 |
|------|------|
| 实现代码 + git diff | `git diff --stat` 可读 |
| 场景-N-&lt;slug&gt;.md §2 实施报告 | 报告含实际文件路径 + 行号 |
| P0 清零证明 | `grep "P0" §2 \| grep -c "✅"` = 报告 P0 数 |

**阻断**：P0 未清零 → `code-p0`；实施报告缺失 → `no-impl-report`

### tester → reporter

| 产出 | 验证 |
|------|------|
| 场景-N-&lt;slug&gt;.md §1 测试设计 + §3 测试报告 | §1 覆盖矩阵每 FP ≥3 类 |
| Gate B 评估（P0 100% / P1 ≥80% / 修复 ≤2 轮） | Gate B 三项全达标 |
| 测试执行输出（原始日志或摘要） | 输出含通过/失败计数 |

**阻断**：Gate B 未通过 → `gate-b-limit`；覆盖不足 → `no-coverage`

### reporter → pm

| 产出 | 验证 |
|------|------|
| 场景文档各 § 交叉引用闭合 | §1/§2/§3 无矛盾 |
| 知识图谱一致性报告 | FP ↔ 节点 ↔ 实现 全对应 |
| git commit（策展） | `git log --oneline -1` 含故事名 |

**阻断**：交叉引用有矛盾 → `xref-broken`；未 commit → `no-curation`

---

## 验证标准

| 维度 | 达标条件 | 验证命令/方法 |
|------|---------|-------------|
| **可达性** | 交付物路径存在且可读 | `test -f <path>` |
| **完整性** | 必选字段全部非空 | 逐字段检查 |
| **一致性** | 下游 Agent 解析无误 | 下游 Agent 启动时自检 |
| **可追溯** | 每条结论指向具体文件+行号 | `grep` 追溯 |
| **无阻断** | `blockers` 为空且 `p0_count` = 0 | 交接前自检 |

---

## 阻断条件

| 阻断标识 | 触发条件 | 处置 |
|---------|---------|------|
| `no-handoff` | 产出 Agent 未提供交接信号 | 退回产出 Agent 补信号 |
| `handoff-incomplete` | 必选字段缺失 | 退回补全 |
| `handoff-unverifiable` | 下游无法验证（路径不存在 / 命令失败） | 退回修正路径 |
| `p0-in-handoff` | 交接信号中 `p0_count` > 0 | 阻断，P0 清零后方可交接 |
| `evidence-downgrade` | 声称 A 但实际为 C | 降级证据等级并标注 |
