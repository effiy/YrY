# self-improving

快速参考：持续改进数据收集与周报整合技能。

## 命令

```bash
/self-improving collect              # 扫描所有 feature 文档，提取标准化反思章节
/self-improving weekly [YYYY-MM-DD]  # 生成本周聚合报告，供 weekly-analyzer 使用
```

## 核心职责

1. **收集**：从 `generate-document` 和 `implement-code` 生成的每一份文档中，提取 `Workflow Standardization Review` 和 `System Architecture Evolution Thinking`。
2. **聚合**：按自然周汇总，统计高频问题、重复劳动、架构瓶颈等模式。
3. **反馈**：将聚合结果写入 `docs/weekly/<week>/self-improvement-aggregate.md`，作为周报 §5.2 和 §5.3 的数据来源。

## 依赖

- `skills/generate-document`（文档生成方）
- `skills/implement-code`（代码实现 summary 生成方）
- `agents/weekly-analyzer`（周报消费方）

## 输出样例

```markdown
# Self-Improvement Aggregate (2026-04-27~2026-05-03)

## Workflow Standardization Review Summary

| Feature | Q1 Repeat Ops | Q2 Fuzzy Decision | Q3 Info Silo | Q4 Feedback Loop |
|---------|---------------|-------------------|--------------|------------------|
| user-login | Yes → scripted | No | No | Yes |

## System Architecture Evolution Thinking Summary

| Feature | Bottleneck | Evolution Node | Risk & Rollback |
|---------|------------|----------------|-----------------|
| user-login | scalability | shard session store | risk: data migration; rollback: dual-write |
```