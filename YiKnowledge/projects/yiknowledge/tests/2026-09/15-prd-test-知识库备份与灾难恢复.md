---
doc_type: test
title: "YK-09-12: 知识库备份与灾难恢复 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-12"
source_prds: ["15-架构设计-知识库备份与灾难恢复"]
source_modules: ["15-prd-task-知识库备份与灾难恢复"]
source_okr: [yiknowledge-001]
---

# YK-09-12: 知识库备份与灾难恢复 — 测试用例

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-BK-01 | MDB dump 成功 | 生成 JSON 文件，`knowledge_files` 文档数匹配 |
| UT-BK-02 | Git bundle 打包 | 生成 `.bundle` 文件 |
| UT-BK-03 | 恢复：MDB import | 清空 MDB → import dump → 文档数一致 |
| UT-BK-04 | 恢复：Git unbundle | 恢复后 YiKnowledge 文件完整 |

---

## 二、集成测试

| 编号 | 场景 | 预期 |
|------|------|------|
| IT-BK-01 | 完整灾难恢复演练 | MDB dump + Git bundle → 清空全部 → 从备份恢复 → RAG 检索正常 |
| IT-BK-02 | 增量备份仅含变更 | 修改 3 个文件后增量备份 → 备份大小 < 全量 10% |

---

## 三、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | MDB dump 文件为空或无法 import |
| S2 — 一般 | Git bundle 缺少最新的 commit |

---