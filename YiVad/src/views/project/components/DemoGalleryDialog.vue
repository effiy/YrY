<template>
  <el-dialog
    :model-value="modelValue"
    title="Demo Gallery"
    width="820px"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p class="demo-gallery__intro">
      Start a project from a proven example. Each demo seeds a project with its issues, cycles, and releases.
      <span class="demo-gallery__counts">{{ catalogSummary }}</span>
    </p>
    <div class="demo-gallery__grid">
      <div v-for="demo in demos" :key="demo.source + ':' + (demo.docKey ?? demo.slug)" class="demo-card">
        <div class="demo-card__cover" :style="coverStyle(demo)" @click="toggle(demo)">
          <span class="demo-card__cover-icon">{{ demo.name.charAt(0).toUpperCase() }}</span>
          <span class="demo-card__cover-id">{{ demo.identifier }}</span>
        </div>
        <div class="demo-card__body" @click="toggle(demo)">
          <div class="demo-card__head">
            <span class="demo-card__name" :title="demo.name">{{ demo.name }}</span>
            <span class="demo-card__tags">
              <el-tag v-if="demo.source === 'user'" size="small" type="success" effect="dark">Saved</el-tag>
              <el-tag size="small" effect="plain">{{ demo.category }}</el-tag>
            </span>
          </div>
          <p class="demo-card__tagline">{{ demo.tagline }}</p>
          <div class="demo-card__meta">
            <span>{{ demo.issues.length }} issues</span>
            <span class="demo-card__meta-sep">·</span>
            <span>{{ demo.cycles.length }} cycles</span>
            <span class="demo-card__meta-sep">·</span>
            <span>{{ demo.releases.length }} releases</span>
          </div>
        </div>

        <div v-if="expanded === demo.slug" class="demo-card__detail">
          <div class="demo-card__detail-group">
            <div class="demo-card__detail-label">Issues</div>
            <ul class="demo-card__issue-list">
              <li v-for="(it, i) in demo.issues" :key="i" class="demo-card__issue">
                <span class="demo-card__issue-seq">{{ i + 1 }}</span>
                <span class="demo-card__issue-title" :title="it.title">{{ it.title }}</span>
                <el-tag size="small" :type="issueTypeTag(it.issue_type)" effect="light">{{ typeLabel(it.issue_type) }}</el-tag>
                <el-tag size="small" :type="issueStatusTag(it.status)" effect="plain">{{ issueStatusLabel(it.status) }}</el-tag>
                <span class="demo-card__issue-meta">{{ issueMeta(demo, it) }}</span>
              </li>
            </ul>
          </div>
          <div class="demo-card__detail-group">
            <div class="demo-card__detail-label">Cycles</div>
            <div v-for="(c, i) in demo.cycles" :key="i" class="demo-card__row">
              <el-tag size="small" :type="CYCLE_STATUS_TAG[c.status]" effect="plain">{{ CYCLE_STATUS_MAP[c.status] }}</el-tag>
              <span class="demo-card__row-name">{{ c.name }}</span>
              <span class="demo-card__row-dates">{{ c.start_date }} → {{ c.end_date }}</span>
            </div>
          </div>
          <div class="demo-card__detail-group">
            <div class="demo-card__detail-label">Releases</div>
            <div v-for="(r, i) in demo.releases" :key="i" class="demo-card__row">
              <span class="demo-card__row-version">{{ r.version }}</span>
              <span class="demo-card__row-name">{{ r.name }}</span>
              <el-tag size="small" :type="RELEASE_STATUS_TAG[r.status]" effect="plain">{{ RELEASE_STATUS_MAP[r.status] }}</el-tag>
            </div>
          </div>
        </div>

        <div class="demo-card__footer">
          <el-button v-if="demo.source === 'user'" size="small" type="danger" plain @click="remove(demo)">
            Delete
          </el-button>
          <el-button size="small" @click="toggle(demo)">
            {{ expanded === demo.slug ? "Hide" : "Preview" }}
          </el-button>
          <el-button type="primary" size="small" :loading="creating === demo.slug" @click="create(demo)">
            Create
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts" name="demoGalleryDialog">
import { computed, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { DEMOS, createProjectFromDemo, listDemoTemplates, deleteDemoTemplate } from "@/api/modules/demoService";
import type { DemoDefinition, DemoSeedIssue, DemoTemplate } from "@/api/modules/demoService";
import {
  issueStatusLabel,
  issueStatusTag,
  typeLabel,
  issueTypeTag,
  ISSUE_PRIORITY_MAP
} from "@/api/modules/issueService";
import { CYCLE_STATUS_MAP } from "@/api/modules/cycleService";
import { RELEASE_STATUS_MAP } from "@/api/modules/releaseService";
import type { TagType } from "@/api/modules/issueService";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ "update:modelValue": [boolean]; created: [string] }>();

const creating = ref("");
const expanded = ref("");
const templates = ref<DemoTemplate[]>([]);

interface GalleryDemo extends DemoDefinition {
  source: "builtin" | "user";
  docKey?: string;
}

const demos = computed<GalleryDemo[]>(() => [
  ...DEMOS.map(d => ({ ...d, source: "builtin" as const })),
  ...templates.value.map(t => ({ ...t, source: "user" as const, docKey: t.key }))
]);

const catalogSummary = computed(() => {
  const built = DEMOS.length;
  return templates.value.length
    ? `${built} built-in · ${templates.value.length} saved`
    : `${built} built-in demos`;
});

async function loadTemplates() {
  templates.value = await listDemoTemplates();
}

watch(
  () => props.modelValue,
  open => {
    // Built-in demos don't need the backend; degrade to built-in-only if the
    // template collection query fails.
    if (open) loadTemplates().catch(() => {});
  }
);

async function remove(demo: GalleryDemo) {
  if (!demo.docKey) return;
  try {
    await ElMessageBox.confirm(
      `Delete the saved template "${demo.name}"?`,
      "Delete Template",
      { confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "warning" }
    );
    await deleteDemoTemplate(demo.docKey);
    templates.value = templates.value.filter(t => t.key !== demo.docKey);
    ElMessage.success("Template deleted");
  } catch {
    /* cancelled */
  }
}

const CYCLE_STATUS_TAG: Record<string, TagType> = { upcoming: "info", active: "primary", completed: "success" };
const RELEASE_STATUS_TAG: Record<string, TagType> = { planned: "info", in_progress: "primary", released: "success" };

function coverStyle(demo: DemoDefinition) {
  const [from, to] = demo.gradient;
  return { background: `linear-gradient(135deg, ${from}, ${to})` };
}

function issueMeta(demo: DemoDefinition, it: DemoSeedIssue) {
  const parts = [ISSUE_PRIORITY_MAP[it.priority].toLowerCase()];
  if (it.cycle != null) parts.push(demo.cycles[it.cycle]?.name ?? "");
  if (it.release != null) parts.push(demo.releases[it.release]?.version ?? "");
  return parts.filter(Boolean).join(" · ");
}

function toggle(demo: DemoDefinition) {
  expanded.value = expanded.value === demo.slug ? "" : demo.slug;
}

async function create(demo: DemoDefinition) {
  creating.value = demo.slug;
  try {
    const { projectKey } = await createProjectFromDemo(demo);
    emit("created", projectKey);
    emit("update:modelValue", false);
    ElMessage.success(`Created "${demo.name}" from demo`);
  } catch {
    ElMessage.error("Failed to create project from demo");
  } finally {
    creating.value = "";
  }
}
</script>

<style scoped lang="scss">
.demo-gallery__intro {
  margin: 0 0 18px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.demo-gallery__counts {
  margin-left: 6px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.demo-gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  align-items: start;
}
.demo-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  overflow: hidden;
  background: var(--el-bg-color);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--el-box-shadow-light);
  }
}
.demo-card__cover {
  position: relative;
  height: 84px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.demo-card__cover-icon {
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  opacity: 0.9;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.demo-card__cover-id {
  position: absolute;
  right: 10px;
  bottom: 6px;
  font-family: monospace;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.85);
}
.demo-card__body {
  padding: 12px 14px;
  cursor: pointer;
}
.demo-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.demo-card__tags {
  display: flex;
  align-items: center;
  gap: 6px;
}
.demo-card__name {
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.demo-card__tagline {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  min-height: 36px;
}
.demo-card__meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.demo-card__meta-sep {
  color: var(--el-border-color);
}
.demo-card__detail {
  padding: 0 14px 12px;
  border-top: 1px dashed var(--el-border-color-lighter);
}
.demo-card__detail-group {
  margin-top: 10px;
}
.demo-card__detail-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 6px;
}
.demo-card__issue-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.demo-card__issue {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}
.demo-card__issue-seq {
  font-family: monospace;
  color: var(--el-text-color-placeholder);
  min-width: 14px;
}
.demo-card__issue-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.demo-card__issue-meta {
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
  font-size: 11px;
}
.demo-card__row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 2px 0;
}
.demo-card__row-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.demo-card__row-dates,
.demo-card__row-version {
  color: var(--el-text-color-placeholder);
  font-family: monospace;
  font-size: 11px;
  white-space: nowrap;
}
.demo-card__footer {
  padding: 10px 14px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
