<template>
  <div class="role-nav-wrap">
    <div class="role-nav">
      <button
        v-if="all"
        class="role-nav__item"
        :class="{ 'is-active': isAllActive }"
        @click="onAll"
      >
        <span class="role-nav__icon">🌐</span>
        <span class="role-nav__name">All</span>
        <span v-if="counts && counts.all !== undefined" class="role-nav__count">{{ counts.all }}</span>
      </button>
      <button
        v-for="rid in ROLE_IDS"
        :key="rid"
        class="role-nav__item"
        :class="{ 'is-active': isActive(rid) }"
        @click="onSelect(rid)"
      >
        <span class="role-nav__icon">{{ rolesData[rid].icon }}</span>
        <span class="role-nav__name">{{ rolesData[rid].name }}</span>
        <span v-if="counts && counts[rid] !== undefined" class="role-nav__count">{{ counts[rid] }}</span>
      </button>
    </div>

    <div v-if="showQuickNav" class="role-nav__quick">
      <el-tooltip
        v-for="item in quickNavItems"
        :key="item.key"
        :content="`${item.title} — ${item.desc}`"
        placement="bottom"
        :show-after="300"
      >
        <button
          class="role-nav__quick-item"
          :class="{ 'is-active': item.key === quickActive }"
          @click="$router.push(item.path)"
        >
          <span class="role-nav__quick-icon">{{ item.icon }}</span>
          <span class="role-nav__quick-label">{{ item.title }}</span>
        </button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts" name="RoleNav">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { rolesData, ROLE_IDS } from "@/views/knowledge/executiver/okrData";

type QuickNavKey = "okr" | "rss" | "reading-list" | "process";

const props = withDefaults(
  defineProps<{
    active?: string;
    multiple?: boolean;
    modelValue?: string[];
    all?: boolean;
    counts?: Record<string, number>;
    showQuickNav?: boolean;
    quickRole?: string;
    quickActive?: QuickNavKey | "";
    /** @deprecated 请在外层容器上使用 v-sticky directive */
    sticky?: boolean;
    /** @deprecated 请在外层容器上使用 v-sticky directive */
    stickyTop?: number;
    /** @deprecated 请在外层容器上使用 v-sticky directive */
    stickyZIndex?: number;
  }>(),
  {
    active: "",
    multiple: false,
    modelValue: () => [],
    all: false,
    counts: () => ({}),
    showQuickNav: false,
    quickRole: "",
    quickActive: "",
    sticky: false,
    stickyTop: 0,
    stickyZIndex: 20
  }
);

const emit = defineEmits<{ (e: "update:modelValue", rids: string[]): void }>();

const router = useRouter();
const { t } = useI18n();

const ALL_ID = "all";

function isAllActive(): boolean {
  return props.multiple ? props.modelValue.length === 0 : props.active === ALL_ID;
}

function isActive(rid: string): boolean {
  return props.multiple ? props.modelValue.includes(rid) : rid === props.active;
}

function onAll() {
  if (props.multiple) emit("update:modelValue", []);
}

function onSelect(rid: string) {
  if (props.multiple) {
    const next = props.modelValue.includes(rid)
      ? props.modelValue.filter(r => r !== rid)
      : [...props.modelValue, rid];
    emit("update:modelValue", next);
    return;
  }
  if (rid !== props.active) router.push(`/${rid}`);
}

interface QuickNavItem {
  key: QuickNavKey;
  path: string;
  icon: string;
  title: string;
  desc: string;
}

const quickNavItems = computed<QuickNavItem[]>(() => {
  const role = props.quickRole;
  return [
    {
      key: "okr",
      path: role ? `/executiver/okr/${role}` : "/executiver/okr",
      icon: "🎯",
      title: t("home.knowledgeQuickNav.okr.title"),
      desc: t("home.knowledgeQuickNav.okr.desc")
    },
    {
      key: "rss",
      path: role ? `/executiver/rss/${role}` : "/executiver/rss",
      icon: "📡",
      title: t("home.knowledgeQuickNav.rss.title"),
      desc: t("home.knowledgeQuickNav.rss.desc")
    },
    {
      key: "reading-list",
      path: "/executiver/reading-list",
      icon: "📚",
      title: t("home.knowledgeQuickNav.readingList.title"),
      desc: t("home.knowledgeQuickNav.readingList.desc")
    },
    {
      key: "process",
      path: "/executiver/process",
      icon: "🔁",
      title: t("home.knowledgeQuickNav.process.title"),
      desc: t("home.knowledgeQuickNav.process.desc")
    }
  ];
});
</script>

<style scoped lang="scss">
.role-nav-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  width: 100%;
}

.role-nav { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.role-nav__item { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 16px; border: 1px solid var(--el-border-color-lighter); background: var(--el-bg-color); cursor: pointer; font-size: 12px; color: var(--el-text-color-regular); transition: all .15s; &:hover { border-color: var(--el-color-primary-light-5); color: var(--el-color-primary); } &.is-active { background: var(--el-color-primary); border-color: var(--el-color-primary); color: #fff; cursor: default; } }
.role-nav__icon { font-size: 13px; }
.role-nav__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 5px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  font-variant-numeric: tabular-nums;
}
.role-nav__item.is-active .role-nav__count {
  color: var(--el-color-primary);
  background: #fff;
}

.role-nav__quick {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 12px;
  margin-left: auto;
  border-left: 1px solid var(--el-border-color-lighter);
}
.role-nav__quick-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: var(--el-fill-color-light);
  cursor: pointer;
  font-size: 12px;
  color: var(--el-text-color-regular);
  transition: all .18s ease;
  &:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
    color: var(--el-color-primary);
    transform: translateY(-1px);
  }
  &.is-active {
    background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-color-primary-light-8));
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
    font-weight: 600;
    box-shadow: 0 1px 4px rgba(0, 0, 0, .06);
  }
}
.role-nav__quick-icon { font-size: 14px; }
.role-nav__quick-label { white-space: nowrap; }
</style>
