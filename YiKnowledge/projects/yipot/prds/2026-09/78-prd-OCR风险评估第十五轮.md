---
title: "YiPot OCR 服务与风险评估（第十五轮）— PRD"
tags: [PRD, YiPot, OCR, 风险评估, info.ts]
category: projects/yipot/prds
created: 2026-09-23
updated: 2026-09-23
source: internal
type: 需求
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
prd_id: YP-09-78
doc_type: prd
roles: [engineer, leader]
---

# YiPot OCR 服务与风险评估（第十五轮）— PRD

> 编号：YP-09-78 · 优先级：P2 · 状态：已完成

---

## 一、需求背景

完成最后一批 OCR 引擎审计（Tencent Accurate/Iflytek），修复 system info.ts 图标显示 bug，产出专业风险评估矩阵。

## 二、修复项

| 问题 | 文件 | 严重度 |
|------|------|--------|
| config 无默认值 | `tencent_accurate/index.jsx` | P2 |
| config 无默认值 | `iflytek/index.jsx` | P2 |
| icon 模板字符串 bug | `system/info.ts` | P3 |

## 三、风险评估矩阵

产出 `architecture/risk-assessment-matrix.md`:
- 38 个 Bug 按 P0/P1/P2/P3 分级
- 风险热力图 (Rust panic / 前端异常 / 状态生命周期 / null safety / 安全配置)
- 残余风险：**33 个已消除，5 个已接受（均有缓解计划）**
- 结论：**零已知可被利用的运行时缺陷**

## 四、验收标准

- [x] Tencent Accurate/Iflytek config 默认值
- [x] system info.ts icon 修复
- [x] `pnpm build` 通过
- [x] 风险评估矩阵产出

## 五、关联文档

| 类型 | 文件 |
|------|------|
| 开发方案 | `../devs/2026-09/119-prd-task-OCR风险评估第十五轮.md` |
| 测试方案 | `../tests/2026-09/125-prd-test-OCR风险评估第十五轮.md` |
| 风险评估矩阵 | `../architecture/risk-assessment-matrix.md` |
| Bug 039 | `../bugs/功能缺陷/039-ocr-config-system-icon-bug.md` |