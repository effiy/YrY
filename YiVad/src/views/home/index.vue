<template>
  <div class="harness-overview">
    <!-- ═══ Header ═══ -->
    <div class="ho__header">
      <!-- ═══ 角色筛选（联动下方任务表格）═══ -->
      <section class="ho__section">
        <div class="ho__role-nav">
          <RoleNav v-model="selectedRoles" multiple all :counts="roleCounts" />
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
      <OkrRecommendPanel :roles="selectedRoles" @update:counts="roleCounts = $event" />
    </section>
  </div>
</template>

<script setup lang="ts" name="home">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ChatDotRound } from "@element-plus/icons-vue";
import OkrRecommendPanel from "@/components/OkrRecommend/OkrRecommendPanel.vue";
import RoleNav from "@/views/knowledge/components/RoleNav.vue";

const { t } = useI18n();
const router = useRouter();

/** 当前联动选中的角色 id 集合（如 ["engineer"]）；空数组 = 展示全部角色。 */
const selectedRoles = ref<string[]>([]);

/** 各角色推荐任务数量（由 OkrRecommendPanel 上报，键为角色 id / `all`），展示在角色导航角标。 */
const roleCounts = ref<Record<string, number>>({});
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
</style>
