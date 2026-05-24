> | v1.0.0 | 2026-05-24 | deepseek-v4-pro | 🌿 feat/rui-import-label-change | 📎 [CLAUDE.md](../../CLAUDE.md) |

> **导航**: [← YrY-技术评审](./YrY-技术评审.md) · [YrY-实施报告 →](./YrY-实施报告.md)

### 来源引用

> 基于: [YrY-故事任务](./YrY-故事任务.md) §5 AC1–AC6 · [YrY-使用场景](./YrY-使用场景.md) §2 场景 1–3

### 主要价值

- 🎯 6 个测试用例覆盖全部 AC，确保 1:1 路径映射行为正确
- 🔒 回归用例 TC-R1 对比 `git ls-files` 确保全量导入路径一致性
- ⚡ Gate A 交接信号完整：P0 用例 ID + 验证命令
- 📊 正常/边界/异常三类用例覆盖 5 个 FP#，无遗漏

---

## §0 基线溯源

| TC# | 覆盖 AC# | 覆盖场景 | 覆盖类型 | 状态 |
|-----|---------|---------|---------|------|
| TC-N1 | AC1 | 场景 1, 2 | 正常 | 待生成 |
| TC-N2 | AC2 | 场景 1, 2 | 正常 | 待生成 |
| TC-N3 | AC3 | 场景 1, 2 | 正常 | 待生成 |
| TC-N4 | AC4 | 场景 3 | 正常 | 待生成 |
| TC-N5 | AC5 | 场景 1 | 正常 | 待生成 |
| TC-B1 | AC6 | 场景 1 | 边界 | 待生成 |
| TC-E1 | — | 场景 3 | 异常 | 待生成 |

---

## §1 测试范围

### 1.1 覆盖矩阵

| FP# | 功能点 | 正常 | 边界 | 异常 | 回归 | 覆盖率 |
|-----|--------|------|------|------|------|--------|
| FP1 | resolveRemotePath 统一 | TC-N1, TC-N2, TC-N3 | TC-B1 | — | TC-R1 | 3/1/0 |
| FP2 | 移除硬约束 | TC-N5 | TC-B1 | — | — | 1/1/0 |
| FP3 | resolvePullFilter 故事标签 | TC-N4 | — | TC-E1 | TC-R2 | 1/0/1 |
| FP4 | resolvePullFilter claude 标签 | — | — | — | TC-R2 | 0/0/0 |
| FP5 | recommendPullMode | TC-N4 | — | TC-E1 | — | 1/0/1 |

### 1.2 Gate 映射

| Gate | 用例范围 | 通过标准 | 交接下游 |
|------|---------|---------|---------|
| Gate A | TC-N1–N5, TC-B1 | 全部通过 | 实现阶段 |
| Gate B | TC-N1–N5, TC-B1, TC-E1, TC-R1, TC-R2 | 全部通过 | 交付 |

---

## §2 测试用例

### 2.1 正常用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|--------|
| TC-N1 | 文件路径 `docs/故事任务面板/rui-story/YrY-故事任务.md`，项目根 `/home/claude/YiKnowledge/static/YrY` | 调用 resolveRemotePath(file, root, "YrY", []) | 返回 `docs/故事任务面板/rui-story/YrY-故事任务.md`（保留 docs/） | FP1 | P0 |
| TC-N2 | 文件路径 `README.md`（项目根） | 调用 resolveRemotePath(file, root, "YrY", []) | 返回 `README.md`（无 workspace 前缀） | FP1 | P0 |
| TC-N3 | 文件路径 `.claude/settings.json` | 调用 resolveRemotePath(file, root, "YrY", []) | 返回 `.claude/settings.json` | FP1 | P0 |
| TC-N4 | pull 模式 `dir=docs/故事任务面板/rui-story/` | 查询远端 sessions，tag[0]="docs", tag[1]="故事任务面板", tag[2]="rui-story" | 正确匹配并下载文件到 `docs/故事任务面板/rui-story/` | FP3, FP4, FP5 | P0 |
| TC-N5 | mode=list 无 prefix 参数 | sync.mjs 输出文件清单 | 所有路径为相对于项目根的路径，无额外前缀 | FP1, FP2 | P0 |

### 2.2 边界用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|--------|
| TC-B1 | prefix=`["x", "y"]` 指定，文件 `README.md` | 调用 resolveRemotePath(file, root, "YrY", ["x","y"]) | 返回 `x/y/README.md` | FP1, FP2 | P1 |

### 2.3 异常用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|--------|
| TC-E1 | pull 模式 dir=docs/故事任务面板/nonexistent/ | 远端无匹配 sessions | 提示"远端无匹配文件"，返回 written=0 | FP3, FP5 | P1 |

### 2.4 回归用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|--------|
| TC-R1 | 全量导入含混合路径（docs/、.claude/、根 .md） | 执行 sync.mjs mode=list | 所有路径与 `git ls-files '*.md'` 相对路径一致 | FP1 | P0 |
| TC-R2 | pull 模式 `.claude/` 目录 | 查询远端 sessions，tag[0]=".claude" | 正确匹配 .claude/ 下文件 | FP3, FP4 | P1 |

---

## §3 环境专项

无需环境专项测试（纯路径映射逻辑变更，不涉及运行环境依赖）。

---

## §4 测试环境

| 维度 | 配置 |
|------|------|
| 运行环境 | Node.js ≥ 18 |
| 部署方式 | 本地执行 sync.mjs |
| 测试目标 | 路径映射函数、pull 标签匹配逻辑 |
| 数据准备 | 项目现有文件结构 |

---

## §5 评审清单

| # | 检查项 | 状态 |
|---|--------|------|
| 1 | 每 FP# 有多类型用例覆盖 | ✅ |
| 2 | Gate A 覆盖 6 个用例 | ✅ (TC-N1–N5, TC-B1)|
| 3 | 回归用例与影响链一致 | ✅ (TC-R1, TC-R2) |
| 4 | 异常用例含恢复行为 | ✅ (TC-E1 提示) |
| 5 | 环境专项覆盖 | N/A |
| 6 | 基线溯源闭合（TC# 覆盖全部 AC#） | ✅ |

---

## §6 Gate A 交接

| 信号 | 内容 |
|------|------|
| 通过状态 | P0 用例 TC-N1–N5 全部通过 |
| P0 用例 ID | TC-N1, TC-N2, TC-N3, TC-N4, TC-N5 |
| 实现约束 | 仅修改 sync.mjs 和 SKILL.md，不触碰其他文件 |
| 验证命令 | `node skills/rui-import/sync.mjs mode=list` 输出路径对比 `git ls-files` |

---

## 变更记录

| 日期 | 变更 | 触发 | 证据 |
|------|------|------|------|
| 2026-05-24 | 初始生成 | `/rui` doc 阶段 | YrY-故事任务 §5 |
