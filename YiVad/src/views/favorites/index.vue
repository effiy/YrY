<template>
  <div class="favorites">
    <div class="favorites__head">
      <h1 class="favorites__title">Favorites</h1>
      <el-tag size="small" type="info">{{ allItems.length }} items</el-tag>
    </div>

    <div v-loading="loading" class="favorites__body">
      <!-- Issues -->
      <div v-if="favIssues.length" class="favorites__section">
        <h3>Issues ({{ favIssues.length }})</h3>
        <div class="favorites__list">
          <div v-for="item in favIssues" :key="item.id" class="favorites__item" @click="goTo(item.link)">
            <div class="favorites__item-icon" style="background: #409eff"><el-icon><Tickets /></el-icon></div>
            <div class="favorites__item-content">
              <span class="favorites__item-name">{{ item.name }}</span>
              <span class="favorites__item-meta">{{ item.subtitle }}</span>
            </div>
            <el-button link size="small" :icon="StarFilled" @click.stop="unfavorite(item)" />
          </div>
        </div>
      </div>

      <!-- Projects -->
      <div v-if="favProjects.length" class="favorites__section">
        <h3>Projects ({{ favProjects.length }})</h3>
        <div class="favorites__list">
          <div v-for="item in favProjects" :key="item.id" class="favorites__item" @click="goTo(item.link)">
            <div class="favorites__item-icon" style="background: #67c23a"><el-icon><Folder /></el-icon></div>
            <div class="favorites__item-content">
              <span class="favorites__item-name">{{ item.name }}</span>
              <span class="favorites__item-meta">{{ item.subtitle }}</span>
            </div>
            <el-button link size="small" :icon="StarFilled" @click.stop="unfavorite(item)" />
          </div>
        </div>
      </div>

      <el-empty v-if="!allItems.length" description="No favorites yet">
        <span style="color: #999; font-size: 13px">Star issues and projects to see them here</span>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts" name="favoritesPage">
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Tickets, Folder, StarFilled } from "@element-plus/icons-vue";
import { getLabelList, deleteLabel, createLabel } from "@/api/modules/labelService";

interface FavItem {
  id: string;
  name: string;
  subtitle: string;
  link: string;
  type: "issue" | "project";
}

const router = useRouter();
const loading = ref(false);
const items = ref<FavItem[]>([]);

const favIssues = computed(() => items.value.filter(i => i.type === "issue"));
const favProjects = computed(() => items.value.filter(i => i.type === "project"));
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