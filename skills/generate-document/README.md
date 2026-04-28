# generate-document 快速索引

`generate-document` 是项目的文档生成主 skill。行为真源在 `SKILL.md`，本文件只保留快速开始、目录索引和常用入口。

## 快速开始

### 生成功能文档

```bash
/generate-document 简洁功能名-用户故事简短描述
```

- 落盘目录：`docs/简洁功能名/`，含 `01_需求文档.md` … `05_动态检查清单.md`、`07_项目报告.md`（`06_实施总结.md` 由 `implement-code` 写入，本技能不创建）。
- 本技能**不展示、不推荐**仅生成单份需求/设计等命令；与单文档平铺目录（如 `docs/01_需求文档/`）无交付关系，标交付仅为上述全文档编号集。

### 初始化项目基础文件

```bash
/generate-document init
```

- 检查并生成/更新项目必要的基础文件（`CLAUDE.md`、`README.md`、`docs/architecture.md` 等 8 个文件）
- 同时在 `docs/项目初始化/` 下创建完整文档编号集（01-07，含 `06_实施总结.md`）
- 缺失文件自动基于项目代码生成内容，已有文件检测与当前代码一致性
- 详见 `SKILL.md`「init 命令」章节

### 生成自然周周报

```bash
/generate-document weekly
```

- 生成当前自然周的 OKR/KPI 周报到 `docs/周报/<YYYY>-W<NN>.md`
- 基于 `docs/` 下全文档集和 `.claude/` 系统状态进行自我分析及改进规划
- OKR 记录用户故事案例进展，KPI 进行量化复盘和下五步规划
- 同时包含系统自改进（`.claude/` 目录）和项目自改进（根目录）
- 指定周编号：`/generate-document weekly 2026-W17`
- 详见 `SKILL.md`「weekly 命令」章节

## 真源说明

- 行为真源：`./SKILL.md`
- 文档与影响分析契约：`../../shared/document-contracts.md`
- 证据与反幻觉：`../../shared/evidence-and-uncertainty.md`

## 全文档类型一览（`docs/<功能名>/`）

| 类型 | 模板 | 规范 | 文件名 |
|------|------|------|--------|
| 需求文档 | ✅ | ✅ | `01_需求文档.md` |
| 需求任务 | ✅ | ✅ | `02_需求任务.md` |
| 设计文档 | ❌ | ✅ | `03_设计文档.md` |
| 使用文档 | ❌ | ✅ | `04_使用文档.md` |
| 动态检查清单 | ❌ | ✅ | `05_动态检查清单.md` |
| 实施总结 | — | — | `06_实施总结.md`（非本 skill，init 例外） |
| 项目报告 | ❌ | ✅ | `07_项目报告.md` |
| 周报 | ❌ | ✅ | `docs/周报/<YYYY>-W<NN>.md`（weekly 命令） |

## 目录导航

- `rules/`：结构契约
- `templates/`：可选骨架
- `checklists/`：专项检查清单
- `checklist.md`：检查清单入口索引

## 使用原则

1. 先读 `SKILL.md`，再读具体 `rules/<类型>.md`。
2. 设计文档与动态检查清单禁用模板，只能基于规范和上游事实生成。
3. 需求任务与设计文档的影响分析必须按 `../../shared/document-contracts.md` 影响分析契约覆盖全项目。
4. 所有路径和 agent 名称必须与仓库内真实文件保持一致，不得引用旧路径或虚构代理。
5. 每次调用都必须写入 `docs/` 下至少一个 Markdown 文件；无法按全文档继续时，写入项目日志记录。
6. **每次调用结束后必须**：先按 `import-docs` 技能执行 `docs` 标准导入，再按 `wework-bot` 技能发送带真实 `☁️ 文档同步` 结果的完成通知；两步缺一不可（详见 `SKILL.md` 步骤 5）。
7. 全文档产出应便于 `implement-code` 做 **02↔05 P0 覆盖** 核对：见 `implement-code` 的 `rules/orchestration.md §3.4` 与 `SKILL.md` 原则 12；避免场景与检查项脱钩。
