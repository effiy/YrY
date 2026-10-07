---

doc_type: test
title: "Popup 皮肤中心 — 测试用例"
status: 方案已编写
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiPet
prd_month: "202609"
source_prds: ["22-架构设计-Popup皮肤中心.md"]
source_modules: ["22-prd-task-Popup皮肤中心.md"]

type: test
---

# Popup 皮肤中心 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-POP01 | 角色选择器 | 猫/狗/狐狸切换→Pet 更新 | P0 |
| TC-POP02 | 颜色选择器 | 预设+自定义→即时反映 | P1 |
| TC-POP03 | chrome.storage 持久化 | 刷新恢复选择 | P0 |
| TC-POP04 | 实时预览 | Popup 修改→Pet 即时更新 | P1 |

## 出口准则

- [ ] P0 用例 100% 通过

