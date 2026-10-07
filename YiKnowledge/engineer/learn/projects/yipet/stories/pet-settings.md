---
title: Pet Settings
key: 0f950b87-8369-4184-9878-c8542638e652
tags:
- settings
- ui
category: engineer/learn/projects/yipet/stories
created: '2025-07-02'
updated: 2026-09-10
source: internal
type: story
status: testing
project: YiPet
story_name: pet-settings
---

# 宠物设置

宠物个性化设置模块——用户可以通过 Popup 弹窗配置宠物的外观和行为。

## 功能概述

### 核心配置项

| 配置项 | 类型 | 存储位置 | 说明 |
|---|---|---|---|
| 角色选择 | 枚举（多角色列表） | `chrome.storage.local` | 选择 AI 宠物的角色人格，影响聊天风格和知识范围 |
| 皮肤颜色 | 6 色预设 + 自定义 | `chrome.storage.local` | 宠物浮动图标的颜色主题，通过渐变色环展示 |
| AI 模型 | 枚举（可用模型列表） | `chrome.storage.local` | 选择聊天窗口使用的 AI 模型（如 qwen3.5:4b） |
| 可见性 | 布尔值 | `chrome.storage.local` | 控制宠物在页面上的显示/隐藏 |

### UI 交互流程

```
点击扩展图标 → Popup 弹窗打开
  ├── AppHeader（渐变色头部 + 当前宠物图标）
  ├── PetPreview（预览当前宠物外观 + 皮肤环）
  ├── ColorPicker（6 色选择器）
  ├── RolePicker（角色卡片选择器，2 列网格）
  └── AppFooter（版本信息 + 关于链接）
```

### 数据持久化

所有设置通过 `chrome.storage.local` 持久化。Popup 中的变更通过 `chrome.tabs.sendMessage` 发送到 Content Script，实时更新页面上的宠物外观。

## 技术要点

- **Popup 技术栈**：React 18 + Ant Design（独立于聊天窗口的 Vue 3 技术栈）
- **通信路径**：Popup → `chrome.tabs.sendMessage` → Content Script (ISOLATED) → CustomEvent → MAIN World
- **配置默认值**：`src/config/defaults.ts` 维护所有默认配置

## 适用场景

| 场景 | 操作 | 频率 |
|---|---|---|
| 切换工作模式 | 选择不同角色（代码审查/知识助手/通用聊天） | 按需，每天数次 |
| 个性化外观 | 选择皮肤颜色匹配个人喜好 | 首次设置，后续偶尔 |
| 切换 AI 模型 | 根据任务复杂度选择不同模型 | 按需，每天数次 |
| 临时隐藏宠物 | 在进行演示或截图时关闭宠物显示 | 按需