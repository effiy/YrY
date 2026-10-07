<template>
  <el-dialog
    :model-value="visible"
    :title="editingSeed?.key ? t('rss.manager.seeds.dialog.editTitle') : t('rss.manager.seeds.dialog.addTitle')"
    width="520px"
    destroy-on-close
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-form :model="seedForm" label-width="110px">
      <el-form-item :label="t('rss.manager.seeds.dialog.feedUrl')" required>
        <el-input v-model="seedForm.url" :placeholder="t('rss.manager.seeds.dialog.feedUrlPlaceholder')" />
      </el-form-item>
      <el-form-item :label="t('rss.manager.seeds.dialog.name')">
        <el-input v-model="seedForm.name" :placeholder="t('rss.manager.seeds.dialog.namePlaceholder')" />
      </el-form-item>
      <el-form-item :label="t('rss.manager.seeds.dialog.targetCategory')">
        <el-select
          v-model="seedForm.category"
          :placeholder="t('rss.manager.seeds.dialog.autoClassify')"
          clearable
          allow-create
          filterable
          style="width: 100%"
        >
          <el-option-group v-for="g in categoryGroups" :key="g.label" :label="g.label">
            <el-option v-for="o in g.options" :key="o.value" :label="o.label" :value="o.value" />
          </el-option-group>
        </el-select>
        <span class="rss-role__form-hint">{{ t("rss.manager.seeds.dialog.overrideHint") }}</span>
      </el-form-item>
      <el-form-item :label="t('rss.manager.seeds.dialog.fetchInterval')">
        <el-select
          v-model="seedForm.interval"
          :placeholder="t('rss.manager.seeds.dialog.globalDefault')"
          clearable
          style="width: 100%"
        >
          <el-option :value="0" :label="t('rss.manager.seeds.dialog.globalDefault')" />
          <el-option :value="600" label="10 minutes" />
          <el-option :value="1800" label="30 minutes" />
          <el-option :value="3600" label="1 hour" />
          <el-option :value="7200" label="2 hours" />
          <el-option :value="21600" label="6 hours" />
          <el-option :value="43200" label="12 hours" />
          <el-option :value="86400" label="24 hours" />
        </el-select>
        <span class="rss-role__form-hint">{{ t("rss.manager.seeds.dialog.schedulerHint") }}</span>
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
import { useI18n } from "vue-i18n";
import type { RssSeedDocument } from "@/api/modules/rssService";

const { t } = useI18n();

defineProps<{
  visible: boolean;
  editingSeed: RssSeedDocument | null;
  seedForm: { url: string; name: string; category: string; interval: number; enabled: boolean };
  seedSaving: boolean;
  categoryGroups: { label: string; options: { label: string; value: string }[] }[];
}>();

defineEmits<{
  "update:visible": [value: boolean];
  save: [];
}>();
</script>