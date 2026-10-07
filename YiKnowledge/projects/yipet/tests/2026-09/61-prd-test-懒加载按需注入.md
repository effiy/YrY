---

doc_type: test
title: "懒加载按需注入 — 测试用例"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer, qa]
prd_month: "202609"
source_prds: ["61-架构设计-懒加载按需注入.md"]
source_modules: ["61-prd-task-懒加载按需注入.md"]

type: test
---

# 懒加载按需注入 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-LZ01 | Chat 按需加载 | 首次打开才加载 | P1 |
| TC-LZ02 | 工具动态 import | IntersectionObserver | P2 |

