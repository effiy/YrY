<template>
  <el-dialog
    :model-value="visible"
    :title="t('rss.manager.seeds.quickParse.title')"
    width="460px"
    destroy-on-close
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-form :model="form" label-width="60px">
      <el-form-item :label="t('rss.manager.seeds.quickParse.url')" required>
        <el-input v-model="form.url" :placeholder="t('rss.manager.seeds.quickParse.urlPlaceholder')" />
      </el-form-item>
      <el-form-item :label="t('rss.manager.seeds.quickParse.name')">
        <el-input v-model="form.name" :placeholder="t('rss.manager.seeds.quickParse.nameOptional')" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">{{ t("rss.manager.common.cancel") }}</el-button>
      <el-button type="primary" @click="$emit('parse')" :loading="loading">{{
        t("rss.manager.seeds.quickParse.parse")
      }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps<{
  visible: boolean;
  loading: boolean;
  form: { url: string; name: string };
}>();

defineEmits<{
  "update:visible": [value: boolean];
  parse: [];
}>();
</script>