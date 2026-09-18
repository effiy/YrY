<template>
  <div class="role-nav-wrap">
    <div class="role-nav">
      <button v-if="all" class="role-nav__item" :class="{ 'is-active': isAllActive }" @click="onAll">
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
        <button class="role-nav__quick-item" :class="{ 'is-active': item.key === quickActive }" @click="$router.push(item.path)">
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
import { rolesData, ROLE_IDS } from "@/views/knowledge/executive/okrData";

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
    const next = props.modelValue.includes(rid) ? props.modelValue.filter(r => r !== rid) : [...props.modelValue, rid];
    emit("update:modelValue", next);
    return;
  }
  if (rid !== props.active) router.push(`/knowledge/${rid}`);
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
      path: role ? `/knowledge/executive/okr?role=${role}` : "/knowledge/executive/okr",
      icon: "🎯",
      title: t("home.knowledgeQuickNav.okr.title"),
      desc: t("home.knowledgeQuickNav.okr.desc")
    },
    {
      key: "rss",
      path: "/knowledge/executive/rssOverview",
      icon: "📡",
      title: t("home.knowledgeQuickNav.rss.title"),
      desc: t("home.knowledgeQuickNav.rss.desc")
    },
    {
      key: "reading-list",
      path: "/knowledge/executive/readingList",
      icon: "📚",
      title: t("home.knowledgeQuickNav.readingList.title"),
      desc: t("home.knowledgeQuickNav.readingList.desc")
    },
    {
      key: "process",
      path: "/knowledge/executive/processRecord",
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
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.role-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.role-nav__item {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 16px;
  transition: all 0.15s;
  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
  }
  &.is-active {
    color: #ffffff;
    cursor: default;
    background: var(--el-color-primary);
    border-color: var(--el-color-primary);
  }
}
.role-nav__icon {
  font-size: 13px;
}
.role-nav__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 8px;
}
.role-nav__item.is-active .role-nav__count {
  color: var(--el-color-primary);
  background: #ffffff;
}
.role-nav__quick {
  display: flex;
  gap: 6px;
  align-items: center;
  padding-left: 12px;
  margin-left: auto;
  border-left: 1px solid var(--el-border-color-lighter);
}
.role-nav__quick-item {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  padding: 5px 11px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  background: var(--el-fill-color-light);
  border: 1px solid transparent;
  border-radius: 10px;
  transition: all 0.18s ease;
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
    transform: translateY(-1px);
  }
  &.is-active {
    font-weight: 600;
    color: var(--el-color-primary);
    background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-color-primary-light-8));
    border-color: var(--el-color-primary);
    box-shadow: 0 1px 4px rgb(0 0 0 / 6%);
  }
}
.role-nav__quick-icon {
  font-size: 14px;
}
.role-nav__quick-label {
  white-space: nowrap;
}
</style>
