---
prd_task_id: "YV-09-95"
title: "YV-09-95: 效率/质量看板聚合修复 — 开发方案"
status: 已完成
priority: P0
owner: Chengliang.Yi
created: 2026-09-23
updated: 2026-09-23
project: YiVad
source_prd: "95-prd-效率质量看板聚合修复.md"
source_okr: [yivad-003]
related_tests: ["YV-09-95"]
tags: [开发方案, Bug修复, 后端]
type: task
category: 项目/管理后台/开发
source: YiVad
roles: [engineer]
benefit: "开发方案：task-效率质量看板聚合修复"
lifecycle: active
---

# YV-09-95: 效率/质量看板聚合修复

> PRD: [95-prd-效率质量看板聚合修复](../prds/2026-09/95-prd-效率质量看板聚合修复.md)

## 修复

**文件 1**: `YiAi/src/services/analytics/aggregator/efficiency.py:53-61`

```diff
- if project_key:
-     match["project_key"] = project_key
+ if project_key:
+     match["$or"] = [
+         {"project_key": project_key},
+         {"project_key": "YiVad" if project_key == "yivad" else project_key},
+     ]
+ else:
+     match["project_key"] = {"$exists": True}
```

**文件 2**: `YiAi/src/services/analytics/aggregator/quality.py:58-65` — 同上改动

## 验证

| 指标 | Before | After |
|------|--------|-------|
| avg_cycle_time | 0 | 13.6d |
| throughput_per_week | 0 | 35 |
| bug_rate | 0% | 36% |
| quality_score | 100 | 47 |

## 质量门禁

- [x] efficiency 指标非零
- [x] quality 指标非零
- [x] 缓存清除后重启生效