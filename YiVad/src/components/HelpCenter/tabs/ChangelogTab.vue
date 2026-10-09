<template>
  <div class="log-tab">
    <div v-for="entry in entries" :key="entry.version" class="log-card" :class="{ 'is-unreleased': !entry.released }">
      <header class="log-card__head">
        <div class="log-card__title">
          <span class="log-card__version">v{{ entry.version }}</span>
          <el-tag size="small" :type="entry.released ? 'success' : 'warning'">
            {{ entry.released ? t('help.changelog.released') : t('help.changelog.unreleased') }}
          </el-tag>
          <span class="log-card__date">{{ entry.date }}</span>
        </div>
        <div class="log-card__actions">
          <el-button text size="small" @click="copyMarkdown(entry)">📋 {{ t('help.changelog.copy_md') }}</el-button>
        </div>
      </header>
      <p class="log-card__summary">{{ entry.summary }}</p>

      <div class="log-sections">
        <div v-for="group in grouped(entry)" :key="group.type" class="log-section">
          <h4 class="log-section__type" :class="`type-${group.type}`">
            <span class="log-section__dot"></span>
            {{ typeLabel(group.type) }}
            <span class="log-section__count">{{ group.items.length }}</span>
          </h4>
          <ul class="log-section__list">
            <li v-for="(item, i) in group.items" :key="i">
              <code v-if="item.scope" class="log-section__scope">{{ item.scope }}</code>
              <span v-html="highlight(item.description)"></span>
              <a v-if="item.prUrl" :href="item.prUrl" target="_blank" rel="noopener noreferrer" class="log-section__pr">#PR</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <el-empty v-if="!entries.length" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { listChangelog } from "@/data/help/changelog-generated";
import type { ChangelogEntry, ChangelogSection, ChangelogSectionType } from "../types";

const { t, locale } = useI18n();
const q = ref("");
const entries = computed(() => listChangelog().slice(0, 100));

function grouped(entry: ChangelogEntry): Array<{ type: ChangelogSectionType; items: ChangelogSection[] }> {
  const order: ChangelogSectionType[] = ["breaking", "security", "feat", "fix", "perf", "refactor", "docs", "chore"];
  const groups = new Map<ChangelogSectionType, ChangelogSection[]>();
  for (const s of entry.sections) {
    if (!groups.has(s.type)) groups.set(s.type, []);
    groups.get(s.type)!.push(s);
  }
  return order.filter(t => groups.has(t)).map(type => ({ type, items: groups.get(type)! }));
}

const TYPE_LABEL: Record<ChangelogSectionType, string> = {
  breaking: "BREAKING", security: "SECURITY", feat: "新增特性", fix: "问题修复",
  perf: "性能优化", refactor: "代码重构", docs: "文档更新", chore: "杂项"
};
function typeLabel(t: ChangelogSectionType) {
  return TYPE_LABEL[t] ?? t;
}
function highlight(s: string): string {
  return String(s).replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
}

function copyMarkdown(e: ChangelogEntry) {
  let md = `## v${e.version} (${e.date})\n\n${e.summary}\n\n`;
  for (const g of grouped(e)) {
    md += `### ${typeLabel(g.type)}\n\n`;
    for (const s of g.items) md += `- ${s.scope ? `**${s.scope}**: ` : ""}${s.description}${s.prUrl ? ` (${s.prUrl})` : ""}\n`;
    md += "\n";
  }
  navigator.clipboard?.writeText(md).then(
    () => ElMessage.success(t('help.changelog.copied')),
    () => ElMessage.error(t('help.changelog.copy_failed'))
  );
}
</script>

<style lang="scss" scoped>
.log-tab {}
.log-card {
  padding: 14px 16px; margin-bottom: 14px;
  border: 1px solid var(--el-border-color);
  border-radius: 10px; background: var(--el-bg-color);
  &.is-unreleased {
    border-color: var(--el-color-warning-light-5);
    background: var(--el-color-warning-light-9);
  }
}
.log-card__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.log-card__title { display: flex; align-items: center; gap: 8px; }
.log-card__version { font-weight: 700; font-size: 15px; color: var(--el-text-color-primary); }
.log-card__date { color: var(--el-text-color-secondary); font-size: 12px; }
.log-card__summary { color: var(--el-text-color-secondary); margin: 4px 0 10px; font-size: 13px; }
.log-section { margin-bottom: 10px; }
.log-section__type {
  display: inline-flex; align-items: center; gap: 6px;
  margin: 4px 0; font-size: 11px; font-weight: 600; letter-spacing: .5px; text-transform: uppercase;
  color: var(--el-color-primary);
  &.type-breaking { color: var(--el-color-danger); }
  &.type-security {
    color: var(--el-color-danger);
    .log-section__dot { background: var(--el-color-danger); box-shadow: 0 0 0 4px var(--el-color-danger-light-9); }
  }
  &.type-feat { color: var(--el-color-success); }
  &.type-fix { color: var(--el-color-warning); }
}
.log-section__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.log-section__count { opacity: .7; margin-left: 2px; }
.log-section__list { margin: 0; padding-left: 18px; }
.log-section__list li { padding: 2px 0; color: var(--el-text-color-primary); font-size: 13px; }
.log-section__scope {
  padding: 0 6px; font-family: var(--el-font-family-mono, ui-monospace, monospace);
  background: var(--el-fill-color-light); border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px; font-size: 12px; color: var(--el-color-primary);
  margin-right: 6px;
}
.log-section__pr { margin-left: 6px; color: var(--el-color-primary); text-decoration: none; font-size: 12px; }
:deep(.inline-code) {
  padding: 0 6px; font-family: var(--el-font-family-mono, ui-monospace, monospace);
  background: var(--el-fill-color-light); border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px; font-size: 12px; color: var(--el-text-color-secondary);
}
</style>
