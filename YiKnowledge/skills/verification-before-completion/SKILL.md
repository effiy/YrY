---
name: verification-before-completion
description: >
  完成前系统验证。自动化检查(类型/测试/lint)+人工清单+确定性完成门禁。
  防止「我以为完成了」但实际遗漏的情况。当用户表示代码已写完、功能完成、
  Bug已修复，或者说「做完了」「完成了」「搞定」「好了」「应该没问题」
  「verify」「验证一下」「检查一下」「确认完成」「pre-commit check」
  「ready to merge」时使用。task-planning 所有步骤完成后自动衔接。
  注意：代码还没写完→TDD/code-review；验证通过后→finishing 提交。
user_invocable: true
updated: 2026-09-23
lifecycle: active
auto-trigger-rules:
  - 用户说「做完了」「完成了」「搞定」「好了」（代码已写完，需要确认）
  - 功能实现或 Bug 修复代码已写完，准备进入验证阶段
  - task-planning 中所有步骤标记为完成
  - "**注意**：验证通过后自动提示 finishing；如果代码还没写完→TDD/code-review；如果有报错→debugging"
priority: high
tags: [skill, verification, quality, completion]
---

# 完成前验证 —— 质量门禁

> 完成不是「代码写完了」，而是「验证通过了」。不做验证的「完成」= 把测试的责任推给了用户。

## 为什么需要这个技能？

superpowers 的 `/verification-before-completion` 是开发流程的最后一环。它解决了一个常见问题：开发者（人和 AI）在写完代码后容易过早宣布「完成」，而实际上：
- 类型检查没跑
- 测试没跑全
- 边界情况没验证
- 项目特有的质量门禁没过

本技能将「完成」从主观感觉变为客观验证。

---

### 进入标准
- [ ] 所有代码变更已完成（功能实现/Bug 修复/重构结束）
- [ ] 开发者认为「可以交付了」（主观完成）
- [ ] task-planning 步骤完成（如适用）

### 退出标准
- [ ] 所有必过门禁通过（type check / tests / lint）
- [ ] 所有功能门禁通过（验收标准逐条确认）
- [ ] 边界门禁通过或有明确记录
- [ ] 验证报告已生成（✅ 通过 / ⚠️ 有条件通过 / ❌ 未通过）
- [ ] 下一步：✅ → finishing（提交收尾）；❌ → 回到对应技能修复

## 验证流程

```
自动化检查 → 人工验证 → 门禁判定 → 完成确认
```

### 阶段 1：自动化检查

根据修改的项目，执行对应的自动化检查：

#### YiVad（Vue 3.5 前端）

```bash
# 类型检查 — 0 errors 为通过
cd YiVad && pnpm vue-tsc --noEmit

# 单元测试 — 全部通过为通过
cd YiVad && pnpm test

# Lint 检查
cd YiVad && pnpm lint
```

| 检查项 | 命令 | 通过标准 |
|--------|------|---------|
| Type Check | `vue-tsc --noEmit` | 0 errors |
| Unit Tests | `pnpm test` | 全部通过 |
| Lint | `pnpm lint` | 0 errors, 0 warnings |

#### YiAi（FastAPI 后端）

```bash
# 单元测试 + 集成测试 — 全部通过为通过
cd YiAi && python -m pytest tests/ -v

# 类型检查（如配置了 mypy）
cd YiAi && python -m mypy domain/ --ignore-missing-imports
```

| 检查项 | 命令 | 通过标准 |
|--------|------|---------|
| Tests | `python -m pytest tests/ -v` | 全部通过 |
| Type Check | `mypy domain/` | 0 errors |

#### YiPet（Chrome Extension）

```bash
# 类型检查
cd YiPet && npx tsc --noEmit

# 单元测试
cd YiPet && npm test
```

| 检查项 | 命令 | 通过标准 |
|--------|------|---------|
| Type Check | `tsc --noEmit` | 0 errors |
| Tests | `npm test` | 全部通过 |

### 阶段 2：人工验证清单

自动化检查通过后，逐项确认人工验证清单：

#### 通用清单

- [ ] **功能正确性** — 按照 PRD/Issue 的验收标准逐条验证
- [ ] **边界情况** — 空数据、极端值、错误输入的表现符合预期
- [ ] **UI 一致性** — 新 UI 与现有风格一致（间距、颜色、字体）
- [ ] **错误处理** — 网络错误、权限不足等情况有合理的用户提示
- [ ] **控制台清洁** — 无新的 error 或 warning 日志
- [ ] **无调试代码残留** — 无 `console.log`、`print`、注释掉的代码

#### YiVad 专项

- [ ] 路由跳转正常，无白屏或闪烁
- [ ] ProTable 分页、排序、筛选功能正常
- [ ] `v-auth` 权限控制按钮正确显示/隐藏
- [ ] Pinia store 持久化状态正常
- [ ] 浏览器 DevTools 无 Vue 警告

#### YiAi 专项

- [ ] RPC 参数名正确（`filter` 而非 `query`，`target_file` 而非 `path`）
- [ ] API 响应格式符合 RPC 信封规范
- [ ] 异常返回正确的错误码（非 500）
- [ ] MongoDB 查询有限制（`limit`、projection）
- [ ] 日志级别适当（无敏感信息）

#### YiPet 专项

- [ ] Content Script 注入正常
- [ ] Service Worker 唤醒后状态恢复
- [ ] chrome.storage 读写正常
- [ ] Popup 打开/关闭无异常
- [ ] 消息通道通信正常

### 阶段 3：门禁判定

根据验证结果给出判定：

| 结果 | 条件 | 行动 |
|------|------|------|
| ✅ **通过** | 所有自动化检查通过 + 人工清单全部确认 | 标记完成 |
| ⚠️ **有条件通过** | 自动化检查通过，人工清单有小问题 | 记录遗留问题，标记完成 |
| ❌ **未通过** | 自动化检查失败 | 修复后重新验证 |

### 阶段 4：完成确认

验证通过后：

```markdown
## 完成验证报告

**任务**：[任务名称]
**验证时间**：YYYY-MM-DD HH:MM

### 自动化检查
| 检查项 | 结果 |
|--------|------|
| Type Check | ✅ 0 errors |
| Tests | ✅ 41/41 passed |
| Lint | ✅ 0 warnings |

### 人工验证
- [x] 功能正确性 — 验收标准全部满足
- [x] 边界情况 — 空数据、网络错误已测试
- [x] UI 一致性 — 与现有风格一致
- [x] 错误处理 — 用户提示完整
- [x] 控制台清洁 — 无新日志
- [x] 无调试代码 — 已清理

### 遗留问题
- [无 / 列出已知但决定不在此次修复的问题]

### 结论
✅ 通过 — 可以提交/合并
```

---

## 确定性完成门禁（Deterministic Completion Gate）

从 planning-with-files 引入的核心概念：**完成不是主观感觉——而是可验证的条件集合全部通过**。

### 为什么「差不多完成了」不够？

主观判断「完成了」有三个致命缺陷：

1. **不可复核** — 一周后无法验证「当时为什么觉得完成了」
2. **标准浮动** — 疲劳时放低标准，着急时跳过检查
3. **交接困难** — 另一个人无法判断任务是否真的可以交付

确定性门禁将「完成」从感觉转化为机器可验证的事实。

### 门禁定义

每个任务在开始时定义完成门禁，验证阶段逐条检查：

```markdown
## 完成门禁

### 必过门禁（一项不过 = 整体不过）

- [ ] **类型检查通过**：`vue-tsc --noEmit` 0 errors
- [ ] **全部测试通过**：`pnpm test` 41/41
- [ ] **Lint 无警告**：`pnpm lint` 0 warnings
- [ ] **RPC 契约正确**：`filter` 而非 `query`，`target_file` 而非 `path`

### 功能门禁（从 PRD/Issue 验收标准派生）

- [ ] **验收标准 1**：[可验证的描述] — 验证方式：[自动/手动]
- [ ] **验收标准 2**：[可验证的描述] — 验证方式：[自动/手动]

### 边界门禁

- [ ] **空状态**：无数据时不崩溃，显示合理提示
- [ ] **错误状态**：网络错误有用户提示，不影响其他功能
- [ ] **极端输入**：最大长度、特殊字符、负数均处理正确
```

### 门禁判定

```
所有必过门禁通过？
    │
    ├── 否 → ❌ 未完成 — 修复后重新验证
    │
    └── 是
        │
        ▼
      所有功能门禁通过？
        │
        ├── 否 → ❌ 未完成 — 回到 task_plan 继续实现
        │
        └── 是
            │
            ▼
          所有边界门禁通过？
            │
            ├── 否 → ⚠️ 记录为遗留问题，有条件通过
            │
            └── 是 → ✅ 完成 — 可交付
```

### 与 task_plan 的完成门禁协同

task_plan 中每个步骤有自己的门禁，verification 在整体层面汇总：

```
task_plan 步骤门禁（步骤级）
    │
    ├── 步骤 1 门禁全部通过 ✅
    ├── 步骤 2 门禁全部通过 ✅
    ├── 步骤 3 门禁全部通过 ✅
    │
    └──→ verification 整体门禁（任务级）
         ├── 自动化检查
         ├── 功能门禁（跨步骤的端到端验证）
         └── 边界门禁（全局空状态、错误处理）
```

步骤门禁通过 ≠ 任务完成。跨步骤的集成问题只有在整体验证中才能发现。

---

## 与 task-planning 的衔接

当与 task-planning 配合使用时：

1. task_plan 中所有步骤标记为完成
2. 触发本技能的验证流程
3. 验证通过后，在 progress.md 中记录：

```markdown
## 2026-09-23 16:00 — 完成验证

**验证结果**：✅ 通过
- Type Check: 0 errors
- Tests: 41/41 passed
- Lint: 0 warnings
- 人工验证: 全部通过
```

---

## 项目质量基线

参考 `YiKnowledge/projects/INDEX.md` 中记录的项目质量门禁：

| 项目 | Type Check | Tests | 状态 |
|------|-----------|-------|------|
| YiVad | 0 errors | 41/41 | ✅ |
| YiAi | — | 144/144 | ✅ |
| YiPet | 0 errors | — | ✅ |

修改后不应降低这些基线。

---

## 命令

| 命令 | 操作 |
|------|------|
| 「验证」「检查一下」 | 执行完整验证流程 |
| 「快速检查」 | 只跑自动化检查，跳过人工清单 |
| 「人工验证」 | 只过人工验证清单 |
| 「通过」「确认完成」 | 生成验证报告，标记完成 |

## 原则

- **自动化优先。** 能机器检查的不要让人类检查。
- **不跳过自动化。** 即使「只改了一行」，也要跑类型检查和相关测试。
- **验收标准驱动。** 人工验证以 PRD/Issue 的验收标准为依据，不凭空想象。
- **记录遗留问题。** 已知但决定不修复的问题要明确记录——这不是「遗漏」，而是「有意的取舍」。
- **失败不丢脸。** 验证发现问题是好事——在合并前发现比在合并后发现好得多。

## 参考文件

- `references/verification-checklist-full.md` — 按项目分类的完整验证检查清单
- `../code-review/SKILL.md` — 代码审查技能（验证前的上游质量检查）
- `../test-driven-development/SKILL.md` — TDD 技能（测试用例是完成门禁的核心组成）
- `../task-planning/SKILL.md` — 任务规划技能（完成门禁与步骤门禁协同）
- `../../YiKnowledge/projects/INDEX.md` — 项目质量门禁基线
- `../finishing-a-development-branch/SKILL.md` — 开发分支收尾（验证通过后的下一步：提交、文档更新、PR）
- `../shared/glossary.md` — 技能共享术语表（确保跨技能语言一致）