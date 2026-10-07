---
title: "YiPot AI 引擎审计与测试策略（第十三轮）— PRD"
tags: [PRD, YiPot, AI引擎, 测试策略, chatglm, gemini, volcengine]
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
prd_id: YP-09-76
doc_type: prd
roles: [engineer, leader]
---

# YiPot AI 引擎审计与测试策略（第十三轮）— PRD

> 编号：YP-09-76 · 优先级：P2 · 状态：已完成

---

## 一、需求背景

完成最后 3 个 AI 翻译引擎（ChatGLM/Gemini/Volcengine）审计，翻译引擎审计覆盖达到 13/21。产出主测试策略文档，整合 11 个测试方案为统一测试框架。

## 二、修复项

| 问题 | 文件 | 严重度 |
|------|------|--------|
| config 无默认值 + apiKey 前置检查 | `chatglm/index.jsx` | P2 |
| config 无默认值 + promptList null guard | `geminipro/index.jsx` | P2 |
| config 无默认值 | `volcengine/index.jsx` | P2 |

## 三、测试策略产出

| 文档 | 内容 |
|------|------|
| `tests/master-test-strategy.md` | 测试金字塔 · 11 方案覆盖矩阵 · 回归冒烟套件 (15 项) · 环境矩阵 |
| 87 个测试用例 | 11 个测试方案汇总 |

## 四、翻译引擎审计最终进度

| 状态 | 引擎 | 数量 |
|------|------|------|
| ✅ 深度审计 | Google, Baidu, DeepL, OpenAI, YouDao, Ollama, Bing, ChatGLM, Gemini, Volcengine, TTS, Anki, Eudic | **13/21** |
| ⚠️ 浅审计 | 其余 8 个翻译 + 11 个 OCR | 19 |

## 五、关联文档

| 类型 | 文件 |
|------|------|
| 开发方案 | `../devs/2026-09/117-prd-task-AI引擎测试策略第十三轮.md` |
| 测试方案 | `../tests/2026-09/122-prd-test-AI引擎测试策略第十三轮.md` |
| 主测试策略 | `../tests/master-test-strategy.md` |
| Bug 037 | `../bugs/功能缺陷/037-chatglm-gemini-volcengine-null-safety.md` |