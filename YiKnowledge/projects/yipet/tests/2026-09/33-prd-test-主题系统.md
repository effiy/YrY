---
doc_type: test
title: "主题系统 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["33-功能实现-主题系统"]
source_modules: ["33-prd-task-主题系统"]
---

# 主题系统 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-THM01 | light/dark 切换 | CSS 变量即时切换 | P0 |
| TC-THM02 | auto 跟随系统 | prefers-color-scheme | P1 |
| TC-THM03 | 主题持久化 | chrome.storage 恢复 | P0 |
| TC-THM04 | Chat+Popup 同步 | 两处主题一致 | P1 |