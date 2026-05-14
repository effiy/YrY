# 数据契约

> **定位**：每个文档目录的 `.memory/` 与 `.improvement/` 字段定义。脚本由 `~/.claude/plugins/marketplaces/yry/skills/rui/scripts/` 管理，人工不编辑。

五类文档（故事任务面板 / 组件文档 / 接口文档 / 页面文档 / 领域模型）均按 `docs/<文档类>/<Project>/<name>/` 组织，附属目录结构相同。

## 存储路径

```
docs/<文档类>/<Project>/<name>/
├── .improvement/proposals.jsonl
└── .memory/
    ├── execution-memory.jsonl
    └── rui-state.json
```

`/rui update` 接受两种输入：故事名 `<Project>-<name>`（→ `docs/故事任务面板/<Project>/<name>/`），或目录路径 `<文档类>/<Project>/<name>`。

## execution-memory.jsonl

追加写入，每行一个 JSON 对象。

| 字段 | 类型 | 含义 |
|------|------|------|
| `session_id` | string | 当次 rui 会话 |
| `timestamp` | ISO-8601 | 写入时刻 |
| `story_name` | string | `<Project>-<name>` |
| `feature` / `description` | string | 变更主题 |
| `planned_change_level` | T1\|T2\|T3 | 规划裁剪等级 |
| `actual_change_level` | T1\|T2\|T3 | 实际裁剪等级 |
| `phase_transitions` | `[{from,to,timestamp,duration_ms}]` | 阶段切换轨迹 |
| `update_context` | string | `/rui update` 上下文 |
| `agents_called` | string[] | 触达的 Agent |
| `quality_issues` | `{P0,P1,P2}` | 各级别问题列表 |
| `bad_cases` | `[{agent,lesson}]` | 失败教训 |
| `was_blocked` | bool | 是否被阻断 |
| `block_reason` | string | 阻断标识 |

## rui-state.json

单对象 JSON，每次阶段变更覆盖写。

| 字段 | 类型 | 含义 |
|------|------|------|
| `session_id` | string | 当次会话 |
| `command` | string | rui 子命令 |
| `name` | string | `<Project>-<name>` |
| `current_stage` | string | 当前阶段 |
| `blocked` | bool | 是否阻断 |
| `block_reason` | string | 阻断标识 |
| `timestamp` | ISO-8601 | 最近写入 |
| `storyboard` | object | 故事板快照 |
| `pipeline_progress` | `{阶段: completed\|in_progress\|blocked\|not_started\|skipped}` | 各阶段进度 |
| `delivery_pipeline` | `{log_appended, docs_synced, notification_sent, last_step_at, last_step}` | 三步交付状态 |
| `change_history` | `[{timestamp,from_stage,to_stage,trigger}]` | 阶段变更历史 |
| `related_proposals` | string[] | 关联提案 ID |
| `no_code` | bool | `--no-code` 模式标记 |

**恢复策略**：重跑同 `/rui` 命令从 `current_stage` 续。`--no-code` 模式下代码阶段（预检→测试先行→实现→验证）全部标记 `skipped`，直接进入交付。

## proposals.jsonl

self-improve 引擎追加写入。

| 字段 | 类型 | 含义 |
|------|------|------|
| `id` | string | 提案 ID |
| `date` | ISO-8601 | 创建日期 |
| `title` | string | 标题 |
| `type` | refactor\|perf\|security\|quality\|process | 类别 |
| `priority` | P0\|P1\|P2\|P3 | 优先级 |
| `status` | open\|done\|superseded | 状态 |
| `story_name` | string | 来源故事 |
| `source_phase` | string | 触发阶段 |
| `actionable_command` | string | 可执行动作 |
| `linked_memory_ids` | string[] | 关联的记忆条目 |
| `problem_source` / `evidence` | string | 数据证据 |
| `current_state` / `target_state` | string | 当前 → 目标 |
| `s1_metrics` | object | 耦合 / 内聚 / 边界 |
| `s2_metrics` | object | 阻断率 / P0 轮次 |
| `feedback` | `[{rating,note,date}]` | 反馈记录 |
| `eval_result` | improved\|degraded\|neutral\|pending | 效果评估 |

效果评估需前后各 ≥3 条执行记忆才有中等置信度，规则见 [rules/self-improve.md](../../rules/self-improve.md) E1–E4。

## 数据流

```mermaid
flowchart LR
    A[/rui 执行/] --> B[execution-memory.jsonl + rui-state.json]
    B --> C[self-improve.js<br/>观察→诊断→改进]
    C --> D[proposals.jsonl]
    D --> E1[recommend.js 推荐]
    D --> E2[/rui update 上下文]
    D --> E3[loop.js §L 追加]
```
