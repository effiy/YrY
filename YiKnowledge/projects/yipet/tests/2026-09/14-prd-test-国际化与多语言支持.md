---
doc_type: test
title: "国际化与多语言 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["14-功能实现-国际化与多语言支持"]
source_modules: ["14-prd-task-国际化与多语言支持"]
---

# 国际化与多语言 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-I18N01 | en/zh_CN 切换 | 所有文本正确翻译 | P0 |
| TC-I18N02 | chrome.i18n 封装 | `getMessage(key)` 正确 | P1 |
| TC-I18N03 | 日期格式化 | Intl.DateTimeFormat 按语言 | P1 |
| TC-I18N04 | RTL 支持 | direction:rtl 布局镜像 | P2 |

## 出口准则

- [ ] P0 用例 100% 通过