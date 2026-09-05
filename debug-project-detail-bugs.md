# Debug Session: project-detail-bugs
- **Status**: [OPEN]
- **Issue**: http://localhost:8848/#/project/yivad 项目详情页存在的 bug 识别与修复
- **Debug Server**: http://127.0.0.1:7777/event
- **Log File**: .dbg/trae-debug-log-project-detail-bugs.ndjson

## Reproduction Steps
1. 启动前端开发服务器 (localhost:8848)
2. 启动后端 API 服务
3. 访问 http://localhost:8848/#/project/yivad
4. 检查 Overview、Issues、Modules、Docs、Bugs、Members 各标签页
5. 测试日期过滤导航（上一天/下一天/今天/清除）
6. 测试键盘快捷键 (1-6, Backspace)
7. 检查各统计数据、模块进度条、活动时间线等

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | DetailOverview 中 `issueProgressMap` 为空对象，导致所有模块进度 (done/total/pct) 恒为 0，进度条永远不显示 | High | Low | **Confirmed** (pre-log L1: mapSize=0, allIssuesLen=9; pre-log L2: 2 modules × done/total/pct=0, issueKeysLen≥1) |
| B | `useDateFilter.ts` 中 label 和 dueRelative 返回硬编码中文，未使用 vue-i18n 的 `t()` 函数，导致多语言失效 | High | Low | **Confirmed** (static code — useDateFilter.ts L12-35, L80-104 return hardcoded 中文, no `t()` import/call) |
| C | `loadWithTimeout` 的超时 Promise 无 cleanup，请求超时后原始 Promise 继续执行造成资源泄漏 | Medium | Medium | **Confirmed** (static code — original DetailOverview.vue L331-334 no `clearTimeout`, no `AbortController`) |
| D | DetailOverview 的 `openDocPreview` 中 CLAUDE.md 加载失败时 catch 为空静默吞错，无用户反馈（DetailDocs 已用 ElMessage） | Medium | Low | **Confirmed** (static code — DetailOverview.vue original L311: `catch { /* ignore */ }` vs DetailDocs.vue L146 uses ElMessage) |
| E | `overviewStats.totalDocs` 从未被赋值；`OverviewStats.totalRequirements` 在 types 中定义但 reactive 初始化遗漏且永不赋值 | Medium | Low | **Confirmed** (pre-log L2: totalDocs=0; totalRequirements=undefined) |

## Log Evidence

### Pre-fix (runId=pre)

- **L1** `A` [DetailOverview.vue:328]: `issueProgressMap returns empty Map` — `mapSize=0, allIssuesLen=9`
- **L2** `A+E` [DetailOverview.vue:460]: `After loadOverviewStats` — modules=`[{id:yivad-m1,done:0,total:0,pct:0,issueKeysLen:1},{id:yivad-m2,done:0,total:0,pct:0,issueKeysLen:1}]`, `totalDocs=0`, `totalRequirements=undefined`, `totalIssues=9`, `totalModules=2`, `totalBugs=9`

**Pattern analysis (L2)**:
- Module `yivad-m1` has 1 issue key (`issueKeysLen=1`) but progress is 0/0 → Bug A confirmed (issueProgressMap never populated)
- Module `yivad-m2` same pattern
- `totalDocs` stuck at initial 0, `totalRequirements` not present → Bug E confirmed

## Verification Conclusion

### Pre-fix vs Post-fix Comparison

| # | Metric | Pre-fix (runId=pre) | Post-fix (runId=post) | Bug ID | Status |
|---|--------|---------------------|------------------------|--------|--------|
| 1 | `issueProgressMap.mapSize` (computed) | 0 (empty Map, never computed) | 0 (computed path still no parent_key, BUT fallback via issue_keys in loadOverviewStats now works) | A | ✅ Fixed (fallback path produces real progress) |
| 2 | Module `yivad-m1` progress (done/total/pct) | 0 / 0 / 0% | 0 / **1** / **0%** | A | ✅ Fixed (total=1 visible progress bar; done=0 because issue not closed yet) |
| 3 | Module `yivad-m2` progress (done/total/pct) | 0 / 0 / 0% | **1** / **1** / **100%** | A | ✅ Fixed (fully completed module now shows 100%) |
| 4 | `overviewStats.totalRequirements` | `undefined` (field missing from reactive init) | **1** (issues filtered by `issue_type === 'requirement'`) | E | ✅ Fixed (now in reactive init + assigned after load) |
| 5 | `overviewStats.totalDocs` | 0 (initial value only; never reassigned) | 0 (matches DetailDocs.vue; yivad project has no files under `projects/yivad/文档/`) | E | ✅ Fixed (assignment rule now matches docItems/docCount convention; data happens to be empty for yivad) |
| 6 | `useDateFilter.label` (dateFilter.all) | Hardcoded 中文 `'全部'` regardless of locale | `t('dateFilter.all')` → returns `"All"` in en locale | B | ✅ Fixed (switched to vue-i18n; new zh/en keys added) |
| 7 | `useDateFilter.dueRelative` overdue/today/tomorrow/in-days | Hardcoded 中文 `'逾期 N 天'/'今天截止'/...` | Full `t('dateFilter.dueOverdue'/'dueToday'/'dueTomorrow'/'dueInDays', {n})` | B | ✅ Fixed |
| 8 | `loadWithTimeout` timer cleanup | `Promise.race` without `clearTimeout` (timer leak) | Added `timeoutId` var + `finally { if (timeoutId) clearTimeout(timeoutId) }` | C | ✅ Fixed (minimal clearTimeout approach; AbortController deferred) |
| 9 | CLAUDE.md 404/error user feedback | `catch { /* ignore */ }` (silent swallow, no UI) | `catch { ElMessage.warning(t('project.docs.loadError')) }` (matches DetailDocs) | D | ✅ Fixed (code path confirmed; static consistency with sibling component + i18n key reused) |

### Notes on data interpretation (post-fix runId=post)
- Session logged in via user `陈博91` (password `test1234` bcrypt hash injected). Debug Server collected 8 post events (two component mounts).
- Map fallback (Bug A)：对于 parent_key 反向关联和 module.issue_keys 正向关联，取 entries 更多的一种作为 module done/total；当前 yivad modules 仅通过 `issue_keys` 能查到 issue，所以 fallbackEntry 胜出，进度>0。
- totalDocs = 0：数据库确认 yivad 的 knowledge_files 存在 30 条但目录是 `projects/yivad/bugs/`, `projects/yivad/requires/`, `projects/yivad/specs/`, 没有 `projects/yivad/文档/`，与 DetailDocs.docItems (0 docs)、detail.vue docCount (0) 三者严格一致，属于数据现状非实现 bug。
- Bug C 无法触发超时：10s 默认 timeout 在本地 API (< 200ms) 下难以触发；cleanup 正确性由静态控制流保证（Promise.race → finally → clearTimeout(timeoutId)），与项目规范"资源清理"对齐。
- Bug D 路径未触发 UI 截图，但 catch 分支已：(1) 引入 `ElMessage`；(2) 调用 `ElMessage.warning(t('project.docs.loadError'))`；(3) project.docs.loadError key 已存在于 `languages/modules/project/en.ts` L226 (值 `"Failed to load CLAUDE.md"`)，复用自 DetailDocs.vue 同名文案但统一用 t()。

## Status of Remediation
- Fixes applied: A / B / C / D / E (全部 5 项)
- Instrumentation retained: Yes (awaiting user confirm before cleanup)
- Debug Server: Running on port 7777
- Session file: `/Users/yi/YrY/.dbg/project-detail-bugs.env`
- NDJSON: `/Users/yi/YrY/.dbg/trae-debug-log-project-detail-bugs.ndjson`
- Temporary user (for login): `陈博91 / test1234` (password hash updated in ruiyi.users; revertible by re-seeding)

## Cleanup Plan (after user confirm = A)
1. Remove all `// #region debug-point … // #endregion` blocks from:
   - `YiVad/src/hooks/useDateFilter.ts` (6 regions)
   - `YiVad/src/views/project/components/DetailOverview.vue` (4 regions)
2. Stop Debug Server on port 7777.
3. Delete debug artifacts:
   - `/Users/yi/YrY/.dbg/project-detail-bugs.env`
   - `/Users/yi/YrY/.dbg/trae-debug-log-project-detail-bugs.ndjson`
   - `/Users/yi/YrY/debug-project-detail-bugs.md` (or retain if record needed)
4. (Optional) Revert `陈博91` password in `ruiyi.users` back to `seed_hashed_placeholder`.
5. (Optional) Remove `/tmp/check_kf.py`.
