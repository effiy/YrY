<script setup lang="tsx" name="RssSchedulerPanel">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  Delete,
  Download,
  EditPen,
  Filter,
  Plus,
  Refresh,
  Setting,
  Upload,
  VideoPlay,
  VideoPause,
  ChatDotRound,
  ChatLineRound
} from "@element-plus/icons-vue";
import type { RssSeedDocument, RssSchedulerStatus } from "@/api/modules/rssService";
import { useSeedStaleness } from "@/hooks/useSeedStaleness";

const { t } = useI18n();
const { seedStaleDays, seedIsStale } = useSeedStaleness();

const props = defineProps<{
  status: RssSchedulerStatus | null;
  loading: boolean;
  parsing: boolean;
  seeds: RssSeedDocument[];
  seedsLoading: boolean;
  seedCounts?: Record<string, number>;
}>();

const emit = defineEmits<{
  (e: "refresh-status"): void;
  (e: "refresh-seeds"): void;
  (e: "start"): void;
  (e: "stop"): void;
  (e: "parse-all"): void;
  (e: "add-seed"): void;
  (e: "edit-seed", row: RssSeedDocument): void;
  (e: "delete-seed", row: RssSeedDocument): void;
  (e: "toggle-seed", row: RssSeedDocument): void;
  (e: "parse-seed", row: RssSeedDocument): void;
  (e: "summarize-seed", row: RssSeedDocument): void;
  (e: "filter-by-source", row: RssSeedDocument): void;
  (e: "view-seed-sessions", row: RssSeedDocument): void;
  (e: "summarize-seeds-bulk", rows: RssSeedDocument[]): void;
  (e: "apply-config", config: { interval?: number }): void;
  (e: "import-opml", file: File): void;
  (e: "export-opml"): void;
}>();

const statusText = computed(() => {
  if (!props.status) return t("rss.scheduler.statusUnknown");
  return props.status.enabled ? t("rss.scheduler.statusRunning") : t("rss.scheduler.statusStopped");
});
const statusType = computed<"success" | "info" | "warning">(() => {
  if (!props.status) return "info";
  return props.status.enabled ? "success" : "warning";
});

function seedStaleLabel(row: RssSeedDocument): string {
  const days = seedStaleDays(row);
  if (days === null) return t("rss.seeds.neverParsed");
  if (days < 1) return t("rss.seeds.parsedToday");
  return t("rss.seeds.parsedDaysAgo", { n: days });
}

const cronText = computed(() => {
  if (!props.status) return "—";
  if (props.status.type === "interval" && props.status.interval) {
    const totalSec = props.status.interval;
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    if (h > 0) return `${t("rss.scheduler.every")} ${h}h${m > 0 ? ` ${m}m` : ""}`;
    return `${t("rss.scheduler.every")} ${m}m`;
  }
  if (props.status.type === "cron" && props.status.cron) {
    const c = props.status.cron;
    return `cron ${c.second ?? "*"}/${c.minute ?? "*"}/${c.hour ?? "*"}/${c.day ?? "*"}/${c.month ?? "*"}/${c.day_of_week ?? "*"}`;
  }
  return "—";
});

const configVisible = ref(false);
const configInterval = ref<number | undefined>(undefined);

function openConfig() {
  configInterval.value = props.status?.interval ?? undefined;
  configVisible.value = true;
}

function applyConfig() {
  const interval = typeof configInterval.value === "number" && configInterval.value > 0 ? configInterval.value : undefined;
  emit("apply-config", { interval });
  configVisible.value = false;
}

const opmlInputRef = ref<HTMLInputElement | null>(null);

const selectedSeeds = ref<RssSeedDocument[]>([]);
function onSelectionChange(rows: RssSeedDocument[]) {
  selectedSeeds.value = rows;
}

function pickOpml() {
  opmlInputRef.value?.click();
}

function onOpmlChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) emit("import-opml", file);
  target.value = "";
}
</script>

<template>
  <el-card class="scheduler-panel" shadow="never">
    <div class="scheduler-header">
      <div class="scheduler-title">
        <span>{{ t("rss.scheduler.title") }}</span>
        <el-tag :type="statusType" size="small" effect="dark">{{ statusText }}</el-tag>
        <span class="scheduler-cron">{{ cronText }}</span>
      </div>
      <div class="scheduler-actions">
        <el-tooltip :content="t('rss.scheduler.refreshStatus')" placement="top">
          <el-button :icon="Refresh" circle :loading="loading" @click="emit('refresh-status')" />
        </el-tooltip>
        <el-tooltip :content="t('rss.scheduler.refreshSeeds')" placement="top">
          <el-button :icon="Refresh" circle :loading="seedsLoading" @click="emit('refresh-seeds')" />
        </el-tooltip>
        <el-tooltip :content="t('rss.scheduler.config')" placement="top">
          <el-button :icon="Setting" circle @click="openConfig" />
        </el-tooltip>
        <el-tooltip :content="t('rss.scheduler.start')" placement="top">
          <el-button type="success" :icon="VideoPlay" :disabled="!!status?.enabled" @click="emit('start')">{{ t("rss.scheduler.start") }}</el-button>
        </el-tooltip>
        <el-tooltip :content="t('rss.scheduler.stop')" placement="top">
          <el-button type="warning" :icon="VideoPause" :disabled="!status?.enabled" @click="emit('stop')">{{ t("rss.scheduler.stop") }}</el-button>
        </el-tooltip>
        <el-button type="primary" :icon="Plus" @click="emit('add-seed')">{{ t("rss.scheduler.addSeed") }}</el-button>
        <el-tooltip :content="t('rss.scheduler.importOpml')" placement="top">
          <el-button :icon="Upload" @click="pickOpml" />
        </el-tooltip>
        <el-tooltip :content="t('rss.scheduler.exportOpml')" placement="top">
          <el-button :icon="Download" :disabled="!seeds.length" @click="emit('export-opml')" />
        </el-tooltip>
        <el-button type="primary" :icon="VideoPlay" :loading="parsing" @click="emit('parse-all')">{{ t("rss.scheduler.parseAll") }}</el-button>
        <el-button
          type="success"
          :icon="ChatDotRound"
          :disabled="!selectedSeeds.length"
          @click="emit('summarize-seeds-bulk', selectedSeeds)"
        >{{ t("rss.seeds.summarizeSeedsBulk", { n: selectedSeeds.length }) }}</el-button>
        <input
          ref="opmlInputRef"
          type="file"
          accept=".opml,.xml,application/xml,text/x-opml"
          style="display: none"
          @change="onOpmlChange"
        />
      </div>
    </div>

    <el-table
      :data="seeds"
      size="small"
      class="seeds-table"
      max-height="240"
      :empty-text="t('rss.seeds.empty')"
      @selection-change="onSelectionChange"
    >
      <el-table-column type="selection" width="40" :selectable="(row: RssSeedDocument) => !!row.url" />
      <el-table-column prop="name" :label="t('rss.seeds.name')" min-width="160">
        <template #default="scope">
          <div class="rss-seed-name-cell">
            <span>{{ scope.row.name || scope.row.url }}</span>
            <el-tag
              v-if="seedIsStale(scope.row as RssSeedDocument)"
              size="small"
              type="warning"
              class="rss-seed-stale"
              :title="t('rss.seeds.staleTooltip')"
            >{{ t("rss.seeds.stale") }}</el-tag>
            <el-tag
              v-if="seedCounts && (seedCounts[scope.row.name || scope.row.url] ?? 0) > 0"
              size="small"
              type="info"
              class="rss-seed-count"
            >{{ seedCounts![scope.row.name || scope.row.url] }} {{ t("rss.seeds.itemsUnit") }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="t('rss.seeds.lastParsed')" width="140">
        <template #default="scope">
          <span class="rss-seed-time">{{ seedStaleLabel(scope.row as RssSeedDocument) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="url" :label="t('rss.seeds.url')" min-width="280" show-overflow-tooltip />
      <el-table-column prop="category" :label="t('rss.seeds.category')" width="160">
        <template #default="scope">
          <el-tag v-if="scope.row.category" size="small" type="info">{{ scope.row.category }}</el-tag>
          <span v-else class="rss-muted">—</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('rss.seeds.enabled')" width="90">
        <template #default="scope">
          <el-switch :model-value="scope.row.enabled ?? true" @change="emit('toggle-seed', scope.row as RssSeedDocument)" />
        </template>
      </el-table-column>
      <el-table-column :label="t('rss.seeds.actions')" width="180" fixed="right">
        <template #default="scope">
          <el-tooltip :content="t('rss.seeds.parseSeed')" placement="top">
            <el-button type="primary" link :icon="VideoPlay" :loading="parsing" @click="emit('parse-seed', scope.row as RssSeedDocument)" />
          </el-tooltip>
          <el-tooltip :content="t('rss.seeds.summarizeSeed')" placement="top">
            <el-button type="primary" link :icon="ChatDotRound" @click="emit('summarize-seed', scope.row as RssSeedDocument)" />
          </el-tooltip>
          <el-tooltip :content="t('rss.seeds.filterBySource')" placement="top">
            <el-button type="primary" link :icon="Filter" @click="emit('filter-by-source', scope.row as RssSeedDocument)" />
          </el-tooltip>
          <el-tooltip :content="t('common.relatedAiChatSessions')" placement="top">
            <el-button type="primary" link :icon="ChatLineRound" @click="emit('view-seed-sessions', scope.row as RssSeedDocument)" />
          </el-tooltip>
          <el-tooltip :content="t('rss.seeds.actions')" placement="top">
            <el-button type="primary" link :icon="EditPen" @click="emit('edit-seed', scope.row as RssSeedDocument)" />
          </el-tooltip>
          <el-tooltip :content="t('rss.seeds.deleted')" placement="top">
            <el-button type="danger" link :icon="Delete" @click="emit('delete-seed', scope.row as RssSeedDocument)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="configVisible" :title="t('rss.scheduler.configTitle')" width="380px" append-to-body>
      <el-form label-width="120px">
        <el-form-item :label="t('rss.scheduler.configInterval')">
          <el-input-number
            v-model="configInterval"
            :min="60"
            :step="60"
            :controls="false"
            :placeholder="t('rss.scheduler.configIntervalPlaceholder')"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="configVisible = false">{{ t("rss.seeds.cancel") }}</el-button>
        <el-button type="primary" @click="applyConfig">{{ t("rss.scheduler.configApply") }}</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped lang="scss">
.scheduler-panel {
  :deep(.el-card__body) { padding: 12px 16px; }
}
.scheduler-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}
.scheduler-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}
.scheduler-cron {
  font-family: "SF Mono", "Menlo", monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.scheduler-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.rss-muted {
  color: var(--el-text-color-placeholder);
}
.rss-seed-count {
  margin-left: 6px;
  font-size: 11px;
}
.rss-seed-name-cell {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 28px;
}
.rss-seed-stale {
  font-size: 11px;
}
.rss-seed-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.seeds-table {
  margin-top: 4px;
}
</style>
