---
doc_type: test
title: "YiPot 子组件审计与死代码清理（第二十四轮）— 测试方案"
tags: [测试方案, 子组件]
category: projects/yipot/tests
created: 2026-09-23
updated: 2026-09-23
source: internal
type: test
status: 已完成
priority: P3
project: YiPot
prd_ref: YP-09-85
dev_ref: YP-09-127
roles: [engineer]
---

# 第二十四轮 — 测试方案

---

## TC-01: 构建验证

`pnpm build` → ✓

## TC-02: SourceArea new_text 事件

翻译窗口接收 `new_text` 事件 → SourceArea 正常更新文本

## TC-03: 动态翻译

SourceArea 输入文本 → 动态翻译触发 → 各 TargetArea 面板正常显示结果

---

关联：PRD 85 · Dev 127