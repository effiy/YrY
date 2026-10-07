---
doc_type: test
title: "YiPot TargetArea 深度审计（第二十五轮）— 测试方案"
tags: [测试方案, TargetArea]
category: projects/yipot/tests
created: 2026-09-23
updated: 2026-09-23
source: internal
type: test
status: 已完成
priority: P2
project: YiPot
prd_ref: YP-09-86
dev_ref: YP-09-128
roles: [engineer]
---

# 第二十五轮 — 测试方案

---

## TC-01: YiAi 降级路径

YiAi 不可达 → AI 翻译自动降级到直接 API 调用，翻译结果正常

## TC-02: 请求去重

快速切换语言 3 次 → 仅最后一次翻译结果显示

## TC-03: 流式翻译

OpenAI 流式翻译 → 逐字显示结果

## TC-04: 自动复制

设置 autoCopy=target → 翻译完成后自动复制译文

---

关联：PRD 86 · Dev 128