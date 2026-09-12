---
title: OpenSpec 工作流规范
tags: [yipet, workflow, openspec, standards, subagent]
category: projects/yipet/workflows
created: 2026-09-07
updated: 2026-09-10
source: YiPet
type: workflow
status: active
---

# OpenSpec 工作流规范

> Claude Code 在 OpenSpec 项目中的行为规范。定义子代理协作策略、代码质量门禁、上下文管理、大规模任务处理等核心约定。

## 一、子代理协作策略

在 OpenSpec 工作流中，根据阶段特点自动使用子代理：

| 阶段 | 执行模式 | 拆分策略 |
|------|----------|----------|
| 提案（Proposal） | 并行搜索 | 同时启动多个 Explore 子代理搜索代码模式、API、i18n、Chrome API、组件 |
| 设计（Design） | 主代理独立 | 决策性强，不适合拆分子代理 |
| 实现（Apply） | 混合模式 | 识别 tasks.md 中无依赖关系的任务组并行实现，有依赖的串行执行 |
| 验证（Verify） | 并行检查 | 同时启动子代理检查 i18n 完整性、规范一致性、API 契约、Chrome 权限 |
| 落地（Land） | 主代理独立 | 回写和提交步骤短，拆分子代理无收益 |

### 子代理使用规则

- 子代理只做搜索和确定的子任务，不做架构决策
- 并行子代理的结果由主代理综合判断
- 有依赖关系的任务必须串行执行，不可强行并行

## 二、代码质量门禁

### 动手前

1. 列出假设，逐条验证
2. 复杂任务有多种解释时全部列出，有更简单方案时提出，必要时坚持己见
3. 不清楚的地方停下来，明确困惑点再提问

### 动手时

- **只写被要求的东西**：不添加"灵活"、"可配置"的过度设计，不为单次使用创建抽象，不添加未要求的功能。200 行能压缩到 50 行则重写。
- **精准修改**：只改必要的，改完清理自己造成的垃圾（未使用的 import、死变量）。匹配现有风格，不改进无关代码。每一行改动都应追溯到用户的具体请求。
- **禁止非通用性改动**：
  - 不写只适配特定输入值的逻辑
  - 假设所有外部数据都有效 → 必须校验类型/范围/null
  - 处理数据时考虑边界情况（空值、异常值、边界值）
  - 断言使用通用规则，不用具体值（除非明确要求）
  - 禁止魔法数字 → 使用常量或枚举，注释说明原因
  - 禁止隐式成功假设 → 异步/外部操作必须处理失败情况
  - 禁止响应结构假设 → 先校验返回结构再访问深层属性
  - 禁止精度/范围假设 → 计算前确认数值在安全范围内
  - 禁止资源泄漏假设 → 文件/连接/cursor 等使用后必须释放

### 动手后

- **lint + typecheck 通过是底线**：`tsc --noEmit` + ESLint + Stylelint 全部通过才算完成
- 每步有可验证的退出条件：多步骤任务先列计划，动手后循环验证直到成功

## 三、上下文管理

### 文件读取

- 超过 500 行的文件，不要假设单次读取覆盖完整内容，根据需要分次读取
- 超过 10 条消息后，编辑任何文件前强制重新读取

### 上下文压缩恢复后（Apply 阶段）

1. `git status` — 确认已改动的内容
2. 重读 `changes/<name>/proposal.md` + `design.md` + `tasks.md` — 确认范围、设计决策、任务状态
3. 对照 design.md 检查关键实现（路径、命名、组件结构）
4. 运行 tsc + ESLint 验证
5. 然后继续实施

### 阶段隔离

- 所有 OpenSpec 阶段均由用户手动触发，不自动进入下一阶段
- `/opsx:explore`、`/opsx:propose`、`/opsx:apply`、`/opsx:verify`、`/opsx:e2e` 均需用户明确调用
- 禁止在同一阶段内触发其他阶段（如 explore 阶段不能调用 apply，verify 阶段不能调用 e2e）

### 重构前清理

未使用的 import/export/变量/console.log 先删除，单独提交，再做重构。

## 四、大规模任务处理

**200 行以上修改或显著架构变更必须走 OpenSpec**：代码改动超过 200 行，或涉及新增组件、API 契约变更、Chrome API 权限变更时，禁止直接修改，必须通过 OpenSpec 工作流（`/opsx:propose`）。

## 五、工具使用与编辑安全

### 搜索策略

- 使用 Grep 搜索内容，Glob 搜索文件名，两者缺一不可
- 搜索项目时默认包含所有源码类型，跳过 `node_modules/`、`dist/` 等依赖目录
- 重命名时覆盖调用、类型、字符串、`import`、barrel file、测试 mock，不得假设一次覆盖所有情况

### 编辑规则

- 编辑后重新读取文件确认变更正确应用
- 变更完成后，明确告知用户可能遗漏的区域（动态引用、测试 mock 等），提示人工复查
- 修改源码文件只能使用内置编辑工具（Read/Edit/Write），禁止用 sed/awk 等管道命令改文件
- 格式化工具（Prettier、Stylelint --fix）除外

### 安全边界

- 不主动推送代码，除非用户明确要求
- 中文回复用户

## 六、完整生产工作流

```
 1. 探索与提案   → /opsx:explore → /opsx:propose
 2. 产品与架构评审 → /plan-ceo-review / /plan-eng-review（按需触发）
 3. 设计审查     → /plan-design-review
 4. 实现         → /opsx:apply
 5. 自审         → /opsx:verify
 6. E2E 测试     → /opsx:e2e <change-name>
 7. 发布         → /ship 或 /land-and-deploy（用户手动触发）
 8. 迭代回顾     → /retro
```

### 各阶段详解

**1. 探索与提案**：现有项目先探索再写 proposal；新项目直接生成 proposal + scenarios。方向不明确时可用 `/office-hours` 做创意验证。

**2. 产品与架构评审**（按需触发）：
- `/plan-ceo-review`：产品战略影响、竞争格局变化时
- `/plan-eng-review`：架构影响（新增组件、API 契约变更、Chrome API 权限变更）时

**3. 设计审查**：实现前进行设计评审，确保方案合理。`/plan-design-review` 评分各设计维度，确保用户体验达标。

**4. 实现**：执行 `/opsx:apply` 进行实现。

**4.1 变更边界检查**：
- 实施前：对照 proposal.md 确认范围
- 实施中：禁止修改其他 `changes/<name2>/` 目录下的文件
- 完成后：逐条对照 proposal.md 确认 scope 内的已交付，scope 外的未改动

**4.2 任务类型区分**：
- 构建任务：创建文件/代码 → 对应语言 lint + typecheck 通过后可标记
- 验证任务：需实际运行 → 必须验证后才能标记
- 依赖任务：等前置完成 → 不提前标记

**4.3 自动化门禁**：tsc + ESLint 自动执行，任一失败则停止。

**5. E2E 测试**：`/opsx:e2e <change-name>` 生成测试 → 在 Chrome 中加载扩展验证 → `/qa` 真实浏览器验证。

**6. 发布**：由用户手动触发。扩展构建后手动加载到 Chrome 或发布到 Chrome Web Store。

**7. 迭代回顾**：`/retro` 总结本次迭代的经验教训。

## 七、YiPet 项目特定约束

### 技术栈检测

- 项目源码文件扩展名检测：`.ts`/`.tsx`/`.vue` → TypeScript（ESLint + tsc）
- 工具不存在时告知用户，不做静默跳过

### 项目规范引用

实施 OpenSpec 变更时，必须参考以下规范：

| 规范 | 文件 | 适用阶段 |
|------|------|----------|
| API 规范 | `specs/architecture/api/规范.md` | Design + Apply |
| 扩展架构规范 | `specs/architecture/extension-arch/规范.md` | Design + Apply |
| 组件模式规范 | `specs/architecture/component-patterns/规范.md` | Design + Apply |
| 国际化规范 | `specs/architecture/i18n/规范.md` | Apply + Verify |
| Chat Store 模式 | `specs/patterns/chat-controller/规范.md` | Design + Apply |

### 强制约束检查

- API 调用必须通过 ApiClient 四层封装（Component → Chat Store（Pinia）→ ApiClient → fetch）
- Chrome API 调用区分 ISOLATED 和 MAIN world 执行边界
- Content Script 和 Service Worker 不共享状态
- IPC Relay 消息必须通过 IPC_SECRET + 时间戳验证（3 层：来源标记、签名匹配、5 秒过期）
- 所有文本必须使用国际化（Vue-i18n）
- 参数名遵守跨项目 RPC 契约（`filter` 而非 `query`，`target_file` 而非 `path`）
- SSE 流式响应有断连检测和 token 缓冲