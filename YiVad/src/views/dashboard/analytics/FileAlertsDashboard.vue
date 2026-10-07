<template>
  <div class="file-alerts-page page">
    <!-- Header -->
    <header class="fa-header">
      <div class="fa-header__left">
        <h1>File Report Warnings</h1>
        <p class="fa-header__sub">
          Cross-domain health alerts across knowledge, data, and code
          <span v-if="lastUpdated" class="fa-header__updated"> · Updated {{ lastUpdated }}</span>
        </p>
      </div>
      <div class="fa-header__actions">
        <el-select v-if="polling" v-model="pollInterval" size="small" style="width:100px" @change="() => onPollIntervalChange()">
          <el-option :value="10" label="10s" />
          <el-option :value="30" label="30s" />
          <el-option :value="60" label="60s" />
        </el-select>
        <el-button
          :type="polling ? 'primary' : 'default'"
          :icon="polling ? VideoPause : VideoPlay"
          size="small" plain @click="togglePolling"
        >
          {{ polling ? `Live ${pollInterval}s` : 'Auto' }}
        </el-button>
        <el-select v-model="selectedProject" placeholder="All Projects" clearable size="small" style="width:160px" @change="fetch">
          <el-option label="All Projects" value="" />
          <el-option v-for="p in projectOptions" :key="p" :label="p" :value="p" />
        </el-select>
        <el-button :icon="Refresh" size="small" @click="fetch" :loading="loading">Refresh</el-button>
        <el-button size="small" :icon="Download" @click="exportReport" :disabled="!data?.alerts.length">Export</el-button>
      </div>
    </header>

    <!-- Error -->
    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="mb16" />

    <!-- Loading skeleton -->
    <template v-if="loading && !data">
      <el-skeleton animated :rows="3" class="mb16" />
      <el-skeleton animated :rows="6" class="mb16" />
    </template>

    <template v-else-if="data">
      <!-- Summary header -->
      <section class="fa-summary-strip">
        <div class="fa-summary-card fa-summary-card--critical">
          <span class="fa-summary-card__count">{{ data.summary.critical }}</span>
          <span class="fa-summary-card__label">Critical</span>
        </div>
        <div class="fa-summary-card fa-summary-card--warning">
          <span class="fa-summary-card__count">{{ data.summary.warning }}</span>
          <span class="fa-summary-card__label">Warnings</span>
        </div>
        <div class="fa-summary-card">
          <span class="fa-summary-card__count">{{ data.summary.info }}</span>
          <span class="fa-summary-card__label">Info</span>
        </div>
        <div class="fa-summary-card">
          <span class="fa-summary-card__count">{{ data.summary.total }}</span>
          <span class="fa-summary-card__label">Total</span>
        </div>
      </section>

      <!-- Domain sections -->
      <section class="fa-domains">
        <template v-for="domain in domains" :key="domain.key">
          <div v-if="domainAlerts(domain.key).length" class="fa-domain-card">
            <div class="fa-domain-card__header">
              <el-icon :size="16"><component :is="domain.icon" /></el-icon>
              <span class="fa-domain-card__title">{{ domain.label }}</span>
              <span class="fa-domain-card__count">{{ domainAlerts(domain.key).length }} alerts</span>
            </div>
            <div class="fa-domain-card__body">
              <div
                v-for="alert in domainAlerts(domain.key)"
                :key="alert.title"
                class="fa-alert-item"
                :class="`fa-alert-item--${alert.severity}`"
              >
                <div class="fa-alert-item__severity" :class="`fa-alert-item__severity--${alert.severity}`">
                  {{ alert.severity === 'critical' ? '!' : alert.severity === 'warning' ? '?' : 'i' }}
                </div>
                <div class="fa-alert-item__body">
                  <div class="fa-alert-item__title">{{ alert.title }}</div>
                  <div class="fa-alert-item__desc">{{ alert.description }}</div>
                </div>
                <div class="fa-alert-item__count" :class="`fa-alert-item__count--${alert.severity}`">
                  {{ alert.count }}
                </div>
              </div>
              <!-- Suggestion -->
              <div v-if="domainAlerts(domain.key).some(a => a.suggestion)" class="fa-domain-card__suggestions">
                <span class="fa-suggestion-label">Suggestions:</span>
                <ul>
                  <li v-for="a in domainAlerts(domain.key).filter(a => a.suggestion)" :key="a.title">
                    {{ a.suggestion }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </template>
      </section>

      <!-- Empty -->
      <div v-if="!data.alerts.length" class="fa-empty">
        <el-icon :size="48"><CircleCheck /></el-icon>
        <h3>All clear</h3>
        <p>No file health issues detected across any domain.</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts" name="dashFileAlerts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Refresh, CircleCheck, Document, DataAnalysis, Folder, VideoPause, VideoPlay, Download } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { getFileAlerts } from "@/api/modules/analyticsService";
import { queryDocuments } from "@/api/modules/dataService";
import type { FileAlertItem, FileAlertsResponse } from "@/types/analytics";

const data = ref<FileAlertsResponse | null>(null);
const loading = ref(false);
const error = ref("");
const lastUpdated = ref("");
const polling = ref(false);
const pollInterval = ref(30);
const selectedProject = ref("");
const projectOptions = ref<string[]>([]);
const pollTimer = ref<ReturnType<typeof setInterval> | null>(null);

function onPollIntervalChange() {
  if (pollTimer.value) {
    clearInterval(pollTimer.value);
    pollTimer.value = setInterval(fetch, pollInterval.value * 1000);
  }
}

const domains = [
  { key: "knowledge" as const, label: "Knowledge Files", icon: Document },
  { key: "data" as const, label: "Data (Modules)", icon: DataAnalysis },
  { key: "code" as const, label: "Code Health", icon: Folder },
];

function domainAlerts(domain: string): FileAlertItem[] {
  return (data.value?.alerts ?? []).filter(a => a.domain === domain);
}

const freshnessLabel = computed(() => {
  if (!lastUpdated.value) return "";
  return `Updated ${lastUpdated.value}`;
});

async function fetch() {
  loading.value = true;
  error.value = "";
  try {
    data.value = await getFileAlerts({ project_key: selectedProject.value || undefined });
    lastUpdated.value = new Date().toLocaleTimeString();
  } catch (e: any) {
    error.value = e?.message || "Failed to load file alerts";
  } finally {
    loading.value = false;
  }
}

async function loadProjects() {
  try {
    const res = await queryDocuments({ cname: "projects", pageSize: 200 });
    if (res.code === 0 && res.data) {
      projectOptions.value = ((res.data as any).list || [])
        .map((p: any) => p.key || p.name || "").filter(Boolean);
    }
  } catch { /* best-effort */ }
}

function exportReport() {
  if (!data.value?.alerts.length) return;
  const lines: string[] = [
    `# File Report Warnings`,
    `> Generated: ${new Date().toISOString().slice(0, 19).replace("T", " ")}`,
    `> Critical: ${data.value.summary.critical} · Warning: ${data.value.summary.warning} · Info: ${data.value.summary.info}`,
    ``,
  ];
  for (const domain of domains) {
    const items = domainAlerts(domain.key);
    if (!items.length) continue;
    lines.push(`## ${domain.label}`);
    for (const a of items) {
      lines.push(`- **${a.title}** (${a.severity}) — ${a.count} items`);
      lines.push(`  ${a.description}`);
      if (a.suggestion) lines.push(`  > ${a.suggestion}`);
    }
    lines.push(``);
  }
  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `file-alerts_${new Date().toISOString().slice(0, 10)}.md`;
  a.click();
  URL.revokeObjectURL(url);
  ElMessage.success("Report exported");
}

function togglePolling() {
  polling.value = !polling.value;
  if (polling.value) {
    pollTimer.value = setInterval(fetch, pollInterval.value * 1000);
  } else {
    if (pollTimer.value) { clearInterval(pollTimer.value); pollTimer.value = null; }
  }
}

onMounted(() => { fetch(); loadProjects(); });
onUnmounted(() => { if (pollTimer.value) clearInterval(pollTimer.value); });
</script>

<style scoped lang="scss">
.file-alerts-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

// ── Header ──
.fa-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;

  &__left h1 {
    margin: 0 0 4px;
    font-size: 22px;
    font-weight: 700;
  }
  &__sub {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
  &__updated {
    color: var(--el-text-color-placeholder);
  }
  &__actions {
    display: flex;
    gap: 8px;
  }
}

.mb16 { margin-bottom: 16px; }

// ── Summary cards ──
.fa-summary-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;

  @media (max-width: 700px) { grid-template-columns: repeat(2, 1fr); }
}

.fa-summary-card {
  text-align: center;
  padding: 20px 16px;
  border-radius: 10px;
  background: var(--el-fill-color-light);

  &--critical {
    background: rgba(245,108,108,.08);
    .fa-summary-card__count { color: #f56c6c; }
  }
  &--warning {
    background: rgba(230,162,60,.08);
    .fa-summary-card__count { color: #e6a23c; }
  }

  &__count {
    display: block;
    font-size: 36px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--el-text-color-primary);
  }
  &__label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
  }
}

// ── Domain cards ──
.fa-domains {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fa-domain-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 20px;
    background: var(--el-fill-color-lighter);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    flex: 1;
  }
  &__count {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  &__body {
    padding: 4px 0;
  }
  &__suggestions {
    padding: 12px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-lighter);
  }
}

.fa-suggestion-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.fa-domain-card__suggestions ul {
  margin: 4px 0 0;
  padding-left: 18px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  li { margin-bottom: 2px; }
}

// ── Alert items ──
.fa-alert-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-child { border-bottom: none; }

  &--critical { background: rgba(245,108,108,.03); }
  &--warning { background: rgba(230,162,60,.02); }

  &__severity {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 14px;
    font-weight: 800;

    &--critical {
      background: rgba(245,108,108,.15);
      color: #f56c6c;
    }
    &--warning {
      background: rgba(230,162,60,.15);
      color: #e6a23c;
    }
    &--info {
      background: var(--el-fill-color-light);
      color: var(--el-text-color-secondary);
    }
  }

  &__body {
    flex: 1;
    min-width: 0;
  }
  &__title {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin-bottom: 2px;
  }
  &__desc {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__count {
    flex-shrink: 0;
    font-size: 22px;
    font-weight: 700;
    min-width: 36px;
    text-align: center;

    &--critical { color: #f56c6c; }
    &--warning { color: #e6a23c; }
    &--info { color: var(--el-text-color-secondary); }
  }
}

// ── Empty ──
.fa-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 16px;
  color: var(--el-text-color-secondary);
  h3 { margin: 16px 0 8px; font-size: 18px; font-weight: 500; color: var(--el-text-color-regular); }
  p { margin: 0; font-size: 14px; }
  .el-icon { color: #67c23a; }
}
</style>