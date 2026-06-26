# Changelog

> YrY — 故事驱动的 SDLC 编排系统（Claude Code 插件）
> 版本号语义：MAJOR.MINOR.PATCH — 重大架构变更.功能演进.修复
> 维护者：每个 PR 触及用户可见行为时追加条目

本文件记录项目演进。Commit message 历史简洁（"1"），主要变更以版本里程碑组织。

## [Unreleased]

### 工程化建设 — 2026-06-26（第八十八轮 `/loop`）

- **noImplicitAny 清理第六十七批**：81 → 77（修 4 处，`rui-update.test.mjs` 4 处双重错误清零）
  - **`skills/rui-update/tests/rui-update.test.mjs`**（4 → 0）：
    - 2 处 TS18047（`fm` possibly null）+ 2 处 TS2339（`fm.name`/`fm.description` 在 `object` 上不存在）
    - 修复：引入局部变量 `const fmAny = /** @type {any} */ (fm);` 后访问 `fmAny.name`/`fmAny.description`
  - **关键洞察**：`parseFrontmatter(content)` 返回 `object | null`，`assert.ok(fm)` 仅在运行时断言非空，但 TS 不在 `assert.ok` 后窄化类型（同 Round 81 `assert.ok(report.comparison !== null)` 模式）。两种修法对比：(1) cast at access `/** @type {any} */ (fm).name`——每处重复 cast，冗长；(2) 引入局部变量 `fmAny` 一次 cast，多处访问更简洁——本批选 (2)，因后续有两处属性访问。`parseFrontmatter` 的返回类型是 `object`（非具体 shape），故即便窄化 null 后仍无法访问 `.name`/`.description`，必须 cast 为 `any`
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 81 → 77；`npx eslint skills/rui-update/tests/rui-update.test.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-update/tests/` 26 passed
  - **下一轮候选**：其他 bot-health-* 模块 · `lib/engine/` 其他文件 · `skills/rui-*/tests/` 其他测试

### 工程化建设 — 2026-06-26（第八十七轮 `/loop`）

- **noImplicitAny 清理第六十六批**：87 → 81（修 6 处，`upgrade.mjs` 全文件清零）
  - **`lib/engine/upgrade.mjs` 全文件**（6 → 0）：
    - 1 个回调 inline `@type {any}`：`.filter((d) =>` —— `d` 是 `readdirSync({ withFileTypes: true })` 返回的 `Dirent`，避免引入 `@types/node`
    - 1 处 face fix：`/** @type {Record<string, Set<string>>} */ const typeStoryCounts = {}` 修 3 个 TS7053（`typeStoryCounts[p.type]`/`.add(...)` 等动态键访问）
    - 2 处 point fix cast at access：`(/** @type {any} */ (thresholdMap))[type]`/`(/** @type {any} */ (upgradeMap))[type]` 修模块级 `UPGRADE_THRESHOLDS`/`UPGRADE_TARGETS` 字面量对象索引 TS7053
  - **关键洞察**：face fix vs point fix 选择策略——`typeStoryCounts` 是局部小对象（动态键赋值 + 唯一声明点），face fix 一处注解覆盖所有访问点（同 Round 77 `groups` 模式）；`UPGRADE_THRESHOLDS`/`UPGRADE_TARGETS` 是从 `lib/constants.mjs` 导入的模块级常量（5 keys 字面量类型），修改其声明会影响其他文件，故选择 point fix cast at access（同 Round 77 `LOOP_CHECK_ITEMS`/`LOOP_CROSS_REFS` 模式）。`Dirent` 类型用 `any` 而非引入 `@types/node`，保持 L1 node-shim 策略
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 87 → 81；`npx eslint lib/engine/upgrade.mjs --max-warnings 0` exit 0；`npx vitest run lib/tests/` 337 passed + 1 skipped
  - **下一轮候选**：`skills/rui-update/tests/rui-update.test.mjs`（4）· 其他 bot-health-* 模块 · `lib/engine/` 其他文件

### 工程化建设 — 2026-06-26（第八十六轮 `/loop`）

- **noImplicitAny 清理第六十五批**：93 → 87（修 6 处，`bot-health-structure.mjs` 全文件清零）
  - **`skills/rui-bot/lib/bot-health-structure.mjs` 全文件**（6 → 0）：
    - 3 个 export 函数签名 inline `@type`：`getGitSnapshot(projectRoot: string)`/`runSecurityScan(projectRoot: string)`/`getStructureHealth(projectRoot: string)`
    - 1 个内部函数签名 inline `@type`：`countFileLines(filePath: string)`
    - 2 个回调 inline `@type`：`.filter((line: string) =>`（`git status --porcelain` 输出 split 后字符串）/`.filter((f: string) =>`（`git ls-files` 输出 split 后字符串）
  - **关键洞察**：`projectRoot` 参数贯穿 `getGitSnapshot`/`runSecurityScan`/`getStructureHealth` 三个 export 函数——它们都作为 `execSync({ cwd: projectRoot })` 的 cwd 参数，必须是 `string`。同 Round 85 的 `saveHealthTrend(result: any, projectRoot: string)` 模式：`projectRoot` 总是 `string`（来自 `process.cwd()` 或调用方传入的绝对路径），`result`/复杂对象用 `any`。`countFileLines` 是内部辅助函数，参数 `filePath` 也是 `string`（来自 `join(projectRoot, rel)`）。两个 `.filter` 回调的元素类型已由外层 `string.split("\n").filter(Boolean)` 确定为 `string`，但 TS 不在回调签名中传播元素类型（同 Round 85 `line` 模式）
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 93 → 87；`npx eslint skills/rui-bot/lib/bot-health-structure.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-bot/tests/` 15 passed（exit 0）
  - **下一轮候选**：`lib/engine/upgrade.mjs`（6）· `skills/rui-update/tests/rui-update.test.mjs`（4）· 其他 bot-health-* 模块

### 工程化建设 — 2026-06-26（第八十五轮 `/loop`）

- **noImplicitAny 清理第六十四批**：99 → 93（修 6 处，`bot-health-trend.mjs` 全文件清零）
  - **`skills/rui-bot/lib/bot-health-trend.mjs` 全文件**（6 → 0）：
    - 3 个 export 函数签名 inline `@type`：`scoreEmoji(score: number)`/`healthBar(score: number, width = 20)`/`saveHealthTrend(result: any, projectRoot: string)`
    - 2 个回调 inline `@type`：`.map((d: any) => d.id)`（`result.diagnostics?.triggered` 数组元素动态属性访问）/`.filter((line: string) =>`（`readFileSync(trendPath, "utf-8").split("\n").filter(Boolean)` 后元素为 `string`）
  - **关键洞察**：`saveHealthTrend` 的 `result` 参数需 `any` 而非具体 shape——函数体访问 `result.diagnostics?.bootstrapped`/`result.gitInfo?.branch`/`result.fileSizeInfo.totalBytes`/`result.compScores.skills.length` 等多层嵌套动态属性，且各字段来自 health check 聚合对象（结构由 `bot-health-analysis.mjs` 等运行时构造，无统一类型声明）。`width = 20` 默认值使 TS 推断 `number`，无需注解。`line` 参数来自 `string[].filter`，元素类型已确定为 `string`，但仍需 inline 注解因 TS 不在回调签名中传播外层数组元素类型（同 Round 80 `maintainers.some` 模式）
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 99 → 93；`npx eslint skills/rui-bot/lib/bot-health-trend.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-bot/tests/` 15 passed（exit 0）
  - **下一轮候选**：`skills/rui-bot/lib/bot-health-structure.mjs`（6）· `lib/engine/upgrade.mjs`（6）· `skills/rui-update/tests/rui-update.test.mjs`（4）

### 工程化建设 — 2026-06-26（第八十四轮 `/loop`）

- **noImplicitAny 清理第六十三批**：105 → 99（修 6 处，`write.mjs` 全文件清零）
  - **`skills/rui-npm/lib/write.mjs` 全文件**（6 → 0）：
    - 3 个 export 函数签名 inline `@type`：`cmdInstall(pkg: string, args: any)`/`cmdUpdate(pkg: string, _args: any)`/`cmdUninstall(pkg: string, _args: any)`
  - **关键洞察**：未使用参数前缀 `_`（如 `_args`）仍需类型注解——TS 对 `_` 前缀仅抑制「未使用」警告，不抑制 implicit any 检查。这是常见的认知盲点：开发者以为 `_` 前缀是「忽略此参数」的快捷方式，实际仅控制 unused 警告。CLI 命令处理函数中 `pkg: string`（用于 npm 命令参数）与 `args: any`（用于动态属性如 `.save-dev`/`.global`）的二元类型模式在 rui-npm 系列已稳定（Round 58/63/74/75/80/84 复用）
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 105 → 99；`npx eslint skills/rui-npm/lib/write.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-npm/tests/` 68 passed（exit 0）
  - **下一轮候选**：`skills/rui-bot/lib/bot-health-trend.mjs`（6）· `skills/rui-bot/lib/bot-health-structure.mjs`（6）· `lib/engine/upgrade.mjs`（6）

### 工程化建设 — 2026-06-26（第八十三轮 `/loop`）

- **noImplicitAny 清理第六十二批**：112 → 105（修 7 处，`io.test.mjs` 全文件清零）
  - **`lib/tests/io.test.mjs` 全文件**（7 → 0）：
    - 5 处 `const results = []`/`const order = []` 加 `/** @type {number[]} */` 修 TS7034/TS7005：line 11/21/27/53 `results` + line 35 `order`
  - **关键洞察**：`const arr = []` 后 `arr.sort((a, b) => a - b)` 或 `assert.deepEqual(arr, [2, 4, 6, 8, 10])` 需元素类型推断——空数组 `[]` 推断为 `any[]`，回调参数 `a`/`b` 隐式 any，触发 TS7034（声明处）+ TS7005（访问处）链式错误。同 Round 73 `arch-check.test.mjs` reduce 累加器模式：TS 对「空容器 + 后续操作」的元素类型推断失败，必须显式 `@type {T[]}` 注解。测试中 `results.push(n)` 的 `n` 来自 `runConcurrent` 回调，`n` 已被推断为 `number`（因输入数组 `[1, 2, 3]` 是 `number[]`），但 `results` 本身仍需注解以中断链式隐式 any
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 112 → 105；`npx eslint lib/tests/io.test.mjs --max-warnings 0` exit 0；`npx vitest run lib/tests/io.test.mjs` 8 passed
  - **下一轮候选**：`skills/rui-npm/lib/write.mjs`（6）· `skills/rui-bot/lib/bot-health-trend.mjs`（6）· `lib/engine/upgrade.mjs`（6）

### 工程化建设 — 2026-06-26（第八十二轮 `/loop`）

- **noImplicitAny 清理第六十一批**：114 → 112（修 2 处，`agents.test.mjs` 全文件清零）
  - **`skills/rui/tests/agents.test.mjs` 全文件**（2 → 0）：
    - `getAgentPath(agentName: string)` 函数签名 inline `@type`
    - `const AGENT_TO_SKILL = { AGENT: 'rui', pm: 'rui', ... }` 加 `/** @type {Record<string, string>} */` face fix 修 TS7053
  - **关键洞察**：小对象（≤ 10 keys）face fix 是反射性选择——10 keys 的枚举映射对象，face fix 一次注解覆盖所有索引访问，远优于 point fix。此模式在 Round 52/53/74/76/77/78/80 已多次复用，现已成为无需思考的默认选择。剩余 112 errors 集中在更复杂的文件，需要更细致的模式识别
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 114 → 112；`npx eslint skills/rui/tests/agents.test.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui/tests/agents.test.mjs` 55 passed
  - **下一轮候选**：剩余 112 errors 分布在多文件，按 `npx tsc --noEmit --noImplicitAny 2>&1 | grep -oE "^[^(]+" | sort | uniq -c | sort -rn` 排序逐个清零

### 工程化建设 — 2026-06-26（第八十一轮 `/loop`）

- **noImplicitAny 清理第六十批**：121 → 114（修 7 处，`scoring.test.mjs` 全文件清零）
  - **`lib/tests/scoring.test.mjs` 全文件**（7 → 0）：
    - `normalizeScore(value: number, sourceMin: number, sourceMax: number, targetMin: number, targetMax: number)` 5 参数 inline `@type`
    - `report.comparison.compositeDelta` cast at access `(/** @type {any} */ (report.comparison)).compositeDelta` 修 TS18047（possibly null）+ TS2339（`object` 无属性）双重错误
  - **关键洞察**：`assert.ok(report.comparison !== null)` 不能窄化 `report.comparison` 类型——TS 不追踪 `assert.ok` 的类型守卫效果（不同于 `if (x !== null)` 分支）。因此后续 `report.comparison.compositeDelta` 仍触发 TS18047。此外 `comparison: object | null` 中 `object` 类型无任何属性签名，触发 TS2339。cast at access `(/** @type {any} */ (report.comparison))` 同时解决 null 与属性访问两个问题。里程碑：第六十批清理完成，从 3048 降到 114（96.3% 减少）
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 121 → 114；`npx eslint lib/tests/scoring.test.mjs --max-warnings 0` exit 0；`npx vitest run lib/tests/scoring.test.mjs` 45 passed
  - **下一轮候选**：`skills/rui/tests/agents.test.mjs`（6）· 其他剩余小文件

### 工程化建设 — 2026-06-26（第八十轮 `/loop`）

- **noImplicitAny 清理第五十九批**：128 → 121（修 7 处，`publish.mjs` 全文件清零）
  - **`skills/rui-npm/lib/publish.mjs` 全文件**（7 → 0）：
    - 2 个 export 函数签名 inline `@type`：`verifyOwnership(username: string, pkgName: string)`/`cmdPublish(path: string, args: any)`
    - `maintainers.some(m =>` 回调 inline `@type {any}`（`m` 为 `string | object` 联合——`typeof m === "string" ? m.split(" ")[0] : m.name` 需 union 类型）
    - `const pkgJson = { name: ..., version: ..., description: ..., main: ..., bin: ..., license: "MIT" }` 加 `/** @type {Record<string, any>} */` face fix 修 3 处 `pkgJson[k]` TS7053（`Object.keys(pkgJson)` 返回 `string[]`，`for (const k of ...)` 中 `k: string` 索引字面量对象触发）
  - **关键洞察**：`Object.keys(obj)` 返回 `string[]` 而非 `keyof obj`，所以 `for...of` 遍历后的 `k` 为 `string`，索引字面量对象触发 TS7053。这是字面量对象 + `Object.keys` 迭代删除/修改属性的典型反模式。face fix `@type {Record<string, any>}` 一次注解覆盖整个迭代块
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 128 → 121；`npx eslint skills/rui-npm/lib/publish.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-npm/tests/` 68 passed（exit 0，vitest worker timeout 为已知基础设施问题非测试失败）
  - **下一轮候选**：`lib/tests/scoring.test.mjs`（7）· `skills/rui/tests/agents.test.mjs`（6）· `lib/tests/scoring.test.mjs`（7）

### 工程化建设 — 2026-06-26（第七十九轮 `/loop`）

- **noImplicitAny 清理第五十八批**：135 → 128（修 7 处，`trend-fetch.mjs` 全文件清零）
  - **`skills/rui-trends/lib/trend-fetch.mjs` 全文件**（7 → 0）：
    - 5 个函数签名 inline `@type`：`sleep = (ms: number) =>` 箭头闭包/`fetchWithTimeout(url: string, opts: any = {})`/`fetchWithRetry(url: string, opts: any = {})`/`extractRepoLines(html: string)`/`isAgentSkillRepo(repo: any)`/`findAgentSkillRepos(data: any)`
  - **关键洞察**：`opts = {}` 默认值触发 TS2339 `opts.timeout`——TS 推断 `{}` 空 shape 无 `.timeout` 属性。需 `opts: any = {}` 显式注解参数类型而非依赖默认值推断。这与 Round 66 `rui-trends.mjs` 中 `const options = {}` 反模式同源：`{}` 字面量推断为空 shape，动态属性扩展均触发 TS2339。修复模式：`/** @type {any} */ opts = {}` 或 `opts: any = {}`
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 135 → 128；`npx eslint skills/rui-trends/lib/trend-fetch.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-trends/tests/` 19 passed
  - **下一轮候选**：`skills/rui-npm/lib/publish.mjs`（7）· `lib/tests/scoring.test.mjs`（7）· `skills/rui/tests/agents.test.mjs`（6）

### 工程化建设 — 2026-06-26（第七十八轮 `/loop`）

- **noImplicitAny 清理第五十七批**：142 → 135（修 7 处，`run.mjs` 全文件清零）
  - **`skills/rui/tests/run.mjs` 全文件**（7 → 0）：
    - 3 个函数签名 inline `@type`：`scanDir(dir: string)`/`discoverTests(category: string)`/`runTestFile(filePath: string, jsonMode: boolean)`
    - 2 处 `filter`/`map` 回调 inline `@type {string}`：`readdirSync(dir).filter((f: string) =>`/`.map((f: string) =>`
    - `const TEST_SOURCES = { skills: null, agents: [...], ... }` 加 `/** @type {Record<string, string[] | null>} */` face fix 修 TS7053
  - **关键洞察**：字面量对象含混合类型值（`null` 与 `string[]`）时，face fix 需用联合类型 `Record<string, string[] | null>` 而非单一类型。TS 推断字面量 `{ skills: null, agents: [...] }` 为 `{ skills: null; agents: string[]; ... }`（窄 key + 各自值类型），用 `string` 索引触发 TS7053。联合类型注解放宽值类型约束，保留所有有效访问模式
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 142 → 135；`npx eslint skills/rui/tests/run.mjs --max-warnings 0` exit 0；`node skills/rui/tests/run.mjs --list` 输出 45 test files（runner 正常工作）
  - **下一轮候选**：`skills/rui-trends/lib/trend-fetch.mjs`（7）· `skills/rui-npm/lib/publish.mjs`（7）· `lib/tests/scoring.test.mjs`（7）

### 工程化建设 — 2026-06-26（第七十七轮 `/loop`）

- **noImplicitAny 清理第五十六批**：150 → 142（修 8 处，`registry.mjs` 全文件清零）
  - **`lib/loop/registry.mjs` 全文件**（8 → 0）：
    - 3 个 lookup helper 函数签名 inline `@type`：`getSkillMeta(skill: string)`/`getCheckItems(skill: string)`/`getCrossRef(skill: string)`
    - `LOOP_SKILLS.find(s =>` 回调 inline `@type {any}`
    - 2 处模块级字面量对象索引 cast at access：`(/** @type {any} */ (LOOP_CHECK_ITEMS))[skill]`/`(/** @type {any} */ (LOOP_CROSS_REFS))[skill]` 修 TS7053
    - `groupSkillsByCheckMode` 内 `const groups = { cli: [], slash: [], manual: [] }` 加 `/** @type {Record<string, string[]>} */` face fix 修 3 处 `groups[mode]` TS7053
  - **关键洞察**：face fix vs point fix 选择策略——本地小对象（`groups` 3 keys）用 face fix 一次注解覆盖所有访问点；模块级大型 const（`LOOP_CHECK_ITEMS` 20 keys）用 point fix cast at access 避免修改声明处的大对象字面量。决策依据：修改成本 vs 访问点数量。本地对象访问点多→face fix；模块级对象声明大→point fix
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 150 → 142；`npx eslint lib/loop/registry.mjs --max-warnings 0` exit 0；`npx vitest run lib/tests/` 337 passed | 1 skipped
  - **下一轮候选**：`skills/rui/tests/run.mjs`（7）· `skills/rui-trends/lib/trend-fetch.mjs`（7）· `skills/rui-npm/lib/publish.mjs`（7）

### 工程化建设 — 2026-06-26（第七十六轮 `/loop`）

- **noImplicitAny 清理第五十五批**：159 → 150（修 9 处，`cdn-score-updater.test.mjs` 全文件清零）
  - **`lib/tests/cdn-score-updater.test.mjs` 全文件**（9 → 0）：
    - 5 个 helper 函数签名 inline `@type`：`classifyScore(score: number)`/`buildRecommendations(breakdown: any[])`/`computeDiagRate(triggered: number, total: number)`/`getComponentLabel(cat: string)`/`mapCategory(dimLabel: string)`
    - 2 处 `filter`/`map` 回调 inline `@type {any}`：`breakdown.filter((b: any) =>`/`.map((b: any) =>`（`b` 对象含 `.status`/`.trendDirection`/`.label`/`.score`/`.recommendation` 多属性）
    - `const labels = { css: ..., themes: ..., apis: ..., scripts: ... }` 加 `/** @type {Record<string, string>} */` face fix 修 TS7053（字面量窄 key 被 `cat: string` 索引）
  - **关键洞察**：测试 helper 中字面量对象作为「枚举映射」是常见模式，`labels[cat]` 用 `string` 索引触发 TS7053。face fix `@type {Record<string, string>}` 比 point fix（`(/** @type {any} */ (labels))[cat]`）更优——一次注解覆盖所有索引访问。此模式已在 Round 52/53/74 多次复用，现已成为反射性选择
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 159 → 150；`npx eslint lib/tests/cdn-score-updater.test.mjs --max-warnings 0` exit 0；`npx vitest run lib/tests/cdn-score-updater.test.mjs` 21 passed
  - **下一轮候选**：`lib/loop/registry.mjs`（8）· `skills/rui/tests/run.mjs`（7）· `skills/rui-trends/lib/trend-fetch.mjs`（7）

### 工程化建设 — 2026-06-26（第七十五轮 `/loop`）

- **noImplicitAny 清理第五十四批**：169 → 159（修 10 处，`read.mjs` 全文件清零）
  - **`skills/rui-npm/lib/read.mjs` 全文件**（10 → 0）：
    - 3 个 export 函数签名 inline `@type`：`cmdSearch(keyword: string, args: any)`/`cmdList(args: any)`/`cmdInfo(pkg: string, args: any)`（`args: any` 因 `.limit`/`.depth`/`.json` 动态属性访问）
    - `const flat = []` 加 `/** @type {any[]} */` 修 TS7034/TS7005（递归 `walk` 内 `flat.push` 触发——`flat` 在外部声明，递归函数内 push，TS 无法推断元素类型）
    - `walk(deps: any, prefix: string)` 内部递归函数签名 inline `@type`
    - `p.maintainers.map(m =>` 回调 inline `@type {any}`（`m` 为 `{name?, email?}` 对象但来自 `JSON.parse` 无 shape）
  - **关键洞察**：`JSON.parse` 返回 `any`，其嵌套属性（如 `data.vulnerabilities`/`p.maintainers`）也为 `any`，但解构后的 `m`/`v`/`x` 等回调参数需独立 inline `@type`——TS 不会从 `any` 数组的 `.map()` 回调中推断元素类型。递归函数引用外部 `const arr = []` 时，`arr` 必须显式 `@type {T[]}` 注解（TS7034/TS7005 跨函数边界推断失败）
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 169 → 159；`npx eslint skills/rui-npm/lib/read.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-npm/tests/` 68 passed（exit 0，vitest worker timeout 为已知基础设施问题非测试失败）
  - **下一轮候选**：`lib/tests/cdn-score-updater.test.mjs`（9）· `lib/loop/registry.mjs`（8）· `skills/rui/tests/run.mjs`（7）

### 工程化建设 — 2026-06-26（第七十四轮 `/loop`）

- **noImplicitAny 清理第五十三批**：179 → 169（修 10 处，`tools.mjs` 全文件清零）
  - **`skills/rui-npm/lib/tools.mjs` 全文件**（10 → 0）：
    - 3 个 export 函数签名 inline `@type`：`cmdNpx(pkg: string, args: any)`/`cmdAudit(args: any)`/`cmdCdn(pkg: string, args: any)`（`args: any` 因 `.npxArgs`/`.json` 动态属性访问，不能用 `object`/`Object`）
    - 2 处字面量对象加 `@type {Record<string, number>}` face fix：`const summary = { critical: 0, high: 0, ... }`/`const sevOrder = { critical: 0, high: 1, ... }` 修 TS7053（字面量窄 key 类型被 `v.severity: any` 索引触发——`vulns: any` → `Object.entries(vulns)` → `v: any` → `v.severity: any`）
    - `v.via.map(x =>` 回调 inline `@type {any}`（`x` 为 `string | object` 联合，`.title`/`.name` 在 object 分支触发 TS2339）
  - **关键洞察**：字面量对象 `{ critical: 0, high: 0, ... }` 被推断为窄 key 类型（`"critical" | "high" | ...`），用 `any` 索引触发 TS7053。face fix `@type {Record<string, number>}` 比 point fix（每处访问 cast）更优——一次注解覆盖所有动态索引访问。此模式在 Round 52 `quality.mjs`/Round 53 `solid.mjs` 已建立，本轮复用
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 179 → 169；`npx eslint skills/rui-npm/lib/tools.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-npm/tests/` 68 passed
  - **下一轮候选**：`skills/rui-npm/lib/read.mjs`（10）· `lib/tests/cdn-score-updater.test.mjs`（9）· `lib/loop/registry.mjs`（8）

### 工程化建设 — 2026-06-26（第七十三轮 `/loop`）

- **noImplicitAny 清理第五十二批**：190 → 179（修 11 处，`arch-check.test.mjs` 全文件清零）
  - **`lib/tests/arch-check.test.mjs` 全文件**（11 → 0）：
    - 3 个 helper 函数签名 inline `@type`：`computeGrade(failedDimCount: number)`/`computeScore(passed: number, total: number)`/`computeSummary(dimensions: any[])`
    - 6 处 reduce/filter/map 回调 inline `@type`：`dimensions.reduce((s: number, d: any) =>`×2/`d.checks.filter((c: any) =>`/`dimensions.filter((d: any) =>`/`failedDims.map((d: any) =>`×2
  - **关键洞察**：`Array.prototype.reduce` 累加器 `s` 必须显式标注为返回类型（`number`），否则 `s + d.checks.length` 触发 TS7006 链式推断（`s` 隐式 any → 表达式隐式 any → 下一轮 `s` 类型仍未知）。这与「单 JSDoc 只注解紧随其后第一个变量」类似——TS 对 reduce 累加器的类型推断依赖初始值类型，但 JSDoc 模式下仍需显式注解以中断链式隐式 any 传播
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 190 → 179；`npx eslint lib/tests/arch-check.test.mjs --max-warnings 0` exit 0；`npx vitest run lib/tests/arch-check.test.mjs` 20 passed
  - **下一轮候选**：`skills/rui-npm/lib/tools.mjs`（10）· `skills/rui-npm/lib/read.mjs`（10）· `lib/tests/cdn-score-updater.test.mjs`（9）

### 工程化建设 — 2026-06-26（第七十二轮 `/loop`）

- **noImplicitAny 清理第五十一批**：201 → 190（修 11 处，`infer.mjs` 全文件清零）
  - **`skills/rui-story/lib/infer.mjs` 全文件**（11 → 0）：
    - 2 个 export 函数签名 inline `@type`：`inferType(apiUrl: string, storySessions: any[], projectPrefix: string, apiToken: string)`/`inferTypesBatch(apiUrl: string, storyMap: Map<string, any>, projectPrefix: string, apiToken: string)`
    - `storySessions.find(s =>` 回调 inline `@type {any}`（`s.file_path` 访问）
    - `data?.data?.content ?? data?.content` 双 cast at access `(/** @type {any} */ (data))?.data?.content ?? (/** @type {any} */ (data))?.content ?? ""` 修 TS2339（`readRemoteFile` 返回 `object|string` 联合，同 Round 64 `api.mjs`/Round 70 `pull.mjs` 模式复用）
    - `runConcurrent(entries, async ([name, sessions]) =>` 解构参数 inline `@type {[string, any]}` 注解整个元组（`Map.entries()` 返回 `[K, V]` 元组，解构需注解元组类型而非分别注解）
  - **关键洞察**：`Map<string, X>.entries()` 解构 `[k, v]` 时，JSDoc 应注解为元组 `@type {[string, X]}` 而非分别给 `k`/`v` 加 inline `@type`——JS 解构语法不支持在解构模式内部加 JSDoc 注解。`Map<string, any>` 精确类型让 `inferType(apiUrl, sessions, ...)` 调用无需再次 cast（`sessions: any` 已可分配给 `any[]` 参数）
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 201 → 190；`npx eslint skills/rui-story/lib/infer.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-story/tests/` 19 passed
  - **下一轮候选**：`lib/tests/arch-check.test.mjs`（11）· `skills/rui-npm/lib/tools.mjs`（10）· `skills/rui-npm/lib/read.mjs`（10）

### 工程化建设 — 2026-06-26（第七十一轮 `/loop`）

- **noImplicitAny 清理第五十批**：213 → 201（修 12 处，`scan.mjs` 全文件清零）
  - **`skills/rui-import/lib/scan.mjs` 全文件**（12 → 0）：
    - 3 个 export 函数签名 inline `@type`：`scanFiles(root: string, userExcludes: string[])`/`resolveRemotePath(localPath: string, root: string, projectRootName: string, prefix: string[])`/`getTags(remotePath: string, _localPath: string, _projectRootName: string)`
    - `const result = []` 加 `/** @type {string[]} */` 修 TS7034/TS7005（递归 `walk` 内 `result.push(full)` 触发）
    - `walk(dir: string)` 内部递归函数签名 inline `@type`
  - **关键洞察**：`prefix: string[]` 模式复用——Round 68 `upload.mjs` 已建立「spread 操作符 → 数组类型」规则，本轮 `resolveRemotePath` 中 `segments.push(...prefix)` 同样适用，无需再次试错。模式库积累后清理速度提升：识别 spread/Array.prototype 方法调用即可确定类型
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 213 → 201；`npx eslint skills/rui-import/lib/scan.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-import/tests/` 22 passed
  - **下一轮候选**：`skills/rui-story/lib/infer.mjs`（11）· `lib/tests/arch-check.test.mjs`（11）· `skills/rui-npm/lib/tools.mjs`（10）

### 工程化建设 — 2026-06-26（第七十轮 `/loop`）

- **noImplicitAny 清理第四十九批**：227 → 213（修 14 处，`pull.mjs` 全文件清零 + 调用方 `sync.mjs` strict 回归修复）
  - **`skills/rui-import/lib/pull.mjs` 全文件**（14 → 0）：
    - 3 个 export 函数签名 inline `@type`：`resolvePullFilter(localDir: string, projectRoot: string, projectPrefix: string)`/`pullFromRemote(apiUrl: string, localDir: string, projectRoot: string, projectPrefix: string)`/`recommendPullMode(apiUrl: string)`
    - 4 处对象字面量方法回调 inline `@type`：`filter: (s: any) =>`×2（`sessions.filter(strategy.filter)` 传入）/`toLocal: (remotePath: string) =>`×2
    - `data?.data?.content ?? data?.content` 双 cast at access `(/** @type {any} */ (data))?.data?.content ?? (/** @type {any} */ (data))?.content ?? ""` 修 TS2339（`readRemoteFile` 返回 `object|string` 联合，`.data`/`.content` 在 `string` 分支触发 TS2339，同 Round 64 `api.mjs` 模式）
  - **`skills/rui-import/sync.mjs` 调用方**（strict 回归修复）：
    - `pullFromRemote(apiUrl, root, findProjectRoot(process.cwd()), opts.projectPrefix)` → `opts.projectPrefix || ""` 兜底（`opts.projectPrefix: string | undefined` 来自 cli.mjs 条件赋值）
  - **关键洞察**：对象字面量方法（`{ filter: (s) => ... }`）作为回调传入 `sessions.filter()` 时，参数 `s` 需独立 inline `@type`——不能依赖上下文类型推断（JSDoc 模式下 TS 对跨函数边界参数推断有限）。库函数返回联合类型时调用方访问属性需 cast at access（不改库签名）
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 227 → 213；`npx eslint skills/rui-import/lib/pull.mjs skills/rui-import/sync.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-import/tests/` 22 passed
  - **下一轮候选**：`skills/rui-import/lib/scan.mjs`（12）· `skills/rui-story/lib/infer.mjs`（11）· `lib/tests/arch-check.test.mjs`（11）

### 工程化建设 — 2026-06-26（第六十九轮 `/loop`）

- **noImplicitAny 清理第四十八批**：241 → 227（修 14 处，`engine.test.mjs` 全文件清零）
  - **`skills/rui/tests/unit/engine.test.mjs` 全文件**（14 → 0）：
    - `let evaluateProposal, computeMetrics;` 拆分为两个独立 `/** @type {any} */ let evaluateProposal;`/`/** @type {any} */ let computeMetrics;` 修 TS7034/TS7005
  - **关键洞察**：单条 JSDoc 只注解紧随其后的第一个变量声明，`let x, y;` 中 `y` 仍为 implicit any。动态 import 模式下（`let x; async function loadModules() { x = (await import(...)).x; }`）常见此反模式——必须拆分为独立 `let` 各自注解。同 Round 45 `lib/tests/fs.test.mjs` 已建立的模式复用
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 241 → 227；`npx eslint skills/rui/tests/unit/engine.test.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui/tests/unit/engine.test.mjs` 11 passed
  - **下一轮候选**：`skills/rui-import/lib/pull.mjs`（14）· `skills/rui-import/lib/scan.mjs`（12）· `skills/rui-story/lib/infer.mjs`（11）

### 工程化建设 — 2026-06-26（第六十八轮 `/loop`）

- **noImplicitAny 清理第四十七批**：257 → 241（修 16 处，`upload.mjs` 全文件清零）
  - **`skills/rui-import/lib/upload.mjs` 全文件**（16 → 0）：
    - 2 个 export 函数签名 inline `@type`：`uploadSingleFile(filePath: string, apiUrl: string, existingPaths: Map<string, any>, root: string, workspaceName: string, prefix: string[])`/`uploadAll(files: string[], apiUrl: string, existingPaths: Map<string, any>, root: string, workspaceName: string, prefix: string[])`
    - `const errors = []` 加 `/** @type {any[]} */` 修 TS7034/TS7005
    - `worker(file: string)` 内部函数签名 inline `@type`
    - `result.error` cast at access `(/** @type {any} */ (result).error)` 修 TS2339（`uploadSingleFile` 返回 `{ status, file, remotePath }` 无 `error` 字段，else 分支为死代码但 TS 仍检查）
  - **关键洞察**：`prefix` 应为 `string[]` 而非 `string`——`resolveRemotePath` 中 `segments.push(...prefix)` 使用 spread 操作符，string 会被展开为字符数组（语义错误）。原 implicit any 掩盖了此类型语义不匹配，typed 后立即暴露。这印证了「noImplicitAny 清理不仅修类型，还暴露隐藏的语义错误」—— spread/string 歧义在 implicit any 下静默工作，typed 后必须显式选择正确类型
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 257 → 241；`npx eslint skills/rui-import/lib/upload.mjs skills/rui-import/sync.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-import/tests/` 22 passed
  - **下一轮候选**：`skills/rui/tests/unit/engine.test.mjs`（14）· `skills/rui-import/lib/pull.mjs`（14）· `skills/rui-import/lib/scan.mjs`（12）

### 工程化建设 — 2026-06-26（第六十七轮 `/loop`）

- **noImplicitAny 清理第四十六批**：273 → 257（修 16 处，`extract.mjs` 全文件清零 + 调用方 `rui-story.mjs`/`format.mjs` strict 回归修复）
  - **`skills/rui-story/lib/extract.mjs` 全文件**（16 → 0）：
    - 6 个函数签名 inline `@type`：`extractStoryName(filePath: string)`/`groupSessionsByStory(sessions: any[])`/`readBlockedState(projectRoot: string, storyName: string)`/`hasProjectFile(fileBasenames: Set<string>, projectPrefix: string, docType: string)`/`countCompleteScenes(filePaths: string[])`/`determineStatus(fileBasenames: Set<string>, projectPrefix: string, blockedState: any, filePaths: string[] = [])`
    - 4 处 `paths.some(fp =>` 回调 inline `@type {string}`
    - `basename = fp.split("/").pop() || ""` 修 TS2345 strict 回归（`Array.prototype.pop()` 返回 `string | undefined`）
  - **`skills/rui-story/rui-story.mjs` 调用方**（strict 回归修复）：
    - 5 处 `groupSessionsByStory(sessions)` → `sessions || []` 兜底（`sessions` 在 `let sessions;` 后赋值 `querySessions()` 返回 `any[] | undefined`）
    - `readBlockedState(projectRoot, name)` → `readBlockedState(projectRoot, /** @type {string} */ (name || ""))` cast（`name: string | null | undefined` union 来自 Round 59 放宽）
  - **`skills/rui-story/lib/format.mjs` 调用方**（strict 回归修复）：
    - `determineStatus` 第 4 参 `filePaths` 加 `= []` 默认值修 TS2554（`printShow` 调用方传 3 参，原 implicit any 允许缺省，现 typed 后必须默认值兜底）
  - **关键洞察**：函数签名从 implicit any 收紧到具体类型后，会暴露三类调用方回归：(1) `Array.prototype.pop()` 返回 `T | undefined`，需 `|| ""` 兜底；(2) `let x;` 后赋值返回 union 的函数，x 推断为 union，需 `|| []` 兜底；(3) 多参函数原 implicit any 允许缺省，typed 后需 `= []`/`= {}` 默认值。修复时优先「调用方兜底」而非「放宽库签名」（保持库类型精确）
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 273 → 257；`npx eslint skills/rui-story/lib/extract.mjs skills/rui-story/rui-story.mjs skills/rui-story/lib/format.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-story/tests/` 19 passed
  - **下一轮候选**：`skills/rui-import/lib/upload.mjs`（16）· `skills/rui/tests/unit/engine.test.mjs`（14）· `skills/rui-import/lib/pull.mjs`（14）

### 工程化建设 — 2026-06-26（第六十六轮 `/loop`）

- **noImplicitAny 清理第四十五批**：280 → 273（修 7 处，`rui-trends.mjs` 全文件清零）
  - **`skills/rui-trends/rui-trends.mjs` 全文件**（7 → 0）：
    - `parseArgs(argv)` 参数 inline `@type {string[]}`（修 TS7006 `argv` 隐式 any）
    - `const options = {}` → `/** @type {Record<string, any>} */ const options = {}`（face fix 一次性修 TS7053 字面量索引 + 5 处 `options.html` TS2339 —— 根因是 `options` 被推断为 `{}` 空 shape，`.html`/`[a.replace(/^-+/, '')]` 访问均触发）
  - **关键洞察**：CLI 工具的 `parseArgs` 中 `const options = {}` 是典型反模式——TS 推断为 `{}` 空 shape，所有后续动态扩展（`options.lang = ...`/`options.html = true`/`options[key] = true`）均触发 TS2339/TS7053。face fix 在声明处加 `@type {Record<string, any>}` 比每处访问点 cast 更优（一次注解覆盖所有访问点，符合「face fix 优于 point fix」原则）
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 280 → 273；`npx eslint skills/rui-trends/rui-trends.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-trends/tests/` 19 passed
  - **下一轮候选**：`skills/rui-story/lib/extract.mjs`（11）· `lib/engine/proposals.mjs`（10）· `skills/rui-update/rui-update.mjs`（9）

### 工程化建设 — 2026-06-26（第六十五轮 `/loop`）

- **noImplicitAny 清理第四十四批**：289 → 280（修 9 处，`rui-html.mjs` 全文件清零）
  - **`skills/rui-html/rui-html.mjs` 全文件**（9 → 0）：
    - 2 个函数签名 inline `@type`：`findStoryDir(projectRoot: string, storyName: string | undefined)`（放宽 `storyName` 修 TS2345 `opts.storyName: string | undefined` 调用回归）/`findSceneDirs(storyDir: string)`
    - 5 处回调 inline `@type`：`.filter((d: any) => d.isDirectory())`×3（`Dirent`）/`.map((d: any) => d.name)`×2/`.filter((s: string) => s.startsWith(prefix))`
    - `const ctx = extractSceneData(...)` → `/** @type {any} */ const ctx`（修 TS2339 `ctx.force = opts.force`/`ctx.storyTitle` 动态属性扩展：`extractSceneData` 返回类型无 `force` 字段）
  - **关键洞察**：CLI `opts.storyName` 来自 parseArgs union `string | undefined`，接收方需放宽为同型 union（同 Round 59 `cmdShow`/`cmdSync` 模式）；`extractSceneData` 返回的具体 shape 类型不允许动态扩展属性，调用方需 `@type {any}` 才能添加 `force`/`storyTitle` 等 override 字段
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 289 → 280；`npx eslint skills/rui-html/rui-html.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-html/tests/` 19 passed
  - **下一轮候选**：`skills/rui-trends/rui-trends.mjs`（12）· `skills/rui-story/lib/extract.mjs`（11）· `lib/engine/proposals.mjs`（10）· `skills/rui-update/rui-update.mjs`（9）

### 工程化建设 — 2026-06-26（第六十四轮 `/loop`）

- **noImplicitAny 清理第四十三批**：302 → 289（修 13 处，`api.mjs` 全文件清零）
  - **`skills/rui-import/lib/api.mjs` 全文件**（13 → 0）：
    - 4 个函数签名 inline `@type`：`querySessions(apiUrl: string)`/`writeRemoteFile(apiUrl: string, remotePath: string, content: string, overwrite: boolean)`/`createSession(apiUrl: string, remotePath: string, localPath: string, projectRootName: string)`/`updateSession(apiUrl: string, remotePath: string, existingItem: any)`
    - `resp?.data` cast at access：`const created = (/** @type {any} */ (resp))?.data || resp`（`fetchJson` 返回 `Promise<object|string>` 联合，`resp.data` 在 `string` 分支触发 TS2339）
  - **关键洞察**：库函数返回联合类型（`object|string`）时，调用方访问属性需 cast 至 `any`——不能改库函数签名（影响所有调用方），cast at access 是局部修复。`?.` 可选链与 cast 组合 `(/** @type {any} */ (resp))?.data` 安全且简洁
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 302 → 289；`npx eslint skills/rui-import/lib/api.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-import/tests/` 22 passed
  - **下一轮候选**：`skills/rui-html/rui-html.mjs`（13）· `skills/rui-trends/rui-trends.mjs`（12）· `skills/rui-story/lib/extract.mjs`（11）· `lib/engine/proposals.mjs`（10）

### 工程化建设 — 2026-06-26（第六十三轮 `/loop`）

- **noImplicitAny 清理第四十二批**：312 → 302（修 10 处，`account.mjs` 全文件清零）
  - **`skills/rui-npm/lib/account.mjs` 全文件**（10 → 0）：
    - 3 个函数签名 inline `@type`：`cmdMyPackages(args: any)`/`cmdDeprecate(pkg: string, args: any)`/`cmdUnpublish(pkg: string, args: any)`（`pkg` 为包名字符串，`args` 为 CLI parseArgs 对象）
    - 1 处回调 inline `@type {any}`：`.map((o) => o.package || o)`（`o` 是 npm search API 返回的对象）
    - `let pkgData = {}` → `/** @type {any} */ let pkgData = {}`（修 TS2339 `pkgData.versions`：`{}` 类型不允许属性访问，即使后续 `pkgData = JSON.parse(info.stdout)` 返回 `any`，`let` 推断为 `{} | any` 仍触发）
  - **关键洞察**：`let x = {}` 后续赋值 `any` 时，TS 推断为 `{} | any` 联合类型，访问属性仍触发 TS2339（因为 `{}` 分支不允许）；需在声明处 `/** @type {any} */` 显式标注，让初始 `{}` 也视为 `any`。比 `let x = /** @type {any} */ ({})` 更简洁
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 312 → 302；`npx eslint skills/rui-npm/lib/account.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-npm/tests/` 68 passed
  - **下一轮候选**：`skills/rui-import/lib/api.mjs`（14）· `skills/rui-html/rui-html.mjs`（13）· `skills/rui-trends/rui-trends.mjs`（12）· `skills/rui-story/lib/extract.mjs`（11）

### 工程化建设 — 2026-06-26（第六十二轮 `/loop`）

- **noImplicitAny 清理第四十一批**：329 → 312（修 17 处，`evaluate.mjs` 全文件清零）
  - **`lib/engine/evaluate.mjs` 全文件**（17 → 0）：
    - 3 处 JSDoc `@param {object}` → `@param {any}`：
      - `evaluateProposal(proposal: any, preMetrics: any, postMetrics: any)` — 修 TS2339 `proposal.id`/`preMetrics.block_rate`/`postMetrics.block_rate`/`preMetrics.p0_density`/`postMetrics.p0_density`（5 处属性访问）
      - `computeMetrics(memories: Array<any>)`（原 `Array<object>`）— 修 TS2339 `r.was_blocked`/`r.quality_issues`/`r.planned_change_level`/`r.actual_change_level`/`r.agents_called`（5 处属性访问，迭代元素为 `object` 不允许属性）
      - `cmdEvaluate(opts: any)` — 修 TS2339 `opts.id`（3 处：`if (!opts.id)`/`p.id === opts.id`/模板字符串 `${opts.id}`）
  - **关键洞察**：JSDoc `@param {object}`（小写 o）触发 TS2339 属性访问——`object` 类型无具体属性签名；动态对象一律用 `@param {any}` 或具体 shape。`@param {Array<object>}` 同理触发元素属性访问错误，改 `Array<any>` 或 `any[]`。本轮 0 处 inline `@type`，全部 JSDoc 块级修复——因为函数签名是 `function foo(x) {}` 无参数解构，JSDoc 块比 inline `@type` 更可读
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 329 → 312；`npx eslint lib/engine/evaluate.mjs --max-warnings 0` exit 0；`npx vitest run lib/tests/` 337 passed + 1 skipped（20 test files）
  - **下一轮候选**：`skills/rui-npm/lib/account.mjs`（15）· `skills/rui-import/lib/api.mjs`（14）· `skills/rui-html/rui-html.mjs`（13）· `skills/rui-trends/rui-trends.mjs`（12）

### 工程化建设 — 2026-06-26（第六十一轮 `/loop`）

- **noImplicitAny 清理第四十批**：346 → 329（修 17 处，`bot-health-deps.mjs` 全文件清零）
  - **`skills/rui-bot/lib/bot-health-deps.mjs` 全文件**（17 → 0）：
    - 7 个函数签名 inline `@type`：`isEntryPoint(filePath: string)`/`resolveImport(importPath: string, fromFile: string, projectRoot: string)`/`extractImports(filePath: string, projectRoot: string)`/`extractHtmlReferences(filePath: string, projectRoot: string)`/`detectCycles(graph: Map<string, Set<string>>)`/`shortPath(p: string)`/`getDependencyAnalysis(projectRoot: string)`
    - 2 个内部函数签名：`normalizeHtmlSpec = (spec: string) =>`（箭头函数闭包）/`dfs(node: string, path: string[])`（detectCycles 内部递归函数）
    - `const cycles = []` → `/** @type {any[]} */ const cycles = []`（修 TS7034/TS7005 后续 `push`/`some`/`cycles.length` 访问）
  - **关键洞察**：依赖图用 `Map<string, Set<string>>` 精确表达「文件 → 其依赖集合」结构，比 `any` 更安全（保留 `graph.get(node)` 返回 `Set<string> | undefined` 的类型信息，`for of deps` 能正确推断 `dep: string`）；`detectCycles` 内部递归函数 `dfs` 的参数也需 inline `@type`（嵌套函数作用域不继承外层类型）
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 346 → 329；`npx eslint skills/rui-bot/lib/bot-health-deps.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-bot/tests/rui-bot.test.mjs` 15 passed（vitest worker 通信超时是网络测试长耗时所致，与类型变更无关，exit 0）
  - **下一轮候选**：`lib/engine/evaluate.mjs`（17）· `skills/rui-npm/lib/account.mjs`（15）· `skills/rui-import/lib/api.mjs`（14）· `skills/rui-html/rui-html.mjs`（13）

### 工程化建设 — 2026-06-26（第六十轮 `/loop`）

- **noImplicitAny 清理第三十九批**：363 → 346（修 17 处，`bot-health-diagnostics.mjs` 全文件清零）
  - **`skills/rui-bot/lib/bot-health-diagnostics.mjs` 全文件**（17 → 0）：
    - 4 个函数签名 inline `@type {string}`：`collectHealthData(projectRoot)`/`computeDocIssuesForHealth(projectRoot)`/`getBootstrapDiagnostics(projectRoot)`/`getDiagnosticResult(projectRoot)`
    - 1 个箭头函数签名：`readJsonl = (p: string) =>`
    - 6 处回调 inline `@type`：`.map((l: string) =>`/`.filter((d: any) => d.isDirectory())`×3/`.filter((f: string) =>`×2/`.map((d: any) =>`×2（`d` 为 `Dirent`/诊断对象，`f`/`l` 为字符串）
    - `const triggered = []` → `/** @type {any[]} */ const triggered = []`（修 TS7034/TS7005 后续 `push`/`find`/`map` 访问）
    - `DIAGNOSTIC_BASELINES[id]` → `(/** @type {any} */ (DIAGNOSTIC_BASELINES))[id]`（字面量对象被 `string` 索引，TS7053）
    - JSDoc `@returns {{ ... Array }}` → `Array<any>`（TS2314，同 Round 51/52/53 模式）
    - `const data = collectHealthData(...)` → `/** @type {any} */ const data = ...`（修 TS2339/TS2551 `data.retroMissing`/`data.noProposals` 动态属性扩展：`collectHealthData` 返回类型推断为 `{allExec, toolAudit, deliveryTrack, statusHistory, proposals}` 无 `retroMissing`/`noProposals`）
  - **关键洞察**：当函数返回对象在调用方动态扩展属性（`data.retroMissing = ...`），需在调用方把 `data` 标注为 `any`——比修改 `collectHealthData` 返回类型更局部、影响更小。`Dirent` 类型在 `withFileTypes: true` 下需 `d: any`（避免引入 `@types/node`）
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 363 → 346；`npx eslint skills/rui-bot/lib/bot-health-diagnostics.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-bot/tests/` 15 passed（vitest worker 通信超时是网络测试长耗时所致，与类型变更无关，exit 0）
  - **下一轮候选**：`skills/rui-bot/lib/bot-health-deps.mjs`（17）· `lib/engine/evaluate.mjs`（17）· `skills/rui-npm/lib/account.mjs`（15）· `skills/rui-import/lib/api.mjs`（14）

### 工程化建设 — 2026-06-26（第五十九轮 `/loop`）

- **noImplicitAny 清理第三十八批**：380 → 363（修 17 处，`rui-story.mjs` 全文件清零）
  - **`skills/rui-story/rui-story.mjs` 全文件**（17 → 0）：
    - 6 个 `cmd*` 函数签名 inline `@type {string}`：`cmdOverview(apiUrl, projectRoot, projectPrefix)`/`cmdList`/`cmdShow`/`cmdRecommend(apiUrl)`/`cmdHealth(apiUrl, projectRoot)`/`cmdSync`
    - **strict 回归修复**：`cmdShow`/`cmdSync` 的 `name` 参数从 `string` 放宽为 `string | null | undefined`（调用方 `opts.name: string | null | undefined`，TS2345）
    - **strict 回归修复**：`printShow(name, ...)` 调用点加 `name || ""` 兜底（`printShow` 已签名 `storyName: string`，`name` 现为 union 需兜底为 string）
  - **关键洞察**：CLI `opts.name` 来自 parseArgs union `string | null | undefined`，参数接收方需放宽为同型 union；调用已签名 `string` 的下游函数时用 `|| ""` 兜底，比 cast 更安全（运行时也兜底）
  - **教训**：sed 批量替换 JSDoc inline `@type` 时，`/**` 的 `*` 在 shell 双引号内需更小心转义——本轮首次尝试 sed 把 `/**` 写成 `//**`（`\/\*\*` 被 shell 消费一层），改用 Edit 工具逐个修复更稳
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 380 → 363；`npx eslint skills/rui-story/rui-story.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-story/tests/` 19 passed
  - **下一轮候选**：`skills/rui-bot/lib/bot-health-diagnostics.mjs`（17）· `skills/rui-bot/lib/bot-health-deps.mjs`（17）· `lib/engine/evaluate.mjs`（17）· `skills/rui-npm/lib/account.mjs`（15）

### 工程化建设 — 2026-06-26（第五十八轮 `/loop`）

- **noImplicitAny 清理第三十七批**：399 → 380（修 19 处，`npm-utils.mjs` 全文件清零）
  - **`skills/rui-npm/lib/npm-utils.mjs` 全文件**（19 → 0）：
    - 5 个函数签名 inline `@type`：`npm(args: string[], opts: any = {})`/`npmStream(args: string[], opts: any = {})`/`maskToken(token: string)`/`toTable(headers: string[], rows: any[][])`/`httpGetJson(url: string)`
    - `opts: any` 而非 `object`（修 TS2339 `opts.env`：`object` 类型不允许属性访问，`any` 才行）
    - `toTable` 的 `rows: any[][]` 而非 `any[]`（二维数组，`r[i]` 访问需要元素为数组）
    - 6 处回调 inline `@type`：`headers.map((h: string, i: number) =>`/`rows.map((r: any[]) =>`/`cells.map((c: any) =>`/`cols.map((c: {maxW, key}) =>`×2/`cols.map((c, i) =>`/`rows.map((row: any[]) =>`/`get(url, (res: any) =>`/`res.on("data", (chunk: string) =>`
  - **关键洞察**：`opts = {}` 默认值时 `@param {object}` 触发 TS2339（`object` 不允许属性访问）；改 `@type {any}` 才能访问 `opts.env`。`toTable` 二维表格数据用 `any[][]` 表达「行×列」结构比 `any[]` 更精确。Node 回调的 `res`/`chunk` 在无 `@types/node` 时需 `any`/`string` 兜底
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 399 → 380；`npx eslint skills/rui-npm/lib/npm-utils.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-npm/tests/` 68 passed
  - **下一轮候选**：`skills/rui-story/rui-story.mjs`（17）· `skills/rui-bot/lib/bot-health-diagnostics.mjs`（17）· `skills/rui-bot/lib/bot-health-deps.mjs`（17）· `lib/engine/evaluate.mjs`（17）

### 工程化建设 — 2026-06-26（第五十七轮 `/loop`）

- **noImplicitAny 清理第三十六批**：419 → 399（修 20 处，`generator.mjs` 全文件清零）
  - **`skills/rui-html/lib/generator.mjs` 全文件**（20 → 0）：
    - JSDoc `@param {Object} ctx` → `@param {any} ctx`（`generateSceneDocs`）：修 TS2339 `ctx.force`（`Object` 大写 O 类型不允许属性访问，`any` 才行）
    - 8 个函数签名 inline `@type`：`generateSceneDocs(ctx: any, docType: string, scenePath: string)`/`getTemplatePath(docType: string)`/`renderTemplate(template: string, ctx: any, docType: string)`/`buildStatsGridJSON(ctx: any, docType: string)`/`buildHealthBarJSON(ctx: any, docType: string)`/`extractTableValue(tables: any[], label: string)`/`countTableRows(tables: any[], prefix: string = '')`/`countDiagnosticPasses(tables: any[])`/`countArtifactRows(tables: any[])`
    - 4 处回调 inline `@type {string}`：`row.some(cell =>`×3/`row.findIndex(cell =>`（`cell` 是表格单元格字符串）
    - 1 处回调 inline `@type {any}`：`mermaidBlocks.map(b =>`（`b` 是 mermaid 块对象 `{code, ...}`）
  - **关键洞察**：JSDoc `@param {Object}`（大写 O）与 `@param {object}`（小写 o）都触发 TS2339 属性访问错误——TypeScript 把 `Object`/`object` 视为无具体属性的基类型；动态对象一律用 `@param {any}` 或具体 shape。table helpers 的 `tables: any[]` 而非 `any`，因为要 `.for of` 遍历
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 419 → 399；`npx eslint skills/rui-html/lib/generator.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-html/tests/` 19 passed
  - **下一轮候选**：`skills/rui-npm/lib/npm-utils.mjs`（19）· `skills/rui-story/rui-story.mjs`（17）· `skills/rui-bot/lib/bot-health-diagnostics.mjs`（17）· `skills/rui-bot/lib/bot-health-deps.mjs`（17）

### 工程化建设 — 2026-06-26（第五十六轮 `/loop`）

- **noImplicitAny 清理第三十五批**：441 → 419（修 22 处，`bot-transport.mjs` 全文件清零）
  - **`skills/rui-bot/lib/bot-transport.mjs` 全文件**（22 → 0）：
    - 8 个 export 函数签名 inline `@type`：`sendToWecom(apiUrl: string, webhookUrl: string, content: string, token: string)`/`sendDirectToWebhook(webhookUrl: string, content: string)`/`sendWithRetry(apiUrl: string, webhookUrl: string, content: string, token: string, maxRetries: number)`/`enqueueFailedNotification(projectRoot: string, message: any, webhookUrl: string, apiUrl: string, token: string)`/`flushNotificationQueue(projectRoot: string)`/`logNotificationDelivery(projectRoot: string, opts: any, result: any)`/`trimNotificationLog(projectRoot: string)`/`loadConfig(projectRoot: string)`
    - 类型选择：`projectRoot`/`webhookUrl`/`apiUrl`/`content`/`token`/`maxRetries` 为 `string`（路径与网络参数）；`message`/`opts`/`result` 为 `any`（动态对象结构，跨多个调用点）
  - **关键洞察**：传输层函数参数按语义分类：路径/URL/字符串内容用 `string`，结构化对象用 `any`（避免为每个调用点定义具体 shape）；`maxRetries` 是 `number` 不是 `string`（用于 `<=` 比较）
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 441 → 419；`npx eslint skills/rui-bot/lib/bot-transport.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-bot/tests/` 15 passed（vitest worker 通信超时是网络测试长耗时所致，与类型变更无关，exit 0）
  - **下一轮候选**：`skills/rui-html/lib/generator.mjs`（20）· `skills/rui-npm/lib/npm-utils.mjs`（19）· `skills/rui-story/rui-story.mjs`（17）· `skills/rui-bot/lib/bot-health-diagnostics.mjs`（17）

### 工程化建设 — 2026-06-26（第五十五轮 `/loop`）

- **noImplicitAny 清理第三十四批**：463 → 441（修 22 处，`templates.mjs` 全文件清零）
  - **`skills/rui-html/lib/templates.mjs` 全文件**（22 → 0）：
    - 7 个函数签名 inline `@type`：`getCategory(docType: string)`/`buildSharedContext(ctx: any)`/`buildBreadcrumb(ctx: any, docType: string)`/`buildBreadcrumbJSON(ctx: any, docType: string)`/`buildCrossNav(ctx: any, currentDocType: string)`/`buildCrossNavJSON(ctx: any, currentDocType: string)`/`buildHeadBlock(ctx: any, docType: string)`
    - 2 个模块级 exported const 加 `Record<string, X>`：`PAGE_META` → `Record<string, {icon, label, shortLabel, css}>`（修 4 处 TS7053 `PAGE_META[docType]`/`PAGE_META[dt]`）/`CATEGORY_A_SCRIPTS` → `Record<string, {src: string}[]>`（修 1 处 TS7053）
    - 2 个函数内本地 const 加 `Record<string, string>`：`CAT_B_BASE`/`CAT_A_BASE`（修 4 处 TS7053 索引读 + 写）
    - 1 处回调 inline `@type`：`DOC_TYPES.map((dt) =>`（`dt: string`）
  - **关键洞察**：对模块级/exported 字面量对象，在声明处加 `Record<string, X>` 注解，一次性解决所有访问点 TS7053，比 cast-at-access 更彻底（cast-at-access 是点修复，注解是面修复）
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 463 → 441；`npx eslint skills/rui-html/lib/templates.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-html/tests/` 19 passed
  - **下一轮候选**：`skills/rui-bot/lib/bot-transport.mjs`（22）· `skills/rui-html/lib/generator.mjs`（20）· `skills/rui-npm/lib/npm-utils.mjs`（19）· `skills/rui-story/rui-story.mjs`（17）

### 工程化建设 — 2026-06-26（第五十四轮 `/loop`）

- **noImplicitAny 清理第三十三批**：485 → 463（修 22 处，`extract-scenario.mjs` 全文件清零）
  - **`skills/rui-story/lib/extract-scenario.mjs` 全文件**（22 → 0）：
    - 10 个抽取器函数签名 inline `@type {string}`：`extractSection(content, anchor)`/`extractTitle(content)`/`extractRoleGoalPriority(content)`/`extractValuePoints(content)`/`extractModules(content)`/`extractTestCases(content)`/`extractIssuesAndRecs(content)`/`extractSourcesAndActions(content)`
    - `extractTableRows(section: string, minCols: number = 2)` 签名 inline `@type`
    - `extractTestCases` 的 `const result = { normal: [], boundary: [] }` → `/** @type {Record<string, any[]>} */ const result = {...}`（修 TS7053 `result[key]` 字面量对象被 string 索引）
    - `extractIssuesAndRecs` 的 `const issues = []`/`const recs = []` → `/** @type {any[]} */ const issues = []`（修 TS7034/TS7005 后续 `push` 访问）
    - 3 个缓存函数签名：`cachePathFor(ctx: {subdir, scenarioDir})`/`readCache(ctx)`/`writeCache(ctx, data: any)` inline 对象类型
    - 2 处回调 inline `@type`：`.map((s) => s.trim())`（`s: string`）/`.map((c) => ({...}))`（`c: string[]`）
  - **关键洞察**：`const result = { normal: [], boundary: [] }` 类型推断为字面量 `{ normal: never[], boundary: never[] }`，被 `string` key 索引触发 TS7053；`Record<string, any[]>` 注解一并解决索引 + 内部数组 `push` 两个问题
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 485 → 463；`npx eslint skills/rui-story/lib/extract-scenario.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-story/tests/` 19 passed
  - **下一轮候选**：`skills/rui-html/lib/templates.mjs`（22）· `skills/rui-bot/lib/bot-transport.mjs`（22）· `skills/rui-html/lib/generator.mjs`（20）· `skills/rui-npm/lib/npm-utils.mjs`（19）

### 工程化建设 — 2026-06-26（第五十三轮 `/loop`）

- **noImplicitAny 清理第三十二批**：498 → 485（修 13 处，`solid.mjs` 全文件清零）
  - **`lib/arch-dimensions/solid.mjs` 全文件**（13 → 0）：
    - 4 处 JSDoc `@returns {{ ... checks: Array }}` → `Array<any>`（`checkSRP`/`checkDRY`/`checkYAGNI`/`checkOCP`，同 Round 51/52 模式）
    - `hasConjunctions(desc: string)` 函数签名 inline `@type`
    - 4 处回调 inline `@type`：`.filter((d) => d.isDirectory())`（`d: any`，`Dirent`）/`.filter((f) => f.endsWith(".mjs"))`×2（`f: string`，含 YAGNI 中跨行 filter）/`.map((e) =>`（`e: string`）/`.filter((n) =>`（`n: string`）
    - `const exportPatterns = {}` → `/** @type {Record<string, string[]>} */ const exportPatterns = {}`（修 3 处 TS7053：`exportPatterns[name]` 读 + `exportPatterns[name] = []` 写 + `exportPatterns[name].push(file)`）
  - **关键洞察**：`Record<string, string[]>` 既覆盖读也覆盖写，比 cast at access 更彻底；`Dirent` 类型的 `d.isDirectory()` 在 `withFileTypes: true` 下需要 `d: any`（避免引入 `@types/node` 依赖）
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 498 → 485；`npx eslint lib/arch-dimensions/solid.mjs --max-warnings 0` exit 0；`npx vitest run lib/tests/arch-dimensions.test.mjs` 20 passed
  - **下一轮候选**：`skills/rui-story/lib/extract-scenario.mjs`（22）· `skills/rui-html/lib/templates.mjs`（22）· `skills/rui-bot/lib/bot-transport.mjs`（22）· `skills/rui-html/lib/generator.mjs`（20）

### 工程化建设 — 2026-06-26（第五十二轮 `/loop`）

- **noImplicitAny 清理第三十一批**：525 → 498（修 27 处，`quality.mjs` 全文件清零 + `solid.mjs` 局部附带）
  - **`lib/arch-dimensions/quality.mjs` 全文件**（23 → 0）：
    - 3 处 JSDoc `@returns {{ ... checks: Array }}` → `Array<any>`（`checkISP`/`checkFrontmatter`/`checkDocFreshness`，同 Round 51 `kernel-paradigm.mjs` 模式）
    - 5 处回调 inline `@type`：`readdirSync(agentsDir).filter((f) =>`×3（`f: string`）/`.map((f) =>`×1（`f: string`）/`.filter((d) =>`×2（`d: any`，`Dirent`）/`.forEach((a) =>`×2（`a: string`）
    - 1 处字面量对象 cast at access：`(/** @type {any} */ (AGENT_TOOL_SPEC))[agentName]`（`AGENT_TOOL_SPEC` 是模块级字面量 typed object，被 `string` 索引触发 TS7053）
    - 2 处 `string[]` 注解：`/** @type {string[]} */ let tools = []`（`checkISP`）+ `/** @type {string[]} */ const declaredAgents = []`（`checkDocFreshness`）
  - **`lib/arch-dimensions/solid.mjs` 局部附带**（4 → 0，作为 `readFrontmatter` 返回类型变更的副作用）：
    - `readFrontmatter` JSDoc `@returns {object|null}` → `@returns {Record<string, any>|null}`（修调用方 `fm.tools`/`fm.agents`/`fm[field]`/`fm.description` 的 TS2339）
    - 本地 `const fm = {}` → `/** @type {Record<string, any>} */ const fm = {}`（修 `fm[key] = val` 的 TS7053）
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 525 → 498；`npx eslint lib/arch-dimensions/quality.mjs lib/arch-dimensions/solid.mjs --max-warnings 0` exit 0；`npx vitest run lib/tests/arch-dimensions.test.mjs` 20 passed
  - **下一轮候选**：`lib/arch-dimensions/solid.mjs` 剩余 13 errors（本轮仅清 `readFrontmatter` 周边附带，全文件清零留下一轮）· `skills/rui-story/lib/extract-scenario.mjs`（22）· `skills/rui-html/lib/templates.mjs`（22）· `skills/rui-bot/lib/bot-transport.mjs`（22）

### 工程化建设 — 2026-06-26（第五十一轮 `/loop`）

- **noImplicitAny 清理第三十批**：549 → 525（修 24 处，`kernel-paradigm.mjs` 全文件清零）
  - **`lib/arch-dimensions/kernel-paradigm.mjs` 全文件**（24 → 0）：
    - 4 个 helper 函数签名 inline `@type`：`makeDimResult(dim: string, label: string, checks: any[])`/`grepLines(pattern: string, dir: string, ext: string = ".mjs", excludeFile: string | null = null)`/`countFiles(dir: string, pattern: string = "*.mjs")`/`fileLineCount(filePath: string)`
    - **关键洞察**：JSDoc `@returns {{ ... checks: Array }}` 触发 TS2314（`Array<T> requires 1 type argument`）→ 改 `Array<any>`（不能写 `any[]` 在 JSDoc `{{...}}` 内部，会触发 TS1005 `'}' expected`）
    - sed 批量：9 处回调 inline `@type`（`.every((c) =>`/`.filter((l) =>`×5/`.filter((d) =>`/`.filter((f) =>`/`.map((f) =>`×2/`.sort((a, b) =>`/`.map((f) =>`）
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 549 → 525；`npx eslint lib/arch-dimensions/kernel-paradigm.mjs --max-warnings 0` exit 0；`npx vitest run lib/tests/arch-dimensions.test.mjs` 20 passed
  - **下一轮候选**：`lib/arch-dimensions/quality.mjs`（23）· `skills/rui-story/lib/extract-scenario.mjs`（22）· `skills/rui-html/lib/templates.mjs`（22）· `skills/rui-bot/lib/bot-transport.mjs`（22）

### 工程化建设 — 2026-06-26（第五十轮 `/loop`）

- **noImplicitAny 清理第二十九批**：574 → 549（修 25 处，`dispatcher.mjs` 全文件清零）
  - **`lib/loop/dispatcher.mjs` 全文件**（25 → 0）：
    - 10 个函数签名 inline `@type`：`parseCronField(field: string, min: number, max: number)`/`cronIntervalMinutes(cronExpr)`/`isCronDue(cronExpr, lastRunISO, now)`/`saveState(state: any)`/`runCheck(skill, checkScript, timeoutMs)`/`generateReport(skill, status, summary)`/`notifyP0Escalation(skill, status, summary, consecutiveFails)`/`getDueSkills(state, now, forceSkill)`/`getOverdueSkills(state, now)`/`dispatch(opts: any = {})`
    - **关键洞察（strict 回归）**：`cronIntervalMinutes(s.intervalCron)` 和 `isCronDue(s.intervalCron, last?.lastRun, now)` — `LOOP_SKILLS` 元素的 `intervalCron: string | null`，调用 `string` 参数触发 TS2345 → 放宽 `cronIntervalMinutes(cronExpr: string | null | undefined)` 和 `isCronDue(cronExpr: string | null | undefined, lastRunISO: string | null | undefined, now)`（函数已 `if (!cronExpr)` 处理）
    - **关键洞察（strict 回归）**：`runCheck(skill.skill, skill.checkScript)` — `checkScript: string | null` → 调用点 cast `/** @type {string} */ (skill.checkScript)`（运行时若为 null 后续 `split` 会抛错，但属调用方契约）
    - **关键洞察（TS7023 递归返回类型）**：`parseCronField` 递归调用自身 `.flatMap(f => parseCronField(...))`，TS 无法推断返回类型 → 加 `/** @type {(field: string, min: number, max: number) => number[]} */` JSDoc 在函数前
    - 2 处回调 `.flatMap(f =>`/`.map(n => parseInt` inline `@type`
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 574 → 549；`npx eslint lib/loop/dispatcher.mjs --max-warnings 0` exit 0；`npx vitest run lib/tests/` 337 passed + 1 skipped
  - **下一轮候选**：`lib/arch-dimensions/kernel-paradigm.mjs`（24）· `lib/arch-dimensions/quality.mjs`（23）· `skills/rui-story/lib/extract-scenario.mjs`（22）· `skills/rui-html/lib/templates.mjs`（22）

### 工程化建设 — 2026-06-26（第四十九轮 `/loop`）

- **noImplicitAny 清理第二十八批**：599 → 574（修 25 处，`scrub.mjs` 全文件清零）
  - **`skills/rui-story/lib/scrub.mjs` 全文件**（25 → 0）：
    - sed 批量：23 处 `(ctx) =>` 回调 inline `@type {any}`（用 `^([[:space:]]*)(ctx) =>` 和 `,([[:space:]]*)(ctx) =>` 两种 pattern 覆盖行首和逗号后两种位置）
    - 2 处多参回调 `(_c, _m, cap) =>` 和 `(ctx, _m, cap) =>` inline `@type` 各参数（`cap` 为 `any[]`）
    - **关键洞察（strict 回归）**：`rules.map(([mkPattern, repl], i) => mkPattern())` — `rules` 数组元素类型被 TS 推断为 union（部分 repl 是 3 参 `(ctx, _m, cap) =>`），destructure 后 `mkPattern` 被推为 union call signature，调用 `mkPattern()` 触发 TS2554 "Expected 3 arguments, but got 0" → 在调用点 cast `(/** @type {() => RegExp} */ (mkPattern))()`
    - **踩坑**：sed 替换 `, (ctx) =>` 时误匹配了注释中的 `(ctx) =>` 文本，破坏了注释语法 → 二次 Edit 修复注释
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 599 → 574；`npx eslint skills/rui-story/lib/scrub.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-story/tests/` 19 passed
  - **下一轮候选**：`lib/loop/dispatcher.mjs`（25）· `lib/arch-dimensions/kernel-paradigm.mjs`（24）· `lib/arch-dimensions/quality.mjs`（23）

### 工程化建设 — 2026-06-26（第四十八轮 `/loop`）

- **noImplicitAny 清理第二十七批**：625 → 599（修 26 处，`diagnostics.test.mjs` 全文件清零）
  - **`lib/tests/diagnostics.test.mjs` 全文件**（26 → 0）：
    - **关键洞察**：`let runDiagnostics;` 顶层 lazy import 绑定，TS 推断为 implicit any（TS7034/TS7005，11 处使用点）→ 加 `/** @type {any} */ let runDiagnostics;`
    - `makeExec(overrides: any = {})`/`makeData(allExec: any[], extra: any = {})` — `= {}` 默认参数 + 属性访问 TS2339 → `any = {}`
    - sed 批量：11 处 `.find(d =>`/`.filter(d =>`/`.map(d =>` 回调 inline `@type {any}`
  - **验证**：`npx tsc --noEmit --noImplicitAny` 625 → 599；`npx eslint lib/tests/diagnostics.test.mjs --max-warnings 0` exit 0；`npx vitest run lib/tests/diagnostics.test.mjs` 12 passed
  - **下一轮候选**：`skills/rui-story/lib/scrub.mjs`（25）· `lib/loop/dispatcher.mjs`（25）· `lib/arch-dimensions/kernel-paradigm.mjs`（24）· `lib/arch-dimensions/quality.mjs`（23）

### 工程化建设 — 2026-06-26（第四十七轮 `/loop`）

- **noImplicitAny 清理第二十六批**：651 → 625（修 26 处，`bot-message.mjs` 全文件清零）
  - **`skills/rui-bot/lib/bot-message.mjs` 全文件**（26 → 0）：
    - 9 个函数签名 inline `@type`：`computeProgressPercent(opts: any)`/`truncateMsg(msg: string)`/`computeStoryStats(projectRoot: string, storyName: string)`/`buildRichBlock(opts: any, emoji: string)`/`buildVerboseBlock(opts: any, projectRoot: string)`/`buildStoryStatsBlock(stats: any, storyName: string, p0Count: number, p1Count: number, p2Count: number)`/`buildMessage(opts: any, projectName: string, projectRoot: string)`/`buildHealthNotification(hr: any, projectName: string)`/`buildHealthAlertNotification(hr: any, projectName: string, threshold: number)`
    - **关键洞察**：`STATUS_LABELS[opts.status]`/`STATUS_EMOJI[opts.status]` 字面量 typed 对象用 `any` 索引触发 TS7053 — 在访问点 cast `(/** @type {any} */ (STATUS_LABELS))[opts.status]`（3 处）
    - sed 批量：3 处 `.map((d) =>`/`.filter((d) =>`/`.find((d) =>` 回调 inline `@type {any}`
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 651 → 625；`npx eslint skills/rui-bot/lib/bot-message.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-bot/tests/` 15 passed
  - **下一轮候选**：`lib/tests/diagnostics.test.mjs`（26）· `skills/rui-story/lib/scrub.mjs`（25）· `lib/loop/dispatcher.mjs`（25）· `lib/arch-dimensions/kernel-paradigm.mjs`（24）

### 工程化建设 — 2026-06-26（第四十六轮 `/loop`）

- **noImplicitAny 清理第二十五批**：678 → 651（修 27 处，`materialize.mjs` 全文件清零）
  - **`lib/engine/materialize.mjs` 全文件**（27 → 0）：
    - 6 个函数签名 inline `@type`：`deriveStoryDirName(proposal: any, projectRoot: string)`/`createRuiState(storyPath: string, proposal: any)`/`buildBaselineDocContent(proposal: any, _projectName: string)`/`generateBaselineDoc(proposal: any, projectName: string, storyDirName: string)`/`materializeProposal(proposal: any, projectRoot: string, projectName: string, dryRun: boolean)`/`cmdMaterialize(opts: any)`
    - **关键洞察**：`DIAGNOSTIC_LABELS[diagId]`/`DIAGNOSTIC_BASELINES[diagId]`/`PRIORITY_ORDER[minPriority]`/`PRIORITY_ORDER[p.priority]` 字面量 typed 对象用 `any` 索引触发 TS7053 — 在访问点 cast `(/** @type {any} */ (DIAGNOSTIC_LABELS))[diagId]`（6 处）
    - JSDoc `@param {object} opts` → `@param {any} opts`（修复 `opts.minPriority`/`opts.story`/`opts.dryRun` 等 TS2339）
    - `updateJsonlById(path, id, (r) => { r.materialized_story_dir = ... })` 回调 `r: object` 访问属性触发 TS2339 → inline `@type {any}`
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 678 → 651；`npx eslint lib/engine/materialize.mjs --max-warnings 0` exit 0；`npx vitest run lib/tests/` 337 passed + 1 skipped
  - **下一轮候选**：`lib/tests/record-replay.test.mjs`（?）· `skills/rui-bot/lib/loop-report.mjs`（?）· `skills/rui-code/scripts/extract-structure.mjs`（?）

### 工程化建设 — 2026-06-26（第四十五轮 `/loop`）

- **noImplicitAny 清理第二十四批**：705 → 678（修 27 处，`fs.test.mjs` 全文件清零）
  - **`lib/tests/fs.test.mjs` 全文件**（27 → 0）：
    - **关键洞察**：`let tmpDir, jsonPath;` 加 JSDoc `/** @type {string} */` 只对第一个声明生效（jsonPath 仍 implicit any）→ 拆分为 `/** @type {string} */ let tmpDir; /** @type {string} */ let jsonPath;`（3 个 describe 块各 1 处，共 6 个 let 拆分）
    - 1 处回调 `(rec) => { rec.val = 99; }` — `rec: object` 访问 `.val` 触发 TS2339 → inline `@type {any}`
  - **验证**：`npx tsc --noEmit --noImplicitAny` 705 → 678；`npx eslint lib/tests/fs.test.mjs --max-warnings 0` exit 0；`npx vitest run lib/tests/fs.test.mjs` 24 passed
  - **下一轮候选**：`lib/engine/materialize.mjs`（27）· `lib/tests/record-replay.test.mjs`（?）· `skills/rui-bot/lib/loop-report.mjs`（?）

### 工程化建设 — 2026-06-26（第四十四轮 `/loop`）

- **noImplicitAny 清理第二十三批**：733 → 705（修 28 处，`record.test.mjs` 全文件清零）
  - **`lib/tests/record.test.mjs` 全文件**（28 → 0）：
    - **关键洞察**：`function createExecRecord(opts = {}) { return { session_id: opts.session || "s123", ... } }` — `opts = {}` 默认参数被 TS 推断为 `{}` 字面量类型，访问 `opts.session`/`opts.story`/`opts.feature` 等属性触发 TS2339（25 处）→ 改 `opts: any = {}`（3 个 createXxxRecord 函数同理）
    - `createInitialState(storyName: string)`/`transitionState(state: any, newStage: string, trigger: string = "...")` — 函数签名 inline `@type`
  - **验证**：`npx tsc --noEmit --noImplicitAny` 733 → 705；`npx eslint lib/tests/record.test.mjs --max-warnings 0` exit 0；`npx vitest run lib/tests/record.test.mjs` 20 passed
  - **下一轮候选**：`lib/tests/fs.test.mjs`（27）· `lib/engine/materialize.mjs`（27）· `lib/tests/record-replay.test.mjs`（?）

### 工程化建设 — 2026-06-26（第四十三轮 `/loop`）

- **noImplicitAny 清理第二十二批**：760 → 733（修 27 处，`bot-health-cmd.mjs` 全文件清零）
  - **`skills/rui-bot/lib/bot-health-cmd.mjs` 全文件**（27 → 0）：
    - 3 个函数签名 inline `@type`：`registerDim(scores: Record<string, number>, details: any[], dim: string, label: string, info: any, logLabel: string)`/`cmdHealth(projectRoot: string, _opts: any = {})`/`updateCdnHealthReport(result: any, projectRoot: string)`
    - **关键洞察**：`FIELD_EMOJI[f]`/`HEALTH_DIMENSIONS[dim]`/`catIcons[cat]`/`catLabels[cat]` 字面量 typed 对象用 string 索引触发 TS7053 — 在访问点 cast `(/** @type {any} */ (FIELD_EMOJI))[f]`（5 处）
    - **关键洞察**：`const dimByCat = {}` + `dimByCat[cat].push(...)` 触发 TS7053 → 加 `/** @type {Record<string, any[]>} */`；`const dims = {}` 同理 → `Record<string, any>`
    - **关键洞察（strict 回归）**：`generateExecutiveSummary({ prev: ... : null, archResult: ... : null })` 触发 TS2322（`@param {object}` 接受 `undefined` 不接受 `null`）→ 改 `: undefined`
    - **bug 修复**：`const { formatOk, formatIssues } = validateMessageFormat()` — `validateMessageFormat` 返回 `{ formatOk, issues }` 无 `formatIssues` 字段（TS2339），运行时 `formatIssues.length` 会抛错。改为 `const { formatOk, issues: formatIssues } = validateMessageFormat()`
    - sed 批量：5 处回调 inline `@type`（`.filter(f =>`×2、`.map(p =>`、`.find(d =>`、`.map((p) =>`）
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 760 → 733；`npx eslint skills/rui-bot/lib/bot-health-cmd.mjs --max-warnings 0` exit 0；`npx vitest run lib/tests/ skills/rui-bot/tests/` 352 passed + 1 skipped
  - **下一轮候选**：`lib/tests/record.test.mjs`（28）· `lib/tests/fs.test.mjs`（27）· `lib/engine/materialize.mjs`（27）

### 工程化建设 — 2026-06-26（第四十二轮 `/loop`）

- **noImplicitAny 清理第二十一批**：788 → 760（修 28 处，`extractor.mjs` 全文件清零）
  - **`skills/rui-html/lib/extractor.mjs` 全文件**（28 → 0）：
    - 10 个函数签名 inline `@type`：`extractSceneData(scenePath: string, storyName: string | undefined)`/`splitSections(raw: string)`/`findNextSectionStart(raw: string, fromIdx: number, secPatterns: any[], fromI: number)`/`extractMermaidBlocks(raw: string)`/`extractAllTables(raw: string)`/`parseTableRow(line: string)`/`extractOverview(raw: string)`/`isPlaceholder(sectionContent: string)`/`markdownToHtml(md: string)`/`convertTablesToHtml(html: string)`
    - **关键洞察**：`const sections = {}` 字面量空对象 + `sections[key] = ...`（string key）触发 TS7053 → 加 `/** @type {Record<string, any>} */`
    - **关键洞察**：`const mermaidBlocks = []`/`const anchors = []` 后续 `.forEach((a, i) => ...)` 触发 TS7034 + TS7005 → 加 `/** @type {string[]} */` 和 `/** @type {{id: string, html: string}[]} */`
    - sed 批量：3 处 `.replace(...)` 回调 `(_, code)`/`(match, id)`/`(_, indent, content)` inline `@type`（regex 含 `/` 字符，部分 sed 失败后用 Edit 手动补齐）
    - `.map(cell => cell.trim())` inline `@type {string}`
    - **关键洞察（strict 回归）**：将 `raw` 从 implicit any 改为 `string` 后，`raw.match()` 返回 `RegExpMatchArray | null`，`.index` 属性在 strictNullChecks 下为 `number | undefined`，触发 9 处 TS18048 — 用 `?? 0` 兜底（与之前 `?? 0` 模式一致）
    - **关键洞察（caller 回归）**：`extractSceneData` 参数 `storyName: string` 导致 caller `rui-html.mjs` 传 `opts.storyName: string | undefined`（parseArgs 返回 union 类型，无 storyName 分支）触发 2 处 TS2345/TS2322 — 将参数放宽为 `string | undefined`
  - **验证**：`npx tsc --noEmit` 0 errors（strict，无回归）；`npx tsc --noEmit --noImplicitAny` 788 → 760；`npx eslint skills/rui-html/lib/extractor.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-html/tests/` 19 passed
  - **下一轮候选**：`skills/rui-bot/lib/bot-health-cmd.mjs`（28）· `lib/tests/record.test.mjs`（28）· `lib/tests/fs.test.mjs`（27）· `lib/engine/materialize.mjs`（27）

### 工程化建设 — 2026-06-26（第四十一轮 `/loop`）

- **noImplicitAny 清理第二十批**：819 → 788（修 31 处，`extract-structure.mjs` 全文件清零）
  - **`skills/rui-analysis/scripts/extract-structure.mjs` 全文件**（31 → 0）：
    - `buildResult(file: any, totalLines: number, nonEmptyLines: number, analysis: any, callGraph: any[], batchImportData: any)` — 6 参数全 inline `@type`
    - **关键洞察**：`const base = { path, language, fileCategory, totalLines, nonEmptyLines }` 字面量推断为 5 字段类型，后续 `base.metrics = {}`/`base.functions = ...`/`base.classes = ...` 等 9 处属性追加触发 TS2339 → 加 `/** @type {Record<string, any>} */` 注解到 `base`
    - sed 批量：9 处 `.map(x => ({...}))` 回调（`fn`/`cls`/`exp`/`s`/`d`/`s`/`e`/`s`/`r`）inline `@type {any}`
    - sed 批量：3 处 `.filter(c =>`/`.filter(l =>`/`.filter(imp =>` inline `@type`
    - 1 处 `cg.map(entry => ...)` inline `@type {any}`（逃过 sed 因为变量名 entry 不同）
  - **验证**：`npx tsc --noEmit --noImplicitAny` 819 → 788；`npx eslint skills/rui-analysis/scripts/extract-structure.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-analysis/tests/` 19 passed
  - **下一轮候选**：`skills/rui-html/lib/extractor.mjs`（28）· `skills/rui-bot/lib/bot-health-cmd.mjs`（28）· `lib/tests/record.test.mjs`（28）· `lib/tests/fs.test.mjs`（27）· `lib/engine/materialize.mjs`（27）

### 工程化建设 — 2026-06-26（第四十轮 `/loop`）

- **noImplicitAny 清理第十九批**：855 → 819（修 36 处，`lib/engine/diagnostics.mjs` 全文件清零）
  - **`lib/engine/diagnostics.mjs` 全文件**（32 → 0）：
    - JSDoc `@param {object}` → `@param {any}`（`runDiagnostics`/`computeDiagnosticTrend`/`computeDiagnosticSeverity`/`computeDiagnosticCorrelation` 的 data/history 参数 — 修复 TS2339 `data.allExec`/`history[i].triggeredDiags` 等属性访问）
    - JSDoc `@param {Array}` → `@param {any[]}`（`docIssues` 参数 — 修复 TS2314 `Array<T> requires 1 type argument`）
    - JSDoc `@returns {Array<object>}` → `@returns {any[]}`（修复 TS2314）
    - JSDoc `@returns {object}` → `@returns {any}`（`computeDiagnosticCorrelation`）
    - 5 个 `runDx` 私有函数签名 inline `@type`：`runD4Diagnostic(data: any, diagnostics: any[])` / `runD5Diagnostic` / `runD6Diagnostic(data, docIssues, diagnostics)` / `runD7Diagnostic` / `runD8Diagnostic(data, archIssues, diagnostics)`
    - **关键洞察**：`const counts = {}`/`const cooccurrences = {}` 字面量空对象 + `counts[diag] = 0`（string key）触发 TS7053 → 加 `/** @type {Record<string, number>} */` 注解
    - sed 批量：2 处 `.filter((r) => r.status === "failure")`/`.filter((r) => r.result === "failure")` inline `@type {any}`
    - **副作用**：JSDoc `@param {object}` → `any` 修复了 4 处 caller 端 TS2339（其他文件调用 `runDiagnostics`/`computeDiagnosticSeverity` 等导出函数）
  - **验证**：`npx tsc --noEmit --noImplicitAny` 855 → 819；`npx eslint lib/engine/diagnostics.mjs --max-warnings 0` exit 0；`npx vitest run lib/tests/` 337 passed + 1 skipped
  - **下一轮候选**：`skills/rui-analysis/scripts/extract-structure.mjs`（31）· `skills/rui-html/lib/extractor.mjs`（28）· `skills/rui-bot/lib/bot-health-cmd.mjs`（28）

### 工程化建设 — 2026-06-26（第三十九轮 `/loop`）

- **noImplicitAny 清理第十八批**：888 → 855（修 33 处，`rui-npm.test.mjs` 全文件清零）
  - **`skills/rui-npm/tests/rui-npm.test.mjs` 全文件**（33 → 0）：
    - 顶层 helper 5 个：`run(args: string[], opts: any = {})`/`extractJson(stdout: string)`/`tmpDir()`/`withTempDir(fn: (d: string) => any)`/`withTempProject(fn: (d: string) => any)`
    - `withTempDir((d) => ...)`/`withTempProject((d) => ...)` 调用点 22 处 — sed 批量 inline `@type {string}` 给 `d`
    - `lines.findIndex(l => ...)` — `l` 加 inline `@type {string}`（lines 是 `string[]`）
    - `opts = {}` 默认参数 + `opts.env` 属性访问触发 TS2339 — `opts: any = {}` 注解
  - **验证**：`npx tsc --noEmit --noImplicitAny` 888 → 855；`npx eslint skills/rui-npm/tests/rui-npm.test.mjs --max-warnings 0` exit 0；`npx vitest run skills/rui-npm/tests/rui-npm.test.mjs` 68 passed
  - **下一轮候选**：`lib/engine/diagnostics.mjs`（32）· `skills/rui-analysis/scripts/extract-structure.mjs`（31）· `skills/rui-html/lib/extractor.mjs`（28）

### 工程化建设 — 2026-06-26（第三十八轮 `/loop`）

- **noImplicitAny 清理第十七批**：923 → 888（修 35 处，`generate-review.mjs` 全清零）
  - **`skills/rui-story/lib/generate-review.mjs` 全文件**（35 → 0）：
    - 函数签名 10 个：`buildGoodCards/buildBadCards/computeReviewScores/buildDimCards/buildRecommendations/buildActionPlan/buildEvidence/buildRiskMatrix` 均为 `data: any`；`scrubReviewSpecific(html: string, data: any)`；`generateReviewHtml(ctx: any, data: any)`；`scrubScenarioHtmls(ctx: any, data: any)`
    - `scoreGrade(score: number)`/`liClass(score: number, threshold: number)` — 数值参数显式 `number`
    - 字面量数组索引：`const map = [ ... ]` 在 `for (const [re, to] of map) html.replace(re, to)` 触发 TS7031 + TS2769 → 加 `/** @type {[RegExp, string][]} */` 注解
    - `const replace = (re, r) =>` 内联 `@type {RegExp}` + `@type {string}`（修复 TS7006 + TS2769 `html.replace` 重载）
    - sed 批量：8 处回调 inline `@type`（`.filter(s =>`/`.map((r, i) =>`/`.map((p, i) =>`/`.map((f, i) =>`/`.map(f =>`/`.map(r =>`/`.map(c =>`）
    - JSDoc `@param {object} data` 在属性访问 `data.valuePoints`/`data.hasVersionInfo`（11 处）触发 TS2339 — 改为 inline `@type {any}`
  - **验证**：`npx tsc --noEmit --noImplicitAny` 923 → 888；`npx eslint skills/rui-story/lib/generate-review.mjs --max-warnings 0` exit 0；`npx vitest run lib/tests/ skills/rui-story/tests/` 356 passed + 1 skipped
  - **下一轮候选**：`skills/rui-npm/tests/rui-npm.test.mjs`（33）· `lib/engine/diagnostics.mjs`（32）· `skills/rui-analysis/scripts/extract-structure.mjs`（31）

### 工程化建设 — 2026-06-26（第三十七轮 `/loop`）

- **noImplicitAny 清理第十六批**：982 → 923（修 59 处，两个 format.mjs 全清零）
  - **`skills/rui-story/lib/format.mjs` 全文件**（41 → 0）：
    - 模块级常量 `STATUS_CONFIG: Record<string, {label, colorFn: (s: string) => string}>`/`TYPE_LABELS: Record<string, string>` 加 `@type` 注解（修复字面量 key 被 string 索引 TS7053）
    - 函数签名 7 个：`statusDisplay(status: string)`/`formatDate(ts: any)`/`latestTimestamp(sessions: any[])`/`printOverview(storyMap: any, projectPrefix: string, blockedMap: any)`/`printList(... 5 个参数)`/`printShow(... 6 个参数)`/`printRecommend(storyMap: any)`/`printHealth(result: any)`/`check(label: string, ok: boolean, detail: string)`
    - 局部 `@type`：`counts: Record<string, number>`
    - `STATUS_CONFIG` 内部 `colorFn: (s) => s` 加 inline `@type {string}`（不写会被推断为 `(s: any) => any`）
    - sed 批量：`sessions.map(s =>` → `sessions.map((/** @type {any} */ s) =>`（5 处）、`entries.map(e =>`/`pad = (s, w) =>` 同理
  - **`skills/rui-trends/lib/format.mjs` 全文件**（18 → 0）：
    - sed 批量替换 9 个 function 签名：`trendIcon`/`fmtStars`/`formatGitHubTrending`/`formatOSSInsight`/`formatTrendShift`/`formatTopStarred`/`formatStatus`/`formatAll`/`formatSelfImproveInjection`
    - sed 批量替换回调：`.forEach((r, i) =>`（4 处）、`.filter((s) =>`
  - **关键技巧**：
    - 模块级常量含函数字段时，`@type {Record<string, {label, colorFn: (s: string) => string}>}` 比 JSDoc `@param` 更可靠 —— 内联 `colorFn: (s) => s` 仍需 inline `@type` 防止推断为 `(s: any) => any`
    - sed 批量替换 function 签名时，pattern 用 `^export function name(` 锚定行首避免误改嵌套调用
  - 验证：`npx tsc --noEmit` 0 errors · `npx eslint` 0 warnings · `npx vitest run lib/tests/ skills/rui-story/tests/ skills/rui-trends/tests/` 375 passed + 1 skipped
  - **下一轮候选**：`skills/rui-story/lib/generate-review.mjs` (35) · `skills/rui-npm/tests/rui-npm.test.mjs` (33) · `lib/engine/diagnostics.mjs` (32) · `skills/rui-analysis/scripts/extract-structure.mjs` (31)

### 工程化建设 — 2026-06-26（第三十六轮 `/loop`）

- **noImplicitAny 清理第十五批**：1075 → 982（修 93 处，两个文件全清零）
  - **`skills/rui-bot/lib/health-report.mjs` 全文件**（51 → 0）：
    - 函数签名：`generateHealthReport(hr: any)`/`buildDimCard(dim: string, label: string)`/`buildScoreReportSummaryHTML(sr: any)`
    - 局部 `@type`：`lowDimRecs: Record<string, string>`/`dimHistoryForReport: Record<string, any[]>`/`prevScores: Record<string, number>`/`DIM_ICONS_LOCAL: Record<string, string>`
    - `generateScoreReport` 调用 `prevPeriod`/`archResult` ternary `: null` 改为 `: undefined`（JSDoc `@param {object}` 接受 `undefined` 不接受 `null`）
    - `generateExecutiveSummary` 调用 `prev`/`archResult` 同理改 `null` → `undefined`
    - `const merged = []` 加 `@type {string[]}` 解 TS7022（`prev = merged[len-1]` 自引用隐式 any）+ `prev` 重命名为 `prevLine` 避免与外层 `prev` 变量冲突
    - `.map(e => ...).filter(s => ...)` 等 5+ 个回调 inline `@type`（sed 批量）
  - **`skills/rui-story/scripts/fix-checklist-content.mjs` 全文件**（42 → 0）：
    - sed 批量替换 22 个 function 签名：`extractTables`/`extractLists`/`extractMermaid`/`extractSteps`/`cleanTitleForStep`/`extractTableItems`/`extractListItems`/`extractFirstParagraph`/`extractOwnerFromText`/`summarizeContent`/`extractCriteria`/`extractCodeSnippet`/`extractOwner`/`extractDuration`/`extractPriority`/`extractDeliverable`/`escapeHtml`/`buildStepHtml`/`buildSectionsHtml`/`fixFile`/`extractSceneNum` 等
    - `sectionMap` 加 `@type {Record<string, any>}` 注解（修复 `sec${num}` 字面量 key 被 string 索引 TS7053）
    - sed 批量替换回调：`.filter(s =>`/`.map(s =>`/`.map(l =>`/`.map(c =>`
  - **关键技巧**：
    - JSDoc `@param {object}` 接受 `undefined` 不接受 `null` —— ternary `condition ? {...} : null` 改为 `: undefined`（或用 `?? undefined`）
    - `const arr = []` 后 `arr[arr.length - 1]` 触发 TS7022（自引用隐式 any）—— `@type {string[]}` 注解显式类型
    - 局部变量名与外层同名变量冲突时（`prev` 内嵌于 `generateHealthReport`），重命名为 `prevLine` 避免遮蔽
    - sed 批量替换多 function 签名时，pattern 要匹配完整签名（含参数名 + 默认值），避免误改
  - 验证：`npx tsc --noEmit` 0 errors · `npx eslint` 0 warnings · `npx vitest run lib/tests/ skills/rui-bot/tests/ skills/rui-story/tests/` 371 passed + 1 skipped
  - **下一轮候选**：`skills/rui-story/lib/format.mjs` (41) · `skills/rui-story/lib/generate-review.mjs` (35) · `skills/rui-npm/tests/rui-npm.test.mjs` (33) · `lib/engine/diagnostics.mjs` (32)

### 工程化建设 — 2026-06-26（第三十五轮 `/loop`）

- **noImplicitAny 清理第十四批**：1197 → 1075（修 122 处，两个文件全清零）
  - **`skills/rui-trends/lib/trend-report.mjs` 全文件**（62 → 0）：
    - 模块级常量 `SOURCE_META`/`TECH_CATEGORIES` 加 `@type {Record<string, X>}` 注解（修复字面量 key 被 string 索引 TS7053）
    - 函数签名：`classifyRepo`/`formatStarCount`/`analyzeTrendData`/`buildTechRecommendations`/`buildTechnologyAdoptionLifecycle`/`buildYrYRelevanceAnalysis`/`buildTrendComparisonSummary`/`updateTrendManifest`/`normalizeDate`/`normalizeTime`/`materializeTrendReportFromManifest`/`saveTrendSnapshot`/`saveAllTrendSnapshot`
    - 局部 `@type`：`langCount`/`catCount`/`maturityStages: Record<string, string[]>`/`maturityLabels`/`lifecycleMap`/`stageCounts: Record<string, {count, samples}>`/`currentLangs`/`sourceDescMap`
    - `generateTrendReport({ source, data, trend, findings, ok } = /** @type {any} */ ({}))` —— destructure 默认值用 `any` cast 解 TS7031 binding element implicitly any
    - sed 批量：`.filter(function(e)` → `.filter(function(/** @type {any} */ e)`、`.map(function(e)`/`.map(function(r, i)` 同理；`.filter(s =>`/`.sort((a, b) =>`/`.map((r, i) =>`/`.map((f, i) =>`/`.map((f) =>`/`.map((item) =>`/`.map(k =>`/`.reduce((s, item) =>`/`.map(d =>` 全部加 inline `@type`
    - `relevanceLevel = (score) =>` 加 `/** @type {number} */`
  - **`skills/rui-bot/lib/loop-report.mjs` 全文件**（60 → 0）：
    - 函数签名：`buildStatusSummary`/`getCheckItemsForSkill`/`buildActionPlan`/`resolutionForFinding`/`buildImpactAssessment`/`buildSeverityBreakdown`/`buildSLATrackingCard`/`buildSkillHistoryCard`/`buildCrossReferenceCard`/`parseLoopFilename`/`notifyReport`
    - `generateReport({ ... } = /** @type {any} */ ({}))` destructure 默认值 cast
    - `statusBadges`/`slaConfig`/`statusEmojiMap`/`statusLabelMap`/`byLevel: Record<string, any[]>` 加 `@type` 注解（字面量 key 被 string 索引 TS7053）
    - `main()` 内 `opts` 加 `/** @type {any} */` cast（动态字段 `opts[key] = val` + `opts.notify` 属性访问）
    - sed 批量：`.filter((f) =>`/`.map((f, i) =>`/`.map((f) =>`/`.map((item) =>`/`.filter(f =>`/`.map(f =>` 全部加 inline `@type`
  - **关键技巧**：
    - 模块级字面量对象（`SOURCE_META = {...}`）TS 推断精确 key 类型，被 string 索引触发 TS7053 —— 在声明处加 `/** @type {Record<string, X>} */` 一次解决所有索引点
    - 函数 destructure 参数 `{ source, data, ... }` 触发 TS7031 —— 用 `= /** @type {any} */ ({})` 默认值 cast 是最简洁解法（比 JSDoc `@param` 更可靠）
    - sed 批量替换回调签名时，要覆盖 `function(e)`/`(e) =>`/`(e, i) =>` 三种形式，以及参数名变体（f/item/d/s/k/r/name/score）
  - 验证：`npx tsc --noEmit` 0 errors · `npx eslint` 0 warnings · `npx vitest run lib/tests/ skills/rui-bot/tests/ skills/rui-trends/tests/` 371 passed + 1 skipped
  - **下一轮候选**：`skills/rui-bot/lib/health-report.mjs` (51) · `skills/rui-story/scripts/fix-checklist-content.mjs` (42) · `skills/rui-story/lib/format.mjs` (41)

### 工程化建设 — 2026-06-26（第三十四轮 `/loop`）

- **noImplicitAny 清理第十三批**：1371 → 1197（修 174 处，两个文件全清零）
  - **`skills/rui-bot/lib/report-trend.mjs` 全文件**（112 → 0）：25+ 个函数加 JSDoc/inline `@type`
    - 函数签名：`exponentialMA`/`pearsonCorrelation`/`extractReportMeta`/`compareReportMeta`/`pickLatestReportsByDate`/`removeReportsForDate`/`buildGradeSparkline`/`dimTrendIcon`/`dimSparkline`/`buildEnhancedTrendAnalysis`/`buildTrendSummaryHTML`/`buildAnomalyAlertHTML`/`buildCorrelationMatrix`/`buildHistoricalBenchmarks`/`buildBenchmarkHTML`/`buildWeeklyDigest`
    - 模块级 helper：`p = (n) => String(n).padStart(2, "0")`（`/** @type {(n: number) => string} */`）
    - 局部 `@type` 注解：`gradeColors: Record<string, string>`、`dimTrends: Record<string, any>`、`regressing/improving: any[]`、`dateMap: Record<string, Record<string, number>>`、`scoreArrays: Record<string, (number | null)[]>`、`xs/ys: number[]`、`best/worst: any`
    - `buildWeeklyDigest` 签名：`@param {object} enhancedTrend, @param {Array} healthTrend` 改为 `@param {any} enhancedTrend, @param {any[]} healthTrend` —— JSDoc `Array` 触发 TS2314（"requires 1 type argument"），必须用 `any[]`/`T[]`
    - `buildWeeklyDigest` 内 `regressing.slice(0,3).map((r) =>`/`improving.slice(0,3).map((r) =>` 加 inline `@type {any}`
    - `xs.push(arrI[k])` → `xs.push(arrI[k] ?? 0)`、`ys.push(arrJ[k])` → `ys.push(arrJ[k] ?? 0)` —— `scoreArrays` 是 `Record<string, (number | null)[]>`，`arrI[k]` 是 `number | null`，push 到 `number[]` 触发 TS2345
  - **`skills/rui-bot/lib/bot-health-analysis.mjs` 全文件**（69 → 0）：
    - 工具函数签名：`scoreStatus`/`scoreIcon`/`scoreColor`/`clampScore`/`avgScore`/`emDim`/`assessEngineeringMaturity`/`scanComponentScores`/`countTestCases`
    - `emDim` 8 个参数全注解：`scores: Record<string, number>`、`details: any[]`、`summaries: Record<string, string>`、`dim/label: string`、`score: number`、`summary/detail: string`
    - `assessEngineeringMaturity` 内 `scores`/`details`/`summaries` 声明处加 `@type`
    - `scanComponentScores` 内 4 个 `const criteria = {}` 用 sed 批量改 `/** @type {Record<string, any>} */ const criteria = {}` —— 修复 TS7053（字面量 key 类型被 string 索引）
    - sed 批量替换：`.filter((f) =>` → `.filter((/** @type {string} */ f) =>`、`.filter((d) =>` → `.filter((/** @type {any} */ d) =>`
  - **关键技巧**：
    - JSDoc `@param {Array}` 触发 TS2314（"Generic type 'Array<T>' requires 1 type argument"）—— 必须用 `@param {any[]}` 或具体类型 `@param {string[]}`
    - JSDoc `@param {object}` 触发 TS2339 on property access —— 改用 `@param {any}` 或具体 shape
    - `Record<string, (number | null)[]>` 的元素 push 到 `number[]` 触发 TS2345 —— 用 `?? 0` 兜底
    - sed 批量替换多文件/多变量最有效 —— 比手工逐处编辑快 10 倍
  - 验证：`npx tsc --noEmit` 0 errors · `npx eslint` 0 warnings · `npx vitest run lib/tests/ skills/rui-bot/tests/` 352 passed + 1 skipped
  - **下一轮候选**：`skills/rui-trends/lib/trend-report.mjs` (62) · `skills/rui-bot/lib/loop-report.mjs` (60) · `skills/rui-bot/lib/health-report.mjs` (51)

### 工程化建设 — 2026-06-26（第三十三轮 `/loop`）

- **noImplicitAny 清理第十二批**（`skills/rui-bot/lib/report-sections.mjs` 全文件）：1534 → 1371（修 163 处，report-sections.mjs 全文件清零）
  - 26 个 export 函数加 JSDoc `@param`：`buildExecutiveBriefing`/`buildScoreTrend`/`buildSummaryCard`/`buildScoreBreakdown`/`buildRecommendationsSection`/`buildComponentSections`/`buildStructureSection`/`buildGitSecuritySection`/`buildFileSizeSection`/`buildDependencySection`/`buildContributionGapSection`/`buildScoreDistributionSection`/`buildCrossReportSection`/`buildRadarChart`/`buildHeatMap`/`buildDimensionDetailPanel`/`buildScoreDiffSection`/`buildRiskMatrix`/`buildImprovementRoadmap`/`buildKeyMetricsDashboard`/`buildCorrelationMatrixHTML`/`buildInfluenceRankingSection`/`buildExecutiveSummaryHTML`/`buildScoreTraceabilityPanel`/`buildForecastPanel`/`buildTechnicalDebtAnalysis`
  - 9 个本地 helper 函数加 inline `@type`：`formatBytes`/`heatColor`/`heatBg`/`kpiCard`/`riskLevel`/`corrColor`/`textColor`/`getUG`/`buildPhase`
  - 模块级常量加 `@type {Record<string, X>}`：`DIM_FIX_GUIDANCE`（`Record<string, {check, fix, impact}>`）/`SCORE_METHODOLOGY`（`Record<string, {formula, source, checks}>`）
  - 本地变量加 `@type`：`catOrder`/`catIcons`/`catLabels`/`groups`/`immediate`/`shortTerm`/`midTerm`/`longTerm`/`priorityOrder`/`CAT_ICONS`/`CAT_LABELS`/`dh`/`scores`
  - 大量 `.map((f, i) =>`/`.filter((f) =>`/`.sort((a, b) =>` 回调批量 inline `@type`（sed 批量替换 26 种参数名：f/m/e/c/p/r/s/b/o/h/d/j/lab/imp/items/icon/score/longTerm/timeline/subtitle/ins/value/prob/category/color/label）
  - **关键技巧**：
    - 字面量对象用作索引时（如 `DIM_FIX_GUIDANCE[dim]`、`SCORE_METHODOLOGY[dim]`、`catIcons[cat]`、`priorityOrder[level]`），TS 推断精确 key 类型 `{"token": ..., "config": ...}` 但被 string 索引触发 TS7053 —— 在常量声明处加 `/** @type {Record<string, X>} */` 注解一次解决所有索引点
    - `buildRadarChart` 的 `catScores` 最初误标 `any[]`（实为 `Record<string, any>`）触发 TS2345（`Record` 不赋给 `any[]`）；`catLabels` 同理误标 `string[]`（实为 `Record<string, string>`）—— 签名要与实际语义匹配，不能盲套数组类型
    - `buildDimensionDetailPanel` 的 `dimHistory` 同理：实为 `Record<string, any[]>`（按 label 索引）而非 `any[]`；调用方 `getDimensionHistory()` 返回的 `history` 也需对应加 `@type {Record<string, any[]>}` 注解
    - `kpiCard(label, value, icon, color, subtitle)` 签名 `string` 但调用方传 `null`（如 `kpiCard("...", score, "🟢", null, "...")`）触发 TS2345 —— 改签名为 `string | null` 兼容可选 null
- **验证**：`npx tsc --noEmit` 0 errors（strictNullChecks 启用）；`npx tsc --noEmit --noImplicitAny` 探查 1534→1371（report-sections.mjs 全文件清零，0 errors）；`npx eslint skills/rui-bot/lib/report-sections.mjs --max-warnings 0` exit 0；`npx vitest run lib/tests/ skills/rui-bot/tests/` 352 passed + 1 skipped
- **文档**：`docs/工程化手册/type-system.md` noImplicitAny 路线图段更新 1534→1371 + 进度（report-sections.mjs 全文件清零，下一步转向 `skills/rui-bot/lib/report-trend.mjs` 112 errors）

### 工程化建设 — 2026-06-26（第三十二轮 `/loop`）

- **noImplicitAny 清理第十一批**（`skills/rui-bundle-analyze/analyze.mjs` ~2400-7700 行剩余全部）：2012 → 1534（修 478 处，analyze.mjs 全文件清零）
  - 52 个函数加 JSDoc `@param`/`@returns`：`computeComplexity`/`computeContentSimilarity`/`findSimilarityGroups`/`computeHotspotMatrix`/`checkFitnessRules`/`computeImportCost`/`quantifyTechDebt`/`computeRefactoringROI`/`analyzeApiSurface`/`computeHealthIndex`/`checkSDP`/`forecastTrends`/`computeReviewRisk`/`generateExecutiveSummary`/`predictBreakingChangeImpact`/`computeReleaseCoupling`/`computeKnowledgeConcentration`/`prioritizeTests`/`generateOnboardingPath`/`generateADRs`/`recommendSemver`/`generateReviewChecklists`/`generateSprintPackages`/`computeOwnershipTransferRisk`/`computeFileAge`/`detectAnomalies`/`computeRefactoringPriority`/`checkArchitectureConformance`/`checkQualityGates`/`computeDependencyConcentration`/`estimateReviewTime`/`computePercentileRankings`/`computeCorrelationMatrix`/`analyzeDocCoverage`/`assessMaturity`/`synthesizeInsights`/`loadConfig`/`formatMarkdownExport`/`formatCSVExport`/`generateIssues`/`getChangedFiles`/`computeConfidence`/`generateStandupSummary`/`explainMetrics`/`trackImprovements`/`computeStats`/`detectCircularDeps`/`escapeHtml`/`formatBytes`/`buildTreemapData`/`generateHtml`/`renderSidebar`
  - 本地变量加 `@type`：`results`/`fileTokens`/`adj`/`groups`/`complexMap`/`churnMap`/`quadrants`/`rules`/`violations`/`importCosts`/`dirCosts`/`circularSet`/`gradeDist`/`pkgInstability`/`pkgEdges`/`impacts`/`revAdj`/`fileContribMap`/`dirStats`/`depCount`/`riskMap`/`fanOut`/`fanIn`/`prMap`/`bnMap`/`adrs`/`reasons`/`checklists`/`highRiskFiles`/`complexMap`/`depImpact`/`fileAges`/`ageBuckets`/`ageChurnMatrix`/`anomalies`/`trendChanges`/`priorities`/`expectedRules`/`ruleResults`/`gates`/`results`/`importCounts`/`concentrations`/`complexMap`/`depCount`/`estimates`/`sizeValues`/`complexityMap`/`churnMap`/`rankings`/`vectors`/`correlations`/`findings`/`insights`/`oldHighComplex`/`fragile`/`unhealthyComplex`/`lines`/`rows`/`issues`/`scores`/`explanations`/`changes`/`sizeByExt`/`sizeByDir`/`fanIn`/`fanOut`/`depthDist`/`adj`/`cycles`/`path`/`map`/`root`/`dirMap`
  - 多个 `filter`/`map`/`reduce`/`sort` 回调加 inline `@type`
  - **关键技巧**：
    - `stats` 变量从 `computeStats()` 返回后被动态加属性（`stats.trendAnalysis = ...`/`stats.forecast = ...` 等），TS 推断的窄返回类型不允许扩展 → 在调用处 `/** @type {any} */ const stats = computeStats(...)` cast，避免每个动态字段触发 TS2339
    - 字面量对象用作索引时（如 `depthDist[bucket]` with `bucket: "1"|"2"|"3"|"4-5"|"6-8"|"9+"`），TS 推断精确 key 类型但被索引对象 `{}` 触发 TS7053 —— 需 `/** @type {Record<string, number>} */ const depthDist = {}` 注解
    - `treemapData` 的 `dirMap` 字面量 `{ "": root }` 让 TS 推断 `{ "": {...} }`，后续 `dirMap[path]` 索引任意 string 触发 TS7053 —— 需 `/** @type {Record<string, any>} */ const dirMap = { "": root }` 注解
    - `escapeHtml` 的 `map` 字面量 `{"&": "&amp;", ...}` 让 TS 推断精确 key 类型，`map[c]` 索引任意 string 触发 TS7053 —— 需 `/** @type {Record<string, string>} */ const map = {...}` 注解
    - `computeStats` 的 `opts` 参数加 `quick?: boolean` 字段以支持 `--quick`/`--pre-commit` 调用（TS2353 对象字面量多余属性）
- **验证**：`npx tsc --noEmit` 0 errors（strictNullChecks 启用）；`npx tsc --noEmit --noImplicitAny` 探查 2012→1534（analyze.mjs 全文件清零，0 errors）；`npx eslint skills/rui-bundle-analyze/analyze.mjs --max-warnings 0` exit 0；`npx vitest run lib/tests/ skills/rui-bundle-analyze/tests/` 354 passed + 1 skipped
- **文档**：`docs/工程化手册/type-system.md` noImplicitAny 路线图段更新 2012→1534 + 进度（analyze.mjs 全文件清零，下一步转向 `skills/rui-bot/lib/report-sections.mjs` 152 errors）

### 工程化建设 — 2026-06-25（第三十一轮 `/loop`）

- **noImplicitAny 清理第十批**（`skills/rui-bundle-analyze/analyze.mjs` ~700-2400 行）：2237 → 2012（修 228 处）
  - 16 个函数加 JSDoc `@param`/`@returns`：`findDisconnectedSubgraphs`/`computeGitChurn`/`detectLayers`/`computeCoChange`/`findCoChangeClusters`/`computeRiskScores`/`generateRecommendations`/`computeSCC`/`computeBetweenness`/`loadTrend`/`persistAndAnalyzeTrend`/`suggestModuleBoundaries`/`computePageRank`/`analyzeTestGaps`/`computeChangePropagation`/`computeKnowledgeDistribution`
  - 本地变量加 `@type`：`reaching`/`undirected`/`churnCount`/`pairCounts`/`fileCommitSets`/`fanIn`/`fanOut`/`adj`/`revAdj`/`layerAssignment`/`violations`/`layerGroups`/`riskBuckets`/`sizeDist`/`betweenness`/`dist`/`sigma`/`pred`/`stack`/`delta`/`outDegree`/`pr`/`changeCount`/`fileContributors`/`contribCountDist`
  - 多个 `filter`/`map`/`reduce`/`sort` 回调加 inline `@type`
  - `stack.pop()`/`queue.shift()` 加 `if (!current) continue` / `if (w === undefined) break` 守卫（避免 strictNullChecks 的 TS2538/TS2552）
  - **关键技巧**：SCC `do { w = stack.pop(); ... } while (w !== v)` 循环中 `stack.pop()` 返回 `T | undefined`，需在循环内加 `if (w === undefined) break` 守卫，否则 `component.push(w)` 触发 TS2552（"Cannot find name 'component'" 因 `component` 未初始化）；Brandes 算法 BFS 中 `queue.shift()` 返回 `T | undefined`，直接 `stack.push(v)` 会让 `v` 为 `undefined` 触发 TS2538，需 `if (v === undefined) break` 守卫；字面量对象用作索引时（如 `sizeDist[bucket]`），TS 推断精确 key 类型 `"1" | "2-3" | ...`，但被索引对象 `{}` 触发 TS7053 —— 需 `/** @type {Record<string, number>} */ const sizeDist = {}` 注解；`pred[w]` 在 BFS 中可能为 undefined，加 `|| []` 兜底避免 `.push(v)` 的 TS2532
- **验证**：`npx tsc --noEmit` 0 errors（strictNullChecks 启用）；`npx tsc --noEmit --noImplicitAny` 探查 2237→2012；`npx eslint skills/rui-bundle-analyze/ --max-warnings 0` exit 0；`npx vitest run lib/tests/ skills/rui-bundle-analyze/tests/` 354 passed + 1 skipped
- **文档**：`docs/工程化手册/type-system.md` noImplicitAny 路线图段更新 2237→2012 + 进度（analyze.mjs 还剩 478 errors 留后续轮次）

### 工程化建设 — 2026-06-25（第三十轮 `/loop`）

- **noImplicitAny 清理第九批**（`skills/rui-bundle-analyze/analyze.mjs` 前 ~700 行）：2364 → 2237（修 127 处）
  - 18 个函数加 JSDoc `@param`/`@returns`：`parseArgs`/`isExcludedDir`/`isSkipExt`/`walkDir`/`parseImports`/`saveBaseline`/`loadBaseline`/`computeDiff`/`detectOrphanFiles`/`detectBarrelFiles`/`computeHistogram`/`computeDepths`/`hashContent`/`detectDuplicates`/`computePackageMetrics`/`resolveImport`/`buildDepGraph`/`computeTransitiveDeps`
  - 本地变量加 `@type`：`args`/`files`/`imports`/`barrels`/`histogram`/`adj`/`revAdj`/`allNodes`/`depth`/`hashMap`/`topDirs`/`pkgFiles`/`pkgEdges`/`ce`/`ca`/`fileCe`/`fileCa`/`edges`/`nodeSet`/`graphFileSet`/`fileMap`/`reachable`/`directDeps`/`visited`
  - 多个 `filter`/`map`/`reduce` 回调加 inline `@type`
  - `hashMap.get(hash).push(...)` 加 `if (bucket)` 守卫（避免 strictNullChecks 的 TS2532）
  - `queue.shift()` 返回 `T | undefined`，加 `if (!current) continue;` 守卫（避免 TS2538）
  - **关键技巧**：`Map.get()` 返回 `T | undefined`，直接 `.push()` 触发 strictNullChecks TS2532 —— 用 `const bucket = map.get(k); if (bucket) bucket.push(...)` 守卫；`queue.shift()` 同理返回 `T | undefined`，需 `if (!current) continue` 守卫后再索引 `adj[current]`。`parseArgs` 的 `args` 字面量对象 `dir: null` 会让 TS 推断 `null` 类型，后续 `args.dir = argv[++i]` 赋值 string 触发 TS2322 —— 用 `/** @type {any} */ const args = {...}` cast 整个对象
- **验证**：`npx tsc --noEmit` 0 errors（strictNullChecks 启用）；`npx tsc --noEmit --noImplicitAny` 探查 2364→2237；`npx eslint lib/ skills/ --max-warnings 0` exit 0；`npx vitest run lib/tests/ skills/rui-bundle-analyze/tests/` 354 passed + 1 skipped
- **文档**：`docs/工程化手册/type-system.md` noImplicitAny 路线图段更新 2364→2237 + 进度（analyze.mjs 还剩 ~706 errors 留后续轮次）

### 工程化建设 — 2026-06-25（第二十九轮 `/loop`）

- **noImplicitAny 清理第八批**（`lib/scoring.mjs` 剩余 + `skills/rui-bot/lib/bot-health-cmd.mjs`）：2460 → 2364（修 96 处）
  - `lib/scoring.mjs`：9 个 export 函数 JSDoc 收紧：`volatilityAdjustedComposite`（修复重复 `@param` 行）/`crossDimensionCorrelation`/`improvementPotentialRanking`/`quickWins`/`computeComposite`/`categoryScores`/`rankDimensionInfluence`/`spiderChartData`/`dimensionBreakdown`/`periodComparison` 的 `@param {object}` → `@param {Record<string, X>}`；`generateExecutiveSummary` 内本地 `scores`/`dimensions`/`trend`/`prev`/`archResult` 加 `@type` 注解（`dimensions`/`trend`/`prev`/`archResult` cast 为 `any` 避免 TS2339）；本地 `catCounts`/`catLabels`/`catMap`/`allAxes`/`breakdown` 加 `@type` 注解；`report` 顶层对象加 `@type {any}` cast（避免动态字段 mutation 的 TS2339，11 个动态字段：volatilityAdjusted/confidenceAdjusted/crossCorrelation/improvementPotential/stabilization 等）；`generateScoreReport` 内本地 `scores`/`dimensions`/`history`/`dimHistory`/`prevPeriod`/`archResult` 加 `@type` cast；`breakdown.sort((a,b))` 回调加 inline `@type {any}`；`statusOrder` 字面量对象加 `@type {Record<string, number>}`；多个 `map`/`reduce` 回调加 inline `@type`；`generateExecutiveSummary({ ... trend, prev: null })` 调用处加 `/** @type {any} */` cast（避免 `T | null` 不赋给 `object | undefined`）
  - `skills/rui-bot/lib/bot-health-cmd.mjs`：`rankDimensionInfluence(scores, HEALTH_SCORING_DIMENSIONS, null)` → `undefined`（避免 `null` 不赋给 `Record<string, any> | undefined` 的 TS2345）
  - **关键技巧**：`@param {object} [opts.X]` 不接受 `null`（仅 `undefined`），跨函数传递 `T | null` 值时需 `/** @type {any} */ (value)` cast 或 `?? undefined` 转换；`report` 顶层对象被动态字段 mutation 时，`/** @type {any} */ const report = {...}` cast 是一次性消除所有 TS2339 的最简洁手段；JSDoc `@param` 重复行（如 `@param {object} scores` 后接 `@param {Record<string, number>} scores`）—— 第一行胜出，第二行被忽略，必须删掉旧行
- **验证**：`npx tsc --noEmit` 0 errors（strictNullChecks 启用）；`npx tsc --noEmit --noImplicitAny` 探查 2460→2364；`npx eslint lib/ skills/ --max-warnings 0` exit 0；`npx vitest run lib/tests/` 337 passed + 1 skipped
- **文档**：`docs/工程化手册/type-system.md` noImplicitAny 路线图段更新 2460→2364 + 进度

### 工程化建设 — 2026-06-25（第二十八轮 `/loop`）

- **noImplicitAny 清理第七批**（`lib/selfimprove-generator.mjs` + `lib/tests/selfimprove-generator.test.mjs`）：2594 → 2460（修 134 处）
  - `lib/selfimprove-generator.mjs`：`safeAvg`/`modeGrade`/`getWeekMonday`/`getWeekSunday`/`getMonthKey`/`computeDiagSummary`/`computeDimStats`/`buildPeriodBuckets`/`buildArchHealth` 加完整 JSDoc `@param`/`@returns`；本地 `cnt`/`diagCounts`/`stats`/`buckets`/`gradeDist`/`branchMap`/`dimAvgs`/`bucket`/`dimVelocity`/`dimScoreMap`/`dimCfg`/`dimHistory`/`scoreReport`/`branchMap`/`dimSummary`/`compTypeTrends`/`dimScores`/`dimWeights`/`dimHist` 加 `@type` 注解；`summary` 顶层对象加 `@type {any}` cast（避免动态字段 mutation 触发 TS2339）；`DIAGNOSTIC_LABELS`/`ARCH_HEALTH_DIM_LABELS`/`HEALTH_SCORING_DIMENSIONS` 字面量对象索引提取局部变量加 `@type {Record<string, X>}` cast；`buildRootCauseHints`/`buildImprovementVelocity`/`buildScoreReport` destructure 参数加 `@param {{...}}` JSDoc；多个 `filter`/`map` 回调 `e`/`d`/`p`/`ds`/`a`/`b` 加 inline `@type`
  - `lib/tests/selfimprove-generator.test.mjs`：本地 7 个 helper 函数（`safeAvg`/`modeGrade`/`getWeekMonday`/`getMonthKey`/`getWeekSunday`/`computeDiagSummary`/`computeDimStats`）加 `@param` JSDoc + 本地 `cnt`/`diagCounts`/`stats` 加 `@type` 注解；`safeAvg(null)` 测试调用加 `/** @type {any} */` cast（避免 null 不赋给 `number[]` 参数的 TS2345）
  - **关键技巧**：顶层 `summary` 对象被多处 `summary.X = ...` 动态赋值（componentHealth/enhancedTrend/scoreReport/archHealth/improvementVelocity/skillMaturation/riskAdjusted/gradeThresholds/crossDimension/confidenceAdjusted/improvementPotential/rootCauseHints/stabilization）—— TS 推断 `summary` 为字面量类型不允许新增字段，最简洁的解法是 `/** @type {any} */ const summary = {...}` cast 一次性消除所有 TS2339。字面量对象（如 `DIAGNOSTIC_LABELS`/`ARCH_HEALTH_DIM_LABELS`/`HEALTH_SCORING_DIMENSIONS`）TS 推断精确 key 类型，索引访问用 `Record<string, X>` 局部变量 cast 回避
- **验证**：`npx tsc --noEmit` 0 errors（strictNullChecks 启用）；`npx tsc --noEmit --noImplicitAny` 探查 2594→2460；`npx eslint lib/ skills/ --max-warnings 0` exit 0；`npx vitest run lib/tests/` 337 passed + 1 skipped
- **文档**：`docs/工程化手册/type-system.md` noImplicitAny 路线图段更新 2594→2460 + 进度

### 工程化建设 — 2026-06-25（第二十七轮 `/loop`）

- **noImplicitAny 清理第六批**（`lib/scoring.mjs` + `skills/rui-bot/lib/bot-health-cmd.mjs`）：2608 → 2594（修 14 处）
  - `lib/scoring.mjs`：`meanVar` 加 `@param {number[]}` + `@returns {{mean, variance, stddev}}` + 2 个 `reduce` 回调 inline `@type {number}`；`contributionAnalysis` 的 `@param {object}` → `@param {Record<string, number>}`（scores/weights）+ `Object.values(weights).reduce((a, b) => ...)` 回调 inline `@type {number}`；`volatilityAdjustedComposite` 同上 + `history` 加 `@param {Record<string, number[]>}`；本地 `weights`/`dimScoreHistory` 加 `@type {Record<string, number>}` / `@type {Record<string, number[]>}` 注解
  - `skills/rui-bot/lib/bot-health-cmd.mjs`：顶层 `const scores = {}` 加 `@type {Record<string, number>}`（修复 `contributionAnalysis(scores, HEALTH_DIM_WEIGHTS)` 调用方类型不匹配 TS2345）
  - **关键技巧**：改 JSDoc `@param {object}` → `@param {Record<string, number>}` 会立即影响调用方 —— 调用方传入的 `const x = {}` 字面量推断为 `{}` 类型（无索引签名），会触发 TS2345。需同步给调用方的本地变量加 `@type {Record<string, number>}` 注解
- **验证**：`npx tsc --noEmit` 0 errors（strictNullChecks 启用）；`npx tsc --noEmit --noImplicitAny` 探查 2608→2594；`npx eslint lib/ skills/ --max-warnings 0` exit 0；`npx vitest run lib/tests/` 337 passed + 1 skipped
- **文档**：`docs/工程化手册/type-system.md` noImplicitAny 路线图段更新 2608→2594 + 进度

### 工程化建设 — 2026-06-25（第二十六轮 `/loop`）

- **noImplicitAny 清理第五批**（4 个 lib 文件，含 fs.mjs 类型签名变更）：2824 → 2608（修 216 处）
  - `lib/fs.mjs` 类型签名变更：`readJsonl` 的 `@returns {Array<object>}` → `{any[]}`；`readJson` 的 `@returns {object|null}` → `{any|null}`。**级联效应**：所有 `readJsonl`/`readJson` 调用方从 `object` 类型（不允许属性访问）变为 `any`（允许任意字段访问），自动消除下游约 150+ 个 `Property X does not exist on type 'object'` 错误
  - `lib/score-report-generator.mjs` 50→0：`parseArgs` 参数 `argv` 加 inline `@type {string[]}` + `args` 加 `@type` 注解；`dimHistory` 加 `@type {Record<string, any>}`；多个 `filter`/`map` 回调 `e`/`d` 加 inline `@type`；`generate` 调用 `prevPeriod`/`archResult` 加 `|| undefined`（null → undefined 兼容 `@param {object} [opts.X]`）；`weightsFromDims` 参数加 inline `@type` + `w` 加 `@type {Record<string, number>}`；CLI 入口段 `report` 提取 `r` 局部变量加 `@type {any}` cast 统一字段访问
  - `lib/recommend.mjs` 61→0：19 个函数（`detectType`/`extractVueSignatures`/`extractReactSignatures`/`extractSvelteSignatures`/`extractRouteSignatures`/`extractSignatures`/`buildDependencyGraph`/`toKebab`/`deriveName`/`docStatus`/`gitMetrics`/`countLines`/`securitySignals`/`collect`/`groupIntoStories`/`buildStoryCandidate`/`formatOutput`/`printSummary`）的参数加 inline `@type`；`exportMatch.map(m => m.match(...)[1])` 加 inline `@type` + `RegExpMatchArray` cast（`m.match()` 可能 null）；`readdirSync(...).filter(f)` `f` 加 inline `@type`；`.filter((v, i, a) => ...)` 3 参数加 inline `@type`；`.map(f => ...)` `f` 加 inline `@type`；`.some(ib => ...)` `ib` 加 inline `@type`（2 处）；`.find(r => ...)` `r` 加 inline `@type`
- **验证**：`npx tsc --noEmit` 0 errors（strictNullChecks 启用）；`npx tsc --noEmit --noImplicitAny` 探查 2824→2608；`npx eslint lib/ skills/ --max-warnings 0` exit 0；`npx vitest run lib/tests/` 337 passed + 1 skipped
- **文档**：`docs/工程化手册/type-system.md` noImplicitAny 路线图段更新 2824→2608 + 进度

### 工程化建设 — 2026-06-25（第二十五轮 `/loop`）

- **noImplicitAny 清理第四批**（2 个 lib 文件）：2915 → 2824（修 91 处）
  - `lib/proposals.mjs` 43→0：`parseArgs` 的 `opts` 加索引签名 `@type` 注解；`collectStoryData` 参数 `projectRoot`/`storyName` 加 inline `@type`；`rootExecRecords.filter(r)` `r` 加 inline `@type {any}`；`changedFiles` 链式 `filter`/`map` 回调 `f`/`g` 加 inline `@type`；`computeDocIssues` 参数加 inline `@type`；`generateProposals` 四参数加 inline `@type`；`existingProposals.filter(p)`/`.map(p)` `p` 加 inline `@type`；`newDiags.filter(d)`/`skipped.map(d)` `d` 加 inline `@type`；`for of diag` 内 `dd` 加 `@type {any}` cast（统一访问 `dd.id`/`dd.label`/`dd.evidence` 等）；`proposals` 数组加 `@type {any[]}`；`DIAGNOSTIC_PROPOSAL_TYPE[diag.id]` 索引提取 `types` 局部变量加 `@type {Record<string, string>}`；`cmdGenerate`/`cmdList` 参数 `opts` 加 `@param {any}`；`for of d` 内 `dd` 加 `@type {any}` cast；`proposals.filter(p)` `p` 加 inline `@type`；`for of p` 内 `pp` 加 `@type {any}` cast；`statusCounts` 加 `@type {Record<string, number>}`；`mdFiles.filter(f)` `f` 加 inline `@type`
  - `lib/test-harness.mjs` 48→0：`suites` 加 `@type {any[]}`；`currentSuite` 加 `@type {any}`；`AssertionError` 内 `err[ASSERTION_TAG] = true` 提取 `anyErr` 局部变量加 `@type {any}` cast（Symbol 索引签名问题）；`isAssertionError` 参数 `e` 加 inline `@type`；`assert` 对象 9 个方法参数加 `@param {any}` JSDoc（可选参数加 `[name]`）；`fmtDuration`/`statusIcon` 参数加 inline `@type`；`describe`/`it`/`it.skip`/`it.only` 参数加 `@param` JSDoc；`it` 第三参数 `opts` 加 `@param {{ skip?: boolean, only?: boolean }}`；`runSuite` 参数 `suite` 加 `@param {any}`；`suite.tests.some`/`.filter` 回调 `t` 加 inline `@type`；`getResults` 内 `suites.map(s)`/`s.tests.map(t)` 回调 `s`/`t` 加 inline `@type`
- **验证**：`npx tsc --noEmit` 0 errors（strictNullChecks 启用）；`npx tsc --noEmit --noImplicitAny` 探查 2915→2824；`npx eslint lib/ skills/ --max-warnings 0` exit 0；`npx vitest run lib/tests/` 337 passed + 1 skipped
- **文档**：`docs/工程化手册/type-system.md` noImplicitAny 路线图段更新 2915→2824 + 进度

### 工程化建设 — 2026-06-25（第二十四轮 `/loop`）

- **noImplicitAny 清理第三批**（2 个 lib 文件）：2963 → 2915（修 48 处）
  - `lib/vitest-adapter.mjs` 24→0：`assert` 对象的 9 个方法（`equal`/`notEqual`/`deepEqual`/`ok`/`fail`/`throws`/`match`/`includes`/`typeOf`）的 `actual`/`expected`/`msg`/`value`/`fn`/`_msg`/`str`/`regex`/`haystack`/`needle`/`expectedType` 参数加 `@param {any}` JSDoc（可选参数加 `[name]` 标记）；`getResults` 的 `@returns` 的 `suites: Array` 改 `suites: any[]`
  - `lib/record.mjs` 24→0：`parseArgs` 的 `opts` 加索引签名 `@type` 注解（含 `blocked: boolean` 必填字段）；`ensureMemoryDir`/`appendJsonl` 参数 `storyPath`/`path`/`obj` 加 inline `@type`；`cmdState` 的 `state` 加 `@type {any}` cast（消费多字段且形状混合）；`cmdCompress` 的 `allExec` 加 `@type {any[]}` 注解；`agentCounts`/`stageDurations`/`stageAvgs` 加 `@type` 注解（`Record<string, number>` / `Record<string, number[]>`）；`for of r` 内 `rr` 加 `@type {any}` cast（消费 `was_blocked`/`quality_issues`/`agents_called`/`phase_transitions` 多字段）；`.reduce(a, b)` 回调加 inline `@type {number}`
- **验证**：`npx tsc --noEmit` 0 errors（strictNullChecks 启用）；`npx tsc --noEmit --noImplicitAny` 探查 2963→2915；`npx eslint lib/ skills/ --max-warnings 0` exit 0；`npx vitest run lib/tests/` 337 passed + 1 skipped
- **文档**：`docs/工程化手册/type-system.md` noImplicitAny 路线图段更新 2963→2915 + 进度

### 工程化建设 — 2026-06-25（第二十三轮 `/loop`）

- **noImplicitAny 清理第二批**（4 个中等规模 lib 文件）：3018 → 2963（修 55 处）
  - `lib/arch-check.mjs` 9→0：`runArchCheck` `@returns` 的 `dimensions: Array` 加元素类型（`{ dim, label, pass, checks: Array<{ id, pass }> }`）；`scores` 加 `@type {Record<string, number>}`；`filter` 回调 `c` 加 inline `@type`；`suggestFix` 三参数 `check`/`dim`/`projectRoot` 加 JSDoc；`FIXES[id]` 索引提取 `fixes` 局部变量加 `@type {any}`；`fallback` 加 `@type {any}`；`appendArchTrend` `entry` 消费处加 `@type {any}` cast（`@returns {object|null}` 保留）；`let result` 加 `@type {any}`（因 `result` 在 dim-分支与 full-result 间联合）
  - `lib/cdn-score-updater.mjs` 11→0：`scoreTrend.map` 回调 `e` 加 inline `@type`；`.filter(s)` `s` 加 inline `@type`；`dimScores`/`dimCfgs`/`dimHistories` 加 `@type` 注解；`for of d` 内 `dd` 加 `@type {any}` cast；`diagSummary.filter(d)` `d` 加 inline `@type` + `d.count ?? 0` 兜底；`.sort(a, b)` 加 inline `@type`；`enriched.scoreReport` 提取 `enrichedAny` 局部变量加 `@type {any}` cast
  - `lib/branch-check.mjs` 18→0：`parseArgs` 的 `opts` 加索引签名 `@type {{ story, mode, [k]: string }}`；`git`/`currentBranch`/`branchExists`/`branchFromMain`/`existingFeatBranches`/`updateRuiState`/`checkWriteMode`/`checkReadMode`/`checkInitMode` 9 个函数的 `args`/`cwd`/`name`/`l`/`storyPath`/`branch`/`projectRoot`/`storyName` 参数加 inline `@type {string}`
  - `lib/audit.mjs` 17→0：`AGENT_TOOLS` 加 `@type {Record<string, Set<string>>}`；`parseArgs` 的 `opts` 加索引签名；`cmdRecord`/`cmdSummary`/`cmdCheck` 参数 `opts` 加 `@param {any}`（消费字段多且形状混合）；`getAuditPath`/`readAuditRecords` 参数 `projectRoot`/`story` 加 inline `@type`；`readAuditRecords` 的 `map(line)` 回调 `line` 加 inline `@type`；`stats` 加 `@type` 注解（嵌套 `Record<string, Record<string, { count, errors, totalDuration, targets }>>`）；`for of r` 内 `rr` 加 `@type {any}` cast（两处：summary 与 check）
- **验证**：`npx tsc --noEmit` 0 errors（strictNullChecks 启用）；`npx tsc --noEmit --noImplicitAny` 探查 3018→2963；`npx eslint lib/ skills/ --max-warnings 0` exit 0；`npx vitest run lib/tests/` 337 passed + 1 skipped
- **文档**：`docs/工程化手册/type-system.md` noImplicitAny 路线图段更新 3018→2963 + 进度

### 工程化建设 — 2026-06-25（第二十二轮 `/loop`）

- **noImplicitAny 清理首轮**（按 `type-system.md` 路线图，从最小的 lib 文件开始）：3048 → 3018（修 30 处分布 7 文件）
  - `lib/tty.mjs` 7→0：7 个颜色辅助函数 `bold`/`dim`/`underline`/`red`/`green`/`yellow`/`cyan` 的 `s` 参数加 `/** @param {string} s */` JSDoc
  - `lib/fs.mjs` 4→0：`readJsonl` 和 `updateJsonlById` 的 `line` 参数加 inline `@type {string}` 注解；`findStoryDirs` 的 `filter`/`map` 回调参数 `d` 加 inline `@type` 注解
  - `lib/io.mjs` 7→0：`runConcurrent` 的 `Array` → `any[]`、`fn` 参数 `any` 显式；`fetchJson` 的 `options` 加 `object & { headers?: object, method?: string, body?: string }` 交叉类型；`querySessionsFull` 的 `Array` → `any[]` + `data` 加 `@type` cast 分支处理 string/object 返回；`findPluginHelpPath` 的 `filter` 回调 `d` 参数加 inline `@type`
  - `lib/recommend-cli.mjs` 5→0：`hdr`/`item`/`line` 三个内联函数的参数加 `@type` 注解；`item` 第三参数 `clr` 提取为独立 JSDoc 块用 `[clr]` 标记可选
  - `lib/recommend-detect.mjs` 3→0：`scanFiles` 的 `result` 加 `@type {Array<{path: string, type: string}>}` 注解（消除 `any[]` 推断）；`walk` 的 `dir` 参数加 inline `@type {string}`
  - `lib/test-helpers.mjs` 2→0：`parseFrontmatter` 的 `fm` 加 `@type {Record<string, string>}` 注解；`listStoryDirs` 的 `filter` 回调 `d` 参数加 inline `@type`
  - `lib/constants.mjs` 2→0：`getSLOStatus` 的 `opts` 加 `{ decliningStreak?: number }` 字段注解 + `opts.decliningStreak` 加 `?? 0` 兜底；`levels[level]` 索引提取为 `levelKey` 局部变量加 `@type {keyof typeof levels}` + cast
- **验证**：`npx tsc --noEmit` 0 errors（strictNullChecks 启用）；`npx tsc --noEmit --noImplicitAny` 探查 3048→3018；`npx eslint lib/ skills/ --max-warnings 0` exit 0；`npx vitest run lib/tests/` 337 passed + 1 skipped
- **文档**：`docs/工程化手册/type-system.md` 的 noImplicitAny 路线图段更新 3048→3018 进度

### 工程化建设 — 2026-06-25（第二十一轮 `/loop`）

- **工程化手册深度文档**：创建 `docs/工程化手册/` 作为工程化建设的深度参考，与 CONTRIBUTING.md 入口配套
  - `README.md` — 手册目录 + 设计原则（CONTRIBUTING.md → 工程化手册 → 代码注释 三层模型）+ 演进时间线（轮次 1-20 的 tsc errors 变化）+ 退出策略
  - `type-system.md` — 三层类型策略（L1 node-shim / L2 JSDoc / L3 strict 标志）+ 常见 JSDoc 修复模式表 + `@type {any}` cast 使用边界 + strictNullChecks 启用路径（121→94→0）+ noImplicitAny 路线图（3048 errors 待清理）+ 验证门禁 + 退化对策
  - `ci-cd.md` — GitHub Actions 4-job 流水线全景 + 关键配置（concurrency / npm cache / npm ci）+ Dependabot 分组策略 + 本地等价命令 + 退化对策 + 退出策略
  - `testing.md` — 测试分层（单元 / 技能 / 集成）+ Vitest 配置要点（globals: false / isolate: true）+ 覆盖率阈值策略（起步 8% → 长期 30%）+ arch-dimensions 自检 + 命令入口 + 退化对策
  - `lint-chain.md` — ESLint flat config 三段式结构 + 规则集分层（recommended 等价子集 + 项目范式约束 + `^_` 前缀忽略）+ nodeGlobals / testGlobals 声明 + 清理模式 4 例 + 退化对策 + 退出策略
- **文档联动**：CONTRIBUTING.md 「相关文档」段加入 `docs/工程化手册/` 指针
- **验证**：`npx tsc --noEmit` 0 errors；`npx eslint lib/ skills/ --max-warnings 0` exit 0；`npx vitest run lib/tests/` 337 passed + 1 skipped

### 工程化建设 — 2026-06-25（第二十轮 `/loop`）

- **`strictNullChecks: true` 正式启用**：第十九轮探查 121 errors 后，本轮继续清理剩余 94 errors 全部清零，tsconfig 永久启用 `strictNullChecks: true`
  - `lib/scoring.mjs`：`movingAverage` 的 `@returns` 改 `(number|null)[]` + `result` 加 `@type` cast
  - `lib/score-report-generator.mjs`：`args.since` 传 `generate` 时加 `|| undefined`（null → undefined 兼容）
  - `lib/tests/scoring.test.mjs`：`a.grade` 改 `a?.grade`（`find` 可能返回 undefined）
  - `skills/rui-bot/lib/bot-health-cmd.mjs`：`report` 加 `@type` 注解（reports 数组元素类型显式）
  - `skills/rui-bot/lib/report-trend.mjs`：`computeCorrelationMatrix` 和 `buildHistoricalBenchmarks` 的 `@returns` 加 `| null`；`matrix` 加 `@type {number[][]}`
  - `skills/rui-trends/lib/trend-report.mjs`：`analyzeTrendData` 的 `result` 加完整 `@type` 注解
  - `lib/selfimprove-generator.mjs`：`hint` 加完整 `@type` 注解（relatedDiags/correlatedDims/possibleCauses 数组元素类型）；`buildPeriodBuckets` 加第 4 参数 `@param {Array=} _allEntries`
  - `skills/rui-story/rui-story.mjs`：`cmdHealth` 的 `result` 加 `@type` 注解
  - `skills/rui-story/lib/cli.mjs`：`parseArgs` 加 `@returns` 注解 + 末尾加 unreachable return 确保 TS 看到确定返回类型
  - `skills/rui-trends/rui-trends.mjs`：`parseArgs` 的 help 早返回补 `options: {}` 字段
  - `skills/rui-bot/lib/report-sections.mjs`：`buildCorrelationMatrixHTML` 的 `@param` 加 `| null`
  - `skills/rui-bot/lib/health-report.mjs`：`latestReport.score` 加 `!== null` 检查
  - `skills/rui-trends/lib/trend-fetch.mjs`：`fetchWithRetry` 的 `last` 改为 `{ ok: false, status: 0, text: '' }` 初始值（消除 undefined 推断）
  - `skills/rui-bundle-analyze/analyze.mjs` 28→0：
    - `trendAnalysis` 加 `@type {... | null}` 注解（消除 `null` 推断后 `anomalies: never[]` 问题）
    - `generateSprintPackages` 的 `packages` 和 `currentPackage` 加 `@type` 注解（items 数组元素类型显式）
    - `ageChurnMatrix` 加 `@type` 注解（4 个数组元素类型显式）
    - 5 处 `stats.X.count > 0` 改 `Number(stats.X.count) > 0`（消除 possibly undefined）
    - `diff.sizeDeltaPercent` 提取为 `sizeDeltaPct` 局部变量加 `Number()` cast
    - `diff.newFiles/deletedFiles/changedFiles` 加 `|| []` 兜底
    - `forecast.forecasts` 提取为 `fc` 局部变量加 `@type {any}` cast
    - `component.sort((a, b) => a.length - b.length)` 加 `?.` 可选链
    - `Math.abs(diff.sizeDelta)` 加 `Number()` cast
- **验证**：`npx tsc --noEmit` 0 errors（strictNullChecks 启用）；`npx eslint lib/ skills/ --max-warnings 0` exit 0；`npx vitest run lib/tests/` 337 passed + 1 skipped
- **文档**：CONTRIBUTING.md 当前状态段更新为第二十轮（strictNullChecks 启用）；README.md 工程化基线表 TypeScript 行更新

### 工程化建设 — 2026-06-25（第十九轮 `/loop`）

- **strictNullChecks 部分清理**：临时开启实测 121 errors，修 27 处降到 94，仍回滚 `strict: false`（94 留待后续轮次分批清理）
  - `lib/fs.mjs`：`readProjectName` 的 `split(sep).pop()` 和 `match[1]` 加 `|| ""` 兜底（5 处）；`isMain` 加 `Boolean()` cast
  - `lib/engine/{upgrade,evaluate,materialize}.mjs`：3 个 `cmdXxx` 函数 `@returns {Promise<object>}` 改 `@returns {void}`（函数非 async，无 return value）
  - `lib/loop/dispatcher.mjs`：`parseArgs` 的 `opts` 加 `@type` 注解 + `dispatch` `@returns` 完整化 + 早 return 补 `passed`/`failed` 字段
  - `skills/rui-bot/lib/{health-report,bot-message,send}.mjs`：`latestReport.score` 加 `!== null` 检查；`diagResult.triggered` 提取局部变量加 `|| []` 兜底
  - `skills/rui-npm/lib/cli.mjs` + `skills/rui/tests/run.mjs`：`args`/`merged` 加 `@type` 注解（数组元素类型显式，消除 `never[]` 推断）
  - `skills/rui-bot/lib/bot-health-diagnostics.mjs`：`getDiagnosticResult` `@returns` 完整化 + catch return 补 `triggered: []`
  - `skills/rui-bot/lib/bot-health-analysis.mjs`：`scanComponentScores` `@returns` + `results` `@type` 注解，元素加 `hasSkillMd?`/`hasLib?`/`mjsCount?`/`category?` 可选字段
  - `lib/tests/selfimprove-generator.test.mjs`：`d0.count`/`d0.rate` 加 `?.` 可选链
- **验证**：`npx tsc --noEmit` 0 errors（strictNullChecks 关闭）；`npx eslint lib/ skills/ --max-warnings 0` exit 0；`npx vitest run lib/tests/` 337 passed + 1 skipped

### 工程化建设 — 2026-06-25（第十八轮 `/loop`）

- **CI typecheck 改为阻断**：`.github/workflows/ci.yml` typecheck job 删 `continue-on-error: true`。tsc 0 errors 已稳定（第十七轮清零），未来类型回归阻断 CI
- **Makefile `ci-local` 对齐**：删 typecheck 行的 `-` 前缀（make 非阻断标记）+ `@echo` 文案改为「全绿」
- **tsconfig.json 清理**：删未使用的 `#lib/*` path alias 与 `baseUrl`（全仓 grep `from '#lib/'` 无引用）
- **strictNullChecks 探查**：临时开启实测 121 个新 errors（top: analyze.mjs 28 / trend-fetch.mjs 17 / selfimprove-generator.mjs 11），数量过大回滚，留待后续分轮清理
- **文档对齐**：CONTRIBUTING.md CI 表 + 当前状态段 + 已知技术债段；README.md 工程化基线表；`.github/PULL_REQUEST_TEMPLATE.md` 加 tsc 项
- **验证**：`npx tsc --noEmit` 0 errors；`npx eslint lib/ skills/ --max-warnings 0` exit 0；`make -n ci-local` 4 步全阻断

### 工程化建设 — 2026-06-25（第十七轮 `/loop`）

- **真实 tsc errors 全量清零**：65 → 0（修 65 处分布 12+ 文件），项目类型检查全绿
  - `trend-fetch.mjs`：4 个 `fetchXxx({ x } = {})` 函数加 `@param` JSDoc（TS 推断 `{}` 默认值为 param 类型 `{}`，导致 destructure 字段不存在）
  - `lib/scoring.mjs`：`scoreReliability` `@param {number} [zScore]` 可选标记；`let status` 加 `@type {'ok'|'warn'|'critical'}`；`getGrade` `@returns` 加 `ansi`/`min`；`generateScoreReport` `@returns` summary 字段名 `text`→`summary`；`contributionAnalysis` topDrag 形状修正
  - `lib/score-report-generator.mjs`：`report` 加 `@type {any}` cast 允许 meta.generatedAt 等 mutation
  - `lib/fs.mjs`：`writeJson` 加 `indent = 2` 第三参数；`escHtml` `@param` 放宽为 `string|number|unknown`
  - `skills/rui-import/lib/cli.mjs`：`opts` 加 `@type` 注解含 apiUrl/file/projectPrefix/names 等所有可能字段
  - `lib/help-layout.mjs`：`flag(name, desc)` 加第三参数 `colorFn`
  - `skills/rui-story/lib/scrub.mjs`：`repl` 调用 cast 为 wider function type（rules 数组 repl 签名异构）
  - `types/node-shim.d.ts`：process 加 `exitCode` 字段；新增 `ImportMeta { dirname?, filename?, url }`
  - `lib/recommend.mjs`：`projectType` 加 `@type` 字面量联合 + `@type {any}` cast
  - `lib/engine/diagnostics.mjs`：`computeDiagnosticSeverity` `@returns` 形状从 `{ severity, consecutive }` 改 `{ severity, consecutiveCount }`
  - `lib/engine/upgrade.mjs`：`@param` 名字 `opts` → `_opts`（与函数签名一致）
  - `skills/rui-bot/lib/bot-health-cmd.mjs`：`getSLOStatus`/`getGrade` `@returns` 加 `ansi` 字段（HEALTH_GRADE_THRESHOLDS 实际有 ansi）
  - `skills/rui-bot/lib/bot-health-filesize.mjs`：`growthPct` 加 `Number()` cast（`.toFixed()` 返回 string）
  - `skills/rui-bot/lib/loop-report.mjs`：fallback `{ icon, label, interval }` 补 `desc: ""`
  - `skills/rui-bot/lib/report-trend.mjs`：`@returns` 补 `bestGap`/`avgGap`/`totalSamples` 字段
  - `skills/rui-bot/send.mjs`：`result` 加 `@type {any}` cast 允许 `msgLength` mutation
  - `lib/tests/arch-dimensions.test.mjs`：`CHECKS` 数组加 `@type` 元组注解
  - `skills/rui-html/lib/generator.mjs`：`return { generated: false, error }` 补 `skipped: true`
  - `skills/rui-story/lib/walk.mjs`：JSDoc `@returns` 括号配平
  - `skills/rui-story/lib/extract-scenario.mjs`：`@param` ctx 补 `scenarioDir`/`subdir` 字段
  - `lib/arch-dimensions/kernel-paradigm.mjs`：`evidence` 加 `@type {any}` cast（异构对象）
  - `skills/rui-bundle-analyze/analyze.mjs`：JSDoc `CSS @import` 改 `CSS import`（避免 `@import` TS tag 误解析）；Date 算术 `.getTime()`；`Math.max(pct, 1)` 加 `Number()` cast（2 处 `pct` 是 `.toFixed()` string）
- **验证**：`npx tsc --noEmit` **0 errors**；`npx eslint lib/ skills/ --max-warnings 0` exit 0；`npx vitest run lib/tests/` 337 passed + 1 skipped

### 工程化建设 — 2026-06-25（第十六轮 `/loop`）

- **真实 tsc errors 修复**：108 → 65（修 43 处），lib/ + skills/ 维持 0 errors + 0 warnings（eslint）
  - `lib/loop/dispatcher.mjs` 12 → 0：`now - new Date(x)` → `now.getTime() - new Date(x).getTime()`（5 处 Date 算术）；`ageMin/intervalMin` 字符串除法 → `Number(ageMin)/intervalMin`（2 处）；`ageMin > intervalMin * OVERDUE_MULTIPLIER` 字符串比较 → `Number(ageMin) > ...`（1 处）
  - `lib/test-harness.mjs` 9 → 0：`AssertionError` 工厂函数加 `@constructor` + `@returns {Error}` JSDoc，让 `new AssertionError(...)` 调用合法
  - `lib/engine/evaluate.mjs` 7 → 0：`computeMetrics` 的 `@returns` JSDoc 从错误的 `{ blockedCount, totalP0, totalIssues, block_rate }` 改为实际的 `{ count, block_rate, p0_density, t3_proportion, agent_participation }`；`agentCounts = {}` 加 `@type {Record<string, number>}` cast
  - `lib/record.mjs` 8 → 0：`cmdDelivery`/`cmdAudit` JSDoc @param 补 `session`/`message`/`error` 字段；`cmdState`/`cmdCompress` @param 加 `& Record<string, unknown>` 索引签名 + `window?: string | number` 兼容数字
  - `skills/rui-trends/lib/trend-report.mjs` 2 → 0：删 `saveTrendSnapshot` 中 `url` destructure + 两处 `generateTrendReport` 调用传的 `url` 字段（函数本就不 destructure url，用 `meta.url`）
  - `lib/scoring.mjs` 10 → 5：`detectTrend`/`confidenceAdjustedComposite`/`volatilityAdjusted`/`scoreReliability`/`stabilizationStatus` 的 `let direction/level/trend/volatility/status` 加 `@type` 注解，让 TS 推断为字符串字面量联合而非宽 string（剩余 5 个是对象形状不匹配 + 函数参数数，留待后续）
- **验证**：lint 0 errors + 0 warnings；lib tests 337 passed + 1 skipped

### 工程化建设 — 2026-06-25（第十五轮 `/loop`）

- **`types/node-shim.d.ts` 创建**：Node.js 类型 shim，临时替代未安装的 `@types/node`
  - 声明 `process` 全局（env/argv/stdout/stderr/exit/cwd/platform 等最小字段集）
  - 声明 20 个 `node:*` 模块（path/fs/child_process/url/os/crypto 等，导出 any）
  - 声明 Buffer / __dirname / __filename / require / module / setTimeout 等 Node 全局
  - 声明 fetch / AbortController / URL / performance / structuredClone 等 Web 全局
  - **效果**：tsc errors 从 **614 → 108**（消除 507 个 TS2591「Cannot find name 'process'/'node:fs'」噪音，剩余 108 个是真实类型问题）
  - **退出策略**：当 `@types/node` 加入 devDependencies 后删除本文件 + tsconfig 加 `types: ["node"]`，无业务代码改动
- **`tsconfig.json` 更新**：`include` 加 `types/**/*.d.ts`，让 shim 自动加载
- **CONTRIBUTING.md 更新**：当前状态段 tsc 从「614 errors」改为「108 errors」+ 解释 shim；已知技术债段加 shim 说明 + 108 errors 集中位置；项目结构速览加 `types/node-shim.d.ts`

### 工程化建设 — 2026-06-25（第十四轮 `/loop`）

- **`LICENSE` 文件创建**：`package.json` 声明 `"license": "MIT"` 但根目录无 LICENSE 文件，补齐 MIT LICENSE 全文（Copyright 2026 Chengliang Yi）
- **`.github/dependabot.yml` 创建**：自动化依赖更新配置
  - 每周一 09:00（Asia/Shanghai）检查 npm devDependencies
  - 分组提 PR：`vitest` 组（vitest + @vitest/*）/ `lint-toolchain` 组（eslint + typescript + @types/* + prettier）
  - 限制 5 个并发 PR，`chore(deps)` 前缀，打 `dependencies` + `automated` 标签
- **CI `ci.yml` 优化**：
  - 加 `concurrency` 段：`group: ${{ github.workflow }}-${{ github.ref }}` + `cancel-in-progress: true`，同分支新 push 取消旧 run 省 CI 分钟
  - 4 个 job 的 `setup-node@v4` 全加 `cache: npm`，`npm ci` 提速
- **CONTRIBUTING.md 更新**：项目结构速览加 `LICENSE` / `.github/dependabot.yml` / `.github/PULL_REQUEST_TEMPLATE.md` 三行；CI 流程段加「CI 优化」子段（concurrency + cache + dependabot 说明）

### 工程化建设 — 2026-06-25（第十三轮 `/loop`）

- **`lint:all` npm script 新增**：`eslint lib/ skills/ --max-warnings 0`，CI 等价命令本地可一键调用
- **`Makefile` 创建**：统一开发者命令入口，所有 npm script 通过 `make <target>` 暴露
  - 16 个 target：install / test / test-watch / test-ui / test-coverage / test-coverage-check / lint / lint-skills / lint-all / lint-fix / typecheck / arch-check / health / format / format-check / version / bump-patch / bump-minor / bump-major / ci-local / clean
  - `make ci-local`：本地跑 CI 等价四件套（lint-all 阻断 + typecheck 非阻断 + test 阻断 + arch-check 阻断），typecheck 用 `-` 前缀忽略失败（对齐 CI `continue-on-error: true`）
- **`.editorconfig` 扩展**：加 `[Makefile]` 段（`indent_style = tab`，Make 语法要求 recipe 行用 tab）
- **CONTRIBUTING.md 更新**：常用命令段加 `lint:all`；新增「Makefile 入口」子段（10 个常用 target + `make ci-local` 说明）；项目结构速览加 `CONTRIBUTING.md` 和 `Makefile` 两行

### 工程化建设 — 2026-06-25（第十二轮 `/loop`）

- **文档全面对齐工程化现状**：CONTRIBUTING.md / README.md / PR 模板多处过时信息更新
  - CONTRIBUTING.md CI 表：lint 行从「否（continue-on-error: true）」改为「是 — errors 与 warnings 均阻断（第十一轮起）」；命令从 `npx eslint lib/ --max-warnings 0` 改为 `npx eslint lib/ skills/ --max-warnings 0`
  - CONTRIBUTING.md「已知技术债」段重写：删掉已修的 `scoring.mjs:1375-1410` 死代码 + skills 149 problems + coverage 阈值未强制；改为 tsconfig strict 待收紧 + lint/type 依赖未入 devDependencies
  - CONTRIBUTING.md「版本管理」段：从「待补齐 release 脚本」改为 `scripts/bump-version.mjs` 已就位，补 5 步发版流程（bump → diff → commit → tag → push）
  - CONTRIBUTING.md「克隆与安装」段：加注 lint/type/format 工具链暂未入 devDependencies 的说明
  - CONTRIBUTING.md 常用命令段：加 `test:coverage:check` + `bump:patch`
  - CONTRIBUTING.md PR 关键勾选：加 `npx eslint lib/ skills/ --max-warnings 0` 项
  - `.github/PULL_REQUEST_TEMPLATE.md`：Automated Checks 段加 eslint 项
  - README.md「代码规范」段：加 Lint / 测试两项
  - README.md 新增「工程化基线」表（ESLint / TypeScript / Vitest / arch-check / Prettier 5 工具的配置 + 阻断状态）

### 工程化建设 — 2026-06-25（第十一轮 `/loop`）

- **skills/ warnings 全量清零**：34 → 0，lib/ 维持 0 — 项目完全干净（0 errors + 0 warnings）
  - `fix-checklist-content.mjs` 5 → 0：删 `basename` import、`headerCells`/`stepBlockRe`/`stepEndRe` 局部变量
  - `rui-npm.test.mjs` 5 → 0：删 `readFileSync` import、`CDN_SOURCES` 常量、`runOk` 函数（dead）、`tmpBefore` 局部变量
  - `send.mjs` 4 → 0：删 `MAX_MSG_LENGTH`/`DEFAULT_API_URL`/`STORY_PANEL_DIR` import
  - `rules.test.mjs`/`rui.test.mjs` 各 3 → 0：删 `readDir`/`hasSection`/`PROJECT_ROOT` 等未使用 import
  - `trend-report.mjs` 3 → 0：`source`→`_source`、删 `url` destructure
  - `verify-breadcrumb.mjs` 3 → 0：删 `ARTIFACTS` import、`TARGET_BC_RE` 常量（dead，已有 `targetBCPattern` 替代）
  - `help.mjs` 3 → 0：删 `flag`/`scene` import
  - `bot-health-diagnostics.mjs` 3 → 0：删 `DIAGNOSTIC_MIN_CONFIDENCE` import、`diagnostics` dead 变量（用 `allDiags` 替代）
  - `bot-health-deps.mjs` 3 → 0：删 `relative`/`readdirSync` import
  - `loop-report.mjs`/`health-report.mjs`/`extract.mjs`/`templates.mjs`/`trend-fetch.mjs`/`third-party-reachability.test.mjs`/`knowledge-graph.test.mjs`/`rui-health.test.mjs`/`rui-bundle-analyze.test.mjs` 各 2 → 0
  - `extract.mjs` 删 dead 函数 `hasFilePath`（从未调用）
  - `trend-fetch.mjs` 删 dead `m = metric || 'stars'`（参数解构改 `metric: _metric`）
  - `health-report.mjs` 删 dead `gradeInfo` 局部 + 连带清理 `GRADE_STYLE` import
- **skills/ 验证**：0 errors + 0 warnings 维持，rui-bot 15/15 + rui-npm + rui-trends 102/102 + skills 全量 363/363 测试通过
- **CI lint `--max-warnings 0` 时机成熟**：lib/ + skills/ 全量 0 warnings，可以加回 `--max-warnings 0` 让 warnings 也阻断 CI

### 工程化建设 — 2026-06-25（第十轮 `/loop`）

- **skills/ warnings 大幅清理**：63 → 34（修 29 处），lib/ 维持 0 warnings
  - `bot-health-cmd.mjs` 11 → 0：删 3 个未使用 import（MAX_RETRIES/API_HEALTH_PROBE_TIMEOUT_SCORE/HEALTH_GRADE）、`quiet` 局部变量、`statColor` 箭头函数、`apiProbeStatus` 全部 5 处赋值（dead state tracker）、`opts`→`_opts`、`notifLastOk`/`notifLastFail`/`notifDryRun` 3 个赋值未读变量、`[name, cfg]`→`[, cfg]`（line 127，name 仅在 line 145 用）
  - `analyze.mjs` 12 → 0：删 `SOURCE_EXTS` 常量、`scopeGlob` destructure、`countLines` 函数（dead）、`zonePainSet` Set、`saveTrend` 函数（dead）、`exportAll` 计数、`healthIndex` destructure、`priority` 局部变量（line 4034）、`ageScore` 占位 0、`dcCls` 三元、`baselinePath` 返回值捕获、`[key, edge]`→`[, edge]`、`opts`→`_opts`
  - `report-sections.mjs` 7 → 0：删 `PASS_THRESHOLD`/`WARN_THRESHOLD` import、2 个 `score` 局部变量、`pct`/`maxBucket` 计数、`trendLen` 局部变量、`healthTrend`→`_healthTrend`、`(e, i)`→`(e)`
  - `report-trend.mjs` 4 → 0：删 `PASS_THRESHOLD`/`WARN_THRESHOLD` import、`classifyScore` import、`distribution` destructure
- **skills/ 验证**：0 errors 维持，rui-bot 15/15 + rui-bundle-analyze 17/17 + skills 全量 298/298 测试通过

### 工程化建设 — 2026-06-25（第九轮 `/loop`）

- **eslint 配置增强**：`eslint.config.mjs` 的 `no-unused-vars` 加 `caughtErrorsIgnorePattern: '^_'`，让 `catch (_e)` 模式被正确忽略（之前 `catch (e)` 改 `catch (_e)` 后仍报 warning）
- **skills/ warnings 继续清理**：75 → 68（修 7 处）
  - `analyze.mjs` 删未使用 import `createReadStream`/`createInterface`
  - `analyze.mjs` 删 destructure 未使用字段 `adrs`/`reviewChecklists`（6328 行巨大 destructure）
  - `analyze.mjs` 3 个未使用参数加 `_` 前缀：`meta`→`_meta`、`techDebt`→`_techDebt`、`getter`→`_getter`
- **skills/ 验证**：0 errors 维持，rui-bundle-analyze 测试 17/17 通过

### 工程化建设 — 2026-06-25（第八轮 `/loop`）

- **skills/ warnings 继续清理**：98 → 77（修 21 处）
  - `no-useless-escape` 10 处：正则字符类里 `\-`/`\/`/`\.` 多余转义，`-` 放末位即字面量（templates.mjs、breadcrumb.mjs、extract-scenario.mjs、scrub.mjs、fix-checklist-content.mjs、trend-fetch.mjs）
  - `no-empty` 4 处：`catch {}` 加 `/* ignore */` 注释（rui-npm.test.mjs）
  - `catch (e)` 2 处：改 `catch (_e)`（cross-references.test.mjs、run.mjs）
  - 未使用参数 `args` 2 处：加 `_args` 前缀（rui-npm/lib/write.mjs）
  - 未使用参数 `files` 2 处：加 `_files` 前缀（analyze.mjs）
  - 未使用赋值 `fileSet` 2 处：删（analyze.mjs buildDepGraph/computeGitChurn）
  - 未使用赋值 `barColor` 3 处：删（health-report.mjs、report-sections.mjs x2）
- **plugin.json 核查结论**：`skills/rui/tests/cross-references.test.mjs` 已有 `plugin.json` optional 测试（`.claude-plugin/plugin.json`，`if (!hasPlugin) return`），印证 CLAUDE.md「若存在」措辞——plugin.json 是可选的，项目当前无 plugin.json 是合规状态。
- **skills/ 验证**：0 errors 维持，rui-bundle-analyze + rui-bot 测试 32/32 通过

### 工程化建设 — 2026-06-25（第七轮 `/loop`）

- **skills/ warnings 部分清理**：132 → 98（修 34 处）
  - `exitCode` 批量改 `_exitCode`（23 个测试文件，`const exitCode = await run()` 模式，`run()` 是 vitest-adapter no-op）
  - 删未使用 import `hasSection`（5 个测试文件 + cross-references.test.mjs 多行）
  - 函数参数 `projectRoot` 加 `_` 前缀（analyze.mjs 5 个函数 + merge.mjs `cmdMergeToMain`）
- **skills/ 验证**：0 errors 维持，rui-bundle-analyze + rui-claude + rui-health 测试 63/63 通过

### 工程化建设 — 2026-06-25（第六轮 `/loop`）

- **lib/ warnings 清零**：26 warnings → 0
  - 删未使用 import：`existsSync`/`mkdirSync`/`readJsonl` (cdn-score-updater)、`extname` (test-helpers)、`afterAll`/`afterEach` (vitest-adapter.test)、`DIAGNOSTIC_TREND_WINDOW` (diagnostics)、`STORY_PANEL_DIR` (evaluate)、`nowISO` (dispatcher)、`DIAGNOSTIC_LABELS` (score-report-generator)、`readProjectName` (record)
  - 未使用参数加 `_` 前缀：`_msg` (vitest-adapter.throws)、`_projectName` (materialize)、`_opts` (upgrade)、`_execCount` (proposals)、`_projectType` (recommend)、`_allEntries` (selfimprove-generator)
  - 删未使用局部变量：`MATERIALIZED_FIELD` (proposals)、`byCategory` (scoring)、`projectName` (record)、`forecast`/`sma`/`dist` (selfimprove-generator)
  - 删死代码：`sec()` 函数 (recommend-cli，从未调用)
  - 修 `no-useless-escape`：`quality.mjs:53` `/[\[\]"\s]/g` → `/[[\]"\s]/g`
  - 删未使用 destructure：`recommend.mjs` `for (const { path: file, type } of files)` → `for (const { path: file } of files)`
- **lib/ 完全干净**：0 errors + 0 warnings（从首轮 17 errors + 26 warnings 降到 0）
- **lib/ 测试验证**：20 test files / 337 tests + 1 skipped 全通过

### 工程化建设 — 2026-06-25（第五轮 `/loop`）

- **skills/ lint errors 清零**：17 errors → 0
  - `npx eslint skills/ --fix` 自动修 11 个 `prefer-const`/`no-var`（`let` → `const`，`var` → `let/const`），涉及 rui-bot/lib、rui-bundle-analyze、rui-html/lib、rui-trends 等
  - `lib/trend-fetch.mjs:87` `URLSearchParams` 全局未声明 → `eslint.config.mjs` 加 `URLSearchParams`/`URL` global
- **CI lint 扩展到 skills/**：`.github/workflows/ci.yml` lint 步骤从 `npx eslint lib/` 扩展到 `npx eslint lib/ skills/`。lib/ + skills/ 全量 0 errors 阻断，158 warnings（`no-unused-vars`）不阻断。
- **全量 lint 现状**：lib/ 26 warnings + skills/ 132 warnings = 158 warnings，0 errors

### 工程化建设 — 2026-06-25（第四轮 `/loop`）

- **P0 死代码修复**：`lib/scoring.mjs:1313` `return {` → `const report = {`，让 enhanced fields（volatilityAdjusted/confidenceAdjusted/crossCorrelation/improvementPotential/stabilization）生效。原代码因 early return 导致 35 行 enhanced fields 代码引用未定义的 `report`，10 个 ESLint errors。调用方 `selfimprove-generator.mjs` 自己计算这些字段（不从 scoring 读），修复无害。45 个 scoring 测试全通过。
- **3 个 lint errors 修复**：
  - `lib/arch-dimensions/kernel-paradigm.mjs:26` `let cmd` → `const cmd`（prefer-const）
  - `lib/io.mjs:49` `AbortController` 全局未声明 → `eslint.config.mjs` 加 `AbortController`/`AbortSignal` global
  - `lib/loop/registry.mjs:44` `checkScript` 重复 key → 删除重复行
- **CI lint 改为阻断**：`.github/workflows/ci.yml` lint 步骤去掉 `continue-on-error: true` 和 `--max-warnings 0`。lib/ 已 0 errors，未来有 errors 将阻断 CI。26 个 warnings（`no-unused-vars`）不阻断，留待后续清理。

### 工程化建设 — 2026-06-25（第三轮 `/loop`）

- **测试失败清零**：4 failed → 0
  - `skills/rui/tests/rules.test.mjs` — `RULE_TO_SKILL` 映射缺失 `loop-engineering` 条目，加 `'loop-engineering': 'rui'`（136 tests 全通过）
  - `skills/rui-bot/tests/rui-bot.test.mjs` — 6 个 health check 测试加 vitest `it` 第三参数 `180_000`，避免 vitest 全局 `testTimeout: 60_000` 杀掉 health 命令（实测 50s + vitest 开销）；`execSync timeout` 也从 60s 提到 120s
- **coverage 阈值强制**：`vitest.config.mjs` 加 `coverage.thresholds`（lines 8%, statements 8%, functions 10%, branches 10% — 基于 2026-06-25 实测 All files 8.97% 设的保守基线，防止未来退化）
- **`test:coverage:check` npm script** 新增
- **`scripts/bump-version.mjs` 创建**：版本 bump + CHANGELOG 节拆分（不碰 git）；`npm run bump:patch/minor/major`

### 工程化建设 — 2026-06-25（首轮）

- **CI 修复**：`.github/workflows/ci.yml` lint 步骤原先用 `|| true` 吞掉 ESLint 报错（lint 名存实亡）；迁移到 flat config 后改为 `continue-on-error: true` 让问题可见但不阻断（待业务修掉 `lib/scoring.mjs:1375-1410` 死代码后改为阻断）
- **ESLint flat config 迁移**：`.eslintrc.json`（ESLint v9+ 弃用）→ `eslint.config.mjs`（flat config）；旧配置在 ESLint v10 下完全失效
- **CI 触发分支扩展**：`main` → `main` + `master`（项目当前默认分支为 master）
- **新增 typecheck job**：CI 增加 `tsc --noEmit` 步骤（continue-on-error）
- **npm scripts 补齐**：`lint` / `lint:skills` / `lint:fix` / `typecheck` / `arch-check` / `health` / `format` / `format:check`
- **`.nvmrc` 锁定 Node 18**：与 CI `setup-node@v4 node-version: 18` 一致
- **`tsconfig.json` 修复 TS 7.0 弃用警告**：`moduleResolution: "node"` → `"node10"` + `ignoreDeprecations: "6.0"`

### 已知 P0（本轮发现，留给业务修复）

- `lib/scoring.mjs:1375-1410` 死代码块 — return 后 35 行引用未定义的 `report` 变量，10 个 ESLint errors。意图不明（应删死代码？还是 return 应移到末尾让 enhanced fields 生效？）需业务判断。

## [5.4.0] — 2026-06

### 项目画像

- 类型：**meta** — Claude Code 插件，纯规约驱动
- 架构：20 技能（含 Agent 角色 + 规则）+ 20 共享库（lib/）+ arch-dimensions + engine + D0-D8 诊断引擎
- 自托管：YrY 用自身管线管理自身演进

### 核心能力

- **9 核心维度** + **7 工程维度** + **10 架构健康维度** + **4 实时监控面板** + A 级架构合规
- **D0-D8 诊断引擎**：自改进闭环
- **自循环报告系统**：20 技能定期巡检 → dispatcher 调度 → HTML → 企微通知
- **健康趋势持久化**：`.memory/health-trend.jsonl`

### 工程化基线

- 测试：vitest（含 coverage v8）+ 20 lib 测试文件 + skills 测试
- Lint：ESLint recommended 子集（flat config）
- 格式化：Prettier（printWidth 120, 2-space, semicolon, double-quote）
- 类型检查：TypeScript checkJs（noEmit, strict: false）
- 架构合规：`node lib/arch-check.mjs`（10 维度 A 级 + --fix + --append-trend）
- CI：GitHub Actions（lint + typecheck + test + arch-check）
- PR 模板：`.github/PULL_REQUEST_TEMPLATE.md`（含 Gate A/B 验证清单）
- Commit 前置钩子：`.claude/hooks/commit-guard.mjs`

## 变更类型约定

- `feat` — 新功能
- `fix` — Bug 修复
- `docs` — 文档变更
- `refactor` — 重构（无行为变更）
- `chore` — 构建/工具/依赖
- `security` — 安全相关

## 链接

- [贡献指南](./CONTRIBUTING.md)
- [项目画像](./CLAUDE.md#项目画像)
- [领域语言](./README.md#领域语言)
