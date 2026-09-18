---
doc_type: module
prd_task_id: "YV-09-M11"
title: "项目管理系统 — 开发方案"
status: 进行中
priority: 高
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-15
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 15
source_prd: "04-prd-项目管理系统.md"
related_tests: ["YV-09-M11"]
---

# 项目管理系统 — 开发方案

> 来源 PRD：[04-prd-项目管理系统.md](../../prds/2026-09/04-prd-项目管理系统.md)
> 需求编号：YV-09-M11 · 优先级：高 · 人天：15d（多Sprint史诗级需求）

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 说明 | 文件路径 |
|------|------|------|
| `src/hooks/useProjectDetail.ts` | 项目详情数据加载（139行） | `YiVad/src/hooks/useProjectDetail.ts` |
| `src/hooks/useRelatedByProject.ts` | 关联条目查询 + Markdown生成（271行） | `YiVad/src/hooks/useRelatedByProject.ts` |
| `src/stores/modules/project.ts` | 项目 CRUD Pinia store（79行） | `YiVad/src/stores/modules/project.ts` |
| `src/api/modules/projectService.ts` | 项目 RPC API 封装 | `YiVad/src/api/modules/projectService.ts` |
| `src/views/project/` | 项目页面模块（列表/详情/组件） | `YiVad/src/views/project/` |

---

## 目录

- [一、架构总览](#sec-1)
- [二、关键技术决策](#sec-2)
- [三、实施进度追踪](#sec-3)
- [四、实施优先级](#sec-4)
- [五、实现完成记录](#sec-5)
- [六、已知缺口](#sec-6)

---

<a id="sec-1"></a>
## 一、架构总览

### 分层结构

```
┌──────────────────────────────────────────────┐
│  Views (页面层)                               │
│  project/index.vue + detail.vue              │
│  列表→ProTable | 详情→7 Tab (概览/关联/OKR等)  │
├──────────────────────────────────────────────┤
│  Hooks (逻辑层)                                │
│  useProjectDetail / useRelatedByProject       │
│  useProjectFilter / useProjectRisk / ...      │
├──────────────────────────────────────────────┤
│  Stores (状态层)                               │
│  project.ts + 领域 stores (bug/issue/module)   │
├──────────────────────────────────────────────┤
│  API (数据层)                                  │
│  projectService / knowledgeService             │
│  issueService / moduleService / bug API        │
└──────────────────────────────────────────────┘
```

### 核心数据流

```
项目列表: fetchProjects() → projectStore.projects → ProTable 渲染
项目详情: fetchProject(key) → projectStore.currentProject
  → useProjectDetail → Promise.allSettled([knowledge, issue, module, bug])
  → useRelatedByProject(project) → 关联条目面板 (23个topic/4个domain)
```

---

<a id="sec-2"></a>
## 二、关键技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 数据加载 | `Promise.allSettled` 并发 | 4个API并行请求，单点失败不阻塞其他数据 |
| 请求去重 | `requestSeq` 单调递增序列号 | 快速切换项目时旧请求结果自动丢弃 |
| 关联条目缓存 | 模块级Map + 60s TTL | 面板 + AI Chat共享缓存，避免重复查询 |
| 轮询机制 | `setInterval` 30s (startPolling) | 项目详情页数据自动刷新 |
| URL路由 | `/project/:key` hash模式 | 支持直接分享项目链接 |
| SEO优化 | 项目key作为路由参数 | 语义化URL，保持书签可用 |

---

<a id="sec-3"></a>
## 三、实施进度追踪

| 需求编号 | 需求名称 | Phase | 状态 | 完成日期 |
|---------|---------|-------|------|---------|
| YV-09-79 | 自定义字段系统 | 1 | ✅ | 2026-09-10 |
| YV-09-90 | 全局标签管理 | 1 | ✅ | 2026-09-10 |
| YV-09-53 | 甘特图与时间线视图 | 1 | ✅ | 2026-09-10 |
| YV-09-75 | 里程碑追踪 | 1 | ✅ | 2026-09-10 |
| YV-09-18 | 项目健康大盘监控 | 2 | ⬜ 待开发 | — |
| YV-09-108 | 项目健康评分 | 2 | ⬜ 待开发 | — |
| YV-09-77 | 多项目管理视图 | 2 | ⬜ 待开发 | — |
| YV-09-72 | 项目模板与快速创建 | 2 | ⬜ 待开发 | — |
| YV-09-54 | 工作流自动化规则引擎 | 3 | ⬜ 待开发 | — |
| YV-09-55 | OKR与目标追踪 | 3 | ⬜ 待开发 | — |
| YV-09-58 | 资源与工作量管理 | 4 | ⬜ 待开发 | — |
| YV-09-83 | 预算与成本追踪 | 4 | ⬜ 待开发 | — |
| YV-09-92 | 风险登记册 | 4 | ⬜ 待开发 | — |
| 其余32项 | 项目级配置+辅助功能 | 3-6 | ⬜ 待开发 | — |

> **图例**：✅ 已完成 | 🔄 开发中 | ⬜ 待开发

---

<a id="sec-4"></a>
## 四、实施优先级

| 阶段 | 需求 | 理由 | 人天 |
|------|------|------|------|
| **Phase 1** | 自定义字段、标签管理、甘特图、里程碑 | 其他功能的数据基础 | 1.5 |
| **Phase 2** | 项目健康、模板、多项目视图、对比、归档 | 项目管理核心功能 | 3.0 |
| **Phase 3** | 工作流规则、自定义工作流、状态流转 | 流程提效关键 | 2.5 |
| **Phase 4** | 资源管理、时间追踪、预算、风险、依赖 | 精细化管理和成本控制 | 3.0 |
| **Phase 5** | Webhook、版本发布、OKR、日历、协作 | 外部集成和高级功能 | 3.0 |
| **Phase 6** | 项目级配置（成员/通知/标签/属性） | 深度定制 | 2.0 |
| **总计** | | | **15.0d** |

---

<a id="sec-5"></a>
## 五、实现完成记录

> 复核日期：2026-09-15 · 当前 Phase：1/6

### 源码产出

| 分类 | 文件数 | 内容 |
|------|--------|------|
| Hooks | 2 | useProjectDetail (139行)、useRelatedByProject (271行) |
| Stores | 1 | project.ts Pinia store (79行) |
| API | 1 | projectService.ts RPC封装 |
| 页面 | 1 | views/project/ 目录（列表+详情+5组件） |
| **源码合计** | **5** | |

### 测试覆盖

| 分类 | 文件数 | 说明 |
|------|--------|------|
| Hook测试 | 3 | useProjectFilter / useRelatedByProject / useProjectDetail |
| Store测试 | 1 | projectStore.test.ts |
| 组件测试 | 1 | ProjectCard.test.ts |
| **测试合计** | **5** | |

---

<a id="sec-6"></a>
## 六、已知缺口与技术债

### 6.1 功能缺口

| # | 缺口 | 影响 | 预计 |
|---|------|------|------|
| 1 | Phase 2-6 全部待开发 (41/45子需求) | 项目管理仅基础列表+详情可用 | 13.5d |
| 2 | 项目健康大盘 (YV-09-18/YV-09-108) | 无法量化监控项目健康度 | 0.8d |
| 3 | 工作流自动化 (YV-09-54) | 流程需手动操作 | 1.5d |
| 4 | 甘特图未集成到项目详情 (YV-09-53) | 甘特图独立存在，未与项目联动 | 0.3d |

### 6.2 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | `requestSeq` 竞态控制重构为 AbortController | P1 | 0.3 | 当前用序列号丢弃旧结果，改用 AbortController 可真正取消请求 | 待实现 |
| 2 | 关联条目缓存迁移至 Pinia store | P2 | 0.5 | 当前模块级 Map + TTL 无法跨组件共享失效通知 | 待实现 |
| 3 | `useRelatedByProject` 23 个 topic 按需加载 | P2 | 0.5 | 当前一次性查询全部 topic，应改为按 Tab 懒加载 | 待实现 |
| 4 | 项目详情页 E2E 测试 | P2 | 1.0 | 复杂交互流程（多 Tab 切换/数据刷新/关联条目）无自动化覆盖 | 待实现 |

---
