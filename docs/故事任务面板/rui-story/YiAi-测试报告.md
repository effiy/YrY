> | v1.0 | 2026-05-20 | claude-opus-4-7 | 自基线测试报告提取 YiAi 维度 |

> **导航**: [← YiAi-测试设计](./YiAi-测试设计.md) · [YiAi-安全审计 →](./YiAi-安全审计.md)

> **来源引用**: 基于 YiAi-测试设计和 YiAi-实施报告，从基线 [测试-测试报告.md](./测试-测试报告.md) 提取 HTTP API 维度内容。证据等级 B。

---

## §0 基线溯源

| 产品 AC# | 产品场景 | 测试用例# | HTTP API 结果 | 覆盖闭合? |
|--------|--------|---------|-------------|----------|
| AC1 | 场景 1 — 查看整体进度 | TC-API-N1 | 通过 | |
| AC2 | 场景 1 — 空面板 | TC-API-B1 | 通过 | |
| AC3 | 场景 2 — 浏览详情 | TC-API-N2 | 通过 | |
| AC4 | 场景 3 — 单故事详情 | TC-API-N3 | 通过 | |
| AC5 | 场景 3 — 不存在/格式错误 | TC-API-E1 | 通过 | |
| AC6 | 场景 4 — 文档同步 | TC-API-N4 | 通过 | |
| AC7 | 场景 4 — 同步推荐 | TC-API-B3 | 通过 | |
| AC8 | 场景 5 — 帮助信息 | TC-API-N5 | 通过 | |

---

## §1 测试环境

| 维度 | HTTP API 测试 |
|------|-------------|
| 运行环境 | Python 3.10.12, FastAPI, uvicorn |
| 部署方式 | `python3 main.py` |
| 测试目标 | `http://localhost:10086` |
| 数据状态 | 空面板（或含测试故事目录） |
| 认证方式 | X-Token 请求头（从环境变量 API_X_TOKEN 读取） |
| 环境快照 | commit 7d4c66d (HEAD) |

---

## §2 HTTP API 冒烟

### 2.1 执行结果

| ID | Given | When | Then | 结果 |
|----|-------|------|------|------|
| TC-API-N1 | 空面板 | GET `/api/story-panel/overview` | summary total=0, recent=[] | |
| TC-API-N2 | 空面板 | GET `/api/story-panel/stories` | stories=[] | |
| TC-API-N3 | 不存在的故事 | GET `/api/story-panel/stories/test-story` | code=1004 + 消息 | |
| TC-API-N4 | API_X_TOKEN 设置 | POST sync `{"names":["test-story"]}` | synced=true, written=0 | |
| TC-API-B1 | 空面板 | GET `/api/story-panel/overview` | 不报错 | |
| TC-API-B3 | 不传 name | POST sync body `{}` | recommendations=[] | |
| TC-API-E1 | 不存在 | GET `/api/story-panel/stories/X-nonexistent` | code=1004 | |
| TC-API-E2 | 不存在 | POST sync `{"names":["nonexist"]}` | results[0].reason="远端无此故事" | |
| TC-API-E3 | 无效格式 | POST sync `{"names":["Invalid"]}` | synced=false + reason (kebab-case) | |

### 2.2 汇总

| 指标 | 值 |
|------|-----|
| 总用例 | 9 |
| 通过 | 9 |
| 失败 | 0 |
| 跳过 | 0 |
| P0 通过率 | 100% (6/6) |
| P1 通过率 | 100% (3/3) |

---

## §3 回归

| ID | Given | When | Then | 结果 | 关联模块 |
|----|-------|------|------|------|---------|
| TC-API-R1 | overview 已通过 | 验证 `_determine_status` 覆盖 6 状态分支 | 各状态返回正确枚举值 | | story_panel.py |
| TC-API-R2 | list 已通过 | 验证 `_list_story_dirs` 空目录处理 | 返回空数组不报错 | | story_panel.py |
| TC-API-R3 | 目录下添加文档基线（01→02→05→06→08） | 每次添加后执行查询 | 状态正确流转: not_started → docs_in_progress → docs_done → code_in_progress → code_done | | 六状态判定逻辑 |

---

## §4 环境专项

| ID | 场景 | Given | When | Then | 结果 |
|----|------|-------|------|------|------|
| TC-X1 | 路径遍历 | name=`../etc/passwd` | GET | code=1002 拒绝 (kebab-case 校验) | |
| TC-X2 | 无 Token | 不带 X-Token | GET /overview | code=1009 Unauthorized | |
| TC-X3 | 子进程超时 | sync 超过 60s | POST /sync | synced=false + 超时原因 | |
| TC-X4 | 非标准文件 | 目录含非 .md 文件 | GET 查询 | 状态判定不受干扰，仅列出 .md | |

---

## §5 已知问题

无已知问题。

---

## §6 Gate B 评估

| 指标 | HTTP API | 结果 |
|------|---------|------|
| P0 全部通过 | 100% (6/6) | |
| P1 高通过率 (>=80%) | 100% (3/3) | |
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
| 5 | HTTP API 维度基线溯源闭合 | |

---

## 变更记录

| 日期 | 变更 | 触发 | 证据 |
|------|------|------|------|
| 2026-05-20 | v1.0 初始创建 — 自基线测试报告提取 YiAi (HTTP API) 维度 | 按角色拆分 · YiAi 独立文档 | 基线 测试-测试报告.md §2 HTTP API 冒烟 |
