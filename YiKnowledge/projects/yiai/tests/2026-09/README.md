---
doc_type: index
title: YiAi 测试文档索引
category: 项目/后端/测试
created: 2026-09-11
updated: 2026-09-11
project: YiAi
---

# YiAi 测试文档索引

> 258 个测试规格文档——每个 PRD 对应一个 test spec，描述 VERIFY（测试策略、测试用例、回归计划）。
> 完整追溯链：**OKR → PRD → Dev Module → Test**

## 月度分布

| 月份 | PRD 数 | Dev 模块数 | Test 规格数 |
|------|--------|-----------|------------|
| 2026-07 | 8 | [8](../devs/2026-07/) | [8](./2026-07/) |
| 2026-08 | 16 | [16](../devs/2026-08/) | [16](./2026-08/) |
| 2026-09 | 233 | [233](../devs/2026-09/) | [233](./2026-09/) |

## 文件命名约定

```
tests/{month}/NN-prd-test-{描述}.md   → 测试规格文档
prds/{month}/NN-{type}-{描述}.md      → 来源 PRD
devs/{month}/NN-prd-task-{描述}.md    → 对应开发模块
```

## 追溯规则

- **每个 Test 通过 `source_prds` 关联到来源 PRD**
- **每个 Test 通过 `source_modules` 关联到 Dev Module**
- **每个 Dev Module 通过 `prd_task_id` 关联到 PRD**
- 完整链路：`OKR goal → PRD (source_okr) → Dev Module (prd_task_id) → Test (source_prds)`