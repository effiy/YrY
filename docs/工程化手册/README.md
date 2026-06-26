# 工程化手册

> YrY 项目工程化建设的深度参考。CONTRIBUTING.md 是入门入口，本手册是深度展开。
> 对应 CLAUDE.md [项目约束](../../CLAUDE.md#项目约束) 中的工程化基线。

## 目录

| # | 主题 | 文档 | 一句话概括 |
|---|------|------|-----------|
| 1 | 类型系统 | [type-system.md](./type-system.md) | JSDoc + node-shim + strictNullChecks 三层渐进式类型策略 |
| 2 | CI/CD | [ci-cd.md](./ci-cd.md) | GitHub Actions 4-job 流水线 + Dependabot 依赖更新 |
| 3 | 测试体系 | [testing.md](./testing.md) | Vitest + coverage 阈值 + arch-dimensions 集成测试 |
| 4 | Lint 链 | [lint-chain.md](./lint-chain.md) | ESLint flat config + skills/lib 双区清理路径 |

## 设计原则

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b',
  'primaryTextColor': '#a9b1d6',
  'primaryBorderColor': '#3d59a1',
  'lineColor': '#3d59a1',
  'secondaryColor': '#2b2d3b',
  'tertiaryColor': '#21232f'
}}}%%
flowchart LR
    A[CONTRIBUTING.md<br/>入门入口] --> B[工程化手册<br/>深度展开]
    B --> C[代码注释<br/>单点真相]
    style A fill:#1e1f2b,stroke:#3d59a1,color:#a9b1d6
    style B fill:#2b2d3b,stroke:#3d59a1,color:#a9b1d6
    style C fill:#21232f,stroke:#3d59a1,color:#a9b1d6
```

| 层级 | 受众 | 内容深度 | 示例 |
|------|------|---------|------|
| CONTRIBUTING.md | 新贡献者 | 命令 + 配置位置 + 阻断状态 | `make ci-local` 跑什么 |
| 工程化手册 | 维护者 | 设计决策 + 演进路径 + 退出策略 | strictNullChecks 121→0 清理路径 |
| 代码注释 | 阅读者 | 单点真相 + 非显然原因 | `@type {any}` cast 为何存在 |

## 与 CLAUDE.md 的关系

- CLAUDE.md 定义铁律与底线（`禁止魔法数字`、`架构合规不可绕过`）
- 工程化手册是铁律在工具链上的具体落实（`lib/constants.mjs` 单一真相源、`lib/arch-check.mjs` 10 维度 A 级）
- 工具链是铁律的可执行代理：lint 阻断范式违规、tsc 阻断类型退化、arch-check 阻断架构越界

## 演进时间线

| 轮次 | 日期 | 关键变更 | tsc errors |
|------|------|---------|-----------|
| 1 | 2026-06-25 | ESLint flat config 迁移 + CI 修复 | — |
| 11 | 2026-06-25 | lint warnings 全量清零（lib + skills） | — |
| 14 | 2026-06-25 | LICENSE + Dependabot + CI concurrency/cache | — |
| 15 | 2026-06-25 | `types/node-shim.d.ts` 创建 | 614→108 |
| 16 | 2026-06-25 | 真实类型错误第一批清理 | 108→65 |
| 17 | 2026-06-25 | 真实类型错误全量清零 | 65→0 |
| 18 | 2026-06-25 | CI typecheck 改为阻断 | 0 |
| 19 | 2026-06-25 | strictNullChecks 探查 + 部分清理 | 121→94 |
| 20 | 2026-06-25 | **strictNullChecks 正式启用** | 94→0 |
| 22 | 2026-06-25 | noImplicitAny 首轮清理（7 小 lib 文件） | 3048→3018 |
| 23 | 2026-06-25 | noImplicitAny 第二批清理（4 中等 lib 文件） | 3018→2963 |
| 24 | 2026-06-25 | noImplicitAny 第三批清理（vitest-adapter/record） | 2963→2915 |
| 25 | 2026-06-25 | noImplicitAny 第四批清理（proposals/test-harness） | 2915→2824 |
| 26 | 2026-06-25 | noImplicitAny 第五批清理（fs 签名级联 + score-gen/recommend） | 2824→2608 |
| 27 | 2026-06-25 | noImplicitAny 第六批清理（scoring + bot-health-cmd） | 2608→2594 |
| 28 | 2026-06-25 | noImplicitAny 第七批清理（selfimprove-generator + test） | 2594→2460 |
| 29 | 2026-06-25 | noImplicitAny 第八批清理（scoring 剩余 + bot-health-cmd） | 2460→2364 |
| 30 | 2026-06-25 | noImplicitAny 第九批清理（analyze.mjs 前 700 行，18 个函数） | 2364→2237 |
| 31 | 2026-06-25 | noImplicitAny 第十批清理（analyze.mjs 700-2400 行，16 个函数） | 2237→2012 |
| 32 | 2026-06-26 | noImplicitAny 第十一批清理（analyze.mjs 2400-7700 行，52 个函数，analyze.mjs 全文件清零） | 2012→1534 |
| 33 | 2026-06-26 | noImplicitAny 第十二批清理（report-sections.mjs 全文件，26 个 export 函数 + 9 个本地 helper） | 1534→1371 |
| 34 | 2026-06-26 | noImplicitAny 第十三批清理（report-trend.mjs 全文件 + bot-health-analysis.mjs 全文件） | 1371→1197 |
| 35 | 2026-06-26 | noImplicitAny 第十四批清理（trend-report.mjs 全文件 + loop-report.mjs 全文件） | 1197→1075 |
| 36 | 2026-06-26 | noImplicitAny 第十五批清理（health-report.mjs + fix-checklist-content.mjs 全文件） | 1075→982 |
| 37 | 2026-06-26 | noImplicitAny 第十六批清理（rui-story/lib/format.mjs + rui-trends/lib/format.mjs 全文件） | 982→923 |
| 38 | 2026-06-26 | noImplicitAny 第十七批清理（rui-story/lib/generate-review.mjs 全文件，10 函数 + 8 回调 + map 字面量索引） | 923→888 |
| 39 | 2026-06-26 | noImplicitAny 第十八批清理（rui-npm/tests/rui-npm.test.mjs 全文件，5 helper + 22 `(d) =>` 回调 + 1 `findIndex(l =>`） | 888→855 |
| 40 | 2026-06-26 | noImplicitAny 第十九批清理（lib/engine/diagnostics.mjs 全文件，JSDoc `@param {object}` → `any` + 5 个 runDx 签名 + 2 个 Record 字面量 + 2 个 filter 回调） | 855→819 |
| 41 | 2026-06-26 | noImplicitAny 第二十批清理（rui-analysis/scripts/extract-structure.mjs 全文件，buildResult 6 参数 + base 字面量 Record 注解 + 9 个 .map 回调 + 3 个 .filter 回调） | 819→788 |
| 42 | 2026-06-26 | noImplicitAny 第二十一批清理（rui-html/lib/extractor.mjs 全文件，10 函数签名 + 3 个字面量 Record/string[] 注解 + `.index ?? 0` 修复 9 处 TS18048 strict 回归） | 788→760 |
| 43 | 2026-06-26 | noImplicitAny 第二十二批清理（rui-bot/lib/bot-health-cmd.mjs 全文件，3 函数签名 + 5 处字面量对象索引 cast + 2 处 `: null` → `: undefined` + 1 处 destructure typo 修复） | 760→733 |
| 44 | 2026-06-26 | noImplicitAny 第二十三批清理（lib/tests/record.test.mjs 全文件，3 个 `opts = {}` → `opts: any = {}` + 2 个函数签名） | 733→705 |
| 45 | 2026-06-26 | noImplicitAny 第二十四批清理（lib/tests/fs.test.mjs 全文件，3 处 `let tmpDir, X` 拆分为独立 JSDoc let + 1 处 `(rec)` 回调 inline `@type`） | 705→678 |
| 46 | 2026-06-26 | noImplicitAny 第二十五批清理（lib/engine/materialize.mjs 全文件，6 函数签名 + 3 处 typed 字面量对象索引 cast + JSDoc `@param {object}` → `any` + updateJsonlById 回调 inline `@type`） | 678→651 |
| 47 | 2026-06-26 | noImplicitAny 第二十六批清理（rui-bot/lib/bot-message.mjs 全文件，9 函数签名 + 3 处 STATUS_LABELS/STATUS_EMOJI 字面量索引 cast） | 651→625 |
| 48 | 2026-06-26 | noImplicitAny 第二十七批清理（lib/tests/diagnostics.test.mjs 全文件，`let runDiagnostics` JSDoc + 2 个 `overrides/extra = {}` → `any = {}` + 11 处 `.find(d =>`/`.filter(d =>`/`.map(d =>` 回调 inline `@type`） | 625→599 |
| 49 | 2026-06-26 | noImplicitAny 第二十八批清理（rui-story/lib/scrub.mjs 全文件，23 处 `(ctx) =>` 回调 inline `@type` + 2 处 `(_c, _m, cap)` 多参回调 + 1 处 mkPattern union call cast） | 599→574 |
| 50 | 2026-06-26 | noImplicitAny 第二十九批清理（lib/loop/dispatcher.mjs 全文件，10 函数签名 + 2 回调 + `parseCronField` 递归 `@returns {number[]}` + `isCronDue`/`cronIntervalMinutes` 放宽为 `string | null | undefined`） | 574→549 |
| 51 | 2026-06-26 | noImplicitAny 第三十批清理（lib/arch-dimensions/kernel-paradigm.mjs 全文件，4 helper 签名 + 3 处 JSDoc `Array` → `Array<any>` + 9 处回调 inline `@type`） | 549→525 |
| 52 | 2026-06-26 | noImplicitAny 第三十一批清理（lib/arch-dimensions/quality.mjs 全文件，3 处 JSDoc `@returns {{ ... Array }}` → `Array<any>` + 5 处回调 inline `@type` + `AGENT_TOOL_SPEC` cast at access + `let tools`/`const declaredAgents` 加 `@type {string[]}` + 附带 solid.mjs `readFrontmatter` 返回类型 `object\|null` → `Record<string, any>\|null` 修 4 处 TS2339/TS7053） | 525→498 |
| 53 | 2026-06-26 | noImplicitAny 第三十二批清理（lib/arch-dimensions/solid.mjs 全文件清零，4 处 JSDoc `Array` → `Array<any>` + 4 处回调 inline `@type`（`d: any` Dirent / `f: string` / `e: string` / `n: string`）+ `hasConjunctions(desc: string)` + `exportPatterns` 加 `Record<string, string[]>`） | 498→485 |
| 54 | 2026-06-26 | noImplicitAny 第三十三批清理（skills/rui-story/lib/extract-scenario.mjs 全文件清零，10 个抽取器函数签名 inline `@type {string}` + `extractTableRows(section: string, minCols: number)` + `extractTestCases` 的 `result` 加 `Record<string, any[]>` + `extractIssuesAndRecs` 的 `issues`/`recs` 加 `any[]` + `cachePathFor`/`readCache`/`writeCache` 的 `ctx` inline 对象类型 + `(s) => s.trim()`/`.map(c =>` 回调 inline `@type`） | 485→463 |
| 55 | 2026-06-26 | noImplicitAny 第三十四批清理（skills/rui-html/lib/templates.mjs 全文件清零，6 个函数签名 inline `@type`（`getCategory(docType: string)`/`buildSharedContext`/`buildBreadcrumb`/`buildBreadcrumbJSON`/`buildCrossNav`/`buildCrossNavJSON`/`buildHeadBlock`）+ `PAGE_META` 加 `Record<string, {icon, label, shortLabel, css}>` + `CATEGORY_A_SCRIPTS` 加 `Record<string, {src: string}[]>` + `CAT_B_BASE`/`CAT_A_BASE` 本地 const 加 `Record<string, string>` + `.map(dt =>` 回调 inline `@type {string}`） | 463→441 |
| 56 | 2026-06-26 | noImplicitAny 第三十五批清理（skills/rui-bot/lib/bot-transport.mjs 全文件清零，8 个 export 函数签名 inline `@type`：`sendToWecom(apiUrl, webhookUrl, content, token)`/`sendDirectToWebhook`/`sendWithRetry`/`enqueueFailedNotification`/`flushNotificationQueue`/`logNotificationDelivery`/`trimNotificationLog`/`loadConfig`，projectRoot/webhookUrl/apiUrl/content/token 为 `string`，message/opts/result 为 `any`） | 441→419 |
| 57 | 2026-06-26 | noImplicitAny 第三十六批清理（skills/rui-html/lib/generator.mjs 全文件清零，JSDoc `@param {Object}` → `@param {any}`（修 TS2339 `ctx.force`）+ 6 个函数签名 inline `@type`（`getTemplatePath`/`renderTemplate`/`buildStatsGridJSON`/`buildHealthBarJSON`/`extractTableValue`/`countTableRows`/`countDiagnosticPasses`/`countArtifactRows`）+ 4 处回调 inline `@type {string}`（`row.some(cell =>`/`row.findIndex(cell =>`）+ `mermaidBlocks.map(b =>` inline `@type {any}`） | 419→399 |
| 58 | 2026-06-26 | noImplicitAny 第三十七批清理（skills/rui-npm/lib/npm-utils.mjs 全文件清零，5 个函数签名 inline `@type`：`npm(args: string[], opts: any = {})`/`npmStream`/`maskToken(token: string)`/`toTable(headers: string[], rows: any[][])`/`httpGetJson(url: string)` + 6 处回调 inline `@type`（`headers.map((h, i) =>`/`rows.map((r) =>`/`cells.map((c) =>`×2/`cols.map((c) =>`×2/`cols.map((c, i) =>`/`rows.map((row) =>`/`cols.map((c, i) =>`/`get(url, (res) =>`/`res.on("data", (chunk) =>`）） | 399→380 |
| 59 | 2026-06-26 | noImplicitAny 第三十八批清理（skills/rui-story/rui-story.mjs 全文件清零，6 个 `cmd*` 函数签名 inline `@type {string}`：`cmdOverview`/`cmdList`/`cmdShow`/`cmdRecommend`/`cmdHealth`/`cmdSync`，`name` 参数放宽为 `string \| null \| undefined` 修 TS2345 `opts.name` 调用回归，`printShow(name)` 调用点 `name \|\| ""` 兜底修 strict 回归） | 380→363 |
| 60 | 2026-06-26 | noImplicitAny 第三十九批清理（skills/rui-bot/lib/bot-health-diagnostics.mjs 全文件清零，4 个函数签名 inline `@type {string}`：`collectHealthData`/`computeDocIssuesForHealth`/`getBootstrapDiagnostics`/`getDiagnosticResult` + `readJsonl = (p) =>` 箭头函数 inline `@type` + 6 处回调 inline `@type`（`(l) =>`/`.filter((d) =>`×3/`.filter((f) =>`×2/`.map((d) =>`×2）+ `const triggered = []` 加 `any[]` + `DIAGNOSTIC_BASELINES[id]` cast at access + JSDoc `@returns {{ ... Array }}` → `Array<any>` + `const data = collectHealthData(...)` 加 `@type {any}` 修 TS2339 `data.retroMissing`/`data.noProposals` 动态属性扩展） | 363→346 |
| 61 | 2026-06-26 | noImplicitAny 第四十批清理（skills/rui-bot/lib/bot-health-deps.mjs 全文件清零，7 个函数签名 inline `@type`：`isEntryPoint(filePath: string)`/`resolveImport(importPath, fromFile, projectRoot)`/`extractImports`/`extractHtmlReferences`/`detectCycles(graph: Map<string, Set<string>>)`/`shortPath(p: string)`/`getDependencyAnalysis(projectRoot: string)` + `normalizeHtmlSpec = (spec: string)` 箭头函数 + `dfs(node: string, path: string[])` 内部函数 + `const cycles = []` 加 `any[]` 修 TS7034/TS7005） | 346→329 |
| 62 | 2026-06-26 | noImplicitAny 第四十一批清理（lib/engine/evaluate.mjs 全文件清零，3 处 JSDoc `@param {object}` → `@param {any}`：`evaluateProposal(proposal, preMetrics, postMetrics)`/`computeMetrics(memories: Array<any>)`/`cmdEvaluate(opts)`，修 TS2339 `proposal.id`/`preMetrics.block_rate`/`postMetrics.p0_density`/`r.was_blocked`/`r.agents_called`/`opts.id` 等 17 处属性访问） | 329→312 |
| 63 | 2026-06-26 | noImplicitAny 第四十二批清理（skills/rui-npm/lib/account.mjs 全文件清零，3 个函数签名 inline `@type`：`cmdMyPackages(args: any)`/`cmdDeprecate(pkg: string, args: any)`/`cmdUnpublish(pkg: string, args: any)` + `.map((o) =>` 回调 inline `@type {any}` + `let pkgData = {}` 加 `@type {any}` 修 TS2339 `pkgData.versions`（`{}` 类型不允许属性访问，即使后续赋值 `JSON.parse` 返回 `any`）） | 312→302 |
| 64 | 2026-06-26 | noImplicitAny 第四十三批清理（skills/rui-import/lib/api.mjs 全文件清零，4 个函数签名 inline `@type`：`querySessions(apiUrl: string)`/`writeRemoteFile(apiUrl, remotePath, content, overwrite: boolean)`/`createSession(apiUrl, remotePath, localPath, projectRootName)`/`updateSession(apiUrl, remotePath, existingItem: any)` + `resp?.data` cast at access（`fetchJson` 返回 `object\|string` 联合，访问 `.data` 触发 TS2339，cast `(resp as any)?.data`）） | 302→289 |
| 65 | 2026-06-26 | noImplicitAny 第四十四批清理（skills/rui-html/rui-html.mjs 全文件清零，2 个函数签名 inline `@type`：`findStoryDir(projectRoot: string, storyName: string \| undefined)`（放宽修 TS2345 `opts.storyName` 调用回归）/`findSceneDirs(storyDir: string)` + 5 处回调 inline `@type`（`.filter((d: any) =>`×3/`.map((d: any) =>`×2/`.filter((s: string) =>`）+ `const ctx = extractSceneData(...)` 加 `@type {any}` 修 TS2339 `ctx.force`/`ctx.storyTitle` 动态属性扩展） | 289→280 |
| 66 | 2026-06-26 | noImplicitAny 第四十五批清理（skills/rui-trends/rui-trends.mjs 全文件清零，`parseArgs(argv)` 参数 inline `@type {string[]}` 修 TS7006 + `const options = {}` 加 `@type {Record<string, any>}` face fix 一次性修 TS7053 字面量索引 + 5 处 `options.html` TS2339 —— 根因是 `options` 推断为 `{}` 空 shape） | 280→273 |
| 67 | 2026-06-26 | noImplicitAny 第四十六批清理（skills/rui-story/lib/extract.mjs 全文件清零，6 个函数签名 inline `@type`：`extractStoryName`/`groupSessionsByStory(sessions: any[])`/`readBlockedState`/`hasProjectFile(Set<string>)`/`countCompleteScenes`/`determineStatus(filePaths: string[] = [])` + 4 处 `paths.some(fp =>` 回调 inline `@type {string}` + `basename \|\| ""` 修 TS2345 strict 回归 + 调用方 `rui-story.mjs` 5 处 `sessions \|\| []` 兜底 + `name \|\| ""` cast 修 union 调用回归 + `filePaths = []` 默认值修 TS2554） | 273→257 |
| 68 | 2026-06-26 | noImplicitAny 第四十七批清理（skills/rui-import/lib/upload.mjs 全文件清零，2 个 export 函数签名 inline `@type`：`uploadSingleFile`/`uploadAll`（`prefix: string[]` 因 `resolveRemotePath` 使用 spread 操作符）+ `const errors = []` 加 `@type {any[]}` 修 TS7034/TS7005 + `worker(file: string)` 内部函数 + `result.error` cast at access 修 TS2339（返回 shape 无 `error` 字段，else 分支为死代码）） | 257→241 |
| 69 | 2026-06-26 | noImplicitAny 第四十八批清理（skills/rui/tests/unit/engine.test.mjs 全文件清零，`let evaluateProposal, computeMetrics;` 拆分为两个独立 `/** @type {any} */ let` 声明修 TS7034/TS7005——动态 import 模式下变量先声明后赋值，单 JSDoc 仅注解第一个变量，拆分后各自独立注解，同 Round 45 `lib/tests/fs.test.mjs` 模式） | 241→227 |
| 70 | 2026-06-26 | noImplicitAny 第四十九批清理（skills/rui-import/lib/pull.mjs 全文件清零，3 个 export 函数签名 inline `@type`：`resolvePullFilter`/`pullFromRemote`/`recommendPullMode` + 4 处对象字面量方法回调 inline `@type`：`filter: (s: any) =>`×2/`toLocal: (remotePath: string) =>`×2 + `data?.data?.content` 双 cast at access 修 TS2339（`readRemoteFile` 返回 `object\|string` 联合，同 Round 64 模式）+ 调用方 `sync.mjs` `opts.projectPrefix \|\| ""` 兜底修 TS2345 strict 回归） | 227→213 |
| 71 | 2026-06-26 | noImplicitAny 第五十批清理（skills/rui-import/lib/scan.mjs 全文件清零，3 个 export 函数签名 inline `@type`：`scanFiles(root: string, userExcludes: string[])`/`resolveRemotePath(prefix: string[])`/`getTags` + `const result = []` 加 `@type {string[]}` 修 TS7034/TS7005 + `walk(dir: string)` 内部递归函数签名 + `prefix: string[]` 同 Round 68 `upload.mjs` 模式复用（spread 操作符）） | 213→201 |
| 72 | 2026-06-26 | noImplicitAny 第五十一批清理（skills/rui-story/lib/infer.mjs 全文件清零，2 个 export 函数签名 inline `@type`：`inferType(storySessions: any[])`/`inferTypesBatch(storyMap: Map<string, any>)` + `find(s =>` 回调 inline `@type {any}` + `data?.data?.content` 双 cast at access 修 TS2339（`readRemoteFile` 返回 `object\|string` 联合，同 Round 64/70 模式复用）+ `runConcurrent(entries, async ([name, sessions]) =>` 解构参数 inline `@type {[string, any]}` 注解整个元组） | 201→190 |
| 73 | 2026-06-26 | noImplicitAny 第五十二批清理（lib/tests/arch-check.test.mjs 全文件清零，3 个 helper 函数签名 inline `@type`：`computeGrade(failedDimCount: number)`/`computeScore(passed: number, total: number)`/`computeSummary(dimensions: any[])` + 6 处 reduce/filter/map 回调 inline `@type`：`(s: number, d: any)`×2/`(c: any)`/`(d: any)`×3 —— reduce 累加器 `s` 必须为 `number` 否则链式推断触发 TS7006） | 190→179 |
| 74 | 2026-06-26 | noImplicitAny 第五十三批清理（skills/rui-npm/lib/tools.mjs 全文件清零，3 个 export 函数签名 inline `@type`：`cmdNpx`/`cmdAudit`/`cmdCdn`（`args: any` 因 `.npxArgs`/`.json` 动态属性） + 2 处字面量对象 `summary`/`sevOrder` 加 `@type {Record<string, number>}` face fix 修 TS7053（字面量窄 key 被 `v.severity: any` 索引）+ `v.via.map(x =>` 回调 inline `@type {any}`（`x` 为 `string\|object` 联合）） | 179→169 |
| 75 | 2026-06-26 | noImplicitAny 第五十四批清理（skills/rui-npm/lib/read.mjs 全文件清零，3 个 export 函数签名 inline `@type`：`cmdSearch`/`cmdList`/`cmdInfo`（`args: any` 因 `.limit`/`.depth`/`.json` 动态属性）+ `const flat = []` 加 `@type {any[]}` 修 TS7034/TS7005（递归 `walk` 内 `flat.push`）+ `walk(deps: any, prefix: string)` 内部递归函数签名 + `p.maintainers.map(m =>` 回调 inline `@type {any}`） | 169→159 |
| 76 | 2026-06-26 | noImplicitAny 第五十五批清理（lib/tests/cdn-score-updater.test.mjs 全文件清零，5 个 helper 函数签名 inline `@type`：`classifyScore(score: number)`/`buildRecommendations(breakdown: any[])`/`computeDiagRate`/`getComponentLabel(cat: string)`/`mapCategory(dimLabel: string)` + 2 处 `filter/map` 回调 inline `@type {any}` + `const labels` 加 `@type {Record<string, string>}` face fix 修 TS7053（同 Round 52/53/74 模式复用）） | 159→150 |
| 77 | 2026-06-26 | noImplicitAny 第五十六批清理（lib/loop/registry.mjs 全文件清零，3 个 lookup helper 函数签名 inline `@type`：`getSkillMeta`/`getCheckItems`/`getCrossRef` + `LOOP_SKILLS.find(s =>` 回调 inline `@type {any}` + 2 处模块级字面量对象 cast at access（`LOOP_CHECK_ITEMS`/`LOOP_CROSS_REFS` 选 point fix 避免改大型 const 声明）+ `groupSkillsByCheckMode` 内 `const groups` 加 `@type {Record<string, string[]>}` face fix 修 3 处 `groups[mode]` TS7053） | 150→142 |
| 78 | 2026-06-26 | noImplicitAny 第五十七批清理（skills/rui/tests/run.mjs 全文件清零，3 个函数签名 inline `@type`：`scanDir(dir: string)`/`discoverTests(category: string)`/`runTestFile(filePath: string, jsonMode: boolean)` + 2 处 `filter/map` 回调 inline `@type {string}` + `const TEST_SOURCES` 加 `@type {Record<string, string[] \| null>}` face fix 修 TS7053（混合类型值需联合类型注解）） | 142→135 |
| 79 | 2026-06-26 | noImplicitAny 第五十八批清理（skills/rui-trends/lib/trend-fetch.mjs 全文件清零，5 个函数签名 inline `@type`：`sleep = (ms: number) =>` 箭头闭包/`fetchWithTimeout(url: string, opts: any = {})`/`fetchWithRetry`/`extractRepoLines(html: string)`/`isAgentSkillRepo(repo: any)`/`findAgentSkillRepos(data: any)` + 关键洞察：`opts = {}` 默认值触发 TS2339 `opts.timeout`——TS 推断 `{}` 空 shape 无属性，需 `opts: any = {}` 注解参数类型） | 135→128 |
| 80 | 2026-06-26 | noImplicitAny 第五十九批清理（skills/rui-npm/lib/publish.mjs 全文件清零，2 个 export 函数签名 inline `@type`：`verifyOwnership(username: string, pkgName: string)`/`cmdPublish(path: string, args: any)` + `maintainers.some(m =>` 回调 inline `@type {any}`（`m` 为 `string\|object` 联合）+ `const pkgJson` 加 `@type {Record<string, any>}` face fix 修 3 处 `pkgJson[k]` TS7053（同 Round 52/53/74/76/77/78 模式复用）） | 128→121 |
| 81 | 2026-06-26 | noImplicitAny 第六十批清理（lib/tests/scoring.test.mjs 全文件清零，`normalizeScore` 5 参数 inline `@type {number}` + `report.comparison.compositeDelta` cast at access 修 TS18047（possibly null）+ TS2339（`object` 无属性）双重错误——`assert.ok` 不能窄化类型因 TS 不跟踪） | 121→114 |
| 82 | 2026-06-26 | noImplicitAny 第六十一批清理（skills/rui/tests/agents.test.mjs 全文件清零，`getAgentPath(agentName: string)` 函数签名 + `const AGENT_TO_SKILL` 加 `@type {Record<string, string>}` face fix 修 TS7053（10 keys 小对象，同 Round 52/53/74/76/77/78/80 模式复用）） | 114→112 |
| 83 | 2026-06-26 | noImplicitAny 第六十二批清理（lib/tests/io.test.mjs 全文件清零，5 处 `const results = []`/`const order = []` 加 `@type {number[]}` 修 TS7034/TS7005——`results.sort((a, b) => a - b)` 与 `assert.deepEqual(results, [...])` 需元素类型推断，空数组推断为 `any[]` 触发链式隐式 any 传播，同 Round 73 reduce 累加器模式） | 112→105 |
| 84 | 2026-06-26 | noImplicitAny 第六十三批清理（skills/rui-npm/lib/write.mjs 全文件清零，3 个 export 函数签名 inline `@type`：`cmdInstall(pkg: string, args: any)`/`cmdUpdate(pkg: string, _args: any)`/`cmdUninstall(pkg: string, _args: any)`——未使用参数前缀 `_` 仍需注解） | 105→99 |
| 85 | 2026-06-26 | noImplicitAny 第六十四批清理（skills/rui-bot/lib/bot-health-trend.mjs 全文件清零，3 个 export 函数签名 inline `@type`：`scoreEmoji(score: number)`/`healthBar(score: number, width = 20)`/`saveHealthTrend(result: any, projectRoot: string)` + 2 个回调 inline `@type`：`.map((d: any) => d.id)`（triggered 数组元素）/`.filter((line: string) =>`（readFileSync split 后字符串）） | 99→93 |
| 86 | 2026-06-26 | noImplicitAny 第六十五批清理（skills/rui-bot/lib/bot-health-structure.mjs 全文件清零，3 个 export 函数签名 inline `@type`：`getGitSnapshot(projectRoot: string)`/`runSecurityScan(projectRoot: string)`/`getStructureHealth(projectRoot: string)` + 1 个内部函数 `countFileLines(filePath: string)` + 2 个回调 inline `@type`：`.filter((line: string) =>`（git status split 后字符串）/`.filter((f: string) =>`（git ls-files 后字符串）） | 93→87 |
| 87 | 2026-06-26 | noImplicitAny 第六十六批清理（lib/engine/upgrade.mjs 全文件清零，1 个回调 inline `@type {any}`（`readdirSync(...).filter((d) =>` Dirent 元素）+ 1 处 face fix `/** @type {Record<string, Set<string>>} */ const typeStoryCounts = {}` 修 3 个 TS7053（空对象字面量 + 动态键赋值）+ 2 处 point fix cast at access `(/** @type {any} */ (thresholdMap))[type]`/`(/** @type {any} */ (upgradeMap))[type]` 修模块级 `UPGRADE_THRESHOLDS`/`UPGRADE_TARGETS` 字面量对象索引 TS7053） | 87→81 |
| 88 | 2026-06-26 | noImplicitAny 第六十七批清理（skills/rui-update/tests/rui-update.test.mjs 4 处 TS18047 + TS2339 双重错误：`parseFrontmatter` 返回 `object \| null`，`assert.ok(fm)` 不能窄化类型——同 Round 81 `report.comparison` 模式，引入 `const fmAny = /** @type {any} */ (fm)` 局部变量后访问 `.name`/`.description`） | 81→77 |

## 退出策略

| 临时方案 | 退出条件 | 退出动作 |
|---------|---------|---------|
| `types/node-shim.d.ts` 类型 shim | `@types/node` 加入 devDependencies | 删本文件 + tsconfig `types: ["node"]` |
| `strict: false` | `noImplicitAny` 清理 3048→可接受 | 逐步开启 strict 子标志 |
| `eslint.config.mjs` 内联规则 | `@eslint/js` 包加入 devDeps | 抽出 `eslint.config.js` 引用 `@eslint/js` |
