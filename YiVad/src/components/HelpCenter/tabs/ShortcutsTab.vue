<template>
  <div class="shortcuts-tab">
    <div class="shortcuts-tab__head">
      <input v-model="q" class="el-input__inner shortcuts-tab__search" type="search" :placeholder="t('help.shortcuts.search')" spellcheck="false" />
      <button type="button" class="el-button el-button--text" @click="copyAsMarkdown">{{ t('help.shortcuts.copy_md') }}</button>
    </div>

    <div v-for="(group, cat) in groups" :key="cat" class="shortcuts-group">
      <h4 class="shortcuts-group__title">
        <el-icon :size="14"><component :is="catIcon(cat)" /></el-icon>
        {{ catName(cat) }}
        <span class="shortcuts-group__count">{{ group.length }}</span>
      </h4>
      <div v-for="s in group" :key="s.id" class="shortcuts-row" @click="runSafe(s)">
        <span class="shortcuts-row__desc">{{ s.description }}</span>
        <span class="shortcuts-row__keys">
          <template v-if="s.sequence?.length">
            <kbd v-for="(k, i) in s.sequence" :key="i" class="kbd">
              {{ platformKey(k) }}
            </kbd>
          </template>
          <template v-else-if="s.keys">
            <kbd v-for="k in splitKeys(s.keys)" :key="k" class="kbd">{{ platformKey(k) }}</kbd>
          </template>
          <template v-else><span class="kbd kbd--muted">{{ t('help.shortcuts.custom') }}</span></template>
        </span>
      </div>
    </div>
    <el-empty v-if="!total" :description="t('help.shortcuts.empty')" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { shortcutRegistry, type ShortcutDefinition } from "@/shortcuts/registry";
import { SHORTCUT_CATEGORIES } from "@/shortcuts/categories";
import { fuzzySearch } from "@/utils/fuzzySearch";
import { Location, Edit, View, Setting, HelpFilled } from "@element-plus/icons-vue";

const { t } = useI18n();
const q = ref("");

const allShortcuts = computed(() => shortcutRegistry.getAllShortcuts());
const filtered = computed(() => {
  const list = allShortcuts.value.map(s => ({ s, text: `${s.keys || ""} ${s.sequence?.join(" ") ?? ""} ${s.description} ${s.category} ${s.scope}` }));
  if (!q.value.trim()) return list.map(x => x.s);
  const hits = fuzzySearch(list, q.value, { keys: ["text"], threshold: 0.45, minMatchCharLength: 1 });
  return hits.map(h => (h.item as any).s as ShortcutDefinition);
});
const groups = computed(() => {
  const map: Record<string, ShortcutDefinition[]> = {};
  for (const s of filtered.value) (map[s.category] ??= []).push(s);
  return map;
});
const total = computed(() => filtered.value.length);

function catIcon(cat: string) {
  switch (cat) {
    case "navigation": return Location;
    case "editing": return Edit;
    case "view": return View;
    case "tools": return Setting;
    case "accessibility": return HelpFilled;
    default: return Setting;
  }
}
function catName(cat: string) { return SHORTCUT_CATEGORIES[cat]?.name ?? cat; }
function splitKeys(k: string): string[] { return String(k || "").split("+").map(x => x.trim()).filter(Boolean); }
function platformKey(k: string): string {
  const mac = navigator.platform.toLowerCase().includes("mac") || navigator.userAgent.includes("Mac");
  const map: Record<string, string> = mac
    ? { Ctrl: "⌘", Alt: "⌥", Shift: "⇧", Control: "⌃", Meta: "⌘", Enter: "↵", Backspace: "⌫", Escape: "Esc", ArrowUp: "↑", ArrowDown: "↓" }
    : { Meta: "Win" };
  return map[k] ?? k;
}
function runSafe(s: ShortcutDefinition) {
  if (s.enabled === false || typeof s.handler !== "function") {
    ElMessage.warning(t("help.shortcuts.disabled"));
    return;
  }
  try {
    s.handler(new KeyboardEvent("keydown", { bubbles: true }));
  } catch (e) {
    ElMessage.error(t("help.shortcuts.execute_error"));
  }
}
function copyAsMarkdown() {
  let md = `# YiVad 快捷键表（生成于 ${new Date().toISOString().slice(0, 10)}）\n\n`;
  for (const [cat, arr] of Object.entries(groups.value)) {
    md += `## ${catName(cat)}\n\n| 说明 | 按键 | 作用域 |\n|---|---|---|\n`;
    for (const s of arr) {
      const keys = s.sequence?.length ? s.sequence.join(" ") : s.keys;
      md += `| ${s.description} | ${keys ?? "-"} | ${s.scope} |\n`;
    }
    md += "\n";
  }
  copyText(md).then(
    () => ElMessage.success(t("help.shortcuts.copied")),
    () => ElMessage.error(t("help.shortcuts.copy_failed"))
  );
}

async function copyText(t: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(t);
  const ta = document.createElement("textarea");
  ta.value = t; document.body.appendChild(ta); ta.select();
  document.execCommand("copy"); document.body.removeChild(ta);
}
</script>

<style lang="scss" scoped>
.shortcuts-tab { padding: 0 0 8px; }
.shortcuts-tab__head { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
.shortcuts-tab__search { flex: 1; height: 32px; padding: 0 12px;
  border: 1px solid var(--el-border-color); border-radius: 6px;
  background: var(--el-bg-color-page); color: var(--el-text-color-primary);
  &:focus { outline: none; border-color: var(--el-color-primary); box-shadow: 0 0 0 3px var(--el-color-primary-light-9); }
}
.shortcuts-group { margin-bottom: 16px; }
.shortcuts-group__title {
  display: flex; align-items: center; gap: 6px;
  margin: 8px 0 6px; font-size: 12px; font-weight: 600;
  color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: .5px;
}
.shortcuts-group__count { opacity: .7; }
.shortcuts-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 8px; border-radius: 6px;
  cursor: pointer; &:hover { background: var(--el-fill-color-light); }
}
.shortcuts-row__desc { font-size: 13px; color: var(--el-text-color-primary); }
.shortcuts-row__keys { display: flex; gap: 4px; }
.kbd {
  display: inline-flex; align-items: center; height: 22px; padding: 0 6px;
  font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
  color: var(--el-text-color-secondary);
  border: 1px solid var(--el-border-color);
  border-bottom-width: 2px; background: var(--el-fill-color); border-radius: 4px;
  &--muted { opacity: .5; border-style: dashed; }
}
</style>
