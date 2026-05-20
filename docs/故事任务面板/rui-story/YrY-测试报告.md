> | v1.0 | 2026-05-20 | claude-opus-4-7 | 自基线测试报告提取 YrY 维度 |

> **导航**: [← YrY-测试设计](./YrY-测试设计.md) · [YrY-安全审计 →](./YrY-安全审计.md)

> **来源引用**: 基于 [YrY-测试设计](./YrY-测试设计.md) 和 [YrY-实施报告](./YrY-实施报告.md)。证据等级 B。

---

## §0 基线溯源

| 产品 AC# | 产品场景 | 测试用例# | CLI 结果 | 覆盖闭合? |
|--------|--------|---------|---------|----------|
| AC1 | 场景 1 — 查看整体进度 | TC-CLI-N1 | 通过 | |
| AC2 | 场景 1 — 空面板 | TC-CLI-B1 | 通过 | |
| AC3 | 场景 2 — 浏览详情 | TC-CLI-N2 | 通过 | |
| AC4 | 场景 3 — 单故事详情 | TC-CLI-N3 | 通过 | |
| AC5 | 场景 3 — 不存在/格式错误 | TC-CLI-E1, TC-CLI-E2 | 通过 | |
| AC6 | 场景 4 — 文档同步 | TC-CLI-N4 | 通过 | |
| AC7 | 场景 4 — 同步推荐 | TC-CLI-N5 | 通过 | |
| AC8 | 场景 5 — 帮助信息 | TC-CLI-N6 | 通过 | |

---

## §1 测试环境

| 维度 | CLI 技能测试 |
|------|-------------|
| 运行环境 | Claude Code CLI + Node.js |
| 部署方式 | `/rui-story` slash command |
| 测试目标 | rui-story skill |
| 数据状态 | 远端 API sessions 集合 |
| 环境快照 | main 分支 commit cfb438b |

---

## §2 CLI 冒烟

### 2.1 执行结果

| ID | Given | When | Then | 结果 |
|----|-------|------|------|------|
| TC-CLI-N1 | 远端存在 rui-story 目录含文件 | `/rui-story` | 状态统计显示 code_done=1 | |
| TC-CLI-N2 | 无阻断故事 | `/rui-story` | blocked 计数=0 | |
| TC-CLI-N3 | 仅 rui-story 一个故事 | `/rui-story` | 合计=1 | |
| TC-CLI-N4 | 远端存在故事 | `/rui-story list` | 六列表格 | |
| TC-CLI-N5 | rui-story 无关联分支 | `/rui-story list` | Branch 列显示 — | |
| TC-CLI-N6 | rui-story 目录存在 | `/rui-story show rui-story` | 详述卡含文件清单 | |
| TC-CLI-N7 | 指定 rui-story | `/rui-story sync rui-story` | 委托 import-docs 执行 | |
| TC-CLI-N8 | 不指定名称 | `/rui-story sync` | 展示推荐列表 | |
| TC-CLI-N9 | 用户查看帮助 | `/rui-story --help` | 完整帮助文本 | |

### 2.2 实际命令输出

#### /rui-story -- 状态概览

```
故事任务面板 · 状态概览
─────────────────────────────
  code_done          1
  code_in_progress   0
  docs_done          0
  docs_in_progress   0
  not_started        0
  blocked            0
─────────────────────────────
  合计               1 个故事

最近活动：rui-story (2026-05-18)
```

#### /rui-story list -- 进度全景

```
Story        | Status       | Files | Last Modified     | Type | Branch
rui-story    | code_done    | 11    | 2026-05-18 17:53  | meta | —
```

#### /rui-story show rui-story -- 单故事详情

```
rui-story · code_done

📂 远端路径: 故事任务面板/rui-story/
📋 类型: meta
📄 文件: 11 个

  文件清单:
  YiAi-01-故事任务.md          2026-05-18 17:53
  ...

📊 元数据:
  状态: code_done
  阻断原因: —
```

#### /rui-story --help -- 帮助信息

```
# rui-story — 故事任务面板管理
远端查询 · 查看 · 同步 | 数据源为远端 API，不读本地文件系统
...
```

| 命令 | 验证结果 |
|------|---------|
| /rui-story | 通过 |
| /rui-story list | 通过 |
| /rui-story show rui-story | 通过 |
| /rui-story sync | 通过 |
| /rui-story --help | 通过 |

### 2.3 汇总

| 指标 | 值 |
|------|-----|
| 总用例 | 9 |
| 通过 | 9 |
| 失败 | 0 |
| 跳过 | 0 |
| P0 通过率 | 100% (5/5) |
| P1 通过率 | 100% (4/4) |

---

## §3 回归

| ID | Given | When | Then | 结果 | 关联模块 |
|----|-------|------|------|------|---------|
| TC-R1 | overview 已通过 | 修改状态判定逻辑后重跑 `/rui-story` | 状态计数仍正确 | | 六状态判定逻辑 |
| TC-R2 | list 已通过 | 修改目录扫描逻辑后重跑 `/rui-story list` | 表格字段和排序仍正确 | | 远端数据查询 |
| TC-R3 | show 已通过 | 修改详述卡输出格式后重跑 | 文件清单/状态/类型/元数据仍完整 | | 详述卡格式化 |
| TC-R4 | sync 已通过 | 修改委托调用逻辑后重跑 | 推荐列表和同步结果仍正确 | | import-docs 委托 |

---

## §4 环境专项

| ID | 场景 | Given | When | Then | 结果 |
|----|------|-------|------|------|------|
| TC-X1 | 网络不可用 | 远端 API 不可达 | `/rui-story sync` | 错误透传，提示网络问题 | |
| TC-X2 | 无 API_X_TOKEN | 环境变量未设置 | `/rui-story` | 降级提示"请设置 API_X_TOKEN" | |
| TC-X3 | 名称注入 | name 参数 `../etc/passwd` | `/rui-story show <name>` | kebab-case 正则拒绝 | |
| TC-X4 | 非标准文件 | 目录含非 .md 文件 | `/rui-story` | 状态判定不受干扰 | |

---

## §5 已知问题

无已知问题。

---

## §6 Gate B 评估

| 指标 | CLI 技能 | 结果 |
|------|---------|------|
| P0 全部通过 | 100% (5/5) | |
| P1 高通过率 (>=80%) | 100% (4/4) | |
| P0 已知清零 | 0 | |
| 修复轮次 <= 2 | 1 轮 | |

---

## §7 评审清单

| # | 检查项 | 状态 |
|---|--------|------|
| 1 | Gate B 指标全部达标 | |
| 2 | 冒烟+回归+专项闭合 | |
| 3 | 已知问题有跟踪 | |
| 4 | 环境快照可复现 | |
| 5 | CLI 维度基线溯源闭合 | |
| 6 | 实际命令输出已包含 | |

---

## 变更记录

| 日期 | 变更 | 触发 | 证据 |
|------|------|------|------|
| 2026-05-20 | v1.0 初始生成 — 自基线测试报告提取 YrY CLI 维度 | YrY 角色化文档拆分 | 基线 [测试-测试报告.md](./测试-测试报告.md) §3 CLI 冒烟结果 |
