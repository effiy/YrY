<template>
  <span class="sla" :class="{ expired: isExpired }">
    <span v-if="isExpired">{{ t('help.sla.overdue') }}</span>
    <template v-else>
      <span v-if="d > 0">{{ d }}{{ t('help.sla.days') }}</span>
      <span class="num">{{ pad(h) }}:{{ pad(m) }}:{{ pad(s) }}</span>
      <span v-if="d > 0 || h > 12" class="tag ok">{{ t('help.sla.green') }}</span>
      <span v-else-if="h > 4" class="tag warn">{{ t('help.sla.warn') }}</span>
      <span v-else class="tag urgent">{{ t('help.sla.urgent') }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";

const props = defineProps<{ deadline: string }>();
const { t } = useI18n();
const now = ref(Date.now());
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => (timer = setInterval(() => (now.value = Date.now()), 1000)));
onBeforeUnmount(() => timer && clearInterval(timer));

const diff = computed(() => Math.max(0, dayjs(props.deadline).valueOf() - now.value));
const isExpired = computed(() => dayjs(props.deadline).valueOf() < now.value);
const d = computed(() => Math.floor(diff.value / 86400000));
const h = computed(() => Math.floor((diff.value % 86400000) / 3600000));
const m = computed(() => Math.floor((diff.value % 3600000) / 60000));
const s = computed(() => Math.floor((diff.value % 60000) / 1000));
const pad = (n: number) => String(n).padStart(2, "0");
</script>
<style lang="scss" scoped>
.sla { display: inline-flex; align-items: center; gap: 6px; font-family: var(--el-font-family-mono, ui-monospace, monospace); font-size: 12.5px; }
.sla.expired { color: var(--el-color-danger); }
.num { padding: 0 6px; background: var(--el-fill-color-light); border-radius: 4px; }
.tag { padding: 0 6px; height: 18px; line-height: 18px; border-radius: 10px; font-size: 10px; font-weight: 600; }
.tag.ok { background: var(--el-color-success-light-9); color: var(--el-color-success); }
.tag.warn { background: var(--el-color-warning-light-9); color: var(--el-color-warning); }
.tag.urgent { background: var(--el-color-danger-light-9); color: var(--el-color-danger); }
</style>
