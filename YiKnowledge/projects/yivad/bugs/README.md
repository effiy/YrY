---
title: YiVad 缺陷索引
tags: [yivad, bugs, index]
category: projects/yivad/bugs
created: 2026-08-01
updated: 2026-10-07
source: YiVad
type: index
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer]
benefit: "YiVad 前端缺陷的统一追踪入口，按月份和分类归档"
---

# YiVad 缺陷追踪

> 按月份 → 分类归档的缺陷记录，每个缺陷包含复现步骤、根因分析、修复方案和预防措施。

## 目录结构

```
bugs/
├── README.md                  # 本文件 — 缺陷索引
└── 2026-09/
    ├── 模板/                  # 缺陷模板
    └── 国际化/                # i18n 相关缺陷
```

## 分类目录

| 分类 | 说明 |
|------|------|
| 国际化 | i18n 翻译、`$t()` 调用、语言切换、RTL 布局 |
| 代码质量 | 死代码、未使用导入、类型错误、代码异味 |
| 数据 | 表单校验、数据绑定、计数、标签默认值 |
| 路由权限 | 动态路由、v-auth 权限、菜单排序 |
| 模板 | 缺陷模板 |

> 新缺陷按 `{月份}/{分类}/` 归类，分类目录不存在时创建。

## 严重度

| 严重度 | 定义 |
|--------|------|
| **critical** | 应用不可用、数据丢失或安全漏洞 |
| **major** | 核心功能不可用，但应用可基本运行 |
| **minor** | 功能受损但不影响核心流程 |
| **trivial** | 视觉瑕疵、文案错误 |

## 优先级

| 优先级 | 响应 |
|--------|------|
| **P0** | 即时修复，阻塞发布 |
| **P1** | 下一迭代 |
| **P2** | 计划内修复 |
| **P3** | 积压待排 |

## 生命周期

```
open → analyzing → in_progress → resolved → verified → closed
  │                                              │
  └── cannot_reproduce / wont_fix                └── 验证失败 → open
```

## 缺陷列表

### 2026-09

| ID | 标题 | 严重度 | 优先级 | 分类 | 模块 | 状态 | 日期 |
|----|------|--------|--------|------|------|------|------|
| 1 | [项目列表页 i18n title 未显示](./2026-09/国际化/001-国际化-项目标题未显示.md) | minor | p2 | 国际化 | views/project | resolved | 2026-09-03 |
| 2 | DetailRequirements.vue 组件未被使用 | minor | p2 | 代码质量 | views/project | resolved | 2026-09-07 |
| 3 | 文档 Tab 计数与实际列表不一致 | minor | p2 | 数据 | views/project | resolved | 2026-09-07 |
| 4 | DetailDocs 与 DetailOverview 标签默认值不一致 | trivial | p3 | 数据 | views/project | resolved | 2026-09-07 |
| 5 | DetailDocs CLAUDE.md 加载失败提示未国际化 | minor | p2 | 数据 | views/project | resolved | 2026-09-07 |
| 6 | 活动时间线和模块 Issue 点击尝试打开不存在的文件 | major | p1 | 数据 | views/project | resolved | 2026-09-07 |
| 7 | 逾期统计错误地将已取消 Issue 计入 | minor | p2 | 数据 | views/project | resolved | 2026-09-07 |
| 8 | DetailMembers 添加/移除成员成功提示未国际化 | minor | p2 | 数据 | views/project | resolved | 2026-09-07 |
| 9 | HeroDateNav 日期导航按钮和提示未国际化 | minor | p2 | 数据 | components/HeroDateNav | resolved | 2026-09-07 |
| 10 | 需求 Issue 编辑状态后 Save 按钮无效果 | major | p1 | 数据 | views/issue | resolved | 2026-09-08 |
| 11 | components.d.ts 数字命名组件类型错误 | major | p1 | 代码质量 | typings/components.d.ts | resolved | 2026-09-08 |
| 12 | useProjectDetail 返回类型推断错误 | major | p1 | 代码质量 | hooks/useProjectDetail.ts | resolved | 2026-09-08 |
| 13 | PermissionMatrix el-checkbox 类型不匹配 | minor | p2 | 代码质量 | views/system/roleManage | resolved | 2026-09-08 |
| 14 | issue/detail.vue Upload 图标未导入 | minor | p2 | 代码质量 | views/issue/detail.vue | resolved | 2026-09-08 |
| 15 | DetailMembers project 可能为 null 缺少守卫 | minor | p2 | 数据 | views/project/components | resolved | 2026-09-08 |
| 16 | TopicDetailPage 导入了不存在的 contentPathFor | minor | p3 | 代码质量 | components/TopicDetailPage | closed | 2026-09-09 |
| 17 | Story Scenario 类型缺少 trigger/prerequisites/expectedResult | minor | p2 | 代码质量 | api/modules/story.ts | closed | 2026-09-09 |
| 18 | KeyboardShortcuts 测试 findComponent 名称不匹配 | trivial | p3 | 代码质量 | tests/components | closed | 2026-09-09 |
| 19 | confirmationAnswer 和 continuation 源码模块缺失 | minor | p2 | 代码质量 | src/utils/ | closed | 2026-09-09 |
| 20 | OkrRecommendTable ColumnFilters Prop 被直接修改 | minor | p2 | 代码质量 | components/OkrRecommend | closed | 2026-09-09 |
| 21 | RoleTableView Filters Prop 被直接修改 | minor | p2 | 代码质量 | views/knowledge/components | closed | 2026-09-09 |
| 22 | Vue 模板属性未使用 kebab-case 命名 | trivial | p3 | 代码质量 | views/knowledge | closed | 2026-09-09 |
| 23 | 8 个 hooks 文件未被任何代码引用 | minor | p2 | 代码质量 | hooks | open | 2026-09-09 |
| 24 | system 模块硬编码中文字符串未使用 i18n | minor | p2 | 代码质量 | views/system | closed | 2026-09-09 |
| 25 | 工具 hooks 中硬编码字符串未使用 i18n | minor | p2 | 代码质量 | hooks | open | 2026-09-09 |
| 26 | 3 个组件文件超过 1000 行 | minor | p3 | 代码质量 | views/aiChat, views/knowledge | open | 2026-09-09 |
| 27 | Store 和 util 模块中 `as any` 类型断言过多 | minor | p3 | 代码质量 | stores, utils | open | 2026-09-09 |
| 28 | useHandleData 和 useDownload 使用 `any` 类型 | minor | p3 | 代码质量 | hooks | open | 2026-09-09 |
| 29 | v-html 渲染未经过 XSS 消毒的用户/AI 内容 | minor | p2 | 代码质量 | 20+ 个文件 | open | 2026-09-09 |
| 30 | 4 个视图文件中存在非 scoped 样式造成全局 CSS 泄漏 | trivial | p3 | 代码质量 | 4 个视图 | open | 2026-09-09 |
| 31 | useKnowledgeBase composable 达 1693 行需拆分 | minor | p2 | 代码质量 | views/dashboard/knowledgeBase | open | 2026-09-09 |
| 32 | 交互式元素缺少无障碍属性 | trivial | p3 | 代码质量 | 30+ 组件 | open | 2026-09-09 |
| 33 | 动态路由初始化中 ElNotification 硬编码英文 | trivial | p3 | 代码质量 | routers/modules/dynamicRouter.ts | closed | 2026-09-09 |
| 34 | 多个 Pinia Store 持久化未在注销时清理 | minor | p2 | 代码质量 | stores/modules, routers | open | 2026-09-09 |
| 35 | OkrRecommendPanel 等确认对话框使用硬编码字符串 | trivial | p3 | 代码质量 | 6 个组件 | open | 2026-09-09 |
| 36 | inject() 使用非空断言缺少提供者时运行时崩溃 | minor | p2 | 代码质量 | DetailMembers/DetailDocs/DetailOverview | closed | 2026-09-09 |
| 37 | 未使用 effectScope/onScopeDispose 清理 composable 副作用 | trivial | p3 | 代码质量 | hooks/ | open | 2026-09-09 |
| 38 | unplugin 插件版本可能过时 | trivial | p3 | 代码质量 | package.json | open | 2026-09-09 |
| 39 | README.md 预览不全—文件路径解析失败 | major | p1 | 数据 | views/project/components/DetailOverview.vue | resolved | 2026-09-10 |
| 40 | 侧边栏菜单显示顺序未按 menuMange 中的 order 字段排序 | minor | p1 | 路由权限 | utils, stores/typings | resolved | 2026-09-12 |

## 分类统计

| 严重度 | 数量 |
|--------|------|
| major | 5 |
| minor | 25 |
| trivial | 10 |

| 分类 | 数量 |
|------|------|
| 国际化 | 1 |
| 代码质量 | 28 |
| 数据 | 10 |
| 路由权限 | 1 |

## 常见缺陷模式

### 模板语法（国际化/）

- **i18n 表达式未绑定**：`prop="$t(...)"` 应为 `:prop="$t(...)"` — 静态属性传递字面字符串而非表达式结果
- **v-bind 缺失**：数字/布尔/数组/对象 prop 必须使用 `:prop="value"` 格式

### 数据校验

- **表单校验 prop 不匹配**：`el-form-item prop` 与 `v-model` 绑定路径不一致 — 校验规则始终读取空值

### 排查流程

1. 确认问题是否可稳定复现（frequency: always / intermittent）
2. 检查浏览器控制台是否有相关错误或警告
3. Vue DevTools 中检查组件 props/state 实际值
4. 对比预期行为与实际行为，定位根因层级（模板/逻辑/数据）
5. 根据根因归入对应分类目录

## 相关资源

- [缺陷模板](./2026-09/模板/00-模板-项目bug模板.md)
- [YiAi 缺陷索引](../../yiai/bugs/README.md)
- [YiVad 开发文档](../devs/)
- [RPC 协议规范](../../../../CLAUDE.md#rpc-协议详细规范)