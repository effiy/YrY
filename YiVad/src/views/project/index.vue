<template>
  <div class="project-list">
    <div class="project-list__head">
      <div class="project-list__head-left">
        <h1 class="project-list__title">Projects</h1>
        <el-tag size="small" type="info">{{ store.total }} projects</el-tag>
      </div>
      <el-select v-model="statusFilter" size="small" style="width: 130px; margin-right: 10px" @change="(v: string) => { store.fetchProjects({ status: v || undefined }); }">
        <el-option label="Active" value="active" />
        <el-option label="Archived" value="archived" />
        <el-option label="All" value="" />
      </el-select>
      <el-button :type="showStarredOnly ? 'warning' : ''" size="small" :icon="Star" style="margin-right: 10px" @click="showStarredOnly = !showStarredOnly">
        Starred
      </el-button>
      <el-button type="primary" :icon="Plus" @click="openCreate">New Project</el-button>
    </div>

    <div v-loading="store.loading" class="project-list__grid">
      <el-card
        v-for="project in displayedProjects"
        :key="project.key"
        class="project-card"
        shadow="hover"
        @click="goDetail(project.key)"
      >
        <div class="project-card__cover" :style="coverStyle(project.cover_image)">
          <span v-if="!project.cover_image" class="project-card__cover-icon">{{ avatarChar(project.name) }}</span>
        </div>
        <div class="project-card__body">
          <div class="project-card__name">
            {{ project.name }}
            <el-button
              link
              size="small"
              :icon="Star"
              :type="starredKeys.has(project.key) ? 'warning' : 'info'"
              @click.stop="toggleStar(project.key)"
              class="project-card__star"
            />
          </div>
          <div class="project-card__meta">
            <code>{{ project.identifier }}</code>
            <el-tag :type="project.status === 'active' ? 'success' : 'info'" size="small">
              {{ project.status }}
            </el-tag>
          </div>
          <div class="project-card__desc">{{ project.description || 'No description' }}</div>
          <div class="project-card__footer">
            <span class="project-card__members">{{ project.members?.length || 0 }} members</span>
            <div class="project-card__footer-right">
              <el-button
                v-if="project.status === 'active'"
                link size="small" type="warning"
                @click.stop="archiveProject(project)"
              >Archive</el-button>
              <el-button
                v-else
                link size="small" type="success"
                @click.stop="restoreProject(project)"
              >Restore</el-button>
              <span class="project-card__date">{{ formatDate(project.updated_at) }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <div v-if="!store.loading && !store.projects.length" class="project-list__empty">
        <el-empty description="No projects yet">
          <el-button type="primary" @click="openCreate">Create your first project</el-button>
        </el-empty>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? 'Edit Project' : 'New Project'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="100px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="dialog.form.name" placeholder="Project name" maxlength="80" show-word-limit />
        </el-form-item>
        <el-form-item label="Identifier" prop="identifier">
          <el-input v-model="dialog.form.identifier" placeholder="e.g. PLANE" maxlength="12" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="dialog.form.description" type="textarea" :rows="3" placeholder="Project description" />
        </el-form-item>
        <el-form-item label="Status">
          <el-radio-group v-model="dialog.form.status">
            <el-radio value="active">Active</el-radio>
            <el-radio value="archived">Archived</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="projectList">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Plus, Star } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useProjectStore } from "@/stores/modules/project";
import { formatDate } from "@/utils/datetime";
import type { Project, ProjectMember } from "@/api/modules/projectService";

const router = useRouter();
const store = useProjectStore();
const formRef = ref<FormInstance>();
const statusFilter = ref("");
const showStarredOnly = ref(false);

const starredKeys = ref<Set<string>>(new Set(JSON.parse(localStorage.getItem("starred_projects") || "[]")));

function toggleStar(projectKey: string) {
  if (starredKeys.value.has(projectKey)) {
    starredKeys.value.delete(projectKey);
  } else {
    starredKeys.value.add(projectKey);
  }
  localStorage.setItem("starred_projects", JSON.stringify([...starredKeys.value]));
}

const displayedProjects = computed(() => {
  if (!showStarredOnly.value) return store.projects;
  return store.projects.filter(p => starredKeys.value.has(p.key));
});

watch(() => store.projects, (projects) => {
  const keys = new Set(projects.map(p => p.key));
  let changed = false;
  for (const k of starredKeys.value) {
    if (!keys.has(k)) { starredKeys.value.delete(k); changed = true; }
  }
  if (changed) localStorage.setItem("starred_projects", JSON.stringify([...starredKeys.value]));
});

const rules: FormRules = {
  name: [{ required: true, message: "Project name is required", trigger: "blur" }],
  identifier: [
    { required: true, message: "Identifier is required", trigger: "blur" },
    { pattern: /^[A-Z][A-Z0-9_]{0,11}$/, message: "Uppercase letters, digits, underscores only", trigger: "blur" }
  ]
};

interface ProjectForm {
  name: string;
  identifier: string;
  description: string;
  status: "active" | "archived";
  members: ProjectMember[];
  cover_image: string;
}

const dialog = reactive({
  visible: false,
  isEdit: false,
  submitting: false,
  editKey: "",
  form: {
    name: "",
    identifier: "",
    description: "",
    status: "active" as const,
    members: [] as ProjectMember[],
    cover_image: ""
  } as ProjectForm
});

function openCreate() {
  dialog.isEdit = false;
  dialog.editKey = "";
  dialog.form = { name: "", identifier: "", description: "", status: "active", members: [] as ProjectMember[], cover_image: "" };
  dialog.visible = true;
}

function openEdit(project: Project) {
  dialog.isEdit = true;
  dialog.editKey = project.key;
  dialog.form = {
    name: project.name,
    identifier: project.identifier,
    description: project.description || "",
    status: project.status,
    members: project.members || [],
    cover_image: project.cover_image || ""
  };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    if (dialog.isEdit) {
      await store.editProject(dialog.editKey, {
        name: dialog.form.name,
        identifier: dialog.form.identifier,
        description: dialog.form.description,
        status: dialog.form.status
      });
      ElMessage.success("Project updated");
    } else {
      const key = dialog.form.identifier.toLowerCase() + "-" + Date.now().toString(36);
      await store.addProject({
        key,
        name: dialog.form.name,
        identifier: dialog.form.identifier,
        description: dialog.form.description,
        status: dialog.form.status,
        members: [{ user_id: "admin", username: "Admin", role: "owner" }],
        cover_image: dialog.form.cover_image
      });
      ElMessage.success("Project created");
    }
    dialog.visible = false;
  } finally {
    dialog.submitting = false;
  }
}

function goDetail(key: string) {
  router.push(`/project/${key}`);
}

function avatarChar(name: string) {
  return name.charAt(0).toUpperCase();
}

function coverStyle(cover?: string) {
  return cover ? { backgroundImage: `url(${cover})`, backgroundSize: "cover" } : {};
}

async function archiveProject(project: Project) {
  await store.editProject(project.key, { status: "archived" });
  ElMessage.success(`"${project.name}" archived`);
}

async function restoreProject(project: Project) {
  await store.editProject(project.key, { status: "active" });
  ElMessage.success(`"${project.name}" restored`);
}

onMounted(() => {
  store.fetchProjects();
});
</script>

<style scoped lang="scss">
.project-list {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.project-list__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.project-list__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.project-list__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
.project-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.project-card {
  cursor: pointer;
  transition: transform 0.15s;
  &:hover {
    transform: translateY(-2px);
  }
  :deep(.el-card__body) {
    padding: 0;
  }
}
.project-card__cover {
  height: 120px;
  background: linear-gradient(135deg, var(--el-color-primary-light-5), var(--el-color-primary));
  display: flex;
  align-items: center;
  justify-content: center;
}
.project-card__cover-icon {
  font-size: 48px;
  font-weight: 700;
  color: #fff;
  opacity: 0.8;
}
.project-card__body {
  padding: 16px;
}
.project-card__name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.project-card__star {
  opacity: 0.4;
  &:hover { opacity: 1; }
}
.project-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  code {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
    padding: 1px 6px;
    border-radius: 3px;
  }
}
.project-card__desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.project-card__footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  align-items: center;
}
.project-card__footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.project-list__empty {
  grid-column: 1 / -1;
  padding: 60px 0;
}
</style>