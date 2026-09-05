---
title: YiVad 开发规范索引
tags: [yivad, specs, index, architecture, patterns]
category: projects/yivad
created: 2026-09-02
updated: 2026-09-02
source: YiVad
type: index
status: active
---

# YiVad 项目开发规范索引

本文档是 AI 代码生成的规范索引，所有规范文档在此目录下统一管理。

## 架构规范（通用）

| 文档 | 说明 |
|------|------|
| [项目架构摘要](../项目架构摘要.md) | 技术栈、目录结构、状态管理、API 层、路由、组件、国际化、权限等完整架构概览 |
| [API 规范](./架构/api规范/规范.md) | RequestHttp 封装、RPC 信封格式、API 模块文件模式、服务函数命名 |
| [权限规范](./架构/认证规范/规范.md) | v-auth 指令使用、权限模型、后端动态菜单 |
| [组件结构规范](./架构/组件模式/规范.md) | ProTable 表格模式、ECharts 图表、SearchForm 搜索、布局组件、`<script setup lang="ts">` 约定 |
| [国际化规范](./架构/国际化规范/规范.md) | Vue-i18n 配置、zh-CN + en 双语言、语言文件结构 |
| [TypeScript 类型规范](./架构/typescript规范/规范.md) | strict 模式、类型导入、接口命名约定 |

## 页面模式

| 文档 | 说明 |
|------|------|
| [列表页](./模式/列表页/规范.md) | ProTable 驱动的列表页完整模板（搜索 + 表格 + 分页 + 操作列） |
| [表单页](./模式/表单页/规范.md) | Element Plus 表单页完整模板（校验 + 折叠面板 + 创建/编辑/详情模式） |

## 工作流

| 文档 | 说明 |
|------|------|
| [分支管理规范](./workflows/分支管理.md) | dev → test → release → master 分支策略，功能分支命名 |
| [PRD → Proposal 流程](./workflows/prd-转提案.md) | 需求到提案的结构化提炼流程 |