---
doc_type: test
title: "YiPot 最终扫尾与经验总结（第十六轮）— 测试方案"
tags: [测试方案, 最终扫尾, 翻译引擎]
category: 项目/桌面应用/测试
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: test
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
test_id: YP-09-126
prd_ref: YP-09-79
dev_ref: YP-09-120
roles: [engineer]
---

# YiPot 最终扫尾与经验总结（第十六轮）— 测试方案

> 测试编号：YP-09-126 · 关联 PRD：YP-09-79 · 关联开发：YP-09-120

---

## 一、测试用例

### TC-01-05: 5 个服务 config 缺失测试

| # | 服务 | 步骤 | 预期 |
|---|------|------|------|
| 1 | Alibaba | 不配置 accesskey → 翻译 | API 认证错误（非 TypeError） |
| 2 | Tencent | 不配置 secret → 翻译 | API 认证错误 |
| 3 | Transmart | 不配置 token → 翻译 | API 认证错误 |
| 4 | Baidu Accurate | 不配置 client → OCR | API 认证错误 |
| 5 | Volcengine OCR | 不配置 appid → OCR | API 认证错误 |

### TC-06: 全引擎回归

执行 [主测试策略](../master-test-strategy.md) 回归冒烟套件（15 项）。

---

## 二、关联文档

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/79-prd-最终扫尾第十六轮.md` |
| 开发方案 | `../devs/2026-09/120-prd-task-最终扫尾第十六轮.md` |
| 经验总结 | `../workflows/开发规范/0009-规范-审计经验总结与最佳实践.md` |