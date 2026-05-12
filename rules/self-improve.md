---
paths:
  - "docs/故事任务面板/**/.improvement/**"
  - "docs/故事任务面板/**/.memory/**"
  - ".claude/skills/rui/scripts/**"
---

# Self-Improve Rules

## 核心规则

1. 数据驱动: 提案必须有 snapshot 证据支撑，无数据不产出提案
2. 基线校准: 诊断以项目基线文件（CLAUDE.md 哲学/原则/准则、project-profile.json 项目类型/Coder公式、rules/ 管线规则、agents/ 角色定义）为判定基准
3. `no-metrics` 降级: 数据采集失败时跳过，不阻断交付
4. proposals.jsonl append-only，不删除历史记录
5. 效果评估至少需要前后各 3 条执行记忆才有中等置信度
6. 单次执行，不阻断主流程

## 诊断规则

> 诊断以项目基线文件为基准。每条诊断规则触发时，必须在提案中引用对应的基线文件作为判定依据。

| # | 规则 | 触发条件 | 动作 | 基线依据 |
|---|------|---------|------|---------|
| D0 | 基线偏离 | 执行记忆中出现与 CLAUDE.md 哲学/原则/准则冲突的事件 | 生成 P0 process 提案，标注冲突的基线条款 | CLAUDE.md · agents/ |
| D1 | 阻断率阈值 | 近 4 周阻断率 > 20% | 生成 P1 process 提案，分析阻断原因分布 | gate-rules.md · code-pipeline.md |
| D2 | P0 密度阈值 | 单故事 P0 数 > 平均值 2x | 生成 P1 quality 提案，检查设计审查阶段 | doc-generation.md · gate-rules.md |
| D3 | 变更级别漂移 | T3 变更占比 > 30% | 生成 P2 process 提案，检查需求拆分质量 | docs.md 故事拆分规则 |
| D4 | Gate B 循环 | 单故事 Gate B > 2 轮修复 | 生成 P1 quality 提案，检查测试先行覆盖 | gate-rules.md |
| D5 | 阶段耗时异常 | 单阶段耗时 > 同类型故事平均值 3x | 生成 P2 process 提案，分析 Agent 协作瓶颈 | agents/ · project-profile.json |
| D6 | 连续退化 | 连续 2 窗口阻断率或 P0 率上升 | 生成 P0 process 提案，阻止持续恶化 | CLAUDE.md 退化对策 |
| D7 | 提案积压 | 开放提案 > 已完成 2x 且总量 > 5 | 生成 P3 process 提案，检查优先级和可执行性 | self-improve.md 效果评估规则 |

## 效果评估规则

| # | 指标 | 改善判定 | 退化判定 |
|---|------|---------|---------|
| E1 | 阻断率 | 提案后 < 提案前 | 提案后 > 提案前 |
| E2 | P0 密度 | 提案后 < 提案前 | 提案后 > 提案前 |
| E3 | 关联 bad_case | 消失 | 仍出现 |
| E4 | 综合判断 | 改善指标 > 退化指标 | 退化指标 > 改善指标 |
