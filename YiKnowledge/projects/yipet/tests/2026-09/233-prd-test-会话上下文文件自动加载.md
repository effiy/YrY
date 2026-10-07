---

doc_type: test
title: "YP-09-233: 会话上下文文件自动加载 — 测试用例"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-22
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
prd_task_id: "YP-09-233"
source_prds: ["233-体验优化-会话上下文文件自动加载.md"]
source_modules: ["233-prd-task-会话上下文文件自动加载.md"]
source_okr: [yipet-002]

type: test
---

# YP-09-233: 会话上下文文件自动加载 — 测试用例

> 来源 PRD：[233-体验优化-会话上下文文件自动加载.md](../../prds/2026-09/233-体验优化-会话上下文文件自动加载.md)
> 开发方案：[233-prd-task-会话上下文文件自动加载.md](../../devs/2026-09/233-prd-task-会话上下文文件自动加载.md)
> 需求编号：YP-09-233 · 优先级：P1 · 人天：0.25d

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

---

## 目录

- [一、测试范围与目标](#sec-1)
- [二、测试策略](#sec-2)
- [三、单元测试](#sec-3)
- [四、集成测试](#sec-4)
- [五、手动验证检查点](#sec-5)
- [六、缺陷分级](#sec-6)

---

<a id="sec-1"></a>
## 一、测试范围与目标

### 1.1 在范围内

| 范围 | 说明 |
|------|------|
| `createSessionFromKnowledgeFile` | ctx tag + pageContent 格式化 |
| `createSessionFromStory` | ctx tag + pageContent 格式化 |
| `createSessionFromBug` | ctx tag（contentPath 存在时）|
| 已有会话重新打开 | ctx tag 补充逻辑 |
| parseToTree 兼容性 | 新格式被正确解析 |

### 1.2 不在范围内

| 范围 | 原因 |
|------|------|
| ContextFilesPanel UI 渲染 | 无需修改 |
| RAG scope 设置逻辑 | 无需修改 |
| Session 创建 API | 无需修改 |

---

<a id="sec-2"></a>
## 二、测试策略

| 层级 | 策略 | 覆盖范围 |
|------|------|----------|
| 单元测试 | 白盒——验证 ctx tag 生成和 pageContent 格式化 | `extractCtxPaths` 对 ctx tag 的解析 |
| 集成测试 | 手动——浏览器中验证完整流程 | 点击知识文件 → Context 面板显示文件 |
| 冒烟测试 | `npm run build` 通过 | 整体构建完整性 |

---

<a id="sec-3"></a>
## 三、单元测试

### 3.1 contextTreeUtils.extractCtxPaths

| ID | 输入 | 预期输出 | 说明 |
|----|------|---------|------|
| CTX-01 | `['ctx:path/to/file.md']` | `['path/to/file.md']` | 基本 ctx tag 解析 |
| CTX-02 | `['source:YiKnowledge', 'ctx:path/to/file.md']` | `['path/to/file.md']` | 混合 tag 中提取 ctx |
| CTX-03 | `['source:YiKnowledge']` | `[]` | 无 ctx tag |
| CTX-04 | `[]` | `[]` | 空数组 |
| CTX-05 | `['ctx:a.md', 'ctx:b.md']` | `['a.md', 'b.md']` | 多个 ctx tag |

### 3.2 contextTreeUtils.parseToTree

| ID | 输入 | 预期 | 说明 |
|----|------|------|------|
| TREE-01 | `raw='## a.md\n\ncontent'`, `tags=['ctx:a.md']` | 1 个文件节点，path=a.md, content='content' | ctx tag + 格式化内容 |
| TREE-02 | `raw='old content'`, `tags=['ctx:a.md']` | 1 个文件节点，path=a.md, content='' | ctx tag 存在但 pageContent 不匹配 → 空内容 |
| TREE-03 | `raw='## a.md\n\nc1\n\n---\n\n## b.md\n\nc2'`, `tags=[]` | 2 个文件节点 | 无 ctx tag，从 pageContent 解析 |
| TREE-04 | `raw='## a.md\n\n## b.md'`, `tags=[]` | 2 个文件节点，内容为空 | 标题存在但无正文 |

### 3.3 Session 创建时 tag 生成

| ID | 场景 | 预期 tags 含 | 预期 pageContent |
|----|------|-------------|-----------------|
| TAG-01 | Knowledge 文件创建 session | `ctx:path/to/file.md` | `## path/to/file.md\n\n<content>` |
| TAG-02 | Story 创建 session | `ctx:{project}/{name}/story.md` | `## {project}/{name}/story.md\n\n<content>` |
| TAG-03 | Bug（有 contentPath）创建 session | `ctx:lessons/failures/bugs/key.md` | 保持 markdown 表格格式 |
| TAG-04 | Bug（无 contentPath）创建 session | 无 ctx: tag | 保持 markdown 表格格式 |

---

<a id="sec-4"></a>
## 四、集成测试

### 4.1 端到端场景: Knowledge 文件

```
前置条件：YiAi 运行，知识库已扫描
1. 打开任意页面，打开 YiPet 聊天框
2. 侧边栏切换到 Knowledge 标签页
3. 点击某个文件（如 curators/governance/readiness-checklist.md）
4. 点击工具栏 Context 按钮
5. 验证：Context 面板显示 readiness-checklist.md，有文件内容
6. 点击文件可预览
```

### 4.2 端到端场景: Story

```
前置条件：YiAi 运行，知识库中有 Stories
1. 侧边栏切换到 Stories 标签页
2. 点击某个 Story
3. 打开 Context 面板
4. 验证：面板显示 {project}/{story}/story.md
```

### 4.3 端到端场景: Bug

```
前置条件：YiAi 运行，有已记录的 Bug（含 contentPath）
1. 侧边栏切换到 Bugs 标签页
2. 点击某个 Bug
3. 打开 Context 面板
4. 验证：面板显示 bug.contentPath 路径
```

### 4.4 边缘场景: 重复点击

```
1. 点击 Knowledge 文件 → 会话创建，Context 面板 1 个文件
2. 再次点击同一文件 → 会话切换到已有，Context 面板仍 1 个文件
3. 验证：tag 数组中没有重复的 ctx: tag
```

---

<a id="sec-5"></a>
## 五、手动验证检查点

| # | 检查项 | 通过标准 |
|---|--------|---------|
| 1 | `npm run build` 通过 | 构建无错误 |
| 2 | `npm test` 通过 | 无新增失败（pre-existing failures 除外）|
| 3 | `vue-tsc --noEmit` 通过 | 无新增类型错误 |
| 4 | 知识文件会话 Context 面板 | 显示文件路径 + 内容 |
| 5 | Story 会话 Context 面板 | 显示 story.md |
| 6 | Bug 会话 Context 面板 | 显示 bug 知识库文件路径 |

---

<a id="sec-6"></a>
## 六、缺陷分级

| 级别 | 现象 | 影响 |
|------|------|------|
| P0/Blocker | 会话创建时 crash | 无法创建/打开会话 |
| P1/Critical | Context 面板仍为空 | 功能未生效 |
| P2/Minor | 已有会话重复点击产生重复 ctx: tag | 用户体验不佳，但不影响功能 |
| P3/Trivial | 格式差异不影响显示 | 可忽略 |

