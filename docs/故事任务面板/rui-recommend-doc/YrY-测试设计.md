> | v1.0.0 | 2026-05-22 | deepseek-v4-pro | ⏱️ — | 📎 [CLAUDE.md](../../../CLAUDE.md) |

> **导航**: [← YrY-技术评审](./YrY-技术评审.md) · [→ YrY-实施报告](./YrY-实施报告.md)

# YrY-测试设计 · rui-recommend

## §0 基线溯源

| AC# | 来源 | 测试覆盖 |
|-----|------|---------|
| AC1 | 故事任务 §5 | §2.1 扫描完整性 |
| AC2 | 故事任务 §5 | §2.2 安全信号 |
| AC3 | 故事任务 §5 | §2.3 依赖分析 |

### 主要价值

- 🎯 验证扫描管线：项目类型检测→文件扫描→指标采集→合并输出
- 🔗 依赖图正确性：importedBy 映射准确性
- 🛡️ 安全信号覆盖：hasUserInput/hasAuth/hasApiCall 布尔准确性

---

## §2 测试用例

### §2.1 扫描管线

| UC# | Given | When | Then | 类型 | 关联 AC |
|-----|-------|------|------|------|---------|
| UC-SCAN-01 | 项目根有 17 个 .mjs 文件 | 执行 `--root=. --format=json` | 输出 17 个候选，每个含完整 metrics/git/doc/security | 正常 | AC1 |
| UC-SCAN-02 | 项目根无源文件 | 执行扫描 | 输出空数组 `[]` | 边界 | AC1 |
| UC-SCAN-03 | 项目无 package.json | 执行扫描 | type=unknown，扫描全部扩展名 | 边界 | AC1 |
| UC-SCAN-04 | 指定 `--type=frontend` | 执行扫描 | 仅 .vue/.jsx/.tsx/.svelte 出现在结果中 | 正常 | AC1 |

### §2.2 安全信号

| UC# | Given | When | Then | 类型 | 关联 AC |
|-----|-------|------|------|------|---------|
| UC-SEC-01 | 文件含 `API_X_TOKEN` 和 `fetch(` | 扫描该文件 | hasAuth=true, hasApiCall=true | 正常 | AC2 |
| UC-SEC-02 | 文件含 `req.body` | 扫描该文件 | hasUserInput=true | 正常 | AC2 |
| UC-SEC-03 | 文件无安全关键词 | 扫描该文件 | 三个布尔均为 false | 边界 | AC2 |

### §2.3 依赖分析

| UC# | Given | When | Then | 类型 | 关联 AC |
|-----|-------|------|------|------|---------|
| UC-DEP-01 | 文件 A 被 B/C/D 导入 | 构建依赖图 | A.importedByCount=3, 角色=Hub | 正常 | AC3 |
| UC-DEP-02 | 文件未被任何文件导入 | 构建依赖图 | importedByCount=0, 角色=Leaf | 边界 | AC3 |

### §2.4 文档覆盖

| UC# | Given | When | Then | 类型 |
|-----|-------|------|------|------|
| UC-DOC-01 | 故事目录不存在 | 检查文档 | doc.status="no_docs", exists=false | 正常 |
| UC-DOC-02 | 故事目录有 5+ 文档 | 检查文档 | doc.status="complete" | 正常 |

---

## §3 Gate A 交接信号

| 信号 | 值 |
|------|-----|
| P0 用例数 | 4 (UC-SCAN-01/03, UC-SEC-01, UC-DEP-01) |
| 验证命令 | `node skills/rui/recommend.mjs --root=. --format=json \| node -e "process.exit(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).length>0?0:1)"` |
| 阻塞条件 | JSON 输出无效或候选数为 0 且项目有源文件 |

---

> | 日期 | 变更 | 触发 | 证据 |
> |------|------|------|------|
> | 2026-05-22 | 初始生成 | /rui doc --from-code rui-recommend-doc | skills/rui/recommend.mjs |
