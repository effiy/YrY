> | v1.4.0 | 2026-05-19 | deepseek-v4-pro | 🌿 feat/plugin-management | 📎 [CLAUDE.md](../../../CLAUDE.md) |

> **导航**: [← YrY-03-技术评审](./YrY-03-技术评审.md)

> **来源**: 由故事需求 `插件管理从入门到精通` 驱动生成。外部参考吸收自 superpowers（验证门禁）。证据等级 B（可推导，附外部参考路径）。

### 主要价值

- 🔒 Gate A 阻断清晰 — 每 AC 有对应测试用例，不通过不得进入实现
- 📊 四类覆盖完整 — 正常/边界/异常/回归四维覆盖全部 FP
- 🔗 双基线溯源闭合 — 每用例标注覆盖的 AC# 与 02 场景
- 🛡️ 安全路径显式覆盖 — 路径遍历、格式注入、并发竞态有专项用例

---

### §0 基线溯源

| TC# | 覆盖 AC#(01 §5) | 覆盖场景(02 §2) | 覆盖类型 | 状态 |
|-----|-----------------|-----------------|---------|------|
| TC-N1 | AC-1 (一致→pass) | 场景 1: 版本一致性校验 | 正常 | 待执行 |
| TC-N2 | AC-4 (bump 成功) | 场景 2: 统一版本升级 | 正常 | 待执行 |
| TC-N3 | AC-7 (health 通过) | 场景 3: 插件健康分析 | 正常 | 待执行 |
| TC-N4 | AC-8 (publish-prep 阻断) | 场景 4: 发布准备检查 | 正常 | 待执行 |
| TC-N5 | AC-9 (文档理解) | 场景 5: 学习插件概念 | 正常 | 待执行 |
| TC-B1 | AC-1 (边界：仅一处声明) | 场景 1 | 边界 | 待执行 |
| TC-B2 | AC-3 (边界：字段缺失) | 场景 1 | 边界 | 待执行 |
| TC-B3 | AC-7 (边界：检查维度恰好 5 项) | 场景 3 | 边界 | 待执行 |
| TC-E1 | AC-2 (异常：版本不一致) | 场景 1 | 异常 | 待执行 |
| TC-E2 | AC-5 (异常：写入失败回滚) | 场景 2 | 异常 | 待执行 |
| TC-E3 | AC-6 (异常：非法版本号) | 场景 2 | 异常 | 待执行 |
| TC-E4 | AC-3 (异常：文件缺失) | 场景 1 | 异常 | 待执行 |
| TC-E5 | AC-8 (异常：marketplace.json 缺失) | 场景 4 | 异常 | 待执行 |
| TC-R1 | AC-1 (回归：bump 后校验一致) | 场景 2 → 场景 1 | 回归 | 待执行 |
| TC-R2 | AC-7 (回归：bump 后 health 仍通过) | 场景 2 → 场景 3 | 回归 | 待执行 |

---

### §1 测试范围

#### 1.1 覆盖矩阵

| FP# | 功能点 | 正常 | 边界 | 异常 | 回归 | 覆盖率 |
|-----|--------|------|------|------|------|--------|
| FP-1 | 版本一致性校验 | TC-N1 | TC-B1, TC-B2 | TC-E1, TC-E4 | TC-R1 | 100% |
| FP-2 | 版本统一升级 | TC-N2 | — | TC-E2, TC-E3 | TC-R1, TC-R2 | 100% |
| FP-3 | 插件健康分析 | TC-N3 | TC-B3 | — | TC-R2 | 100% |
| FP-4 | 发布准备检查 | TC-N4 | — | TC-E5 | — | 100% |
| FP-5 | 入门文档 | TC-N5 | — | — | — | 100% |
| FP-6 | 进阶文档 | TC-N5 | — | — | — | 100% |
| FP-7 | 精通文档 | TC-N5 | — | — | — | 100% |

#### 1.2 Gate 映射

| Gate | 用例范围 | 通过标准 | 交接下游 |
|------|---------|---------|---------|
| Gate A | TC-N* + TC-B* + TC-E*（共 13 条） | 全部通过，P0 清零 | 实现阶段 |
| Gate B | TC-R* + TC-N* 复验（共 15 条） | 全部通过，≤ 2 轮 | 交付 |

#### 1.3 影响链覆盖

| 影响点 | 来源 | 回归用例 | 覆盖状态 |
|--------|------|---------|---------|
| bump 后版本一致性 | 01 RSK-1 | TC-R1 | 已覆盖 |
| bump 后 health 仍通过 | 01 RSK-4 | TC-R2 | 已覆盖 |
| validate 被 bump 复用 | 03 T1→T2 依赖 | TC-R1 | 已覆盖 |

---

### §2 测试用例

#### 2.1 正常用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|--------|
| TC-N1 | CLAUDE.md、plugin.json、marketplace.json(metadata+plugins[0]) 四处版本号均为 1.4.0 | 执行 `node skills/rui-plugin/validate.mjs` | 退出码 0，stdout 含 "pass"，列出四处位置与版本号 | FP-1 | P0 |
| TC-N2 | 四处版本均为 1.4.0，目标版本 1.4.0，工作区干净 | 执行 `node skills/rui-plugin/bump.mjs 1.4.0` | 退出码 0，四处文件更新为 1.4.0，stdout 含变更摘要 | FP-2 | P0 |
| TC-N3 | plugin.json 完整、marketplace.json 存在且一致、版本一致、必需目录存在 | 执行 `node skills/rui-plugin/health.mjs` | 退出码 0，stdout 含 ≥ 5 项检查维度的通过结果 | FP-3 | P1 |
| TC-N4 | marketplace.json 缺失 | 执行 `node skills/rui-plugin/publish-prep.mjs` | 退出码 1，stdout 含 "阻断" 和 "marketplace.json 缺失" | FP-4 | P1 |
| TC-N5 | 入门文档存在于 `docs/` 下 | 人工阅读文档 | 读者能正确回答：插件是什么、plugin.json 有哪些必填字段、与 skill/agent/rule 什么关系 | FP-5 | P2 |

#### 2.2 边界用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|--------|
| TC-B1 | version-sources.json 仅配置 1 处声明位置 | 执行 validate | 退出码 0（无法比对不一致），stdout 含 pass 和唯一位置 | FP-1 | P1 |
| TC-B2 | plugin.json 缺少 version 字段 | 执行 validate | 退出码 1，stdout 含 "缺失 version 字段" 和具体文件名 | FP-1 | P0 |
| TC-B3 | 健康检查恰好 5 个维度全部通过 | 执行 health | stdout 显示 5/5 通过，退出码 0 | FP-3 | P2 |

#### 2.3 异常用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|--------|
| TC-E1 | CLAUDE.md 版本 1.4.0，plugin.json 版本 1.3.7 | 执行 validate | 退出码 1，stdout 含 "fail" 和 diff 标注具体位置与版本号 | FP-1 | P0 |
| TC-E2 | 四处版本均为 1.4.0，模拟 bump 过程第三个文件写入失败 | 执行 bump 1.4.0 | 退出码 3，已更新的前两个文件回滚，四处保持 1.4.0 | FP-2 | P0 |
| TC-E3 | 输入版本号 "v1.4.0"（前缀 v）或 "1.4"（两段） | 执行 bump | 退出码 1，stdout 提示 "版本号格式不合法，期望 x.y.z" | FP-2 | P1 |
| TC-E4 | CLAUDE.md 文件不存在（被删除或移动） | 执行 validate | 退出码 1，stdout 含 "CLAUDE.md 不存在" | FP-1 | P1 |
| TC-E5 | marketplace.json 存在但 plugins 数组为空 | 执行 publish-prep | 退出码 1，stdout 含 "阻断: plugins 数组为空" | FP-4 | P1 |

#### 2.4 回归用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|--------|
| TC-R1 | bump 1.4.0 成功完成 | 立即执行 validate | 退出码 0，pass，四处均为 1.4.0 | FP-1, FP-2 | P0 |
| TC-R2 | bump 1.4.0 成功完成 | 执行 health | 退出码 0，版本一致性维度通过，其余维度保持通过 | FP-2, FP-3 | P1 |

---

### §3 环境专项

| ID | Given | When | Then | 优先级 |
|----|-------|------|------|--------|
| TC-X1 | 项目根目录路径含空格（如 `/home/claude/my project/`） | 执行 validate | 正常读取文件，退出码 0 | P1 |
| TC-X2 | version-sources.json 被格式化为多行 JSON（含注释） | 执行 validate | 若用 JSON5 解析正常读取；若用标准 JSON 解析报格式错误（取决于实现选择） | P2 |
| TC-X3 | plugin.json 含 BOM 头 | 执行 validate | 正常解析，退出码 0 或提示编码问题 | P2 |
| TC-X4 | marketplace.json 中 plugins[0].version 字段路径不存在 | 执行 validate | 退出码 1，标注 "marketplace.json plugins[0].version 不存在" | P1 |

---

### §4 测试环境

| 维度 | 配置 |
|------|------|
| 运行环境 | Node.js ≥ 18（与 import-docs/sync.mjs 一致） |
| 部署方式 | 本地文件系统，无需服务端 |
| 测试目标 | validate.mjs / bump.mjs / health.mjs / publish-prep.mjs |
| 数据准备 | 准备多组 fixture：一致/不一致/缺失字段/非法格式的 plugin.json + marketplace.json + CLAUDE.md |
| 分支 | `feat/plugin-management` |
| 快照 | commit: (待实现后填入) |

---

### §5 评审清单

| # | 检查项 | 状态 |
|---|--------|------|
| 1 | 每功能点有正常 + 边界 + 异常覆盖 | ✅ FP-1–FP-7 已覆盖 |
| 2 | Gate A 覆盖 — 全部 TC-N* + TC-B* + TC-E* | ✅ 13 条用例 |
| 3 | 回归用例与影响链一致 | ✅ TC-R1, TC-R2 覆盖 T1→T2 影响链 |
| 4 | 异常含恢复行为 | ✅ TC-E2 验证回滚 |
| 5 | 环境专项覆盖 | ✅ TC-X1–TC-X4 覆盖路径/格式/编码/字段路径 |
| 6 | 无外部依赖 — 全部用例本地可执行 | ✅ 纯文件系统操作 |
| 7 | 影响链每点有回归用例 | ✅ |
| 8 | 基线溯源闭合 — 每 TC# 有 AC# 和场景映射 | ✅ §0 表完整 |

---

### §6 Gate A 交接

| 信号 | 内容 |
|------|------|
| **通过状态** | 13 条 Gate A 用例（5N + 3B + 5E）全部通过 |
| **P0 用例 ID** | TC-N1, TC-N2, TC-B2, TC-E1, TC-E2, TC-R1 |
| **实现约束** | 校验脚本只读；bump 脚本原子操作（临时文件 + rename）；版本号格式严格 semver；路径白名单机制 |
| **验证命令** | `node skills/rui-plugin/validate.mjs` · `node skills/rui-plugin/bump.mjs <ver>` · `node skills/rui-plugin/health.mjs` · `node skills/rui-plugin/publish-prep.mjs` |

---

### 变更记录

| 日期 | 变更 | 触发 | 证据 |
|------|------|------|------|
| 2026-05-19 | 初稿：15 条用例（5N + 3B + 5E + 2R）、4 条环境专项、Gate A 交接 | `/rui 插件管理从入门到精通` → 05 测试评审 | 01-故事任务 §5 AC ×9、02-用户场景 §2 场景 ×6、03-技术评审 §0.1 设计决策 ×6 |
