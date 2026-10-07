---
title: "YPot-100-需求: YiPot 跨项目 API 集成完整性验证"
tags: [需求, 跨项目, YiPot, provider_recommend, API]
category: 项目/管理后台/需求
created: 2026-09-23
updated: 2026-09-23
source: internal
type: 需求
status: 已完成
roles: [engineer]
---

# YPot-100: YiPot 跨项目 API 集成完整性

## 一、现状

YiPot 已具备完整的 YiAi 翻译 API 集成：

| 功能 | RPC/端点 | 状态 |
|------|---------|------|
| 多引擎翻译 | translate | ✅ |
| OCR 识别 | recognize | ✅ |
| TTS 语音 | tts | ✅ |
| 生词本 | collect | ✅ |
| 翻译分析 | translation_analytics | ✅ |
| 供应商健康 | provider_health | ✅ |
| 趋势 | hourly_trend | ✅ |
| 智能推荐 | provider_recommend | ✅ UI 已集成 |
| 质量反馈 | translation_feedback | ✅ |

## 二、验证

- TargetArea 使用 getProviderRecommend 实现智能引擎选择
- 下拉菜单显示 Recommended 标记
- Best 芯片显示成功率百分比
- 传统引擎保持直接 API 调用降级路径