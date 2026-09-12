---
title: YiKnowledge 缺陷索引
tags: [yiknowledge, bugs, index]
category: projects/yiknowledge/bugs
created: 2026-09-07
updated: 2026-09-11
source: YiKnowledge
type: index
status: active
---

# YiKnowledge 缺陷追踪

> 知识库相关的缺陷记录，按月份 → 分类归档。包括 frontmatter 解析错误、RAG 检索质量问题、文件同步失败、角色边界冲突、命名规范违规等。

## 目录结构

```
bugs/
├── README.md
├── 2026-07/
│   └── 模板/
├── 2026-08/
│   └── 模板/
└── 2026-09/
    ├── 模板/
    ├── 同步/
    ├── 命名/
    └── Frontmatter/
```

## 分类目录

| 分类 | 路径示例 | 说明 |
|------|------|------|
| Frontmatter | `2026-09/Frontmatter/` | YAML 解析错误、字段缺失、类型不匹配、tags 格式错误 |
| RAG 检索 | `2026-09/rag/` | 检索质量下降、索引构建失败、向量维度不匹配 |
| 文件同步 | `2026-09/同步/` | Knowledge Watcher 同步失败、竞态条件、文件变更未检测 |
| 角色边界 | `2026-09/roles/` | 文件放错角色目录、决策树判定错误 |
| 命名规范 | `2026-09/命名/` | 文件名不符合 kebab-case、使用下划线或数字 |
| 目录结构 | `2026-09/structure/` | 超过 3 级目录层级、空目录 |
| 模板 | `{月份}/模板/` | 缺陷模板（每月一份） |

> 新缺陷按 `{月份}/{分类}/` 归类，分类目录不存在时创建。

## 严重度

| 严重度 | 定义 |
|--------|------|
| **critical** | 知识库不可用、RAG 检索完全失效或数据丢失 |
| **major** | 核心功能不可用（检索质量严重下降、文件同步失败） |
| **minor** | 功能受损但不影响核心流程（命名违规、格式错误） |
| **trivial** | 视觉瑕疵、文案错误 |

## 优先级

| 优先级 | 响应 |
|--------|------|
| **P0** | 即时修复，阻塞发布 |
| **P1** | 下一迭代 |
| **P2** | 计划内修复 |
| **P3** | 积压待排 |

## 生命周期

```
open → analyzing → in_progress → resolved → verified → closed
  │                                              │
  └── cannot_reproduce / wont_fix                └── 验证失败 → open
```

## 缺陷列表

| 月份 | ID | 标题 | 严重度 | 优先级 | 分类 | 模块 | 状态 | 日期 |
|------|----|------|--------|--------|------|------|------|------|
| 2026-09 | 1 | [tags 字段使用字符串格式导致 RAG 标签过滤失效](./2026-09/Frontmatter/01-tags字符串格式导致RAG标签过滤失效-20260903.md) | major | p1 | frontmatter | YiKnowledge/engineer/build/ | resolved | 2026-09-03 |
| 2026-09 | 2 | [Knowledge Watcher 轮询竞态导致新增文件未被索引](./2026-09/同步/01-Watcher轮询竞态导致文件未索引-20260904.md) | minor | p2 | sync | YiAi domain/knowledge/watcher.py | resolved | 2026-09-04 |
| 2026-09 | 3 | [文件名使用下划线违反 kebab-case 规范](./2026-09/命名/01-文件名使用下划线违反kebab-case规范-20260902.md) | minor | p2 | naming | YiKnowledge/engineer/build/ | resolved | 2026-09-02 |

## 分类统计

| 严重度 | 数量 | 缺陷 |
|--------|------|------|
| major | 1 | #1 |
| minor | 2 | #2, #3 |

| 分类 | 数量 | 缺陷 |
|------|------|------|
| frontmatter | 1 | #1 |
| sync | 1 | #2 |
| naming | 1 | #3 |

## 常见缺陷模式

### Frontmatter（Frontmatter/）

- **tags 格式错误**：`tags: "example"`（字符串）而非 `tags: [example]`（数组），导致 RAG 标签过滤失效。解析时归一化处理：字符串自动转为数组，逗号分隔转为多标签。
- **缺少必需字段**：frontmatter 缺少 `title`、`tags`、`category` 等 8 个必需字段之一。始终使用 Frontmatter 规范检查完整性。
- **字段类型错误**：`created`/`updated` 应为 `YYYY-MM-DD` 格式。类型不匹配会导致 RAG 检索过滤器失效。
- **中文 key**：frontmatter 中使用中文 key 而非英文 key。始终使用英文 key（`title` 而非 `标题`）。

### 文件同步（同步/）

- **竞态条件**：文件写入过程中被 Knowledge Watcher 扫描到部分内容，标记为已索引后不再更新。使用文件稳定性检测（mtime + size 在 500ms 内不变）。
- **文件变更未检测**：新增文件后 YiAi 未扫描到。检查文件是否在 Knowledge Watcher 的监控目录下，frontmatter 是否完整。
- **编码问题**：文件包含非 UTF-8 字符导致解析失败。始终使用 UTF-8 编码保存文件。

### 命名规范（命名/）

- **下划线文件名**：使用 `wip_features.md` 而非 `wip-features.md`，违反 kebab-case 规范，影响 BM25 路径分词。pre-commit hook + CI 自动检查。
- **大写字母文件名**：`MyFile.md` 而非 `my-file.md`。始终使用全小写 + 连字符。

### RAG 检索（rag/）

- **检索质量下降**：知识库内容更新后未触发重新索引。检查 YiAi Knowledge Watcher 是否正常运行（`apscheduler` 5s 轮询）。
- **混合检索权重失衡**：BM25 和向量检索的权重配置不当导致检索结果偏差。调整 `alpha` 参数。

### 角色边界（roles/）

- **文件放错角色目录**：架构模式放在 `leader/` 而非 `engineer/`。使用角色边界决策树判定归属。
- **多角色文件未声明 roles**：内容涉及多个角色但 frontmatter 缺少 `roles:` 字段。始终声明 `roles: [leader, engineer]`。

### 排查流程

1. 确认问题类型（frontmatter / 检索 / 同步 / 角色边界 / 命名规范）
2. 检查相关文件的 frontmatter 完整性和命名规范
3. 使用 YiAi RAG 测试端点验证检索质量
4. 检查 YiAi Knowledge Watcher 日志确认同步状态
5. 运行 pre-commit hook 检查文件命名规范
6. 对比预期行为与实际行为，定位根因
7. 根据根因归入对应分类目录，修复后更新知识库规范

## 缺陷模板

使用 [缺陷模板](./2026-09/模板/00-模板-知识库bug模板.md) 参考创建新缺陷记录。

### 命名规范

```
{月份}/{分类}/{简短描述}-{YYYYMMDD}.md
```

### 必要字段

每个缺陷文件必须包含：发现场景、影响文件、问题描述、根因分析、修复方案、影响范围、验证方法、预防措施。

## 相关资源

- [YiVad 缺陷索引](../yivad/bugs/README.md)
- [YiAi 缺陷索引](../yiai/bugs/README.md)
- [YiPet 缺陷索引](../yipet/bugs/README.md)
- [Frontmatter 规范](../workflows/开发规范/02-开发规范-Frontmatter模式.md)
- [知识管理规范](../workflows/开发规范/01-规范-OpenSpec工作流规范.md)