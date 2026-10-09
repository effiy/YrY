<template>
  <div class="related-links">
    <div class="label">{{ t('help.page.related_links') }}</div>
    <ul>
      <li v-for="l in links" :key="l.route + l.label">
        <a @click.prevent="go(l.route)">{{ l.label }}</a>
        <span class="route">{{ l.route }}</span>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useHelp } from "../useHelp";
const props = defineProps<{ links: readonly { label: string; route: string }[] }>();
const router = useRouter();
const help = useHelp();
const { t } = useI18n();
function go(r: string) {
  if (r.startsWith("http")) window.open(r, "_blank", "noopener,noreferrer,nofollow");
  else { help.close(); router.push(r).catch(() => void 0); }
}
</script>
<style lang="scss" scoped>
.related-links { margin-top: 14px; }
.label { font-size: 12px; font-weight: 600; color: var(--el-color-primary-light-3); margin-bottom: 4px; }
ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
li { display: flex; gap: 8px; align-items: center; font-size: 13px;
  a { color: var(--el-color-primary); cursor: pointer; text-decoration: none; &:hover { text-decoration: underline; } }
  .route { color: var(--el-text-color-secondary); font-family: var(--el-font-family-mono, ui-monospace, monospace); font-size: 12px; }
}
</style>
