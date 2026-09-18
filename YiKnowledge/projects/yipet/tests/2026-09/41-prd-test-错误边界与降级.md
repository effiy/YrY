---
doc_type: test
title: "错误边界与降级 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["41-稳定性-错误边界与降级"]
source_modules: ["41-prd-task-错误边界与降级"]
---

# 错误边界与降级 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-ERR01 | Vue 渲染错误隔离 | ErrorBoundary→降级 UI，兄弟组件正常 | P0 |
| TC-ERR02 | API 不可达降级 | 缓存数据+重试按钮 | P0 |
| TC-ERR03 | CDN 失败降级 | 基础功能可用（无 UI 库） | P1 |
| TC-ERR04 | 致命错误恢复 | 清除注入+提示刷新 | P1 |

## 出口准则

- [ ] P0 用例 100% 通过