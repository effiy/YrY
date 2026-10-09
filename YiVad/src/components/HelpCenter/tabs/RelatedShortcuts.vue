<template>
  <div class="related-shortcuts">
    <div class="label">{{ t('help.page.related_shortcuts') }}</div>
    <div class="list">
      <div v-for="s in refs" :key="s.id" class="row" @click="run(s)">
        <span class="desc">{{ s.description }}</span>
        <span class="keys">
          <kbd v-for="k in keys(s)" :key="k">{{ k }}</kbd>
        </span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { shortcutRegistry } from "@/shortcuts/registry";
import type { ShortcutReference } from "../types";

const props = defineProps<{ ids: readonly string[] }>();
const { t } = useI18n();

const refs = computed<ShortcutReference[]>(() => {
  const all = shortcutRegistry.getAllShortcuts();
  return props.ids
    .map(id => all.find(s => s.id === id))
    .filter((s): s is NonNullable<typeof s> => !!s)
    .map(s => ({
      id: s.id,
      keys: s.keys || (s.sequence || []).join(" "),
      description: s.description,
      category: s.category, scope: s.scope,
      enabled: s.enabled !== false,
      overriddenKeys: undefined,
      handler: s.handler
    }));
});

function keys(s: ShortcutReference): string[] {
  const base = s.overriddenKeys ?? s.keys;
  if (!base) return s.sequence?.length ? s.sequence as string[] : [];
  return base.split("+").map(x => x.trim()).filter(Boolean);
}
function run(s: ShortcutReference) {
  if (!s.enabled || !s.handler) { ElMessage.warning(t("help.shortcuts.disabled")); return; }
  try { s.handler(new KeyboardEvent("keydown", { bubbles: true })); } catch { /* noop */ }
}
</script>
<style lang="scss" scoped>
.related-shortcuts { margin-top: 12px; }
.label { font-size: 12px; font-weight: 600; color: var(--el-color-primary-light-3); margin-bottom: 4px; }
.list { display: flex; flex-direction: column; gap: 4px; }
.row { display: flex; justify-content: space-between; align-items: center;
  padding: 4px 8px; border-radius: 6px; cursor: pointer;
  &:hover { background: var(--el-fill-color-light); }
}
.desc { font-size: 13px; color: var(--el-text-color-primary); }
.keys { display: flex; gap: 4px; }
kbd {
  display: inline-flex; align-items: center; height: 20px; padding: 0 6px;
  font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color); border: 1px solid var(--el-border-color);
  border-bottom-width: 2px; border-radius: 4px;
}
</style>
