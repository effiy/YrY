<script setup lang="ts" name="RssSeedDrawer">
import { ref, reactive, computed } from "vue";
import { useI18n } from "vue-i18n";
import { Search } from "@element-plus/icons-vue";
import type { RssSeedDocument } from "@/api/modules/rssService";
import { parseFeed } from "@/api/modules/rssService";

interface DrawerPayload {
  mode: "Add" | "Edit";
  row?: RssSeedDocument;
  categorySuggestions?: string[];
  tagSuggestions?: string[];
  onSubmit: (payload: Partial<RssSeedDocument> & { parseImmediately?: boolean }) => Promise<void>;
}

const { t } = useI18n();
const visible = ref(false);
const saving = ref(false);
const current = ref<DrawerPayload | null>(null);
const categorySuggestions = ref<string[]>([]);
const tagSuggestions = ref<string[]>([]);
const form = reactive({
  url: "",
  name: "",
  category: "",
  enabled: true,
  interval: undefined as number | undefined,
  tags: [] as string[],
  parseImmediately: false
});

const drawerTitle = computed(() =>
  current.value?.mode === "Edit" ? t("rss.seeds.editTitle") : t("rss.seeds.addTitle")
);

const urlValid = computed(() => /^https?:\/\/[^\s]+$/i.test(form.url.trim()));
const showUrlError = computed(() => form.url.trim().length > 0 && !urlValid.value);

const showParseOption = computed(() => current.value?.mode === "Add");

const testing = ref(false);
const testResult = ref<{ status: "ok" | "fail"; saved?: number; updated?: number; error?: string } | null>(null);

async function runTestFetch() {
  if (!urlValid.value) return;
  testing.value = true;
  testResult.value = null;
  try {
    const res = await parseFeed(form.url.trim(), form.name.trim() || undefined);
    const data = res.data || ({} as any);
    if (res.code === 0 && data.success) {
      testResult.value = {
        status: "ok",
        saved: data.saved_count ?? 0,
        updated: data.updated_count ?? 0
      };
    } else {
      testResult.value = { status: "fail", error: data.error || "unknown" };
    }
  } catch (e: any) {
    testResult.value = { status: "fail", error: e?.message || "network" };
  } finally {
    testing.value = false;
  }
}

function reset() {
  form.url = "";
  form.name = "";
  form.category = "";
  form.enabled = true;
  form.interval = undefined;
  form.tags = [];
  form.parseImmediately = false;
}

function acceptParams(payload: DrawerPayload) {
  reset();
  current.value = payload;
  categorySuggestions.value = payload.categorySuggestions ?? [];
  tagSuggestions.value = payload.tagSuggestions ?? [];
  if (payload.mode === "Edit" && payload.row) {
    form.url = payload.row.url || "";
    form.name = payload.row.name || "";
    form.category = payload.row.category || "";
    form.enabled = payload.row.enabled ?? true;
    form.interval = payload.row.interval;
    form.tags = [...(payload.row.tags ?? [])];
  }
  visible.value = true;
}

async function handleSubmit() {
  if (!form.url.trim()) return;
  if (!urlValid.value) return;
  saving.value = true;
  try {
    const intervalVal =
      typeof form.interval === "number" && form.interval > 0 ? form.interval : undefined;
    await current.value?.onSubmit({
      url: form.url.trim(),
      name: form.name.trim() || form.url.trim(),
      category: form.category.trim() || undefined,
      enabled: form.enabled,
      interval: intervalVal,
      tags: form.tags,
      parseImmediately: form.parseImmediately
    });
    visible.value = false;
  } finally {
    saving.value = false;
  }
}

defineExpose({ acceptParams });
</script>

<template>
  <el-drawer
    v-model="visible"
    :title="drawerTitle"
    direction="rtl"
    size="460px"
    :destroy-on-close="true"
  >
    <el-form label-width="100px" label-position="right">
      <el-form-item :label="t('rss.seeds.url')" required>
        <div class="rss-seed-url-row">
          <el-input v-model="form.url" :placeholder="t('rss.seeds.urlPlaceholder')" clearable />
          <el-button
            :loading="testing"
            :disabled="!urlValid"
            :icon="Search"
            @click="runTestFetch"
          >{{ t("rss.seeds.testFetch") }}</el-button>
        </div>
        <div v-if="showUrlError" class="rss-seed-error">{{ t("rss.seeds.urlInvalid") }}</div>
        <div v-if="testResult?.status === 'ok'" class="rss-seed-test-ok">
          {{ t("rss.seeds.testOk", { saved: testResult.saved ?? 0, updated: testResult.updated ?? 0 }) }}
        </div>
        <div v-else-if="testResult?.status === 'fail'" class="rss-seed-error">
          {{ t("rss.seeds.testFail", { error: testResult.error || "" }) }}
        </div>
      </el-form-item>
      <el-form-item :label="t('rss.seeds.name')">
        <el-input v-model="form.name" :placeholder="t('rss.seeds.namePlaceholder')" />
      </el-form-item>
      <el-form-item :label="t('rss.seeds.category')">
        <el-select
          v-model="form.category"
          filterable
          allow-create
          default-first-option
          clearable
          :placeholder="t('rss.seeds.categoryPlaceholder')"
          style="width: 100%"
        >
          <el-option v-for="c in categorySuggestions" :key="c" :label="c" :value="c" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('rss.seeds.enabled')">
        <el-switch v-model="form.enabled" />
      </el-form-item>
      <el-form-item :label="t('rss.seeds.interval')">
        <el-input-number
          v-model="form.interval"
          :min="60"
          :step="60"
          :controls="false"
          :placeholder="t('rss.seeds.intervalPlaceholder')"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item :label="t('rss.items.tags')">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allow-create
          default-first-option
          collapse-tags
          collapse-tags-tooltip
          :placeholder="t('rss.seeds.tagsPlaceholder')"
          style="width: 100%"
        >
          <el-option v-for="tag in tagSuggestions" :key="tag" :label="tag" :value="tag" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="showParseOption" :label="t('rss.seeds.parseImmediately')">
        <el-switch v-model="form.parseImmediately" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">{{ t("rss.seeds.cancel") }}</el-button>
      <el-button type="primary" :loading="saving" :disabled="!urlValid" @click="handleSubmit">{{ t("rss.seeds.save") }}</el-button>
    </template>
  </el-drawer>
</template>

<style scoped lang="scss">
.rss-seed-error {
  font-size: 12px;
  color: var(--el-color-danger);
  margin-top: 4px;
  line-height: 1.4;
}
.rss-seed-test-ok {
  font-size: 12px;
  color: var(--el-color-success);
  margin-top: 4px;
  line-height: 1.4;
}
.rss-seed-url-row {
  display: flex;
  gap: 8px;
  width: 100%;
  :deep(.el-input) {
    flex: 1;
  }
}
</style>
