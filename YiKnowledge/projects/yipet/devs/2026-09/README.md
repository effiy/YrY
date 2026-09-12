---
doc_type: index
title: YiPet 开发模块索引
category: 项目/浏览器扩展/开发模块
created: 2026-09-11
updated: 2026-09-11
project: YiPet
---

# YiPet 开发模块索引

> 247 个开发模块文档——每个 PRD 对应一个 dev module，描述 HOW（实现方案、架构设计、技术决策）。
> 完整追溯链：**OKR → PRD → Dev Module → Test**

## 月度分布

| 月份 | PRD 数 | Dev 模块数 | Test 规格数 |
|------|--------|-----------|------------|
| 2026-07 | 7 | [7](./2026-07/) | [7](../tests/2026-07/) |
| 2026-08 | 8 | [8](./2026-08/) | [8](../tests/2026-08/) |
| 2026-09 | 232 | [232](./2026-09/) | [232](../tests/2026-09/) |

## 文件命名约定

```
devs/{month}/NN-prd-task-{描述}.md    → 开发模块文档
prds/{month}/NN-{type}-{描述}.md      → 来源 PRD
tests/{month}/NN-prd-test-{描述}.md   → 对应测试规格
```

## 追溯规则

- **每个 PRD 通过 `source_okr` 关联到 OKR 目标**
- **每个 Dev Module 通过 `prd_task_id` 关联到 PRD**
- **每个 Test 通过 `source_prds` 关联到 PRD**
- 完整链路：`OKR goal → PRD (source_okr) → Dev Module (prd_task_id) → Test (source_prds)`