---
title: YiPet 知识库索引
tags: [yipet, index, chrome-extension, mv3, workflows]
category: projects/yipet
created: 2026-08-25
updated: 2026-09-15
source: YiPet
type: index
status: active
---

# YiPet 项目知识库

> Chrome MV3 扩展的完整知识体系——架构设计、开发规范、功能模式、操作指南、流程规范。所有内容位于 `workflows/` 目录。

## 目录结构

```
workflows/
├── 架构设计/ (7)  — 架构概览、扩展架构、双世界执行、目录结构、核心模块、IPC通信、CDN注入
├── 开发规范/ (11) — 项目规范、OpenSpec工作流、依赖管理、API架构、认证权限、TypeScript、国际化、组件规范、状态管理、错误处理
├── 操作指南/ (5)  — 快速开始、添加新功能、测试指南、调试排错、性能优化
├── 功能模式/ (2)  — ChatStore状态管理、导航与视图管理
└── 流程规范/ (6)  — 分支管理、变更落地、变更状态、PRD到Proposal、构建部署、扩展发布
```

## 遇到问题？快速定位

| 症状/错误 | 去哪看 |
|-----------|--------|
| 宠物不显示 / `__YIPET_LOADED__` 为 false | [调试排错 #宠物不显示](./workflows/操作指南/04-指南-调试排错.md) |
| 聊天窗口打不开 / Ctrl+Shift+X 无反应 | [调试排错 #聊天窗口不响应](./workflows/操作指南/04-指南-调试排错.md) |
| API 返回空数据 / `query` 参数无效 | [API架构 #参数契约](./workflows/开发规范/05-规范-API架构与规范.md)（用 `filter` 非 `query`） |
| `chrome.runtime is not defined` | [双世界模型 #能力边界](./workflows/架构设计/03-架构-双世界执行模型.md)（MAIN世界无chrome API） |
| 构建失败 / SW 未注册 | [构建部署 #常见问题](./workflows/流程规范/05-流程-构建部署.md) |
| `jsxDEV is not a function` | [构建部署 #常见问题](./workflows/流程规范/05-流程-构建部署.md)（chat用production模式） |
| 扩展加载报错 / manifest 格式错误 | [调试排错 #构建问题](./workflows/操作指南/04-指南-调试排错.md) |
| Token 401 / 认证失败 | [认证与权限 #Token管理](./workflows/开发规范/06-规范-认证与权限.md) |
| SSE 连接中断 / 消息发送失败 | [错误处理 #降级层级](./workflows/开发规范/11-规范-错误处理模式.md) |
| chrome.storage 写入静默失败 | [状态管理 #持久化策略](./workflows/开发规范/10-规范-状态管理模式.md) |
| 弹窗配置变更后宠物不响应 | [IPC通信 #消息流时序](./workflows/架构设计/06-架构-IPC跨世界通信.md) |
| CDN 资源加载 404 | [CDN注入 #MV3 CSP合规](./workflows/架构设计/07-架构-CDN资源注入.md) |
| 扩展审核被拒 | [扩展发布 #审核拒因](./workflows/流程规范/06-流程-扩展发布流程.md) |

## 快速导航

### 新人入门

1. [快速开始](./workflows/操作指南/01-指南-快速开始.md) — 环境搭建、构建加载扩展
2. [架构概览](./workflows/架构设计/01-架构-架构概览.md) — 技术栈、双世界执行、4-Tier API
3. [扩展架构](./workflows/架构设计/02-架构-扩展架构.md) — MV3 约束、注入流程、降级策略
4. [目录结构](./workflows/架构设计/04-架构-目录结构.md) — 完整源码目录树
5. [项目规范](./workflows/开发规范/01-规范-项目规范.md) — 命名、提交、质量门禁

### 日常开发

| 场景 | 参考文档 |
|------|----------|
| 开发聊天功能 | [Chat Store 状态管理](./workflows/功能模式/01-模式-ChatStore状态管理.md) + [核心模块](./workflows/架构设计/05-架构-核心模块.md) |
| 调用后端 API | [API 架构与规范](./workflows/开发规范/05-规范-API架构与规范.md) |
| 处理跨世界通信 | [IPC 跨世界通信](./workflows/架构设计/06-架构-IPC跨世界通信.md) + [双世界模型](./workflows/架构设计/03-架构-双世界执行模型.md) |
| 管理跨世界状态 | [状态管理模式](./workflows/开发规范/10-规范-状态管理模式.md) |
| 处理错误和降级 | [错误处理模式](./workflows/开发规范/11-规范-错误处理模式.md) |
| 管理 CDN 资源 | [CDN 资源注入](./workflows/架构设计/07-架构-CDN资源注入.md) |
| 开发 Popup 功能 | [组件规范](./workflows/开发规范/09-规范-组件规范.md) + [核心模块](./workflows/架构设计/05-架构-核心模块.md) |
| 实现侧边栏导航 | [导航与视图管理](./workflows/功能模式/03-模式-导航与视图管理.md) |
| 添加跨项目桥接 | [认证与权限](./workflows/开发规范/06-规范-认证与权限.md) |
| 添加国际化文本 | [国际化](./workflows/开发规范/08-规范-国际化.md) |
| 定义 TypeScript 类型 | [TypeScript 类型规范](./workflows/开发规范/07-规范-TypeScript类型规范.md) |
| 处理 Token 认证 | [认证与权限](./workflows/开发规范/06-规范-认证与权限.md) |
| 编写测试 | [测试指南](./workflows/操作指南/03-指南-测试指南.md) |
| 调试排错 | [调试与排错指南](./workflows/操作指南/04-指南-调试排错.md) |
| 性能优化 | [性能优化指南](./workflows/操作指南/05-指南-性能优化.md) |
| 添加新功能 | [添加新功能](./workflows/操作指南/02-指南-添加新功能.md) |

### 代码审查

| 检查项 | 参考 |
|--------|------|
| 是否通过 ApiClient 而非直接 fetch | [API 架构与规范](./workflows/开发规范/05-规范-API架构与规范.md) |
| 是否遵循 4-Tier API 分层 | [API 架构与规范 #四层架构](./workflows/开发规范/05-规范-API架构与规范.md) |
| CS 和 SW 状态是否分离 | [扩展架构 #双世界](./workflows/架构设计/02-架构-扩展架构.md) |
| MAIN World 是否避免使用 chrome.* | [扩展架构 #API可用性](./workflows/架构设计/02-架构-扩展架构.md) |
| 参数名是否使用 `filter` 而非 `query` | [API 架构与规范 #参数契约](./workflows/开发规范/05-规范-API架构与规范.md) |
| 是否使用 chrome.storage 而非 localStorage | [认证与权限 #安全约束](./workflows/开发规范/06-规范-认证与权限.md) |
| IPC 消息是否通过 IPC_SECRET 验证 | [IPC 跨世界通信](./workflows/架构设计/06-架构-IPC跨世界通信.md) |
| 是否使用 dispatchSecureEvent | [IPC 跨世界通信](./workflows/架构设计/06-架构-IPC跨世界通信.md) |
| 组件是否通过 Store Actions 操作 | [组件规范 #Store集成](./workflows/开发规范/09-规范-组件规范.md) |
| 组件卸载是否取消 AbortController | [组件规范 #反模式](./workflows/开发规范/09-规范-组件规范.md) |
| 错误是否对用户可见且有恢复路径 | [错误处理模式](./workflows/开发规范/11-规范-错误处理模式.md) |
| 是否使用 `<script setup lang="ts">` | [组件规范 #约定](./workflows/开发规范/09-规范-组件规范.md) |
| TypeScript 类型检查是否通过 | [TypeScript 类型规范](./workflows/开发规范/07-规范-TypeScript类型规范.md) |
| 构建是否禁用文件名哈希和代码分割 | [目录结构 #构建约束](./workflows/架构设计/04-架构-目录结构.md) |
| 是否有对应的单元测试 | [测试指南](./workflows/操作指南/03-指南-测试指南.md) |

### 流程操作

| 操作 | 参考 |
|------|------|
| 创建新分支 | [分支管理规范](./workflows/流程规范/01-流程-分支管理规范.md) |
| 需求转提案 | [PRD → Proposal](./workflows/流程规范/04-流程-PRD到Proposal流程.md) |
| OpenSpec 变更 | [OpenSpec 工作流规范](./workflows/开发规范/02-规范-OpenSpec工作流规范.md) |
| 变更状态推进 | [变更状态管理](./workflows/流程规范/03-流程-变更状态管理规范.md) |
| 代码收口落地 | [变更落地工作流](./workflows/流程规范/02-流程-变更落地工作流.md) |
| 构建部署 | [构建部署](./workflows/流程规范/05-流程-构建部署.md) |
| 发布扩展 | [扩展发布流程](./workflows/流程规范/06-流程-扩展发布流程.md) |

## 关键约束速查

### 必须遵守
- 使用 **ApiClient** 封装所有 HTTP 请求，禁止直接 `fetch`
- 遵循 **4-Tier API 分层**：Component → Chat Store（Pinia）→ ApiClient → fetch
- **Content Script（ISOLATED）和 MAIN World 状态分离**
- MAIN World **禁止使用 chrome.\* API**（通过 IPC Relay 间接访问）
- 使用 **chrome.storage.local** 持久化状态（非 `localStorage`）
- 构建**禁用文件名哈希**（MV3 manifest 引用固定文件名）
- 构建**禁用代码分割**（Service Worker 需单文件）
- 所有用户可见文本使用**国际化**（chrome.i18n API）
- 注入前检查 `__YIPET_LOADED__` 防止重复注入
- SSE 流式响应必须处理 **AbortSignal** 取消
- 组件通过 **Store Actions** 操作状态，不直接修改 state
- RPC 参数名使用 **`filter`**（非 `query`）、**`target_file`**（非 `path`）

### 禁止
- MAIN World 不调用 `chrome.runtime.*` API
- ISOLATED World 不直接操作页面 DOM
- 不绕过 ApiClient 直接 `fetch`
- 不混用 Content Script 和 Service Worker 状态
- 不动态加载外部 JS（MV3 CSP）
- 不使用 `any` 类型（除非有充分理由）
- 不为单次使用创建抽象层
- 不忘记组件卸载时取消 AbortController

## 技术栈速查

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5 | Chat Window + Popup |
| TypeScript | 5.x | strict mode |
| Rsbuild | 1.x | 5 入口构建 |
| Element Plus | 2.14 | UI 组件库 |
| Pinia | 4.x | 状态管理 |
| Vitest | 2.x | 测试 |
| ESLint + Prettier | 10 + 3 | Lint + Format |

## 相关资源

### 项目级
- [YiPet/CLAUDE.md](../../../YiPet/CLAUDE.md) — 模块边界、近期变更
- [YrY/CLAUDE.md](../../../CLAUDE.md) — RPC 协议、跨项目关系

### 知识库
- [YiKnowledge/INDEX.md](../../INDEX.md) — 全库导航
- [YiKnowledge/MEMORY.md](../../MEMORY.md) — 规则手册
- [projects/INDEX.md](../INDEX.md) — 项目知识中心