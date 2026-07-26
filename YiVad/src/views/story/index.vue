<script setup lang="ts" name="storyBoard">
import { onMounted } from "vue";
import { useStoryStore } from "@/stores/modules/story";
import type { StoryDocument } from "@/api/modules/story";
import StoryStatusBadge from "./components/StoryStatusBadge.vue";

const store = useStoryStore();
const statusLabels: Record<string, string> = {
  planning: "Planning",
  design: "Design",
  develop: "Develop",
  testing: "Testing",
  operations: "Operations"
};
const statusOrder = ["planning", "design", "develop", "testing", "operations"];

const timeRangeOptions = [
  { label: "All", value: "all" as const },
  { label: "This Week", value: "week" as const },
  { label: "This Month", value: "month" as const },
  { label: "This Quarter", value: "quarter" as const },
  { label: "Custom", value: "custom" as const }
];

function formatDate(ts: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

onMounted(() => store.fetchStories());
</script>

<template>
  <div class="story-board">
    <!-- Header -->
    <div class="sb-header">
      <div class="sb-header-left">
        <h2 class="sb-title">Story Board</h2>
        <span class="sb-count">{{ store.totalStories }} stories</span>
      </div>
      <div class="sb-header-right">
        <el-button type="primary" @click="store.openCreateDialog()">+ New Story</el-button>
        <el-segmented
          v-model="store.viewMode"
          :options="[
            { label: 'Cards', value: 'cards' },
            { label: 'List', value: 'list' }
          ]"
        />
      </div>
    </div>

    <!-- Dimensions: Project + Time -->
    <div class="sb-dims">
      <div class="sb-dim">
        <span class="sb-dim-label">Project</span>
        <el-select
          v-model="store.selectedProject"
          placeholder="All Projects"
          clearable
          size="small"
          style="width: 200px"
          @change="store.selectProject(store.selectedProject)"
        >
          <el-option label="All Projects" :value="null" />
          <el-option v-for="p in store.projects" :key="p" :label="`${p} (${store.projectStoryCounts[p] || 0})`" :value="p" />
        </el-select>
      </div>
      <div class="sb-dim">
        <span class="sb-dim-label">Time</span>
        <el-select v-model="store.timeRange" size="small" style="width: 160px" @change="(v: any) => store.setTimeRange(v)">
          <el-option v-for="o in timeRangeOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
        <template v-if="store.timeRange === 'custom'">
          <el-date-picker
            v-model="store.customStart"
            type="date"
            placeholder="Start"
            size="small"
            style="width: 140px"
            @change="store.fetchStories()"
          />
          <span class="sb-range-sep">-</span>
          <el-date-picker
            v-model="store.customEnd"
            type="date"
            placeholder="End"
            size="small"
            style="width: 140px"
            @change="store.fetchStories()"
          />
        </template>
      </div>
      <div class="sb-dim-right">
        <el-input
          v-model="store.searchQuery"
          placeholder="Search stories..."
          clearable
          size="small"
          style="width: 220px"
          @change="store.fetchStories()"
        />
      </div>
    </div>

    <!-- Content -->
    <el-skeleton v-if="store.loading" :rows="5" animated />
    <el-alert v-else-if="store.error" :title="store.error" type="error" show-icon closable />

    <!-- Cards View -->
    <div v-else-if="store.viewMode === 'cards'" class="sb-cards">
      <template v-for="status in statusOrder" :key="status">
        <div v-if="store.groupedStories[status]?.length" class="sb-group">
          <h3 class="sb-group-title">
            <StoryStatusBadge :status="status" />
            <span class="sb-group-count">{{ store.groupedStories[status].length }}</span>
            <el-button size="small" text @click="store.openCreateDialog()">+</el-button>
          </h3>
          <div class="sb-cards-grid">
            <el-card
              v-for="story in store.groupedStories[status]"
              :key="story.key"
              class="sb-card"
              shadow="hover"
              @click="store.openDetail(story)"
            >
              <div class="sc-header">
                <span class="sc-name">{{ story.name }}</span>
                <div class="sc-actions" @click.stop>
                  <el-button size="small" text @click="store.openEditDialog(story)">Edit</el-button>
                  <el-button size="small" text type="danger" @click="store.handleDelete(story)">Del</el-button>
                </div>
              </div>
              <div class="sc-meta">
                <el-tag v-if="story.project" size="small" type="info">{{ story.project }}</el-tag>
                <span class="sc-date">{{ formatDate(story.updatedAt) }}</span>
              </div>
              <p class="sc-desc">{{ story.description || "No description" }}</p>
              <div class="sc-footer">
                <span>{{ story.files?.length || 0 }} files</span>
                <span>{{ story.dependencies?.length || 0 }} deps</span>
              </div>
            </el-card>
          </div>
        </div>
      </template>
      <el-empty v-if="store.filteredStories.length === 0" description="No matching stories">
        <el-button type="primary" @click="store.openCreateDialog()">Create Story</el-button>
      </el-empty>
    </div>

    <!-- List View -->
    <el-table
      v-else
      :data="store.filteredStories"
      stripe
      @row-click="(row: StoryDocument) => store.openDetail(row)"
      style="cursor: pointer"
    >
      <el-table-column prop="name" label="Name" min-width="180">
        <template #default="{ row }"
          ><span style="font-weight: 600">{{ row.name }}</span></template
        >
      </el-table-column>
      <el-table-column prop="project" label="Project" width="120">
        <template #default="{ row }"
          ><el-tag v-if="row.project" size="small" type="info">{{ row.project }}</el-tag></template
        >
      </el-table-column>
      <el-table-column prop="status" label="Status" width="110">
        <template #default="{ row }"><StoryStatusBadge :status="row.status" /></template>
      </el-table-column>
      <el-table-column prop="description" label="Description" min-width="200" show-overflow-tooltip />
      <el-table-column label="Updated" width="120">
        <template #default="{ row }">{{ formatDate(row.updatedAt) }}</template>
      </el-table-column>
      <el-table-column label="Actions" width="140" fixed="right">
        <template #default="{ row }">
          <el-button size="small" text type="primary" @click.stop="store.openEditDialog(row)">Edit</el-button>
          <el-button size="small" text type="danger" @click.stop="store.handleDelete(row)">Del</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Detail Drawer -->
    <el-drawer
      v-model="store.panelVisible"
      :title="store.selectedStory?.name ?? 'Detail'"
      size="600px"
      @close="store.closePanel()"
    >
      <div v-if="store.selectedStory" class="sb-detail">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="Status"><StoryStatusBadge :status="store.selectedStory.status" /></el-descriptions-item>
          <el-descriptions-item label="Project">{{ store.selectedStory.project || "-" }}</el-descriptions-item>
          <el-descriptions-item label="Created">{{ formatDate(store.selectedStory.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="Updated">{{ formatDate(store.selectedStory.updatedAt) }}</el-descriptions-item>
          <el-descriptions-item label="Files">{{ store.selectedStory.files?.length || 0 }}</el-descriptions-item>
          <el-descriptions-item label="Deps">{{ store.selectedStory.dependencies?.length || 0 }}</el-descriptions-item>
        </el-descriptions>

        <h4 class="sd-section">Description</h4>
        <p class="sd-text">{{ store.selectedStory.description || "No description" }}</p>

        <h4 class="sd-section">Tags</h4>
        <div class="sd-tags">
          <el-tag v-for="t in store.selectedStory.tags" :key="t" size="small">{{ t }}</el-tag>
          <span v-if="!store.selectedStory.tags?.length" class="sd-muted">None</span>
        </div>

        <h4 class="sd-section">Files</h4>
        <div v-if="store.selectedStory.files?.length" class="sd-files">
          <div v-for="f in store.selectedStory.files" :key="f.filePath" class="sd-file">
            <span>{{ f.fileName }}</span>
            <span class="sd-muted">{{ formatDate(f.updatedAt) }}</span>
          </div>
        </div>
        <span v-else class="sd-muted">No files</span>

        <h4 class="sd-section">Dependencies</h4>
        <div v-if="store.selectedStory.dependencies?.length" class="sd-deps">
          <div v-for="d in store.selectedStory.dependencies" :key="d.directory" class="sd-dep">
            <span>{{ d.directory }}</span>
            <el-tag size="small" type="warning">{{ d.relation }}</el-tag>
          </div>
        </div>
        <span v-else class="sd-muted">No dependencies</span>

        <div class="sd-actions">
          <el-button
            type="primary"
            @click="
              store.openEditDialog(store.selectedStory!);
              store.closePanel();
            "
            >Edit</el-button
          >
          <el-button
            type="danger"
            @click="
              store.handleDelete(store.selectedStory!);
              store.closePanel();
            "
            >Delete</el-button
          >
        </div>
      </div>
    </el-drawer>

    <!-- Create/Edit Dialog -->
    <el-dialog v-model="store.dialogVisible" :title="store.isEdit ? 'Edit Story' : 'New Story'" width="520px" destroy-on-close>
      <el-form label-width="100px">
        <el-form-item label="Name" required>
          <el-input v-model="store.form.name" placeholder="Story name" />
        </el-form-item>
        <el-form-item label="Project">
          <el-input v-model="store.form.project" placeholder="Project name" />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="store.form.status" style="width: 100%">
            <el-option v-for="s in statusOrder" :key="s" :label="statusLabels[s]" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="store.form.description" type="textarea" :rows="3" placeholder="Description" />
        </el-form-item>
        <el-form-item label="Tags">
          <el-select
            v-model="store.form.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="Add tags"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="store.dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="store.saving" @click="store.handleSave()">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.story-board {
  padding: 16px;
}

.sb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.sb-header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.sb-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.sb-count {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
.sb-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sb-dims {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
  padding: 10px 14px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  flex-wrap: wrap;
}
.sb-dim {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sb-dim-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.sb-dim-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sb-range-sep {
  color: var(--el-text-color-placeholder);
}

.sb-group {
  margin-bottom: 24px;
}
.sb-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 16px;
}
.sb-group-count {
  color: var(--el-text-color-secondary);
  font-weight: normal;
}

.sb-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}

.sb-card {
  cursor: pointer;
  transition: transform 0.15s;
}
.sb-card:hover {
  transform: translateY(-2px);
}

.sc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.sc-name {
  font-size: 15px;
  font-weight: 600;
}
.sc-actions {
  display: flex;
  gap: 2px;
}
.sc-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.sc-date {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.sc-desc {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}
.sc-footer {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.sb-detail {
  padding: 0 4px;
}
.sd-section {
  margin: 20px 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.sd-text {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}
.sd-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.sd-muted {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}
.sd-files {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 240px;
  overflow-y: auto;
}
.sd-file {
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
}
.sd-file:hover {
  background: var(--el-fill-color-light);
}
.sd-deps {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sd-dep {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  font-size: 13px;
}
.sd-actions {
  margin-top: 24px;
  display: flex;
  gap: 8px;
}
</style>
