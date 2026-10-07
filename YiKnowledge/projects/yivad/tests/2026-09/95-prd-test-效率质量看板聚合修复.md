---
prd_task_id: "YV-09-95"
title: "效率/质量看板聚合修复 — 测试用例"
status: 已完成
priority: 中
owner: Chengliang.Yi
source_prds: ["95-prd-效率质量看板聚合修复"]
source_modules: ["YV-09-95-1"]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
type: test
tags: [测试用例, Bug修复, 后端]
category: 项目/管理后台/测试
roles: [engineer]
source: YiVad
benefit: "测试用例：效率质量看板聚合修复"
lifecycle: active
---

# 效率/质量看板聚合修复 — 测试用例

| # | 验证项 | 预期 | 结果 |
|---|--------|------|------|
| TC-01 | avg_cycle_time > 0 | ≥ 1 | ✅ 13.6 |
| TC-02 | throughput_per_week > 0 | ≥ 1 | ✅ 35 |
| TC-03 | current_wip > 0 | ≥ 1 | ✅ 199 |
| TC-04 | bug_rate > 0 | ≥ 1% | ✅ 36% |
| TC-05 | quality_score < 100 | < 100 | ✅ 47 |
| TC-06 | 无 project_key 时返回全量 | 不报错 | ✅ |