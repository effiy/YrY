<template>
  <div class="claude-skills" v-loading="loading">
    <!-- Header -->
    <header class="claude-skills__header">
      <div>
        <h1>🤖 Claude Skills</h1>
        <p>Browse, learn, and manage the <code>.claude/skills/</code> registry. {{ skills.length }} skills available via <code>/</code> commands.</p>
      </div>
      <div class="claude-skills__header-actions">
        <el-button :icon="Refresh" @click="loadSkills" :loading="loading">Refresh</el-button>
        <el-button type="primary" :icon="Plus" @click="createSkill">New Skill</el-button>
      </div>
    </header>

    <el-divider />

    <!-- Search & Filter -->
    <div class="claude-skills__toolbar">
      <el-input
        v-model="search"
        placeholder="Search skills by name or description..."
        :prefix-icon="Search"
        clearable
        class="claude-skills__search"
      />
      <el-select v-model="categoryFilter" placeholder="All Categories" clearable class="claude-skills__filter">
        <el-option label="All Categories" value="" />
        <el-option label="Code (Framework/Language)" value="code" />
        <el-option label="Tools (Operations)" value="tools" />
        <el-option label="Init (Pipeline)" value="init" />
        <el-option label="Other" value="other" />
      </el-select>
    </div>

    <!-- Stats bar -->
    <div class="claude-skills__stats">
      <span v-for="s in stats" :key="s.label" class="claude-skills__stat">
        <strong>{{ s.value }}</strong> {{ s.label }}
      </span>
    </div>

    <!-- Skill Cards Grid -->
    <div class="claude-skills__grid" v-if="filteredSkills.length > 0">
      <el-card
        v-for="skill in filteredSkills"
        :key="skill.name"
        class="claude-skills__card"
        shadow="hover"
      >
        <div class="claude-skills__card-head">
          <span class="claude-skills__card-icon">{{ categoryIcon(skill.category) }}</span>
          <div class="claude-skills__card-badges">
            <el-tag size="small" :type="categoryTagType(skill.category)">{{ skill.category }}</el-tag>
            <el-tag v-if="skill.size" size="small" type="info">{{ formatSize(skill.size) }}</el-tag>
          </div>
        </div>
        <h2 class="claude-skills__card-name">{{ skill.name }}</h2>
        <p class="claude-skills__card-desc">{{ skill.description }}</p>
        <div class="claude-skills__card-meta">
          <span class="claude-skills__card-path" :title="skill.filePath">📂 {{ skill.filePath }}</span>
        </div>
        <div class="claude-skills__card-actions">
          <el-button size="small" :icon="View" @click="viewSkill(skill.name)">View</el-button>
          <el-button size="small" :icon="Edit" type="primary" @click="editSkill(skill.name)">Edit</el-button>
          <el-button size="small" :icon="Delete" type="danger" @click="confirmDelete(skill)">Delete</el-button>
        </div>
      </el-card>
    </div>

    <!-- Empty state -->
    <el-empty v-else description="No skills match your search" />

    <!-- Create dialog -->
    <el-dialog v-model="createDialogVisible" title="New Claude Skill" width="500px">
      <el-form :model="newSkill" label-width="100px">
        <el-form-item label="Name" required>
          <el-input v-model="newSkill.name" placeholder="e.g. my-skill" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="newSkill.description" type="textarea" :rows="2" placeholder="Brief description..." />
        </el-form-item>
        <el-form-item label="Category">
          <el-select v-model="newSkill.category">
            <el-option label="Code" value="code" />
            <el-option label="Tools" value="tools" />
            <el-option label="Other" value="other" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="doCreateSkill" :loading="creating">Create</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="claudeSkillsList">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Search, Refresh, Plus, View, Edit, Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  listClaudeSkills,
  deleteClaudeSkill,
  createClaudeSkill,
  type ClaudeSkillMeta
} from "@/api/modules/claudeService";

const router = useRouter();

// ── State ──────────────────────────────────────────────────────────────────
const skills = ref<ClaudeSkillMeta[]>([]);
const loading = ref(false);
const search = ref("");
const categoryFilter = ref("");
const createDialogVisible = ref(false);
const creating = ref(false);
const newSkill = ref({ name: "", description: "", category: "code" as ClaudeSkillMeta["category"] });

// ── Computed ────────────────────────────────────────────────────────────────
const filteredSkills = computed(() => {
  let list = skills.value;
  if (search.value) {
    const q = search.value.toLowerCase();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }
  if (categoryFilter.value) {
    list = list.filter((s) => s.category === categoryFilter.value);
  }
  return list;
});

const stats = computed(() => [
  { label: "Total", value: skills.value.length },
  { label: "Code", value: skills.value.filter((s) => s.category === "code").length },
  { label: "Tools", value: skills.value.filter((s) => s.category === "tools").length },
  { label: "Init", value: skills.value.filter((s) => s.category === "init").length }
]);

// ── Helpers ─────────────────────────────────────────────────────────────────
function categoryIcon(cat: string): string {
  const icons: Record<string, string> = { code: "📦", tools: "🔧", init: "🚀", other: "📄" };
  return icons[cat] || "📄";
}

function categoryTagType(cat: string): "" | "success" | "warning" | "info" | "danger" {
  const types: Record<string, string> = { code: "success", tools: "warning", init: "danger", other: "info" };
  return (types[cat] || "info") as any;
}

function formatSize(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Actions ─────────────────────────────────────────────────────────────────
async function loadSkills() {
  loading.value = true;
  try {
    skills.value = await listClaudeSkills();
  } catch (err: any) {
    ElMessage.error(`Failed to load skills: ${err.message}`);
    skills.value = [];
  } finally {
    loading.value = false;
  }
}

function viewSkill(name: string) {
  router.push(`/brd/claude/detail/${name}`);
}

function editSkill(name: string) {
  router.push(`/brd/claude/detail/${name}?edit=1`);
}

async function confirmDelete(skill: ClaudeSkillMeta) {
  try {
    await ElMessageBox.confirm(
      `Delete skill "${skill.name}"? This will remove the entire directory:\n\n${skill.filePath}`,
      "Delete Skill",
      { confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "warning" }
    );
    await deleteClaudeSkill(skill.name);
    skills.value = skills.value.filter((s) => s.name !== skill.name);
    ElMessage.success(`Deleted skill: ${skill.name}`);
  } catch {
    // cancelled
  }
}

function createSkill() {
  newSkill.value = { name: "", description: "", category: "code" };
  createDialogVisible.value = true;
}

async function doCreateSkill() {
  if (!newSkill.value.name.trim()) {
    ElMessage.warning("Skill name is required");
    return;
  }
  creating.value = true;
  try {
    const name = newSkill.value.name.trim().toLowerCase().replace(/\s+/g, "-");
    await createClaudeSkill(name, {
      description: newSkill.value.description,
      category: newSkill.value.category
    });
    createDialogVisible.value = false;
    ElMessage.success(`Created skill: ${name}`);
    await loadSkills();
  } catch (err: any) {
    ElMessage.error(`Failed to create skill: ${err.message}`);
  } finally {
    creating.value = false;
  }
}

// ── Init ────────────────────────────────────────────────────────────────────
onMounted(loadSkills);
</script>

<style scoped lang="scss">
.claude-skills {
  height: 100%;
  padding: 20px;
  overflow: auto;
  background: var(--el-bg-color-page);
}

.claude-skills__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  h1 {
    margin: 0 0 4px;
    font-size: 22px;
  }
  p {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    code {
      font-size: 12px;
      background: var(--el-fill-color);
      padding: 1px 5px;
      border-radius: 3px;
    }
  }
}

.claude-skills__header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.claude-skills__toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.claude-skills__search {
  flex: 1;
  max-width: 420px;
}

.claude-skills__filter {
  width: 200px;
}

.claude-skills__stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.claude-skills__stat {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  strong {
    color: var(--el-color-primary);
  }
}

.claude-skills__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.claude-skills__card {
  display: flex;
  flex-direction: column;
  transition: transform 0.15s ease;
  &:hover {
    transform: translateY(-2px);
  }
}

.claude-skills__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.claude-skills__card-icon {
  font-size: 24px;
}

.claude-skills__card-badges {
  display: flex;
  gap: 6px;
}

.claude-skills__card-name {
  margin: 0 0 6px;
  font-size: 16px;
  font-family: "SF Mono", "Fira Code", monospace;
}

.claude-skills__card-desc {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.claude-skills__card-meta {
  margin-bottom: 10px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  font-family: "SF Mono", "Fira Code", monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.claude-skills__card-actions {
  display: flex;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
