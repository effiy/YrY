<template>
  <div class="harness-overview">
    <HomeSkeleton v-if="loading" />

    <template v-else-if="error">
      <PageHeaderCard
        :icon="DataBoard"
        :icon-bg="HEADER_ICON_BG"
        :title="t('home.title')"
        :description="t('home.heroDesc')"
      />
      <div class="ho__error">
        <el-result icon="error" :title="t('home.error.loadFailed')" :sub-title="error">
          <template #extra>
            <el-button type="primary" @click="retry">{{ t('home.error.retry') }}</el-button>
          </template>
        </el-result>
      </div>
    </template>

    <template v-else>
      <PageHeaderCard
        :icon="DataBoard"
        :icon-bg="HEADER_ICON_BG"
        :title="t('home.title')"
        :description="t('home.heroDesc')"
      >
        <template #pills>
          <div class="phc__pills">
            <div class="phc__pill" @click="router.push('/issue')">
              <span class="phc__pill-val">{{ stats.totalIssues }}</span>
              <span class="phc__pill-lbl">{{ t('home.stats.tasks') }}</span>
            </div>
            <div class="phc__pill phc__pill--accent" @click="router.push('/bug')">
              <span class="phc__pill-val">{{ stats.bugCount }}</span>
              <span class="phc__pill-lbl">{{ t('home.stats.bugs') }}</span>
            </div>
          </div>
        </template>
      </PageHeaderCard>

      <div class="ho__body">
        <section class="ho__section">
          <QuickNav :counts="stats" />
        </section>

        <section class="ho__section">
          <div class="ho__kpis">
            <KpiCard
              :label="t('home.stats.tasks')"
              :value="stats.totalIssues"
              @click="router.push('/issue')"
            />
            <KpiCard
              :label="t('home.stats.bugs')"
              :value="stats.bugCount"
              @click="router.push('/bug')"
            />
            <KpiCard
              :label="t('home.quickNavItems.knowledge.label')"
              :value="stats.knowledgeFileCount"
              @click="router.push('/curator')"
            />
            <KpiCard
              :label="t('home.quickNavItems.aiChat.label')"
              :value="stats.chatSessionCount"
              @click="router.push('/aiChat')"
            />
          </div>
        </section>

        <section class="ho__section">
          <div class="ho__attention">
            <div class="ho__attention-col">
              <div class="ho__attention-head">
                <el-icon><WarningFilled /></el-icon>
                <span>{{ t('home.attention.overdue') }}</span>
                <el-button link type="danger" size="small" @click="router.push('/issue?priority=urgent')">
                  {{ t('home.attention.viewAll') }}
                </el-button>
              </div>
              <div v-if="overdueLoading" class="ho__attention-loading">
                <el-icon class="is-loading"><Loading /></el-icon>
              </div>
              <div v-else-if="overdueItems.length" class="ho__attention-list">
                <div
                  v-for="item in overdueItems"
                  :key="item.key"
                  class="ho__attention-item"
                  @click="router.push(`/issue?key=${item.key}`)"
                >
                  <span class="ho__attention-dot" :style="{ background: statusColor(item.status) }" />
                  <code class="ho__attention-key">{{ item.key }}</code>
                  <span class="ho__attention-title">{{ item.title }}</span>
                  <span class="ho__attention-due">{{ dueText(item.due_date || '') }}</span>
                </div>
              </div>
              <el-empty v-else :description="t('home.attention.noOverdue')" :image-size="40" />
            </div>
            <div class="ho__attention-col">
              <div class="ho__attention-head">
                <el-icon><UserFilled /></el-icon>
                <span>{{ t('home.attention.unassigned') }}</span>
                <el-button link type="warning" size="small" @click="router.push('/issue')">
                  {{ t('home.attention.viewAll') }}
                </el-button>
              </div>
              <div v-if="unassignedLoading" class="ho__attention-loading">
                <el-icon class="is-loading"><Loading /></el-icon>
              </div>
              <div v-else-if="unassignedItems.length" class="ho__attention-list">
                <div
                  v-for="item in unassignedItems"
                  :key="item.key"
                  class="ho__attention-item"
                  @click="router.push(`/issue?key=${item.key}`)"
                >
                  <span class="ho__attention-dot" :style="{ background: statusColor(item.status) }" />
                  <code class="ho__attention-key">{{ item.key }}</code>
                  <span class="ho__attention-title">{{ item.title }}</span>
                  <el-tag :type="statusTagType(item.status)" size="small">{{ statusLabel(item.status) }}</el-tag>
                </div>
              </div>
              <el-empty v-else :description="t('home.attention.noUnassigned')" :image-size="40" />
            </div>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts" name="home">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { DataBoard, WarningFilled, UserFilled, Loading } from "@element-plus/icons-vue";
import { PageHeaderCard } from "@/components";
import KpiCard from "@/components/analytics/KpiCard.vue";
import HomeSkeleton from "./components/HomeSkeleton.vue";
import QuickNav from "./QuickNav.vue";
import { useHomeData } from "@/hooks/useHomeData";
import {
  getIssueList,
  type Issue,
  type IssueStatus,
  type TagType,
  ISSUE_STATUS_MAP,
  ISSUE_STATUS_TAG_MAP,
} from "@/api/modules/issueService";
import { formatDate } from "@/utils/datetime";

const { t } = useI18n();
const router = useRouter();

const HEADER_ICON_BG = "linear-gradient(135deg,var(--el-color-primary),#6366f1)";

const { stats, loading, error, retry } = useHomeData();

const overdueItems = ref<Issue[]>([]);
const unassignedItems = ref<Issue[]>([]);
const overdueLoading = ref(false);
const unassignedLoading = ref(false);

function statusLabel(s: IssueStatus) { return ISSUE_STATUS_MAP[s] || s; }
function statusTagType(s: IssueStatus): TagType { return ISSUE_STATUS_TAG_MAP[s] || "info"; }

const STATUS_COLOR: Record<string, string> = {
  backlog: "#9a60b4", todo: "#909399", in_progress: "#5ab1ef",
  in_review: "#e6a23c", done: "#91cc75", cancelled: "#ee6666",
};
function statusColor(s: IssueStatus) { return STATUS_COLOR[s] || "#909399"; }

function dueText(due: string): string {
  if (!due) return "";
  const ms = new Date(due).getTime() - Date.now();
  const days = Math.ceil(ms / 86400000);
  return days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`;
}

async function fetchAttention() {
  overdueLoading.value = true;
  unassignedLoading.value = true;
  try {
    const now = new Date().toISOString().slice(0, 10);
    const [overdueRes, unassignedRes] = await Promise.all([
      getIssueList({ status: "todo,in_progress,in_review", pageSize: 6, orderBy: "due_date", orderType: "asc" }),
      getIssueList({ status: "todo,in_progress", pageSize: 6, orderBy: "updated_at", orderType: "desc" }),
    ]);
    overdueItems.value = ((overdueRes.data?.list ?? []) as Issue[]).filter(i => i.due_date && i.due_date < now);
    unassignedItems.value = ((unassignedRes.data?.list ?? []) as Issue[]).filter(i => !i.assignee);
  } catch {
    // best effort
  } finally {
    overdueLoading.value = false;
    unassignedLoading.value = false;
  }
}

onMounted(fetchAttention);
</script>

<style scoped lang="scss">
.harness-overview {
  box-sizing: border-box;
  min-height: 100%;
  padding: var(--page-gutter);
  background: var(--el-bg-color-page);
}

.ho__error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 24px;
}

.ho__body { margin-top: var(--space-md); }

.ho__section { margin-bottom: var(--space-md); &:last-child { margin-bottom: 0; } }

// ── KPIs ──
.ho__kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  :deep(.kpi-card) { cursor: pointer; }
}

// ── Attention ──
.ho__attention {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.ho__attention-col {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 14px 16px;
  min-height: 180px;
}

.ho__attention-head {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 10px;

  .el-icon { font-size: 15px; }
}

.ho__attention-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 0;
  color: var(--el-text-color-secondary);
}

.ho__attention-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ho__attention-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s;

  &:hover { background: var(--el-fill-color-light); }
}

.ho__attention-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.ho__attention-key {
  font-family: monospace;
  font-size: 11px;
  padding: 1px 5px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.ho__attention-title {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ho__attention-due {
  font-size: 11px;
  color: var(--el-color-danger);
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

// ── Pills ──
.phc__pills {
  display: flex;
  align-items: stretch;
  gap: var(--space-sm);
  flex-wrap: wrap;
  flex-shrink: 0;
}

.phc__pill {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 72px;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  background: var(--el-fill-color-light);
  cursor: pointer;
  user-select: none;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);

  &:hover {
    transform: translateY(-1px);
    background: var(--el-fill-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &:active { transform: translateY(0); box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06); }

  &--accent {
    background: var(--el-color-danger-light-9);
    &:hover { background: var(--el-color-danger-light-8); }
    .phc__pill-val { color: var(--el-color-danger); }
  }
}

.phc__pill-val {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
  font-family: DIN, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--el-text-color-primary);
  text-align: center;
}

.phc__pill-lbl {
  font-size: 10px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: var(--el-text-color-secondary);
  text-align: center;
  white-space: nowrap;
}
</style>