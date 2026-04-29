# generate-document 快速索引

`generate-document` 是文档生成主 skill。行为真源在 `SKILL.md`，本文件只保留快速开始、目录索引和常用入口。

## 快速开始

```bash
/generate-document init                           # 初始化/更新项目基础文件
/generate-document <功能名>-<用户故事简短描述>     # 生成/更新功能文档集
/generate-document weekly                         # 生成/更新周报
```

- **所有命令均可反复调用**，已存在则增量更新，不强制重建。
- 落盘目录：`docs/<功能名>/`，含 `01_需求文档.md` … `05_动态检查清单.md`、`07_项目报告.md`（`06_实施总结.md` 由 `implement-code` 写入，本技能不创建）。
- 本技能**不展示、不推荐**仅生成单份需求/设计等命令；与单文档平铺目录（如 `docs/01_需求文档/`）无交付关系，标交付仅为上述全文档编号集。

## 真源说明

- 行为真源：`./SKILL.md`
- 文档契约：`../../shared/document-contracts.md`
- 影响分析契约：`../../shared/impact-analysis-contract.md`
- 证据与反幻觉：`../../shared/evidence-and-uncertainty.md`（与 `checklists/通用文档.md` P0 证据类项一起约束采纳率）
- 路径约定：`../../shared/path-conventions.md`
- Skill / Agent 边界：`../../shared/agent-skill-boundaries.md`

## 全文档类型一览（`docs/<功能名>/`）

| 类型 | 模板 | 规范 | 文件名 |
|------|------|------|--------|
| 需求文档 | ✅ | ✅ | `01_需求文档.md` |
| 需求任务 | ✅ | ✅ | `02_需求任务.md` |
| 设计文档 | ❌ | ✅ | `03_设计文档.md` |
| 使用文档 | ❌ | ✅ | `04_使用文档.md` |
| 动态检查清单 | ❌ | ✅ | `05_动态检查清单.md` |
| 实施总结 | — | — | `06_实施总结.md`（非本 skill） |
| 项目报告 | ❌ | ✅ | `07_项目报告.md` |

## 扩展命令

- `init`：初始化或再初始化项目基础文件。生成/更新 10 个根目录基础文件（`CLAUDE.md`、`README.md`、`docs/architecture.md` 等）+ `docs/项目初始化/` 下 01-07 全文档编号集（含 `06_实施总结`）。反复执行时按「re-init 更新策略」刷新事实类内容、保留人工补充、冲突处标注待确认。规则见 `rules/项目基础文件.md` §「可重复运行（re-init）更新策略」。
- `weekly [日期]`：生成/更新周报单文档。可传自然周内任意日期（如 `2026-04-29`），也可传自然周起止范围（如 `2026-04-27~2026-05-03`），脚本会自动归算到对应自然周。规则见 `rules/周报.md`，落盘到 `docs/周报/<YYYY-MM-DD>~<YYYY-MM-DD>/周报.md`；同一自然周内反复调用覆盖更新。结束时仍强制执行 `import-docs`→`wework-bot`。
- `from-weekly <周报路径>`：从周报「后期规划与改进优先级总表」拆解为多个 `docs/<功能名>/` 全文档集；映射表见 `docs/99_agent-runs/<YYYYMMDD-HHMMSS>_from-weekly.md`，全部完成后**一次** `import-docs` + **一条**汇总通知（详见 `SKILL.md`）。

## 命令与幂等性一览

| 命令 | 首次行为 | 再次行为 | 版本处理 |
|------|---------|---------|---------|
| `init` | 新建 10 个基础文件 + `docs/项目初始化/01-07` | 更新事实类段落，保留人工补充，冲突标「待确认」 | 文档头部日期更新 |
| `<功能名>-描述` | 新建 `docs/<功能名>/01-05,07` | 读取既有文档，差异对比，级联更新受影响文件 | 次版本 `+1`（`v1.0`→`v1.1`） |
| `weekly` | 新建本周周报 | 覆盖更新同一自然周文件 | 次版本 `+1` |
| `from-weekly` | 新建多个功能目录 | 每个目录独立按「已存在则更新」处理 | 各目录独立次版本 `+1` |

## 目录导航

- `rules/`：结构契约
- `templates/`：可选骨架
- `checklists/`：专项检查清单
- `checklist.md`：检查清单入口索引

## 使用原则

1. 先读 `SKILL.md`，再读具体 `rules/<类型>.md`。
2. 设计文档与动态检查清单禁用模板，只能基于规范和上游事实生成。
3. 需求任务与设计文档的影响分析必须按 `../../shared/impact-analysis-contract.md` 覆盖全项目、上游依赖、反向依赖、传递依赖、导出链、注册链、测试、文档、配置和外部依赖。
4. 所有路径和 agent 名称必须与仓库内真实文件保持一致，不得引用旧路径或虚构代理。
5. 每次调用都必须写入 `docs/` 下至少一个 Markdown 文件；无法按全文档继续时，写入 `docs/99_agent-runs/<YYYYMMDD-HHMMSS>_generate-document.md`。
6. **每次调用结束后必须**：先按 `import-docs` 技能执行 `docs` 标准导入，再按 `wework-bot` 技能发送带真实 `☁️ 文档同步` 结果的完成通知；两步缺一不可（详见 `SKILL.md` 顶部「强制最终步骤」）。
7. 全文档产出应便于 `implement-code` 做 **02↔05 P0 覆盖** 核对：见 `implement-code` 的 `rules/orchestration.md §3.4` 与 `SKILL.md` 原则 12；避免场景与检查项脱钩。
