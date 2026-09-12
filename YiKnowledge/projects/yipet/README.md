---
title: YiPet 知识库索引
tags: [yipet, index, chrome-extension, mv3, specs, workflows, bugs, requirements]
category: projects/yipet
created: 2026-08-25
updated: 2026-09-10
source: YiPet
type: index
status: active
---

# YiPet 项目知识库

> Chrome MV3 扩展的完整知识体系 — 架构规范、双世界执行、4-Tier API、实现模式、开发指南、工作流、需求、缺陷。

## 目录结构

```
YiKnowledge/projects/yipet/
├── README.md                  # 本文件 — 总索引
├── specs/                     # 架构规范 + 实现模式（18 篇）
│   ├── overview.md            # 架构概览（技术栈、双世界、4-Tier API、设计原则）
│   ├── directory-structure.md # 完整目录结构（源码树、多入口构建、依赖关系）
│   ├── extension-arch.md      # 扩展架构（MV3 约束、跨世界通信、注入流程、CSP）
│   ├── api.md                 # API 规范（ApiClient 四层封装、RPC、SSE、重试策略）
│   ├── api-layer.md           # API 层架构（client → endpoints → types → services 四层）
│   ├── dual-world.md          # 双世界执行（ISOLATED vs MAIN World 通信、安全边界）
│   ├── core-modules.md        # 核心模块（Chat Store、Popup、Bootstrap、IPC Relay）
│   ├── navigation.md          # 导航与视图管理（侧边栏视图、会话路由、深度链接、模态）
│   ├── auth.md                # 认证权限（Token 管理、跨世界传递、Session Key 桥接）
│   ├── i18n.md                # 国际化规范（chrome.i18n API、zh-CN/en）
│   ├── typescript.md          # TypeScript 类型规范（strict、类型组织、泛型、跨世界类型）
│   ├── components.md          # 组件规范（Chat Window、Popup、Floating Pet、Pinia Store 集成）
│   ├── chat-controller.md     # Chat Store 模式（Pinia 状态管理、SSE 流式、持久化）
│   ├── chat-controller-internals.md # Chat Store 内部机制（操作分发、流式解析、错误恢复）
│   ├── ipc-bridge.md          # IPC Relay 模式（IPC_SECRET 安全验证、消息路由）
│   ├── cdn-injection.md       # CDN 注入模式（资源加载、版本管理、降级策略）
│   ├── state-management.md    # 状态管理模式（跨世界同步、持久化、多标签页一致性）
│   └── error-handling.md      # 错误处理模式（分层处理、重试策略、降级方案）
├── workflows/                 # 开发指南 + 工作流（13 篇）
│   ├── quickstart.md          # 快速开始（环境搭建、安装构建、加载扩展、调试）
│   ├── coding-standards.md    # 编码规范（命名、提交、质量门禁）
│   ├── build-deploy.md        # 构建部署（多入口 Rsbuild、Chrome Web Store 发布）
│   ├── testing.md             # 测试指南（Vitest 单元测试、Content Script 测试、E2E 策略）
│   ├── dependencies-dev.md    # 开发依赖（构建工具、代码质量、Git 工具）
│   ├── dependencies-runtime.md# 运行时依赖（框架、UI、工具库、CDN 资源）
│   ├── adding-feature.md      # 添加功能流程
│   ├── branching.md           # 分支管理策略（环境映射、发布流程、hotfix）
│   ├── extension-release.md   # 扩展发布流程（Chrome Web Store 审核）
│   ├── prd-to-proposal.md     # PRD → Proposal 结构化提炼
│   ├── standards.md           # OpenSpec 工作流规范
│   ├── state.md               # 变更状态管理
│   └── land.md                # 变更落地流程
├── requirements/              # 需求（按月归档）
│   ├── INDEX.md               # 需求文档体系导航（编号体系、分类、模板标准）
│   ├── 2026-07/               # 7 月需求（技术栈升级、工具链迁移、聊天窗口移植）
│   ├── 2026-08/               # 8 月需求（Agent 模式、情感记忆、安全合规）
│   └── 2026-09/               # 9 月需求（稳定性修复、Agent 移植、安全合规）
└── bugs/                      # 缺陷（按分类归档）
    ├── README.md              # 缺陷索引 + 分类目录 + 常见模式 + 排查流程
    ├── template/              # 缺陷模板
    ├── content/               # Content Script 类
    ├── worker/                # Service Worker 类
    ├── chat/                  # Chat Window 类
    ├── api/                   # API 通信类
    ├── state/                 # 状态管理类
    ├── build/                 # 构建部署类
    └── security/              # 安全类
```

## 快速导航

### 新人入门

1. [快速开始](./workflows/操作指南/01-快速开始.md) — 环境搭建、安装构建、加载扩展
2. [架构概览](./specs/架构设计/01-架构概览.md) — 技术栈、双世界执行、4-Tier API
3. [扩展架构](./specs/架构设计/02-扩展架构.md) — MV3 约束、跨世界通信、注入流程
4. [目录结构](./specs/架构设计/04-目录结构.md) — 完整源码目录树
5. [编码规范](./workflows/开发规范/01-项目规范.md) — 命名、提交、质量门禁

### 日常开发

| 场景 | 参考文档 |
|------|----------|
| 开发聊天功能 | [Chat Store 模式](./specs/功能模式/01-ChatStore模式.md) + [核心模块](./specs/架构设计/05-核心模块.md) |
| 调用后端 API | [API 规范](./specs/开发规范/01-API规范.md) |
| 处理跨世界通信 | [IPC Relay 模式](./specs/架构设计/06-IPC跨世界通信.md) + [扩展架构](./specs/架构设计/02-扩展架构.md) |
| 管理跨世界状态 | [状态管理模式](./specs/开发规范/07-状态管理模式.md) |
| 处理错误和降级 | [错误处理模式](./specs/开发规范/08-错误处理模式.md) |
| 管理 CDN 资源 | [CDN 注入模式](./specs/架构设计/07-CDN资源注入.md) |
| 开发 Popup 功能 | [组件规范](./specs/开发规范/06-组件规范.md) + [核心模块](./specs/架构设计/05-核心模块.md) |
| 修改 Floating Pet | [扩展架构 #Floating Pet](./specs/架构设计/02-扩展架构.md) + [组件规范](./specs/开发规范/06-组件规范.md) |
| 实现侧边栏导航 | [导航与视图管理](./specs/功能模式/03-导航与视图管理.md) |
| 添加跨项目桥接 | [认证权限 #Session Key 桥接](./specs/开发规范/03-认证与权限.md) |
| 添加国际化文本 | [国际化规范](./specs/开发规范/05-国际化.md) |
| 定义 TypeScript 类型 | [TypeScript 规范](./specs/开发规范/04-TypeScript类型规范.md) |
| 创建新组件 | [组件规范](./specs/开发规范/06-组件规范.md) |
| 处理 Token 认证 | [认证权限](./specs/开发规范/03-认证与权限.md) |
| 编写测试 | [测试指南](./workflows/操作指南/03-测试指南.md) |

### 代码审查

| 检查项 | 参考 |
|--------|------|
| 是否通过 ApiClient 而非直接 fetch | [API 规范](./specs/开发规范/01-API规范.md) |
| 是否遵循 4-Tier API 分层 | [API 规范 #四层封装](./specs/开发规范/01-API规范.md) |
| Content Script 和 Service Worker 状态是否分离 | [扩展架构 #双世界](./specs/架构设计/02-扩展架构.md) |
| MAIN World 是否避免使用 chrome.* API | [扩展架构 #双世界 API 可用性](./specs/架构设计/02-扩展架构.md) |
| 参数名是否使用 `filter` 而非 `query` | [API 规范 #关键参数约定](./specs/开发规范/01-API规范.md) |
| 是否使用 `chrome.storage` 而非 `localStorage` | [认证权限 #存储安全](./specs/开发规范/03-认证与权限.md) |
| IPC 消息是否通过 IPC_SECRET + 时间戳验证 | [IPC Relay 模式](./specs/架构设计/06-IPC跨世界通信.md) |
| 是否使用 dispatchSecureEvent 而非裸 postMessage | [IPC Relay 模式](./specs/架构设计/06-IPC跨世界通信.md) |
| 组件是否通过 Store Actions 操作而非直接修改 state | [组件规范 #Store 集成](./specs/开发规范/06-组件规范.md) |
| 组件卸载时是否取消订阅和 AbortController | [组件规范 #反模式](./specs/开发规范/06-组件规范.md) |
| 是否监听 `visibilitychange` 处理标签页后台 | [状态管理模式](./specs/开发规范/07-状态管理模式.md) |
| 错误是否对用户可见且有恢复路径 | [错误处理模式](./specs/开发规范/08-错误处理模式.md) |
| 是否使用 `<script setup lang="ts">` | [组件规范 #书写约定](./specs/开发规范/06-组件规范.md) |
| TypeScript 类型检查是否通过 | [TypeScript 规范](./specs/开发规范/04-TypeScript类型规范.md) |
| 构建是否禁用文件名哈希和代码分割 | [目录结构 #构建约束](./specs/架构设计/04-目录结构.md) |
| 是否有对应的单元测试 | [测试指南](./workflows/操作指南/03-测试指南.md) |

### 流程操作

| 操作 | 参考 |
|------|------|
| 创建新分支 | [分支管理](./workflows/流程规范/01-分支管理规范.md) |
| 需求转提案 | [PRD → Proposal](./workflows/流程规范/04-PRD到Proposal流程.md) |
| OpenSpec 变更 | [OpenSpec 规范](./workflows/开发规范/02-OpenSpec工作流规范.md) |
| 变更状态推进 | [状态管理](./workflows/流程规范/03-变更状态管理规范.md) |
| 代码收口落地 | [落地流程](./workflows/流程规范/02-变更落地工作流.md) |
| 发布扩展 | [扩展发布](./workflows/流程规范/06-扩展发布流程.md) + [构建部署](./workflows/流程规范/05-构建部署.md) |

## 关键约束速查

### 必须遵守
- 使用 **ApiClient** 封装所有 HTTP 请求，禁止直接使用 `fetch`
- 遵循 **4-Tier API 分层**：Component → Chat Store（Pinia）→ ApiClient → fetch
- **Content Script（ISOLATED World）和 MAIN World 状态分离**
- MAIN World 代码**禁止使用 chrome.* API**（通过 IPC Relay 间接访问）
- 使用 **chrome.storage.local** 持久化状态（非 `localStorage`）
- 构建产物**禁用文件名哈希**（MV3 manifest 引用固定文件名）
- 构建产物**禁用代码分割**（Service Worker 需要单文件）
- 所有用户可见文本使用**国际化**（chrome.i18n API）
- 注入前检查 `__YIPET_LOADED__` 防止重复注入
- SSE 流式响应必须处理 **AbortSignal** 取消
- 组件通过 **Store Actions** 操作状态，不直接修改 state
- RPC 参数名使用 **`filter`**（非 `query`）、**`target_file`**（非 `path`）

### 禁止
- 不在 MAIN World 代码中调用 `chrome.runtime.*` API
- 不在 ISOLATED World 代码中直接操作页面 DOM
- 不绕过 ApiClient 直接调用 `fetch`
- 不混用 Content Script 和 Service Worker 状态
- 不动态加载外部 JS（MV3 CSP 禁止远程代码执行）
- 不使用 `any` 类型（除非有充分理由）
- 不为单次使用创建抽象层
- 不在组件中直接修改 Chat Store 状态
- 不忘记在组件卸载时取消订阅和 AbortController

## 技术栈速查

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5 | 前端框架（Chat Window + Popup） |
| TypeScript | 5.x | 类型系统（strict mode） |
| Rsbuild | 1.x | 构建工具（多入口：content + sw + popup + chat + cdn） |
| Element Plus | 2.14 | UI 组件库（Chat Window + Popup） |
| Pinia | 4.x | 状态管理（Popup 端） |
| Chrome MV3 | — | 扩展平台（Manifest V3） |
| Vitest | 2.x | 测试框架 |
| ESLint + Prettier | 10 + 3 | Lint + Format |

## 相关资源

### 项目级文档
- [YiPet/CLAUDE.md](../../../YiPet/CLAUDE.md) — YiPet 项目 CLAUDE.md（模块边界、近期变更、自约束）
- [YiPet/docs/specs/](../../../YiPet/docs/specs/) — YiPet 架构规范（AI 代码生成用）
- [YiPet/docs/workflows/](../../../YiPet/docs/workflows/) — YiPet 任务工作流
- [YrY/CLAUDE.md](../../../CLAUDE.md) — 单体仓库级 CLAUDE.md（RPC 协议、跨项目关系）

### 知识库层
- [YiKnowledge/INDEX.md](../../INDEX.md) — 知识库顶层导航索引
- [YiKnowledge/README.md](../../README.md) — 知识库流水线概览与角色决策树
- [YiKnowledge/MEMORY.md](../../MEMORY.md) — 知识库规则手册与命名约定
- [YiKnowledge/projects/INDEX.md](../INDEX.md) — 项目知识中心完整文件清单
- [YiKnowledge/projects/README.md](../README.md) — 项目知识中心总览与导航入口

### 相关角色目录
- [YiKnowledge/engineer/README.md](../../engineer/README.md) — 工程实现层（架构模式、开发实践、质量安全）
- [YiKnowledge/engineer/learn/lessons/](../../engineer/learn/lessons/) — 经验教训（成功/失败/陷阱/缺陷）
- [YiKnowledge/aier/README.md](../../aier/README.md) — AI 赋能层（RAG 模式、Agent 架构、LLM 评估）
- [YiKnowledge/srer/release/](../../srer/release/) — 发布流程（金丝雀、热修复、回滚演练）

### 跨项目参考
- [YiVad 知识库](../yivad/README.md) — YiVad 管理后台知识库（跨项目桥接目标）
- [YiAi 知识库](../yiai/README.md) — YiAi 后端知识库（API 契约、RPC 协议）

### 项目内索引
- [requirements/INDEX.md](./requirements/INDEX.md) — 需求文档体系导航（编号体系 YP-{月}-{序号}、文档分类、模板标准、月度迭代概览）