---
doc_type: test
title: "YK-09-26: 代码示例验证 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-26"
source_prds: ["29-架构设计-代码示例验证"]
source_modules: ["29-prd-task-代码示例验证"]
source_okr: [yiknowledge-001]
---

# YK-09-26: 代码示例验证 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-CE-01 | Python 代码块语法正确 | 执行成功，exit 0 |
| UT-CE-02 | Python 代码块语法错误 | 执行失败 → CI 通知作者 |
| UT-CE-03 | 非代码块内容不执行 | bash/shell 标记的代码块跳过 |

---