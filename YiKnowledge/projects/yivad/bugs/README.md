---
title: 缺陷索引
tags: [yivad, bug, index]
category: projects/yivad/bugs
created: 2026-08-01
updated: 2026-09-12
source: YiVad
type: bug-index
status: active
---

# 缺陷索引

> YiVad 项目已知缺陷记录，按月份 → 分类目录组织，时间倒序排列。

## 目录结构

```
bugs/
├── README.md
├── 2026-07/
│   ├── 模板/
│   ├── 代码质量/
│   └── 数据/
├── 2026-08/
│   ├── 模板/
│   ├── 代码质量/
│   └── 数据/
└── 2026-09/
    ├── 模板/
    ├── 代码质量/
    └── 数据/
```

## 分类目录

| 分类 | 路径示例 | 说明 |
|------|------|------|
| 模板语法 | `2026-09/模板/` | Vue 模板语法错误（v-bind 缺失、指令使用错误等） |
| 数据校验 | `2026-09/数据/` | 表单校验、数据绑定路径不匹配等问题 |
| 数据显示 | `2026-09/数据/` | 计数不一致、标签默认值、数据展示问题 |
| 代码质量 | `2026-09/代码质量/` | 死代码、未使用导入、代码异味 |
| 样式 | `2026-09/style/` | CSS/SCSS 样式问题 |
| 状态管理 | `2026-09/state/` | Pinia Store、响应式数据问题 |
| API 通信 | `2026-09/api/` | RPC 调用、SSE 流、请求参数问题 |
| 路由权限 | `2026-09/router/` | 动态路由、v-auth 权限、菜单问题 |
| 构建部署 | `2026-09/build/` | Rsbuild 构建、环境变量、依赖问题 |

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

| 月份 | ID | 标题 | 严重度 | 优先级 | 分类 | 模块 | 状态 | 日期 |
|------|----|------|--------|--------|------|------|------|------|
| 2026-09 | 1 | [项目列表页 i18n title 未显示](./2026-09/模板/01-模板-项目国际化标题未显示.md) | minor | p2 | template | views/project | resolved | 2026-09-03 |
| 2026-09 | 2 | [DetailRequirements.vue 组件未被使用](./2026-09/代码质量/01-质量-DetailRequirements组件未使用.md) | minor | p2 | code-quality | views/project | resolved | 2026-09-07 |
| 2026-09 | 3 | [文档 Tab 计数与实际列表不一致](./2026-09/数据/01-数据-文档Tab计数不一致.md) | minor | p2 | data | views/project | resolved | 2026-09-07 |
| 2026-09 | 4 | [DetailDocs 与 DetailOverview 标签默认值不一致](./2026-09/数据/09-数据-文档标签默认值不一致.md) | trivial | p3 | data | views/project | resolved | 2026-09-07 |
| 2026-09 | 5 | [DetailDocs CLAUDE.md 加载失败提示未国际化](./2026-09/数据/03-数据-DetailDocs-CLAUDE加载失败提示未国际化.md) | minor | p2 | data | views/project | resolved | 2026-09-07 |
| 2026-09 | 6 | [活动时间线和模块 Issue 点击尝试打开不存在的文件](./2026-09/数据/10-数据-Issue点击打开不存在的文件.md) | major | p1 | data | views/project | resolved | 2026-09-07 |
| 2026-09 | 7 | [逾期统计错误地将已取消 Issue 计入](./2026-09/数据/08-数据-逾期统计错误计入已取消Issue.md) | minor | p2 | data | views/project | resolved | 2026-09-07 |
| 2026-09 | 8 | [DetailMembers 添加/移除成员成功提示未国际化](./2026-09/数据/07-数据-DetailMembers提示未国际化.md) | minor | p2 | data | views/project | resolved | 2026-09-07 |
| 2026-09 | 9 | [HeroDateNav 日期导航按钮和提示未国际化](./2026-09/数据/06-数据-HeroDateNav日期导航硬编码中文.md) | minor | p2 | data | components/HeroDateNav | resolved | 2026-09-07 |
| 2026-09 | 10 | [需求 Issue 编辑状态后 Save 按钮无效果](./2026-09/数据/04-数据-需求Issue编辑保存无效果.md) | major | p1 | data | views/issue/composables/useIssueDialog.ts | resolved | 2026-09-08 |
| 2026-09 | 11 | [components.d.ts 数字命名组件类型错误](./2026-09/代码质量/02-质量-components.d.ts数字命名类型错误.md) | major | p1 | code-quality | typings/components.d.ts | resolved | 2026-09-08 |
| 2026-09 | 12 | [useProjectDetail 返回类型推断错误](./2026-09/代码质量/05-质量-useProjectDetail返回类型推断错误.md) | major | p1 | code-quality | hooks/useProjectDetail.ts | resolved | 2026-09-08 |
| 2026-09 | 13 | [PermissionMatrix el-checkbox 类型不匹配](./2026-09/代码质量/04-质量-PermissionMatrix-checkbox类型不匹配.md) | minor | p2 | code-quality | views/system/roleManage | resolved | 2026-09-08 |
| 2026-09 | 14 | [issue/detail.vue Upload 图标未导入](./2026-09/代码质量/03-质量-IssueDetail-Upload图标未导入.md) | minor | p2 | code-quality | views/issue/detail.vue | resolved | 2026-09-08 |
| 2026-09 | 15 | [DetailMembers project 可能为 null 缺少守卫](./2026-09/数据/02-数据-DetailMembers-null缺少守卫.md) | minor | p2 | data | views/project/components/DetailMembers.vue | resolved | 2026-09-08 |
| 2026-09 | 16 | [TopicDetailPage 导入了不存在的 contentPathFor](./2026-09/代码质量/06-质量-TopicDetailPage-contentPathFor-死代码导入.md) | minor | p3 | code-quality | components/TopicDetailPage/index.vue | closed | 2026-09-09 |
| 2026-09 | 17 | [Story Scenario 类型缺少 trigger/prerequisites/expectedResult](./2026-09/代码质量/07-质量-Story-Scenario类型缺少字段.md) | minor | p2 | code-quality | api/modules/story.ts | closed | 2026-09-09 |
| 2026-09 | 18 | [KeyboardShortcuts 测试 findComponent 名称不匹配](./2026-09/代码质量/08-质量-KeyboardShortcuts测试findComponent不匹配.md) | trivial | p3 | code-quality | tests/components/KeyboardShortcuts.test.ts | closed | 2026-09-09 |
| 2026-09 | 19 | [confirmationAnswer 和 continuation 源码模块缺失](./2026-09/代码质量/09-质量-confirmationAnswer-continuation来源缺失.md) | minor | p2 | code-quality | src/utils/ | closed | 2026-09-09 |
| 2026-09 | 20 | [OkrRecommendTable ColumnFilters Prop 被直接修改](./2026-09/代码质量/10-质量-OkrRecommendTable-columnFilters属性直接修改.md) | minor | p2 | code-quality | components/OkrRecommend | closed | 2026-09-09 |
| 2026-09 | 21 | [RoleTableView Filters Prop 被直接修改](./2026-09/代码质量/11-质量-RoleTableView-filters属性直接修改.md) | minor | p2 | code-quality | views/knowledge/components | closed | 2026-09-09 |
| 2026-09 | 22 | [Vue 模板属性未使用 kebab-case 命名](./2026-09/代码质量/12-质量-Vue模板属性未使用连字符.md) | trivial | p3 | code-quality | views/knowledge | closed | 2026-09-09 |
| 2026-09 | 23 | [8 个 hooks 文件未被任何代码引用](./2026-09/代码质量/13-质量-未使用的hooks死代码.md) | minor | p2 | code-quality | hooks | open | 2026-09-09 |
| 2026-09 | 24 | [system 模块硬编码中文字符串未使用 i18n](./2026-09/代码质量/14-质量-系统视图硬编码中文.md) | minor | p2 | code-quality | views/system | closed | 2026-09-09 |
| 2026-09 | 25 | [工具 hooks 中硬编码字符串未使用 i18n](./2026-09/代码质量/15-质量-hooks硬编码字符串.md) | minor | p2 | code-quality | hooks | open | 2026-09-09 |
| 2026-09 | 26 | [3 个组件文件超过 1000 行](./2026-09/代码质量/16-质量-组件体积过大.md) | minor | p3 | code-quality | views/aiChat, views/knowledge | open | 2026-09-09 |
| 2026-09 | 27 | [Store 和 util 模块中 `as any` 类型断言过多](./2026-09/代码质量/17-质量-stores中any类型滥用.md) | minor | p3 | code-quality | stores, utils | open | 2026-09-09 |
| 2026-09 | 28 | [useHandleData 和 useDownload 使用 `any` 类型](./2026-09/代码质量/18-质量-useHandleData-any类型.md) | minor | p3 | code-quality | hooks | open | 2026-09-09 |
| 2026-09 | 29 | [v-html 渲染未经过 XSS 消毒的用户/AI 内容](./2026-09/代码质量/19-质量-v-html未消毒XSS风险.md) | minor | p2 | code-quality | 20+ 个文件 | open | 2026-09-09 |
| 2026-09 | 30 | [4 个视图文件中存在非 scoped 样式造成全局 CSS 泄漏](./2026-09/代码质量/20-质量-非scoped样式全局泄漏.md) | trivial | p3 | code-quality | 4 个视图 | open | 2026-09-09 |
| 2026-09 | 31 | [useKnowledgeBase composable 达 1693 行需拆分](./2026-09/代码质量/21-质量-useKnowledgeBase组合式函数过大.md) | minor | p2 | code-quality | views/dashboard/knowledgeBase | open | 2026-09-09 |
| 2026-09 | 32 | [交互式元素缺少无障碍属性](./2026-09/代码质量/22-质量-缺少无障碍属性.md) | trivial | p3 | code-quality | 30+ 组件 | open | 2026-09-09 |
| 2026-09 | 33 | [动态路由初始化中 ElNotification 硬编码英文](./2026-09/代码质量/23-质量-路由硬编码英文通知.md) | trivial | p3 | code-quality | routers/modules/dynamicRouter.ts | closed | 2026-09-09 |
| 2026-09 | 34 | [多个 Pinia Store 持久化未在注销时清理](./2026-09/代码质量/24-质量-持久化store退出登录未清除.md) | minor | p2 | code-quality | stores/modules, routers | open | 2026-09-09 |
| 2026-09 | 35 | [OkrRecommendPanel 等确认对话框使用硬编码中/英文字符串](./2026-09/代码质量/25-质量-确认对话框硬编码字符串.md) | trivial | p3 | code-quality | 6 个组件 | open | 2026-09-09 |
| 2026-09 | 36 | [inject() 使用非空断言 (!) 缺少提供者时运行时崩溃](./2026-09/代码质量/26-质量-inject非空断言崩溃风险.md) | minor | p2 | code-quality | DetailMembers/DetailDocs/DetailOverview | closed | 2026-09-09 |
| 2026-09 | 45 | [未使用 effectScope/onScopeDispose 清理 composable 副作用](./2026-09/代码质量/36-质量-未使用的effectScope生命周期.md) | trivial | p3 | code-quality | hooks/ | open | 2026-09-09 |
| 2026-09 | 77 | [unplugin 插件版本可能过时](./2026-09/代码质量/68-质量-unplugin版本可能过时.md) | trivial | p3 | code-quality | package.json | open | 2026-09-09 |
| 2026-09 | 78 | [README.md 预览不全—文件路径解析失败](./2026-09/数据/22-数据-README文件路径解析失败导致预览不全.md) | major | p1 | data | views/project/components/DetailOverview.vue | resolved | 2026-09-10 |
| 2026-09 | 79 | [侧边栏菜单显示顺序未按 menuMange 中的 order 字段排序](./2026-09/路由权限/01-路由-菜单未按order字段排序.md) | minor | p1 | router | utils, stores/typings | resolved | 2026-09-12 |

## 分类统计

| 严重度 | 数量 | 缺陷 |
|--------|------|------|
| major | 5 | #6, #10, #11, #12, #78 |
| minor | 25 | #1, #2, #3, #5, #7, #8, #9, #13, #14, #15, #16, #17, #19, #20, #21, #23, #24, #25, #26, #27, #28, #29, #31, #34, #79 |
| trivial | 6 | #4, #18, #22, #30, #32, #33 |

| 分类 | 数量 | 缺陷 |
|------|------|------|
| template | 1 | #1 |
| code-quality | 22 | #2, #11, #12, #13, #14, #16, #17, #18, #19, #20, #21, #22, #23, #24, #25, #26, #27, #28, #29, #30, #31, #32 |
| data | 10 | #3, #4, #5, #6, #7, #8, #9, #10, #15, #78 |
| router | 1 | #79 |

## 常见缺陷模式

### 模板语法（模板/）

- **i18n 表达式未绑定**：`prop="$t(...)"` 应为 `:prop="$t(...)"` — 静态属性传递字面字符串而非表达式结果
- **v-bind 缺失**：数字/布尔/数组/对象 prop 必须使用 `:prop="value"` 格式

### 数据校验（validation/）

- **表单校验 prop 不匹配**：`el-form-item prop` 与 `v-model` 绑定路径不一致 — 校验规则始终读取空值

### 排查流程

1. 确认问题是否可稳定复现（frequency: always / intermittent）
2. 检查浏览器控制台是否有相关错误或警告
3. Vue DevTools 中检查组件 props/state 实际值
4. 对比预期行为与实际行为，定位根因层级（模板/逻辑/数据）
5. 根据根因归入对应分类目录

## 缺陷模板

使用 [缺陷模板](./2026-09/模板/01-模板-项目国际化标题未显示.md) 参考创建新缺陷记录。

### 命名规范

```
{月份}/{分类}/{序号}-{分类}-{描述}.md
```

### 必要字段

每个缺陷文件必须包含：现象、复现步骤、预期行为、实际行为、根因分析、修复方案、验证方法、预防措施。

### Frontmatter 追溯字段

每个 bug 文件必须通过 `source_prd` 关联到来源 PRD，建立 **OKR → PRD → Bug** 追溯链：

```yaml
source_prd: "YV-09-01"          # 必填：缺陷来源的 PRD 编号
source_module: "YV-09-01-1"     # 可选：缺陷来源的开发模块编号
```

> 多数数据类和代码质量类 bug 来源于 [YV-09-01 (九月 Project 页面重构)](../prds/2026-09/00-prd-九月迭代总览.md)，在文件 frontmatter 中添加 `source_prd: "YV-09-01"` 即可建立追溯。

## 相关资源

- [YiAi 缺陷索引](../yiai/bugs/README.md)
- [YiPet 缺陷索引](../yipet/bugs/README.md)
- [API 规范](../workflows/开发规范/05-规范-API规范.md)
- [编码规范](../workflows/开发规范/01-规范-项目规范.md)