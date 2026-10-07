---
title: "YiPot 翻译引擎与 i18n 审计（第十轮）— PRD"
tags: [PRD, YiPot, 翻译引擎, null-safety, i18n, 审计]
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
prd_id: YP-09-73
doc_type: prd
roles: [engineer]
---

# YiPot 翻译引擎与 i18n 审计（第十轮）— PRD

> 编号：YP-09-73 · 优先级：P2 · 状态：已完成

---

## 一、需求背景

前九轮中翻译引擎审计仅覆盖 Google/Baidu 两个。本轮扩展到 DeepL/OpenAI/YouDao 三个高频引擎，并首次对 20 个 i18n locale 文件进行键完整性审计。

## 二、问题清单

### 2.1 翻译引擎

| 问题 | 文件 | 严重度 |
|------|------|--------|
| 逗号运算符误用 `(a, b)` 应为 `a && b` | `deepl/index.jsx:115` | P2 |
| config 解构无默认值 | `deepl/index.jsx:4` | P2 |
| options 参数无默认值 | `openai/index.jsx:5` | P2 |
| config 解构无默认值 | `openai/index.jsx:8` | P2 |
| config 解构无默认值 | `youdao/index.jsx:7` | P3 |

### 2.2 i18n 键完整性

- 13/20 locale 文件存在缺失键（1~340 个）
- 最严重：nb_NO/nn_NO/tr_TR (340), tk_TM (274), ja_JP/fa_IR (~245)
- fallback 机制：`default: ['en']`，缺失键显示英语文本

## 三、验收标准

- [x] DeepL 逗号运算符修复 + config 默认值
- [x] OpenAI options/config 默认值
- [x] YouDao config 默认值
- [x] `pnpm build` 通过
- [x] i18n 键完整性审计报告产出

## 四、关联文档

| 类型 | 文件 |
|------|------|
| 开发方案 | `../devs/2026-09/114-prd-task-翻译引擎i18n审计第十轮.md` |
| 测试方案 | `../tests/2026-09/119-prd-test-翻译引擎i18n审计第十轮.md` |
| i18n 审计 | `../architecture/i18n-audit.md` |
| Bug 032-034 | `../bugs/功能缺陷/032-034-*.md` |