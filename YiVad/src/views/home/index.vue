<template>
  <div class="harness-overview">
    <!-- ═══ Header ═══ -->
    <div class="ho__header">
      <!-- ═══ 角色 + 项目筛选（联动下方任务表格）═══ -->
      <section class="ho__section">
        <div class="ho__role-nav">
          <RoleNav v-model="selectedRoles" multiple all :counts="roleCounts" />
        </div>
        <div class="ho__project-nav">
          <span class="ho__role-nav-label">{{ t("home.projectFilter") }}</span>
          <el-check-tag :checked="!selectedProjects.length" @change="selectedProjects = []">All</el-check-tag>
          <el-check-tag
            v-for="p in projectStore.projects"
            :key="p.key"
            :checked="selectedProjects.includes(p.key)"
            @change="toggleProject(p.key)"
          >{{ p.name }}</el-check-tag>
        </div>
      </section>
      <div class="ho__header-actions">
        <el-button size="small" type="primary" :icon="ChatDotRound" @click="router.push('/aiChat')">
          {{ t("home.aiChat") }}
        </el-button>
      </div>
    </div>

    <!-- ═══ AI 自主推荐 OKR 任务清单 (deepseek-harness todo/ capability) ═══ -->
    <section class="ho__section">
      <OkrRecommendPanel :roles="selectedRoles" :projects="selectedProjects" @update:counts="roleCounts = $event" />
    </section>
  </div>
</template>

<script setup lang="ts" name="home">
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ChatDotRound } from "@element-plus/icons-vue";
import OkrRecommendPanel from "@/components/OkrRecommend/OkrRecommendPanel.vue";
import RoleNav from "@/views/knowledge/components/RoleNav.vue";
import { useProjectStore } from "@/stores/modules/project";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();

/** 当前联动选中的角色 id 集合（如 ["engineer"]）；空数组 = 展示全部角色。 */
const selectedRoles = ref<string[]>([]);

/** 各角色推荐任务数量（由 OkrRecommendPanel 上报，键为角色 id / `all`），展示在角色导航角标。 */
const roleCounts = ref<Record<string, number>>({});

/** 当前联动选中的项目 key 集合（如 ["yiai"]）；空数组 = 展示全部项目。 */
const selectedProjects = ref<string[]>([]);

function toggleProject(key: string) {
  const i = selectedProjects.value.indexOf(key);
  if (i >= 0) selectedProjects.value.splice(i, 1);
  else selectedProjects.value.push(key);
}

/** 从 ?project= 查询同步预选项目（支持逗号分隔），用于项目详情页跳回的反向闭环。 */
function syncProjectFromQuery() {
  const q = route.query.project;
  if (typeof q === "string" && q.trim()) {
    const valid = new Set(projectStore.projects.map(p => p.key));
    selectedProjects.value = q.split(",").map(s => s.trim()).filter(k => valid.has(k));
  }
}

onMounted(async () => {
  await projectStore.fetchProjects();
  syncProjectFromQuery();
});

watch(() => route.query.project, () => syncProjectFromQuery());
</script>

<style scoped lang="scss">
.harness-overview {
  box-sizing: border-box;
  min-height: 100%;
  padding: 20px 24px 32px;
  background: var(--el-bg-color-page);
}

// ── Header ─────────────────────────────────────
.ho__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 22px;
}
.ho__header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

// ── Role nav ────────────────────────────────────
.ho__role-nav { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.ho__role-nav-label { font-size: 12px; font-weight: 600; color: var(--el-text-color-secondary); }

// ── Project filter ───────────────────────────────
.ho__project-nav { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
</style>
