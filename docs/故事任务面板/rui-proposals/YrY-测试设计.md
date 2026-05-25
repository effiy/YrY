> | v1.0.0 | 2026-05-22 | deepseek-v4-pro | ⏱️ — | 📎 [CLAUDE.md](../../../CLAUDE.md) |

> **导航**: [← YrY-技术评审](./YrY-技术评审.md)

# YrY-测试设计 · rui-proposals

## §0 基线溯源

| AC# | 测试覆盖 |
|-----|---------|
| AC1 | §2.1 诊断生成 |
| AC2 | §2.2 列表查询 |
| AC3 | §2.3 数据不足降级 |

### 主要价值

- 🎯 验证 D0-D7 诊断引擎准确性
- 📊 验证数据不足时的降级行为
- 🔄 验证提案生命周期完整性

---

## §2 测试用例

### §2.1 诊断生成

| UC# | Given | When | Then | 类型 |
|-----|-------|------|------|------|
| UC-G01 | exec-memory ≥ 3 条，含阻断记录 | generate | 生成 ≥ 1 个提案 | 正常 |
| UC-G02 | exec-memory < 3 条 | generate | 降级提示，不生成提案 | 边界 |
| UC-G03 | 阻断率 > 20% | generate | 生成 D2 类型提案 | 正常 |
| UC-G04 | 无匹配诊断模式 | generate | 输出健康声明 | 边界 |

### §2.2 提案管理

| UC# | Given | When | Then | 类型 |
|-----|-------|------|------|------|
| UC-L01 | proposals.jsonl 有 5 条 | list --status=open | 仅输出 open 状态 | 正常 |
| UC-E01 | 提案前后各有 ≥ 3 条记忆 | evaluate | 输出 E1-E4 评分 | 正常 |
| UC-M01 | 有 open 提案 | materialize --dry-run | 预览不创建 | 正常 |

---

## §3 Gate A 交接信号

| 信号 | 值 |
|------|-----|
| P0 用例 | UC-G01, UC-G02, UC-G03 |
| 验证命令 | `node skills/rui/proposals.mjs generate --story=test` |
| 阻塞条件 | 有足够数据但未生成提案 |

---

> | 日期 | 变更 | 触发 | 证据 |
> |------|------|------|------|
> | 2026-05-22 | 初始生成 | /rui doc --from-code rui-proposals-doc | skills/rui/proposals.mjs |
