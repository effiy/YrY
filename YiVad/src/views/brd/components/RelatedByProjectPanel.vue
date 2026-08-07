<script setup lang="ts" name="RelatedByProjectPanel">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Link, Loading, ChatDotRound, ChatLineRound } from "@element-plus/icons-vue";
import { PROJECT_LABELS } from "@/config";
import { useAiChatBridge } from "@/hooks/useAiChatBridge";
import { formatRelativeTime } from "@/utils/datetime";
import {
  useRelatedByProject,
  RELATED_TOPICS,
  RELATED_DOMAIN_ORDER,
  type RelatedEntry,
  type RelatedDomain,
  type TopicConfig
} from "@/hooks/useRelatedByProject";

type Domain = RelatedDomain;

const props = defineProps<{
  /** Join key — entries whose `meta.project` (BRD/TL) or `project` (Bug) matches. */
  project?: string;
  /** Current entry's key — excluded from results to avoid self-reference. */
  currentKey?: string;
  /** Domain of the host page — used to exclude the host topic entirely (so "Other roles" stays pure). */
  currentTree?: Domain;
  /** Topic of the host page (e.g. "brd-engineer", "postmortem", "bugs") — excludes that topic's group. */
  currentTopic?: string;
  /** Show the Story Board footer link. Default true. */
  showStoryLink?: boolean;
}>();

const showStory = computed(() => props.showStoryLink !== false);
const { t } = useI18n();
const router = useRouter();

const { loading, error, filtered, totalCount, perDomainCount, grouped } = useRelatedByProject(
  () => props.project,
  { currentKey: props.currentKey, currentTopic: props.currentTopic }
);

const DOMAIN_ORDER = RELATED_DOMAIN_ORDER;

function toDetail(cfg: TopicConfig, key: string, project?: string) {
  if (cfg.domain === "bug") {
    router.push(`/code-review/bugs/detail/${key}`);
    return;
  }
  if (cfg.domain === "story") {
    router.push({ path: "/story", query: { project: project ?? "", story: key } });
    return;
  }
  router.push({ name: cfg.route, params: { id: key }, query: { mode: "view" } });
}

function toStoryList() {
  if (!props.project) return;
  router.push({ path: "/story", query: { project: props.project } });
}

function toBugsList() {
  if (!props.project) return;
  router.push({ path: "/code-review/bugs", query: { project: props.project } });
}

const { openInAiChat, linkToAiChatByTag } = useAiChatBridge();

async function discussRelatedInAiChat(entry: RelatedEntry & { topic: string; domain: Domain }) {
  const ctxPath = `${entry.domain}/${entry.topic}/${entry.key}`;
  const sev = entrySeverity(entry);
  const stat = entryStatus(entry);
  const metaEntries = entry.meta
    ? Object.entries(entry.meta).filter(([k]) => !(k === "severity" || k === "status" || k === "project"))
    : [];
  const pageContent = [
    `# ${entry.title}`,
    "",
    `**Domain:** ${entry.domain}`,
    `**Topic:** ${entry.topic}`,
    `**Key:** ${entry.key}`,
    ...(entry.project ? [`**Project:** ${projectLabel(entry.project)}`] : []),
    ...(sev ? [`**Severity:** ${sev}`] : []),
    ...(stat ? [`**Status:** ${stat}`] : []),
    ...(entry.module ? [`**Module:** ${entry.module}`] : []),
    ...(entry.priority ? [`**Priority:** ${entry.priority}`] : []),
    ...(entry.type ? [`**Type:** ${entry.type}`] : []),
    ...(entry.assignee ? [`**Assignee:** ${entry.assignee}`] : []),
    ...(metaEntries.length ? ["", "## Meta", "", ...metaEntries.map(([k, v]) => `- **${k}:** ${String(v)}`)] : [])
  ].join("\n");
  const tags = [`ctx:${ctxPath}`, entry.domain, entry.topic];
  if (entry.project) tags.push(`project:${entry.project}`);
  if (stat) tags.push(`status:${stat}`);
  const cfg = RELATED_TOPICS.find(tt => tt.domain === entry.domain && tt.topic === entry.topic);
  let sourceUrl: string | undefined;
  if (cfg) {
    if (cfg.domain === "bug") sourceUrl = `/code-review/bugs/detail/${entry.key}?mode=view`;
    else sourceUrl = router.resolve({ name: cfg.route, params: { id: entry.key }, query: { mode: "view" } }).href;
  }
  await openInAiChat({
    title: `${entry.title} — related ${entry.domain}`,
    pageContent,
    tags,
    sourceUrl
  });
}

function viewRelatedSessions(entry: RelatedEntry & { topic: string; domain: Domain }) {
  router.push(linkToAiChatByTag(`${entry.topic}:${entry.key}`));
}

async function discussProjectInAiChat() {
  if (!props.project || !totalCount.value) return;
  const displayName = projectLabel(props.project);
  const lines: string[] = [
    `# Cross-Domain Map: ${displayName}`,
    "",
    `**Project:** ${displayName}`,
    `**Total entries:** ${totalCount.value}`,
    "",
    "_Aggregated from BRD, Tech-Leadership, Code Review, Bug, and Story collections. Each section lists entries sharing this project, sorted by recency._",
    ""
  ];
  for (const d of grouped.value) {
    const dLabel = t(`rbp.domain.${d.domain}`);
    lines.push(`## ${dLabel} (${perDomainCount.value[d.domain]})`, "");
    for (const g of d.groups) {
      lines.push(`**${g.config.label}**`, "");
      for (const e of g.list) {
        const stat = entryStatus(e);
        const sev = entrySeverity(e);
        const bits = [stat ? `[${stat}]` : "", sev ? `[${sev}]` : "", e.title].filter(Boolean).join(" ");
        lines.push(`- ${bits} _${formatTime(e.updatedAt)}_`);
      }
      lines.push("");
    }
  }
  const tags = ["cross-domain-map", `project:${props.project}`, ...DOMAIN_ORDER.filter(d => perDomainCount.value[d] > 0)];
  await openInAiChat({
    title: `Project ${displayName} — cross-domain map`,
    pageContent: lines.join("\n"),
    tags
  });
}

function formatTime(ts: number): string {
  return formatRelativeTime(ts);
}

function projectLabel(value?: string): string {
  if (!value) return "";
  return PROJECT_LABELS[value.toLowerCase()] ?? value;
}

const STATUS_TAG: Record<string, "" | "success" | "warning" | "info" | "danger" | "primary"> = {
  draft: "info", in_progress: "warning", reviewed: "primary", adopted: "success", archived: "info",
  proposed: "info", accepted: "success", superseded: "info", deprecated: "danger",
  open: "warning", resolved: "success", closed: "info", rejected: "danger", reopened: "danger",
  planned: "info", delivered: "success", deferred: "info",
  evaluating: "warning", decided: "success"
};
function statusTagType(s?: string) {
  return s ? STATUS_TAG[s] ?? "" : "";
}
function entryStatus(e: RelatedEntry): string | undefined {
  if (e.domain === "bug" || e.domain === "story") return e.status;
  return e.meta?.status;
}
function entrySeverity(e: RelatedEntry): string | undefined {
  if (e.domain === "bug") return e.severity;
  return e.meta?.severity;
}
</script>

<template>
  <section class="rbp">
    <header class="rbp__header">
      <el-icon class="rbp__icon"><Link /></el-icon>
      <span class="rbp__title">{{ t("rbp.title") }}</span>
      <el-tag v-if="!loading && !error" size="small" type="info" effect="plain" class="rbp__count">
        {{ t("rbp.count", { count: totalCount }) }}
      </el-tag>
      <span v-if="!loading && !error" class="rbp__per-domain">
        <el-tag
          v-for="d in DOMAIN_ORDER"
          :key="d"
          v-show="perDomainCount[d] > 0"
          size="small"
          effect="plain"
          class="rbp__domain-badge"
        >
          {{ t(`rbp.domain.${d}`) }}: {{ perDomainCount[d] }}
        </el-tag>
      </span>
      <span v-if="props.project" class="rbp__project">project: {{ projectLabel(props.project) }}</span>
      <el-button
        v-if="props.project && totalCount"
        class="rbp__discuss-project"
        size="small"
        link
        :icon="ChatDotRound"
        :title="t('rbp.discussProject')"
        @click="discussProjectInAiChat"
      />
    </header>

    <div v-if="loading" class="rbp__loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ t("rbp.loading") }}</span>
    </div>

    <div v-else-if="error" class="rbp__error">{{ error }}</div>

    <div v-else-if="!totalCount" class="rbp__empty">{{ t("rbp.empty") }}</div>

    <div v-else class="rbp__domains">
      <section v-for="d in grouped" :key="d.domain" class="rbp__domain">
        <div class="rbp__domain-label">{{ t(`rbp.domain.${d.domain}`) }}</div>
        <div v-for="g in d.groups" :key="g.config.topic" class="rbp__group">
          <div class="rbp__group-label">{{ g.config.label }}</div>
          <ul class="rbp__list">
            <li
              v-for="e in g.list"
              :key="e.key"
              class="rbp__item"
              @click="toDetail(g.config, e.key, e.project)"
            >
              <el-tag v-if="entryStatus(e)" :type="statusTagType(entryStatus(e)) || undefined" size="small" effect="light">
                {{ entryStatus(e) }}
              </el-tag>
              <el-tag v-if="entrySeverity(e)" size="small" effect="plain">{{ entrySeverity(e) }}</el-tag>
              <span class="rbp__item-title">{{ e.title }}</span>
              <el-button
                class="rbp__discuss"
                size="small"
                link
                :icon="ChatDotRound"
                :title="t('common.discussInAiChat')"
                @click.stop="discussRelatedInAiChat(e)"
              />
              <el-button
                class="rbp__discuss"
                size="small"
                link
                :icon="ChatLineRound"
                :title="t('common.relatedAiChatSessions')"
                @click.stop="viewRelatedSessions(e)"
              />
              <span class="rbp__time">{{ formatTime(e.updatedAt) }}</span>
            </li>
          </ul>
        </div>
      </section>
    </div>

    <footer v-if="showStory && props.project" class="rbp__footer">
      <el-link type="primary" :underline="false" @click="toBugsList">
        {{ t("rbp.viewBugs") }}
      </el-link>
      <el-link type="primary" :underline="false" @click="toStoryList">
        {{ t("rbp.findStories") }}
      </el-link>
    </footer>
  </section>
</template>

<style scoped lang="scss">
.rbp {
  margin-top: 20px;
  padding: 16px 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}
.rbp__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.rbp__icon { color: var(--el-color-primary); }
.rbp__title {
  font-weight: 600;
  color: var(--el-text-color-primary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 12px;
}
.rbp__count { margin-left: 4px; }
.rbp__per-domain {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-left: 8px;
}
.rbp__domain-badge {
  font-size: 11px;
  letter-spacing: 0.02em;
}
.rbp__project {
  margin-left: auto;
  font-family: "SF Mono", "Menlo", monospace;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.rbp__discuss-project {
  margin-left: 4px;
  flex-shrink: 0;
}
.rbp__loading, .rbp__error, .rbp__empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}
.rbp__error { color: var(--el-color-danger); }
.rbp__domains { display: flex; flex-direction: column; gap: 18px; }
.rbp__domain-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--el-color-primary);
  margin-bottom: 8px;
  border-bottom: 1px dashed var(--el-border-color-lighter);
  padding-bottom: 4px;
}
.rbp__group + .rbp__group { margin-top: 10px; }
.rbp__group-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}
.rbp__list { list-style: none; margin: 0; padding: 0; }
.rbp__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  margin: 0 -10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: var(--el-color-primary-light-9);
    .rbp__item-title { color: var(--el-color-primary); text-decoration: underline; }
  }
}
.rbp__item-title {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rbp__time {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.rbp__footer {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed var(--el-border-color-lighter);
  display: flex;
  justify-content: flex-end;
  gap: 18px;
}
</style>
