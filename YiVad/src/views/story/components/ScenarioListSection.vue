<script setup lang="ts" name="ScenarioListSection">
/**
 * Scenario list section rendered inside the story detail drawer (Scenarios tab).
 *
 * Groups scenarios by status, shows progress, and provides per-scenario
 * actions: edit, AI coding prompt generation, analysis files prompt, delete.
 * AI coding / analysis history is shown inside collapsible panels.
 */
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElCollapse, ElCollapseItem } from "element-plus";
import { Document } from "@element-plus/icons-vue";
import { useStoryStore } from "@/stores/modules/story";
import { useAiPrompts } from "@/views/story/composables/useAiPrompts";
import StoryStatusBadge from "./StoryStatusBadge.vue";
import { STORY_STATUS_ORDER, PRIORITY_COLORS, fmtDate, formatSize } from "@/views/story/constants";
import type { StoryDocument } from "@/api/modules/story";

const { t } = useI18n();
const store = useStoryStore();
const { generatingCoding, generateCodingPrompt, copyToClipboard } = useAiPrompts();

const story = computed(() => store.selectedStory);

function scenarioCount(s: StoryDocument): number {
  return s.scenarios?.length ?? 0;
}

function scenarioDone(s: StoryDocument): number {
  return s.scenarios?.filter(sc => sc.status === "operations").length ?? 0;
}

function scenarioProgress(s: StoryDocument): number {
  const total = scenarioCount(s);
  if (!total) return 0;
  return Math.round((scenarioDone(s) / total) * 100);
}

const statusLabels = computed(() => ({
  planning: t("story.planning"),
  design: t("story.design"),
  develop: t("story.develop"),
  testing: t("story.testing"),
  operations: t("story.operations"),
  archived: t("story.archived")
}));
</script>

<template>
  <div v-if="story" class="sc-root">
    <div class="sc-hdr">
      <span class="sc-count">
        {{ $t("story.scenariosCount", { total: scenarioCount(story), done: scenarioDone(story) }) }}
      </span>
      <el-button size="small" type="primary" @click="store.openScenarioCreate()">{{ $t("story.addScenario") }}</el-button>
    </div>
    <el-progress
      v-if="scenarioCount(story) > 0"
      :percentage="scenarioProgress(story)"
      :stroke-width="8"
      :color="scenarioProgress(story) === 100 ? '#67c23a' : '#409eff'"
      style="margin-bottom: 16px"
    />
    <el-empty v-if="!story.scenarios?.length" :description="$t('story.noScenarios')" :image-size="60" />

    <template v-for="scStatus in STORY_STATUS_ORDER" :key="scStatus">
      <template v-if="story.scenarios?.filter(sc => sc.status === scStatus).length">
        <div class="sc-group-hdr">
          <StoryStatusBadge :status="scStatus" />
          <span class="sc-group-label">{{ statusLabels[scStatus] }}</span>
          <span class="sc-group-n">{{ story.scenarios.filter(sc => sc.status === scStatus).length }}</span>
        </div>

        <div v-for="(sc, idx) in story.scenarios" :key="sc.key">
          <div v-if="sc.status === scStatus" class="sc-card">
            <!-- Header -->
            <div class="sc-top">
              <span class="sc-name">{{ sc.name }}</span>
              <div class="sc-badges">
                <StoryStatusBadge :status="sc.status" />
                <el-tag :type="PRIORITY_COLORS[sc.priority] as any" size="small">{{ sc.priority.toUpperCase() }}</el-tag>
              </div>
            </div>

            <!-- Description -->
            <p class="sc-desc">{{ sc.description || $t("story.noDescription") }}</p>

            <!-- Steps -->
            <div v-if="sc.steps?.length" class="sc-steps">
              <div v-for="(step, si) in sc.steps" :key="`${si}_${step.action}`" class="sc-step">
                <span class="sc-step-act">{{ step.action }}</span>
                <span class="sc-step-desc">{{ step.description }}</span>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="sc.tags?.length" class="sc-tags">
              <el-tag v-for="tag in sc.tags" :key="tag" size="small" class="sc-tag-chip">{{ tag }}</el-tag>
            </div>

            <!-- Scenario Files -->
            <div v-if="sc.files?.length" class="sc-history">
              <el-collapse>
                <el-collapse-item>
                  <template #title>
                    <span class="sc-history-title">{{ $t("story.files") }} ({{ sc.files.length }})</span>
                  </template>
                  <div
                    v-for="f in sc.files"
                    :key="f.filePath"
                    class="sc-file-item"
                    :title="$t('story.clickToCopy')"
                    @click="copyToClipboard(f.filePath); ElMessage.success($t('story.aiCodingCopied'))"
                  >
                    <el-icon><Document /></el-icon>
                    <div class="sc-file-info">
                      <span class="sc-file-name">{{ f.fileName || f.filePath }}</span>
                      <span class="sc-file-path">{{ f.filePath }}</span>
                    </div>
                    <div class="sc-file-meta">
                      <span v-if="f.language" class="sc-file-lang">{{ f.language }}</span>
                      <span v-if="f.lines" class="sc-file-lines">{{ f.lines }} lines</span>
                      <span v-if="f.size" class="sc-file-size">{{ formatSize(f.size) }}</span>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>

            <!-- AI Coding History -->
            <div v-if="sc.aiCodingHistory?.length" class="sc-history">
              <el-collapse>
                <el-collapse-item>
                  <template #title>
                    <span class="sc-history-title">{{ $t("story.aiCodingHistory") }} ({{ sc.aiCodingHistory.length }})</span>
                  </template>
                  <div v-for="(entry, ei) in sc.aiCodingHistory" :key="ei" class="sc-history-entry">
                    <div class="sc-history-meta">
                      <span class="sc-history-time">{{ $t("story.aiCodingGenerated", { time: fmtDate(entry.generatedAt) }) }}</span>
                      <div class="sc-history-acts">
                        <el-button size="small" text type="primary" @click="copyToClipboard(entry.prompt); ElMessage.success($t('story.aiCodingCopied'))">
                          {{ $t("story.aiCodingCopy") }}
                        </el-button>
                        <el-button size="small" text type="danger" @click="store.deleteAiCodingEntry(sc.key, ei)">
                          {{ $t("story.del") }}
                        </el-button>
                      </div>
                    </div>
                    <div class="sc-history-text">{{ entry.prompt }}</div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>

            <!-- Actions -->
            <div class="sc-acts">
              <el-button size="small" text @click="store.openScenarioEdit(idx)">{{ $t("story.edit") }}</el-button>
              <el-button size="small" text type="warning" :loading="generatingCoding.has(sc.key)" @click="generateCodingPrompt(sc)">
                {{ $t("story.aiCoding") }}
              </el-button>
              <el-button size="small" text type="danger" @click="store.handleScenarioDelete(idx)">{{ $t("story.del") }}</el-button>
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped lang="scss">
.sc-root {
  // container
}
.sc-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.sc-count {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
.sc-group-hdr {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 14px 0 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--el-border-color-light);
}
.sc-group-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.sc-group-n {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.sc-card {
  padding: 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  margin-bottom: 10px;
}
.sc-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.sc-name {
  font-size: 14px;
  font-weight: 600;
}
.sc-badges {
  display: flex;
  gap: 6px;
}
.sc-desc {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin: 0 0 8px;
  line-height: 1.5;
}
.sc-steps {
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 8px;
}
.sc-step {
  display: flex;
  gap: 10px;
  padding: 3px 0;
  font-size: 13px;
}
.sc-step-act {
  font-weight: 600;
  color: var(--el-color-primary);
  min-width: 48px;
}
.sc-step-desc {
  color: var(--el-text-color-regular);
}
.sc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 6px 0;
}
.sc-acts {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
}

// Files
.sc-file-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 10px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
  margin-bottom: 4px;
  &:hover {
    background: var(--el-fill-color);
  }
}
.sc-file-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.sc-file-name {
  font-size: 13px;
  font-weight: 600;
}
.sc-file-path {
  font-family: "SF Mono", "Menlo", monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  word-break: break-all;
}
.sc-file-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
}
.sc-file-lang {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 3px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
.sc-file-lines {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.sc-file-size {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  font-family: "SF Mono", "Menlo", monospace;
  white-space: nowrap;
}

// History
.sc-history {
  margin-top: 8px;
  margin-bottom: 8px;
}
.sc-history-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.sc-history-entry {
  padding: 6px 0;
  border-bottom: 1px dashed var(--el-border-color-lighter);
  &:last-child {
    border-bottom: none;
  }
}
.sc-history-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}
.sc-history-acts {
  display: flex;
  gap: 0;
}
.sc-history-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.sc-history-text {
  font-size: 13px;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  line-height: 1.6;
  padding: 6px 10px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}
</style>
