---
doc_type: test
title: "YiPot OCR 服务与风险评估（第十五轮）— 测试方案"
tags: [测试方案, OCR, tencent_accurate, iflytek, system, 风险评估]
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
test_id: YP-09-125
prd_ref: YP-09-78
dev_ref: YP-09-119
roles: [engineer]
---

# YiPot OCR 服务与风险评估（第十五轮）— 测试方案

> 测试编号：YP-09-125 · 关联 PRD：YP-09-78 · 关联开发：YP-09-119

---

## 一、测试用例

### TC-01: Tencent Accurate OCR — 正常

| 项 | 内容 |
|-----|------|
| **前置条件** | 腾讯云 secret_id/key 已配置 |
| **步骤** | 截图 OCR → Tencent Accurate |
| **预期** | 高精度文字识别成功 |

### TC-02: Tencent Accurate — config 缺失

| 项 | 内容 |
|-----|------|
| **步骤** | 不配置 → 使用 |
| **预期** | 无 TypeError，API 返回认证错误 |

### TC-03: Iflytek OCR — 正常

| 项 | 内容 |
|-----|------|
| **前置条件** | 讯飞 appid/apikey 已配置 |
| **步骤** | 截图 OCR → Iflytek |
| **预期** | 文字识别成功 |

### TC-04: System OCR icon 显示

| 项 | 内容 |
|-----|------|
| **步骤** | 设置 → 服务 → OCR → 查看系统 OCR 图标 |
| **预期** | 图标正常显示（非空白/破损图标） |

### TC-05: 风险评估矩阵完整性

| 项 | 内容 |
|-----|------|
| **步骤** | 审阅 `architecture/risk-assessment-matrix.md` |
| **预期** | 38 个 Bug 全覆盖，风险分级正确，残余风险摘要准确 |

---

## 二、回归测试

执行 [主测试策略](../master-test-strategy.md) 回归冒烟套件。

## 三、关联文档

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/78-prd-OCR风险评估第十五轮.md` |
| 开发方案 | `../devs/2026-09/119-prd-task-OCR风险评估第十五轮.md` |
| 风险评估矩阵 | `../architecture/risk-assessment-matrix.md` |