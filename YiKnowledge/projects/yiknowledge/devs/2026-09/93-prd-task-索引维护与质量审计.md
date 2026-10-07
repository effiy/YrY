---
doc_type: dev
title: "YiKnowledge 索引维护与质量审计 — 开发方案"
tags:
- 开发方案
- 知识库
- 索引
- frontmatter
category: 项目/知识库/开发
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: task
status: 已完成
priority: P1
project: YiKnowledge
project_id: yiknowledge
owner: Chengliang.Yi
prd_month: '202609'
dev_id: YK-09-93
prd_ref: YK-09-93
estimate: 0.25
review_status: 已评审
roles:
- curator
- engineer
---

# YiKnowledge 索引维护与质量审计 — 开发方案

> 开发编号：YK-09-93 · 关联 PRD：YK-09-93 · 预估人天：0.25d

---

## 一、变更清单

| 文件 | 变更 | 说明 |
|------|------|------|
| `projects/INDEX.md` | 更新 | 4 个项目计数对齐实际文件数 |
| `projects/yiknowledge/prds/2026-09/93-需求-索引维护与质量审计.md` | 新增 | 本轮审计 PRD |
| `projects/yiknowledge/devs/2026-09/93-prd-task-索引维护与质量审计.md` | 新增 | 本轮审计 Dev（本文件） |
| `projects/yiknowledge/tests/2026-09/93-prd-test-索引维护与质量审计.md` | 新增 | 本轮审计 Test |

---

## 二、实施步骤

### Step 1: 索引计数校准

统计各项目 `prds/`、`devs/`、`tests/`、`bugs/` 目录下的实际 `.md` 文件数量（排除 README.md），与 INDEX.md 中的声明值对比并更新。

### Step 2: draft 文档审核

扫描所有 `status: draft` / `status: 待审核` 的文档，评估是否可以升级为 `stable` 或标记为 `archived`。

---

## 三、验证

```bash
# 验证计数准确性
find YiKnowledge/projects/yivad/prds -name '*.md' ! -name 'README.md' | wc -l

# 验证 draft 文档清单
rg -l 'status:\s*draft' YiKnowledge/projects/
```

---

## 四、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/93-需求-索引维护与质量审计.md` |
| 测试 | `../tests/2026-09/93-prd-test-索引维护与质量审计.md` |