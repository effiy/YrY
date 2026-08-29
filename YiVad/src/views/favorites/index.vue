<template>
  <div class="favorites">
    <div class="favorites__head">
      <h1 class="favorites__title">Favorites</h1>
      <el-tag size="small" type="info">{{ allItems.length }} items</el-tag>
    </div>

    <div v-loading="loading" class="favorites__body">
      <template v-for="section in sections" :key="section.type">
        <div v-if="section.items.length" class="favorites__section">
          <h3>{{ section.label }} ({{ section.items.length }})</h3>
          <div class="favorites__list">
            <div v-for="item in section.items" :key="item.id" class="favorites__item" @click="goTo(item.link)">
              <div class="favorites__item-icon" :style="{ background: section.color }">
                <el-icon><component :is="section.icon" /></el-icon>
              </div>
              <div class="favorites__item-content">
                <span class="favorites__item-name">{{ item.name }}</span>
                <span class="favorites__item-meta">{{ item.subtitle }}</span>
              </div>
              <el-button link size="small" :icon="StarFilled" @click.stop="unfavorite(item)" />
            </div>
          </div>
        </div>
      </template>
      <el-empty v-if="!allItems.length" description="No favorites yet">
        <span style="color: #999; font-size: 13px">Star issues, projects, cycles, releases, and modules to see them here</span>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts" name="favoritesPage">
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Tickets, Folder, Calendar, Box, Collection, WarningFilled, StarFilled } from "@element-plus/icons-vue";
import { getLabelList, deleteLabel } from "@/api/modules/labelService";

interface FavItem {
  id: string;
  name: string;
  subtitle: string;
  link: string;
  type: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  issue: { label: "Issues", icon: Tickets, color: "#409eff" },
  project: { label: "Projects", icon: Folder, color: "#5470c6" },
  cycle: { label: "Cycles", icon: Calendar, color: "#e6a23c" },
  release: { label: "Releases", icon: Box, color: "#67c23a" },
  module: { label: "Modules", icon: Collection, color: "#9b59b6" },
  bug: { label: "Bugs", icon: WarningFilled, color: "#f56c6c" },
};

const router = useRouter();
const loading = ref(false);
const items = ref<FavItem[]>([]);

const sections = computed(() => {
  const grouped: Record<string, FavItem[]> = {};
  for (const item of items.value) {
    const type = item.type || "issue";
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(item);
  }
  return Object.entries(TYPE_CONFIG)
    .map(([type, config]) => ({ type, ...config, items: grouped[type] || [] }))
    .filter(s => s.items.length > 0);
});

const allItems = computed(() => items.value);

async function loadData() {
  loading.value = true;
  try {
    const res = await getLabelList({ pageSize: 200 });
    items.value = ((res.data?.list || []) as any[])
      .filter((l: any) => l._type === "favorite")
      .map((l: any) => ({
        id: l.key, name: l.name, subtitle: l.subtitle || "",
        link: l.link || "", type: l.fav_type || "issue"
      }));
  } finally { loading.value = false; }
}

async function unfavorite(item: FavItem) {
  await deleteLabel(item.id);
  items.value = items.value.filter(i => i.id !== item.id);
}

function goTo(link: string) { router.push(link); }

onMounted(() => { loadData(); });
</script>

<style scoped lang="scss">
.favorites {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.favorites__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
.favorites__title { margin: 0; font-size: 20px; font-weight: 600; }
.favorites__section {
  margin-bottom: 24px;
  h3 { margin: 0 0 10px; font-size: 15px; }
}
.favorites__list {
  max-width: 550px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.favorites__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  &:hover { background: var(--el-fill-color-light); }
}
.favorites__item-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.favorites__item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.favorites__item-name { font-size: 14px; font-weight: 500; }
.favorites__item-meta { font-size: 12px; color: var(--el-text-color-placeholder); }
</style>