> | v1.0.0 | 2026-05-22 | deepseek-v4-pro | ⏱️ — | 📎 [CLAUDE.md](../../../CLAUDE.md) |

> **导航**: [← YrY-技术评审](./YrY-技术评审.md) · [→ YrY-实施报告](./YrY-实施报告.md)

> **来源引用**: `/rui doc --from-code rui-import-sync-doc` · 源文件 `skills/import-docs/sync.mjs`
> **证据等级**: B（从源码反推，附源码路径）

# YrY-测试设计 · rui-import-sync

## §0 基线溯源

| AC# | 来源 | 测试覆盖 |
|-----|------|---------|
| AC1 | 故事任务 §5 — 全量上传 | §2.1 导入测试 |
| AC2 | 故事任务 §5 — 拉取文档 | §2.3 拉取测试 |
| AC3 | 故事任务 §5 — Token 降级 | §2.5 降级测试 |
| AC4 | 故事任务 §5 — 单文件容错 | §2.1 异常路径 |
| AC5 | 故事任务 §5 — 非法标签 | §2.6 边界测试 |
| AC6 | 故事任务 §5 — 空匹配 | §2.3 空状态 |

---

### 主要价值

- 🎯 四类用例全覆盖：正常路径、边界条件、异常恢复、回归验证
- 🔗 每条用例溯源至故事任务 AC# 和使用场景
- 🛡️ Gate A 交接信号完整：P0 用例 ID + 验证命令可直接执行
- ⚡ 覆盖全部 3 种模式：import / pull / list

---

## §1 测试范围

| 维度 | 覆盖范围 |
|------|---------|
| 功能 | 文件扫描、路径映射、并发上传、远端拉取、推荐模式 |
| 模式 | import（上传）、pull（拉取）、list（预览）、recommend（推荐） |
| 错误 | Token 缺失、网络超时、单文件失败、非法参数、目录不存在 |
| 边界 | 空目录、大文件、不支持目录、非法标签 |

---

## §2 测试用例

### §2.1 导入模式（import）

#### 正常路径

| UC# | Given | When | Then | 类型 | 关联 AC |
|-----|-------|------|------|------|---------|
| UC-IMP-01 | 项目根有 10 个 .md 文件，API_X_TOKEN 已配置 | 执行 `workspace=true` | 10 个文件全部上传，输出 created=N, overwritten=M, failed=0 | 正常 | AC1 |
| UC-IMP-02 | 指定目录有 3 个 .md 文件 | 执行 `dir=/path/to/dir` | 仅该目录下 3 个文件上传 | 正常 | AC1 |
| UC-IMP-03 | 远端已有部分文件 | 执行全量上传 | 已有文件显示 overwritten，新文件显示 created | 正常 | AC1 |

#### 异常路径

| UC# | Given | When | Then | 类型 | 关联 AC |
|-----|-------|------|------|------|---------|
| UC-IMP-04 | 上传中第 3 个文件网络超时 | 并发上传 10 个文件 | 第 3 个文件记录 failed，其余 9 个成功 | 异常 | AC4 |
| UC-IMP-05 | 远端 API 完全不可达 | 执行上传 | 全部文件 failed，exit 1，不阻断管线 | 异常 | AC4 |
| UC-IMP-06 | 某文件读取失败（权限不足） | 扫描到该文件 | 该文件跳过，记录 error | 异常 | AC4 |

#### 边界条件

| UC# | Given | When | Then | 类型 | 关联 AC |
|-----|-------|------|------|------|---------|
| UC-IMP-07 | 项目根无 .md 文件 | 执行 `workspace=true` | 输出 0 files，无上传操作 | 边界 | AC1 |
| UC-IMP-08 | 扫描根目录不存在 | 执行 `workspace=true` | 输出错误提示，exit 0 | 边界 | — |
| UC-IMP-09 | 指定非法 prefix 一级标签 | 执行 `prefix=bad` | 输出错误，exit 1 | 边界 | AC5 |

### §2.2 预览模式（list）

| UC# | Given | When | Then | 类型 | 关联 AC |
|-----|-------|------|------|------|---------|
| UC-LIST-01 | 项目有 5 个 .md 文件 | 执行 `workspace=true mode=list` | 终端输出 5 行 "本地路径 → 远端路径"，提示 "list mode, no upload" | 正常 | — |
| UC-LIST-02 | 项目无文件 | 执行 `workspace=true mode=list` | 输出 0 files | 边界 | — |

### §2.3 拉取模式（pull）

| UC# | Given | When | Then | 类型 | 关联 AC |
|-----|-------|------|------|------|---------|
| UC-PULL-01 | 远端有 rui-story 的 20 个文件 | 执行 `dir=docs/故事任务面板/rui-story/ mode=pull` | 20 个文件下载到本地对应目录 | 正常 | AC2 |
| UC-PULL-02 | 远端有 .claude 配置文件 | 执行 `dir=.claude/ mode=pull` | 配置文件下载到本地 .claude/ 保持嵌套结构 | 正常 | AC2 |
| UC-PULL-03 | 远端无匹配的故事文件 | pull 一个不存在的故事 | 输出 "远端无匹配文件"，written=0 | 边界 | AC6 |
| UC-PULL-04 | 指定不支持的目录类型 | 执行 `dir=src/ mode=pull` | 输出错误 "不支持的 pull 目录" | 边界 | — |
| UC-PULL-05 | 拉取中单文件下载失败 | 远端 10 个文件中 1 个读取失败 | 9 个成功，1 个 failed | 异常 | AC4 |

### §2.4 推荐模式

| UC# | Given | When | Then | 类型 | 关联 AC |
|-----|-------|------|------|------|---------|
| UC-REC-01 | 远端有多个故事面板数据 | 执行 `mode=pull`（无 dir） | 按故事名分组展示，输出推荐拉取命令 | 正常 | — |
| UC-REC-02 | API_X_TOKEN 未配置 | 执行推荐 | 提示 Token 缺失，无法查询远端 | 边界 | AC3 |
| UC-REC-03 | 远端无故事面板数据 | 执行推荐 | 输出 "远端无故事任务面板文件" | 边界 | — |

### §2.5 降级测试

| UC# | Given | When | Then | 类型 | 关联 AC |
|-----|-------|------|------|------|---------|
| UC-DG-01 | API_X_TOKEN 未设置 | 执行 `workspace=true` | 静默降级，输出提示，exit 0，管线继续 | 降级 | AC3 |
| UC-DG-02 | API_X_TOKEN 未设置 | 执行 `mode=pull` | 静默降级，exit 0 | 降级 | AC3 |
| UC-DG-03 | Token 已配置但远端不可达 | 执行上传 | 查询 sessions 失败时降级为全部新建，不阻断 | 降级 | AC4 |

### §2.6 回归检查

| UC# | Given | When | Then | 关联用例 |
|-----|-------|------|------|---------|
| UC-REG-01 | 故事面板路径含空格 | 执行上传 | 远端路径空格替换为下划线 | UC-IMP-01 |
| UC-REG-02 | .claude-plugin 目录存在 | 执行扫描 | 该目录被排除，文件不出现 | UC-IMP-01 |
| UC-REG-03 | 文件非 .md 扩展名 | 默认扫描 | 不包含在结果中 | UC-IMP-01 |

---

## §3 Gate A 交接信号

| 信号 | 值 | 说明 |
|------|-----|------|
| P0 用例数 | 8 | UC-IMP-01/04/05, UC-PULL-01/05, UC-DG-01/02/03 |
| 验证命令 | `node skills/import-docs/sync.mjs workspace=true mode=list` | 预览模式验证扫描正确性 |
| 阻塞条件 | P0 用例任一失败 | 阻断进入实现阶段 |
| 环境要求 | Node.js + API_X_TOKEN（部分测试） | — |

---

## §4 测试环境

| 维度 | 要求 |
|------|------|
| 运行环境 | Node.js 18+，ESM |
| 环境变量 | `API_X_TOKEN`（功能测试需要） |
| 远端依赖 | `https://api.effiy.cn` 可达 |
| 测试数据 | 项目根有 .md 文件 + .claude/ 目录 |

---

> | 日期 | 变更 | 触发 | 证据 |
> |------|------|------|------|
> | 2026-05-22 | 初始生成 — doc --from-code | /rui doc --from-code rui-import-sync-doc | skills/import-docs/sync.mjs |
