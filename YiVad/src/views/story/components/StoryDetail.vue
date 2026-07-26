<script setup lang="ts" name="storyDetail">
import { ref } from "vue";
import type { StoryItem, StoryDep } from "@/stores/modules/story";
import StoryStatusBadge from "./StoryStatusBadge.vue";
import DepEditor from "./DepEditor.vue";

const props = defineProps<{
  story: StoryItem;
  deps: StoryDep[];
  getStoryDeps: (dir: string) => StoryDep | undefined;
  getDirectDependents: (dir: string) => StoryDep[];
  getRelationLabel: (relation: string) => string;
}>();

const emit = defineEmits<{
  updateDescription: [name: string, desc: string];
  addDep: [dir: string, depDir: string, relation: string];
  removeDep: [dir: string, depDir: string];
}>();

const editing = ref(false);
const descDraft = ref("");
const showDepEditor = ref(false);

const storyDep = () => props.getStoryDeps(props.story.name);
const dependents = () => props.getDirectDependents(props.story.name);

function startEditDesc() {
  descDraft.value = props.story.description || "";
  editing.value = true;
}
function saveDesc() {
  emit("updateDescription", props.story.name, descDraft.value);
  editing.value = false;
}
function cancelEditDesc() {
  editing.value = false;
}
function formatDate(ts: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
</script>

<template>
  <div class="story-detail">
    <div class="detail-section"><StoryStatusBadge :status="story.status" /></div>
    <div class="detail-section">
      <h4 class="detail-label">Description</h4>
      <div v-if="!editing" class="detail-desc-display">
        <p>{{ story.description || "No description" }}</p>
        <el-button size="small" text type="primary" @click="startEditDesc">Edit</el-button>
      </div>
      <div v-else>
        <el-input v-model="descDraft" type="textarea" :rows="3" />
        <div class="detail-actions">
          <el-button size="small" type="primary" @click="saveDesc">Save</el-button
          ><el-button size="small" @click="cancelEditDesc">Cancel</el-button>
        </div>
      </div>
    </div>
    <div class="detail-section">
      <h4 class="detail-label">Next Step</h4>
      <span>{{ story.nextStep }}</span>
    </div>
    <div class="detail-section">
      <h4 class="detail-label">Dependencies</h4>
      <div v-if="storyDep()?.dependsOn?.length">
        <span class="dep-label">Depends on:</span>
        <div v-for="d in storyDep()!.dependsOn" :key="d.directory" class="dep-row">
          <span>{{ d.directory }}</span
          ><el-tag size="small">{{ props.getRelationLabel(d.relation) }}</el-tag
          ><el-button size="small" text type="danger" @click="emit('removeDep', story.name, d.directory)">Remove</el-button>
        </div>
      </div>
      <div v-if="dependents().length">
        <span class="dep-label">Depended by:</span>
        <div v-for="d in dependents()" :key="d.directory" class="dep-row">
          <span>{{ d.directory || d.name }}</span>
        </div>
      </div>
      <el-button size="small" text type="primary" @click="showDepEditor = !showDepEditor">{{
        showDepEditor ? "Cancel" : "Add Dep"
      }}</el-button>
      <DepEditor
        v-if="showDepEditor"
        all-stories=""
        available-dirs=""
        @confirm="
          (depDir: string, rel: string) => {
            emit('addDep', story.name, depDir, rel);
            showDepEditor = false;
          }
        "
        @cancel="showDepEditor = false"
      />
    </div>
    <div class="detail-section">
      <h4 class="detail-label">Files ({{ story.files.length }})</h4>
      <div v-for="f in story.files.slice(0, 20)" :key="f.filePath" class="file-row">
        <span>{{ f.fileName }}</span
        ><span class="file-date">{{ formatDate(f.updatedAt) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.story-detail {
  padding: 0 4px;
}
.detail-section {
  margin-bottom: 20px;
}
.detail-label {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.detail-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.dep-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  display: block;
  margin-bottom: 4px;
}
.dep-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  margin-bottom: 4px;
  font-size: 13px;
}
.file-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
}
.file-row:hover {
  background: var(--el-fill-color-light);
}
.file-date {
  color: var(--el-text-color-secondary);
}
</style>
