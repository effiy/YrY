<script setup lang="ts" name="KnowledgeMetaStrip">
import { computed } from "vue";
import type { KnowledgeMeta } from "@/api/interface/yiAi";

type Badge = { label: string; value: string; tone: string };

const props = defineProps<{
  meta: KnowledgeMeta;
  /** Current file's relative path — used to resolve relative `related` links. Optional. */
  currentPath?: string;
}>();
const emit = defineEmits<{ (e: "navigate-related", path: string): void }>();

const benefit = computed<string>(() => (typeof props.meta.benefit === "string" ? props.meta.benefit.trim() : ""));

const tacitStatement = computed<string>(() => (typeof props.meta.tacit === "string" ? props.meta.tacit.trim() : ""));

const criteria = computed<string[]>(() => {
  const c = props.meta.acceptance_criteria;
  return Array.isArray(c) && c.length ? c.map(String) : [];
});

const badges = computed<Badge[]>(() => {
  const m = props.meta;
  const out: Badge[] = [];
  if (m.status) out.push({ label: "status", value: String(m.status), tone: m.status === "stable" ? "success" : "info" });
  if (m.lifecycle)
    out.push({ label: "lifecycle", value: String(m.lifecycle), tone: m.lifecycle === "active" ? "success" : "warning" });
  if (m.review_cycle) out.push({ label: "review", value: String(m.review_cycle), tone: "info" });
  if (m.tacit === true) out.push({ label: "tacit", value: "yes", tone: "warning" });
  if (m.type) out.push({ label: "type", value: String(m.type), tone: "info" });
  if (criteria.value.length) out.push({ label: "criteria", value: String(criteria.value.length), tone: "info" });
  return out;
});

const roles = computed<string[]>(() => {
  const r = props.meta.roles;
  return Array.isArray(r) && r.length ? r.map(String) : [];
});

const tags = computed<string[]>(() => {
  const t = props.meta.tags;
  return Array.isArray(t) && t.length ? t.map(String) : [];
});

/** Resolve a relative href from `related` against the current file's parent dir. */
function resolvePath(href: string): string | null {
  if (!href) return null;
  if (/^(https?:|mailto:|tel:|#|data:)/i.test(href)) return null;
  const clean = href.split("#")[0].split("?")[0];
  if (!clean) return null;
  const base = (props.currentPath || "").includes("/") ? (props.currentPath || "").replace(/\/[^/]*$/, "") : "";
  const segments = (base + "/" + clean).split("/");
  const resolved: string[] = [];
  for (const seg of segments) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") {
      resolved.pop();
      continue;
    }
    resolved.push(seg);
  }
  let out = resolved.join("/");
  // Directory link (trailing slash, no .md) → resolve to README.md inside it.
  if (href.endsWith("/") && !out.endsWith(".md")) {
    out = out ? `${out}/README.md` : "README.md";
  }
  return out;
}

const related = computed<{ raw: string; path: string | null; href: string | null }[]>(() => {
  const r = props.meta.related;
  if (!Array.isArray(r) || !r.length) return [];
  return r.map(raw => {
    const s = String(raw);
    const isExternal = /^(https?:|mailto:|tel:)/i.test(s);
    return { raw: s, path: resolvePath(s), href: isExternal ? s : null };
  });
});

const hasAnything = computed(
  () =>
    !!benefit.value ||
    !!tacitStatement.value ||
    !!badges.value.length ||
    !!roles.value.length ||
    !!tags.value.length ||
    !!related.value.length
);

function onClickRelated(r: { path: string | null; href: string | null }) {
  if (r.path) {
    emit("navigate-related", r.path);
  } else if (r.href) {
    window.open(r.href, "_blank", "noopener,noreferrer");
  }
}

defineExpose({ hasAnything });
</script>

<template>
  <div v-if="hasAnything" class="kms-strip">
    <p v-if="benefit" class="kms-benefit" :title="benefit">{{ benefit }}</p>
    <p v-if="tacitStatement" class="kms-tacit" :title="tacitStatement">
      <span class="kms-tacit-label">tacit</span>
      <span class="kms-tacit-text">{{ tacitStatement }}</span>
    </p>
    <div class="kms-row">
      <span v-for="b in badges" :key="b.label + b.value" class="kms-badge" :class="`kms-badge--${b.tone}`">
        <span class="kms-badge-label">{{ b.label }}</span>
        <span class="kms-badge-value">{{ b.value }}</span>
      </span>
      <template v-if="roles.length">
        <span class="kms-label">roles</span>
        <el-tag v-for="r in roles" :key="r" size="small" type="info" effect="plain">{{ r }}</el-tag>
      </template>
      <template v-if="tags.length">
        <span class="kms-label">tags</span>
        <el-tag v-for="t in tags" :key="t" size="small" type="info">{{ t }}</el-tag>
      </template>
      <template v-if="related.length">
        <span class="kms-label">related</span>
        <el-tag
          v-for="r in related"
          :key="r.raw"
          size="small"
          type="primary"
          effect="plain"
          :class="{ 'kms-related--clickable': r.path || r.href }"
          @click="onClickRelated(r)"
          >{{ r.raw }}</el-tag
        >
      </template>
    </div>
    <el-tooltip v-if="criteria.length" effect="dark" placement="bottom" :width="320">
      <template #content>
        <ul class="kms-criteria-tip">
          <li v-for="(c, i) in criteria" :key="i">{{ c }}</li>
        </ul>
      </template>
      <span class="kms-criteria-link">criteria · {{ criteria.length }}</span>
    </el-tooltip>
  </div>
</template>

<style scoped lang="scss">
.kms-strip {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}
.kms-benefit {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  -webkit-line-clamp: 2;
  font-size: 12px;
  font-style: italic;
  line-height: 1.4;
  color: var(--el-text-color-secondary);
  -webkit-box-orient: vertical;
}
.kms-tacit {
  display: -webkit-box;
  padding: 4px 8px;
  margin: 0;
  overflow: hidden;
  -webkit-line-clamp: 3;
  font-size: 12px;
  line-height: 1.4;
  background: var(--el-color-warning-light-9);
  border-left: 3px solid var(--el-color-warning-light-5);
  border-radius: 2px;
  -webkit-box-orient: vertical;
}
.kms-tacit-label {
  margin-right: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--el-color-warning-dark-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.kms-tacit-text {
  font-style: italic;
  color: var(--el-text-color-primary);
}
.kms-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 8px;
  align-items: center;
}
.kms-label {
  margin-left: 4px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.kms-label:first-child {
  margin-left: 0;
}
.kms-badge {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 1px 8px;
  font-size: 11px;
  line-height: 18px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
}
.kms-badge-label {
  color: var(--el-text-color-secondary);
}
.kms-badge-value {
  font-weight: 500;
  color: var(--el-text-color-primary);
}
.kms-badge--success {
  color: var(--el-color-success-dark-2);
  background: var(--el-color-success-light-9);
  border-color: var(--el-color-success-light-5);
}
.kms-badge--warning {
  color: var(--el-color-warning-dark-2);
  background: var(--el-color-warning-light-9);
  border-color: var(--el-color-warning-light-5);
}
.kms-badge--info {
  color: var(--el-text-color-regular);
  background: var(--el-color-info-light-9);
  border-color: var(--el-color-info-light-5);
}
.kms-related--clickable {
  cursor: pointer;
}
.kms-criteria-link {
  align-self: flex-start;
  font-size: 11px;
  color: var(--el-color-primary);
  text-decoration: underline dotted;
  cursor: help;
}
.kms-criteria-tip {
  max-height: 240px;
  padding-left: 18px;
  margin: 0;
  overflow-y: auto;
}
.kms-criteria-tip li {
  margin-bottom: 2px;
  font-size: 12px;
  line-height: 1.5;
}
</style>
