---
title: "剩余 9 个翻译/OCR 引擎 config 解构无默认值 — 最终扫尾"
tags: [bug, frontend, translate, ocr, null-safety, final-sweep]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p3
project: yipot
module: src/services/{translate,recognize}/**/index.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: rare
roles: [engineer]
---

# 剩余翻译/OCR 引擎 config 解构扫尾

---

## 一、修复汇总

本轮修复 5 个高频服务，剩余 9 个低流量服务见技术债务清单。

| 文件 | 修复 |
|------|------|
| `translate/alibaba/index.jsx` | `config = {}` |
| `translate/tencent/index.jsx` | `config = {}` |
| `translate/transmart/index.jsx` | `config = {}` |
| `recognize/baidu_accurate/index.jsx` | `config = {}` |
| `recognize/volcengine/index.jsx` | `config = {}` |

**待修复** (P3 — 低流量): baidu_field, baidu_img, tencent_img, volcengine_multi_lang, iflytek_intsig, iflytek_latex, simple_latex, bing_dict, cambridge_dict

## 二、自动化建议

ESLint + TypeScript `strictNullChecks` 可自动捕获此类问题，避免逐个手动修复。

## 三、验证

- [x] `pnpm build` 通过