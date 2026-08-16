<template>
  <div class="harness-overview">
    <!-- ═══ Header ═══ -->
    <div class="ho__header">
      <div class="ho__header-title">
        <h1 class="ho__title">{{ t("home.title") }}</h1>
      </div>
      <div class="ho__header-actions">
        <span class="ho__clock">{{ clock }}</span>
        <el-button size="small" :icon="Reading" @click="router.push('/knowledge/pipeline')">
          {{ t("home.knowledge") }}
        </el-button>
        <el-button size="small" :icon="Aim" @click="router.push('/executiver/okr')">
          {{ t("home.okr") }}
        </el-button>
        <el-button size="small" type="primary" :icon="ChatDotRound" @click="router.push('/aiChat')">
          {{ t("home.aiChat") }}
        </el-button>
      </div>
    </div>

    <!-- ═══ 角色筛选（联动下方任务表格）═══ -->
    <section class="ho__section">
      <div class="ho__role-nav">
        <RoleNav v-model="selectedRoles" multiple all />
      </div>
    </section>

    <!-- ═══ AI 自主推荐 OKR 任务清单 (deepseek-harness todo/ capability) ═══ -->
    <section class="ho__section">
      <OkrRecommendPanel :roles="selectedRoles" />
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
import RoleNav from "@/views/knowledge/components/RoleNav.vue";

const { t } = useI18n();
const router = useRouter();

/** 当前联动选中的角色 id 集合（如 ["engineer"]）；空数组 = 展示全部角色。 */
const selectedRoles = ref<string[]>([]);

// ═══════════════════════════════════════════════
// Clock
// ═══════════════════════════════════════════════
const now = ref(Date.now());
const clock = computed(() => dayjs(now.value).format("YYYY-MM-DD HH:mm:ss"));

// ═══════════════════════════════════════════════
// Lifecycle
// ═══════════════════════════════════════════════
let clockTimer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  clockTimer = setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer);
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
.ho__clock { font-size: 13px; font-weight: 600; color: var(--el-text-color-secondary); font-family: monospace; }

// ── Section ────────────────────────────────────
.ho__section { margin-bottom: 22px; }

// ── Role nav ────────────────────────────────────
.ho__role-nav { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.ho__role-nav-label { font-size: 12px; font-weight: 600; color: var(--el-text-color-secondary); }
</style>
