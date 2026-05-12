# 数据契约

每个故事独立存储执行记忆和改进提案。

## 存储路径

```
docs/故事任务面板/<project>-<name>/
├── .improvement/proposals.jsonl
└── .memory/
    ├── execution-memory.jsonl
    └── rui-state.json
```

## execution-memory.jsonl

追加写入，每行一个 JSON 对象。字段: `session_id`, `timestamp`, `story_name`, `feature`, `description`, `planned_change_level`(T1|T2|T3), `actual_change_level`(T1|T2|T3), `phase_transitions`([{from,to,timestamp,duration_ms}]), `update_context`, `agents_called`(string[]), `quality_issues`({P0:[],P1:[],P2:[]}), `bad_cases`([{agent,lesson}]), `was_blocked`, `block_reason`.

## rui-state.json

单对象 JSON，记录当前管线状态。字段: `session_id`, `command`, `name`, `current_stage`, `blocked`, `block_reason`, `timestamp`, `storyboard`, `pipeline_progress`({"阶段":"completed|in_progress|blocked|not_started"}), `change_history`([{timestamp,from_stage,to_stage,trigger}]), `related_proposals`(string[]).

阻断恢复：重跑同一 `/rui` 命令从 `current_stage` 继续。

## proposals.jsonl

自改进引擎追加写入。字段: `id`, `date`, `title`, `type`(refactor|perf|security|quality|process), `priority`(P0-P3), `status`(open|done|superseded), `story_name`, `source_phase`, `actionable_command`, `linked_memory_ids`, `problem_source`, `evidence`, `current_state`, `target_state`, `s1_metrics`(耦合/内聚/边界), `s2_metrics`(阻断率/P0轮次), `feedback`([{rating,note,date}]), `eval_result`(improved|degraded|neutral|pending).

效果评估需要前后各 ≥3 条执行记忆才有中等置信度。

## 数据流

```
/rui 执行 → execution-memory.jsonl + rui-state.json
  → self-improve.js (观察→诊断→改进)
    → proposals.jsonl
      → recommend.js 推荐 / /rui update 上下文 / loop.js §L
```
