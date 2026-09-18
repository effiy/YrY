---
doc_type: test
title: "项目管理系统 — 测试用例"
status: 进行中
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiVad
project_id: yivad
prd_month: "202609"
source_prds: ["04-prd-项目管理系统"]
source_modules: ["04-prd-task-项目管理系统"]
---

# 项目管理系统 — 测试用例

> 来源 PRD：[04-prd-项目管理系统.md](../../prds/2026-09/04-prd-项目管理系统.md)
> 开发方案：[04-prd-task-项目管理系统.md](../../devs/2026-09/04-prd-task-项目管理系统.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

---


## 目录

- [一、测试范围](#sec-1)
- [二、覆盖矩阵](#sec-2)
- [三、单元测试](#sec-3)
- [四、出口准则](#sec-4)
- [五、执行状态](#sec-5)

---

---

<a id="sec-strategy"></a>
## 测试策略

### 分层模型

| 层级 | 说明 | 自动化 | 执行时机 |
|------|------|--------|---------|
| L1 单元 | Composable/hook/工具函数纯逻辑 | Vitest | 每次提交 |
| L2 组件 | Vue 组件挂载与交互 | Vitest + @vue/test-utils | 每次提交 |
| L3 集成 | Composable ↔ 组件 ↔ Store ↔ RPC | Vitest + mock | 每次提交 |
| L4 端到端 | 完整用户路径（需 YiAi 运行） | 手动 | 提测/回归 |

### 优先级定义

| 级别 | 含义 | 响应 |
|------|------|------|
| P0 | 核心路径，失败阻塞发布 | 立即修复 |
| P1 | 重要功能，失败需评估 | 当日修复 |
| P2 | 增强功能，可延后 | 排期修复 |

---

<a id="sec-env"></a>
## 测试环境与前置条件

| 项 | 要求 |
|----|------|
| Node.js | 与项目 `.nvmrc` 一致 |
| 包管理器 | pnpm |
| 浏览器 | Chrome 最新版 |
| 框架 | Vitest + jsdom |
| 类型检查 | `pnpm exec vue-tsc --noEmit` |

```bash
pnpm test                                    # 全部测试
pnpm exec vitest run tests/hooks/            # 仅 hooks
pnpm exec vitest run --coverage             # 覆盖率
```

---

<a id="sec-criteria"></a>
## 准入与准出标准

### 准入

| # | 条件 |
|---|------|
| 1 | 对应 FR 的实现已提交 |
| 2 | `vue-tsc --noEmit` 无错误 |
| 3 | 功能在开发环境可正常使用 |

### 准出

| # | 条件 | 阈值 |
|---|------|------|
| 1 | P0 用例通过率 | 100% |
| 2 | P1 用例通过率 | ≥ 95% |
| 3 | 遗留缺陷 | 无 Blocker / Critical |

---

<a id="sec-defects"></a>
## 缺陷分级

| 级别 | 定义 | 示例 |
|------|------|------|
| Blocker | 阻塞测试或数据损坏 | 功能完全不可用 |
| Critical | 核心功能不可用 | 主要路径报错 |
| Major | 功能缺陷但有替代路径 | 边界条件处理不当 |
| Minor | 体验问题 | UI 偏移/文案错误 |
| Trivial | 视觉细节 | 间距微调 |


## 源码索引

| 文件 | 说明 | 文件路径 |
|------|------|------|
| `src/hooks/useProjectDetail.ts` | 项目详情数据加载 | `YiVad/src/hooks/useProjectDetail.ts` |
| `src/hooks/useRelatedByProject.ts` | 关联条目查询 | `YiVad/src/hooks/useRelatedByProject.ts` |
| `src/stores/modules/project.ts` | 项目 Pinia store | `YiVad/src/stores/modules/project.ts` |
| `src/api/modules/projectService.ts` | 项目 API 服务 | `YiVad/src/api/modules/projectService.ts` |

---

<a id="sec-1"></a>
## 一、测试范围

### 在范围内
| 范围 | 内容 |
|------|------|
| 2 个 composable | useProjectDetail、useRelatedByProject |
| 1 个 Pinia store | project.ts |
| 2 个页面组件 | 项目列表 (ProTable)、项目详情 (7 Tab) |

### 不在范围内
| 排除项 | 原因 |
|--------|------|
| Phase 2-6 功能 | 未实现 |
| 甘特图集成 | 独立组件，未与项目联动 |
| YiAi 后端 | 后端测试单独覆盖 |

---

<a id="sec-2"></a>
## 二、覆盖矩阵

| 编号 | 用例 | 覆盖 FR | 优先级 | 自动化 |
|------|------|--------|--------|--------|
| TC-PROJ-001 | 项目列表渲染 | FR-1 核心管理 | P0 | ✅ ProTable.test.ts |
| TC-PROJ-002 | 创建项目 | FR-1 | P0 | — |
| TC-PROJ-003 | 编辑项目 | FR-1 | P0 | — |
| TC-PROJ-004 | 删除确认 | FR-1 | P0 | — |
| TC-PROJ-005 | 详情页 7 Tab 切换 | FR-1 | P0 | — |
| TC-PROJ-006 | 成员管理 | FR-1 | P1 | — |
| TC-PROJ-007 | 项目过滤 | FR-1 | P1 | ✅ useProjectFilter.test.ts |
| TC-PROJ-008 | 关联条目面板 (23 topic) | FR-1 | P0 | ✅ useRelatedByProject.test.ts |
| TC-PROJ-009 | Store CRUD | FR-1 | P1 | ✅ projectStore.test.ts |
| TC-PROJ-010 | 甘特图与时间线 | FR-2 | P2 | ⚠️ 待实现 |
| TC-PROJ-011 | 里程碑追踪 | FR-2 | P2 | ⚠️ 待实现 |

---

<a id="sec-3"></a>
## 三、单元测试

### UT-PROJ-01 `useRelatedByProject`（3用例）
| # | 用例 | 预期 |
|---|------|------|
| 1 | RELATED_TOPICS 跨4个domain | tl/cr/bug/story 均有条目 |
| 2 | 每条topic有 cname+route+label | 必填字段完整 |
| 3 | cnames全局唯一 | 23个 topic 无重复cname |

### UT-PROJ-02 `useProjectDetail`（4用例）
| # | 用例 | 预期 |
|---|------|------|
| 1 | 空key→error='项目key缺失' | 早期返回 |
| 2 | 数据容器初始为空 | knowledgeFiles/issues/modules/bugs=[]
| 3 | startPolling/stopPolling可调用 | 不抛异常 |
| 4 | retry函数存在 | 可调用 |

### UT-PROJ-03 `projectStore`（3用例）
| # | 用例 | 预期 |
|---|------|------|
| 1 | fetchProjects填充列表 | projects.length=1, total=1 |
| 2 | fetchProject加载单个 | currentProject.name正确 |
| 3 | loading标志位切换 | 请求前true，完成后false |

---

<a id="sec-4"></a>
## 四、出口准则

- [ ] P0 用例 100% 通过
- [ ] 7 个 Tab 无报错
- [ ] vue-tsc --noEmit 通过

---

<a id="sec-5"></a>
## 五、执行状态

| 指标 | 值 |
|------|-----|
| 全局测试 | 78 文件 · 680 用例 · 100% 通过 |
| 本模块测试 | 5 文件 · 23 用例 · 全部通过 |
| 执行命令 | `cd YiVad && pnpm test` |

---
