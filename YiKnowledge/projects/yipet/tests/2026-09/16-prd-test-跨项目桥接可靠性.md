---
doc_type: test
title: "跨项目桥接可靠性 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["16-稳定性-跨项目桥接可靠性"]
source_modules: ["16-prd-task-跨项目桥接可靠性"]
---

# 跨项目桥接可靠性 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-BRG01 | YiVad 不可达重试 | 重试 3 次→提示手动打开 | P0 |
| TC-BRG02 | Session Key 过期 | 自动刷新 Key | P1 |
| TC-BRG03 | window.open 拦截 | 提示用户允许弹窗 | P1 |
| TC-BRG04 | 降级方案 | 主方案失败→复制链接 | P2 |

## 出口准则

- [ ] P0 用例 100% 通过