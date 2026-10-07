---
doc_type: test
title: "YiPot 翻译引擎与 i18n 审计（第十轮）— 测试方案"
tags: [测试方案, 翻译引擎, null-safety, deepl, openai, youdao, i18n]
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
test_id: YP-09-119
prd_ref: YP-09-73
dev_ref: YP-09-114
roles: [engineer]
---

# YiPot 翻译引擎与 i18n 审计（第十轮）— 测试方案

> 测试编号：YP-09-119 · 关联 PRD：YP-09-73 · 关联开发：YP-09-114

---

## 一、翻译引擎测试

### TC-01: DeepL Free 翻译

| 项 | 内容 |
|-----|------|
| **步骤** | 翻译 "hello" → en→zh → DeepL Free |
| **预期** | 正常返回翻译结果，无 TypeError |

### TC-02: DeepL API Key 模式

| 项 | 内容 |
|-----|------|
| **步骤** | 配置有效 authKey → 翻译 |
| **预期** | API 翻译正常，逗号运算符修复后条件判断正确 |

### TC-03: OpenAI 无 options 调用

| 项 | 内容 |
|-----|------|
| **步骤** | 程序化调用 `translate('hello', 'en', 'zh')` |
| **预期** | 不抛出 TypeError，使用默认值 |

### TC-04: OpenAI 正常翻译

| 项 | 内容 |
|-----|------|
| **步骤** | 配置 API Key → 翻译 |
| **预期** | 正常返回翻译结果 |

### TC-05: YouDao 翻译

| 项 | 内容 |
|-----|------|
| **步骤** | 配置 appkey/secret → 翻译 |
| **预期** | 正常返回翻译结果（含发音/词典） |

### TC-06: YouDao config 缺失

| 项 | 内容 |
|-----|------|
| **步骤** | 未配置 → 尝试翻译 |
| **预期** | config 为 `{}`，appkey/key 为 undefined → 签名计算可能异常但无 TypeError |

---

## 二、i18n 测试

### TC-07: ja_JP 更新器页面

| 项 | 内容 |
|-----|------|
| **步骤** | 切换语言为日语 → 检查更新 |
| **预期** | 更新器页面 fallback 到英语（非原始键名） |

### TC-08: nb_NO 设置页面

| 项 | 内容 |
|-----|------|
| **步骤** | 切换语言为书面挪威语 → 设置页 |
| **预期** | 大部分文本 fallback 到英语，无原始 `translation.xxx.yyy` 显示 |

---

## 三、回归测试

- 全部 21 个翻译引擎 basic 测试
- 语言切换：en/zh_CN/ja_JP/ko_KR 各页面

## 四、关联文档

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/73-prd-翻译引擎i18n审计第十轮.md` |
| 开发方案 | `../devs/2026-09/114-prd-task-翻译引擎i18n审计第十轮.md` |
| i18n 审计 | `../architecture/i18n-audit.md` |