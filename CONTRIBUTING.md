# 贡献指南

> YrY — 故事驱动的 SDLC 编排系统（Claude Code 插件）
> 本文件是工程化建设的入口：开发环境、测试、CI、发布流程

## 开发环境

### 前置

- Node.js ≥ 18（见 `.nvmrc`）
- npm
- git

### 克隆与安装

```bash
git clone <repo-url>
cd YrY
nvm use              # 自动切换到 .nvmrc 指定的 Node 18
npm ci               # 安装 devDependencies（vitest + @vitest/ui + @vitest/coverage-v8）
```

> **注**：lint / typecheck / format 三类工具链（`eslint` / `typescript` / `@types/node` / `prettier`）暂未入 devDependencies。CI 用 `npx` 临时下载，本地开发者可执行 `npm install -D eslint typescript @types/node prettier` 补齐（会改 `package-lock.json`，未入仓前请勿 commit）。

### 项目结构速览

```
YrY/
├── skills/          # 20 个 Claude Code 技能（每个含 SKILL.md + rules + tests）
├── lib/             # 20 个共享库模块（消除 copy-paste）
│   └── tests/       # lib 单元测试
├── lib/arch-check.mjs    # 架构合规自动验证（10 维度 A 级）
├── lib/loop/             # 自循环报告系统（dispatcher + registry）
├── .github/workflows/ci.yml   # CI（lint + typecheck + test + arch-check）
├── .github/dependabot.yml    # 自动化依赖更新（每周一检查 npm devDeps）
├── .github/PULL_REQUEST_TEMPLATE.md  # PR 模板
├── .claude/hooks/commit-guard.mjs   # Commit 前置钩子
├── docs/            # 生成的报告（健康/趋势/故事任务面板等）
├── .memory/         # 执行记忆 + 趋势持久化（health-trend.jsonl 等）
├── CLAUDE.md        # 项目规约（铁律 + 画像 + 约束）
├── CHANGELOG.md     # 版本演进
├── CONTRIBUTING.md  # 本文件 — 工程化入口
├── LICENSE          # MIT
├── Makefile         # 统一开发者命令入口（等价 npm scripts）
├── eslint.config.mjs  # ESLint flat config
├── vitest.config.mjs  # 测试配置
├── tsconfig.json      # TypeScript checkJs 配置
└── types/node-shim.d.ts  # Node 类型 shim（临时替代 @types/node）
```

## 常用命令

```bash
# 测试
npm test                 # vitest run（lib/ + skills/ 测试）
npm run test:watch       # 监听模式
npm run test:ui          # Vitest UI
npm run test:coverage    # 覆盖率报告（coverage/）
npm run test:coverage:check  # 覆盖率 + 阈值强制（lines 8% / stmts 8% / funcs 10% / branches 10%）

# Lint / 格式化
npm run lint             # eslint lib/
npm run lint:skills      # eslint skills/
npm run lint:all         # eslint lib/ skills/ --max-warnings 0（CI 等价）
npm run lint:fix         # eslint lib/ --fix
npm run format           # prettier --write
npm run format:check     # prettier --check
# CI 用 `npx eslint lib/ skills/ --max-warnings 0`（lib/ + skills/ 全量 0 errors + 0 warnings）

# 类型检查
npm run typecheck        # tsc --noEmit

# 架构合规
npm run arch-check       # node lib/arch-check.mjs（10 维度 A 级）
# 带 --fix / --append-trend 选项见 lib/arch-check.mjs

# 健康检查
npm run health           # node skills/rui-bot/send.mjs health

# 版本
npm run version          # 打印当前版本号
npm run bump:patch       # 发版：bump version + 拆 CHANGELOG（minor / major 同理）
```

### Makefile 入口

所有常用命令也通过 `Makefile` 暴露（`make <target>`），等价于 `npm run <script>`：

```bash
make install          # npm ci
make test             # vitest run
make lint-all         # eslint lib/ skills/ --max-warnings 0（CI 等价）
make typecheck        # tsc --noEmit
make arch-check       # node lib/arch-check.mjs
make health           # 健康检查
make ci-local         # 本地跑 CI 等价四件套：lint-all + typecheck + test + arch-check
make format           # prettier --write
make bump-patch       # 发版（minor / major 同理）
```

`make ci-local` 是 PR 前自查的快捷入口，等价于 CI 的 lint + typecheck + test + arch-check 四个 job。

## CI 流程

`.github/workflows/ci.yml` 在 push/PR 到 `main` 或 `master` 时触发 4 个 job：

| Job | 作用 | 阻断 |
|-----|------|------|
| `lint` | `npx eslint lib/ skills/ --max-warnings 0` | 是 — errors 与 warnings 均阻断（第十一轮 2026-06-25 起） |
| `typecheck` | `npx tsc --noEmit` | 是 — tsc 0 errors（第十七轮 2026-06-25 起阻断，依赖 `types/node-shim.d.ts`） |
| `test` | `npx vitest run` | 是 |
| `arch-check` | `node lib/arch-check.mjs` | 是 |

CI 优化（第十三轮 2026-06-25 加入）：

- **concurrency**：同一分支新 push 时自动取消正在跑的旧 run，省 CI 分钟
- **cache: npm**：`actions/setup-node@v4` 内置 npm 依赖缓存，`npm ci` 提速
- **dependabot**：`.github/dependabot.yml` 每周一检查 npm devDependencies，分组提 PR（vitest 组 / lint-toolchain 组）

### 当前状态（2026-06-25，第二十轮 `/loop` 后）

- `npx eslint lib/ skills/ --max-warnings 0` — exit 0（0 errors + 0 warnings，项目完全干净）
- `npx tsc --noEmit` — **0 errors**（开启 `strictNullChecks: true`，第十九-二十轮逐步清理 121 个 strictNullChecks errors 到 0）
- `npx vitest run` — 全量通过（lib 337 + skills 测试）
- coverage 阈值已强制：`vitest.config.mjs` 配 `coverage.thresholds`（lines 8% / statements 8% / functions 10% / branches 10%，基于实测基线设的保守下限）

### 已知技术债

- tsconfig.json `strict: false` + `strictNullChecks: true`（第十九-二十轮逐步清理 121 个 strictNullChecks errors 到 0，已启用）
- `types/node-shim.d.ts` 是临时替代 `@types/node` 的最小类型 shim（node:* 模块导出声明为 any）。当 `@types/node` 加入 devDependencies 后删除本文件 + tsconfig `types: ["node"]`，无业务代码改动
- lint/type 依赖未入 devDependencies：`eslint` / `typescript` / `@types/node` / `prettier` 当前靠 CI `npx` 临时下载；本地 `npm run lint` / `npm run typecheck` 需开发者手动 `npm install -D` 补齐（会改 package-lock.json，需用户决策）
- `tsconfig.json` 已删除未使用的 `#lib/*` path alias 与 `baseUrl`（全仓搜索无引用）

## 分支隔离策略

项目采用 `feat/<name>` 分支隔离：

```bash
git checkout -b feat/my-feature
# ...开发...
git push -u origin feat/my-feature
# 创建 PR 到 main/master
```

`.claude/hooks/commit-guard.mjs` 在每次 `git commit` 前执行，验证分支命名与提交规范。

## PR 流程

PR 必须填写 `.github/PULL_REQUEST_TEMPLATE.md`，关键勾选：

- [ ] `npx eslint lib/ skills/ --max-warnings 0` 通过（0 errors + 0 warnings）
- [ ] `npx vitest run` 通过（0 failures）
- [ ] `node lib/arch-check.mjs` 通过（A 级）
- [ ] `node skills/rui-bot/send.mjs health` 无回归
- [ ] Gate A 测试设计完成（如代码变更）
- [ ] 影响链闭合（二次 grep 完成）
- [ ] 分支隔离验证（`git branch --show-current` = `feat/<name>`）
- [ ] 无硬编码 secrets/tokens
- [ ] CHANGELOG 条目已添加（如触及用户可见行为）

## 铁律（不可妥协）

摘自 `CLAUDE.md`：

1. **验先于称** — 未运行验证命令不得声称完成/通过/修复
2. **溯先于修** — 未找到根因不得提出修复方案
3. **清先于进** — 模块 P0 未清零不得进入下一模块
4. **表达优先** — 文档必须 图 → 结构化文本 → 表，不可降级

## 版本管理

- 版本号语义：`MAJOR.MINOR.PATCH`（重大架构变更.功能演进.修复）
- 当前版本：见 `package.json` `version` 字段
- 版本演进记录在 `CHANGELOG.md`
- 发版流程（`scripts/bump-version.mjs` 已就位，不碰 git，用户手动 commit + tag）：
  1. `npm run bump:patch`（或 `minor` / `major`）— 自动改 `package.json` version + 拆分 `CHANGELOG.md` `[Unreleased]` → `[<version>]`
  2. 检查 `git diff`，确认 `package.json` 与 `CHANGELOG.md` 改动符合预期
  3. `git add -A && git commit -m "release v<version>"`
  4. `git tag v<version>`
  5. `git push --tags && git push`

## 自托管一致性

YrY 用自身管线管理自身演进：

- 自身演进走 `/rui` 管线，不得绕过
- 自身 `.claude/` 配置通过 `/rui-claude` 管理
- 技能规约修改后必须重跑 init 验证
- 跨文件共享代码放 `lib/`，禁止 copy-paste

## 相关文档

- [CLAUDE.md](./CLAUDE.md) — 项目规约（基础信念 + 铁律 + 画像 + 约束）
- [CHANGELOG.md](./CHANGELOG.md) — 版本演进
- [README.md](./README.md) — 项目说明 + 领域语言
- [故障排查手册](./docs/故障排查手册.md) — 常见问题
- [工程化手册](./docs/工程化手册/README.md) — 工程化深度展开（类型系统 / CI/CD / 测试体系 / Lint 链）
