---
doc_type: test
title: "YiKnowledge 索引维护与质量审计 — 测试方案"
tags:
- 测试方案
- 知识库
- 索引
- frontmatter
category: 项目/知识库/测试
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: test
status: 已完成
priority: P1
project: YiKnowledge
project_id: yiknowledge
owner: Chengliang.Yi
prd_month: '202609'
test_id: YK-09-93
prd_ref: YK-09-93
dev_ref: YK-09-93
estimate: 0.125
review_status: 已评审
roles:
- curator
---

# YiKnowledge 索引维护与质量审计 — 测试方案

> 测试编号：YK-09-93 · 关联 PRD：YK-09-93 · 关联 Dev：YK-09-93

---

## 一、测试用例

### TC-001: YiVad 文件计数

```bash
find YiKnowledge/projects/yivad/prds -name '*.md' ! -name 'README.md' | wc -l  # → 105
find YiKnowledge/projects/yivad/devs -name '*.md' ! -name 'README.md' | wc -l  # → 106
find YiKnowledge/projects/yivad/tests -name '*.md' ! -name 'README.md' | wc -l  # → 105
find YiKnowledge/projects/yivad/bugs -name '*.md' ! -name 'README.md' | wc -l  # → 106
```

### TC-002: YiAi 文件计数

```bash
find YiKnowledge/projects/yiai/prds -name '*.md' ! -name 'README.md' | wc -l  # → 261
find YiKnowledge/projects/yiai/devs -name '*.md' ! -name 'README.md' | wc -l  # → 262
find YiKnowledge/projects/yiai/tests -name '*.md' ! -name 'README.md' | wc -l  # → 261
find YiKnowledge/projects/yiai/bugs -name '*.md' ! -name 'README.md' | wc -l  # → 104
```

### TC-003: YiPet 文件计数

```bash
find YiKnowledge/projects/yipet/prds -name '*.md' ! -name 'README.md' | wc -l  # → 254
find YiKnowledge/projects/yipet/devs -name '*.md' ! -name 'README.md' | wc -l  # → 254
find YiKnowledge/projects/yipet/tests -name '*.md' ! -name 'README.md' | wc -l  # → 254
find YiKnowledge/projects/yipet/bugs -name '*.md' ! -name 'README.md' | wc -l  # → 72
```

### TC-004: No orphaned files

```bash
# All .md files in projects/ must have valid frontmatter
find YiKnowledge/projects -name '*.md' ! -name 'README.md' ! -name 'INDEX.md' | while read f; do
  head -1 "$f" | grep -q '^---$' || echo "NO FRONTMATTER: $f"
done
```

**预期**：无输出（所有文件都有 frontmatter）。

### TC-006: No stale draft docs without review plan

**预期**：所有 `status: draft` 文档应有 `review_cycle` 字段或明确的升级计划。

---

## 二、测试结果

| 测试编号 | 描述 | 结果 | 备注 |
|----------|------|------|------|
| TC-001 | YiVad 计数 | ✅ | 105/106/105/106 |
| TC-002 | YiAi 计数 | ✅ | 261/262/261/104 |
| TC-003 | YiPet 计数 | ✅ | 254/254/254/72 |
| TC-004 | 无孤立文件 | ✅ | 所有文件有 frontmatter |
| TC-006 | draft 审核 | — | 14 个 draft 文档待审核 |