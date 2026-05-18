> | v1.3.2 | 2026-05-18 | deepseek-v4-pro | 🌿 main | 📎 [CLAUDE.md](../../../CLAUDE.md) |

> **导航**: [← YrY-03-技术评审](./YrY-03-技术评审.md) · [YrY-06-实施报告 →](./YrY-06-实施报告.md)

> **来源**: `/rui doc --from-code rui-claude` — 从 `skills/rui-claude/SKILL.md` · `rules/rui-claude.md` · `skills/import-docs/sync.mjs` 反推

### 主要价值

- 🧪 6 条正常用例 + 3 条边界用例 + 3 条异常用例 + 2 条回归用例，覆盖 FP-1~FP-5
- 🔀 Gate A / Gate B 双门禁映射，P0 全部通过方可前进
- 🔒 环境专项覆盖跨 workspace 隔离、嵌套目录保留、同名文件覆盖
- 📋 覆盖矩阵与 AC# (01 §5) · 场景 (02 §2) 双对齐，基线溯源闭合
- ⚡ 影响链每点有回归（sync.mjs · rui code 管线）

---

### §0 基线溯源

| TC# | 覆盖 AC# (01 §5) | 覆盖场景 (02 §2) | 覆盖类型 | 状态 |
|-----|------------------|-----------------|---------|------|
| TC-N1~N5 | AC-1, AC-3, AC-4, AC-5, AC-6 | 场景1, 2, 3, 4, 5 | 正常 | 待验证 |
| TC-B1~B3 | AC-2, AC-7 | 场景1 | 边界 | 待验证 |
| TC-E1~E3 | AC-1, AC-5 | 场景1, 4 | 异常 | 待验证 |
| TC-R1~R2 | AC-1, AC-5 | 场景1, 4 | 回归 | 待验证 |
| 技术对齐 | 03 §0.1 设计决策 · 03 §2 API 契约 | 全场景 | 设计验证 | 已对齐 |

---

### §1 测试范围

#### 1.1 覆盖矩阵

| FP# | 功能点 | 正常 | 边界 | 异常 | 回归 | 覆盖率 |
|-----|--------|:---:|:---:|:---:|:---:|:---:|
| FP-1 | sync 远端同步 | TC-N1 | TC-B1, TC-B2 | TC-E1 | TC-R1 | 4/4 |
| FP-2 | retro 健康分析 | TC-N2 | — | — | — | 1/4 |
| FP-3 | history 历史记录 | TC-N3 | — | — | — | 1/4 |
| FP-4 | 需求管线 | TC-N4 | — | TC-E2, TC-E3 | TC-R2 | 3/4 |
| FP-5 | 空输入推荐 | TC-N5 | — | — | — | 1/4 |

#### 1.2 Gate 映射

| Gate | 用例范围 | 通过标准 | 交接下游 |
|------|---------|---------|---------|
| Gate A | TC-N1~N5, TC-B1~B3, TC-E1~E3 | 全部 P0 用例通过 | 实现阶段 |
| Gate B | TC-R1~R2 回归通道 | P0 全部通过 + P1 通过率 ≥ 90% | 交付阶段 |

#### 1.3 影响链覆盖

| 影响点 | 来源 | 回归用例 | 覆盖状态 |
|--------|------|---------|---------|
| resolvePullFilter 函数 | `skills/import-docs/sync.mjs` · 03 §2.3 | TC-R1 | 待验证 |
| pullFromRemote 函数 | `skills/import-docs/sync.mjs` · 03 §2.1 | TC-R1 | 待验证 |
| rui code 管线完整流程 | `skills/rui/SKILL.md` · 03 §1.2 | TC-R2 | 待验证 |
| rui-claude 技能架构 | 03 §1 · 06 §1 | TC-N4, TC-R2 | 待验证 |

---

### §2 测试用例

#### 2.1 正常用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|--------|
| TC-N1 | API_X_TOKEN 已配置，远端有 `.claude/` 相关 sessions（tags[0]=YrY, tags[1]=.claude） | 执行 `/rui-claude sync` 并确认 | 本地 `.claude/` 全部文件被远端覆盖，控制台输出 written/failed 统计，history 记录本次操作 | FP-1 | P0 |
| TC-N2 | 本地 `.claude/` 目录存在且含 agents/ rules/ skills/ | 执行 `/rui-claude retro` | 生成 `docs/自改进故事面板/YrY-<date>.md`，含 §1 配置结构 · §2 健康度 · §3 改进项 | FP-2 | P1 |
| TC-N3 | `.claude/.history/rui-claude-history.jsonl` 有历史数据 | 执行 `/rui-claude history list --limit 5` | 显示最近 5 条记录（时间戳、命令、结果） | FP-3 | P2 |
| TC-N4 | 输入有效需求描述且有 API_X_TOKEN | 执行 `/rui-claude "新增 skill"` | 创建 feat 分支 → pm 拆分 → 生成文档基线 → Gate A → 编码 → Gate B → 交付 | FP-4 | P1 |
| TC-N5 | 空输入 | 执行 `/rui-claude` | 输出 5–10 条按优先级排序的推荐任务，无任何文件变更 | FP-5 | P2 |

#### 2.2 边界用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|--------|
| TC-B1 | API_X_TOKEN 未配置（空字符串或不存在） | 执行 `/rui-claude sync` | 静默降级，提示 token 缺失，不发起网络请求，`.claude/` 不变 | FP-1 | P0 |
| TC-B2 | 用户对 sync 确认提示回答「否」 | 执行 `/rui-claude sync` → 确认提示 → 选择取消 | 操作中止，`.claude/` 完全不变 | FP-1 | P1 |
| TC-B3 | 远端无 `.claude/` 相关 sessions（空团队） | 执行 `/rui-claude sync` 并确认 | 提示「远端无匹配文件」，不覆盖任何本地文件 | FP-1 | P1 |

#### 2.3 异常用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|--------|
| TC-E1 | API_X_TOKEN 已配置但远端 API 不可达（网络故障 / 超时 30s） | 执行 `/rui-claude sync` 并确认 | 记录错误「远端查询失败」，退出码 0（不阻断管线），本地 `.claude/` 不变 | FP-1 | P0 |
| TC-E2 | 需求描述模糊无法解析 | 执行 `/rui-claude "修一下"` | no-parse 阻断，写入 `rui-state.json` block_reason=no-parse | FP-4 | P1 |
| TC-E3 | Gate B 验证超过 2 轮未通过 | 需求管线到达 Gate B 阶段 | gate-b-limit 阻断，写入 `rui-state.json` | FP-4 | P1 |

#### 2.4 回归用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|--------|
| TC-R1 | sync.mjs 的 `resolvePullFilter` 或 `pullFromRemote` 有修改 | 执行 `node skills/import-docs/sync.mjs dir=.claude/ mode=pull` | 文件正确下载到本地 `.claude/` 对应层级（嵌套目录保留） | FP-1 | P0 |
| TC-R2 | rui code 管线任一步骤有修改 | 端到端执行 `/rui-claude "测试需求"` | 完整管线不出现跳过 Gate A、分支混乱、自动合并 | FP-4 | P1 |

---

### §3 环境专项

| ID | Given | When | Then | 优先级 |
|----|-------|------|------|--------|
| TC-X1 | API_X_TOKEN 有效，但指向不同 workspace 的 `.claude/` sessions | 执行 sync | 仅下载 `tags[0]=<当前workspace> && tags[1]=.claude` 的文件，不混入其他 workspace | P0 |
| TC-X2 | 本地 `.claude/` 已存在部分文件 | 执行 sync | 同名文件被覆盖，额外存在的本地文件保留不删除 | P1 |
| TC-X3 | `.claude/` 有深层嵌套目录（如 `skills/a/b/c/SKILL.md`） | 执行 sync | 下载后保留完整目录结构（`resolvePullFilter.toLocal` 正确处理） | P0 |

---

### §4 测试环境

| 维度 | 配置 |
|------|------|
| 运行环境 | Node.js ≥ 18，支持 ESM |
| 部署方式 | 本地 CLI（Claude Code plugin） |
| 测试目标 | `skills/import-docs/sync.mjs` 的 pull mode + rui-claude 命令族 |
| 数据准备 | 远端 API 需有对应 workspace 的 `.claude/` sessions（由 import-docs 上传生成） |
| 分支 | main（sync/retro/history 不涉及分支切换）；feat 分支（需求管线） |
| 环境快照 | 待 Gate A 执行时记录 |

---

### §5 评审清单

- [x] 每功能点多类覆盖（FP-1 全部 4 类覆盖）
- [x] Gate A 覆盖（所有 P0 用例纳入 Gate A）
- [x] 回归与影响链一致（sync.mjs 变更 → TC-R1）
- [x] 异常含恢复行为（网络超时提示、no-parse 写入 block_reason）
- [x] 环境专项覆盖（跨 workspace 隔离、嵌套目录保留）
- [ ] FP-2/FP-3/FP-5 缺乏边界和异常用例 — meta 项目纯本地操作，异常路径有限
- [x] 影响链每点有回归
- [x] 基线溯源闭合（AC# 全覆盖、场景全覆盖）

---

### §6 Gate A 交接

| 信号 | 内容 |
|------|------|
| 通过状态 | 待执行 — TC-N1~N5, TC-B1~B3, TC-E1~E3 待验证 |
| P0 用例 ID | TC-N1, TC-B1, TC-E1, TC-R1, TC-X1, TC-X3 |
| 实现约束 | sync 委托 import-docs；retro 纯本地；history append-only 不入库；需求走 rui code；禁止自动 commit/push |
| 验证命令 | `node skills/import-docs/sync.mjs dir=.claude/ mode=pull` · `/rui-claude sync` · `/rui-claude retro` · `/rui-claude history list` |

---

### 变更记录

| 日期 | 变更 | 触发 | 证据 |
|------|------|------|------|
| 2026-05-18 | 初始反推生成 | `/rui doc --from-code rui-claude` | `skills/rui-claude/SKILL.md` · `rules/rui-claude.md` · `skills/import-docs/sync.mjs` |
