<template>
  <div class="de-root">
    <el-result
      icon="error"
      :title="$t('project.error.loadOverview')"
      :sub-title="message"
    >
      <template #extra>
        <el-button type="primary" @click="$emit('retry')">
          {{ $t('common.retry') }}
        </el-button>
        <el-button @click="$router.push('/project')">
          {{ $t('project.detail.backToProjects') }}
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string;
}>();

defineEmits<{
  retry: [];
}>();
</script>

<style scoped lang="scss">
.de-root {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 24px;
}
</style>