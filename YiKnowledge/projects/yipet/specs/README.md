---
title: YiPet 项目开发规范索引
tags: [yipet, specs, chrome-extension, mv3]
category: projects/yipet/specs
created: 2026-09-02
updated: 2026-09-02
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "AI 代码生成的规范索引，所有 YiPet 开发规范统一管理"
---

# YiPet 项目开发规范索引

本文档是 AI 代码生成的规范索引，所有规范文档在此目录下统一管理。

---

## 架构规范

| 文档 | 说明 |
|------|------|
| [项目架构摘要](./项目架构摘要.md) | YiPet 技术栈、目录结构、双世界执行、CDN 注入、API 层、跨项目桥接 |
| [API 调用规范](./架构/api规范/规范.md) | 四层 API 架构、ApiClient 类、RPC 信封、SSE 流式、构造函数注入 |
| [扩展架构规范](./架构/扩展架构/规范.md) | MV3 双世界执行、内容脚本注入、消息传递、chrome.storage、CSP 合规 |
| [组件模式规范](./架构/组件模式/规范.md) | React 18 函数组件 + Hooks、co-located CSS、Ant Design 组件 |
| [国际化规范](./架构/国际化规范/规范.md) | chrome.i18n API、messages.json、locale 检测、时区处理 |

## 模式与控制器

| 文档 | 说明 |
|------|------|
| [Chat 控制器模式](./模式/聊天控制器/规范.md) | useSyncExternalStore、ChatState、actions、SSE 流式、知识库接地 |

## 工作流

| 文档 | 说明 |
|------|------|
| [分支管理规范](./workflows/分支管理.md) | dev -> test -> release -> master 分支策略 |
| [扩展发布流程](./workflows/扩展发布.md) | Chrome Web Store 发布、版本号更新、构建流程 |

---

## 规范文档目录结构

```
specs/
├── README.md                              # 本文件：规范索引
├── 项目架构摘要.md                         # 项目架构总览
├── 架构/
│   ├── api规范/
│   │   └── 规范.md                        # API 调用规范
│   ├── 扩展架构/
│   │   └── 规范.md                        # 扩展架构规范
│   ├── 组件模式/
│   │   └── 规范.md                        # 组件模式规范
│   └── 国际化规范/
│       └── 规范.md                        # 国际化规范
├── 模式/
│   └── 聊天控制器/
│       └── 规范.md                        # Chat 控制器模式
└── workflows/
    ├── 分支管理.md               # 分支管理规范
    └── 扩展发布.md               # 扩展发布流程
```

---

## 使用指南

### AI 代码生成

当 AI 需要为 YiPet 生成代码时，应首先查阅本索引，找到对应的规范文档：

1. **新增 API 调用** -> 查阅 [API 调用规范](./架构/api规范/规范.md)
2. **新增组件** -> 查阅 [组件模式规范](./架构/组件模式/规范.md)
3. **修改 Chat 交互** -> 查阅 [Chat 控制器模式](./模式/聊天控制器/规范.md)
4. **配置扩展能力** -> 查阅 [扩展架构规范](./架构/扩展架构/规范.md)
5. **添加国际化文案** -> 查阅 [国际化规范](./架构/国际化规范/规范.md)

### 规范优先级

1. 本目录下的规范文件为最高优先级
2. 其次参考 YiPet 项目根目录的 `CLAUDE.md`
3. 最后参考 monorepo 根 `CLAUDE.md` 中的跨项目协议

---

## 约束

### MUST

- 所有 Chrome API 调用必须通过 `src/popup/services/chrome.ts` 或 `src/shared/state.ts` 封装
- 所有 API 调用必须通过 `src/api/` 四层架构（client -> endpoints -> types -> services）
- 双世界代码必须明确区分 ISOLATED 和 MAIN 世界边界
- 组件样式必须 co-located（与组件同目录的 CSS 文件）
- 所有用户可见文本必须使用 `chrome.i18n` API

### MUST NOT

- 不要在 MAIN 世界代码中调用 `chrome.runtime.*` API
- 不要在 ISOLATED 世界代码中直接操作页面 DOM
- 不要跳过 API 层的任何一层调用 `fetch`
- 不要在组件中使用 `any` 类型
- 不要硬编码中文文本