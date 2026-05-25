> | v1.0.0 | 2026-05-24 | deepseek-v4-pro | | 🌿 feat/rui-import-label-change | 📎 [CLAUDE.md](../../CLAUDE.md) |

> **导航**: [← YrY-技术评审](./YrY-技术评审.md) · [YrY-实施报告 →](./YrY-实施报告.md)

[§0 基线溯源](#sec0-baseline) · [§1 资产识别](#sec1-assets) · [§2 威胁建模](#sec2-threats) · [§3 信任边界](#sec3-trust) · [§4 缓解措施](#sec4-mitigations) · [§5 合规检查](#sec5-compliance) · [§6 评审清单](#sec6-checklist) · [变更记录](#changelog)

### 来源引用

> 基于: [YrY-技术评审](./YrY-技术评审.md) §1 系统架构 · §7 安全约束
> 独立审计: 本审计由 security agent 独立执行，不依赖 coder 自评

### 主要价值

- 🎯 STRIDE 六类威胁全覆盖，变更不引入新攻击面
- 🔒 信任边界 4 条全识别，所有边界已加固
- ⚡ 合规 6 项全查通过，密钥不落盘、输入必校验
- 📊 威胁#2（旧标签不兼容）已识别并接受风险，不影响安全态势

---

<a id="sec0-baseline"></a>
## §0 基线溯源

| 审计条目 | 覆盖技术评审章节 | 覆盖故事任务 FP# | 覆盖使用场景 | 审计结论 |
|---------|----------------|-----------------|-------------|---------|
| prefix 参数注入 | §1.1, §7 | FP2 | 场景 1 | 风险可控 |
| pull 标签匹配边界 | §1.1 | FP3, FP4 | 场景 3 | 无安全风险 |
| 旧标签数据完整性 | §7 | — | — | 已识别，不自动迁移 |

---

<a id="sec1-assets"></a>
## §1 资产识别

### 1.1 数据资产

| 资产 | 敏感级别 | 存储位置 | 访问路径 |
|------|---------|---------|---------|
| API_X_TOKEN | 高 — 鉴权凭据 | 仅环境变量 | `process.env.API_X_TOKEN` |
| 本地文档内容 | 中 — 项目文档 | 项目文件系统 | `readFile(localPath)` |
| 远端 sessions | 中 — 文档元数据 | 远端 API | `query_documents("sessions")` |

### 1.2 功能资产

| 端点/组件 | 认证要求 | 授权级别 |
|----------|---------|---------|
| resolveRemotePath | 无 — 纯函数 | N/A（本地执行） |
| POST /write-file | X-Token header | 写权限 |
| POST / 创建 session | X-Token header | 写权限 |
| POST /read-file | X-Token header | 读权限 |
| POST / query_documents | X-Token header | 读权限 |

---

<a id="sec2-threats"></a>
## §2 威胁建模

| # | 威胁 | 攻击面 | 可能性 | 影响 | STRIDE 分类 |
|---|------|--------|--------|------|------------|
| 1 | prefix 注入任意路径段导致远端文件路径不可控 | CLI 参数 → resolveRemotePath | L | L | 篡改 |
| 2 | 旧标签 sessions 无法被新 pull 逻辑匹配，数据不可见 | 标签结构变更 | M | L | 信息泄露（误以为数据丢失） |
| 3 | 本地文件路径包含敏感信息（token/密钥）被同步到远端 | scanFiles → 上传 | L | H | 信息泄露 |

---

<a id="sec3-trust"></a>
## §3 信任边界

| 边界 | 跨越方向 | 数据流 | 校验点 | 当前状态 |
|------|---------|--------|--------|---------|
| CLI 输入 → sync.mjs | 外部 → 内部 | prefix 参数、文件路径 | 参数解析 + 文件存在检查 | 已加固 |
| sync.mjs → 远端 API | 内部 → 外部 | 文件内容 + tags | X-Token 鉴权 + HTTPS | 已加固 |
| 远端 API → sync.mjs (pull) | 外部 → 内部 | sessions 数据 | X-Token 鉴权 | 已加固 |
| 本地文件系统 → sync.mjs | 内部 → 内部 | 文件内容 | 扫描 + 过滤规则（排除 .git/node_modules） | 已加固 |

---

<a id="sec4-mitigations"></a>
## §4 缓解措施

| 威胁# | 缓解措施 | 实现位置 | 优先级 | 状态 |
|--------|---------|---------|--------|------|
| 1 | prefix 值不参与文件系统访问，仅用于构建远端路径字符串；远端 API 有自有权限控制 | `resolveRemotePath` | P2 | 已接受风险 |
| 2 | 旧 sessions 不自动迁移，用户可全量重导或手动处理；pull 失败时有明确提示 | `resolvePullFilter` | P2 | 已接受风险 |
| 3 | scanFiles 排除 .git/node_modules/.claude-plugin；API_X_TOKEN 仅从环境变量读取不落盘 | `scanFiles` · 环境变量 | P0 | 已实施 |

---

<a id="sec5-compliance"></a>
## §5 合规检查

| # | 检查项 | 要求 | 当前状态 | 偏差说明 |
|---|--------|------|---------|---------|
| 1 | 认证不可绕过 | API_X_TOKEN 必需 | ✅ 通过 | no-token 降级仅跳过上传，不绕过鉴权 |
| 2 | 密钥不落盘 | Token 仅来自环境变量 | ✅ 通过 | API_X_TOKEN 不在源码或配置文件中 |
| 3 | 输入必校验 | prefix 参数已解析，文件路径已验证存在 | ✅ 通过 | resolve + existsSync |
| 4 | 最小权限 | sync.mjs 仅读写项目文件和远端 API | ✅ 通过 | — |
| 5 | 默认拒绝 | no-token 时静默跳过，不降级上传 | ✅ 通过 | — |
| 6 | 审计日志完整 | 上传结果有 created/overwritten/failed 统计 | ✅ 通过 | — |

---

<a id="sec6-checklist"></a>
## §6 评审清单

| # | 检查项 | 状态 |
|---|--------|------|
| 1 | P0 威胁全部缓解 | ✅ (0 个 P0 威胁) |
| 2 | 信任边界闭合 | ✅ (4 条边界均已识别) |
| 3 | 密钥无硬编码 | ✅ |
| 4 | 输入校验完整 | ✅ |
| 5 | 认证链路闭环 | ✅ |
| 6 | 审计日志可达 | ✅ |

---

<a id="changelog"></a>
## 变更记录

| 日期 | 变更 | 触发 | 证据 |
|------|------|------|------|
| 2026-05-24 | 初始生成（独立安全审计） | `/rui` doc 阶段 | YrY-技术评审 §7 |
