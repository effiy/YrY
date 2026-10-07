---

doc_type: module
prd_id: "PO-09-63"
title: "PO-09-63: 翻译记忆缓存指示器 — TargetArea 显示 ⚡ Cached 徽章"
status: 已完成
priority: P2
owner: Claude
roles: [product, engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: 需求
---

# PO-09-63: 翻译记忆缓存指示器

> 跨项目透明度改进：YiAi `translate` RPC 对相同文本返回 `cached: true` 标记，YiPot 应可视化展示缓存命中，让用户感知性能优势。

## 背景

YiAi `translate_service.translate` RPC 在 `use_memory=true` 时：
1. 先查询翻译记忆缓存（MongoDB `translation_memory`，SHA256 哈希索引）
2. 缓存命中时返回 `{provider, text, cached: true}`
3. 未命中时调用第三方 API 并写入缓存

当前 YiPot `translateViaYiAi` 仅返回文本，丢弃了 `cached` 标记。用户无法知道翻译是来自缓存（< 10ms）还是实时 API（通常 500ms-3s）。

## 范围

**In scope**：
- `translateViaYiAi` 返回 `{text, cached}` 替代原来的 `string`
- TargetArea 新增 `isCached` 状态
- 缓存命中时在头部显示 `⚡ Cached` 紫色徽章
- 新翻译开始时清除缓存标记
- `handleTranslateSuccess` 支持 `cached` 参数

**Out of scope**：
- 缓存命中率统计（已在 YiVad Dashboard 覆盖）
- SSE 流式翻译缓存（流式结果不缓存）

## 验收标准

- [ ] 重复翻译相同文本时显示 `⚡ Cached` 徽章
- [ ] 首次翻译（无缓存）时不显示徽章
- [ ] 切换翻译文本后徽章消失
- [ ] `translateViaYiAi` 类型正确（`Promise<{text, cached}>`）

## 关联

- YiAi：[translate_service.py memory_service](../../yiai/devs/2026-09/)
- YiVad：[TranslationAnalytics 记忆缓存条目 KPI](../../yivad/prds/2026-09/100-prd-翻译分析仪表盘.md)