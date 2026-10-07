---

doc_type: module
prd_id: "PO-09-61"
title: "PO-09-61: 智能引擎推荐 — YiAi provider_recommend RPC → YiPot 实时健康排名"
status: 已完成
priority: P1
owner: Claude
roles: [product, engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: 需求
---

# PO-09-61: 智能翻译引擎推荐

> 跨项目数据打通：YiAi 新增 `provider_recommend` RPC（基于近 24h 健康数据实时排名），YiVad TranslationAnalytics 已消费展示，YiPot 应直接用于智能引擎选择。

## 背景

YiAi `services/translation/translate_service.py` 新增 `provider_recommend(from_lang, to_lang)` RPC 方法：
- 基于近 24h 供应商健康数据（成功率、状态）
- 按状态层级（healthy=3 > degraded=2 > down=1）+ 成功率排序
- 返回推荐引擎名称 + 完整排名列表

YiVad `TranslationAnalytics.vue` 新增 "Smart Provider Ranking" 面板展示此数据。YiPot 的 TargetArea 当前仅按配置列表展示引擎，用户无法知道哪个引擎当前最健康。

## 范围

**In scope**：
- YiPot API 层新增 `getProviderRecommend(fromLang, toLang)` 方法
- TargetArea 引擎下拉菜单显示健康状态点（绿/黄/红）+ 成功率
- 推荐引擎标记 "Best" 徽章
- 头部显示可点击的推荐引擎快速切换标签

**Out of scope**：
- 自动切换引擎（用户手动选择优先）
- 历史页面推荐过滤

| 优先级 | 故事 | 验收标准 |
|--------|------|----------|
| P1 | API 方法 | `getProviderRecommend('en', 'zh')` 返回排名列表 |
| P1 | 健康状态点 | 下拉菜单中每个引擎旁显示绿/黄/红圆点 |
| P1 | Best 徽章 | 当前语言对的最佳引擎标记 "Best" + 成功率 |
| P2 | 快速切换 | 头部 "Best: xxx (nn%)" 标签可点击切换 |

## 验收标准

- [ ] 语言对变更时自动获取推荐（sourceLanguage/targetLanguage 变化触发）
- [ ] 下拉菜单中非插件引擎显示健康状态点
- [ ] 推荐引擎显示 "Best" 绿色徽章
- [ ] 成功率低于 95% 显示黄色警告，低于 70% 显示红色
- [ ] YiAi 不可达时优雅降级（无状态点，功能正常）

## 关联

- YiAi：[provider_recommend RPC](https://github.com)
- YiVad：[Smart Provider Ranking 面板](../../yivad/prds/2026-09/100-prd-翻译分析仪表盘.md)
- 数据流：YiPot → YiAi provider_recommend → provider_health.py → MongoDB 聚合