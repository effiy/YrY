---
doc_type: test
title: "YK-09-42: 跨语言翻译 Pipeline — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-42"
source_prds: ["45-架构设计-跨语言翻译Pipeline"]
source_modules: ["45-prd-task-跨语言翻译Pipeline"]
source_okr: [yiknowledge-001]
---

# YK-09-42: 跨语言翻译 Pipeline — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-TR-01 | 中→英翻译 | 中文文档→生成英文版 |
| UT-TR-02 | TM 匹配优先 | TM 已有翻译→复用（非重新 LLM 翻译） |
| UT-TR-03 | 质量评分 < 3.5→打回 | BLEU+COMET 综合分 < 3.5 → 标记需人工审阅 |
| UT-TR-04 | 发布到 `en/` 目录 | 翻译完成→`en/` 前缀目录 |

---