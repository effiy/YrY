> | v1.0.0 | 2026-05-22 | deepseek-v4-pro | node skills/rui-story/collect.mjs | 🌿 feat/rui-story-collect-doc | 📎 [CLAUDE.md](../../../CLAUDE.md) |

> **导航**: [← YrY-技术评审](./YrY-技术评审.md) · [YrY-实施报告 →](./YrY-实施报告.md)

> **来源引用**: `/rui doc --from-code rui-story-collect-doc`，基于 `YrY-故事任务.md` §5 AC

## §0 基线溯源

| TC# | 覆盖 AC# | 覆盖场景 | 覆盖类型 | 状态 |
|-----|---------|---------|:--:|:--:|
| TC-N1 | AC1 单故事指标 | 场景 1 | 正常 | 待生成 |
| TC-N2 | AC2 跨故事汇总 | 场景 2 | 正常 | 待生成 |
| TC-N3 | AC3 异常检测 | 场景 3 | 正常 | 待生成 |
| TC-B1 | AC1 空数据文件 | 场景 1 空状态 | 边界 | 待生成 |
| TC-B2 | — 数据不足 | 场景 3 空状态 | 边界 | 待生成 |
| TC-E1 | AC4 目录不存在 | 场景 1 异常 | 异常 | 待生成 |

### 主要价值

- 🎯 三命令全覆盖：story/all/anomalies 正常/边界/异常
- 📊 指标精度验证到小数点后两位
- 🔍 D1-D7 异常检测规则逐条可测
- ⚡ 每用例可独立执行，数据准备用临时文件

---

## §1 测试范围

### 1.1 覆盖矩阵

| FP# | 功能点 | 正常 | 边界 | 异常 | 覆盖率 |
|-----|--------|:--:|:--:|:--:|:--:|
| FP1 | 单故事指标 | TC-N1 | TC-B1 | TC-E1 | 100% |
| FP2 | 跨故事汇总 | TC-N2 | — | — | 100% |
| FP3 | 异常检测 | TC-N3 | TC-B2 | — | 100% |
| FP4 | 数据容错 | — | TC-B1 | — | 100% |

---

## §2 测试用例

### 2.1 正常用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|:--:|
| TC-N1 | 故事 test 有 execution-memory.jsonl(3 条记录，含 1 条阻断) + tool-audit.jsonl(5 条，含 1 条 failure) | 执行 `collect story --story=test --format=json` | ① execution_count=3；② block_rate≈33.33%；③ tool_error_rate=20%；④ JSON 格式有效 | FP1 | P0 |
| TC-N2 | 项目有 2 个故事目录各有数据 | 执行 `collect all --format=json` | ① 输出 2 个元素数组；② 每个含全部 7 个指标；③ 汇总行含故事数和总记录数 | FP2 | P0 |
| TC-N3 | 故事 A 阻断率=50%, 故事 B 阻断率=10% | 执行 `collect anomalies` | ① 故事 A 标记 D1 效率退化（50% > 20%）；② 故事 B 不标记 | FP3 | P0 |

### 2.2 边界用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|:--:|
| TC-B1 | 故事 test 无任何数据文件 | 执行 `collect story --story=test` | ① 所有指标为 0；② execution_count=0；③ 不崩溃 | FP1, FP4 | P1 |
| TC-B2 | 项目仅有 1 个故事 | 执行 `collect anomalies` | ① 提示 "数据不足（需要 ≥ 2 个故事）" | FP3 | P1 |

### 2.3 异常用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|:--:|
| TC-E1 | 故事 missing 目录不存在 | 执行 `collect story --story=missing` | ① 提示 "故事目录不存在"；② exit(0) | FP1 | P1 |
| TC-E2 | story 命令缺少 --story 参数 | 执行 `collect story` | ① 提示需要 --story= | — | P2 |

---

## §3 Gate A 交接

| 信号 | 内容 |
|------|------|
| 通过状态 | ✅ 待执行 |
| P0 用例 ID | TC-N1, TC-N2, TC-N3 |
| 实现约束 | 纯 Node.js 标准库；JSONL 容错解析；TDD 先写测试 |
| 验证命令 | 逐用例手动执行 + jq 验证 JSON 输出 |

---

> | 日期 | 变更 | 触发 | 证据 |
> |------|------|------|------|
> | 2026-05-22 | 初始生成 | `/rui doc --from-code rui-story-collect-doc` | `YrY-故事任务.md` §5 |
