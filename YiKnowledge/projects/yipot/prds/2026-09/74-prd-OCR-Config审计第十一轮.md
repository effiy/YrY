---
title: "YiPot OCR 服务与 Config 审计（第十一轮）— PRD"
tags: [PRD, YiPot, OCR, config, null-safety]
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
prd_id: YP-09-74
doc_type: prd
roles: [engineer]
---

# YiPot OCR 服务与 Config 审计（第十一轮）— PRD

> 编号：YP-09-74 · 优先级：P2 · 状态：已完成

---

## 一、需求背景

前十轮完成了翻译引擎 5/21 审计和核心模块全覆盖。本轮扩展到 OCR 服务层（Baidu/Tencent）和 Config 服务管理页面审计。

## 二、审计结论

### 2.1 OCR 服务修复

| 问题 | 文件 | 严重度 |
|------|------|--------|
| config 解构无默认值 | `baidu/index.jsx` | P2 |
| config 解构无默认值 | `tencent/index.jsx` | P2 |

### 2.2 Config 服务管理页面

`Service/index.jsx`、`Service/Translate/index.jsx`、`Config/pages/Translate/index.jsx` 审计通过，未发现阻塞问题。`Service/index.jsx` 的 listener 管理是现有窗口中最完善的实现（正确的 cleanup + 防重复注册）。

## 三、验收标准

- [x] Baidu/Tencent OCR config 默认值
- [x] Config 服务管理页面审计通过
- [x] `pnpm build` 通过
- [x] 文档索引产出

## 四、关联文档

| 类型 | 文件 |
|------|------|
| 开发方案 | `../devs/2026-09/115-prd-task-OCR-Config审计第十一轮.md` |
| 测试方案 | `../tests/2026-09/120-prd-test-OCR-Config审计第十一轮.md` |
| 文档索引 | `../INDEX.md` |
| Bug 035 | `../bugs/功能缺陷/035-baidu-tencent-ocr-config-null.md` |