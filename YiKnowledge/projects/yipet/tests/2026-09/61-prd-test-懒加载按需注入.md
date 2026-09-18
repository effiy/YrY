---
doc_type: test
title: "懒加载按需注入 — 测试用例"
status: 已完成
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["61-性能-懒加载按需注入"]
---

# 懒加载按需注入 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-LZ01 | Chat 按需加载 | 首次打开才加载 | P1 |
| TC-LZ02 | 工具动态 import | IntersectionObserver | P2 |