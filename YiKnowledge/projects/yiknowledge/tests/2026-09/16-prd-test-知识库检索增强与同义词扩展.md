---
doc_type: test
title: "YK-09-13: 知识库检索增强 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-13"
source_prds: ["16-架构设计-知识库检索增强与同义词扩展"]
source_modules: ["16-prd-task-知识库检索增强与同义词扩展"]
source_okr: [yiknowledge-001]
---

# YK-09-13: 知识库检索增强 — 测试用例

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-SN-01 | 同义词加载 | synonyms.json → MDB `knowledge_synonyms` 集合 |
| UT-SN-02 | 查询扩展 | "RAG" → 扩展为 ["RAG", "检索增强生成"] |
| UT-SN-03 | 领域隔离 | YiKnowledge 同义词不污染 YiAi 通用同义词表 |
| UT-SN-04 | JSON 格式校验 | 非法格式拒绝加载 + WARNING |

---

## 二、集成测试

| 编号 | 场景 | 预期 |
|------|------|------|
| IT-SN-01 | 同义词扩展检索全链路 | 查询"RAG" → 扩展 → 检索 → 返回含"检索增强生成"的文档 |
| IT-SN-02 | 策展人更新同义词 | 修改 synonyms.json → Watcher 扫描 → MDB 更新 → 查询立即生效 |

---

## 三、缺陷分级

| 级别 | 示例 |
|------|------|
| S2 — 一般 | 同义词 JSON 格式错误导致加载失败 |

---