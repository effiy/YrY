<template>
  <div class="dt-root">
    <!-- ═══ KPI 指标卡 ═══ -->
    <section class="dt-section">
      <h3 class="dt-section__title">测试运行概览</h3>
      <div class="dt-kpis">
        <div class="dt-kpi">
          <span class="dt-kpi__value dt-kpi__value--pass">387</span>
          <span class="dt-kpi__label">已通过</span>
          <span class="dt-kpi__sub">{{ (387 / 388 * 100).toFixed(1) }}% 通过率</span>
          <div class="dt-kpi__bar"><div class="dt-kpi__bar-fill dt-kpi__bar-fill--pass" style="width:99.7%" /></div>
        </div>
        <div class="dt-kpi">
          <span class="dt-kpi__value dt-kpi__value--fail">1</span>
          <span class="dt-kpi__label">失败</span>
          <span class="dt-kpi__sub">useTableState › default pageSize</span>
          <div class="dt-kpi__bar"><div class="dt-kpi__bar-fill dt-kpi__bar-fill--fail" style="width:2%" /></div>
        </div>
        <div class="dt-kpi">
          <span class="dt-kpi__value">110</span>
          <span class="dt-kpi__label">测试套件</span>
          <span class="dt-kpi__sub">108 passed · 2 failed</span>
        </div>
        <div class="dt-kpi">
          <span class="dt-kpi__value">3.5<span class="dt-kpi__unit">s</span></span>
          <span class="dt-kpi__label">总耗时</span>
          <span class="dt-kpi__sub">4 个测试层并行</span>
        </div>
        <div class="dt-kpi">
          <span class="dt-kpi__value dt-kpi__value--warn">12</span>
          <span class="dt-kpi__label">未覆盖目录</span>
          <span class="dt-kpi__sub">src/ 下 20 个目录中</span>
        </div>
      </div>
    </section>

    <!-- ═══ Section 2: ECharts 图表 ═══ -->
    <section class="dt-section">
      <h3 class="dt-section__title">测试分布分析</h3>
      <div class="dt-grid dt-grid--2col">
        <div class="dt-card">
          <div class="dt-card__head">
            <span>通过 / 失败</span>
            <span class="dt-card__total">388 tests</span>
          </div>
          <div class="dt-card__body dt-card__body--sm">
            <ECharts :option="passDonut" />
          </div>
        </div>
        <div class="dt-card">
          <div class="dt-card__head">
            <span>各层测试数量</span>
            <span class="dt-card__total">4 个测试层</span>
          </div>
          <div class="dt-card__body dt-card__body--sm">
            <ECharts :option="layerBar" />
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Section 3: 各层详情 + 最慢套件 ═══ -->
    <section class="dt-section">
      <h3 class="dt-section__title">测试层详情</h3>
      <div class="dt-grid dt-grid--2col">
        <!-- 每层文件清单 -->
        <div class="dt-card">
          <div class="dt-card__head">
            <span>测试文件清单</span>
            <span class="dt-card__total">42 个测试文件</span>
          </div>
          <div class="dt-card__body dt-card__body--scroll">
            <div v-for="group in fileGroups" :key="group.label" class="dt-fg">
              <div class="dt-fg__head">
                <span class="dt-dot" :style="{ background: group.color }" />
                <span class="dt-fg__label">{{ group.label }}</span>
                <span class="dt-fg__meta">{{ group.files.length }} files · {{ group.totalCases }} cases</span>
              </div>
              <div
                v-for="f in group.files"
                :key="f.path"
                class="dt-fg__file"
                :class="{ 'is-loading': fileLoading === f.path }"
                :title="'点击预览 ' + f.path"
                @click="openTestFile(f.path)"
              >
                <el-icon v-if="fileLoading === f.path" :size="12" class="is-loading"><Loading /></el-icon>
                <code class="dt-fg__name">{{ f.path }}</code>
                <span class="dt-fg__cases">{{ f.cases }} cases</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 最慢套件 + 覆盖率配置 -->
        <div>
          <div class="dt-card" style="margin-bottom:12px">
            <div class="dt-card__head">
              <span>最慢的 5 个测试套件</span>
              <span class="dt-card__total">总耗时 3.5s</span>
            </div>
            <div class="dt-card__body">
              <div v-for="(s, i) in slowSuites" :key="s.name" class="dt-slow">
                <span class="dt-slow__rank">{{ i + 1 }}</span>
                <code class="dt-slow__name">{{ s.name }}</code>
                <span class="dt-slow__meta">{{ s.tests }} tests</span>
                <span class="dt-slow__dur" :class="{ 'is-slow': s.isSlow }">{{ s.duration }}</span>
              </div>
            </div>
          </div>

          <div class="dt-card">
            <div class="dt-card__head">
              <span>覆盖率门禁配置</span>
              <span class="dt-card__total">vitest.config.ts</span>
            </div>
            <div class="dt-card__body">
              <div class="dt-cov">
                <div v-for="c in covConfig" :key="c.label" class="dt-cov__row">
                  <div class="dt-cov__head">
                    <span class="dt-cov__label">{{ c.label }}</span>
                    <span class="dt-cov__pct" :style="{ color: c.color }">≥ {{ c.pct }}</span>
                  </div>
                  <div class="dt-cov__bar">
                    <div class="dt-cov__bar-fill" :style="{ width: c.pct, background: c.color }" />
                  </div>
                </div>
              </div>
              <div class="dt-cov__foot">
                <code>@vitest/coverage-v8</code>
                <span>provider: v8 · reporter: text/json/html/lcov</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Section 4: 失败详情 + 覆盖率缺口 ═══ -->
    <section class="dt-section">
      <h3 class="dt-section__title">质量详情</h3>
      <div class="dt-grid dt-grid--2col">
        <!-- 失败详情 -->
        <div class="dt-card">
          <div class="dt-card__head">
            <span>失败测试详情</span>
            <el-tag type="danger" size="small" effect="plain">1 项</el-tag>
          </div>
          <div class="dt-card__body">
            <div class="dt-err">
              <code class="dt-err__name">useTableState uses default pageSize when not specified</code>
              <span class="dt-err__loc">tests/hooks/useTableState.test.ts:85</span>
              <pre class="dt-err__msg">AssertionError: expected 50 to be 10
  // Object.is equality</pre>
            </div>
          </div>
        </div>

        <!-- 覆盖率缺口 -->
        <div class="dt-card">
          <div class="dt-card__head">
            <span>源码覆盖率缺口</span>
            <span class="dt-card__total">5 / 20 目录已覆盖</span>
          </div>
          <div class="dt-card__body dt-card__body--scroll">
            <div v-for="g in coverageGaps" :key="g.dir" class="dt-gap" :class="{ 'is-critical': g.critical }">
              <div class="dt-gap__info">
                <code class="dt-gap__dir">src/{{ g.dir }}/</code>
                <span class="dt-gap__count">{{ g.files }} 个源文件</span>
              </div>
              <div class="dt-gap__bar">
                <div class="dt-gap__bar-fill" :style="{ width: gapPct(g.files) + '%', background: g.critical ? '#f56c6c' : '#e6a23c' }" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Section 5: 推荐操作 ═══ -->
    <section class="dt-section">
      <h3 class="dt-section__title">推荐操作</h3>
      <div class="dt-actions">
        <div class="dt-action dt-action--danger">
          <div class="dt-action__left">
            <span class="dt-action__icon"><el-icon :size="16"><WarningFilled /></el-icon></span>
            <div>
              <span class="dt-action__title">修复唯一的失败测试</span>
              <span class="dt-action__desc"><code>tests/hooks/useTableState.test.ts:85</code> — 预期值是 10，实际返回 50。大概率是 <code>useTableState</code> 的默认 <code>pageSize</code> 从 10 改为了 50，测试没有同步更新。</span>
            </div>
          </div>
          <el-tag type="danger" size="small">立即修复</el-tag>
        </div>
        <div class="dt-action dt-action--warn">
          <div class="dt-action__left">
            <span class="dt-action__icon"><el-icon :size="16"><WarningFilled /></el-icon></span>
            <div>
              <span class="dt-action__title">为核心模块编写测试</span>
              <span class="dt-action__desc"><code>stores/</code>（30 文件）、<code>directives/</code>（11 文件）、<code>routers/</code>（3 文件）零覆盖，建议优先为 Pinia stores 编写测试。</span>
            </div>
          </div>
          <el-tag type="warning" size="small">高优先级</el-tag>
        </div>
        <div class="dt-action">
          <div class="dt-action__left">
            <span class="dt-action__icon"><el-icon :size="16"><CircleCheckFilled /></el-icon></span>
            <div>
              <span class="dt-action__title">扩充 E2E 测试</span>
              <span class="dt-action__desc">当前仅有 1 个 smoke spec（<code>e2e/specs/smoke.spec.ts</code>），未覆盖关键用户路径。建议为核心流程增加 E2E 场景。</span>
            </div>
          </div>
          <el-tag type="info" size="small">建议</el-tag>
        </div>
      </div>
    </section>

    <!-- ═══ Section 6: 测试编写速查 ═══ -->
    <section class="dt-section">
      <h3 class="dt-section__title">测试编写速查</h3>
      <div class="dt-grid dt-grid--2col">
        <div class="dt-card">
          <div class="dt-card__head"><span>文件约定</span></div>
          <div class="dt-card__body">
            <table class="dt-ref">
              <tr><td class="dt-ref__k">测试文件</td><td class="dt-ref__v"><code>tests/&lt;layer&gt;/&lt;name&gt;.test.ts</code></td></tr>
              <tr><td class="dt-ref__k">命名</td><td class="dt-ref__v">与被测模块同名，<code>.test.ts</code> 后缀</td></tr>
              <tr><td class="dt-ref__k">工具函数</td><td class="dt-ref__v"><code>tests/utils/</code> — 纯函数、无副作用</td></tr>
              <tr><td class="dt-ref__k">Composable</td><td class="dt-ref__v"><code>tests/hooks/</code> — 状态、副作用</td></tr>
              <tr><td class="dt-ref__k">组件</td><td class="dt-ref__v"><code>tests/components/</code> — 渲染、事件</td></tr>
              <tr><td class="dt-ref__k">集成/API</td><td class="dt-ref__v"><code>tests/unit/</code> 或 <code>tests/api/</code></td></tr>
              <tr><td class="dt-ref__k">Mock</td><td class="dt-ref__v"><code>tests/mocks/</code> — 共享 mock 辅助</td></tr>
              <tr><td class="dt-ref__k">环境</td><td class="dt-ref__v">jsdom（配置于 <code>vitest.config.ts</code>）</td></tr>
            </table>
          </div>
        </div>
        <div class="dt-card">
          <div class="dt-card__head"><span>示例代码</span></div>
          <div class="dt-card__body">
            <pre class="dt-example">import {{ '{' }} describe, it, expect, vi {{ '}' }} from "vitest";
import {{ '{' }} mount {{ '}' }} from "@vue/test-utils";
import {{ '{' }} useMyHook {{ '}' }} from "@/hooks/useMyHook";

describe("useMyHook", () => {{ '{' }}
  it("returns default state", () => {{ '{' }}
    const {{ '{' }} result {{ '}' }} = useMyHook();
    expect(result.value).toBe("default");
  {{ '}' }});

  it("handles async operation", async () => {{ '{' }}
    vi.mock("@/api/modules/myService", () => ({{ '{' }}
      fetchData: vi.fn().mockResolvedValue({{ '{' }} data: [] {{ '}' }}),
    {{ '}' }}));
    // ... test async behavior
  {{ '}' }});
{{ '}' }});</pre>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Section 7: 质量流水线 ═══ -->
    <section class="dt-section">
      <h3 class="dt-section__title">质量流水线</h3>
      <div class="dt-pipe">
        <div v-for="(s, i) in pipeline" :key="s.name" class="dt-pipe__stage">
          <div class="dt-pipe__icon"><el-icon :size="16"><component :is="s.icon" /></el-icon></div>
          <span class="dt-pipe__name">{{ s.name }}</span>
          <div class="dt-pipe__checks">
            <div v-for="c in s.checks" :key="c.label" class="dt-pipe__check">
              <el-icon :size="12" :color="c.ok === false ? '#f56c6c' : '#67c23a'">
                <component :is="c.ok === false ? WarningFilled : CircleCheckFilled" />
              </el-icon>
              <code>{{ c.label }}</code>
              <span v-if="c.note" class="dt-pipe__note" :class="{ 'is-fail': c.ok === false }">{{ c.note }}</span>
            </div>
          </div>
          <div v-if="i < pipeline.length - 1" class="dt-pipe__arrow">
            <el-icon :size="14"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Section 5: 常用命令 ═══ -->
    <section class="dt-section">
      <h3 class="dt-section__title">常用命令</h3>
      <div class="dt-cmds">
        <div
          v-for="cmd in commands"
          :key="cmd.label"
          class="dt-cmd"
          :class="{ 'is-copied': cmd._copied }"
          @click="copyCmd(cmd)"
        >
          <code class="dt-cmd__code">{{ cmd.code }}</code>
          <span class="dt-cmd__desc">{{ cmd.desc }}</span>
          <span class="dt-cmd__hint">{{ cmd._copied ? '✓ 已复制' : '点击复制' }}</span>
        </div>
      </div>
    </section>

    <!-- ═══ Section 6: 测试文档 ═══ -->
    <section v-if="testDocs.length" class="dt-section">
      <h3 class="dt-section__title">测试文档</h3>
      <div class="dt-docs">
        <div
          v-for="doc in testDocs"
          :key="doc.path"
          class="dt-doc-row"
          @click="openDoc(doc)"
        >
          <el-icon :size="14" class="dt-doc-row__icon"><Document /></el-icon>
          <span class="dt-doc-row__title">{{ doc.title }}</span>
          <code class="dt-doc-row__path">{{ doc.path }}</code>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts" name="DetailTest">
import { computed, inject, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useClipboard } from "@vueuse/core";
import { Document, ArrowRight, CircleCheckFilled, WarningFilled, EditPen, Upload, Connection, Loading } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import ECharts from "@/components/ECharts/index.vue";
import { readFile } from "@/api/modules/fileService";
import { PROJECT_DETAIL_KEY, PREVIEW_DLG_KEY, useProjectDetail } from "@/views/project/types";
import type { DocItem } from "@/views/project/types";
import { buildTestLayerBar, buildTestPassDonut, type TestLayerRow } from "@/views/project/charts";

const { t } = useI18n();
const { copy } = useClipboard();
const ctx = useProjectDetail();
const previewDlg = inject(PREVIEW_DLG_KEY, null);
const { knowledgeFiles, project } = ctx;

// ── Charts ──
const passDonut = buildTestPassDonut(387, 1);

const layerRows: TestLayerRow[] = [
  { name: "Utils / Helpers", tests: 125, passRate: 100, duration: 58, color: "#67c23a" },
  { name: "Hooks / Composables", tests: 171, passRate: 99.4, duration: 196, color: "#e6a23c" },
  { name: "Components", tests: 59, passRate: 100, duration: 496, color: "#409eff" },
  { name: "Integration / API", tests: 33, passRate: 100, duration: 2724, color: "#9b59b6" },
];
const layerBar = buildTestLayerBar(layerRows);

// ── File Groups (test files by layer) ──
const fileGroups = [
  {
    label: "Utils / Helpers", color: "#67c23a", totalCases: 125,
    files: [
      { path: "tests/utils/chatNormalizers.test.ts", cases: 17 },
      { path: "tests/utils/citations.test.ts", cases: 12 },
      { path: "tests/utils/confirmationAnswer.test.ts", cases: 10 },
      { path: "tests/utils/contextFormatter.test.ts", cases: 15 },
      { path: "tests/utils/continuation.test.ts", cases: 14 },
      { path: "tests/utils/datetime.test.ts", cases: 18 },
      { path: "tests/utils/errorHandler.test.ts", cases: 12 },
      { path: "tests/utils/errorReporter.test.ts", cases: 10 },
      { path: "tests/utils/storage.test.ts", cases: 9 },
      { path: "tests/utils/tokenEstimate.test.ts", cases: 8 },
    ],
  },
  {
    label: "Hooks / Composables", color: "#e6a23c", totalCases: 171,
    files: [
      { path: "tests/hooks/useTableState.test.ts", cases: 11 },
      { path: "tests/hooks/useTableExport.test.ts", cases: 10 },
      { path: "tests/hooks/useSelection.test.ts", cases: 9 },
      { path: "tests/hooks/useRowSelection.test.ts", cases: 9 },
      { path: "tests/hooks/useTableView.test.ts", cases: 8 },
      { path: "tests/hooks/useTheme.test.ts", cases: 11 },
      { path: "tests/hooks/useBatchOperation.test.ts", cases: 9 },
      { path: "tests/hooks/useColumnManager.test.ts", cases: 10 },
      { path: "tests/hooks/useCustomViews.test.ts", cases: 10 },
      { path: "tests/hooks/useInfiniteScroll.test.ts", cases: 8 },
      { path: "tests/hooks/useVirtualScroll.test.ts", cases: 8 },
      { path: "tests/hooks/useSkeleton.test.ts", cases: 6 },
      { path: "tests/hooks/useLazyLoad.test.ts", cases: 7 },
      { path: "tests/hooks/useInlineEdit.test.ts", cases: 8 },
      { path: "tests/hooks/useColumnCalculation.test.ts", cases: 9 },
      { path: "tests/hooks/useConditionalFormat.test.ts", cases: 10 },
      { path: "tests/hooks/useGracefulDegradation.test.ts", cases: 9 },
      { path: "tests/hooks/useProjectFilter.test.ts", cases: 10 },
      { path: "tests/hooks/useQuickFind.test.ts", cases: 9 },
    ],
  },
  {
    label: "Components", color: "#409eff", totalCases: 59,
    files: [
      { path: "tests/components/ErrorCard.test.ts", cases: 16 },
      { path: "tests/components/ProjectCard.test.ts", cases: 8 },
      { path: "tests/components/ProTable.test.ts", cases: 7 },
      { path: "tests/components/ErrorBoundary.test.ts", cases: 6 },
      { path: "tests/components/SvgIcon.test.ts", cases: 6 },
      { path: "tests/components/ErrorEmpty.test.ts", cases: 5 },
      { path: "tests/components/ErrorFallback.test.ts", cases: 4 },
      { path: "tests/components/KeyboardShortcuts.test.ts", cases: 4 },
      { path: "tests/components/EntityBreadcrumb.test.ts", cases: 3 },
    ],
  },
  {
    label: "Integration / API", color: "#9b59b6", totalCases: 33,
    files: [
      { path: "tests/unit/aiChat.test.ts", cases: 7 },
      { path: "tests/unit/requestHttp.test.ts", cases: 7 },
      { path: "tests/unit/utils.test.ts", cases: 14 },
      { path: "tests/api/bug.test.ts", cases: 5 },
    ],
  },
];

// ── Slowest Suites ──
const slowSuites = [
  { name: "tests/unit/aiChat.test.ts", tests: 7, duration: "2,580ms", isSlow: true },
  { name: "tests/components/ProTable.test.ts", tests: 7, duration: "179ms", isSlow: false },
  { name: "tests/unit/requestHttp.test.ts", tests: 7, duration: "138ms", isSlow: false },
  { name: "tests/components/ProjectCard.test.ts", tests: 8, duration: "103ms", isSlow: false },
  { name: "tests/hooks/useTableExport.test.ts", tests: 10, duration: "60ms", isSlow: false },
];

// ── Coverage Config ──
const covConfig = [
  { label: "Lines", pct: "80%", color: "#67c23a" },
  { label: "Functions", pct: "80%", color: "#409eff" },
  { label: "Branches", pct: "75%", color: "#e6a23c" },
  { label: "Statements", pct: "80%", color: "#9b59b6" },
];

// ── Coverage Gaps ──
const coverageGaps = [
  { dir: "views", files: 262, critical: true },
  { dir: "stores", files: 30, critical: true },
  { dir: "layouts", files: 26, critical: true },
  { dir: "directives", files: 11, critical: true },
  { dir: "routers", files: 3, critical: true },
  { dir: "languages", files: 48, critical: false },
  { dir: "composables", files: 15, critical: false },
  { dir: "config", files: 5, critical: false },
  { dir: "shortcuts", files: 5, critical: false },
  { dir: "types", files: 5, critical: false },
  { dir: "services", files: 2, critical: false },
  { dir: "styles", files: 3, critical: false },
];

const maxGapFiles = 262;
function gapPct(files: number): number {
  return Math.round((files / maxGapFiles) * 100);
}

// ── Pipeline ──
const pipeline = [
  {
    name: "本地开发",
    icon: EditPen,
    checks: [
      { label: "lint-staged", ok: true },
      { label: "vue-tsc --noEmit", ok: true },
    ],
  },
  {
    name: "提交阶段",
    icon: Upload,
    checks: [
      { label: "husky pre-commit", ok: true },
      { label: "commitlint", ok: true },
    ],
  },
  {
    name: "PR 检查",
    icon: Connection,
    checks: [
      { label: "vue-tsc --noEmit", ok: true },
      { label: "vitest run", ok: false, note: "1 failed" },
      { label: "vitest --coverage", ok: true, note: "≥ 80%" },
    ],
  },
];

// ── Commands ──
interface CmdItem { label: string; desc: string; code: string; _copied?: boolean }
const commands = reactive<CmdItem[]>([
  { label: "Run all", desc: "单次运行全部测试", code: "pnpm test", _copied: false },
  { label: "Watch", desc: "文件变更时自动重新运行", code: "pnpm test:watch", _copied: false },
  { label: "Coverage", desc: "生成 HTML 覆盖率报告", code: "pnpm test:coverage", _copied: false },
  { label: "Type check", desc: "仅 TypeScript 类型检查", code: "pnpm typecheck", _copied: false },
]);

async function copyCmd(cmd: CmdItem) {
  await copy(cmd.code);
  cmd._copied = true;
  ElMessage.success(`已复制: ${cmd.code}`);
  setTimeout(() => { cmd._copied = false; }, 2000);
}

// ── Docs ──
const testDocs = computed<DocItem[]>(() => {
  const key = project.value?.key || "";
  if (!key) return [];
  const prefix = `projects/${key}/`;
  const testTags = ["测试", "test", "spec"];
  const testKeywords = ["test", "测试", "spec", "vitest", "pytest", "playwright", "coverage", "覆盖率"];

  return knowledgeFiles.value
    .filter(f => {
      if (!f.path.startsWith(prefix) || !f.path.endsWith(".md")) return false;
      if (f.name === "README.md") return false;
      const rawTags = f.meta?.tags;
      const tags: string[] = Array.isArray(rawTags) ? rawTags : (rawTags ? [rawTags] : []);
      return tags.some((t: string) => testTags.includes(t))
        || testKeywords.some(kw => f.name.toLowerCase().includes(kw) || f.path.toLowerCase().includes(kw));
    })
    .map(f => ({
      title: (f.meta?.title as string) || f.name.replace(/\.md$/, ""),
      path: f.path,
      tag: (f.path.slice(prefix.length).split("/")[0] || "unknown"),
      updatedAt: (f.meta?.updated as string) || "",
      isSpecial: false,
    }))
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
});

const fileLoading = ref("");

async function openTestFile(filePath: string) {
  if (fileLoading.value) return;
  const dlg = previewDlg?.value;
  if (!dlg) return;
  fileLoading.value = filePath;
  try {
    const content = await readFile(filePath);
    const name = filePath.split("/").pop() || filePath;
    dlg.openRaw({ title: name, content, path: filePath });
  } catch {
    ElMessage.error(`无法读取文件: ${filePath}`);
  } finally {
    fileLoading.value = "";
  }
}

function openDoc(doc: DocItem) {
  previewDlg?.value?.open(doc.path);
}
</script>

<style scoped lang="scss">
.dt-root {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dt-section {
  &__title {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 700;
    color: var(--el-text-color-primary);
  }
}

// ── KPIs ──
.dt-kpis {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.dt-kpi {
  padding: 16px 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dt-kpi__value {
  font-size: 26px;
  font-weight: 800;
  font-family: "SF Mono", Menlo, monospace;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--el-text-color-primary);

  &--pass { color: #67c23a; }
  &--fail { color: #f56c6c; }
  &--warn { color: #e6a23c; }
}

.dt-kpi__unit {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.dt-kpi__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.dt-kpi__sub {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dt-kpi__bar {
  height: 4px;
  background: var(--el-fill-color);
  border-radius: 2px;
  margin-top: 6px;
  overflow: hidden;
}

.dt-kpi__bar-fill {
  height: 100%;
  border-radius: 2px;

  &--pass { background: #67c23a; }
  &--fail { background: #f56c6c; }
}

// ── Grid ──
.dt-grid {
  display: grid;
  gap: 12px;

  &--2col { grid-template-columns: 1fr 1fr; }
}

// ── Card ──
.dt-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    border-bottom: 1px solid var(--el-border-color-extra-light);
  }

  &__total {
    font-size: 11px;
    font-weight: 400;
    color: var(--el-text-color-placeholder);
  }

  &__body {
    padding: 16px;

    &--sm { padding: 8px 4px; height: 200px; }
    &--scroll { max-height: 320px; overflow-y: auto; }
  }
}

// ── File Groups ──
.dt-fg {
  & + & {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-extra-light);
  }
}

.dt-fg__head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.dt-fg__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.dt-fg__meta {
  margin-left: auto;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
}

.dt-fg__file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0 3px 18px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.12s;

  &:hover { background: var(--el-fill-color-lighter); }
  &.is-loading { opacity: 0.6; pointer-events: none; }
}

.dt-fg__name {
  flex: 1;
  font-size: 10px;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.12s;

  .dt-fg__file:hover & { color: var(--el-color-primary); }
}

.dt-fg__cases {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}

// ── Slow Suites ──
.dt-slow {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;

  & + & { border-top: 1px solid var(--el-border-color-extra-light); }
}

.dt-slow__rank {
  width: 18px;
  font-size: 10px;
  font-weight: 700;
  color: var(--el-text-color-placeholder);
  text-align: center;
  flex-shrink: 0;
}

.dt-slow__name {
  flex: 1;
  font-size: 10px;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dt-slow__meta {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}

.dt-slow__dur {
  font-size: 11px;
  font-weight: 600;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-secondary);
  min-width: 56px;
  text-align: right;

  &.is-slow { color: #d97706; }
}

// ── Coverage Config ──
.dt-cov {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dt-cov__row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dt-cov__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.dt-cov__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.dt-cov__pct {
  font-size: 14px;
  font-weight: 800;
  font-family: "SF Mono", Menlo, monospace;
}

.dt-cov__bar {
  height: 6px;
  background: var(--el-fill-color);
  border-radius: 3px;
  overflow: hidden;
}

.dt-cov__bar-fill {
  height: 100%;
  border-radius: 3px;
  opacity: 0.35;
}

.dt-cov__foot {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 10px;
  color: var(--el-text-color-placeholder);

  code {
    padding: 1px 6px;
    background: var(--el-fill-color);
    border-radius: 3px;
    font-size: 10px;
  }
}

// ── Error detail ──
.dt-err {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dt-err__name {
  font-size: 13px;
  font-weight: 600;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-primary);
  word-break: break-all;
}

.dt-err__loc {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  font-family: "SF Mono", Menlo, monospace;
}

.dt-err__msg {
  margin: 0;
  padding: 10px 14px;
  background: #fef2f2;
  border-radius: 6px;
  font-size: 12px;
  font-family: "SF Mono", Menlo, monospace;
  color: #991b1b;
  overflow-x: auto;
  white-space: pre-wrap;
}

// ── Coverage Gaps ──
.dt-gap {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 12px;
  border-radius: 6px;

  &:hover { background: var(--el-fill-color-lighter); }

  &.is-critical { background: #fef2f2; }
  &.is-critical:hover { background: #fee2e2; }
}

.dt-gap + .dt-gap { margin-top: 2px; }

.dt-gap__info {
  flex-shrink: 0;
  width: 140px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dt-gap__dir {
  font-size: 12px;
  font-family: "SF Mono", Menlo, monospace;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.dt-gap__count {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
}

.dt-gap__bar {
  flex: 1;
  height: 6px;
  background: var(--el-fill-color);
  border-radius: 3px;
  overflow: hidden;
}

.dt-gap__bar-fill {
  height: 100%;
  border-radius: 3px;
  min-width: 2px;
}

// ── Recommended Actions ──
.dt-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dt-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);

  &--danger { border-color: #fecaca; background: #fef2f2; }
  &--warn   { border-color: #fde68a; background: #fffbeb; }
}

.dt-action__left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.dt-action__icon {
  margin-top: 2px;
  flex-shrink: 0;

  .dt-action--danger & { color: #f56c6c; }
  .dt-action--warn   & { color: #d97706; }
  & { color: var(--el-text-color-secondary); }
}

.dt-action__title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.dt-action__desc {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;

  code {
    font-family: "SF Mono", Menlo, monospace;
    font-size: 10px;
    padding: 1px 5px;
    background: var(--el-fill-color);
    border-radius: 3px;
  }
}

// ── Test Writing Ref ──
.dt-ref {
  width: 100%;
  border-collapse: collapse;

  td {
    padding: 6px 0;
    font-size: 11px;
    vertical-align: top;

    & + td { padding-left: 12px; }
  }
}

.dt-ref__k {
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  font-weight: 500;
  width: 64px;
}

.dt-ref__v {
  color: var(--el-text-color-primary);

  code {
    font-family: "SF Mono", Menlo, monospace;
    font-size: 10px;
    padding: 1px 5px;
    background: var(--el-fill-color);
    border-radius: 3px;
  }
}

.dt-example {
  margin: 0;
  padding: 12px 14px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  font-size: 11px;
  font-family: "SF Mono", Menlo, monospace;
  line-height: 1.65;
  color: var(--el-text-color-primary);
  overflow-x: auto;
  white-space: pre;
}

// ── Pipeline ──
.dt-pipe {
  display: flex;
  align-items: flex-start;
  gap: 0;
  overflow-x: auto;
}

.dt-pipe__stage {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  text-align: center;
}

.dt-pipe__icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--el-fill-color);
  color: var(--el-color-primary);
}

.dt-pipe__name {
  font-size: 13px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.dt-pipe__checks {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.dt-pipe__check {
  display: flex;
  align-items: center;
  gap: 6px;

  code {
    font-size: 11px;
    font-family: "SF Mono", Menlo, monospace;
    color: var(--el-text-color-regular);
    padding: 2px 6px;
    background: var(--el-fill-color);
    border-radius: 4px;
  }
}

.dt-pipe__note {
  margin-left: auto;
  font-size: 10px;
  font-weight: 600;
  color: var(--el-text-color-secondary);

  &.is-fail { color: #f56c6c; }
}

.dt-pipe__arrow {
  display: flex;
  align-items: flex-start;
  padding: 28px 4px 0;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}

// ── Commands ──
.dt-cmds {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.dt-cmd {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;

  &:hover { background: var(--el-fill-color-lighter); border-color: var(--el-color-primary); }

  &.is-copied { background: #f0fdf4; border-color: #67c23a; }
}

.dt-cmd__code {
  padding: 3px 8px;
  background: var(--el-fill-color);
  border-radius: 4px;
  font-size: 12px;
  font-family: "SF Mono", Menlo, monospace;
  font-weight: 600;
  color: var(--el-text-color-primary);
  flex-shrink: 0;
}

.dt-cmd__desc {
  flex: 1;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.dt-cmd__hint {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}

// ── Docs ──
.dt-docs {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
  background: var(--el-bg-color);
}

.dt-doc-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.12s;
  border-bottom: 1px solid var(--el-border-color-extra-light);

  &:last-child { border-bottom: none; }

  &:hover {
    background: var(--el-fill-color-lighter);
    .dt-doc-row__title { color: var(--el-color-primary); }
  }
}

.dt-doc-row__icon {
  color: var(--el-color-primary);
  flex-shrink: 0;
}

.dt-doc-row__title {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.12s;
}

.dt-doc-row__path {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  font-family: "SF Mono", Menlo, monospace;
  flex-shrink: 0;
}
</style>