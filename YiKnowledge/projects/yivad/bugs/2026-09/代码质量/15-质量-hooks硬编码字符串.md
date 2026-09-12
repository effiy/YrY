---
title: 工具 hooks 中硬编码字符串未使用 i18n
tags: [yivad, code-quality, i18n, code-smell]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: minor
priority: p2
---

# 工具 hooks 中硬编码字符串未使用 i18n

## 现象

`YiVad/src/hooks/` 目录下的多个工具 hooks 中存在硬编码的中英文提示字符串，未使用 `useI18n()` 进行国际化处理：

- `useHandleData.ts`：所有 UI 文本硬编码为英文（"Tips"、"Confirm"、"Cancel"、"successfully!"）
- `useDownload.ts`：提示标题和消息硬编码为英文（"Tips"、"Large data may cause slow download..."）
- `useOptimisticUpdate.ts`：错误消息硬编码为中文（"操作失败"）
- `useCodeHealth.ts`：错误消息硬编码为中文（"分析失败"）

## 根因分析

这些 hooks 是通用工具函数，被多个页面使用。硬编码字符串导致：
- 无法根据用户语言偏好切换提示语言
- 中英文混用，用户体验不一致
- `useDownload` 和 `useHandleData` 使用英文，`useOptimisticUpdate` 和 `useCodeHealth` 使用中文，语言选择不统一

## 涉及文件

- `YiVad/src/hooks/useHandleData.ts:19-31` — 硬编码 "Tips"、"Confirm"、"Cancel"、"successfully!"
- `YiVad/src/hooks/useDownload.ts:20-22` — 硬编码 "Tips"、"Large data may cause slow download, please be patient!"
- `YiVad/src/hooks/useOptimisticUpdate.ts:24` — 硬编码 "操作失败"
- `YiVad/src/hooks/useCodeHealth.ts:23,28,31` — 硬编码 "分析失败"

## 修复方案

1. 在 `useHandleData` 和 `useDownload` 中引入 `useI18n()`，使用 `t()` 包裹文案
2. 在 i18n 语言文件中添加对应的 key（如 `common.tips`、`common.confirm`、`common.cancel`、`common.success`、`common.operationFailed`、`common.analysisFailed` 等）
3. `useOptimisticUpdate` 作为通用 composable，应将错误消息作为可配置参数或使用 i18n key

## 预防措施

- 新增 hooks 时要求使用 i18n 处理所有用户可见的文案
- 代码审查时检查 hooks 中是否有硬编码字符串

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

