<script setup lang="ts" name="claudePanel">
import { ref, computed, onMounted } from "vue";
import { getSessions } from "@/api/modules/sessions";

interface ClaudeProject {
  name: string;
  skillCount: number;
  agentCount: number;
  fileCount: number;
  hasReadmeMd: boolean;
  hasClaudeMd: boolean;
  hasSettings: boolean;
  hasMemory: boolean;
  hasHooks: boolean;
  hasRules: boolean;
  hasTemplates: boolean;
  files: { filePath: string; fileName: string; updatedAt: number }[];
  lastModified: number;
}

const activeTab = ref<"docs" | "projects">("projects");
const projects = ref<ClaudeProject[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref("");
const selectedProject = ref<ClaudeProject | null>(null);
const detailVisible = ref(false);

const filteredProjects = computed(() => {
  let result = projects.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(q));
  }
  return result;
});

const totalSkills = computed(() => projects.value.reduce((s, p) => s + p.skillCount, 0));
const totalAgents = computed(() => projects.value.reduce((s, p) => s + p.agentCount, 0));

function showDetail(p: ClaudeProject) {
  selectedProject.value = p;
  detailVisible.value = true;
}
function formatDate(ts: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function fetchProjects() {
  loading.value = true;
  try {
    const sessions = await getSessions(100000000);
    const claudeSessions = sessions.filter(s => {
      const fp = s.file_path || s.filePath || "";
      return fp.includes("/.claude/") || fp === "CLAUDE.md";
    });
    const projectMap = new Map<string, ClaudeProject>();
    for (const s of claudeSessions) {
      const fp = s.file_path || s.filePath || "";
      const projName = fp.split("/")[0] || "unknown";
      if (!projectMap.has(projName))
        projectMap.set(projName, {
          name: projName,
          skillCount: 0,
          agentCount: 0,
          fileCount: 0,
          hasReadmeMd: false,
          hasClaudeMd: false,
          hasSettings: false,
          hasMemory: false,
          hasHooks: false,
          hasRules: false,
          hasTemplates: false,
          files: [],
          lastModified: 0
        });
      const p = projectMap.get(projName)!;
      p.fileCount++;
      p.lastModified = Math.max(p.lastModified, s.updatedAt || 0);
      p.files.push({ filePath: fp, fileName: fp.split("/").pop() || "", updatedAt: s.updatedAt || 0 });
      if (fp.includes("README.md")) p.hasReadmeMd = true;
      if (fp.includes("CLAUDE.md")) p.hasClaudeMd = true;
      if (fp.includes("settings.json")) p.hasSettings = true;
      if (fp.includes("/memory/")) p.hasMemory = true;
      if (fp.includes("/hooks/")) p.hasHooks = true;
      if (fp.includes("/rules/")) p.hasRules = true;
      if (fp.includes("/templates/")) p.hasTemplates = true;
    }
    // Count unique skill/agent dirs
    for (const [, p] of projectMap) {
      const sd = new Set<string>();
      const ad = new Set<string>();
      for (const f of p.files) {
        const ms = f.filePath.match(/\/skills\/([^/]+)/);
        if (ms) sd.add(ms[1]);
        const ma = f.filePath.match(/\/agents\/([^/]+)/);
        if (ma) ad.add(ma[1]);
      }
      p.skillCount = sd.size;
      p.agentCount = ad.size;
    }
    projects.value = [...projectMap.values()].sort((a, b) => b.lastModified - a.lastModified);
  } catch (e: any) {
    error.value = e?.message || "Failed to load";
  } finally {
    loading.value = false;
  }
}

onMounted(() => fetchProjects());
</script>

<template>
  <div class="claude-panel">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="Claude Projects" name="projects" />
      <el-tab-pane label="Claude Docs" name="docs" />
    </el-tabs>
    <div v-if="activeTab === 'docs'" class="docs-wrapper">
      <iframe src="https://code.claude.com/docs/en/claude-directory" frameborder="0" class="docs-iframe" />
    </div>
    <div v-else class="projects-tab">
      <div class="stats-bar" v-if="!loading && !error">
        <div class="stat-item">
          <span class="stat-value">{{ projects.length }}</span
          ><span class="stat-label">Projects</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ totalSkills }}</span
          ><span class="stat-label">Skills</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ totalAgents }}</span
          ><span class="stat-label">Agents</span>
        </div>
      </div>
      <el-input v-model="searchQuery" placeholder="Search projects..." clearable size="small" class="search-input" />
      <el-skeleton v-if="loading" :rows="4" animated />
      <el-alert v-else-if="error" :title="error" type="error" show-icon />
      <div v-else class="project-cards">
        <el-card v-for="p in filteredProjects" :key="p.name" class="project-card" shadow="hover" @click="showDetail(p)">
          <div class="pc-header">
            <span class="pc-name">{{ p.name }}</span
            ><el-tag :type="p.hasClaudeMd ? 'success' : 'warning'" size="small">{{ p.hasClaudeMd ? "✓" : "?" }}</el-tag>
          </div>
          <div class="pc-stats">
            <span class="pc-stat">{{ p.skillCount }} Skills</span><span class="pc-stat">{{ p.agentCount }} Agents</span
            ><span class="pc-stat">{{ p.fileCount }} Files</span>
          </div>
          <div class="pc-flags">
            <span :class="['pc-flag', p.hasReadmeMd ? 'on' : 'off']">README</span
            ><span :class="['pc-flag', p.hasSettings ? 'on' : 'off']">settings</span
            ><span :class="['pc-flag', p.hasMemory ? 'on' : 'off']">Memory</span>
          </div>
          <div class="pc-footer">{{ formatDate(p.lastModified) }}</div>
        </el-card>
      </div>
    </div>
    <el-drawer v-model="detailVisible" :title="selectedProject?.name ?? 'Detail'" size="550px">
      <div v-if="selectedProject">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="Skills">{{ selectedProject.skillCount }}</el-descriptions-item>
          <el-descriptions-item label="Agents">{{ selectedProject.agentCount }}</el-descriptions-item>
          <el-descriptions-item label="Files">{{ selectedProject.fileCount }}</el-descriptions-item>
          <el-descriptions-item label="Updated">{{ formatDate(selectedProject.lastModified) }}</el-descriptions-item>
        </el-descriptions>
        <h4 style="margin: 16px 0 8px">Files</h4>
        <div
          v-for="f in selectedProject.files.slice(0, 50)"
          :key="f.filePath"
          style="padding: 4px 8px; font-size: 13px; display: flex; justify-content: space-between"
        >
          <span style="color: var(--el-color-primary)">{{ f.fileName }}</span
          ><span style="color: var(--el-text-color-secondary); font-size: 11px">{{ f.filePath }}</span>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.claude-panel {
  padding: 16px;
}
.docs-wrapper {
  width: 100%;
  height: calc(100vh - 160px);
}
.docs-iframe {
  width: 100%;
  height: 100%;
}
.stats-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--el-color-primary);
}
.stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.search-input {
  width: 300px;
  margin-bottom: 12px;
}
.project-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}
.project-card {
  cursor: pointer;
  transition: transform 0.15s;
}
.project-card:hover {
  transform: translateY(-2px);
}
.pc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.pc-name {
  font-size: 16px;
  font-weight: 600;
}
.pc-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.pc-flags {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}
.pc-flag {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
}
.pc-flag.on {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
}
.pc-flag.off {
  background: var(--el-fill-color);
  color: var(--el-text-color-placeholder);
}
.pc-footer {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
