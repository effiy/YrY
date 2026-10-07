---

doc_type: module
prd_id: "PO-09-65"
title: "PO-09-65: 翻译质量统计 — 历史页展示 👍/👎 好评率"
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

# PO-09-65: 翻译质量统计展示

> 跨项目反馈闭环可视化：YiPot TargetArea 👍/👎 → YiAi translation_feedback → MongoDB → YiPot History 页统计展示。

## 背景

反馈闭环已建立：
- YiPot TargetArea 有 👍/👎 按钮，通过 `translation_feedback` RPC 提交
- YiPet ChatInput 有 👍/👎 按钮（第 6 轮），同样提交到 YiAi
- YiAi `provider_health` RPC 返回 `feedback: {good, bad}` 聚合统计
- YiVad TranslationAnalytics Dashboard 已可视化展示

YiPot History 页当前展示本地记录数 + 云端翻译量 + 缓存条目，缺少反馈质量统计。

## 范围

**In scope**：
- 调用 `getProviderHealth(168)` 获取近 7 天反馈统计
- Stats bar 新增 `N% 👍` 反馈率显示
- 好评率颜色：≥80% 绿 / ≥50% 黄 / <50% 红

| 优先级 | 故事 | 验收标准 |
|--------|------|----------|
| P2 | 反馈率显示 | History stats bar 显示好评百分比 "85% 👍" |
| P2 | 颜色编码 | 绿色≥80%，黄色≥50%，红色<50% |

## 验收标准

- [ ] 有反馈数据时显示 "N% 👍" 统计
- [ ] tooltip 显示 good/bad 具体数量
- [ ] 无反馈数据时不显示
- [ ] 颜色编码正确

## 关联

- YiPot：[TargetArea 反馈按钮](./58-prd-翻译质量反馈闭环.md)
- YiPet：[ChatInput 翻译反馈](../yipet/prds/2026-09/104-基础设施-翻译质量反馈.md)
- YiAi：[provider_health RPC](https://github.com)