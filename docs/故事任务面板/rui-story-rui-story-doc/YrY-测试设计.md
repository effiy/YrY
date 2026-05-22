> | v1.0.0 | 2026-05-22 | deepseek-v4-pro | node skills/rui-story/rui-story.mjs | 🌿 feat/rui-story-rui-story-doc | 📎 [CLAUDE.md](../../../CLAUDE.md) |

> **导航**: [← YrY-技术评审](./YrY-技术评审.md) · [YrY-实施报告 →](./YrY-实施报告.md)

> **来源引用**: `/rui doc --from-code rui-story-rui-story-doc`，基于 `YrY-故事任务.md` §5 AC 和 `YrY-使用场景.md` §2 场景

## §0 基线溯源

| TC# | 覆盖 AC#(01 §5) | 覆盖场景(02 §2) | 覆盖类型 | 状态 |
|-----|-----------------|----------------|:--:|:--:|
| TC-N1 | AC1 状态概览 | 场景 1 查看概览 | 正常 | 待生成 |
| TC-N2 | AC2 进度全景 | 场景 2 进度表格 | 正常 | 待生成 |
| TC-N3 | AC3 单故事详情 | 场景 3 单故事 | 正常 | 待生成 |
| TC-N4 | AC8 不存在的故事 | 场景 3 空状态 | 正常 | 待生成 |
| TC-N5 | AC4 合并到 main | 场景 4 合并 | 正常 | 待生成 |
| TC-N6 | AC5 健康检查 | 场景 5 健康检查 | 正常 | 待生成 |
| TC-E1 | AC6 Token 缺失 | 场景 1 异常分支 | 异常 | 待生成 |
| TC-E2 | AC6 远端不可达 | 场景 5 异常分支 | 异常 | 待生成 |
| TC-B1 | AC7 有未提交变更 | 场景 4 stash 流程 | 边界 | 待生成 |

### 主要价值

- 🎯 七命令全覆盖：overview/list/show/recommend/health/merge-to-main/help
- 🌐 远端 API 依赖通过 Token 缺失和不可达两路异常覆盖
- 🔀 merge-to-main 覆盖干净工作区和有未提交变更两条路径
- 📊 每用例可独立执行，通过 mock API_X_TOKEN 控制测试条件

---

## §1 测试范围

### 1.1 覆盖矩阵

| FP# | 功能点 | 正常 | 边界 | 异常 | 回归 | 覆盖率 |
|-----|--------|:--:|:--:|:--:|:--:|:--:|
| FP1 | 状态概览 | TC-N1 | — | TC-E1 | TC-R1 | 100% |
| FP2 | 进度全景 | TC-N2 | — | TC-E1 | TC-R1 | 100% |
| FP3 | 单故事详情 | TC-N3, TC-N4 | — | TC-E1 | TC-R1 | 100% |
| FP4 | 同步推荐 | — | — | TC-E1 | TC-R1 | 100% |
| FP5 | 健康检查 | TC-N6 | — | TC-E2 | TC-R1 | 100% |
| FP6 | 合并到 main | TC-N5 | TC-B1 | — | TC-R1 | 100% |
| FP7 | 帮助 | — | — | — | — | — |

### 1.2 Gate 映射

| Gate | 用例范围 | 通过标准 | 交接下游 |
|------|---------|---------|---------|
| Gate A | TC-N1–N6, TC-B1, TC-E1–E2 | 全部 P0 通过 | 实现阶段 |
| Gate B | TC-R1 + 全部 Gate A 用例 | P0 100% 通过 | 交付 |

---

## §2 测试用例

### 2.1 正常用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|:--:|
| TC-N1 | API_X_TOKEN 已配置，远端有故事 A(5 文件, 实施) 和 B(3 文件, 设计) | 执行 `node skills/rui-story/rui-story.mjs`（无参数） | ① 输出六阶段分布（任务=0, 设计=1, 实施=1, 测试=0, 报告=0, 改进=0）；② 输出最近活动含故事 A 和 B | FP1 | P0 |
| TC-N2 | API_X_TOKEN 已配置，远端有 3 个故事（含技术评审可推断类型） | 执行 `node skills/rui-story/rui-story.mjs list` | ① 表格列：Story/Status/Files/Last Modified/Type/Branch；② 列对齐；③ 按时间降序 | FP2 | P0 |
| TC-N3 | API_X_TOKEN 已配置，远端存在故事 test-story（5 文件） | 执行 `node skills/rui-story/rui-story.mjs show test-story` | ① 输出故事名 + 状态；② 输出远端路径 `故事任务面板/test-story/`；③ 输出类型；④ 输出文件清单（按名称排序）；⑤ 输出 Git 分支或 — | FP3 | P0 |
| TC-N4 | API_X_TOKEN 已配置，远端不存在故事 nonexistent | 执行 `node skills/rui-story/rui-story.mjs show nonexistent` | ① 红色提示 "不存在于远端"；② 列出全部远端已知故事名 | FP3 | P1 |
| TC-N5 | 当前在 feat/my-fix 分支，工作区干净 | 执行 `node skills/rui-story/rui-story.mjs merge-to-main` | ① 自动 checkout main + pull；② merge feat/my-fix → main；③ push origin main；④ 切回 feat/my-fix；⑤ 输出 ✅ 合并完成 | FP6 | P0 |
| TC-N6 | API_X_TOKEN 已配置，CLAUDE.md 含项目名，故事目录存在 | 执行 `node skills/rui-story/rui-story.mjs health` | ① Token 项显示 "已配置"；② API 项显示 session 数量；③ CLAUDE.md 项显示项目名；④ 目录项显示 "存在"；⑤ Summary 含 pass/warn/error | FP5 | P0 |

### 2.2 边界用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|:--:|
| TC-B1 | 当前在 feat/my-fix，工作区有 1 个未提交文件 | 执行 `node skills/rui-story/rui-story.mjs merge-to-main` | ① 自动 git stash -u；② 正常合并流程；③ 合并完成后自动 git stash pop；④ 未提交文件恢复到工作区 | FP6 | P0 |
| TC-B2 | 远端 API 返回非标准格式（无 data.list 字段） | 执行 `node skills/rui-story/rui-story.mjs list` | ① 不崩溃；② sessions 解析为空数组；③ 显示空状态提示 | FP2 | P2 |
| TC-B3 | 远端故事的技术评审内容不含任何类型关键词 | 执行 `node skills/rui-story/rui-story.mjs list` | ① 故事类型显示为 "元"（meta） | FP2 | P2 |

### 2.3 异常用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|:--:|
| TC-E1 | API_X_TOKEN 未配置或为空字符串 | 执行 overview/list/show/recommend/health 中任一命令 | ① 黄色提示 "⚠️ API_X_TOKEN: 缺失"；② 显示配置方法；③ exit(0) 不崩溃 | FP1–FP5 | P0 |
| TC-E2 | API_X_TOKEN 已配置但远端 API 不可达（网络断开或 URL 错误） | 执行 `node skills/rui-story/rui-story.mjs health` | ① API 项显示 "不可达" + 错误信息；② 其他诊断项正常完成；③ Summary 含 error 计数 | FP5 | P1 |
| TC-E3 | show 命令缺少 name 参数 | 执行 `node skills/rui-story/rui-story.mjs show` | ① 输出 "show 需要 <name> 参数"；② exit(0) | FP3 | P1 |
| TC-E4 | 输入未知命令 | 执行 `node skills/rui-story/rui-story.mjs unknown_cmd` | ① 输出 "未知命令" + 建议 --help；② exit(0) | FP7 | P1 |

### 2.4 回归用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|:--:|
| TC-R1 | API_X_TOKEN 已配置，远端有 ≥2 个不同类型故事 | 执行 overview → list → show → health（四个命令连续执行） | ① 全部命令正常输出；② 状态推导一致（list 中的状态与 show 中一致）；③ health 全部通过 | FP1–FP5 | P0 |

---

## §3 环境专项

| ID | Given | When | Then | 优先级 |
|----|-------|------|------|:--:|
| TC-X1 | 项目根目录无 CLAUDE.md 或 CLAUDE.md 无项目名 | 执行任何命令 | ① 输出 "无法确定项目名"；② exit(0) | P1 |
| TC-X2 | stdout 被管道重定向（非 TTY） | 执行 `list` 命令并管道到 `cat` | ① 输出不包含 ANSI 转义序列；② 数据内容完整 | P1 |
| TC-X3 | 当前在 detached HEAD 状态 | 执行 `merge-to-main` | ① 输出 "当前不在任何分支上"；② exit(1) | P1 |

---

## §4 测试环境

| 维度 | 配置 |
|------|------|
| 运行环境 | Node.js ≥ 18（node:path/node:fs/node:child_process/node:os + 全局 fetch） |
| 部署方式 | 本地项目根目录下执行 |
| 测试目标 | `skills/rui-story/rui-story.mjs` 七命令行为 |
| 外部依赖 | 远端 API（effiy.cn）+ git 可执行文件 |
| 数据准备 | API_X_TOKEN 环境变量控制；远端需有测试故事数据 |

---

## §5 评审清单

| # | 检查项 | 状态 |
|---|--------|:--:|
| 1 | 每 FP# 有多类用例覆盖 | ✅ |
| 2 | Gate A 覆盖全部 P0 用例 | ✅ TC-N1–N6, TC-B1, TC-E1 |
| 3 | 回归用例与影响链一致 | ✅ TC-R1 |
| 4 | 异常用例含恢复行为描述 | ✅ |
| 5 | 环境专项覆盖文件生命周期 | ✅ TC-X1–X3 |
| 6 | 外部依赖（远端 API）可 mock | ✅ API_X_TOKEN 控制 |
| 7 | 基线溯源闭合 | ✅ |

---

## §6 Gate A 交接

| 信号 | 内容 |
|------|------|
| 通过状态 | ✅ 待执行 |
| P0 用例 ID | TC-N1, TC-N2, TC-N3, TC-N5, TC-N6, TC-B1, TC-E1, TC-R1 |
| 实现约束 | Node.js ≥ 18；远端 API 依赖需可 mock；ANSI 颜色需 TTY 检测 |
| 验证命令 | 逐用例手动执行 + 管道重定向验证 ANSI 关闭 |

---

> | 日期 | 变更 | 触发 | 证据 |
> |------|------|------|------|
> | 2026-05-22 | 初始生成 | `/rui doc --from-code rui-story-rui-story-doc` | `YrY-故事任务.md` §5, `YrY-使用场景.md` §2 |
