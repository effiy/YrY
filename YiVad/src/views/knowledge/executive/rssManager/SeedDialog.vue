<template>
  <el-dialog
    :model-value="visible"
    :title="editingSeed?.key ? t('rss.manager.seeds.dialog.editTitle') : t('rss.manager.seeds.dialog.addTitle')"
    width="560px"
    destroy-on-close
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-form :model="seedForm" label-width="130px">
      <el-form-item :label="t('rss.manager.seeds.dialog.feedTitle')">
        <el-input
          v-model="seedForm.title"
          :placeholder="t('rss.manager.seeds.dialog.feedTitlePlaceholder')"
          clearable
        />
      </el-form-item>
      <el-form-item :label="t('rss.manager.seeds.dialog.feedUrl')" required>
        <el-input
          v-model="seedForm.url"
          :placeholder="t('rss.manager.seeds.dialog.feedUrlPlaceholder')"
          clearable
        />
      </el-form-item>
      <el-form-item :label="t('rss.manager.seeds.dialog.targetCategory')">
        <el-select
          v-model="seedForm.category"
          :placeholder="t('rss.manager.seeds.dialog.autoClassify')"
          clearable
          allow-create
          filterable
          style="width: 100%"
          @change="onCategoryChange"
        >
          <el-option-group v-for="g in categoryGroups" :key="g.label" :label="g.label">
            <el-option v-for="o in g.options" :key="o.value" :label="o.label" :value="o.value" />
          </el-option-group>
        </el-select>
        <span class="rss-role__form-hint">{{ t("rss.manager.seeds.dialog.overrideHint") }}</span>
      </el-form-item>
      <el-form-item :label="t('rss.manager.seeds.dialog.ownerRole')">
        <el-select
          v-model="seedForm.ownerRole"
          :placeholder="t('rss.manager.seeds.dialog.ownerRolePlaceholder')"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option v-for="r in ownerRoles" :key="r.value" :label="r.label" :value="r.value" />
        </el-select>
        <span class="rss-role__form-hint">{{ t("rss.manager.seeds.dialog.ownerRoleHint") }}</span>
      </el-form-item>
      <el-form-item :label="t('rss.manager.seeds.dialog.fetchInterval')">
        <el-input-number
          v-model="seedForm.fetchIntervalMinutes"
          :min="0"
          :max="14400"
          :step="10"
          style="width: 100%"
          controls-position="right"
        />
        <span class="rss-role__form-hint">
          {{ t("rss.manager.seeds.dialog.fetchIntervalHint") }}
        </span>
      </el-form-item>
      <el-form-item :label="t('rss.manager.seeds.dialog.pruneThreshold')">
        <el-input-number
          v-model="seedForm.pruneThresholdDays"
          :min="0"
          :max="365"
          :step="1"
          style="width: 100%"
          controls-position="right"
        />
        <span class="rss-role__form-hint">
          {{ t("rss.manager.seeds.dialog.pruneThresholdHint") }}
        </span>
      </el-form-item>
      <el-form-item :label="t('rss.manager.seeds.dialog.status')">
        <el-switch
          v-model="seedForm.enabled"
          :active-text="t('rss.manager.seeds.dialog.active')"
          :inactive-text="t('rss.manager.seeds.dialog.paused')"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">{{ t("rss.manager.common.cancel") }}</el-button>
      <el-button type="primary" @click="$emit('save')" :loading="seedSaving">{{ t("rss.manager.common.save") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { RssSeedDocument } from "@/api/modules/rssService";
import { ROLE_IDS, rolesData } from "@/views/knowledge/executive/okrData";

const { t } = useI18n();

const props = defineProps<{
  visible: boolean;
  editingSeed: RssSeedDocument | null;
  seedForm: {
    title: string;
    url: string;
    category: string;
    ownerRole: string;
    fetchIntervalMinutes: number;
    pruneThresholdDays: number;
    enabled: boolean;
  };
  seedSaving: boolean;
  categoryGroups: { label: string; options: { label: string; value: string }[] }[];
}>();

defineEmits<{
  "update:visible": [value: boolean];
  save: [];
}>();

const ownerRoles = computed(() =>
  ROLE_IDS.map(id => ({
    value: id,
    label: (rolesData as any)[id]?.name || id
  }))
);

function onCategoryChange(val?: string) {
  if (!val) return;
  const rid = val.split("/")[0] || "";
  if (rid && !props.seedForm.ownerRole) props.seedForm.ownerRole = rid;
}

watch(
  () => props.editingSeed?.category,
  () => {
    const cat = props.editingSeed?.category;
    if (cat) onCategoryChange(cat);
  }
);
</script>
