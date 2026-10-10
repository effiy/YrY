<template>
  <div class="ho-root page">
    <!-- Header -->
    <div class="ho-head">
      <div class="ho-head__left">
        <span class="ho-head__icon"><el-icon :size="22"><DataBoard /></el-icon></span>
        <div>
          <h1 class="ho-head__title">{{ t("home.title") }}</h1>
          <p class="ho-head__desc">{{ t("home.heroDesc") }}</p>
        </div>
      </div>
      <div class="ho-head__right">
        <template v-if="!loading && !error">
          <span class="ho-head__stat">Docs <b>{{ stats.knowledgeFileCount }}</b></span>
          <span v-if="daily.yesterdayActivityCount.value" class="ho-head__stat">Y-day <b>{{ daily.yesterdayActivityCount.value }}</b></span>
        </template>
        <span class="ho-head__date">{{ todayLabel }}</span>
        <span v-if="navigating" class="ho-head__nav" :class="navState">
          <span class="ho-head__nav-dot" :class="'is-' + navState"></span>
          <span class="ho-head__nav-label">{{ navLabel }}</span>
          <el-icon v-if="navState === 'gate-c'" class="is-loading" :size="12"><Loading /></el-icon>
        </span>
        <el-tooltip content="刷新全量数据" placement="top" :show-after="400">
          <el-button :icon="Refresh" link size="small" @click="retryAll" />
        </el-tooltip>
      </div>
    </div>

    <HomeSkeleton v-if="loading" />
    <template v-else-if="error">
      <div class="ho__error">
        <el-result icon="error" :title="t('home.error.loadFailed')" :sub-title="error">
          <template #extra>
            <el-button type="primary" @click="retryAll">{{ t("home.error.retry") }}</el-button>
          </template>
        </el-result>
      </div>
    </template>

    <template v-else>
      <div class="ho__body">
        <div class="ho__main">
          <section class="ho-card ho-surface-card">
            <div class="ho-card__head ho-card__head--focus">
              <span class="ho-card__title">{{ t("home.today.title") }}</span>
              <span class="ho-card__sub">{{ todayLabel }}</span>
              <span v-if="daily.loading.value" class="ho-card__badge"><el-icon class="is-loading" :size="12"><Loading /></el-icon></span>
            </div>

            <div v-if="focus.loading.value && !focusBoardHasContent" class="ho-card__loading">
              <el-icon class="is-loading" :size="14"><Loading /></el-icon>
            </div>

            <template v-else-if="focusBoardHasContent">
              <!-- Hero Banner -->
              <div v-if="focus.hero.value.hero" class="ho-actlist" :class="'is-hero-' + (focus.sre.value.level || 'clear')" @click="openAnchor(BOARD_ANCHORS.focusMain)">
                <div class="ho-activity__head">
                  <span>FOCUS · {{ focus.hero.value.date || todayLabel }}</span>
                  <span v-if="focus.sre.value.level" class="ho-pill" :style="pillStyle(sreMeta(focus.sre.value.level))">SRE · {{ sreMeta(focus.sre.value.level).text }}</span>
                  <HeadChevron text="总控" @click.stop="openAnchor(BOARD_ANCHORS.focusMain)" />
                </div>
                <div class="ho-hero-row">
                  <span class="ho-activity__icon"><el-icon><DataBoard /></el-icon></span>
                  <span class="ho-verb">hero</span>
                  <span class="ho-hero-title">{{ focus.hero.value.hero }}</span>
                  <span class="ho-activity__spacer" />
                  <span v-if="focus.hero.value.must_do_one" class="ho-pill ho-pill--must">MUST {{ truncate(focus.hero.value.must_do_one, 48) }}</span>
                </div>
                <div v-if="focus.hero.value.narrative" class="ho-narr">{{ focus.hero.value.narrative }}</div>
              </div>

              <!-- SRE Matrix -->
              <div v-if="focus.sre.value.items.length" class="ho-sre ho-surface-card">
                <div class="ho-sre__head">
                  <span class="ho-sre__title">SRE 运行红黄灯</span>
                  <div class="ho-sre__legend">
                    <span v-for="lv in sreStats.legend" :key="lv.key" class="ho-sre-chip" :class="['is-' + lv.key, { 'is-active': activeSreFilters.includes(lv.key), 'is-empty': lv.count === 0 }]" :title="`${sreLevelLabel(lv.key)} × ${lv.count}`" @click="toggleSreLevelFilter(lv.key)">
                      <span class="ho-sre-chip__dot" :style="{ background: lv.color }" />
                      <span>{{ sreLevelLabel(lv.key) }}</span>
                      <b>{{ lv.count }}</b>
                    </span>
                  </div>
                  <span class="ho-sre__count">{{ sreStats.total }} 条 · SLO {{ sreStats.sloPct }}%</span>
                  <HeadChevron text="详情" @click="openAnchor(BOARD_ANCHORS.sreDetail)" />
                </div>
                <div class="ho-sre__grid">
                  <div v-for="(item, i) in sreStats.filtered" :key="(item.id || item.title) + '-' + i" class="ho-sre-card" :class="['is-' + item.level, { 'is-flash': i === 0 && (item.level === 'critical' || item.level === 'major') }]" tabindex="0" @click="openSreDetails(item)" @keydown.enter.prevent="openSreDetails(item)">
                    <div class="ho-sre-card__top">
                      <span class="ho-sre-card__led" :class="{ 'is-pulse': item.level === 'critical' }" :style="{ background: sreMeta(item.level).color }" />
                      <span class="ho-pill" :style="pillStyle(sreMeta(item.level))">{{ sreMeta(item.level).label }}</span>
                      <span class="ho-sre-card__title">{{ item.title }}</span>
                      <span class="ho-activity__spacer" />
                      <span v-if="item.owner" class="ho-sre-card__owner"><el-icon :size="11"><UserFilled /></el-icon>{{ item.owner }}</span>
                      <el-icon :size="12"><ArrowRight /></el-icon>
                    </div>
                    <div v-if="item.detail" class="ho-sre-card__detail">{{ item.detail }}</div>
                    <div class="ho-sre-card__bot">
                      <span class="ho-pill" :style="pillStyle(sreMeta(item.level))">Impact · {{ impactLabel(item.level) }}</span>
                      <span class="ho-hint">↵ 运行手册</span>
                    </div>
                  </div>
                </div>
                <div v-if="activeSreFilters.length" class="ho-sre__foot">
                  <span>过滤：{{ activeSreFilters.map(sreLevelLabel).join(' · ') }}（{{ sreStats.filtered.length }} / {{ sreStats.total }}）</span>
                  <el-button link size="small" type="danger" @click="activeSreFilters = []">× 清除</el-button>
                </div>
              </div>

              <!-- OKR -->
              <ActivitySection v-if="focus.okrs.value.length" label="OKR 锚点追踪" :count-text="`${focus.okrs.value.length} goals`" chevron-text="追踪卡" @chevron="openAnchor(BOARD_ANCHORS.okrTracker)">
                <ActivityRow v-for="o in focus.okrs.value" :key="o.id" :icon="DataBoard" icon-class="is-col-okr" @click="openOkrDetails(o)">
                  <template #pill><span class="ho-pill" :style="pillStyle(okrStatusMeta(o.status))">{{ okrStatusMeta(o.status).text }}</span></template>
                  <template #verb>{{ o.id }}</template>
                  <template #title>{{ o.title }}</template>
                  <template #meta>
                    <span v-if="typeof o.coverage === 'number'" class="ho-meta">KR {{ o.coverage }}/{{ o.total }}</span>
                    <span v-if="o.owner" class="ho-meta ho-meta--dim">{{ o.owner }}</span>
                    <span class="ho-progbar"><span class="ho-progfill" :style="{ width: o.progress + '%', background: progressColor(o.progress) }" /></span>
                    <span class="ho-pct" :style="{ color: progressColor(o.progress) }">{{ o.progress }}%</span>
                  </template>
                </ActivityRow>
              </ActivitySection>

              <!-- Actions -->
              <ActivitySection v-if="focus.actions.value.length" label="角色化今日行动项" :count-text="`${focus.actions.value.filter(a => a.status === 'done').length}/${focus.actions.value.length} done`" chevron-text="5W1H" @chevron="openAnchor(BOARD_ANCHORS.roleActions)">
                <ActivityRow v-for="(a, i) in focus.actions.value" :key="a.role + a.title + i" :icon="Top" :icon-color="priorityColor(a.priority)" @click="openActionDetails(a)">
                  <template #pill>
                    <span class="ho-pill ho-pill--role">{{ a.role }}</span>
                    <span class="ho-pill ho-pill--pri" :style="{ background: priorityColor(a.priority) }">{{ priorityLabel(a.priority) }}</span>
                  </template>
                  <template #verb>{{ actionStatusMeta(a.status).text }}</template>
                  <template #title>{{ a.title }}</template>
                </ActivityRow>
              </ActivitySection>

              <!-- 3-2-1 Digest -->
              <div v-if="digestHasContent" class="ho-actlist" :class="{ 'is-digest-degraded': !digestCompliant }">
                <div class="ho-activity__head">
                  <span>3-2-1 决策摘要</span>
                  <span v-if="!digestCompliant" class="ho-pill ho-pill--warn">⚠ 已降级</span>
                  <span v-else class="ho-count">3 sig / 2 dec / 1 red</span>
                  <HeadChevron text="简报" @click="openAnchor(BOARD_ANCHORS.digest)" />
                </div>
                <DigestSub v-if="focus.digest.value.signals.length" label="SIGNAL × 3" label-class="is-sig">
                  <ActivityRow v-for="s in focus.digest.value.signals" :key="s.id" :icon="Document" icon-class="is-col-sig" @click="openSignalDetails(s)">
                    <template #pill><span class="ho-pill ho-pill--sev" :class="'is-' + digestLevel(s.level)">{{ digestLevel(s.level) }}</span></template>
                    <template #verb>{{ s.id }}</template>
                    <template #title>{{ s.title }}</template>
                    <template #meta><span v-if="typeof s.confidence === 'number'" class="ho-pill ho-pill--conf">{{ s.confidence }}%</span></template>
                  </ActivityRow>
                </DigestSub>
                <DigestSub v-if="focus.digest.value.decisions.length" label="DECISION × 2" label-class="is-dec">
                  <ActivityRow v-for="d in focus.digest.value.decisions" :key="d.id" :icon="DataBoard" icon-class="is-col-dec" @click="openDecisionDetails(d)">
                    <template #pill><span class="ho-pill ho-pill--dec">{{ d.recommend || 'PENDING' }}</span></template>
                    <template #verb>{{ d.id }}</template>
                    <template #title>{{ d.title }}</template>
                    <template #meta><span v-if="d.deadline" class="ho-meta ho-meta--deadline" :title="d.deadline">⏰ {{ d.deadline.split(' ')[0] }}</span></template>
                  </ActivityRow>
                </DigestSub>
                <DigestSub v-if="focus.digest.value.redlines.length" label="REDLINE × 1" label-class="is-red" wrapper-class="is-red">
                  <ActivityRow v-for="r in focus.digest.value.redlines" :key="r.id" :icon="Warning" icon-class="is-col-red" @click="openRedlineDetails(r)">
                    <template #pill><span class="ho-pill ho-pill--red">{{ r.id }}</span></template>
                    <template #title>{{ r.title }}<span v-if="r.detail" class="ho-subtext"> · {{ r.detail }}</span></template>
                  </ActivityRow>
                </DigestSub>
              </div>

              <div v-if="hasIssueFeed" class="ho-divider">
                <span>Issue 动态</span>
                <HeadChevron text="Bugs" @click="openAnchor(BUG_ANCHORS.yivadIndex)" />
              </div>
            </template>

            <div v-if="(daily.loading.value || knowledge.loading.value) && !hasIssueFeed" class="ho-card__loading"><el-icon class="is-loading" :size="14"><Loading /></el-icon></div>
            <div v-else-if="!hasIssueFeed" class="ho-card__empty">
              <span class="ho-empty-icon"><el-icon :size="24"><CircleCheck /></el-icon></span>
              <span>{{ t("home.today.allClear") }}</span>
            </div>

            <!-- 4 Issue Groups -->
            <div v-else class="ho-actlist">
              <IssueGroup v-for="g in issueGroups" :key="g.label" :config="g" @chevron="openAnchor(g.chevronAnchor || '')" @row-click="openKbBugRow" />
            </div>

            <!-- Recent Activity · 扁平 5 条 -->
            <div class="ho-actlist ho-actlist--activity">
              <div class="ho-activity__head">
                <span>{{ t("home.stats.recentActivity") }}</span>
                <span v-if="knowledge.loading.value" class="ho-count"><el-icon class="is-loading" :size="11"><Loading /></el-icon> loading</span>
                <span v-else-if="knowledge.activityItems.value.length" class="ho-count">{{ knowledge.activityItems.value.length }} items</span>
                <span v-else class="ho-count">{{ t("home.activity.empty") }}</span>
                <el-button link size="small" @click="knowledge.retry()"><el-icon :size="12"><Refresh /></el-icon></el-button>
              </div>
              <div v-if="!knowledge.loading.value" class="ho-actlist__items">
                <ActivityRow
                  v-for="item in knowledge.activityItems.value.slice(0, 5)"
                  :key="item.type + '-' + item.updatedAt + '-' + (item.path || item.title)"
                  :icon="item.type === 'file' ? Document : Warning"
                  @click="item.type === 'file' ? openAnchor(item.path!) : openAnchor('projects/yivad/bugs/README.md')"
                >
                  <template #pill>
                    <span v-if="item.type === 'bug' && item.severity" class="ho-pill ho-pill--sev" :class="'is-' + item.severity">{{ item.severity }}</span>
                    <span v-else-if="item.type === 'file'" class="ho-pill ho-pill--cat" :class="'is-' + (item.category || 'other')">{{ catLabel(item.category) }}</span>
                  </template>
                  <template #verb>{{ item.type === 'file' ? (item.isNew ? 'created' : 'updated') : 'reported' }}</template>
                  <template #title>{{ item.title }}</template>
                  <template #meta><span class="ho-meta" :title="new Date(item.updatedAt).toLocaleString()">{{ timeAgo(item.updatedAt) }}</span></template>
                </ActivityRow>
              </div>
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <aside class="ho__side">
          <div v-if="knowledge.available.value" class="ho-sb ho-sb--health ho-surface-card">
            <div class="ho-sb__head" @click="openAnchor(SB_ANCHORS.health)"><span>Knowledge Health</span><el-icon class="ho-sb__link" :size="12"><Link /></el-icon></div>
            <div class="ho-kh" @click="openAnchor(SB_ANCHORS.health)">
              <span class="ho-kh__pct" :style="{ color: progressColor(knowledge.avgFreshness.value) }">{{ knowledge.avgFreshness.value }}%</span>
              <span class="ho-kh__label">fresh · {{ knowledge.totalFiles.value }} files</span>
            </div>
            <div v-if="knowledge.categoryInfo.value.length" class="ho-row-grid">
              <div v-for="c in knowledge.categoryInfo.value.slice(0, 6)" :key="c.category" class="ho-row" @click="openCategory(c.category, c.freshness)">
                <span class="ho-row__name">{{ c.category }}</span>
                <span class="ho-row__bar"><span class="ho-row__fill" :style="{ width: c.freshness + '%', background: progressColor(c.freshness) }" /></span>
                <span class="ho-row__n">{{ c.count }}</span>
              </div>
            </div>
          </div>
          <div v-if="stats.assigneeGroups.length" class="ho-sb ho-sb--workload ho-surface-card">
            <div class="ho-sb__head" @click="openAnchor(SB_ANCHORS.workload)"><span>{{ t("home.stats.workload") }}</span><el-icon class="ho-sb__link" :size="12"><Link /></el-icon></div>
            <div class="ho-row-grid">
              <div v-for="g in stats.assigneeGroups.slice(0, 6)" :key="g.value || 'empty'" class="ho-row" @click="openWorkloadAssignee(g.value)">
                <span class="ho-row__name">{{ g.value || "—" }}</span>
                <span class="ho-row__bar"><span class="ho-row__fill" :class="{ 'is-over': g.count > 5 }" :style="{ width: Math.min(100, (g.count / 6) * 100) + '%' }" /></span>
                <span class="ho-row__n">{{ g.count }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
      <KnowledgePreviewDialog ref="previewDlg" />
      <div class="ho__spacer" />
    </template>
  </div>
</template>

<script setup lang="ts" name="home">
// YiVad Home Index: 私有组件 + META SSOT + 锚点查表 + openPreview schema 驱动
import { h, computed, nextTick, ref, shallowRef, type Component, type ComputedRef } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage, ElIcon } from "element-plus";
import { DataBoard, Refresh, Loading, Top, Document, Warning, CircleCheck, Link, UserFilled, ArrowRight } from "@element-plus/icons-vue";
import HomeSkeleton from "./components/HomeSkeleton.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import { resolveLink, gateBEntityExists, gateCPostNavigate, type ResolveLinkInput } from "@/utils/linkFactory";
import { useHomeData } from "@/hooks/useHomeData";
import { useDailyInsight } from "@/hooks/useDailyInsight";
import { useDailyFocusBoard, FOCUS_FILE_PATH, DAILY_SLUG_TO_FILE, type OkrTracker, type FocusAction, type SreStatusItem, type DigestSignal, type DigestDecision, type DigestRedline } from "@/hooks/useDailyFocusBoard";
import { useKnowledgeInsight } from "@/hooks/useKnowledgeInsight";
import type { KnowledgeBugEntry, KnowledgeFileEntry } from "@/api/interface/yiAi/knowledge";
import type { Issue } from "@/api/modules/issueService";
import { useLiveMetrics } from "@/hooks/useLiveMetrics";

const { t } = useI18n();
const router = useRouter();
const { stats, loading, error, retry } = useHomeData();
const daily = useDailyInsight();
const knowledge = useKnowledgeInsight();
useLiveMetrics();
const focus = useDailyFocusBoard();
const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
const openFilePreview = (path: string) => previewDlg.value?.open(path);

// SSOT META：单一对象聚合 SRE/OKR/Action/Priority/Bug 查表
type MetaItem = { text: string; color: string; bg: string; label?: string };
const FALLBACK_META: MetaItem = { text: "", color: "var(--ho-muted-fg)", bg: "var(--ho-muted-bg)" };
const META = {
  sre: {
    critical: { text: "严重", label: "CRITICAL", color: "var(--ho-status-danger)", bg: "var(--ho-bg-danger)" },
    major:    { text: "重要", label: "MAJOR",    color: "var(--ho-status-major)",  bg: "var(--ho-bg-major)" },
    warn:     { text: "警告", label: "WARN",     color: "var(--ho-status-warn)",   bg: "var(--ho-bg-warn)" },
    clear:    { text: "正常", label: "CLEAR",    color: "var(--ho-status-clear)",  bg: "var(--ho-bg-clear)" },
  } as Record<string, MetaItem>,
  okr: {
    active:    { text: "进行中", color: "var(--ho-okr-active)",    bg: "var(--ho-okr-active-bg)" },
    at_risk:   { text: "有风险", color: "var(--ho-status-major)",  bg: "var(--ho-bg-major)" },
    off_track: { text: "偏离",   color: "var(--ho-status-danger)", bg: "var(--ho-bg-danger)" },
    done:      { text: "完成",   color: "var(--ho-status-clear)",  bg: "var(--ho-bg-clear)" },
  } as Record<string, MetaItem>,
  action: {
    todo:        { text: "待办",   color: "var(--ho-muted-fg)",       bg: "var(--ho-muted-bg)" },
    in_progress: { text: "进行中", color: "var(--ho-okr-active)",     bg: "var(--ho-okr-active-bg)" },
    in_review:   { text: "评审中", color: "var(--ho-status-warn)",    bg: "var(--ho-bg-warn)" },
    done:        { text: "完成",   color: "var(--ho-status-clear)",   bg: "var(--ho-bg-clear)" },
    blocked:     { text: "阻塞",   color: "var(--ho-status-danger)",  bg: "var(--ho-bg-danger)" },
  } as Record<string, MetaItem>,
  priority: { p0: "var(--ho-pri-p0)", p1: "var(--ho-pri-p1)", p2: "var(--ho-pri-p2)", p3: "var(--ho-pri-p3)", p4: "var(--ho-pri-p4)" } as Record<string, string>,
  bugSev: {
    critical: "critical", P0: "critical", p0: "critical",
    major: "major", P1: "major", p1: "major", high: "major",
    medium: "warn", P2: "warn", p2: "warn", minor: "warn",
    trivial: "clear", P3: "clear", p3: "clear", low: "clear", p4: "clear",
  } as Record<string, KbBugFeedItem["severitySre"]>,
  bugStatusLabel: {
    open: "待处理", in_progress: "修复中", resolved: "已修复", closed: "已关闭", rejected: "不处理",
    reopened: "重新开启", done: "已完成", cancelled: "已取消", "已修复": "已修复", "已解决": "已解决",
    todo: "待办", in_review: "评审中",
  } as Record<string, string>,
  bugStatusColor: {
    open: "var(--ho-status-danger)", in_progress: "var(--ho-status-warn)",
    resolved: "var(--ho-status-clear)", closed: "var(--ho-st-backlog)",
    rejected: "var(--el-text-color-placeholder)", reopened: "var(--ho-status-major)",
    done: "var(--ho-status-clear)", cancelled: "var(--ho-st-cancel)",
    "已修复": "var(--ho-status-clear)", "已解决": "var(--ho-status-clear)",
    todo: "var(--ho-st-todo)", in_review: "var(--ho-st-review)",
  } as Record<string, string>,
};
const getMeta = (tbl: "sre" | "okr" | "action", k: string): MetaItem =>
  (META[tbl][k] as MetaItem) || (k ? { ...FALLBACK_META, text: k } : FALLBACK_META);
/** Unified SSOT lookup for priority / bugSev / bugStatus* tables. */
const resolveFromSSOT = <T,>(table: Record<string, T> | undefined, key: unknown, fallback: T): T => {
  if (!table) return fallback;
  const k = typeof key === "string" ? key : String(key ?? "");
  const v = (table as Record<string, T | undefined>)[k];
  return typeof v === "undefined" ? fallback : v;
};
/* SRE / OKR / Priority 枚举全部派生自单一常量数组，扩展时只需在此加一项（类型自动派生） */
const SRE_LEVELS = ["critical", "major", "warn", "clear"] as const;
type SreLevel = (typeof SRE_LEVELS)[number];
const SRE_LEVEL_ORDER: readonly SreLevel[] = SRE_LEVELS;
const sreImpactLabels: Readonly<Record<SreLevel, string>> = {
  critical: "P0 · 全站受影响", major: "P1 · 核心链路受损", warn: "P2 · 局部劣化", clear: "P5 · 正常运行",
};
const impactLabel   = (l: string) => sreImpactLabels[(l as SreLevel) ?? "warn"];
const sreMeta       = (k: string) => getMeta("sre", k);
const okrStatusMeta = (s: string) => getMeta("okr", s);
const actionStatusMeta = (s: string) => getMeta("action", s);
const progressColor = (v: number) => (v >= 80 ? "var(--ho-status-clear)" : v >= 50 ? "var(--ho-status-warn)" : "var(--ho-status-danger)");
const priorityColor = (p: string) => resolveFromSSOT<string>(META.priority, p, "var(--ho-pri-p4)");
const priorityLabel = (p: string) => (p || "").toUpperCase();
const pillStyle     = (m: MetaItem) => ({ color: m.color, background: m.bg });
const sreLevelLabel = (k: string) => sreMeta(k).text;
/* OKR 配置驱动：新 seq 加 OKR_SEQS，新 root 加 OKR_ROOTS（类型自动推导） */
const OKR_SEQS = ["001", "002", "003"] as const;
const OKR_ROOTS = ["executive", "leader"] as const;
type OkrSeq = (typeof OKR_SEQS)[number];
type OkrRoot = (typeof OKR_ROOTS)[number];
// Bug category → icon 配置表（新增类别只改 resolveBugIcon 的 switch）
interface BugIconHints { categoryLabel: string; severitySre: KbBugFeedItem["severitySre"]; isDanger: boolean; }
const resolveBugIcon = ({ categoryLabel, severitySre, isDanger }: BugIconHints): Component => {
  if (isDanger && severitySre === "critical") return Warning;
  switch (categoryLabel) {
    case "性能": return Top;
    case "跨项目": return Link;
    case "质量": return DataBoard;
    case "安全": return Warning;
    case "数据": return DataBoard;
    case "接口": return Link;
    default:     return Document;
  }
};

/** curator/daily 子路径三级回退：archive/<当日>/ → archive/<昨日>/ → 稳定路径 */
const DAILY_DIR = "curator/daily";
function dateStamp(offsetDays = 0): string {
  const d = focus.hero.value.date ? new Date(focus.hero.value.date) : new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function resolveDailyFileName(slug: string, extraPatterns?: RegExp[]): string {
  const base = resolveFromSSOT<string>(DAILY_SLUG_TO_FILE, slug, slug);
  const today = `${DAILY_DIR}/archive/${dateStamp(0)}/${base}.md`;
  const yesterday = `${DAILY_DIR}/archive/${dateStamp(-1)}/${base}.md`;
  const pools = [knowledge.recentFiles.value, knowledge.importantFiles.value];
  if (extraPatterns?.length) {
    const allLinks = [...(focus.links.value ?? []), ...(focus.anchors.value ?? [])] as any[];
    for (const pat of extraPatterns) {
      const hit = allLinks.find(
        (it) => it && isKbPath(it.anchor) && [it.title, it.anchor, it.group].filter(Boolean).join(" ").match(pat),
      );
      if (hit) return hit.anchor;
    }
  }
  for (const pool of pools) {
    const h = (pool || []).find((f) => pathsMatch(f.path, today) || pathsMatch(f.path, yesterday));
    if (h) return h.path;
  }
  return today;
}


// ── 私有子组件（同文件 render 函数，零拆文件）────
// Vue3 函数式组件签名 (props, { emit, slots })；顶层变量自动注册到 Template

interface ActivityRowProps {
  icon?: Component;
  iconClass?: string;
  iconColor?: string;
}
const ActivityRow = (props: ActivityRowProps, { slots, emit }: any) =>
  h("div", { class: "ho-activity__item", onClick: () => emit("click") }, [
    props.icon
      ? h("span", {
          class: ["ho-activity__icon", props.iconClass].filter(Boolean),
          style: props.iconColor ? { color: props.iconColor } : undefined,
        }, [h(props.icon as Component)])
      : null,
    slots.pill?.(),
    slots.verb ? h("span", { class: "ho-verb" }, slots.verb()) : null,
    slots.title ? h("span", { class: "ho-act-title" }, slots.title()) : null,
    h("span", { class: "ho-activity__spacer" }),
    slots.meta?.(),
  ]);

interface ActivitySectionProps { label: string; countText?: string; chevronText?: string; }
const ActivitySection = (props: ActivitySectionProps, { slots, emit }: any) =>
  h("div", { class: "ho-actlist" }, [
    h("div", { class: "ho-activity__head" }, [
      h("span", props.label),
      props.countText ? h("span", { class: "ho-count" }, props.countText) : null,
      props.chevronText ? h(HeadChevron, { text: props.chevronText, onClick: () => emit("chevron") }) : null,
    ]),
    h("div", { class: "ho-actlist__items" }, slots.default?.()),
  ]);

interface DigestSubProps {
  wrapperClass?: string;   // 语义化 suffix，自动附加 is- 前缀（如 "sig" → "is-sig"）
  labelClass?: string;     // 同上
  label?: string;
}
const DigestSub = (props: DigestSubProps, { slots }: any) =>
  h(
    "div",
    { class: ["ho-digest-sub", props.wrapperClass ? `is-${props.wrapperClass}` : ""].filter(Boolean) },
    [
      props.label
        ? h("div", { class: ["ho-digest-sub__label", props.labelClass ? `is-${props.labelClass}` : ""].filter(Boolean) }, props.label)
        : null,
      slots.default?.(),
    ],
  );

interface HeadChevronProps { text: string; tooltip?: string; }
const HeadChevron = (props: HeadChevronProps, { emit }: any) =>
  h(ElTooltip as any, { content: props.tooltip || "展开详情", showAfter: 400 }, () =>
    h(
      ElButton as any,
      {
        link: true,
        size: "small",
        class: "ho-chevron-btn",
        onClick: (ev: Event) => { ev.stopPropagation(); emit("click", ev); },
      },
      () => (props.text ?? "") + " →",
    ),
  );

interface IssueGroupConfig {
  label: string;
  labelClass?: string;
  icon: Component;
  items: KbBugFeedItem[];
  chevronText?: string;
  chevronAnchor?: string;
  resolved?: boolean;
  danger?: boolean;
}
interface IssueGroupProps { config: IssueGroupConfig; }
const IssueGroup = (props: IssueGroupProps, { emit }: any) => {
  const g: IssueGroupConfig = props.config;
  if (!g?.items?.length) return null;
  const isResolved = !!g.resolved;
  const isDanger = !!g.danger;
  return h("div", { class: "ho-digest-sub ho-issue-group" }, [
    h("div", { class: "ho-activity__head" }, [
      h("span", { class: ["ho-issue-group__label", g.labelClass].filter(Boolean) }, [
        // 用 ElIcon 包装做 size 归一化，避免 SVG 按 viewBox 物理像素渲染
        h(ElIcon as any, { size: 12 }, () => h(g.icon as any)),
        " " + g.label,
      ]),
      h("span", { class: "ho-count" }, g.items.length),
      g.chevronText ? h(HeadChevron, { text: g.chevronText, onClick: () => emit("chevron") }) : null,
    ]),
    h(
      "div",
      { class: "ho-actlist__items" },
      g.items.map((bug) =>
        h(
          ActivityRow,
          {
            iconClass: bug.categoryColorClass,
            icon: resolveBugIcon({ categoryLabel: bug.categoryLabel, severitySre: bug.severitySre, isDanger }),
            onClick: () => emit("rowClick", bug),
          },
          {
            pill: () => {
              if (isResolved) {
                return [h("span", { class: "ho-pill ho-pill--status is-resolved" }, bug.statusLabel)];
              }
              return [
                isDanger ? h("span", { class: ["ho-pill ho-pill--sev", "is-" + bug.severitySre] }, sreMeta(bug.severitySre).label) : null,
                h("span", { class: ["ho-pill ho-pill--cat", bug.categoryColorClass] }, bug.categoryLabel),
              ];
            },
            verb: () => bug.id,
            title: () => truncate(bug.title, 56),
            meta: () => [
              bug.assignee ? h("span", { class: "ho-meta ho-meta--dim" }, bug.assignee) : null,
              bug.projectKey !== "yivad" ? h("span", { class: "ho-meta ho-meta--proj" }, bug.project) : null,
              !isResolved ? h("span", { class: "ho-meta", style: { color: bug.statusColor } }, bug.statusLabel) : null,
              h("span", { class: "ho-meta ho-meta--dim" }, timeAgo(bug.updatedAt)),
            ],
          },
        ),
      ),
    ),
  ]);
};

// ── 锚点派生：Family-based + 单一 buildAnchors（零样板） ──
// Kind: static / focus / okr / kb / index / bugs / alias
const isKbPath = (v: unknown): v is string =>
  typeof v === "string" && !!v.trim() && !/^(https?:|mailto:)/i.test(v);
// FOCUS_RESOLVERS：声明式 slug → { patterns, summaryFirst }
// 新增 focus 子内容：① DAILY_SLUG_TO_FILE +一行 ② 此处 +一条 ③ BOARD_ANCHORS +一条
const FOCUS_RESOLVERS: Readonly<Record<string, { patterns: Readonly<RegExp[]>; summaryFirst?: boolean }>> = {
  sreDetail:   { patterns: [/sre/i, /运行/i] },
  okrTracker:  { patterns: [/okr/i, /目标/i, /追/i] },
  roleActions: { patterns: [/角色/, /5w1h/i, /行动/i] },
  digest:      { patterns: [/决策/i, /3.?2.?1/, /简报/i], summaryFirst: true },
  learnRisk:   { patterns: [/学习/, /风险/i, /复盘/i] },
};
function resolveFocus(key: string): string {
  const cfg = FOCUS_RESOLVERS[key];
  if (!cfg) return categoryAnchor(key);
  if (cfg.summaryFirst) { const s = focus.digest.value.summary_file; if (isKbPath(s)) return s; }
  return resolveDailyFileName(key, cfg.patterns as RegExp[]);
}
function findKbFile(o: {
  name?: string | RegExp; dirFallback?: string; categoryHint?: string;
  suffix?: string; final?: string; preferRecent?: boolean;
}): string {
  const { name, dirFallback, categoryHint, suffix = "INDEX.md", preferRecent = true } = o;
  const primary = preferRecent ? knowledge.recentFiles.value : knowledge.importantFiles.value;
  const backup  = preferRecent ? knowledge.importantFiles.value : knowledge.recentFiles.value;
  const matchName = (f: KnowledgeFileEntry) => !name ? false
    : typeof name === "string" ? f.name.toLowerCase().includes(name.toLowerCase()) : name.test(f.name);
  const matchDir  = (f: KnowledgeFileEntry) => !!dirFallback && f.path.toLowerCase().startsWith(dirFallback.toLowerCase());
  const matchCat  = (f: KnowledgeFileEntry) => !categoryHint || f.category.toLowerCase() === categoryHint.toLowerCase();
  for (const pool of [primary, backup]) for (const f of pool || []) if (matchCat(f) && matchName(f)) return f.path;
  if (dirFallback) {
    for (const pool of [backup, primary]) for (const f of pool || []) if (matchCat(f) && matchDir(f)) return f.path;
    return `${dirFallback.replace(/\/$/, "")}/${suffix}`;
  }
  return o.final ?? "INDEX.md";
}
function resolveOkrGoal(root: OkrRoot, seq: OkrSeq): string {
  const prefix = root === "executive" ? "exec" : "lead";
  const re = new RegExp(`^${root}/okr/[^/]+/${prefix}-${seq}[^/]*/goal\\.md$`, "i");
  for (const pool of [knowledge.importantFiles.value, knowledge.recentFiles.value]) {
    const hit = (pool || []).find((f) => re.test(f.path));
    if (hit) return hit.path;
  }
  return `${root}/okr/${prefix}-${seq}/goal.md`;
}
/* Bug 分类规则 & 类别元数据 */
const BUG_CAT_RULES: Readonly<Array<{ match: (t: string, m: string) => boolean; label: string; cls: string }>> = [
  { match: (t, m) => t === "security" || /安全|隐私|security|privacy/i.test(m), label: "安全", cls: "is-col-security" },
  { match: (t, m) => t === "data" || /数据|data/i.test(m), label: "数据", cls: "is-col-data" },
  { match: (_t, m) => /跨项目|rpc|contract|跨/i.test(m), label: "跨项目", cls: "is-col-cross" },
  { match: (t, m) => t === "compatibility" || t === "ui" || /路由|权限|国际化|interface|compat|i18n|route/i.test(m), label: "接口", cls: "is-col-iface" },
  { match: (t, m) => t === "performance" || /性能|perf|cpu|clipboard/i.test(m), label: "性能", cls: "is-col-perf" },
  { match: (_t, m) => /代码质量|quality|type|dead|lint|test|typescript|类型|vue-tsc/i.test(m), label: "质量", cls: "is-col-quality" },
];
const BUG_CAT_META: Readonly<Record<string, { dir: string; prefix: string; fallback?: boolean }>> = {
  "安全": { dir: "安全隐私", prefix: "bug-安全隐私" }, "数据": { dir: "数据", prefix: "数据" },
  "跨项目": { dir: "跨项目", prefix: "跨项目" }, "接口": { dir: "接口", prefix: "接口" },
  "性能": { dir: "性能问题", prefix: "bug-性能问题" }, "质量": { dir: "代码质量", prefix: "质量" },
  "功能": { dir: "代码质量", prefix: "质量", fallback: true },
};
type KbPKey = "yivad" | "yipot" | "yipet" | "yiai" | "yiknowledge";
const PROJECTS: Readonly<Record<KbPKey, { label: string; names: string[] }>> = {
  yivad:       { label: "YiVad",       names: ["YiVad", "yivad"] },
  yipot:       { label: "YiPot",       names: ["YiPot", "yipot"] },
  yipet:       { label: "YiPet",       names: ["YiPet", "yipet"] },
  yiai:        { label: "YiAi",        names: ["YiAi", "yiai"] },
  yiknowledge: { label: "YiKnowledge", names: ["YiKnowledge", "yiknowledge"] },
};
const PKEY_LIST: readonly KbPKey[] = Object.keys(PROJECTS) as KbPKey[];
/* pkey 归一化："YiVad" / "YIVAD" / "yivad" 全部 → yivad */
function normalizePkey(raw: unknown): KbPKey {
  const s = String(raw || "").trim();
  const lower = s.toLowerCase();
  for (const k of PKEY_LIST) {
    const ok = k === lower || PROJECTS[k].names.some((n) => n.toLowerCase() === lower || n.toLowerCase() === s.toLowerCase());
    if (ok) return k;
  }
  return "yivad";
}
function resolveBugReadme(pkey: KbPKey): string {
  const pools = [knowledge.importantFiles.value, knowledge.recentFiles.value];
  for (const pool of pools) {
    const hit = (pool || []).find((f) => {
      const p = f.path.toLowerCase();
      return /^projects\//i.test(p) && f.name.toLowerCase() === "readme.md" && p.includes("/bugs/") && p.includes(`/${pkey}/`);
    });
    if (hit) return hit.path;
  }
  return `projects/${pkey}/bugs/README.md`;
}
function resolveBugCategory(bug: KnowledgeBugEntry): { label: string; cls: string } {
  const t = (bug.type || "").toLowerCase();
  const m = (bug.module || "").toLowerCase();
  return BUG_CAT_RULES.find((r) => r.match(t, m)) ?? { label: "功能", cls: "is-col-func" };
}
// ── 锚点查表：7 家族 + 单一 buildAnchors 声明式驱动 ──
function buildAnchors<T extends Record<string, string>>(specs: Array<[string, () => string]>): Readonly<T> {
  const out: Record<string, string> = {};
  for (const [k, fn] of specs) out[k] = fn();
  return Object.freeze(out as T);
}
type KbFileParam = Parameters<typeof findKbFile>[0];
const BOARD_ANCHORS = computed(() => buildAnchors<Record<string, string>>([
  ["focusMain",   () => FOCUS_FILE_PATH],
  ["sreDetail",   () => resolveFocus("sreDetail")],
  ["okrTracker",  () => resolveFocus("okrTracker")],
  ["roleActions", () => resolveFocus("roleActions")],
  ["digest",      () => resolveFocus("digest")],
  ["learnRisk",   () => resolveFocus("learnRisk")],
  ["execOkr001",  () => resolveOkrGoal("executive", "001")],
  ["execOkr002",  () => resolveOkrGoal("executive", "002")],
  ["execOkr003",  () => resolveOkrGoal("executive", "003")],
  ["leadOkr001",  () => resolveOkrGoal("leader", "001")],
  ["leadOkr002",  () => resolveOkrGoal("leader", "002")],
  ["aierIndex",   () => findKbFile({ dirFallback: "aier", suffix: "INDEX.md" })],
  ["sreQuickRef", (): string => {
    const p: KbFileParam = { name: /^quickref\.md$/i, dirFallback: "sre", suffix: "QUICKREF.md", categoryHint: "sre", preferRecent: false };
    return findKbFile(p);
  }],
  ["execFrame",   () => findKbFile({ name: /^018.*框|高管.*框/i, final: "executive/strategy/018-战略-高管决策框架.md", dirFallback: "executive/strategy", categoryHint: "executive" })],
  ["dataModel",   () => findKbFile({ name: /^012.*数据.*模型.*原/i, final: "leader/architecture/012-架构-数据模型设计原则.md", dirFallback: "leader/architecture", categoryHint: "leader" })],
  ["vitest",      () => findKbFile({ name: /vitest|测试.*引入/i, final: "leader/decisions/yivad-003-决策-Vitest引入.md", dirFallback: "leader/decisions", categoryHint: "leader" })],
  ["governance",  () => findKbFile({ name: /^007.*分类处/i, final: "curator/governance/007-治理-分类处理.md", dirFallback: "curator/governance", categoryHint: "curator" })],
  ["readingList", () => findKbFile({ name: /^001.*阅读.*清单/i, final: "executive/reading-list/001-阅读-阅读清单.md", dirFallback: "executive/reading-list", categoryHint: "executive" })],
]));
const SB_ANCHORS = computed(() => buildAnchors<Record<string, string>>([
  ["health",   () => findKbFile({ name: /^001.*知识.*健康.*看板/i, final: "curator/governance/001-治理-知识健康看板.md", dirFallback: "curator/governance", categoryHint: "curator" })],
  ["workload", () => findKbFile({ name: /^003.*组织.*okr.*追|路线图.*003/i, final: "executive/roadmap/003-路线图-组织OKR追踪.md", dirFallback: "executive/roadmap", categoryHint: "executive" })],
]));
const BUG_ANCHORS = computed(() => buildAnchors<Record<string, string>>([
  ["yivadIndex",  () => resolveBugReadme("yivad")],
  ["yipotIndex",  () => resolveBugReadme("yipot")],
  ["yipetIndex",  () => resolveBugReadme("yipet")],
  ["yiaiIndex",   () => resolveBugReadme("yiai")],
  ["yikbIndex",   () => resolveBugReadme("yiknowledge")],
  ["sreRunbook",  () => BOARD_ANCHORS.value.sreQuickRef],
]));
const CATEGORY_INDEX: Readonly<Record<string, string>> = {
  executive: "executive/INDEX.md", leader: "leader/INDEX.md", engineer: "engineer/INDEX.md",
  sre: "sre/INDEX.md", aier: "aier/INDEX.md", product: "product/INDEX.md", curator: "curator/INDEX.md",
};
const categoryAnchor = (c: string) => CATEGORY_INDEX[c.toLowerCase()] ?? `${c.toLowerCase()}/INDEX.md`;

/* 项目 README 锚点派生表（依赖 BUG_ANCHORS） */
const PROJECT_README_ANCHOR: ComputedRef<Record<KbPKey, string>> = computed(() => {
  const m: Record<KbPKey, string> = Object.create(null) as any;
  const keyMap: Record<KbPKey, keyof typeof BUG_ANCHORS.value> = {
    yivad: "yivadIndex", yipot: "yipotIndex", yipet: "yipetIndex", yiai: "yiaiIndex", yiknowledge: "yikbIndex",
  };
  for (const k of PKEY_LIST) m[k] = BUG_ANCHORS.value[keyMap[k]] ?? `projects/${k}/bugs/README.md`;
  return Object.freeze(m);
});

/* ── 月度前缀 & slug 工具 ────────────────── */
function resolveMonthlyPrefix(bug: any): string {
  if (bug.contentPath) {
    const m = String(bug.contentPath).match(/bugs\/(\d{4}-\d{2})(?:-\d{2})?\//);
    if (m) return m[1];
  }
  const d = new Date(bug.closedAt ?? bug.resolvedAt ?? bug.updatedAt ?? bug.createdAt ?? Date.now());
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
const slugFromBug = (b: any) =>
  (b.title || "").replace(/[^\w\u4e00-\u9fa5-]/g, "").slice(0, 20) || b.key || b.issue_key || "";
function bugPathFromBug(bug: KnowledgeBugEntry, pk: string, seq: string, cat: { label: string }): string {
  const dp = resolveMonthlyPrefix(bug);
  const m = BUG_CAT_META[cat.label] ?? BUG_CAT_META["功能"] ?? { dir: "代码质量", prefix: "质量" };
  const slug = slugFromBug(bug);
  if (pk === "yipot") return `projects/yipot/bugs/${dp}/${seq}-${m.prefix}-${slug}.md`;
  if (pk === "yipet") return `projects/yipet/bugs/${dp}/${m.dir}/${seq}-${m.dir}-${slug}.md`;
  return `projects/${pk === "yiknowledge" ? "yiknowledge" : "yivad"}/bugs/${dp}/${m.dir}/${seq}-${m.prefix}-${slug}.md`;
}

// ── 三闸门契约：anchorToEntity → resolveLink → openAnchor (Gate A/B/C) ──
const navigating = ref(false);
type NavState = "gate-a" | "gate-b" | "gate-c";
const navState = shallowRef<NavState>("gate-a");
const navLabel = ref("解析锚点");
const setNav = (s: NavState, l: string) => { navState.value = s; navLabel.value = l; navigating.value = true; };
const clearNav = () => { navigating.value = false; };
function anchorToEntity(anchor: string): ResolveLinkInput | null {
  if (!anchor) return null;
  const a = String(anchor).trim();
  // Branch 1: exec-001-023 — OKR goal
  if (/^exec[-_]\d{2,3}[-_]\d{1,3}$/i.test(a)) {
    return { type: "page", key: `executive/okr/${a.toLowerCase().replace(/[ _]/g, "-")}`, title: a };
  }
  // Branch 2: Reading List pure 3-digit ID (001 = 阅读清单 / 002+ = 读书笔记)
  // MUST be standalone 3 digits — NOT a 3-digit fragment inside a longer path
  const nm = a.match(/^\s*(\d{3})\s*$/);
  if (nm) {
    const n = nm[1];
    return { type: "page", key: n === "001" ? `executive/reading-list/${n}-阅读-阅读清单` : `executive/reading-list/${n}-阅读-读书笔记`, title: a };
  }
  // Branch 3: path / URL style with / or .md suffix — normalize & resolve
  if (a.includes("/") || /\.md\s*$/i.test(a)) {
    // strip fragment (#hash) & section anchor (§...) before path canonicalization
    const c = a
      .replace(/#.*$/, "")
      .replace(/§.*$/, "")
      .replace(/^YiKnowledge\//i, "")
      .replace(/^#\/?knowledge\//i, "")
      .replace(/^\//, "")
      .trim();
    let cand = c;
    if (!cand.toLowerCase().startsWith("executive/")) {
      if (/^(reading-list|okr|rss|strategy|process|notes|tactical|governance)\//i.test(cand)) cand = "executive/" + cand;
      else if (!cand.includes("/")) cand = "executive/reading-list/" + cand;
    }
    return { type: "page", key: cand.replace(/\.md$/i, ""), title: a };
  }
  return null;
}
async function openAnchor(anchor: string): Promise<void> {
  const entity = anchorToEntity(anchor);
  if (!entity) { ElMessage.info(`未映射锚点: ${anchor}`); return; }
  const resolved = resolveLink(entity);
  const usePreview = !resolved.ok || entity.type === "page";
  const kbKey = entity.key ?? "";
  const mdPath = /\.md$/i.test(kbKey) ? kbKey : `${kbKey}.md`;
  await gateBEntityExists(entity, { timeoutMs: 1500 }).catch(() => true);
  if (usePreview) {
    try { await openFilePreview(mdPath); }
    catch (e) { ElMessage.warning(e instanceof Error ? e.message : "预览打开失败"); return; }
    nextTick(() => gateCPostPreview({ expectedPath: mdPath, timeoutMs: 2000 }).then((ok) => { if (!ok) ElMessage.warning("预览落地后验未匹配"); }));
  } else {
    try { await router.push(resolved.link); }
    catch (e) { ElMessage.warning(e instanceof Error ? e.message : "路由跳转失败"); return; }
    nextTick(() => gateCPostNavigate({
      expectedLink: resolved.link,
      expectedParams: "params" in resolved ? resolved.params : {},
      expectedTitleKeyword: entity.title || "",
      timeoutMs: 2000,
    }).then((ok) => { if (!ok) ElMessage.info("路由落地后验未匹配"); }));
  }
}
async function gateCPostPreview(o: { expectedPath: string; timeoutMs?: number }): Promise<boolean> {
  const t0 = Date.now(); const dl = o.timeoutMs ?? 2000;
  const exp = normalizeKbPath(o.expectedPath);
  const virt = VIRTUAL_PATH_PREFIX.some((p) => exp.startsWith(p));
  while (Date.now() - t0 < dl) {
    const dlg = previewDlg.value as any;
    if (!dlg) { await sleep(80); continue; }
    const vis = typeof dlg.visible === "object" ? !!dlg.visible.value : !!dlg.visible;
    const cp = typeof dlg.currentPath === "object" ? (dlg.currentPath.value ?? "") : String(dlg.currentPath ?? "");
    const cur = normalizeKbPath(cp);
    if (!vis || !cur) { await sleep(80); continue; }
    if (virt && cur === exp) return true;
    if (!virt && pathsMatch(exp, cur)) return true;
    await sleep(80);
  }
  return false;
}
const VIRTUAL_PATH_PREFIX = ["okr:", "sre:", "action:", "digest:", "bug:", "issue:"] as const;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
function normalizeKbPath(p: string): string {
  if (!p) return "";
  let s = String(p).trim().replace(/\\/g, "/").replace(/^YiKnowledge\//i, "").replace(/^#\/?knowledge\//i, "").replace(/^\/+/, "");
  if (!VIRTUAL_PATH_PREFIX.some((p2) => s.startsWith(p2)) && s && !/\.md\s*$/i.test(s)) s += ".md";
  return s.toLowerCase();
}
const basename = (p: string) => { const i = p.lastIndexOf("/"); return i === -1 ? p : p.slice(i + 1); };
const stripExt = (p: string) => p.replace(/\.md\s*$/i, "");
const pathsMatch = (a: string, b: string) => {
  if (!a || !b) return false;
  const [A, B] = [a.toLowerCase(), b.toLowerCase()];
  if (A === B) return true;
  const [bnA, bnB] = [basename(A), basename(B)];
  if (bnA && bnB && bnA === bnB) return true;
  // 宽松前缀：A 是 B 的目录+文件前缀，或 B 是 A 的后缀（补 .md 也算）
  const [sA, sB] = [stripExt(A), stripExt(B)];
  if (sA && sB && (sA.endsWith(sB) || sB.endsWith(sA))) return true;
  if (A.endsWith(B) || B.endsWith(A)) return true;
  // reading-list 文件名结构：003-阅读-读书笔记  ===  003-阅读-读书笔记-卓有成效的管理者
  if (/^\d{3}-阅读-阅读/.test(sA) || /^\d{3}-阅读-阅读/.test(sB)) {
    const pre3 = (s: string) => s.match(/^(\d{3}-阅读-(?:阅读清单|读书笔记))/)?.[1] ?? "";
    const [pA, pB] = [pre3(sA), pre3(sB)];
    if (pA && pB && pA === pB) return true;
  }
  return false;
};
const scheduleAutoAnchor = (anchor?: string) => { if (anchor) setTimeout(() => openFocusAnchorIfIdle(anchor), 2400); };
function openFocusAnchorIfIdle(anchor: string): void {
  try {
    const dlg = previewDlg.value as any;
    if (!dlg) { openAnchor(anchor); return; }
    const vis = dlg.visible ?? dlg.modelValue ?? dlg._visible;
    if (vis === false) { openAnchor(anchor); return; }
    const cur: string | undefined = dlg.currentPath ?? dlg.path ?? dlg._currentPath;
    if (!cur || /^(digest:|sre:|okr:|action:|issue:|bug:)/.test(cur)) openAnchor(anchor);
  } catch { openAnchor(anchor); }
}

// ── 详情弹框 schema 驱动（单函数替代 6+ 个 open*Details） ──
type PrevField = { k: string; v?: any; label?: string; as?: "text" | "colored" | "pill" } | false | null | undefined;
function openPreview(title: string, path: string, fields: PrevField[], autoAnchor?: string) {
  const rows = fields.filter(Boolean).map((f) => {
    const x = f as { k: string; v: any; as?: string; label?: string };
    let val: string;
    if (x.as === "colored") {
      val = `<span style="color:${x.v.color || x.v};font-weight:600">${x.v.text || x.v}</span>`;
    } else if (x.as === "pill") {
      val = `<span style="background:${x.v.bg || "#eee"};color:${x.v.color || "#333"};padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700">${x.v.text || x.v}</span>`;
    } else {
      val = String(x.v);
    }
    return `| **${x.label || x.k}** | ${val} |`;
  });
  const content = [`# ${title}`, "", "| 字段 | 值 |", "|---|---|", ...rows].join("\n");
  previewDlg.value?.openRaw({ title, content, path });
  scheduleAutoAnchor(autoAnchor);
}
/* 详情弹框字段 builder：消除 open*Details 里手写 { k, v, as } 的重复 */
type Field = PrevField;
const F = {
  text:     (k: string, v: any, l?: string): Field => (v == null || v === "" ? null : { k, v, label: l }),
  colored:  (k: string, v: any, l?: string): Field => (v == null || v === "" ? null : { k, v, as: "colored", label: l }),
  pill:     (k: string, v: any, l?: string): Field => (v == null || v === "" ? null : { k, v, as: "pill", label: l }),
  pct:      (k: string, v: any, l?: string): Field => (typeof v === "number" ? { k, v: `${v}%`, label: l } : null),
  coverage: (k: string, cov: any, tot: any): Field =>
    typeof cov === "number" ? { k, v: `${cov} / ${tot ?? "-"}`, label: k } : null,
  pri: (p: any): Field => (typeof p === "undefined" || p === null ? null : ({
    k: "优先级", v: { text: priorityLabel(p), bg: priorityColor(p), color: "#fff" }, as: "pill",
  })),
  rec: (r: any): Field => (r ? { k: "推荐选项", v: { text: r, color: "var(--ho-okr-active)" }, as: "colored" } : null),
};
const digestBriefAnchor = () => F.text("完整简报", focus.digest.value.summary_file);
const openOkrDetails      = (o: OkrTracker)  => openPreview(
  `${o.id}: ${o.title}`, `okr:${o.id}`,
  [
    F.text("周期", o.period), F.text("负责人", o.owner), F.pct("进度", o.progress),
    F.coverage("KR 覆盖", o.coverage, o.total),
    F.colored("状态", okrStatusMeta(o.status)),
    F.text("今日推进", o.today_focus), F.text("锚点", o.anchor),
  ],
  o.anchor,
);
const openSreDetails      = (s: SreStatusItem) => openPreview(
  `${s.id || "SRE"}: ${s.title}`, `sre:${s.id || s.title}`,
  [F.colored("级别", sreMeta(s.level)), F.text("Owner", s.owner), F.text("锚点", s.anchor), F.text("细节", s.detail)],
  s.anchor,
);
const openActionDetails   = (a: FocusAction)  => openPreview(
  `[${a.role}] ${a.title}`, `action:${a.role}:${a.title}`,
  [
    F.text("角色", a.role), F.pri(a.priority),
    F.colored("状态", actionStatusMeta(a.status)),
    F.text("为什么重要", a.why), F.text("锚点", a.anchor),
  ],
  a.anchor,
);
const openSignalDetails   = (s: DigestSignal)  => openPreview(
  `${s.id} · 信号`, `digest:signal:${s.id}`,
  [
    F.colored("级别", sreMeta(digestLevel(s.level))),
    typeof s.confidence === "number" ? { k: "置信度", v: `${s.confidence}%` } : null,
    F.text("引用锚点", s.ref), digestBriefAnchor(),
  ],
  s.ref,
);
const openDecisionDetails = (d: DigestDecision) => openPreview(
  `${d.id} · 待拍板决策`, `digest:decision:${d.id}`,
  [F.rec(d.recommend), F.text("拍板截止", d.deadline), F.text("参考锚点", d.ref), digestBriefAnchor()],
  d.ref,
);
const openRedlineDetails  = (r: DigestRedline)  => openPreview(
  `${r.id} · 底线红线`, `digest:redline:${r.id}`,
  [F.text("细则", r.detail), F.text("引用锚点", r.ref), digestBriefAnchor()],
  r.ref,
);


/* ── Category + Workload 入口 ── */
function openCategory(category: string, freshness: number): void {
  if (freshness < 50) ElMessage.info(`${category} 新鲜度仅 ${freshness}%，建议进入后点击 🔄 刷新`);
  openAnchor(categoryAnchor(category));
}
const ROLE_ALIASES: Readonly<RegExp[]> = [
  /(^|\s|c[- ]?suite|cxo|chief|founder|exec|ceo|cto|cfo|coo|vp|director)(\s|$)/i,
  /tech[- ]?lead|\btl\b|技术(负责人|lead|主管|leader)|engineering[- ]?lead/i,
  /eng(ineer)?|developer|fe[- ]?eng|be[- ]?eng|full[- ]?stack|工程师|前端|后端|全栈|开发/i,
  /sre|可靠性|devops|运维|site[- ]?reliability/i,
  /curator|策展|知识(运营|管理)|content[- ]?ops/i,
  /ai[- ]?(eng|engineer)|ml[- ]?(eng|engineer)|算法(工程师)?|ai\s*dev/i,
  /\bpm\b|product|产品(经理)?|\bpdm\b/i,
  /leader|manager|主管|负责人|团队 lead/i,
];
function isRoleLike(a: string): boolean {
  const lower = a.toLowerCase().trim();
  const roles = new Set<string>();
  for (const x of focus.actions.value) roles.add((x.role || "").toLowerCase());
  for (const k of Object.keys(CATEGORY_INDEX)) roles.add(k.toLowerCase());
  const ordered = [...roles].filter(Boolean).sort((x, y) => y.length - x.length);
  for (const r of ordered) if (r && (lower === r || lower.includes(r) || r.includes(lower))) return true;
  for (const re of ROLE_ALIASES) if (re.test(a)) return true;
  return false;
}
function openWorkloadAssignee(a?: string | null): void {
  if (!a) { openAnchor(SB_ANCHORS.value.workload); return; }
  if (isRoleLike(a)) { openAnchor(BOARD_ANCHORS.value.roleActions); return; }
  const linkRes = resolveLink({ type: "issue", key: null, title: `@${a}` });
  const base = linkRes.ok ? linkRes.link.replace(/issue\/$/, "issue") : "/issue";
  router.push(`${base}${base.includes("?") ? "&" : "?"}assignee=${encodeURIComponent(a)}`);
}

// ── SRE 视图：单对象 sreStats 聚合 counts/legend/sloPct ──
const activeSreFilters = ref<string[]>([]);
function toggleSreLevelFilter(key: string) {
  const arr = activeSreFilters.value.slice();
  const pos = arr.indexOf(key);
  pos >= 0 ? arr.splice(pos, 1) : arr.push(key);
  activeSreFilters.value = arr;
}
type SreLevelStat = { key: (typeof SRE_LEVEL_ORDER)[number]; count: number; color: string };
type SreStats = Readonly<{
  total: number;
  counts: Readonly<Record<string, number>>;
  legend: SreLevelStat[];
  sloPct: number;
  filtered: SreStatusItem[];
}>;
const sreStats: ComputedRef<SreStats> = computed(() => {
  const items = focus.sre.value.items;
  const total = items.length;
  const counts: Record<string, number> = {};
  for (const it of items) counts[it.level || "warn"] = (counts[it.level || "warn"] ?? 0) + 1;
  const legend = SRE_LEVEL_ORDER.map((key) => ({
    key, count: counts[key] ?? 0, color: sreMeta(key).color,
  }));
  const t = total || 1;
  const pen = (counts.critical ?? 0) * 10 + (counts.major ?? 0) * 4 + (counts.warn ?? 0);
  const sloPct = total ? Math.max(0, Math.round(100 - (pen / (t * 4)) * 100)) : 100;
  const orderIdx = (lv: string) => SRE_LEVEL_ORDER.indexOf((lv as any) ?? "warn");
  const filters = activeSreFilters.value;
  const filtered: SreStatusItem[] = items.slice()
    .sort((a, b) => orderIdx(a.level) - orderIdx(b.level))
    .filter((it) => !filters.length || filters.includes(it.level));
  return Object.freeze({ total, counts: Object.freeze(counts), legend, sloPct, filtered });
});

/* ── 通用工具 & 今日状态 ── */
const CAT_LABEL: Record<string, string> = { engineer: "Eng", executive: "Exec", leader: "Lead", aier: "AI", product: "Prod", sre: "SRE", curator: "Cur" };
const catLabel = (c?: string) => CAT_LABEL[c || ""] || c || "";
const todayLabel = computed(() => { const d = new Date(); return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()] + " " + (d.getMonth()+1) + "/" + d.getDate(); });
function timeAgo(ts: string | number): string {
  const m = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (m < 1) return "now"; if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`;
}
const retryAll = () => { retry(); daily.retry(); knowledge.retry(); focus.retry(); };
const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n) + "…" : s);
const digestLevel = (l: string) => ["critical", "major", "warn", "clear"].includes(l) ? l : "warn";
const digestHasContent = computed(() => {
  const d = focus.digest.value;
  return d.signals.length > 0 || d.decisions.length > 0 || d.redlines.length > 0 || !!d.summary_file;
});
const digestCompliant = computed(() => {
  const d = focus.digest.value;
  return d.signals.length === 3 && d.decisions.length === 2 && d.redlines.length === 1;
});
const focusBoardHasContent = computed(() =>
  focus.available.value && (
    !!focus.hero.value.hero ||
    focus.sre.value.items.length > 0 ||
    focus.okrs.value.length > 0 ||
    focus.actions.value.length > 0 ||
    digestHasContent.value
  ),
);

// ── Issue Feed · 4 语义分组 · SSOT ──
interface KbBugFeedItem {
  id: string; title: string; project: string; projectKey: KbPKey;
  categoryLabel: string; categoryColorClass: string;
  severity: string; severitySre: "critical" | "major" | "warn" | "clear";
  status: string; statusLabel: string; statusColor: string;
  assignee?: string; updatedAt: number; kbAnchor: string; kbReadmeAnchor: string;
}
function normalizeKbBug(bug: KnowledgeBugEntry, idx: number): KbBugFeedItem {
  const pKey = normalizePkey(bug.project || bug.project_key || "yivad");
  const cat = resolveBugCategory(bug);
  const sevSre = resolveFromSSOT<KbBugFeedItem["severitySre"]>(META.bugSev, bug.severity || bug.priority || "medium", "warn");
  const st = (bug.status || "open") as string;
  const nm = String(bug.key || "").match(/\d+/);
  const seq = (nm ? nm[0] : String(idx + 1)).padStart(3, "0");
  return {
    id: `${pKey}-${seq}`, title: bug.title || bug.key || "(untitled)",
    project: bug.project || PROJECTS[pKey].label, projectKey: pKey,
    categoryLabel: cat.label, categoryColorClass: cat.cls,
    severity: bug.severity || bug.priority || "warn", severitySre: sevSre,
    status: st,
    statusLabel: resolveFromSSOT<string>(META.bugStatusLabel, st, st),
    statusColor: resolveFromSSOT<string>(META.bugStatusColor, st, "var(--el-text-color-secondary)"),
    assignee: bug.assignee,
    updatedAt: (bug as unknown as { updatedAt?: number }).updatedAt ?? Date.now(),
    kbAnchor: bugPathFromBug(bug, pKey, seq, cat),
    kbReadmeAnchor: PROJECT_README_ANCHOR.value[pKey],
  };
}
const kbBugFromKnowledge: ComputedRef<KbBugFeedItem[]> = computed(() => {
  const fromList = knowledge.recentBugs.value.map((b, i) => normalizeKbBug(b, i));
  const fromAct: KbBugFeedItem[] = knowledge.activityItems.value
    .filter((a: any) => a.type === "bug")
    .map((a: any, i: number) => {
      const high = a.severity === "critical" || a.severity === "major";
      return {
        id: `act-${i}-${a.severity || "b"}`, title: a.title,
        project: PROJECTS.yivad.label, projectKey: "yivad",
        categoryLabel: high ? "安全" : "质量",
        categoryColorClass: high ? "is-col-security" : "is-col-quality",
        severity: a.severity || "warn",
        severitySre: resolveFromSSOT<KbBugFeedItem["severitySre"]>(META.bugSev, a.severity || "medium", "warn"),
        status: "resolved", statusLabel: "已修复",
        statusColor: resolveFromSSOT<string>(META.bugStatusColor, "resolved", "var(--ho-status-clear)"),
        assignee: undefined, updatedAt: a.updatedAt,
        kbAnchor: a.path || BUG_ANCHORS.value.yivadIndex,
        kbReadmeAnchor: BUG_ANCHORS.value.yivadIndex,
      };
    });
  const seen = new Set<string>();
  return [...fromList, ...fromAct]
    .filter((x) => (seen.has(x.title) ? false : (seen.add(x.title), true)))
    .sort((a, b) => b.updatedAt - a.updatedAt);
});
const kbBugFeedAll: ComputedRef<KbBugFeedItem[]> = computed(() => {
  if (kbBugFromKnowledge.value.length) return kbBugFromKnowledge.value;
  const src: Issue[] = [
    ...daily.overdue.value, ...daily.todayDue.value,
    ...daily.todayInProgress.value, ...daily.pendingReview.value,
  ];
  return src.slice(0, 16).map<KbBugFeedItem>((it, idx) => {
    const pKey = normalizePkey(it.project_key || "yivad");
    const sevSre: KbBugFeedItem["severitySre"] =
      it.priority === "urgent" ? "critical" : it.priority === "high" ? "major"
        : it.priority === "medium" ? "warn" : "clear";
    const done = it.status === "done" || it.status === "cancelled";
    const st: string = done ? "resolved"
      : (it.status === "in_review" || it.status === "in_progress") ? it.status : "open";
    return {
      id: `daily-${idx}-${it.key}`, title: it.title,
      project: it.project_key || PROJECTS[pKey].label, projectKey: pKey,
      categoryLabel: done ? "质量" : "功能",
      categoryColorClass: done ? "is-col-quality" : "is-col-func",
      severity: it.priority || "warn", severitySre: sevSre, status: st,
      statusLabel: resolveFromSSOT<string>(META.bugStatusLabel, st, st),
      statusColor: resolveFromSSOT<string>(META.bugStatusColor, st, "var(--el-text-color-secondary)"),
      assignee: it.assignee, updatedAt: new Date(it.updated_at || Date.now()).getTime(),
      kbAnchor: PROJECT_README_ANCHOR.value[pKey],
      kbReadmeAnchor: PROJECT_README_ANCHOR.value[pKey],
    };
  });
});
// 4 分组工厂 · 单一 computed 产出 config 数组
type BugPredicate = (b: KbBugFeedItem) => boolean;
function bugGroup(pred: BugPredicate, limit: number,
  sort: (a: KbBugFeedItem, b: KbBugFeedItem) => number = (a, b) => b.updatedAt - a.updatedAt,
) {
  return kbBugFeedAll.value.filter(pred).sort(sort).slice(0, limit);
}
const ISSUE_GROUP_DEFS: Readonly<Array<Omit<IssueGroupConfig, "items" | "chevronAnchor"> & {
  pred: BugPredicate; limit: number;
  sort?: (a: KbBugFeedItem, b: KbBugFeedItem) => number;
  // 允许懒求值：字符串字面量或动态 resolve 函数
  chevronAnchor: string | (() => string);
}>> = [
  {
    label: "高危缺陷", labelClass: "ho-issue-group__label--danger", icon: Warning,
    pred: (b) => b.severitySre === "critical" || b.severitySre === "major", limit: 3,
    sort: (a, b) => (Number(b.severitySre === "critical") - Number(a.severitySre === "critical"))
             || b.updatedAt - a.updatedAt,
    chevronText: "Runbook", chevronAnchor: () => BUG_ANCHORS.value.sreRunbook, danger: true,
  },
  {
    label: "最近变更", labelClass: "ho-issue-group__label--clear", icon: CircleCheck,
    pred: (b) => ["resolved","closed","done"].includes(b.status), limit: 5,
    chevronText: "YiVad", chevronAnchor: () => BUG_ANCHORS.value.yivadIndex, resolved: true,
  },
  {
    label: "跨项目 / 接口类", labelClass: "ho-issue-group__label--cross", icon: Link,
    pred: (b) => ["跨项目","接口","数据"].includes(b.categoryLabel), limit: 4,
    chevronText: "RPC 规范",
    chevronAnchor: () => findKbFile({
      name: /跨项目|rpc|contract|接口.*调用|跨.*rpc/i,
      final: "engineer/build/007-构建-实现跨项目RPC调用.md",
      dirFallback: "engineer/build", categoryHint: "engineer",
    }),
  },
  {
    label: "代码质量专项", labelClass: "ho-issue-group__label--quality", icon: DataBoard,
    pred: (b) => b.categoryLabel === "质量" || b.categoryLabel === "性能", limit: 5,
    chevronText: "ADR",
    chevronAnchor: () => findKbFile({
      name: /架构.*决策|决策.*设计|adr.*001|001.*架构/i,
      final: "leader/architecture/001-架构-架构决策设计.md",
      dirFallback: "leader/architecture", categoryHint: "leader",
    }),
  },
];
const issueGroups: ComputedRef<IssueGroupConfig[]> = computed(() =>
  ISSUE_GROUP_DEFS.map((g) => {
    const items = bugGroup(g.pred, g.limit, g.sort);
    const anchor = typeof g.chevronAnchor === "function" ? g.chevronAnchor() : g.chevronAnchor;
    return { label: g.label, labelClass: g.labelClass, icon: g.icon,
             chevronText: g.chevronText, chevronAnchor: anchor,
             resolved: (g as any).resolved, danger: (g as any).danger, items } as IssueGroupConfig;
  }),
);
const hasIssueFeed: ComputedRef<boolean> = computed(() => issueGroups.value.some((g) => g.items.length > 0));
function openKbBugRow(bug: KbBugFeedItem): void {
  if (!bug.kbAnchor) { previewIssueFallback(bug); return; }
  openAnchor(bug.kbAnchor);
  scheduleAutoAnchor(bug.kbReadmeAnchor);
}
function previewIssueFallback(bug: KbBugFeedItem): void {
  const sev = sreMeta(bug.severitySre);
  openPreview(`${bug.id.toUpperCase()}: ${truncate(bug.title, 44)}`, `bug:${bug.id}`, [
    { k: "项目", v: bug.project }, { k: "分类", v: bug.categoryLabel },
    { k: "严重度", v: sev, as: "pill" },
    { k: "状态", v: { text: bug.statusLabel, color: bug.statusColor, bg: "#fff" }, as: "colored" },
    bug.assignee ? { k: "处理人", v: bug.assignee } : null,
    { k: "最后更新", v: new Date(bug.updatedAt).toLocaleDateString() },
  ], bug.kbReadmeAnchor);
}
</script>

<style scoped lang="scss">
/* 语义 token 由 @/styles/theme/tokens.ts 统一注册；本文件仅留 surface override */

/* 图标尺寸 token：xs(行内附属) / sm(列表项主体) / md(区块头) / lg(空态 & 主入口) */
.ho-root {
  --ho-icon-xs: 11px;
  --ho-icon-sm: 14px;
  --ho-icon-md: 12px;
  --ho-icon-lg: 24px;
}

/* ── Base ────────────────────────────────── */
.ho-root { box-sizing: border-box; min-height: 100%; padding: 20px 24px 80px; background: var(--el-bg-color-page, #f2f3f5); }
.ho__error { display: flex; align-items: center; justify-content: center; min-height: 400px; }
.ho__spacer { height: 24px; }
.ho-chevron-btn { padding: 0 4px; margin-left: 6px; font-size: 10px; font-weight: 600; color: var(--el-color-primary); }
.ho-empty-icon { color: var(--ho-status-clear, #10b981); margin-right: 6px; line-height: 1; }

/* ── Header ──────────────────────────────── */
.ho-head {
  display: flex; gap: 16px; align-items: center;
  padding: 14px 20px; margin-bottom: 14px;
  background: var(--el-bg-color, #fff);
  border: 1px solid var(--el-border-color-lighter, #ebeef5); border-radius: 14px;
}
.ho-head__left { display: flex; gap: 14px; align-items: center; flex: 1; min-width: 0; }
.ho-head__icon {
  display: flex; flex-shrink: 0; align-items: center; justify-content: center;
  width: 44px; height: 44px; color: #fff;
  background: linear-gradient(135deg, var(--el-color-primary), var(--ho-accent-focus));
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.ho-head__title { margin: 0; font-size: 15px; font-weight: 700; color: var(--el-text-color-primary, #303133); line-height: 1.3; }
.ho-head__desc { margin: 2px 0 0; font-size: 11px; color: var(--el-text-color-secondary, #909399); }
.ho-head__right { display: flex; flex-shrink: 0; gap: 10px; align-items: center; }
.ho-head__stat { font-size: 11px; color: var(--el-text-color-secondary, #909399); white-space: nowrap; b { font-weight: 700; color: var(--el-text-color-primary, #303133); } }
.ho-head__date { font-size: 11px; font-weight: 600; color: var(--el-text-color-placeholder, #a8abb2); }
.ho-head__nav {
  display: inline-flex; gap: 5px; align-items: center;
  padding: 3px 8px; background: var(--el-fill-color, #f0f2f5);
  border: 1px solid var(--el-border-color-lighter, #ebeef5); border-radius: 10px;
}
.ho-head__nav-dot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
  &.is-gate-a { background: var(--ho-accent-focus-soft); }
  &.is-gate-b { background: var(--ho-status-warn); }
  &.is-gate-c { background: var(--ho-status-clear); }
}
.ho-head__nav-label { font-size: 10px; font-weight: 600; color: var(--el-text-color-secondary, #909399); }

/* ── Body grid ───────────────────────────── */
.ho__body { display: grid; grid-template-columns: 1fr 268px; gap: 14px; align-items: start; }
.ho__main { min-width: 0; display: flex; flex-direction: column; gap: 14px; }
@media (max-width: 1024px) { .ho__body { grid-template-columns: 1fr; } }

/* 公共 surface：卡片边框/背景/悬浮统一基底（scoped 下禁用 @extend，模板显式追加类） */
.ho-surface-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 14px;
  transition: box-shadow 0.2s ease, border-color 0.15s;
  &:hover { box-shadow: var(--ho-shadow-card); }
}
.ho-card { padding: 16px 20px; }
.ho-card__head {
  display: flex; gap: 8px; align-items: baseline;
  padding-left: 12px; margin-bottom: 10px;
  border-left: 3px solid var(--el-border-color, #dcdfe6);
}
.ho-card__head--focus { border-left-color: var(--ho-accent-focus); }
.ho-card__title { font-size: 13px; font-weight: 600; color: var(--el-text-color-primary, #303133); }
.ho-card__sub { margin-left: auto; font-size: 10px; color: var(--el-text-color-placeholder, #a8abb2); }
.ho-card__badge { margin-left: 4px; font-size: 11px; color: var(--el-text-color-placeholder, #a8abb2); }
.ho-card__loading { padding: 30px 0; text-align: center; color: var(--el-text-color-placeholder, #a8abb2); }
.ho-card__empty { display: flex; align-items: center; justify-content: center; padding: 24px; color: var(--el-text-color-secondary, #909399); font-size: 15px; }

/* ── Activity / Actlist 统一范式（icon + pill + verb + title + meta） ── */
.ho-activity { display: flex; flex-direction: column; gap: 2px; }
.ho-activity__head {
  display: flex; align-items: center;
  padding: 12px 6px 8px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.4px;
  color: var(--el-text-color-secondary, #909399); text-transform: uppercase;
  border-top: 1px dashed var(--el-border-color-lighter, #ebeef5);
  :first-child & { border-top: 0; padding-top: 4px; }
  :deep(.el-button .el-icon), :deep(.ho-count .el-icon) { margin-right: 3px; }
  :deep(.ho-issue-group__label) { display: inline-flex; align-items: center; gap: 3px; line-height: 1; }
  gap: 6px;
}
.ho-activity__item {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 8px; border-radius: 8px;
  cursor: pointer; transition: background 0.15s ease, transform 0.1s ease;
  min-height: 34px;
  &:hover { background: var(--ho-surface-hover, #f5f7fa); transform: translateX(2px); }
}
.ho-activity__icon {
  flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
  width: var(--ho-icon-sm); height: var(--ho-icon-sm);
  font-size: var(--ho-icon-sm); color: var(--el-text-color-secondary, #909399);
  line-height: 1;
  overflow: hidden; /* 防止 SVG 按 viewBox 物理尺寸溢出 */
  &.is-col-okr      { color: var(--ho-col-okr-fg); }
  &.is-col-sig      { color: var(--ho-sem-signal-fg); }
  &.is-col-dec      { color: var(--ho-sem-decision-fg); }
  &.is-col-red      { color: var(--ho-sem-redline-fg); }
  &.is-col-warn     { color: var(--ho-col-risk-fg); }
  &.is-col-major    { color: var(--ho-status-warn); }
  &.is-col-wip      { color: var(--ho-st-wip); }
  &.is-col-review   { color: var(--ho-sem-signal-fg); }
  &.is-col-security { color: var(--ho-col-rd-fg); }
  &.is-col-data     { color: var(--ho-col-risk-fg); }
  &.is-col-cross    { color: var(--ho-col-cross-fg); }
  &.is-col-iface    { color: var(--ho-col-action-fg); }
  &.is-col-perf     { color: var(--ho-col-perf-fg); }
  &.is-col-quality  { color: var(--ho-status-clear); }
  &.is-col-func     { color: var(--ho-col-kb-fg); }
}
.ho-activity__spacer { flex: 1; min-width: 0; }
.ho-verb {
  flex-shrink: 0; font-size: 9px; color: var(--el-text-color-placeholder, #a8abb2);
  font-family: ui-monospace, monospace; font-weight: 700; letter-spacing: 0.2px;
  max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  padding: 1px 0;
}
.ho-act-title {
  flex: 1; min-width: 0;
  font-size: 12.5px; font-weight: 600; color: var(--el-text-color-primary, #303133); line-height: 1.4;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ── Unified Pill（所有药丸共用 BEM，variant 仅改颜色） ── */
.ho-pill {
  flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
  height: 16px; padding: 0 6px;
  font-size: 9px; font-weight: 700; letter-spacing: 0.2px;
  border-radius: 5px; text-transform: uppercase;
  background: var(--el-fill-color, #f0f2f5); color: var(--el-text-color-secondary, #909399);
  line-height: 1;

  &--sev {
    color: #fff;
    &.is-critical, &.is-major { background: var(--ho-status-danger); }
    &.is-warn { background: var(--ho-status-warn); color: #1f2937; }
    &.is-clear { background: var(--ho-status-clear); color: #1f2937; }
  }
  &--cat {
    &.is-executive { background: var(--ho-cat-exec-bg); color: var(--ho-cat-exec-fg); }
    &.is-leader    { background: var(--ho-cat-lead-bg); color: var(--ho-cat-lead-fg); }
    &.is-engineer  { background: var(--ho-cat-eng-bg);  color: var(--ho-cat-eng-fg); }
    &.is-sre       { background: var(--ho-cat-sre-bg);  color: var(--ho-cat-sre-fg); }
    &.is-aier      { background: var(--ho-cat-ai-bg);   color: var(--ho-cat-ai-fg); }
    &.is-product   { background: var(--ho-cat-prod-bg); color: var(--ho-cat-prod-fg); }
    &.is-curator   { background: var(--ho-cat-curator-bg); color: var(--ho-cat-curator-fg); }
    &.is-other     { background: var(--el-fill-color-light); color: var(--el-text-color-placeholder); }
    &.is-col-security { background: var(--ho-bg-danger);   color: var(--ho-col-rd-fg); }
    &.is-col-data     { background: var(--ho-bg-major);    color: var(--ho-col-risk-fg); }
    &.is-col-cross    { background: var(--ho-col-cross-bg);  color: var(--ho-col-cross-fg); }
    &.is-col-iface    { background: var(--ho-interface-bg);  color: var(--ho-interface-fg); }
    &.is-col-perf     { background: var(--ho-perf-bg);       color: var(--ho-perf-fg); }
    &.is-col-quality  { background: var(--ho-quality-bg);    color: var(--ho-quality-fg); }
    &.is-col-func     { background: var(--ho-col-kb-bg);     color: var(--ho-col-kb-fg); }
  }
  &--role     { color: var(--ho-accent-focus);   background: var(--ho-accent-focus-bg); max-width: 90px; }
  &--pri      { color: #fff; font-size: 8px; border-radius: 4px; min-width: 20px; text-align: center; }
  &--must     { color: var(--ho-accent-focus-strong); background: var(--ho-accent-focus-bg); max-width: 60%; letter-spacing: 0.2px; padding: 0 8px; white-space: normal; line-height: 1.3; height: auto; text-align: left; }
  &--conf     { background: var(--ho-cat-lead-bg); color: var(--ho-cat-lead-fg); font-variant-numeric: tabular-nums; }
  &--dec      { background: var(--ho-cat-eng-bg);  color: var(--ho-cat-eng-fg); }
  &--red      { color: #fff; background: var(--ho-sem-redline-fg); font-family: ui-monospace, monospace; min-width: 18px; text-align: center; }
  &--warn     { background: var(--ho-cat-curator-bg); color: var(--ho-cat-curator-fg); }
  &--status.is-resolved { background: var(--ho-bg-clear); color: var(--ho-status-clear); }
}

/* ── Actlist 容器 ── */
.ho-actlist {
  display: flex; flex-direction: column;
  + .ho-actlist { margin-top: 6px; }
  &.is-hero-critical { background: var(--ho-bg-danger); border: 1px solid var(--ho-status-danger); border-radius: 12px; padding: 2px 0; }
  &.is-hero-major    { background: var(--ho-bg-major);  border: 1px solid var(--ho-status-major);  border-radius: 12px; padding: 2px 0; }
  &.is-hero-warn     { background: var(--ho-bg-warn);   border: 1px solid var(--ho-status-warn);   border-radius: 12px; padding: 2px 0; }
  &.is-hero-clear    { background: var(--ho-bg-clear);  border: 1px solid var(--ho-status-clear);  border-radius: 12px; padding: 2px 0; }
  &.is-digest-degraded { opacity: 0.92; border: 1px solid var(--ho-muted-fg); border-radius: 10px; }
}
.ho-actlist > .ho-activity__head { display: flex; align-items: center; padding-left: 10px; padding-right: 10px; }
.ho-actlist__items { display: flex; flex-direction: column; padding: 0 4px; }
.ho-count {
  margin-left: auto; padding: 1px 6px; min-width: 16px; text-align: center;
  font-size: 9px; font-weight: 700; color: var(--el-text-color-secondary, #909399);
  background: var(--el-fill-color, #f0f2f5); border-radius: 8px;
}

/* Hero banner row */
.ho-hero-row {
  display: flex; gap: 8px; align-items: center;
  padding: 10px 12px 8px; margin: 0 8px;
  border-radius: 10px; cursor: pointer; transition: background 0.15s, transform 0.1s;
  &:hover { background: rgba(255,255,255,0.55); transform: translateX(2px); }
}
.ho-hero-title { font-size: 13px; font-weight: 800; color: var(--el-text-color-primary, #303133); line-height: 1.45; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: 0.1px; }
.ho-narr {
  margin: 0 14px 8px; padding: 6px 10px;
  font-size: 11px; color: var(--el-text-color-secondary, #909399); line-height: 1.6;
  border-left: 2px solid var(--ho-accent-focus-soft-bg);
  background: rgba(255,255,255,0.4); border-radius: 0 6px 6px 0;
}

/* OKR row meta */
.ho-meta {
  flex-shrink: 0; font-size: 10px; font-weight: 600;
  font-variant-numeric: tabular-nums; color: var(--el-text-color-secondary, #909399);
  display: inline-flex; align-items: center; gap: 4px;
  &--dim       { color: var(--el-text-color-placeholder, #a8abb2); max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; font-weight: 500; }
  &--proj      { font-size: 8px; font-weight: 700; padding: 0 6px; height: 15px; line-height: 15px; color: var(--el-color-primary); background: var(--el-color-primary-light-9); border-radius: 4px; }
  &--deadline  { color: var(--ho-status-major); }
}
.ho-progbar {
  flex-shrink: 0; display: inline-block; width: 48px; height: 4px;
  background: var(--el-fill-color, #f0f2f5); border-radius: 3px; vertical-align: middle; overflow: hidden;
}
.ho-progfill { display: block; height: 100%; border-radius: 3px; transition: width 0.4s ease; }
.ho-pct { flex-shrink: 0; width: 30px; text-align: right; font-size: 10px; font-weight: 700; font-variant-numeric: tabular-nums; }
.ho-subtext { font-size: 10px; color: var(--el-text-color-secondary, #909399); }

/* Digest sub */
.ho-digest-sub {
  padding: 2px 0; + .ho-digest-sub { margin-top: 2px; padding-top: 4px; border-top: 1px dashed var(--el-border-color-lighter, #ebeef5); }
  &.is-red { background: var(--ho-sem-redline-bg); border-radius: 6px; padding: 3px 4px; margin-top: 4px; }
}
.ho-digest-sub__label {
  padding: 6px 8px 3px; font-size: 8px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase;
  &.is-sig     { color: var(--ho-cat-lead-fg); }
  &.is-dec     { color: var(--ho-sem-decision-fg); }
  &.is-redline { color: var(--ho-sem-redline-fg); }
}

/* ── Issue Group ── */
.ho-divider {
  display: flex; align-items: center; margin: 14px 2px 10px; color: var(--el-text-color-placeholder, #a8abb2);
  &::before, &::after { content: ""; flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--el-border-color-lighter, #ebeef5)); }
  &::after { background: linear-gradient(90deg, var(--el-border-color-lighter, #ebeef5), transparent); }
  span { padding: 0 14px; font-size: 9px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: var(--el-color-primary); background: var(--el-color-primary-light-9); border-radius: 10px; }
}
.ho-issue-group {
  &__label {
    display: inline-flex; gap: 4px; align-items: center;
    font-size: 11px; font-weight: 700;
    &--danger  { color: var(--ho-status-danger); }
    &--clear   { color: var(--ho-status-clear); }
    &--cross   { color: #7c3aed; }
    &--quality { color: #0ea5e9; }
  }
  &--critical { border-radius: 8px; padding: 2px 6px 4px; }
}

/* ── SRE Matrix（极简版） ── */
.ho-sre {
  display: flex; flex-direction: column; gap: 12px;
  padding: 14px 16px 16px; margin: 8px 0 12px;
  border-left: 3px solid var(--ho-status-warn);
  border-radius: 0 10px 10px 0;
  background: var(--el-fill-color-light, #f5f7fa);
  /* 当 --ho-status-warn 因 setProperty 竞争解算为空时，fallback 到 EP 官方黄。*/
  border-left-color: var(--ho-status-warn, #e6a23c);
  transition: border-left-color 0.2s ease;
}
.ho-sre__head { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.ho-sre__title {
  font-size: 12px; font-weight: 800; letter-spacing: 0.6px;
  text-transform: uppercase; color: var(--el-text-color-primary, #303133);
  padding-left: 8px; border-left: 3px solid var(--ho-status-warn, #e6a23c);
}
.ho-sre__count {
  font-size: 10px; font-weight: 700; color: var(--el-text-color-placeholder, #a8abb2);
  font-variant-numeric: tabular-nums; padding: 2px 8px; background: var(--el-fill-color, #f0f2f5); border-radius: 10px;
}
.ho-sre__legend { display: inline-flex; gap: 4px; align-items: center; flex-wrap: wrap; flex: 1; }
.ho-sre-chip {
  display: inline-flex; gap: 4px; align-items: center;
  padding: 2px 7px; border-radius: 8px; cursor: pointer;
  background: var(--el-bg-color, #fff); border: 1px solid var(--el-border-color-lighter, #ebeef5);
  transition: all 0.14s ease; font-size: 10px; font-weight: 600; color: var(--el-text-color-secondary, #909399);
  user-select: none;
  &:hover { transform: translateY(-1px); box-shadow: 0 2px 6px rgba(0,0,0,0.04); }
  &.is-empty  { opacity: 0.45; cursor: not-allowed; filter: grayscale(0.4); &:hover { transform: none; box-shadow: none; } }
  &.is-active { box-shadow: inset 0 0 0 1px currentColor; background: var(--ho-surface-kb-bg, #f0f9eb); }
  &.is-critical { color: var(--ho-status-danger, #f56c6c); &.is-active { background: var(--ho-bg-danger, #fef0f0); } }
  &.is-major    { color: var(--ho-status-major, #ef4444);  &.is-active { background: var(--ho-bg-major, #fee2e2); } }
  &.is-warn     { color: var(--ho-status-warn, #e6a23c);   &.is-active { background: var(--ho-bg-warn, #fdf6ec); } }
  &.is-clear    { color: var(--ho-status-clear, #67c23a);  &.is-active { background: var(--ho-bg-clear, #f0f9eb); } }
}
.ho-sre-chip__dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 0 2px var(--el-bg-color, #fff); }
.ho-sre__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 8px; }
.ho-sre-card {
  display: flex; flex-direction: column; gap: 8px;
  padding: 10px 12px; border-radius: 10px;
  background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter);
  border-left: 4px solid var(--el-border-color);
  cursor: pointer; outline: none;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  min-height: 72px;
  &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-color: var(--el-color-primary-light-5); }
  &:focus-visible { box-shadow: 0 0 0 3px #c7d2fe; }
  &.is-critical { border-left-color: var(--ho-status-danger); animation: ho-sre-pulse 3.4s ease-in-out infinite; }
  &.is-major    { border-left-color: var(--ho-status-major);  }
  &.is-warn     { border-left-color: var(--ho-status-warn);   }
  &.is-clear    { border-left-color: var(--ho-status-clear);  }
  &.is-flash    { animation-iteration-count: 2; animation-duration: 2.2s; }
}
@keyframes ho-sre-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } 50% { box-shadow: 0 0 0 4px rgba(239,68,68,0.10); } }
.ho-sre-card__top { display: flex; gap: 6px; align-items: center; width: 100%; flex-wrap: wrap; }
.ho-sre-card__led {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 0 2px #fff;
  &.is-pulse { animation: ho-led-blink 1.1s ease-in-out infinite; }
}
@keyframes ho-led-blink { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.35; transform: scale(0.78); } }
.ho-sre-card__title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; font-weight: 700; color: var(--el-text-color-primary, #303133); line-height: 1.35; }
.ho-sre-card__owner {
  flex-shrink: 0; display: inline-flex; gap: 4px; align-items: center;
  font-size: 10px; font-weight: 600; color: var(--el-text-color-secondary, #909399);
  padding: 1px 6px 1px 4px; background: rgba(255,255,255,0.8);
  border: 1px solid var(--el-border-color-lighter, #ebeef5); border-radius: 20px;
  max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ho-sre-card__detail {
  display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
  font-size: 11px; line-height: 1.5; color: var(--el-text-color-secondary, #909399);
  padding-left: 14px;
}
.ho-sre-card__bot {
  display: flex; gap: 8px; align-items: center;
  padding-top: 6px; border-top: 1px dashed var(--el-border-color-lighter, #ebeef5);
}
.ho-hint {
  flex: 1; min-width: 0; text-align: right;
  font-size: 10px; font-weight: 600; color: var(--el-text-color-placeholder, #a8abb2);
  letter-spacing: 0.3px; opacity: 0.85;
}
.ho-sre__foot {
  display: flex; gap: 10px; align-items: center;
  padding: 6px 10px; border-radius: 8px;
  background: var(--el-fill-color-light, #f5f7fa); border: 1px dashed var(--el-border-color-lighter, #ebeef5);
  font-size: 10px; color: var(--el-text-color-secondary, #909399);
  span { flex: 1; min-width: 0; font-weight: 600; }
}

@media (max-width: 760px) {
  .ho-sre__grid { grid-template-columns: 1fr 1fr; }
  .ho-sre__legend { display: none; }
}
@media (max-width: 560px) {
  .ho-sre { padding: 10px 12px 12px; }
  .ho-sre__grid { grid-template-columns: 1fr; gap: 6px; }
}

/* ── Sidebar：row-grid 统一（kh / wl 完全复用 ho-row 结构） ── */
.ho__side { position: sticky; top: 16px; display: flex; flex-direction: column; gap: 12px; min-width: 0; align-self: start; }
@media (max-width: 1024px) { .ho__side { position: static; } }
.ho-sb {
  padding: 14px 16px 16px; overflow: hidden;
  &:hover { border-color: var(--el-border-color-light, #e4e7ed); }
  &--health   { border-top: 3px solid var(--ho-status-clear, #10b981); }
  &--workload { border-top: 3px solid var(--el-color-primary); }
}
.ho-sb__head {
  display: flex; align-items: center; gap: 6px;
  padding: 2px 2px 10px; margin-bottom: 8px;
  border-bottom: 1px dashed var(--el-border-color-lighter, #ebeef5);
  cursor: pointer; user-select: none;
  span { flex: 1; min-width: 0; font-size: 11px; font-weight: 800; letter-spacing: 0.4px; text-transform: uppercase; color: var(--el-text-color-primary, #303133); }
  &:active { transform: scale(0.99); }
}
.ho-sb__link { flex-shrink: 0; font-size: 11px; color: var(--el-text-color-placeholder, #a8abb2); transition: transform 0.14s, color 0.14s; }
.ho-sb__head:hover .ho-sb__link { color: var(--el-color-primary); transform: translateX(2px); }

/* Knowledge Health */
.ho-kh {
  display: flex; flex-direction: column; gap: 2px;
  padding: 12px 14px 14px; margin-bottom: 10px; cursor: pointer;
  border-radius: 12px; background: linear-gradient(135deg, var(--ho-bg-clear, #ecfdf5) 0%, var(--el-bg-color, #fff) 100%);
  border: 1px solid var(--ho-status-clear, #10b981); opacity: 0.96;
  transition: box-shadow 0.15s ease, transform 0.12s ease, border-color 0.15s ease, opacity 0.15s ease;
  &:hover { border-color: var(--ho-status-clear, #10b981); box-shadow: 0 4px 14px var(--ho-bg-clear, #ecfdf5); transform: translateY(-1px); opacity: 1; }
}
.ho-kh__pct { font-size: 32px; font-weight: 800; line-height: 1.05; letter-spacing: -0.5px; font-variant-numeric: tabular-nums; }
.ho-kh__label {
  font-size: 10px; font-weight: 600; color: var(--el-text-color-secondary, #909399); letter-spacing: 0.3px;
  text-transform: lowercase; &::first-letter { text-transform: uppercase; }
}

/* ── Shared row-grid（kh__cat + wl__row 合并，消除 90% 属性重复） ── */
.ho-row-grid { display: flex; flex-direction: column; gap: 3px; }
.ho-row {
  display: grid; grid-template-columns: 68px 1fr 24px;
  align-items: center; gap: 10px;
  height: 32px; padding: 0 8px;
  border-radius: 8px; cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
  &:hover { background: var(--el-fill-color-light, #f5f7fa); transform: translateX(2px); }
}
.ho-row__name {
  font-size: 10px; font-weight: 700; color: var(--el-text-color-secondary, #909399);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  letter-spacing: 0.2px; /* 保留 RSS/OKR 等缩写原始大小写 */
}
.ho-row__bar { display: block; height: 5px; background: var(--el-fill-color, #f0f2f5); border-radius: 3px; overflow: hidden; min-width: 0; }
.ho-row__fill {
  display: block; height: 100%; border-radius: 3px;
  background: var(--el-color-primary); transition: width 0.4s ease;
  &.is-over { background: var(--ho-status-danger); animation: ho-wl-over 1.6s ease-in-out infinite; }
}
@keyframes ho-wl-over { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } 50% { box-shadow: 0 0 0 2px rgba(239,68,68,0.18); } }
.ho-row__n {
  font-size: 10px; font-weight: 700; color: var(--el-text-color-placeholder, #a8abb2);
  text-align: right; font-variant-numeric: tabular-nums;
}
</style>

<!-- 全局兜底：h() 渲染的私有组件 DOM 不带 scoped hash，需全局约束图标尺寸 -->
<style lang="scss">
.ho-root {
  --ho-icon-xs: 11px; --ho-icon-sm: 14px; --ho-icon-md: 12px; --ho-icon-lg: 24px;
  /* 按尺寸分组：所有 h() 渲染的 SVG/el-icon 统一 width/height/font-size */
  .ho-activity__icon svg, .ho-activity__icon .el-icon,
  .ho-card__loading svg, .ho-card__loading .el-icon {
    width: var(--ho-icon-sm) !important; height: var(--ho-icon-sm) !important; font-size: var(--ho-icon-sm) !important;
    display: inline-block; flex-shrink: 0; vertical-align: middle;
  }
  .ho-activity__head svg, .ho-activity__head .el-icon,
  .ho-sb__head svg, .ho-sb__head .el-icon,
  .ho-card__badge svg, .ho-card__badge .el-icon {
    width: var(--ho-icon-md) !important; height: var(--ho-icon-md) !important; font-size: var(--ho-icon-md) !important;
  }
  .ho-activity__head .ho-count svg, .ho-activity__head .el-button svg,
  .ho-activity__head .ho-count .el-icon, .ho-activity__head .el-button .el-icon,
  .ho-sre-card__owner svg, .ho-sre-card__owner .el-icon {
    width: var(--ho-icon-xs) !important; height: var(--ho-icon-xs) !important; font-size: var(--ho-icon-xs) !important;
  }
  .ho-card__empty svg, .ho-card__empty .el-icon {
    width: var(--ho-icon-lg) !important; height: var(--ho-icon-lg) !important; font-size: var(--ho-icon-lg) !important;
  }
}
</style>
