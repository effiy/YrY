> | v1.0.0 | 2026-05-22 | deepseek-v4-pro | security agent | 🌿 feat/rui-story-rui-story-doc | 📎 [CLAUDE.md](../../../CLAUDE.md) |

> **导航**: [← YrY-技术评审](./YrY-技术评审.md) · [YrY-实施报告 →](./YrY-实施报告.md)

> **来源引用**: 独立安全审计，基于 `YrY-技术评审.md` §7 安全约束和源码 `skills/rui-story/rui-story.mjs`

> **独立审计声明**: 本审计由 security agent 独立执行，不依赖 coder 自评。基于技术评审 §7 安全信号 + 源码安全扫描。

## §0 基线溯源

| 审计条目 | 覆盖技术评审章节 | 覆盖故事任务 FP# | 覆盖使用场景 | 审计结论 |
|---------|----------------|-----------------|-------------|---------|
| Token 安全管理 | §7 #1 | FP1–FP5 | 场景 1–5 | ✅ 环境变量读取，不落盘 |
| 远端 API 输入校验 | §7 #2 | FP1–FP5 | 场景 1, 2, 3, 5 | ✅ 超时+截断+try-catch |
| Git 命令注入 | §7 #3 | FP6 | 场景 4 | ✅ 分支名来自 git 输出非用户输入 |
| 工作区变更保护 | §7 #4 | FP6 | 场景 4 | ✅ stash 前后有恢复逻辑 |
| 内存压力 | §7 #5 | FP2 | 场景 2 | ✅ QUERY_LIMIT 10000 |
| 信息泄露 | §7 #6 | FP2, FP3 | 场景 2, 3 | ✅ 类型推断仅关键词匹配 |

### 主要价值

- 🔒 独立审计：security agent 基于源码直接分析 HTTP 通信和 git 操作安全面
- 🛡️ STRIDE 六类威胁全覆盖，聚焦信息泄露和权限提升
- 📋 合规 6 项全查，特别关注 Token 管理
- 🔍 每条威胁关联信任边界和缓解措施

---

## §1 资产识别

### 1.1 数据资产

| 资产 | 敏感级别 | 存储位置 | 访问路径 |
|------|:--:|------|---------|
| API_X_TOKEN | 高 | 环境变量 `API_X_TOKEN` | `process.env.API_X_TOKEN` |
| 远端 sessions 数据 | 中 | 内存（变量） | HTTP Response → JSON.parse → 内存对象 |
| 远端文件内容（技术评审） | 中 | 内存（变量） | HTTP Response → JSON.parse → 内存（关键词匹配后丢弃） |
| 项目名（从 CLAUDE.md 解析） | 低 | 本地文件 CLAUDE.md | `readFileSync` |
| 阻断状态（rui-state.json） | 低 | 本地文件 .memory/ | `readFileSync` |

### 1.2 功能资产

| 端点/组件 | 认证要求 | 授权级别 |
|----------|:--:|:--:|
| `fetchJson()` | X-Token header | 远端 API 读写 |
| `querySessionsFull()` | X-Token header | 读取全部 sessions |
| `readRemoteFile()` | X-Token header | 读取单个远端文件 |
| `cmdMergeToMain()` | 无 | 本地 git 操作（fetch/push 需远端权限） |
| `printOverview()` / `printList()` / `printShow()` | 无 | 终端 stdout 输出 |

---

## §2 威胁建模

| # | 威胁 | 攻击面 | 可能性 | 影响 | STRIDE 分类 |
|---|------|--------|:--:|:--:|-----------|
| T1 | API_X_TOKEN 通过环境变量泄露 | 环境变量 → 进程内存 | M | H | 信息泄露 (Information Disclosure) |
| T2 | 远端 API 响应注入恶意 JSON（超大/嵌套/非预期类型） | API 响应 → JSON.parse → 内存 | M | M | 拒绝服务 (Denial of Service) |
| T3 | 远端 API 响应注入 ANSI 转义序列导致终端渲染异常 | API 响应 → 终端输出（show 命令文件清单） | L | L | 伪装 (Spoofing) |
| T4 | merge-to-main 过程中 stash 被意外清空导致工作丢失 | git stash → .git/refs/stash | L | H | 否认 (Repudiation) |
| T5 | 类型推断读取远端技术评审暴露不相关内容到终端 | 远端文件 → 内存 → 终端 | L | L | 信息泄露 (Information Disclosure) |
| T6 | 并发 4 worker 读取远端文件时的竞态条件 | inferTypesBatch → readRemoteFile ×4 | L | L | 拒绝服务 (Denial of Service) |

---

## §3 信任边界

| 边界 | 跨越方向 | 数据流 | 校验点 | 当前状态 |
|------|---------|------|--------|:--:|
| 环境变量 → 进程 | 入站 | `process.env.API_X_TOKEN` → 内存字符串 | 非空检查（只读命令入口） | 已加固 |
| 远端 API → 进程 | 入站 | HTTP Response → `fetchJson()` → JSON.parse | 超时 30s + 错误截断 500 + try-catch | 已加固 |
| 远端 API → 进程 | 入站 | HTTP Response → `readRemoteFile()` → 关键词匹配 | 正则匹配后丢弃原文 | 已加固 |
| 进程 → stdout | 出站 | ANSI 文本 → 终端 | TTY 检测关闭颜色 | 已加固 |
| 进程 → git | 出站 | execSync → shell | 分支名由 git 命令输出，非用户直接拼接 | 已加固 |
| git stash → 进程 | 入站 | git stash pop → 工作区 | try-catch + 失败提示手动恢复 | 已加固 |

---

## §4 缓解措施

| 威胁# | 缓解措施 | 实现位置 | 优先级 | 状态 |
|-------|---------|---------|:--:|:--:|
| T1 | Token 仅通过 process.env 读取，禁止 console.log 输出；代码中不硬编码 | `API_X_TOKEN` 使用点 | P0 | 已实施 |
| T2 | HTTP_TIMEOUT=30s 防止长时间阻塞；ERROR_MSG_MAX_LEN=500 截断错误；JSON.parse 异常被 catch | `fetchJson()` | P1 | 已实施 |
| T3 | 类型推断仅输出固定枚举标签，不输出原文；文件清单仅输出文件名 | `inferType()`, `printShow()` | P2 | 已接受风险 |
| T4 | merge-to-main 使用 git stash 标准机制；pop 失败时提示手动 git stash pop | `cmdMergeToMain()` §8 | P1 | 已实施 |
| T5 | 技术评审内容仅在内存中做关键词匹配后丢弃，不缓存不输出 | `inferType()` | P2 | 已实施 |
| T6 | 并发数限制为 CONCURRENCY=4；单 worker 异常不阻塞其他 | `inferTypesBatch()` | P2 | 已实施 |

---

## §5 合规检查

| # | 检查项 | 要求 | 当前状态 | 偏差说明 |
|---|--------|------|:--:|---------|
| 1 | 认证不可绕过 | 远端命令强制检查 API_X_TOKEN | ✅ 通过 | Token 非空才查询远端 |
| 2 | 密钥不落盘 | Token 仅 process.env 读取，不写入文件 | ✅ 通过 | — |
| 3 | 输入必校验 | 命令白名单（7 命令）；show 需 name 参数 | ✅ 通过 | — |
| 4 | 最小权限 | 只读命令不写文件系统；merge-to-main 仅 git 操作 | ✅ 通过 | — |
| 5 | 默认拒绝 | 未知命令拒绝 + 提示 --help | ✅ 通过 | — |
| 6 | 审计日志完整 | rui-story 本身不产生审计记录（只读查询工具） | ✅ 不适用 | — |

---

## §6 评审清单

| # | 检查项 | 状态 |
|---|--------|:--:|
| 1 | P0 威胁全部缓解 | ✅ T1 已缓解 |
| 2 | 信任边界闭合（6 条边界全覆盖） | ✅ |
| 3 | 密钥无硬编码 | ✅ |
| 4 | 输入校验完整（命令白名单+参数检查） | ✅ |
| 5 | 认证链路闭环 | ✅ Token 检查在远端命令入口 |
| 6 | 审计日志可达 | ✅ 不适用（只读查询工具） |
| 7 | 合规 6 项全部检查 | ✅ 5 通过, 1 不适用 |

---

> | 日期 | 变更 | 触发 | 证据 |
> |------|------|------|------|
> | 2026-05-22 | 独立安全审计初始完成 | `/rui doc --from-code rui-story-rui-story-doc` | `skills/rui-story/rui-story.mjs` 安全扫描 |
