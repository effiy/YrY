<template>
  <div class="rss-overview">
    <div class="rss-overview__head">
      <RoleNav v-model="selectedRoles" multiple all :counts="roleCounts" />
    </div>

    <div class="rss-overview__grid">
      <div
        v-for="rid in filteredRoles"
        :key="rid"
        class="rss-overview__card"
        @click="$router.push('/knowledge/executive/rssManager')"
      >
        <div class="rss-overview__card-accent" :style="{ background: roleColor(rid) }" />
        <div class="rss-overview__card-body">
          <div class="rss-overview__card-head">
            <span class="rss-overview__card-icon">{{ rolesData[rid].icon }}</span>
            <span class="rss-overview__card-name">{{ rolesData[rid].name }}</span>
            <span class="rss-overview__card-arrow">→</span>
          </div>
          <p class="rss-overview__card-desc">{{ rolesData[rid].description }}</p>
          <div class="rss-overview__card-stats">
            <div class="rss-overview__card-stat">
              <span class="rss-overview__card-stat-val">{{ roleStats[rid]?.feeds ?? "..." }}</span>
              <span class="rss-overview__card-stat-lbl">Feeds</span>
            </div>
            <div class="rss-overview__card-stat">
              <span class="rss-overview__card-stat-val">{{ roleStats[rid]?.articles ?? "..." }}</span>
              <span class="rss-overview__card-stat-lbl">Articles</span>
            </div>
            <div class="rss-overview__card-stat rss-overview__card-stat--accent">
              <span class="rss-overview__card-stat-val">{{ roleStats[rid]?.today ?? "..." }}</span>
              <span class="rss-overview__card-stat-lbl">Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!filteredRoles.length" class="rss-overview__empty">
      <span class="rss-overview__empty-icon">📡</span>
      <p class="rss-overview__empty-title">No roles selected</p>
      <p class="rss-overview__empty-hint">Select roles above to view their RSS feeds and articles.</p>
    </div>
  </div>
</template>

<script setup lang="ts" name="rssOverview">
import { ref, reactive, computed, onMounted } from "vue";
import { getSeedList, getRssList, type RssSeedDocument } from "@/api/modules/rssService";
import RoleNav from "@/views/knowledge/components/RoleNav.vue";
import { ROLE_IDS, rolesData, roleColor } from "@/views/knowledge/executive/okrData";

const selectedRoles = ref<string[]>([]);

const roleStats = reactive<Record<string, { feeds: number; articles: number; today: number }>>({});
const roleCounts = ref<Record<string, number>>({ all: 0 });

const filteredRoles = computed(() => {
  if (!selectedRoles.value.length) return [...ROLE_IDS];
  return ROLE_IDS.filter(r => selectedRoles.value.includes(r));
});

async function loadStats() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  let totalArticles = 0;

  const promises = ROLE_IDS.map(async rid => {
    try {
      const [seedRes, articleRes, todayRes] = await Promise.all([
        getSeedList(),
        getRssList({ categoryPrefix: rid, pageSize: 1 }),
        getRssList({ categoryPrefix: rid, pageSize: 1, publishedStart: todayStart.getTime(), publishedEnd: todayEnd.getTime() })
      ]);
      const seeds = (seedRes.data?.list ?? []).filter((s: RssSeedDocument) => {
        const cat = s.category || "";
        return cat.startsWith(rid + "/") || cat === rid;
      });
      roleStats[rid] = {
        feeds: seeds.length,
        articles: articleRes.data?.total ?? 0,
        today: todayRes.data?.total ?? 0
      };
      totalArticles += roleStats[rid].articles;
    } catch {
      roleStats[rid] = { feeds: 0, articles: 0, today: 0 };
    }
  });
  await Promise.all(promises);
  roleCounts.value = {
    ...ROLE_IDS.reduce((acc, rid) => ({ ...acc, [rid]: roleStats[rid]?.articles ?? 0 }), {} as Record<string, number>),
    all: totalArticles
  };
}

onMounted(loadStats);
</script>

<style scoped lang="scss">
.rss-overview {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 95px);
  min-height: 0;
  padding: 24px;
  overflow: auto;
  background: var(--el-bg-color-page);
}
.rss-overview__head {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}
.rss-overview__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 14px;
}
.rss-overview__card {
  display: flex;
  overflow: hidden;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition:
    box-shadow 0.2s,
    border-color 0.2s,
    transform 0.2s;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 4px 16px rgb(0 0 0 / 8%);
    transform: translateY(-2px);
  }
}
.rss-overview__card-accent {
  flex-shrink: 0;
  width: 4px;
}
.rss-overview__card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding: 18px 20px;
}
.rss-overview__card-head {
  display: flex;
  gap: 8px;
  align-items: center;
}
.rss-overview__card-icon {
  font-size: 22px;
}
.rss-overview__card-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}
.rss-overview__card-arrow {
  margin-left: auto;
  font-size: 16px;
  color: var(--el-text-color-placeholder);
  transition:
    color 0.2s,
    transform 0.2s;
  .rss-overview__card:hover & {
    color: var(--el-color-primary);
    transform: translateX(3px);
  }
}
.rss-overview__card-desc {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  -webkit-line-clamp: 2;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  -webkit-box-orient: vertical;
}
.rss-overview__card-stats {
  display: flex;
  gap: 8px;
}
.rss-overview__card-stat {
  display: flex;
  flex-direction: column;
  gap: 1px;
  align-items: center;
  min-width: 56px;
  padding: 6px 14px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}
.rss-overview__card-stat--accent {
  background: var(--el-color-primary-light-9);
}
.rss-overview__card-stat-val {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--el-text-color-primary);
}
.rss-overview__card-stat--accent .rss-overview__card-stat-val {
  color: var(--el-color-primary);
}
.rss-overview__card-stat-lbl {
  font-size: 10px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.rss-overview__empty {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  color: var(--el-text-color-secondary);
}
.rss-overview__empty-icon {
  font-size: 48px;
}
.rss-overview__empty-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.rss-overview__empty-hint {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}
</style>
