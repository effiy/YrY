# 数据契约

三个数据文件支撑 rui 的记忆与改进引擎。每个故事独立存储，全局聚合用于跨故事分析。

## 存储路径

```
docs/故事任务面板/<name>/
├── .improvement/
│   └── proposals.jsonl
└── .memory/
    ├── execution-memory.jsonl
    └── rui-state.json

docs/                           ← 全局聚合
├── .improvement/
│   ├── proposals.jsonl
│   └── .last-health.json
└── .memory/
    ├── execution-memory.jsonl
    └── rui-state.json
```

写入规则：指定 `--name` 时双写（per-story + 全局）；未指定时仅写全局。

## execution-memory.jsonl

追加写入，每行一个 JSON 对象。

| 字段 | 类型 | 描述 |
|------|------|------|
| session_id | string | 唯一会话标识 |
| timestamp | ISO 8601 | 记录时间 |
| story_name | string | 所属故事 |
| feature | string | 故事/功能名称 |
| description | string | 执行描述 |
| planned_change_level | T1\|T2\|T3 | 计划变更级别 |
| actual_change_level | T1\|T2\|T3 | 实际变更级别 |
| phase_transitions | array | `[{from, to, timestamp, duration_ms}]` |
| update_context | string\|null | update 命令的补充上下文 |
| agents_called | string[] | 调用的 agent 列表 |
| quality_issues | object | `{P0:[{doc_type, section, issue}], P1, P2}` |
| bad_cases | array | `[{agent, lesson}]` |
| was_blocked | boolean | 是否触发阻断 |
| block_reason | string | 阻断原因 |

消费方：`/rui update` 查询历史案例 → `/rui`(空输入) 扫描 P0 问题 → `self-improve.js trends` 趋势分析。

## rui-state.json

单对象 JSON 文件，记录当前管线状态。

| 字段 | 类型 | 描述 |
|------|------|------|
| session_id | string | 当前会话标识 |
| command | string | 触发命令 |
| name | string | 故事名称 |
| current_stage | string | 当前阶段 |
| blocked | boolean | 是否阻断 |
| block_reason | string\|null | 阻断原因 |
| timestamp | ISO 8601 | 最后更新时间 |
| storyboard | string | 故事任务文件路径 |
| pipeline_progress | object | `{"阶段名":"completed\|in_progress\|blocked\|not_started"}` |
| change_history | array | `[{timestamp, from_stage, to_stage, trigger}]` |
| related_proposals | string[] | 关联 proposal ID |

消费方：`/rui list` 读取 pipeline_progress → `/rui`(空输入) 读取 blocked 阶段 → `rui-state.js next-step` 推荐下一步。

## proposals.jsonl

追加写入，每行一个 JSON 对象。自改进引擎生成。

| 字段 | 类型 | 描述 |
|------|------|------|
| id | string | 唯一标识 |
| date | YYYY-MM-DD | 创建日期 |
| title | string | 提案标题 |
| type | string | refactor/perf/security/quality/process |
| priority | P0\|P1\|P2\|P3 | 优先级 |
| status | open\|done\|superseded | 状态 |
| story_name | string\|null | 所属故事 |
| source_phase | string\|null | 生成阶段 |
| actionable_command | string\|null | 可执行 rui 命令 |
| linked_memory_ids | string[] | 关联 session_id |
| problem_source | string | 问题来源 |
| evidence | string | 证据描述 |
| current_state | string | 当前状态 |
| target_state | string | 目标状态 |
| s1_metrics | object | 六维架构指标 |
| s2_metrics | object | 工流趋势指标 |
| feedback | array | `[{rating, note, date}]` |
| eval_result | improved\|degraded\|neutral\|pending\|null | 效果评估 |

消费方：`/rui`(空输入) 读取 open 提案 → `/rui update` 关联提案辅助上下文 → `loop.js run` 生成 §L。

## 数据流

```
/rui 执行 → execution-memory.jsonl (记录) + rui-state.json (进度)
  → self-improve.js (趋势+效果评估)
    → proposals.jsonl (改进提案)
      → /rui(空输入) 推荐 / /rui update 上下文 / loop.js run §L
```
