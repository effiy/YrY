<template>
  <div class="harness-overview" v-loading="loading">
    <!-- ═══ Header ═══ -->
    <div class="ho__header">
      <div class="ho__header-title">
        <h1 class="ho__title">{{ t("home.title") }}</h1>
      </div>
      <div class="ho__header-actions">
        <span class="ho__updated" v-if="lastUpdated">{{ t("home.updated", { time: lastUpdated }) }}</span>
        <span class="ho__clock">{{ clock }}</span>
        <el-button size="small" type="primary" :icon="ChatDotRound" @click="router.push('/aiChat')">
          {{ t("home.aiChat") }}
        </el-button>
        <el-button size="small" :icon="Aim" @click="router.push('/executiver/okr')">
          {{ t("home.okr") }}
        </el-button>
        <el-button size="small" :icon="Connection" @click="router.push('/executiver/rss')">
          {{ t("home.rss") }}
        </el-button>
        <el-button size="small" :icon="Reading" @click="router.push('/knowledge/pipeline')">
          {{ t("home.knowledge") }}
        </el-button>
        <el-button size="small" :icon="MagicStick" @click="router.push('/skills')">
          {{ t("home.skills") }}
        </el-button>
      </div>
    </div>

    <!-- ═══ Project landscape ═══ -->
    <section class="ho__section">
      <div class="ho__projects">
        <div
          v-for="p in projects"
          :key="p.key"
          class="ho__project"
          :class="{ 'is-active': selectedProjects.includes(p.key.toLowerCase()) }"
          @click="toggleProject(p.key)"
        >
          <span class="ho__project-icon">{{ p.icon }}</span>
          <div class="ho__project-body">
            <div class="ho__project-name">
              {{ t(`home.projects.${p.key}.name`) }}
              <span v-if="!p.to" class="ho__project-current">{{ t("home.status.ready") }}</span>
            </div>
            <div class="ho__project-role">{{ t(`home.projects.${p.key}.role`) }}</div>
          </div>
          <span class="ho__dot" :class="`is-${p.status}`" :title="dotTitle(p.status)"></span>
        </div>
      </div>
    </section>

    <!-- ═══ AI 自主推荐 OKR 任务清单 (deepseek-harness todo/ capability) ═══ -->
    <section class="ho__section">
      <OkrRecommendPanel :projects="selectedProjects" />
    </section>
  </div>
</template>

<script setup lang="ts" name="home">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ChatDotRound, Connection, Reading, Aim, MagicStick } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import OkrRecommendPanel from "@/components/OkrRecommend/OkrRecommendPanel.vue";
import { getDashboardHealth } from "@/api/modules/dashboard";
import type { DashboardHealthData } from "@/api/interface/yiweb";

const { t } = useI18n();
const router = useRouter();

// ═══════════════════════════════════════════════
// Live data
// ═══════════════════════════════════════════════
const health = ref<DashboardHealthData | null>(null);
const loading = ref(true);
const lastUpdated = ref("");

type Status = "ok" | "warn" | "off";
const STATUS_LABEL: Record<Status, string> = { ok: "online", warn: "disconnected", off: "offline" };
const dotTitle = (s: Status) => t(`home.status.${STATUS_LABEL[s]}`);

/** 当前联动选中的项目 id 集合（小写，如 "yiai"）；空数组 = 展示全部。 */
const selectedProjects = ref<string[]>([]);

/** 点击项目卡片：切换该项目的表格筛选（支持多选，再点一次取消该项）。 */
function toggleProject(key: string) {
  const id = key.toLowerCase();
  const i = selectedProjects.value.indexOf(id);
  if (i === -1) selectedProjects.value.push(id);
  else selectedProjects.value.splice(i, 1);
}

async function fetchData() {
  loading.value = true;
  try {
    const res = await getDashboardHealth();
    health.value = res.data;
  } catch {
    // 保留上一次的值
  }
  lastUpdated.value = dayjs().format("HH:mm:ss");
  loading.value = false;
}

// ═══════════════════════════════════════════════
// Clock
// ═══════════════════════════════════════════════
const now = ref(Date.now());
const clock = computed(() => dayjs(now.value).format("YYYY-MM-DD HH:mm:ss"));

// ═══════════════════════════════════════════════
// Projects
// ═══════════════════════════════════════════════
/** 服务连接状态 → 展示状态：已连接 ok；未连接时健康数据已返回为 warn，尚未返回（首屏/失败）为 off。 */
const toStatus = (connected: boolean, hasHealth: boolean): Status =>
  connected ? "ok" : hasHealth ? "warn" : "off";

const projects = computed(() => {
  const h = health.value;
  const hasHealth = !!h;
  return [
    { key: "yiAi", icon: "🤖", to: "/aiChat", status: toStatus(!!h?.ollama?.connected, hasHealth) },
    { key: "yiVad", icon: "🖥️", to: "/executiver/okr", status: toStatus(!!h?.server?.running, hasHealth) },
    { key: "yiPet", icon: "🧩", to: "/executiver/rss", status: "off" as Status },
    { key: "yiKnowledge", icon: "📚", to: "/knowledge/goals", status: toStatus(!!h?.mongodb?.connected, hasHealth) }
  ];
});

// ═══════════════════════════════════════════════
// Lifecycle
// ═══════════════════════════════════════════════
let clockTimer: ReturnType<typeof setInterval> | null = null;
let refreshTimer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  fetchData();
  clockTimer = setInterval(() => {
    now.value = Date.now();
  }, 1000);
  refreshTimer = setInterval(fetchData, 30_000);
});

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer);
  if (refreshTimer) clearInterval(refreshTimer);
});
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
.ho__header-title { display: flex; flex-direction: column; gap: 2px; }
.ho__title { margin: 0; font-size: 22px; font-weight: 700; }
.ho__header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.ho__updated { font-size: 12px; color: var(--el-text-color-placeholder); }
.ho__clock { font-size: 13px; font-weight: 600; color: var(--el-text-color-secondary); font-family: monospace; }

// ── Section ────────────────────────────────────
.ho__section { margin-bottom: 22px; }

// ── Status dot ─────────────────────────────────
.ho__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
  &.is-ok { background: var(--el-color-success); box-shadow: 0 0 0 3px var(--el-color-success-light-8); }
  &.is-warn { background: var(--el-color-warning); box-shadow: 0 0 0 3px var(--el-color-warning-light-8); }
  &.is-off { background: var(--el-color-info); opacity: 0.5; }
}

// ── Projects ───────────────────────────────────
.ho__projects {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}
.ho__project {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
  &.is-active {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    box-shadow: 0 0 0 2px var(--el-color-primary-light-7);
  }
}
.ho__project-icon { font-size: 26px; flex-shrink: 0; }
.ho__project-body { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
.ho__project-name { font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.ho__project-current {
  font-size: 10px;
  font-weight: 600;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 1px 6px;
  border-radius: 4px;
}
.ho__project-role {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}
</style>
