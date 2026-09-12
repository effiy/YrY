---
doc_type: index
title: 2026-09 测试文档索引
category: 项目/管理后台/测试
created: 2026-09-09
updated: 2026-09-11
project: YiVad
---

# 2026-09 测试文档索引

> 测试文档——描述 VERIFY（测试策略、测试用例、回归计划），独立于产品和开发文档。
> 完整追溯链：**OKR → PRD → Dev Module → Test**

## PRD → Module → Test 可追溯矩阵

| Test ID | 标题 | 状态 | 覆盖 OKR | 覆盖 PRD | 覆盖 Dev 模块 |
|---------|------|------|----------|----------|-------------|
| YV-09-00 | [九月测试策略](./00-test-九月测试策略.md) | 已完成 | yivad-001, yivad-002 | YV-09-01 | 全部 19 个模块 |
| YV-09-22 | [测试体系建设](./22-test-测试体系建设.md) | 已完成 | yivad-001 | YV-09-01 | YV-09-01-1, YV-09-01-2 |

## 目录规范

```
tests/{month}/
├── README.md                    # 本索引 + PRD→Module→Test 可追溯矩阵
└── NN-test-{描述}.md            # 测试文档
```

## Frontmatter 规范

每个测试文件必须包含以下追溯字段，建立 **Dev Module → Test** 关联：

```yaml
doc_type: test
prd_task_id: "YV-09-22"                    # 测试编号
source_prds: ["YV-09-01"]                   # 必填：覆盖的 PRD 编号列表
source_modules: ["YV-09-01-1", "YV-09-01-2"] # 必填：覆盖的 Dev Module 编号列表
```

## 追溯规则

- **每个 test 必须通过 `source_modules` 关联到至少一个 dev module**
- **每个 test 通过 `source_prds` 关联到来源 PRD**
- 完整链路：`OKR goal → PRD (source_okr) → Dev Module (prd_task_id) → Test (source_modules)`