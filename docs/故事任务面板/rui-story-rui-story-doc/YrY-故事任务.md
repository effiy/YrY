> | v1.0.0 | 2026-05-22 | deepseek-v4-pro | node skills/rui-story/rui-story.mjs | 🌿 feat/rui-story-rui-story-doc | 📎 [CLAUDE.md](../../../CLAUDE.md) |

> **导航**: [YrY-使用场景 →](./YrY-使用场景.md)

> **来源引用**: `/rui doc --from-code rui-story-rui-story-doc`，源码 `skills/rui-story/rui-story.mjs:1-901`

## §0 基线声明

> **问题空间基线 (Problem Space Baseline)**: 本文档定义"做什么(WHAT)"和"验收标准(AC)"。下游所有文档必须可溯源至本文档的功能点与业务规则。本文档禁止包含技术术语（代码路径/API 路由/组件名/技术栈名），只描述问题域的 WHAT 和 WHY。

### 主要价值

- 🎯 七个命令统一故事面板入口，从概览到合并一站式
- 🌐 远端 API 为唯一数据源，本地不存储故事状态
- 📊 六阶段状态机自动推导，从任务到改进可视化进度
- 🔀 merge-to-main 自动化：stash → fetch → merge → push → 恢复
- 🏥 health 健康检查：Token/API/CLAUDE.md/目录 四项诊断
- 📋 list/show/recommend 三层查询粒度，从全景到单故事到同步推荐

---

## §1 Story

### Story 1: 故事面板只读查询

| 字段 | 内容 |
|------|------|
| 作为 | 项目管理者 |
| 我想要 | 查看所有故事的进度状态和文档清单 |
| 以便 | 了解项目整体健康度，识别阻塞和滞后故事 |
| 优先级 | P0 |
| 范围边界 | 只读远端 API，不写本地文件系统 |
| 依赖 | API_X_TOKEN 环境变量，远端 effiy.cn API 可达 |

#### §1.1 User Operations

| # | 操作 | 触发条件 | 操作步骤 | 预期结果 |
|---|------|---------|---------|---------|
| 1 | 查看状态概览 | 执行 `/rui-story` (无参数) | 查询远端 sessions → 按故事分组 → 统计各状态数量 → 输出状态概览 + 最近活动 | 显示故事总数、六阶段分布、最近 5 个活跃故事 |
| 2 | 查看进度全景 | 执行 `/rui-story list` | 查询远端 → 分组 → 推断类型 → 按时间排序 → 输出全景表格 | 显示每故事的名称/状态/文件数/更新时间/类型/分支 |
| 3 | 查看单故事详情 | 执行 `/rui-story show <name>` | 查询远端 → 过滤目标故事 → 推断类型 → 输出详情 | 显示故事状态、远端路径、类型、文件清单、分支、阻断信息 |
| 4 | 获取同步推荐 | 执行 `/rui-story recommend` | 查询远端 → 按故事分组 → 列出所有远端已知故事 | 列出全部远端故事名称及文件数，推荐 sync 命令 |
| 5 | 健康检查 | 执行 `/rui-story health` | 检查 Token → 检查 API 可达性 → 检查 CLAUDE.md → 检查目录 | 显示 4 项诊断结果，pass/warn/error 计数 |
| 6 | 查看帮助 | 执行 `/rui-story --help` | 委托 help.mjs 或 fallback | 显示全部命令列表和用法 |

---

### Story 2: 分支合并自动化

| 字段 | 内容 |
|------|------|
| 作为 | 开发者 |
| 我想要 | 一键将当前功能分支合并到 main 并推送远端 |
| 以便 | 故事完成后快速交付，避免多步手动操作 |
| 优先级 | P0 |
| 范围边界 | git 操作（stash/checkout/merge/push），不修改文件内容 |
| 依赖 | git 仓库可操作，远端 origin 可达 |

#### §1.1 User Operations

| # | 操作 | 触发条件 | 操作步骤 | 预期结果 |
|---|------|---------|---------|---------|
| 1 | 合并到 main | 执行 `/rui-story merge-to-main` | 识别当前分支 → 检查未提交变更(stash) → fetch origin/main → checkout main + pull → merge feature branch → push origin/main → 切回 feature → 恢复 stash | 功能分支已合并到 main 并推送远端 |

---

## §2 Requirements

### 功能点

| FP# | 描述 | 输入 | 输出 | 错误行为 | 优先级 |
|-----|------|------|------|---------|:--:|
| FP1 | 状态概览 — 查询远端并按状态聚合统计 | API_X_TOKEN | 六阶段状态计数 + 最近 5 个活跃故事 | Token 缺失 → 提示配置方法 | P0 |
| FP2 | 进度全景 — 列出全部故事含类型和分支 | API_X_TOKEN | 结构化表格（名称/状态/文件/时间/类型/分支） | 远端不可达 → 提示错误信息 | P0 |
| FP3 | 单故事详情 — 查看指定故事的完整元数据 | story name + API_X_TOKEN | 故事状态/路径/类型/文件清单/分支/阻断 | 故事不存在 → 列出远端已知故事 | P0 |
| FP4 | 同步推荐 — 列出所有远端故事供 sync 选择 | API_X_TOKEN | 故事名称列表 + 文件数 | 无数据 → 提示空状态 | P1 |
| FP5 | 健康检查 — 四维度诊断 | API_X_TOKEN | Token/API/CLAUDE.md/目录 四项检查结果 | 单维度失败不阻断其他检查 | P0 |
| FP6 | 合并到 main — 自动化 git 工作流 | 当前分支名 | stash → fetch → checkout main → pull → merge → push → 恢复 | 合并冲突 → 提示手动解决；push 失败 → 报错退出 | P0 |
| FP7 | 帮助 — 显示命令列表 | — | 终端帮助文本 | help.mjs 不可达 → fallback 内置帮助 | P1 |

### 业务规则

| R# | 描述 | 校验方式 | 证据级别 |
|----|------|---------|:--:|
| R1 | 远端 API 为唯一数据源，本地不缓存故事状态 | 源码不写本地文件（除 merge-to-main git 操作） | A |
| R2 | 故事状态由远端文件清单自动推导（六阶段：任务→设计→实施→测试→报告→改进） | `determineStatus()` 逻辑：逐文档检查 | A |
| R3 | Token 缺失时只读命令友好提示配置方法，不报错崩溃 | 所有远端命令入口检查 API_X_TOKEN | A |
| R4 | merge-to-main 前自动 stash 未提交变更，完成后恢复 | cmdMergeToMain §2 stash + §8 pop | A |
| R5 | 项目名从 CLAUDE.md 解析（表格/粗体标签/冒号/目录名 fallback） | `readProjectName()` 4 级 fallback | A |
| R6 | HTTP 请求超时 30s，错误信息截断至 500 字符 | HTTP_TIMEOUT + ERROR_MSG_MAX_LEN | A |
| R7 | TTY 检测控制 ANSI 颜色输出，管道时输出纯文本 | `process.stdout.isTTY` 判断 | A |

### 数据约束

| 约束 | 类型 | 范围/格式 | 来源 |
|------|------|----------|------|
| 故事名称 | string | kebab-case | 远端文件路径提取 |
| 故事状态 | enum | 任务/设计/实施/测试/报告/改进 | determineStatus() |
| 故事类型 | enum | backend/frontend/fullstack/meta | 技术评审内容关键词推断 |
| API_URL | string | `https://api.effiy.cn` | 环境变量 / 默认值 |
| HTTP_TIMEOUT | number | 30,000ms | 常量 |
| CONCURRENCY | number | 4 | 并发 worker 数 |

---

## §3 成功标准

| SC# | 描述 | 度量方式 | 目标值 | 优先级 | 关联 FP# |
|-----|------|---------|--------|:--:|---------|
| SC1 | 无参数执行输出状态概览 | 终端输出含六阶段计数 | 六个阶段统计完整 | P0 | FP1 |
| SC2 | list 命令输出全部故事进度表格 | 终端输出含名称/状态/文件/时间/类型/分支 | 列对齐，ANSI 颜色正确 | P0 | FP2 |
| SC3 | show 命令显示单故事完整详情 | 终端输出含状态/路径/类型/文件/分支 | 信息完备无遗漏 | P0 | FP3 |
| SC4 | merge-to-main 完成从 feature 到 main 的全自动合并 | git log 验证合并提交 | 无残留 stash，切回原分支 | P0 | FP6 |
| SC5 | health 覆盖全部 4 项诊断 | 终端输出 pass/warn/error 计数 | 每项有明确 ✅/⚠️/❌ | P0 | FP5 |
| SC6 | Token 缺失时优雅降级，不崩溃 | process.exit(0) | 退出码 0，显示配置提示 | P0 | R3 |

---

## §4 范围边界

### 范围内

| # | 条目 | 关联 FP# | 边界说明 |
|---|------|---------|---------|
| 1 | 远端 API 查询（overview/list/show/recommend/health） | FP1–FP5 | 查询 effiy.cn /sessions 和 /read-file |
| 2 | 故事状态自动推导 | FP1, FP2, FP3 | 基于远端文件清单判定六阶段 |
| 3 | 故事类型自动推断 | FP2, FP3 | 解析远端技术评审内容关键词 |
| 4 | 分支合并自动化 | FP6 | stash → fetch → merge → push 完整工作流 |
| 5 | 帮助文本输出 | FP7 | 委托 help.mjs 或内置 fallback |

### 范围外

| # | 条目 | 排除原因 | 替代方案 |
|---|------|---------|---------|
| 1 | 本地文件写入 | 只读查询命令不修改本地文件系统 | merge-to-main 仅操作 git |
| 2 | 故事文档同步到本地 | 由 rui-import sync.mjs 负责 | `/rui-story sync` 委托 rui-import |
| 3 | 故事状态修改 | 状态由远端文档自然推导 | 通过 doc/code 阶段产出文档变更 |
| 4 | 分支创建 | 只检测已存在的 feat/<name> 分支 | 手动 `git checkout -b` |

---

## §5 AC

| AC# | Given | When | Then | 门禁 |
|-----|-------|------|------|:--:|
| AC1 | API_X_TOKEN 已配置，远端有故事数据 | 执行 `rui-story` (无参数) | 输出状态概览（六阶段计数 + 最近 5 个活跃故事） | Gate A |
| AC2 | API_X_TOKEN 已配置，远端有 ≥1 个故事 | 执行 `rui-story list` | 输出进度全景表格（名称/状态/文件数/时间/类型/分支） | Gate A |
| AC3 | 远端存在故事 X | 执行 `rui-story show X` | 输出 X 的详情（状态/路径/类型/文件清单/分支/阻断） | Gate A |
| AC4 | 当前在 feat/my-story 分支，工作区干净 | 执行 `rui-story merge-to-main` | feat/my-story 合并到 main 并推送远端，切回原分支 | Gate A |
| AC5 | API_X_TOKEN 已配置，远端可达 | 执行 `rui-story health` | 输出 4 项诊断，Summary 含 pass/warn/error 计数 | Gate A |
| AC6 | API_X_TOKEN 未配置 | 执行任何远端命令 | 提示 Token 缺失 + 配置方法，exit(0) 不崩溃 | Gate A |
| AC7 | 工作区有未提交变更 | 执行 `rui-story merge-to-main` | 自动 stash → merge → 恢复 stash | Gate A |
| AC8 | 远端不存在故事 X | 执行 `rui-story show X` | 提示不存在 + 列出所有远端已知故事 | Gate A |

---

## §6 风险与假设

| # | 风险/假设 | 类型 | 可能性 | 影响 | 缓解/验证策略 | 关联 FP# |
|---|----------|------|:--:|:--:|-------------|---------|
| 1 | 远端 API 不可达导致所有命令失败 | 风险 | M | H | 优雅降级 process.exit(0)，不崩溃 | FP1–FP5 |
| 2 | API_X_TOKEN 未配置导致用户体验中断 | 风险 | H | M | 友好提示配置方法 + 退出码 0 | FP1–FP5 |
| 3 | 故事类型推断依赖远端 read-file 的延迟和可达性 | 风险 | M | L | 单个推断失败不影响整体，默认 meta | FP2, FP3 |
| 4 | merge-to-main 中合并冲突无法自动解决 | 风险 | L | H | 提示手动解决冲突后 push | FP6 |
| 5 | merge-to-main 中 stash pop 失败导致工作丢失 | 风险 | L | H | stash 失败时提示手动 git stash pop | FP6 |
| 6 | 项目名解析失败导致状态推导错误 | 风险 | L | M | 4 级 fallback（表格→粗体→冒号→目录名） | FP1–FP3 |
| 7 | 远端 API 返回格式变化导致 query 解析失败 | 风险 | L | L | try-catch 容错，无效时返回空数组 | FP1–FP5 |
| 8 | 远端 API 始终可达且返回格式稳定 | 假设 | — | — | health 命令可验证 | FP1–FP5 |
| 9 | git 可执行且远端 origin 配置正确 | 假设 | — | — | merge-to-main 在 fetch 阶段验证 | FP6 |

**约束**: 只读远端 API · 不写本地文件（merge-to-main 除外）· Token 缺失优雅降级 · 分支隔离不强制（只读命令）

**产出**: {project}-故事任务.md（问题空间基线）· {project}-使用场景.md（用户空间基线）· {project}-技术评审.md（按项目类型裁剪章节）· {project}-测试设计.md（Gate A 交接）· {project}-安全审计.md（独立审计）

**末端触发** [强制集成](#强制集成)。
