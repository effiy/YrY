---
doc_type: test
title: "YK-09-24: 协作编辑冲突解决 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-24"
source_prds: ["27-架构设计-协作编辑冲突解决"]
source_modules: ["27-prd-task-协作编辑冲突解决"]
source_okr: [yiknowledge-001]
---

# YK-09-24: 协作编辑冲突解决 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-CF-01 | 编辑锁检测 | 他人在编辑 → 黄色提示 "xxx 正在编辑" |
| UT-CF-02 | Git 冲突标记解析 | `<<<<<<<`/`=======`/`>>>>>>>` 高亮显示 |
| UT-CF-03 | 非冲突合并 | Git 自动合并，无冲突标记 |

---