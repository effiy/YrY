# YrY 测试体系

> 自包含测试框架，零外部依赖。10 个测试文件覆盖 7 技能 + 9 Agent + 10 规则 + 2 集成检查。

## 快速开始

```bash
# 运行全部测试
node tests/run.mjs

# 按分类运行
node tests/run.mjs --skills       # 仅 7 个技能测试
node tests/run.mjs --agents       # 仅 Agent 定义测试
node tests/run.mjs --rules        # 仅规则定义测试
node tests/run.mjs --integration  # 仅集成测试

# 运行单个测试文件
node tests/skills/rui.test.mjs
node tests/skills/rui-claude.test.mjs
node tests/integration/cross-references.test.mjs
```

## 目录结构

```
tests/
├── run.mjs                          # 测试运行器：发现 + 运行 + 结果收集
├── manifest.json                    # 测试清单（自动生成）
├── results.json                     # 测试结果（自动生成）
├── index.html                       # 交互式测试仪表板
├── README.md                        # 本文件
├── lib/
│   ├── test-harness.mjs             # 自包含测试框架（describe/it/assert/run）
│   └── helpers.mjs                  # 通用辅助函数（fileExists/readFile/hasSection 等）
├── skills/
│   ├── rui.test.mjs                 # rui 主线编排器（10 用例）
│   ├── rui-bot.test.mjs             # rui-bot 企微通知（4 用例）
│   ├── rui-claude.test.mjs          # rui-claude 配置管理（19 用例）
│   ├── rui-import.test.mjs          # rui-import 文档同步（6 用例）
│   ├── rui-npm.test.mjs             # rui-npm 包管理（68+ 用例）
│   ├── rui-story.test.mjs           # rui-story 面板管理（6 用例）
│   └── rui-trends.test.mjs          # rui-trends 趋势分析（19 用例）
├── agents/
│   └── agents.test.mjs              # 9 Agent 定义完整性（12 用例）
├── rules/
│   └── rules.test.mjs               # 10 规则定义完整性（16 用例）
└── integration/
    ├── cross-references.test.mjs    # 跨模块交叉引用一致性（14 用例）
    └── knowledge-graph.test.mjs     # 知识图谱结构验证（8 用例）
```

## 测试框架

### test-harness.mjs

自包含的轻量级测试框架，无需 npm 安装。提供：

- `describe(name, fn)` — 测试组
- `it(name, fn)` — 单个测试
- `assert.ok(condition, msg)` — 断言通过
- `assert.equal(a, b, msg)` — 断言相等
- `run()` — 运行全部测试并打印报告

### helpers.mjs

通用测试辅助函数：

- `fileExists(path)` — 检查文件存在
- `readFile(path)` — 读取文件内容
- `hasSection(content, heading)` — 检查是否有指定标题
- `hasMermaidDiagram(content)` — 检查是否含 mermaid 图

## 测试覆盖矩阵

| 被测对象 | 测试文件 | 用例数 | 覆盖维度 |
|---------|---------|--------|---------|
| rui | skills/rui.test.mjs | 10 | SKILL.md · help.mjs · 命令路由 · 文档完整性 |
| rui-bot | skills/rui-bot.test.mjs | 4 | SKILL.md · help.mjs · send.mjs |
| rui-claude | skills/rui-claude.test.mjs | 19 | SKILL.md · help.mjs · 可执行文件 · 交叉引用 |
| rui-import | skills/rui-import.test.mjs | 6 | SKILL.md · help.mjs · sync.mjs |
| rui-npm | skills/rui-npm.test.mjs | 68+ | SKILL.md · help.mjs · 8 子命令 · 场景文档 · 测试面板 |
| rui-story | skills/rui-story.test.mjs | 6 | SKILL.md · help.mjs · rui-story.mjs |
| rui-trends | skills/rui-trends.test.mjs | 19 | SKILL.md · help.mjs · 7 子命令 · 交叉引用 |
| 9 Agent | agents/agents.test.mjs | 12 | 定义完整性 · 契约字段 · 角色职责 |
| 10 规则 | rules/rules.test.mjs | 16 | 定义完整性 · 约束字段 · 适用范围 |
| 交叉引用 | integration/cross-references.test.mjs | 14 | 模块引用一致性 · 安全基线 · 文档同步 |
| 知识图谱 | integration/knowledge-graph.test.mjs | 8 | JSON 结构 · 节点完整性 · 边一致性 |

## 约定

1. **每个测试文件自包含** — 可独立 `node tests/skills/rui.test.mjs` 执行
2. **零外部依赖** — 仅使用 Node.js 内置模块 + `test-harness.mjs`
3. **描述式断言** — 每个 `assert.ok` 有描述信息
4. **exit code 传播** — 失败时 `process.exit(1)`，CI 可检测
5. **测试先行** — 新功能必须先写测试设计（TC#）再实现（Gate A 门禁）
