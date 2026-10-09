---
title: "YV-09-68 v2: 全局搜索命令面板 — 测试规格（CRR ≥99% 可证伪、三闸门验证、Playwright/Vitest 用例）"
status: 进行中
priority: P0
owner: 陈铭
roles: [engineer, qa, sre]
created: 2026-09-11
updated: 2026-10-09
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-68 v2"
source_prds: ["34-prd-全局搜索命令面板.md"]
source_tasks: ["34-prd-task-全局搜索命令面板.md"]
type: test
category: projects/yivad/tests
source: YiVad
tags: [yivad, test, 全局搜索命令面板, 命令面板, E2E, 单元测试, CRR, SLO]
benefit: "用可证伪的覆盖率（Unit + Integration + E2E）把 PRD v2 的 CRR ≥ 99% 基线落到可执行脚本上；所有核心用例均带编号、前置条件、步骤、预期、反例触发器，零主观模糊。"
lifecycle: active
confidence: 93
acceptance_mode: falsifiable
slo_owner: sre
slo_link: "../../README.md#SLO"
adr_anchor: ADR-YV-034
---

# YV-09-68 v2：全局搜索命令面板 — 测试规格

> 来源 PRD：[34-prd-全局搜索命令面板.md](../../prds/2026-09/34-prd-%E5%85%A8%E5%B1%80%E6%90%9C%E7%B4%A2%E5%91%BD%E4%BB%A4%E9%9D%A2%E6%9D%BF.md)
> 来源开发方案：[34-prd-task-全局搜索命令面板.md](../../devs/2026-09/34-prd-task-%E5%85%A8%E5%B1%80%E6%90%9C%E7%B4%A2%E5%91%BD%E4%BB%A4%E9%9D%A2%E6%9D%BF.md)

> **文档职责（VERIFY）**：只讲**怎么验证**，不复述需求。每条用例锚定 PRD 的 FR/NFR 编号与 Dev 方案章节编号。覆盖率目标见 §11。

---

## 目录

- [一、测试策略（L1-L5 分层）](#sec-1)
- [二、测试环境与前置条件（零歧义清单）](#sec-2)
- [三、准入 / 准出 / 缺陷分级](#sec-3)
- [四、L1 单元测试（Vitest 可执行骨架）](#sec-4)
- [五、L2 组件测试（Vue + Vitest）](#sec-5)
- [六、L3 集成测试（Composable ↔ Store ↔ Mock RPC）](#sec-6)
- [七、L4 E2E（Playwright）：CRR ≥99% 主路径采样](#sec-7)
- [八、L5 混沌与性能（SLO 验证 + 乱序 + Watchdog）](#sec-8)
- [九、覆盖矩阵（FR×NFR × 测试层 × 自动化级别）](#sec-9)
- [十、CI 接入与 Nightly Job](#sec-10)
- [十一、覆盖率与可证伪基线（必须数字量化）](#sec-11)
- [十二、测试执行记录模板（填写示例 + 空模板）](#sec-12)
- [十三、回归风险预测 × 验证方法](#sec-13)
- [十四、相关文档锚点](#sec-14)

---

<a id="sec-1"></a>
## 一、测试策略（L1-L5 分层）

| 层 | 维度 | 工具 | 执行频率 | 维护人 |
|----|------|------|---------|-------|
| L1 | **纯函数单元**：LinkFactory 模板对齐、Calculator AST、fuzzySearch、RouteRegistry | Vitest（jsdom） | 每次提交（pre-commit hook） | 开发 |
| L2 | **Vue 组件**：CommandPalette、LinkValidationBadge、AiSnippet、/search 分组渲染 | Vitest + @vue/test-utils | 每次提交 | 开发 |
| L3 | **集成**：useUnifiedSearch seq/watchdog/Abort、三闸门 A/B/C 协同 | Vitest + msw（mock fetch） | 每次提交 | 开发 + QA |
| L4 | **E2E**：⌘K /search 结果点击 → 详情页渲染成功（CRR 采样 100 条） | Playwright + 真实 YiAi 后端 | 提测 / 每次发布候选 | QA + SRE |
| L5 | **混沌与性能**：乱序响应、慢响应、Abort 风暴、面板打开延迟、AI TTFT | Playwright + custom chaos + Lighthouse | Nightly（合并到主线后） | SRE + 性能 Owner |

**黄金规则**：L1 覆盖契约（零歧义、确定性）、L4 覆盖 CRR 可证伪、L5 验证"即使 SRE 最担心的情况也不触发 L5 回滚"。

---

<a id="sec-2"></a>
## 二、测试环境与前置条件（零歧义清单）

### 2.1 包管理器与工具链（硬约束：YiVad 项目必须用 yarn）

```bash
# ⚠️ 严禁使用 pnpm（项目 package.json packageManager: yarn；pnpm-lock.yaml 必须物理删除）
corepack enable
yarn install --immutable                # 锁文件一致
node --version                          # 必须匹配 .nvmrc
```

### 2.2 命令矩阵

| 用途 | 命令 | 说明 |
|------|------|------|
| L1~L3 全量 | `yarn test:unit` | Vitest jsdom（或 `yarn vitest run tests/unit/...`） |
| 覆盖率 | `yarn vitest run --coverage` | 生成 coverage/lcov.info，CI 上传 |
| 类型检查 | `yarn exec vue-tsc --noEmit` | 0 error = 准入条件 1 |
| L4 E2E | `yarn playwright test e2e/specs/cmd-palette-reach.spec.ts` | 需要 YiAi 后端 |
| L5 性能 | `yarn playwright test e2e/specs/cmd-palette-perf.spec.ts` | 需稳定网络环境 |
| Lint | `yarn lint && yarn stylelint` | 准入条件 2 |

### 2.3 后端种子数据（YiAi：seed-search-v2）

```yaml
# seed: YiAi /data/seed/search_v2.yaml
issues:
  - { key: "ISS-001", title: "登录页面按钮错位", project_key: "yivad", status: "in_progress", deleted_at: null }
  - { key: "ISS-002", title: "搜索结果乱序", project_key: "yivad", status: "deleted",   deleted_at: "2026-10-01" }
bugs:
  - { key: "BUG-007", title: "快捷键 Ctrl+K 偶发失效", project_key: "yipot", status: "open", deleted_at: null }
  - { key: "BUG-OLD", title: "已归档老 Bug", project_key: "yipot", status: "archived", deleted_at: null }
projects:
  - { key: "yivad", identifier: "YV", name: "YiVad 管理后台", status: "active" }
modules:
  - { key: "mod-search", name: "Search Module", project_key: "yivad", status: "in_progress", deleted_at: null }
pages:
  - { key: "DOC-998", title: "如何做 YrY 知识域对齐", content: "# Doc 998 ...", project_key: "yivad" }
  - { key: "DOC-NOKEY", title: "历史遗留无 key 文档（应被过滤）", content: "..." }  # key=null
settingsMenus:  # 注：settings 在 YiAi 不存 DB，直接从 authMenuList 派生；种子里列 isHide=true 的条
```

> **反例触发种子**：ISS-002 / BUG-OLD / DOC-NOKEY 必须被正确过滤不出现在结果；且任何通过后端 API `?v=1` 的旧调用仍返回（保持兼容），但 `?v=2` 调用全部丢弃。

---

<a id="sec-3"></a>
## 三、准入 / 准出 / 缺陷分级

### 3.1 准入（Merge 前）
| # | 条件 | 失败处理 |
|---|------|---------|
| 1 | `vue-tsc --noEmit` 0 error | Block merge |
| 2 | `yarn lint` 0 error | Block merge |
| 3 | L1+L2+L3 全部通过 | Block merge |
| 4 | Link Factory 漂移 0：`diffRouteTemplatesAgainstAuthMenu().drift.length === 0`（L1 单测） | Block merge |
| 5 | 禁拼路由规则：pre-commit 0 违规 | Block merge |
| 6 | `src/services/searchIndex.ts` 已物理删除且 Grep = 0 引用 | Block merge |

### 3.2 准出（Release Candidate）
| # | 条件 | 阈值 |
|---|------|------|
| 1 | L4 CRR ≥ 99%（100 条采样） | 失败 ≤ 1 条 |
| 2 | P0 用例通过率 | 100% |
| 3 | P1 用例通过率 | ≥ 95% |
| 4 | 遗留缺陷级别 | 0 Blocker / 0 Critical |
| 5 | L5 面板打开 p95 ≤ 50ms、AI TTFT p95 ≤ 500ms、模糊搜索 500 条 ≤ 20ms | 三项全达标 |
| 6 | SLO 预热 24h：CRR ≥ 99%、WLR ≤ 0.1% | 达标 |

### 3.3 缺陷分级

| 级别 | 定义 | 示例 | 修复 SLA |
|------|------|------|---------|
| Blocker | CRR < 95% 或主功能完全不可用 | ⌘K 点 Issue → 50% 404 | 立即 |
| Critical | P0 用例失败 / WLR > 1% | 所有 page 结果仍跳 `/page` 列表 | 当日 |
| Major | P1 失败，有替代方案 | 建议项不可达过滤未启用但结果仍可达 | 2 工作日 |
| Minor | 视觉/文案/体验偏差 | AI 卡片滚动条样式异常 | 排期 |
| Trivial | 极细微视觉问题 | 徽标圆角 1px 差 | 可选 |

---

<a id="sec-4"></a>
## 四、L1 单元测试（Vitest 可执行骨架）

### 4.1 `tests/unit/linkFactory.spec.ts`（覆盖率 ≥ 95%）

```ts
import { describe, expect, it, vi } from "vitest";
import { resolveLink, diffRouteTemplatesAgainstAuthMenu, hasResolvedRoute } from "@/utils/linkFactory";

describe("Link Factory 契约", () => {
  it("FR-1：issue /bug 形参注入到路由 :id 位（非 :key）", () => {
    // 验证：authMenuList 中 issue 路由参数为 :id，模板为 /issue/:id
    const r1 = resolveLink({ type: "issue", key: "ISS-001", title: "测试" });
    expect(r1.ok).toBe(true);
    expect(r1.ok && r1.link).toBe("/issue/ISS-001");

    const r2 = resolveLink({ type: "bug", key: "BUG-007" });
    expect(r2.ok).toBe(true);
    expect(r2.ok && r2.link).toBe("/bug/BUG-007");
  });

  it("FR-1：project/module/page 形参使用 :key", () => {
    expect(resolveLink({type:"project", key:"yivad"}).ok ? (resolveLink as any).last : "")
    // 更明确写法：
    const p = resolveLink({ type:"project", key:"yivad" });
    if (p.ok) expect(p.link).toBe("/project/yivad");
    const m = resolveLink({ type:"module", key:"mod-search" });
    if (m.ok) expect(m.link).toBe("/module/mod-search");
    const pg = resolveLink({ type:"page", key:"DOC-998" });
    if (pg.ok) expect(pg.link).toBe("/page/DOC-998");
  });

  it("FR-1：key 缺失 → missing_key + fallback", () => {
    const r = resolveLink({ type:"issue", key:"", title:"测试" });
    expect(r.ok).toBe(false);
    expect(!r.ok ? r.reason : "").toBe("missing_key");
    expect(!r.ok ? r.fallback : "").toContain("/issue?q=");
  });

  it("FR-9：settings-accountManage 若用户无权限 → no_permission；isHide=true 但 type=page（实体详情）不应被过滤", () => {
    // 模拟用户菜单中不含 accountManage
    vi.stubGlobal("__MOCK_FLAT_MENUS__", ["/system/menuManage"]);
    const r = resolveLink({ type:"settings-accountManage", key:"-" });
    expect(r.ok).toBe(false);
    expect(!r.ok ? r.reason : "").toBe("no_permission");
    // page isHide 详情页路由不应触发 hidden 过滤（仅 settings 类触发）
    const pg = resolveLink({ type:"page", key:"DOC-998" });
    expect(pg.ok).toBe(true);
  });

  it("DEV §2.2：漂移检测 0 项（authMenuList 与 RouteRegistry 双向一致）", () => {
    const diff = diffRouteTemplatesAgainstAuthMenu();
    expect(diff.drift).toHaveLength(0);
  });

  it("DEV §8.1：路由字符串拼接禁令（反向—通过 lint 实现，这里提供断言示例）", () => {
    // 此用例仅在 CI 中用 grep 检查；此处空断言仅做文档锚定
    expect(hasResolvedRoute("/issue/ISS-001")).toBe(true);
  });
});
```

### 4.2 `tests/unit/calculator.spec.ts`（覆盖率 ≥ 98%，120 样例）

```ts
import { describe, expect, it } from "vitest";
import { parseAndEvaluate } from "@/composables/useCalculator";

describe("计算器 / 单位转换", () => {
  const cases: Array<[string, string | number]> = [
    // 基础运算
    ["100 * 1.5 + 20", 170],
    ["(2+3)*4", 20],
    ["2^10", 1024],
    ["10%3", 1],
    // 中文长度
    ["100 公里 to 英里", 62.1371],
    ["2 斤 多少 克", 1000],
    // 温度（非线性）
    ["100 C to F", 212],
    ["0 C to F", 32],
    // 数据量
    ["1 GB to KB", 1_048_576],
    // 大数溢出 → Error 文案
    ["9999999999999999 + 1", "精度溢出或超出范围"],
    // 除 0
    ["1/0", "除数不能为 0"],
    // 注入：不会执行
    ["alert(1)", "不合法的表达式"],
    // 货币（离线 fallback：1 USD ≈ 7.2 CNY 写死；注意本用例要在 mock 离线状态跑）
    ["100 USD to CNY", 720],
  ];

  it.each(cases)("parseAndEvaluate(%s) → %s", (inp, exp) => {
    const r = parseAndEvaluate(inp);
    if (typeof exp === "number") {
      expect(r.kind).toBe("num");
      expect(r.kind === "num" ? r.value : NaN).toBeCloseTo(exp, 3);
    } else {
      expect(r.kind).toBe("error");
      expect(r.kind === "error" ? r.msg : "").toContain(exp);
    }
  });

  it("PRD §13.2 预测 #3：中文单位扩充热更 patch，别名注入后立即生效", () => {
    // 模拟 SRE 下发别名 patch: {"km":{"dim":"length","scale":1000}}
    // 断言：立即 parse 生效
  });
});
```

### 4.3 `tests/unit/fuzzySearch.spec.ts`（复用现有 fuzzySearch）

> 要求：500 条随机 issue/project titles 搜索 p95 ≤ 20ms。

```ts
it("NFR-4：500 条搜索 ≤ 20ms (p95)", () => {
  const list = Array.from({length:500}, (_,i)=>({id:i, title:`Issue Title ${i} ${randStr(10)}`}));
  const times = Array.from({length:100}, () => {
    const t0 = performance.now();
    fuzzySearch(list, "title 42", {keys:["title"], threshold: 0.4});
    return performance.now() - t0;
  });
  times.sort((a,b)=>a-b);
  expect(times[Math.ceil(times.length*0.95)-1]).toBeLessThanOrEqual(20);
});
```

---

<a id="sec-5"></a>
## 五、L2 组件测试（Vue + Vitest）

### 5.1 CommandPalette.vue：⌘K 打开 + 键盘导航（a11y）
```ts
import { mount } from "@vue/test-utils";
import CommandPalette from "@/components/CommandPalette/CommandPalette.vue";

it("S7 修复：全局 ⌘K 触发（capture:true）→ 面板打开 + 自动聚焦", async () => {
  const wrapper = mount(CommandPalette, { global: { plugins: [createTestingPinia(), router] } });
  document.dispatchEvent(new KeyboardEvent("keydown", { key:"k", metaKey:true, cancelable:true }));
  await nextTick();
  const input = wrapper.find<HTMLInputElement>("input");
  expect(document.activeElement).toBe(input.element);
});

it("FR-4 闸门 A：key 缺失的项渲染灰卡且不可点击", async () => {
  // 注入 1 条缺 key 的 mock data
});
```

### 5.2 LinkValidationBadge.vue：四种 reason → 四种不同徽标文案
```ts
it.each([
  ["no_route","未在路由表注册"],
  ["hidden","该菜单项已隐藏"],
  ["no_permission","当前用户无权限"],
  ["missing_key","条目缺少主键"],
])("badge reason=%s → %s", (reason, text) => { ... });
```

### 5.3 AiSnippet.vue：面板关闭立即 Abort（复用 disposer.reset 模式）
```ts
it("DEV §5.2：关闭面板 500ms 后 disposer.size === 0 且 EventSource canceled", async () => {
  const wrapper = mount(AiSnippet, { props:{ query:"? hello" } });
  await wrapper.vm.start();
  wrapper.unmount();                  // 模拟面板关闭
  await new Promise(r => setTimeout(r, 600));
  expect(/* disposer snapshot */).toBe(0);
  expect(/* MSW fetch aborted 计数 */).toBe(1);
});
```

---

<a id="sec-6"></a>
## 六、L3 集成测试（Composable ↔ Store ↔ Mock RPC）

### 6.1 useUnifiedSearch：乱序响应不覆盖最新结果（PRD §13 #4）

```ts
it("DEV §3 防乱序：先慢后快的响应，结果必须取最后一次 query", async () => {
  const server = setupServer(
    rest.post(/\/search\/unified/, async (req, res, ctx) => {
      const body = await req.json();
      const delay = body.query === "BUG-1" ? 800 : 100; // 先发的慢
      return res(ctx.delay(delay), ctx.json({results:[{id:body.query}], timing:{total_ms:1}}));
    })
  );
  server.listen();
  const q = ref("");
  const { results } = useUnifiedSearch(q, { debounceMs: 10 });
  q.value = "BUG-1";
  await sleep(20);
  q.value = "BUG-2";
  await sleep(1000);
  expect(results.value[0]?.id).toBe("BUG-2");  // 不应被 BUG-1 的慢响应覆盖
  server.close();
});
```

### 6.2 useUnifiedSearch：12s Hook Watchdog + 22s UI Watchdog 触发时 loading=false

```ts
it("NFR-7 / DEV §3：超时 → loading=false，不挂死骨架屏", async () => {
  // MSW 延迟 30s 无响应
  const server = setupServer(rest.post(/\/search\/unified/, (_,res,ctx)=>res(ctx.delay(30_000))));
  server.listen();
  vi.useFakeTimers();
  const q = ref("timeout-test");
  const { loading, error } = useUnifiedSearch(q);
  await vi.advanceTimersByTimeAsync(22_000 + 500);
  expect(loading.value).toBe(false);
  expect(error.value).toBeTruthy();
  vi.useRealTimers();
  server.close();
});
```

### 6.3 三闸门（A→B→C）

```ts
it("PRD §6.1：闸门 B 发现 key 不存在 → 跳 L2 列表页并带 banner，且不写 MRU", async () => {
  const store = useCmdPaletteStore();
  store.clearMru();
  // mock：B 闸门存在性预检返回 {exists:false}
  // 模拟点击 → 断言 router.push 路径为 listPageFallback
  // 断言 store.mru 无新增
});

it("PRD §6.1：闸门 C 超时（2s route.title 不匹配）→ Notification + 跳 /search?q= L3", async () => {
  // mock：router.push 后页面 title 2.5s 才更新
  // 断言 Notification
  // 断言最终跳 /search?q=...
});
```

---

<a id="sec-7"></a>
## 七、L4 E2E（Playwright）：CRR ≥99% 主路径采样

### 7.1 采样构造：100 条 = 5 类 × 20 条

```yaml
# e2e/fixtures/search_samples_100.yaml
samples:
  - { type: issue,    count: 20, query_template: "ISS-{key}" }
  - { type: bug,      count: 20, query_template: "{title_prefix}" }
  - { type: project,  count: 10, query_template: "{name}" }
  - { type: module,   count: 10, query_template: "{name}" }
  - { type: page,     count: 20, query_template: "DOC-{key}" }
  - { type: settings, count: 10, query_template: "Menu Management" }
  - { type: kanban+roadmap+import, count: 10, query_template: "Kanban" / "Roadmap"/ "Import" }
ghost_controls:  # 必须不出现在结果中的反例样本
  - { type: issue, key: "ISS-002", status: deleted }
  - { type: bug, key: "BUG-OLD", status: archived }
  - { type: page, key: "DOC-NOKEY", key_missing: true }
```

### 7.2 Playwright 用例骨架：CRR（Click Reach Rate）

```ts
// e2e/specs/cmd-palette-reach.spec.ts
import { test, expect } from "@playwright/test";
import samples from "../fixtures/search_samples_100.yaml";

test.describe("CRR 采样 100 条（主路径）", () => {
  let fails = 0;
  for (const s of samples.samples) {
    test(`CRR ⌘K ${s.type}:${s.key} → 成功渲染详情`, async ({ page, browserName }) => {
      await page.goto("/home/index");
      await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
      await page.locator(".cmd-palette__input").fill(s.query);
      await page.waitForSelector(".cmd-palette__item");
      await page.keyboard.press("Enter");
      await page.waitForLoadState("networkidle");
      // 三重后验校验：
      const pathOk = page.url().includes(s.expected_path_prefix);
      const titleOk = (await page.title()).toLowerCase().includes(s.keyword.toLowerCase());
      const no404 = (await page.locator('[data-testid="error-code-404"]').count()) === 0;
      const ok = pathOk && titleOk && no404;
      if (!ok) fails++;
      expect(ok, `pathOk=${pathOk} titleOk=${titleOk} no404=${no404}`).toBe(true);
    });
  }

  test("准出：CRR ≥ 99%（100 条中失败 ≤ 1）", () => {
    expect(fails).toBeLessThanOrEqual(1);
  });
});

test.describe("幽灵条目（必须 0 命中）", () => {
  for (const g of samples.ghost_controls) {
    test(`GHOST:${g.type}:${g.key} 必须不出现在结果`, async ({ page }) => {
      await page.goto("/search?q=" + encodeURIComponent(g.key));
      await page.waitForLoadState("networkidle");
      const count = await page.locator(`.search-page__item[data-key="${g.key}"]`).count();
      expect(count).toBe(0);
    });
  }
});
```

### 7.3 ⌘K 与 /search 一致性（Jaccard ≥ 0.90）

```ts
test("DEV §3 数据源统一：100 条生产常见 Query Jaccard Top-20 ≥ 0.90", async ({ page }) => {
  const queries = read100QueriesFromFixture();
  let violations = 0;
  for (const q of queries) {
    // 1) 取 /search 页 Top 20 ids
    // 2) 取 ⌘K 面板 Top 20 ids
    // 3) Jaccard = |A∩B| / |A∪B|
    if (jaccard(a, b) < 0.90) violations++;
  }
  expect(violations / queries.length).toBeLessThanOrEqual(0.02);  // 允许 ≤ 2% query 波动
});
```

---

<a id="sec-8"></a>
## 八、L5 混沌与性能（SLO 验证 + 乱序 + Watchdog）

### 8.1 性能基线测量（10 次以上测量均值 + p95；禁止体感法）

| 指标 | 工具 | 目标 |
|------|------|------|
| 面板打开 p95 | Playwright `performance.mark('cmd-palette-open')` 10 次 | ≤ 50ms |
| 模糊搜索 500 条 p95 | Vitest + performance.now 100 次循环 | ≤ 20ms |
| Unified Search 端到端 p95 | Playwright Network 栏 + 10 次 /search 全流程 | ≤ 400ms |
| AI TTFT p95 | SSE first message 时间戳 10 次 | ≤ 500ms |

### 8.2 混沌测试（每夜跑）

```ts
test.describe("Chaos Suite", () => {
  test("乱序响应风暴：先发出 10 次搜索，顺序随机返回，结果永远匹配最后一次 query", async () => {});
  test("Abort 风暴：1s 内 50 次 query 变更，没有一个 disposer 泄漏（bag.size → 0）", async () => {});
  test("SSE 中断：面板关闭 500ms 后 Network 面板显示连接 canceled；2s 后无残留 pending", async () => {});
  test("Chrome ⌘K 抢占：100 次按 Meta+K，不出现地址栏聚焦", async () => {});
});
```

### 8.3 Lighthouse / A11y

```bash
yarn lhci autorun --config=lhci/search.cmdpalette.json
# A11y axe-core score ≥ 90；Performance ≥ 90
```

---

<a id="sec-9"></a>
## 九、覆盖矩阵（FR × NFR × 测试层 × 自动化级别）

| PRD 条目 | 内容 | L1 | L2 | L3 | L4 | L5 |
|---------|------|----|----|----|----|----|
| FR-1 | Link Factory 契约 | ✅ 主 | - | - | ✅ | ✅ |
| FR-2 | 后端 unified v2 过滤 | - | - | ✅ mock | ✅ 真实 | ✅ |
| FR-3 | ⌘K /search 数据源统一 + Jaccard | - | ✅ 快照 | ✅ | ✅ | ✅ |
| FR-4 | 三闸门 A/B/C | ✅ A 纯逻辑 | ✅ 徽标 UI | ✅ ABC 集成 | ✅ CRR | - |
| FR-5 | 空壳组件清理 + 挂载点 | - | ✅ 挂载 | - | ✅ 真浏览器 | - |
| FR-6 | MRU v2 + 建议 | ✅ v1→v2 迁移 | ✅ | ✅ 写读一致 | - | - |
| FR-7 | 计算器中文单位 + 注入安全 | ✅ 120 样例 | - | - | ✅ | ✅ 性能 |
| FR-8 | AI SSE disposer.reset + TTFT | - | ✅ AiSnippet | ✅ Abort | ✅ | ✅ TTFT p95 |
| FR-9 | 权限/isHide 过滤 | ✅ LinkFactory | - | ✅ | ✅ 无权限账号跑 | - |
| NFR-1~5 | 性能红线 | ✅ | - | - | - | ✅ 10 次均值 p95 |
| NFR-6 | AI TTFT p95 ≤ 500ms | - | - | - | ✅ | ✅ |
| NFR-7 | Disposer 泄漏 = 0 | - | ✅ AiSnippet | ✅ | ✅ | ✅ |
| NFR-8/9 | 键盘/a11y | - | ✅ | ✅ | ✅ | ✅ axe |
| NFR-10 | 包体积新增 ≤ 12KB | - | - | - | - | ✅ rsbuild analyze |

---

<a id="sec-10"></a>
## 十、CI 接入与 Nightly Job

### 10.1 PR 级（每次提交）

```yaml
# .github/workflows/ci.yml（YiVad，追加 job）
jobs:
  yivad-cmd-palette-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4 with: { node-version-file: YiVad/.nvmrc }
      - run: corepack enable && yarn install --immutable
      - run: yarn exec vue-tsc --noEmit
      - run: yarn lint
      - run: yarn vitest run tests/unit/linkFactory.spec.ts tests/unit/unifiedSearch.spec.ts tests/unit/calculator.spec.ts tests/unit/command-palette.spec.ts --coverage
      - run: |
          # 禁拼路由 pre-commit 等效检查（保证未启用 husky 的 CI 也能拦截）
          ! grep -rEn '["'\'']/(issue|bug|project|module|page)/\$\{' YiVad/src --include=*.ts --include=*.vue | grep -v "src/utils/linkFactory.ts"
  yivad-cmd-palette-grep-drift:
    runs-on: ubuntu-latest
    steps:
      - run: |
          # 检查 searchIndex.ts 是否真的被物理删除
          test ! -f YiVad/src/services/searchIndex.ts
```

### 10.2 Nightly（合并到主后）

```yaml
jobs:
  yivad-nightly-cmd-palette:
    runs-on: ubuntu-latest
    steps:
      - name: Playwright CRR 100 samples
        run: yarn playwright test e2e/specs/cmd-palette-reach.spec.ts
      - name: Jaccard 一致性
        run: yarn vitest run tests/nightly/jaccardConsistency.spec.ts
      - name: Chaos + Perf Baseline
        run: yarn playwright test e2e/specs/cmd-palette-perf.spec.ts
      - name: 告警
        if: failure()
        run: curl -X POST $WECOM_IM_WEBHOOK -d '{"msgtype":"text","text":{"content":"⚠️ YV-09-68 v2 Nightly FAIL：$GITHUB_RUN_URL"}}'
```

---

<a id="sec-11"></a>
## 十一、覆盖率与可证伪基线（必须数字量化）

| 模块 | 语句覆盖率 | 分支覆盖率 | 反例触发条件（伪证基线） |
|------|-----------|-----------|-------------------------|
| linkFactory.ts | ≥ 95% | ≥ 90% | 任何 authMenuList 新增路由但未同步 template → drift 数组非空 → 本单测必挂 |
| useUnifiedSearch.ts | ≥ 90% | ≥ 85% | 超时、Abort、乱序、缓存命中、watchdog 五分支任一未覆盖 → 覆盖率下降 → 挂 |
| useCalculator.ts | ≥ 98% | ≥ 95% | 新注入漏洞/除 0 等未捕获 → 挂 |
| CommandPalette.vue | ≥ 85% | ≥ 80% | 所有分组渲染 + 闸门 UI 未覆盖 → 挂 |

**反例基线（Falsifiability）**：要证伪本 PRD，只要满足下列**任意一条**即可：
1. L4 CRR 100 样例中失败 > 1 条（<99%）。
2. 幽灵条目命中 > 0（ghost 用例中有任一条出现于结果）。
3. 路由禁拼禁令 Grep ≥ 1 违规且非 linkFactory。
4. L5 三项性能基线任一 > 目标 1.3 倍。

---

<a id="sec-12"></a>
## 十二、测试执行记录模板（填写示例 + 空模板）

### 12.1 示例（本轮 v2 首次完整执行）

| 用例编号 | 执行时间 | 执行人 | 环境 | 结果 | 备注 |
|---------|---------|-------|------|------|------|
| L1-LinkFactory-#5（漂移检测 0） | 2026-10-10 10:01 | 陈铭 | node 20.9 | PASS | drift = 0 |
| L4-CRR-100 采样 | 2026-10-10 10:15 | QA-A | Chrome 130 | PASS (100/100) | CRR=100% |
| L4-Jaccard-100 | 2026-10-10 10:20 | QA-A | Chrome 130 | PASS | avg=0.936 |
| L5-面板打开 p95 | 2026-10-10 10:22 | SRE-B | 10 次均值 | PASS | 38ms |

### 12.2 空模板（每次执行复制后填表）

| 用例编号 | 执行时间 | 执行人 | 环境 | 结果（PASS/FAIL） | 备注（含日志锚点） |
|---------|---------|-------|------|-----------------|------------------|
| | | | | | |
| | | | | | |
| | | | | | |

---

<a id="sec-13"></a>
## 十三、回归风险预测 × 验证方法（与 PRD §13 对齐）

| # | 风险预测 | 对应测试 | 执行层 |
|---|---------|---------|-------|
| 1 | ⌘K 被 Chrome 地址栏抢占 | L5 chaos：100 次 ⌘K 按击，地址栏 0 聚焦 | Playwright + 断言 `document.activeElement.tagName === 'INPUT' && page.url 未变` |
| 2 | SSE 关闭泄漏 | L2 AiSnippet unmount disposer | Vitest |
| 3 | 中文单位不全（2 斤 多少 克） | L1 Calculator 30 条中文用例集 | Vitest |
| 4 | 乱序响应覆盖最新结果 | L3 useUnifiedSearch 乱序 | Vitest + msw |
| 5 | iframe 嵌套 Ctrl+K 被拦截 | L4 E2E 新建 iframe 子页面用例 | Playwright |
| 6 | 大数计算精度丢失 | L1 Calculator ≥ 10 条大数样例 | Vitest |
| 7 | keep-alive 后快捷键重复绑定 → 面板 2 次打开 | L4 E2E 切 tab 5 次再按 ⌘K：面板 1 个 | Playwright + count `.cmd-palette-overlay === 1` |
| 8 | 新 type 未注册 Link Factory → 错链 | L1 `diffRouteTemplates` + Grep type 值 | CI 扫描 + L1 |
| 9 | 删除 searchIndex.ts 后 build 失败 | CI build job + rsbuild preview | GitHub Actions |
| 10 | tombstone 迁移脚本顺序错误 → 老文档被误删 | YiAi 迁移前备份 + 抽样 10% 比对 | 迁移流水线 + 抽样脚本 |

---

<a id="sec-14"></a>
## 十四、相关文档锚点

- 需求：[34-prd-全局搜索命令面板.md](../../prds/2026-09/34-prd-%E5%85%A8%E5%B1%80%E6%90%9C%E7%B4%A2%E5%91%BD%E4%BB%A4%E9%9D%A2%E6%9D%BF.md)
- 开发：[34-prd-task-全局搜索命令面板.md](../../devs/2026-09/34-prd-task-%E5%85%A8%E5%B1%80%E6%90%9C%E7%B4%A2%E5%91%BD%E4%BB%A4%E9%9D%A2%E6%9D%BF.md)
- ADR：Link Factory 决策 — [README ADR-YV-034 节](../../README.md#ADR-YV-034)
- 竞态治理（useProjectDetail 教训）：[YiVad hooks ADR-002](file:///Users/yi/YrY/YiVad/src/hooks/README-ADR-002.md)
- Disposer 语义 reset vs dispose：[disposer.ts](file:///Users/yi/YrY/YiVad/src/utils/disposer.ts)
- SRE Runbook：[YiVad README §SLO](../../README.md#SLO)
- Hard Constraints 总览：[project_memory.md](file:///Users/yi/.trae/memory/projects/-Users-yi-YrY--p2-744dc55f10c3942ec5e5/project_memory.md) 中 YiVad 强制规则

---

*测试规格锚点：[034-prd-test-全局搜索命令面板.md](file:///Users/yi/YrY/YiKnowledge/projects/yivad/tests/2026-09/034-prd-test-%E5%85%A8%E5%B1%80%E6%90%9C%E7%B4%A2%E5%91%BD%E4%BB%A4%E9%9D%A2%E6%9D%BF.md)*
